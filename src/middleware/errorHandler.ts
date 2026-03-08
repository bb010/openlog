import type { Context } from 'hono';
import { ZodError } from 'zod';
import { errorResponse } from './responseFormatter.js';
import { ERROR_CODES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(err: Error, c: Context): Response {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.') || 'root';
      if (!details[field]) details[field] = [];
      details[field].push(e.message);
    });

    return c.json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', details),
      400
    );
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return c.json(
      errorResponse(err.code, err.message, err.details),
      err.statusCode as any
    );
  }

  // Handle unknown errors
  logger.error('Unhandled error', { message: err.message, stack: err.stack });

  return c.json(
    errorResponse(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred'),
    500
  );
}
