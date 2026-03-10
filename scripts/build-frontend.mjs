#!/usr/bin/env node
/**
 * scripts/build-frontend.mjs
 * ──────────────────────────
 * Builds the React frontend (Vite) and copies the output into
 * dist/public/ so the Hono backend can serve it as static assets.
 *
 * Run automatically via `npm run build` (which calls `npm run build:backend && npm run build:frontend`).
 *
 * Steps:
 *  1. Run `npm run build` inside the frontend/ directory
 *  2. Copy frontend/dist/ → dist/public/
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const FRONTEND_DIR = join(ROOT, 'frontend');
const FRONTEND_DIST = join(FRONTEND_DIR, 'dist');
const OUTPUT_DIR = join(ROOT, 'dist', 'public');

// ── 1. Validate frontend directory exists ─────────────────────────────────────
if (!existsSync(FRONTEND_DIR)) {
  console.error('[build-frontend] Error: frontend/ directory not found.');
  console.error('  Make sure you are running this from the openlog package root.');
  process.exit(1);
}

// ── 2. Install frontend dependencies if node_modules is missing ───────────────
const frontendNodeModules = join(FRONTEND_DIR, 'node_modules');
if (!existsSync(frontendNodeModules)) {
  console.log('[build-frontend] Installing frontend dependencies…');
  execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit' });
}

// ── 3. Build the frontend ─────────────────────────────────────────────────────
console.log('[build-frontend] Building React frontend…');
execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });

if (!existsSync(FRONTEND_DIST)) {
  console.error('[build-frontend] Error: frontend/dist not found after build.');
  process.exit(1);
}

// ── 4. Clean old output and copy new build ────────────────────────────────────
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });

cpSync(FRONTEND_DIST, OUTPUT_DIR, { recursive: true });

console.log(`[build-frontend] ✓ Dashboard assets copied to dist/public/`);
console.log(`[build-frontend]   ${OUTPUT_DIR}`);
