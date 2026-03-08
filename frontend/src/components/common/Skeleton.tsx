import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

export { Skeleton };

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton for a text line
 */
export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

/**
 * Skeleton for a card
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText className="mb-2" />
      <SkeletonText className="w-2/3" />
    </div>
  );
}

/**
 * Skeleton for a table row
 */
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for stats card
 */
export function SkeletonStats() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <SkeletonText className="w-1/2" />
    </div>
  );
}

export default Skeleton;
