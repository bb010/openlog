import { Filter, X } from 'lucide-react';
import { useFilterContext } from '@/context/useFilterContext';
import { SearchInput } from './SearchInput';
import { DateRangePicker } from './DateRangePicker';
import { FilterBadge } from './FilterBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

/**
 * Entry filters panel - date range, keyword search, reset
 */
export function EntryFilters() {
  const { filters, setFilters, resetFilters, activeFilterCount } = useFilterContext();

  const handleStartDateChange = (value: string) => {
    setFilters({ startDate: value ? new Date(value + 'T00:00:00.000Z').toISOString() : undefined });
  };

  const handleEndDateChange = (value: string) => {
    setFilters({ endDate: value ? new Date(value + 'T23:59:59.999Z').toISOString() : undefined });
  };

  const getDateValue = (isoString?: string) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          <FilterBadge count={activeFilterCount} />
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
          >
            <X className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <Separator className="mb-3" />

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Keyword search */}
        <div className="flex-1">
          <SearchInput
            value={filters.keyword || ''}
            onChange={(keyword) => setFilters({ keyword: keyword || undefined })}
            placeholder="Search in content..."
          />
        </div>

        {/* Date range */}
        <div className="flex-1">
          <DateRangePicker
            startDate={getDateValue(filters.startDate)}
            endDate={getDateValue(filters.endDate)}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        </div>
      </div>
    </div>
  );
}

export default EntryFilters;
