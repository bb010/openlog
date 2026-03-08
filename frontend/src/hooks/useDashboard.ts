import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboardApi';
import { STALE_TIME_SHORT } from '@/utils/constants';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: STALE_TIME_SHORT,
  });
}
