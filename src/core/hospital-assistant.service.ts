import {GoogleGenAI, ThinkingLevel} from '@google/genai';
import {
  buildHospitalKnowledgeContext,
  cleanAssistantReplyText,
  validateAssistantPayload,
} from './hospital-assistant.logic.ts';

export interface AssistantHttpResult {
  readonly status: number;
  readonly body: {readonly reply: string} | {readonly error: string};
}

export function resolveMapsApiKeyFromEnv(): string {
  return (
    process.env['GOOGLE_MAPS_API_KEY'] ||
    process.env['VITE_GOOGLE_MAPS_API_KEY'] ||
    ''
  ).trim();
}

export async function handleHospitalAssistantRequest(
  rawBody: unknown,
): Promise<AssistantHttpResult> {
  const validation = validateAssistantPayload(rawBody);
  if (!validation.ok) {
    return {status: 400, body: {error: validation.error}};
  }

  const geminiApiKey = process.env['GEMINI_API_KEY']?.trim();
  if (!geminiApiKey) {
    return {
      status: 503,
      body: {
        error:
          'The hospital AI assistant is not configured right now. Configure GEMINI_API_KEY in your host environment, or call +234 807 801 6691 directly.',
      },
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents = [
      ...validation.history.map((turn) => ({
        role: turn.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{text: turn.text}],
      })),
      {
        role: 'user' as const,
        parts: [{text: validation.message}],
      },
    ];

    let responseText = '';
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            systemInstruction: buildHospitalKnowledgeContext(),
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
        responseText = response.text ? cleanAssistantReplyText(response.text) : '';
        lastError = undefined;
        break;
      } catch (err: unknown) {
        lastError = err;
        const errStatus =
          typeof err === 'object' && err !== null && 'status' in err
            ? Number((err as {status?: unknown}).status)
            : undefined;
        const isTransient = errStatus === undefined || errStatus >= 500 || errStatus === 429;
        if (!isTransient || attempt === 1) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 650));
      }
    }

    if (lastError) {
      throw lastError;
    }

    if (!responseText) {
      return {
        status: 502,
        body: {
          error:
            'No answer was generated. Please rephrase your question or call +234 807 801 6691.',
        },
      };
    }

    return {status: 200, body: {reply: responseText}};
  } catch (error: unknown) {
    const rawMsg = error instanceof Error ? error.message : 'Unable to process assistant request.';
    const errorStatus =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as {status?: unknown}).status)
        : undefined;
    const upperMsg = rawMsg.toUpperCase();
    let status = 502;
    let clientMessage =
      'Unable to reach the Jonex Hospital AI assistant right now. Please try again or call +234 807 801 6691.';

    if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      upperMsg.includes('API_KEY_INVALID') ||
      upperMsg.includes('API KEY NOT VALID') ||
      upperMsg.includes('PERMISSION_DENIED')
    ) {
      status = 403;
      clientMessage =
        'Assistant authentication is currently unavailable. Please verify GEMINI_API_KEY in Settings > Secrets or contact the front desk on +234 807 801 6691.';
    } else if (errorStatus === 429 || upperMsg.includes('RESOURCE_EXHAUSTED') || upperMsg.includes('429')) {
      status = 429;
      clientMessage =
        'The hospital assistant is experiencing high demand right now. Please retry shortly or call +234 807 801 6691.';
    } else if (errorStatus === 404 || upperMsg.includes('NOT_FOUND')) {
      status = 502;
      clientMessage =
        'The hospital assistant model is temporarily unavailable. Please call +234 807 801 6691 for immediate help.';
    } else if (errorStatus === 400 || upperMsg.includes('INVALID_ARGUMENT')) {
      status = 400;
      clientMessage =
        'The assistant request could not be processed. Please rephrase your question or call +234 807 801 6691.';
    }

    const sanitizedReason = rawMsg.replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]').slice(0, 240);
    console.error('[hospital-assistant] Gemini API error:', errorStatus ?? 'unknown', sanitizedReason);
    return {
      status,
      body: {
        error: `${clientMessage}${errorStatus ? ` (Code ${errorStatus})` : ''}`,
      },
    };
  }
}
