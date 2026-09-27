import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

let appDir = process.cwd();
try {
  if (typeof __dirname !== 'undefined') {
    appDir = __dirname;
  } else if (typeof import.meta !== 'undefined' && import.meta.url) {
    appDir = path.dirname(fileURLToPath(import.meta.url));
  }
} catch {
  appDir = process.cwd();
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(appDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 StutterFrame server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

// Only start the server when executed directly as a script (not when imported)
const isMainModule =
  process.argv[1]?.endsWith('server.ts') ||
  process.argv[1]?.endsWith('server.js') ||
  process.argv[1]?.endsWith('server.mjs');

if (isMainModule || (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME)) {
  startServer().catch((err) => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}

export default app;
export { app };
