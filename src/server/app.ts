/**
 * OpenLog — Hono App Factory
 * ──────────────────────────
 * Creates and returns the configured Hono application WITHOUT starting the
 * HTTP server. This separation lets the CLI decide the port and whether to
 * also serve the static frontend dashboard.
 *
 * Static frontend assets (dist/public/) are served when they exist, enabling
 * the packaged dashboard to be reached at http://localhost:<port>/.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import projectRoutes from '../routes/projects.js';
import entryRoutes from '../routes/entries.js';
import imageRoutes from '../routes/images.js';
import { logger } from '../utils/logger.js';

// Resolve the package root relative to this compiled module.
// Compiled layout: dist/server/app.js
//   → dirname = dist/server
//   → ../      = dist
//   → ../..    = package root (where package.json lives)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = join(__dirname, '..', '..');
const STATIC_DIR = join(PKG_ROOT, 'dist', 'public');

/** Simple MIME type map for the assets we bundle */
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.map':  'application/json',
};

/**
 * Attempt to serve a static file from STATIC_DIR.
 * Returns null if the file does not exist.
 */
function serveFile(urlPath: string): Response | null {
  // Sanitise: strip leading slash, prevent directory traversal
  const safe = urlPath.replace(/\.\./g, '').replace(/^\/+/, '');
  const filePath = join(STATIC_DIR, safe);

  if (!existsSync(filePath)) return null;

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) return null;

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    const body = readFileSync(filePath);

    // Hono Response via standard Web API
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return null;
  }
}

/**
 * Build the fully-configured Hono app.
 * @returns Hono app instance ready to be passed to `serve()`.
 */
export function createApp(): Hono {
  const app = new Hono();

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use('*', cors());

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (c) =>
    c.json({ status: 'ok', timestamp: new Date().toISOString() })
  );

  // ── API routes ────────────────────────────────────────────────────────────
  app.route('/api/projects', projectRoutes);
  app.route('/api', entryRoutes);
  app.route('/api', imageRoutes);

  // ── Static dashboard (only when built assets are present) ─────────────────
  if (existsSync(STATIC_DIR)) {
    logger.info(`Serving dashboard from ${STATIC_DIR}`);

    // Serve every GET request that maps to a real file in dist/public/
    app.get('*', (c) => {
      const urlPath = c.req.path;

      // Try the exact path first
      let response = serveFile(urlPath);
      if (response) return response;

      // For paths without extensions, try /index.html (SPA fallback)
      if (!extname(urlPath)) {
        const indexPath = join(STATIC_DIR, 'index.html');
        if (existsSync(indexPath)) {
          const html = readFileSync(indexPath, 'utf-8');
          return c.html(html);
        }
      }

      // Not found — fall through to notFound handler below
      return c.json(
        {
          success: false,
          data: null,
          error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${urlPath} not found` },
          timestamp: new Date().toISOString(),
        },
        404
      );
    });
  } else {
    logger.info('Static dashboard not found — API-only mode');
  }

  // ── 404 fallback ──────────────────────────────────────────────────────────
  app.notFound((c) =>
    c.json(
      {
        success: false,
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${c.req.method} ${c.req.path} not found`,
        },
        timestamp: new Date().toISOString(),
      },
      404
    )
  );

  return app;
}
