import type { ApiResponse, ErrorPayload } from '../types/api.js';

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(code: string, message: string, details?: Record<string, any>): ApiResponse<null> {
  const error: ErrorPayload = { code, message };
  if (details !== undefined) {
    error.details = details;
  }
  return {
    success: false,
    data: null,
    error,
    timestamp: new Date().toISOString(),
  };
}
