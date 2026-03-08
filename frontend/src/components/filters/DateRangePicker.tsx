import { Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  className?: string;
}

/**
 * Date range picker — uses shadcn Input
 */
export function DateRangePicker({
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={endDate || undefined}
          className="pl-9"
          aria-label="Start date"
        />
      </div>

      <span className="text-muted-foreground text-sm flex-shrink-0">to</span>

      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || undefined}
          className="pl-9"
          aria-label="End date"
        />
      </div>
    </div>
  );
}

export default DateRangePicker;
