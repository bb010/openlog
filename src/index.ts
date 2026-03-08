import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initializeDatabase, setDatabase } from './db/init.js';
import projectRoutes from './routes/projects.js';
import entryRoutes from './routes/entries.js';
import imageRoutes from './routes/images.js';
import { logger } from './utils/logger.js';

const app = new Hono();

// Initialize database on startup
const db = initializeDatabase();
setDatabase(db);

// Global middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.route('/api/projects', projectRoutes);
app.route('/api', entryRoutes);
app.route('/api', imageRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` },
      timestamp: new Date().toISOString(),
    },
    404
  );
});

const port = Number(process.env.PORT) || 3000;

logger.info(`Starting OpenLog server on port ${port}`);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`OpenLog is running at http://localhost:${info.port}`);
});

export default app;
