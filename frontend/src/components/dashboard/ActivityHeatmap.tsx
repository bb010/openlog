import { useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import type { HeatmapDay } from '@/types/models';

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  currentStreak?: number;
  longestStreak?: number;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: 'bg-muted/60 dark:bg-muted/30',
  1: 'bg-emerald-200 dark:bg-emerald-900',
  2: 'bg-emerald-400 dark:bg-emerald-700',
  3: 'bg-emerald-500 dark:bg-emerald-600',
  4: 'bg-emerald-700 dark:bg-emerald-400',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * GitHub-style contribution heatmap showing 52 weeks of activity
 */
export function ActivityHeatmap({ data, currentStreak = 0, longestStreak = 0 }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: HeatmapDay; x: number; y: number } | null>(null);

  // Organise 365 days into 53 columns of 7 rows (weeks × days)
  const { weeks, monthLabels } = useMemo(() => {
    if (!data.length) return { weeks: [], monthLabels: [] };

    // Pad front so first day falls on correct weekday column
    const firstDate = new Date(data[0].date);
    const startDow = firstDate.getDay(); // 0=Sun

    const paddedData: (HeatmapDay | null)[] = [
      ...Array(startDow).fill(null),
      ...data,
    ];

    // Chunk into weeks of 7
    const weeks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      weeks.push(paddedData.slice(i, i + 7));
    }

    // Month labels: place at the first week that starts in that month
    const seen = new Set<string>();
    const monthLabels: { col: number; label: string }[] = [];
    weeks.forEach((week, col) => {
      for (const day of week) {
        if (!day) continue;
        const month = day.date.slice(0, 7); // YYYY-MM
        if (!seen.has(month)) {
          seen.add(month);
          const d = new Date(day.date);
          monthLabels.push({
            col,
            label: d.toLocaleDateString('en-US', { month: 'short' }),
          });
        }
        break;
      }
    });

    return { weeks, monthLabels };
  }, [data]);

  const totalEntries = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{totalEntries.toLocaleString()}</span>{' '}
          entries in the last year
        </span>
        <span className="hidden sm:inline text-border">·</span>
        <span className="hidden sm:inline">
          <span className="font-semibold text-foreground">{activeDays}</span> active days
        </span>
        <span className="hidden sm:inline text-border">·</span>
        <span className="hidden sm:inline">
          🔥 <span className="font-semibold text-foreground">{currentStreak}</span>-day streak
        </span>
        {longestStreak > 0 && (
          <>
            <span className="hidden sm:inline text-border">·</span>
            <span className="hidden sm:inline">
              best <span className="font-semibold text-foreground">{longestStreak}</span> days
            </span>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto">
        {/* Month labels */}
        <div
          className="flex text-xs text-muted-foreground mb-1 pl-8"
          style={{ gap: '2px' }}
        >
          {monthLabels.map((m) => (
            <div
              key={`${m.col}-${m.label}`}
              className="text-left"
              style={{
                minWidth: '14px',
                width: '14px',
                marginLeft: m.col === 0 ? 0 : `${(m.col - (monthLabels[monthLabels.indexOf(m) - 1]?.col ?? 0) - 1) * 16}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col justify-around pr-1.5 text-xs text-muted-foreground" style={{ gap: '2px' }}>
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className="h-3.5 leading-none flex items-center">
                {i % 2 !== 0 ? d.charAt(0) : ''}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  className={cn(
                    'h-3.5 w-3.5 rounded-sm transition-all duration-100',
                    day ? LEVEL_CLASSES[day.level] : 'opacity-0',
                    day?.count ? 'cursor-pointer hover:ring-1 hover:ring-emerald-500 hover:scale-110' : ''
                  )}
                  onMouseEnter={(e) => {
                    if (day) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ day, x: rect.left, y: rect.top });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground justify-end">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={cn('h-3 w-3 rounded-sm', LEVEL_CLASSES[l])} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip (fixed position) */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover text-popover-foreground text-xs border border-border rounded-lg px-2.5 py-1.5 shadow-md"
          style={{
            left: tooltip.x + 20,
            top: tooltip.y - 8,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold">
            {tooltip.day.count === 0
              ? 'No entries'
              : `${tooltip.day.count} entr${tooltip.day.count === 1 ? 'y' : 'ies'}`}
          </div>
          <div className="text-muted-foreground">
            {new Date(tooltip.day.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityHeatmap;
