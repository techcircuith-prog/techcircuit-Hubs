import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { apiRouter } from './src/server/api.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.static(path.resolve(process.cwd(), 'public')));
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {
          ignored: ['**/Our Project image/**', '**/node_modules/**', '**/.git/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`techcircuithub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
