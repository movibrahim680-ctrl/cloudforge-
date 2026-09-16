import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import { projectsRouter } from './src/server/routes/projects.js';
import { servicesRouter } from './src/server/routes/services.ts';
import { domainsRouter } from './src/server/routes/domains.js';
import { envRouter } from './src/server/routes/env.js';
import { providerRouter } from './src/server/routes/provider.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security & Middleware
  app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-cloudforge-user-id', 'x-cloudforge-user-email']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CloudForge API', timestamp: new Date().toISOString() });
  });

  // Mount API Routers
  app.use('/api/projects', projectsRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/domains', domainsRouter);
  app.use('/api/environment-variables', envRouter);
  app.use('/api/provider', providerRouter);

  // Vite development or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudForge Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CloudForge server:', err);
});
