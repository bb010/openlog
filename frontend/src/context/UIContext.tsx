import { createContext, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

interface UIContextValue {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);
  const showSuccess = useCallback((message: string) => toast.success(message), []);
  const showError = useCallback((message: string) => toast.error(message), []);
  const showInfo = useCallback((message: string) => toast.info(message), []);
  const showWarning = useCallback((message: string) => toast.warning(message), []);

  return (
    <UIContext.Provider value={{ isLoading, setLoading, showSuccess, showError, showInfo, showWarning }}>
      {children}
    </UIContext.Provider>
  );
}
