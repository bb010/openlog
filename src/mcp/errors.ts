import { ZodError } from 'zod';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../utils/constants.js';
import type { McpErrorPayload } from './types.js';

/**
 * Maps a caught error from the service layer into a structured MCP error payload.
 *
 * - AppError instances are mapped using their existing error code and message.
 * - ZodError instances are collapsed into a VALIDATION_ERROR with a joined message.
 * - Unknown errors fall back to INTERNAL_ERROR.
 */
export function toMcpError(err: unknown): McpErrorPayload {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
    };
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Validation failed: ${message}`,
    };
  }

  // Unknown / unexpected error
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred';

  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message,
  };
}
