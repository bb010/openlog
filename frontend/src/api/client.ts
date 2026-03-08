import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { API_URL, LOG_LEVEL } from '@/utils/constants';
import { ApiError, type ApiResponse } from '@/types/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (logging in dev)
apiClient.interceptors.request.use(
  (config) => {
    if (LOG_LEVEL === 'debug') {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - extract data or throw ApiError
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    if (LOG_LEVEL === 'debug') {
      console.debug(`[API] Response ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    if (LOG_LEVEL === 'debug') {
      console.debug('[API] Error:', error.response?.data || error.message);
    }

    if (error.response) {
      const data = error.response.data as ApiResponse<unknown>;
      const errPayload = data?.error;
      throw new ApiError(
        errPayload?.code || 'UNKNOWN_ERROR',
        errPayload?.message || `Request failed with status ${error.response.status}`,
        error.response.status
      );
    }

    if (error.request) {
      throw new ApiError('NETWORK_ERROR', 'Unable to connect to the server', 0);
    }

    throw new ApiError('REQUEST_ERROR', error.message, 0);
  }
);

/**
 * Extract data from API response, throwing on API-level errors
 */
export function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { data } = response;
  if (!data.success || data.data === null) {
    throw new ApiError(
      data.error?.code || 'API_ERROR',
      data.error?.message || 'API request failed',
      response.status
    );
  }
  return data.data;
}

export default apiClient;
