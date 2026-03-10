import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Base directory for all OpenLog data.
 * Can be overridden via the OPENLOG_HOME environment variable
 * (useful for testing, custom installs, or multi-tenant setups).
 *
 * Default: ~/.openlog
 */
export const OPENLOG_HOME: string =
  process.env.OPENLOG_HOME ?? join(homedir(), '.openlog');

export const OPENLOG_DB: string = join(OPENLOG_HOME, 'openlog.db');
export const OPENLOG_IMAGES: string = join(OPENLOG_HOME, 'images');

/**
 * Ensure all required directories exist.
 * Safe to call multiple times (idempotent).
 */
export function ensureDirectories(): void {
  const dirs = [OPENLOG_HOME, OPENLOG_IMAGES];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      // Use stderr so this never pollutes MCP stdio transport
      process.stderr.write(`[openlog] Created directory: ${dir}\n`);
    }
  }
}
