#!/usr/bin/env node
/**
 * scripts/copy-frontend.mjs
 * ─────────────────────────
 * Copy-only step: takes an already-built frontend/dist/ and copies it into
 * dist/public/ so the Hono backend can serve it as static assets.
 *
 * Use this when you have already run `npm run build` inside the frontend/
 * directory and just need to (re-)sync the output into the backend dist tree.
 *
 * For a full build (install deps → vite build → copy), use build-frontend.mjs.
 *
 * Usage:
 *   node scripts/copy-frontend.mjs
 *
 * Environment variables:
 *   FRONTEND_DIST   Override the source directory (default: frontend/dist)
 *   OUTPUT_DIR      Override the destination directory (default: dist/public)
 */

import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT         = join(__dirname, '..');
const FRONTEND_DIST = process.env.FRONTEND_DIST ?? join(ROOT, 'frontend', 'dist');
const OUTPUT_DIR    = process.env.OUTPUT_DIR    ?? join(ROOT, 'dist', 'public');

// ── Validate source ───────────────────────────────────────────────────────────
if (!existsSync(FRONTEND_DIST)) {
  console.error(`[copy-frontend] Error: source directory not found:`);
  console.error(`  ${FRONTEND_DIST}`);
  console.error('');
  console.error('  Run the frontend build first:');
  console.error('    npm run build:frontend');
  console.error('  or for a full build including the frontend:');
  console.error('    npm run build');
  process.exit(1);
}

// ── Clean + copy ──────────────────────────────────────────────────────────────
console.log('[copy-frontend] Copying frontend assets…');
console.log(`  from: ${FRONTEND_DIST}`);
console.log(`  to:   ${OUTPUT_DIR}`);

if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });

cpSync(FRONTEND_DIST, OUTPUT_DIR, { recursive: true });

console.log('[copy-frontend] ✓ Done.');
