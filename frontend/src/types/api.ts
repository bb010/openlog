export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorPayload | null;
  timestamp: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Convenience factory function
export function createApiError(code: string, message: string, statusCode = 500): ApiError {
  return new ApiError(code, message, statusCode);
}

// Type guard
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
