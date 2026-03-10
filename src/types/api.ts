export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorPayload | null;
  timestamp: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: Record<string, any>;
}
