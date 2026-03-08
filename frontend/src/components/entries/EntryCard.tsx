import { Edit2, Trash2, ImageIcon, Upload } from 'lucide-react';
import type { LogEntry } from '@/types/models';
import { formatDateTime } from '@/utils/formatDate';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EntryImage } from './EntryImage';

interface EntryCardProps {
  entry: LogEntry;
  onEdit: (entry: LogEntry) => void;
  onDelete: (entry: LogEntry) => void;
  onUploadImage: (entry: LogEntry) => void;
}

/**
 * Log entry card — uses shadcn Button and Separator
 */
export function EntryCard({ entry, onEdit, onDelete, onUploadImage }: EntryCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        {entry.imagePath && (
          <div className="flex-shrink-0">
            <EntryImage imagePath={entry.imagePath} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm whitespace-pre-wrap font-mono leading-relaxed break-words">
            {entry.content}
          </p>
          <p className="text-xs text-muted-foreground mt-3">{formatDateTime(entry.createdAt)}</p>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!entry.imagePath && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUploadImage(entry)}
          >
            <Upload className="h-4 w-4" />
            Add Image
          </Button>
        )}
        {entry.imagePath && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUploadImage(entry)}
          >
            <ImageIcon className="h-4 w-4" />
            Replace Image
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(entry)}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(entry)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EntryCard;
