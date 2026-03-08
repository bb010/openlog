import { Hono } from 'hono';
import { readFileSync } from 'fs';
import { extname } from 'path';
import { handleError, AppError } from '../middleware/errorHandler.js';
import { imageExists, getImagePath } from '../services/imageService.js';
import { ERROR_CODES } from '../utils/constants.js';

const images = new Hono();

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

// GET /images/:projectId/:filename — Serve a stored image
images.get('/images/:projectId/:filename', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const filename = c.req.param('filename');
    const relativePath = `${projectId}/${filename}`;

    if (!imageExists(relativePath)) {
      throw new AppError(
        ERROR_CODES.IMAGE_NOT_FOUND,
        `Image "${filename}" not found`,
        404
      );
    }

    const fullPath = getImagePath(relativePath);
    const ext = extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    const data = readFileSync(fullPath);

    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': String(data.length),
      },
    });
  } catch (err) {
    return handleError(err as Error, c);
  }
});

export default images;
