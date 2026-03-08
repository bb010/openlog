import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { LogEntry } from '@/types/models';

interface EntryDeleteModalProps {
  entry: LogEntry | null;
  onClose: () => void;
  onConfirm: (entryId: string) => void;
  isLoading?: boolean;
}

/**
 * Confirmation dialog for deleting a log entry
 */
export function EntryDeleteModal({ entry, onClose, onConfirm, isLoading }: EntryDeleteModalProps) {
  return (
    <ConfirmDialog
      isOpen={Boolean(entry)}
      onClose={onClose}
      onConfirm={() => entry && onConfirm(entry.id)}
      title="Delete Entry"
      message="Are you sure you want to delete this log entry? This action cannot be undone."
      confirmLabel="Delete Entry"
      isLoading={isLoading}
      variant="danger"
    />
  );
}

export default EntryDeleteModal;
