import { DatabaseSync } from 'node:sqlite';
import { ensureDirectories, OPENLOG_DB } from '../utils/paths.js';
import { SCHEMA } from './schema.js';
import { logger } from '../utils/logger.js';

let dbInstance: DatabaseSync | null = null;

export function initializeDatabase(): DatabaseSync {
  ensureDirectories();

  const db = new DatabaseSync(OPENLOG_DB);

  // Enable foreign key enforcement
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Apply schema
  db.exec(SCHEMA);

  logger.info(`Database initialized at ${OPENLOG_DB}`);
  return db;
}

export function setDatabase(db: DatabaseSync): void {
  dbInstance = db;
}

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}
