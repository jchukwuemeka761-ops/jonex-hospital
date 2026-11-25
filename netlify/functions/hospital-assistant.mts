import {handleHospitalAssistantRequest} from '../../src/core/hospital-assistant.service.ts';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({error: 'Method not allowed. Use POST.'}, {status: 405});
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({error: 'Request payload must be valid JSON.'}, {status: 400});
  }

  const result = await handleHospitalAssistantRequest(body);
  return Response.json(result.body, {status: result.status});
}
