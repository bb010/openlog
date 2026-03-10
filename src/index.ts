/**
 * OpenLog — Combined Server Entrypoint
 * ──────────────────────────────────────
 * This file is the backward-compatible development entrypoint.
 * It starts both the HTTP API server and the MCP stdio server together,
 * matching the original behaviour for `npm run dev` and `npm start`.
 *
 * For production/package usage, prefer the dedicated CLI commands:
 *   openlog serve   → HTTP API + dashboard only
 *   openlog mcp     → MCP stdio server only (clean stdio, no noise)
 *   openlog         → same as `openlog serve` (default)
 */

import { serve } from '@hono/node-server';
import { bootstrap } from './bootstrap.js';
import { createApp } from './server/app.js';
import { initializeMcpServer, closeMcpServer } from './mcp/server.js';
import { logger } from './utils/logger.js';

// ─── Bootstrap ───────────────────────────────────────────────────────────────
bootstrap();

// ─── HTTP App ─────────────────────────────────────────────────────────────────
const app = createApp();

// ─── MCP Server ───────────────────────────────────────────────────────────────
initializeMcpServer().catch((err: unknown) => {
  logger.error('Failed to start MCP server', {
    message: err instanceof Error ? err.message : String(err),
  });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (): Promise<void> => {
  await closeMcpServer();
  process.exit(0);
};
process.on('SIGINT', () => { void shutdown(); });
process.on('SIGTERM', () => { void shutdown(); });

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const port = Number(process.env.PORT ?? '3000');
logger.info(`Starting OpenLog HTTP server on port ${port}`);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`OpenLog HTTP API is running at http://localhost:${info.port}`);
});

export default app;
