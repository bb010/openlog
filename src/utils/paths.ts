import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export const OPENLOG_HOME = join(homedir(), '.openlog');
export const OPENLOG_DB = join(OPENLOG_HOME, 'openlog.db');
export const OPENLOG_IMAGES = join(OPENLOG_HOME, 'images');

/**
 * Ensure all required directories exist
 */
export function ensureDirectories(): void {
  const dirs = [OPENLOG_HOME, OPENLOG_IMAGES];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}
