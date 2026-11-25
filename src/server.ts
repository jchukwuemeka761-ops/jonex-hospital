import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import {GoogleGenAI, ThinkingLevel} from '@google/genai';
import express from 'express';
import {join} from 'node:path';
import {
  buildHospitalKnowledgeContext,
  cleanAssistantReplyText,
  validateAssistantPayload,
} from './app/core/hospital-assistant.logic';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({limit: '64kb'}));

app.get('/api/maps-config', (_req, res) => {
  const apiKey =
    process.env['GOOGLE_MAPS_API_KEY'] ||
    process.env['VITE_GOOGLE_MAPS_API_KEY'] ||
    '';
  res.json({
    apiKey,
  });
});

app.post('/api/hospital-assistant', async (req, res) => {
  const validation = validateAssistantPayload(req.body);
  if (!validation.ok) {
    res.status(400).json({error: validation.error});
    return;
  }

  const geminiApiKey = process.env['GEMINI_API_KEY']?.trim();
  if (!geminiApiKey) {
    res.status(503).json({
      error:
        'The hospital AI assistant is not configured right now. Configure GEMINI_API_KEY in Settings > Secrets, or call +234 807 801 6691 directly.',
    });
    return;
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

    const reply = response.text ? cleanAssistantReplyText(response.text) : '';
    if (!reply) {
      res.status(502).json({
        error:
          'No answer was generated. Please rephrase your question or call +234 807 801 6691.',
      });
      return;
    }

    res.json({reply});
  } catch (error: unknown) {
    const rawMsg = error instanceof Error ? error.message : 'Unable to process assistant request.';
    const upperMsg = rawMsg.toUpperCase();
    let status = 502;
    let clientMessage =
      'Unable to reach the Jonex Hospital AI assistant right now. Please try again or call +234 807 801 6691.';

    if (upperMsg.includes('API_KEY_INVALID') || upperMsg.includes('PERMISSION_DENIED')) {
      status = 403;
      clientMessage =
        'Assistant authentication is currently unavailable. Please verify GEMINI_API_KEY in Settings > Secrets or contact the front desk on +234 807 801 6691.';
    } else if (upperMsg.includes('RESOURCE_EXHAUSTED') || upperMsg.includes('429')) {
      status = 429;
      clientMessage =
        'The hospital assistant is experiencing high demand right now. Please retry shortly or call +234 807 801 6691.';
    } else if (upperMsg.includes('NOT_FOUND')) {
      status = 502;
      clientMessage =
        'The hospital assistant service is temporarily unavailable. Please call +234 807 801 6691 for immediate help.';
    }

    console.error('[hospital-assistant] Gemini API error:', rawMsg);
    res.status(status).json({error: clientMessage});
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
