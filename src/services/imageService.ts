import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { OPENLOG_IMAGES } from '../utils/paths.js';
import { ALLOWED_IMAGE_EXTENSIONS } from '../utils/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export function saveImage(
  projectId: string,
  filename: string,
  buffer: Buffer
): string {
  const ext = extname(filename).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as any)) {
    throw new AppError(
      ERROR_CODES.INVALID_IMAGE_TYPE,
      `Invalid image type. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      400
    );
  }

  const projectImagesDir = join(OPENLOG_IMAGES, projectId);
  if (!existsSync(projectImagesDir)) {
    mkdirSync(projectImagesDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeFilename = `${timestamp}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = join(projectImagesDir, safeFilename);

  try {
    writeFileSync(filePath, buffer);
    logger.info(`Image saved: ${filePath}`);
    return `${projectId}/${safeFilename}`;
  } catch (err) {
    throw new AppError(
      ERROR_CODES.IMAGE_UPLOAD_ERROR,
      'Failed to save image to disk',
      500
    );
  }
}

export function deleteImage(relativePath: string): void {
  const fullPath = join(OPENLOG_IMAGES, relativePath);
  if (existsSync(fullPath)) {
    try {
      unlinkSync(fullPath);
      logger.info(`Image deleted: ${fullPath}`);
    } catch (err) {
      logger.warn(`Failed to delete image: ${fullPath}`, err);
    }
  }
}

export function getImagePath(relativePath: string): string {
  return join(OPENLOG_IMAGES, relativePath);
}

export function imageExists(relativePath: string): boolean {
  return existsSync(join(OPENLOG_IMAGES, relativePath));
}
