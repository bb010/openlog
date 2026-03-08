import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { EntryFilters } from '@/types/models';
import { ITEMS_PER_PAGE, STORAGE_KEYS } from '@/utils/constants';

interface FilterContextValue {
  filters: EntryFilters;
  setFilters: (filters: Partial<EntryFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  activeFilterCount: number;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

const DEFAULT_FILTERS: EntryFilters = {
  page: 1,
  limit: ITEMS_PER_PAGE,
};

function loadPersistedFilters(): Partial<EntryFilters> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<EntryFilters>;
      // Only restore non-pagination filters
      const { startDate, endDate, keyword } = parsed;
      return { startDate, endDate, keyword };
    }
  } catch {
    // ignore
  }
  return {};
}

function persistFilters(filters: EntryFilters) {
  try {
    const { startDate, endDate, keyword } = filters;
    localStorage.setItem(STORAGE_KEYS.ENTRY_FILTERS, JSON.stringify({ startDate, endDate, keyword }));
  } catch {
    // ignore
  }
}

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [filters, setFiltersState] = useState<EntryFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...loadPersistedFilters(),
  }));

  // Persist non-pagination filters when they change
  useEffect(() => {
    persistFilters(filters);
  }, [filters]);

  const setFilters = useCallback((updates: Partial<EntryFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...updates,
      page: 1, // Reset page when filters change (but not when paginating)
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    localStorage.removeItem(STORAGE_KEYS.ENTRY_FILTERS);
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFiltersState((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  // Count active non-pagination filters
  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.keyword,
  ].filter(Boolean).length;

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, resetFilters, setPage, setLimit, activeFilterCount }}
    >
      {children}
    </FilterContext.Provider>
  );
}
