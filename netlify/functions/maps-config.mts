import {resolveMapsApiKeyFromEnv} from '../../src/core/hospital-assistant.service.ts';

export default async function handler(): Promise<Response> {
  return Response.json(
    {apiKey: resolveMapsApiKeyFromEnv()},
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
