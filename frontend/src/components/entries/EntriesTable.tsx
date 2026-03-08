import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { LogEntry, PaginatedResponse } from '@/types/models';
import { Button } from '@/components/ui/button';
import { EntryCard } from './EntryCard';
import { SkeletonCard } from '@/components/common/Skeleton';

interface EntriesTableProps {
  data?: PaginatedResponse<LogEntry>;
  isLoading?: boolean;
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
  onUploadImage: (entry: LogEntry) => void;
  onCreateEntry: () => void;
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Entries list with pagination and actions
 */
export function EntriesTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onUploadImage,
  onCreateEntry,
  page,
  onPageChange,
}: EntriesTableProps) {
  const entries = data?.items || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border">
        <div className="rounded-full bg-muted p-5 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold mb-1">No log entries yet</p>
        <p className="text-sm text-muted-foreground mb-4">Start documenting your work</p>
        <Button size="sm" onClick={onCreateEntry}>
          Create First Entry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Entry cards */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onUploadImage={onUploadImage}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data?.total} entries
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EntriesTable;
