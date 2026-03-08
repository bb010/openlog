import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

/**
 * Modal/Dialog wrapper around shadcn Dialog
 */
export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className={cn(sizeClasses[size], className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}


export default Modal;
