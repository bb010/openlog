/**
 * OpenLog — MCP Server Starter
 * ─────────────────────────────
 * Bootstraps the database, then starts the MCP stdio server.
 *
 * This is the recommended entry point for MCP client configs (Claude Desktop,
 * Cursor, Continue, etc.). It starts ONLY the MCP server — no HTTP API, no
 * extra stdout output — so the stdio transport is kept completely clean.
 *
 * Claude Desktop config example:
 * {
 *   "mcpServers": {
 *     "openlog": {
 *       "command": "npx",
 *       "args": ["-y", "openlog", "mcp"]
 *     }
 *   }
 * }
 */

import { bootstrap } from '../bootstrap.js';
import { initializeMcpServer, closeMcpServer } from '../mcp/server.js';
import { logger } from '../utils/logger.js';

/**
 * Start the OpenLog MCP server (stdio transport).
 * Initializes the database on first call (idempotent).
 */
export async function startMcp(): Promise<void> {
  // Bootstrap: create dirs + DB if they don't exist yet
  bootstrap();

  await initializeMcpServer();

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down MCP server…');
    await closeMcpServer();
    process.exit(0);
  };

  process.on('SIGINT', () => { void shutdown(); });
  process.on('SIGTERM', () => { void shutdown(); });
}
