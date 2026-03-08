import { useUIContext } from '@/context/useUIContext';

/**
 * Convenient hook for toast notifications
 */
export function useToast() {
  const { showSuccess, showError, showInfo, showWarning } = useUIContext();
  return { success: showSuccess, error: showError, info: showInfo, warning: showWarning };
}
