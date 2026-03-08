import { useState, useCallback } from 'react';
import { parseApiError } from '@/utils/errors';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Generic hook for handling async operations with loading and error states
 */
export function useAsync<T>(
  asyncFn: (...args: unknown[]) => Promise<T>
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });
      try {
        const result = await asyncFn(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (err) {
        const error = parseApiError(err);
        setState({ data: null, error, isLoading: false });
        return null;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
}
