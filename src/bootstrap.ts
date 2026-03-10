/**
 * OpenLog Bootstrap
 * ─────────────────
 * Shared initialization logic used by every runtime mode (serve, mcp, all).
 *
 * Call `bootstrap()` once at process startup. It is idempotent — calling it
 * more than once is safe and returns the same database instance.
 */

import { initializeDatabase, setDatabase, getDatabase } from './db/init.js';
import type { DatabaseSync } from 'node:sqlite';
import { logger } from './utils/logger.js';
import { OPENLOG_HOME, OPENLOG_DB } from './utils/paths.js';

let initialized = false;

/**
 * Initialize storage directories and the SQLite database.
 *
 * @returns The shared DatabaseSync instance.
 */
export function bootstrap(): DatabaseSync {
  if (initialized) {
    return getDatabase();
  }

  logger.info(`OpenLog data directory: ${OPENLOG_HOME}`);
  logger.info(`OpenLog database:       ${OPENLOG_DB}`);

  const db = initializeDatabase(); // creates dirs + applies schema
  setDatabase(db);

  initialized = true;
  logger.info('Bootstrap complete — database ready');

  return db;
}