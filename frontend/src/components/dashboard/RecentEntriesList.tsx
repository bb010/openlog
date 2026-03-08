import { Link } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import type { RecentEntry } from '@/types/models';
import { formatTimeAgo } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentEntriesListProps {
  entries: RecentEntry[];
  isLoading?: boolean;
}

/**
 * Displays the most recent log entries across all projects
 */
export function RecentEntriesList({ entries, isLoading = false }: RecentEntriesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-4 mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No entries yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create a project and start logging!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          to={`/projects/${entry.projectId}`}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <div className="flex-shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">
              {entry.content}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-primary font-medium truncate max-w-[120px]">
                {entry.projectName}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimeAgo(entry.createdAt)}
              </span>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}

export default RecentEntriesList;
