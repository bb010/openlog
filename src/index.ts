import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initializeDatabase, setDatabase } from './db/init.js';
import projectRoutes from './routes/projects.js';
import entryRoutes from './routes/entries.js';
import imageRoutes from './routes/images.js';
import { initializeMcpServer, closeMcpServer } from './mcp/server.js';
import { logger } from './utils/logger.js';

const app = new Hono();

// Initialize database on startup (shared by HTTP API and MCP server)
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

// ─── MCP Server ──────────────────────────────────────────────────────────────
// Always starts alongside the HTTP API. When spawned by an MCP client (e.g.
// Claude Desktop), stdin/stdout are redirected to the client and the stdio
// transport handles communication. In normal terminal usage, the MCP server
// simply idles on stdin without affecting HTTP API operation.
initializeMcpServer().catch((err: unknown) => {
  logger.error('Failed to start MCP server', { message: err instanceof Error ? err.message : String(err) });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeMcpServer();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeMcpServer();
  process.exit(0);
});

// ─── HTTP Server ─────────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;

logger.info(`Starting OpenLog HTTP server on port ${port}`);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`OpenLog HTTP API is running at http://localhost:${info.port}`);
});

export default app;
