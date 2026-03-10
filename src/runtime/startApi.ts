/**
 * OpenLog — API Server Starter
 * ─────────────────────────────
 * Bootstraps the database, then starts the Hono HTTP server.
 * Used by `openlog serve` and `openlog dashboard` CLI commands.
 *
 * Does NOT start the MCP server — for combined mode see src/index.ts.
 */

import { serve } from '@hono/node-server';
import { bootstrap } from '../bootstrap.js';
import { createApp } from '../server/app.js';
import { logger } from '../utils/logger.js';

export interface StartApiOptions {
  /** TCP port to listen on (default: 3000) */
  port?: number;
  /**
   * Called once the server is listening, with the resolved port.
   * Useful for CLI commands that want to print the URL or open a browser.
   */
  onReady?: (port: number) => void;
}

/**
 * Start the OpenLog HTTP API server.
 * Initializes the database on first call (idempotent).
 */
export function startApi(options: StartApiOptions = {}): void {
  const port = options.port ?? Number(process.env.PORT ?? '3000');

  // Bootstrap: create dirs + DB if they don't exist yet
  bootstrap();

  const app = createApp();

  serve({ fetch: app.fetch, port }, (info) => {
    logger.info(`OpenLog HTTP API is running at http://localhost:${info.port}`);
    options.onReady?.(info.port);
  });

  // Graceful shutdown
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
}
