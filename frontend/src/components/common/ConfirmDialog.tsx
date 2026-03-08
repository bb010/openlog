import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

/**
 * Reusable confirmation dialog built on shadcn Dialog
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const iconColorClass = variant === 'danger' ? 'text-destructive' : 'text-yellow-600';
  const iconBgClass = variant === 'danger' ? 'bg-destructive/10' : 'bg-yellow-100';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false} aria-describedby="confirm-dialog-desc">
        <DialogHeader>
          <div className={`rounded-full p-3 w-fit mx-auto mb-2 ${iconBgClass}`}>
            <AlertTriangle className={`h-6 w-6 ${iconColorClass}`} />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-3 sm:justify-center border-0 bg-transparent p-0 -mx-0 -mb-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
