import { QueryClient } from '@tanstack/react-query';
import { STALE_TIME, CACHE_TIME } from '@/utils/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: (failureCount, error) => {
        // Don't retry on 404 or 403 errors
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as { statusCode: number }).statusCode;
          if (statusCode === 404 || statusCode === 403) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
