import { isApiError } from '@/types/api';

/**
 * Parse an unknown error and return a user-friendly message
 */
export function parseApiError(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Get a user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  const message = parseApiError(error);
  // Map common API errors to friendly messages
  const friendlyMessages: Record<string, string> = {
    'Network Error': 'Unable to connect to the server. Please check your connection.',
    'Request failed with status code 404': 'The requested resource was not found.',
    'Request failed with status code 500': 'Server error. Please try again later.',
    'Request failed with status code 403': 'You do not have permission to perform this action.',
  };
  return friendlyMessages[message] || message;
}
