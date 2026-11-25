import express from 'express';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  handleHospitalAssistantRequest,
  resolveMapsApiKeyFromEnv,
} from './src/core/hospital-assistant.service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');

async function startServer(): Promise<void> {
  const app = express();
  const port = Number(process.env['PORT'] || 3000);
  const isProd = process.env['NODE_ENV'] === 'production' && existsSync(distDir);

  app.use(express.json({limit: '64kb'}));

  app.get('/api/maps-config', (_req, res) => {
    res.json({apiKey: resolveMapsApiKeyFromEnv()});
  });

  app.post('/api/hospital-assistant', async (req, res) => {
    const result = await handleHospitalAssistantRequest(req.body);
    res.status(result.status).json(result.body);
  });

  if (isProd) {
    app.use(express.static(distDir, {maxAge: '1y', index: false}));
    app.use((_req, res) => {
      res.sendFile(join(distDir, 'index.html'));
    });
  } else {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env['DISABLE_HMR'] === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Jonex Hospital server listening on http://0.0.0.0:${port}`);
  });
}

void startServer();
