import * as React from 'react';
import { Button } from '@hummbl/ui';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const iconColors = {
    default: 'text-blue-400',
    destructive: 'text-rose-400',
    warning: 'text-amber-400',
  };

  const bgColors = {
    default: 'bg-blue-500/10',
    destructive: 'bg-rose-500/10',
    warning: 'bg-amber-500/10',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`mx-auto w-12 h-12 rounded-full ${bgColors[variant]} flex items-center justify-center mb-4`}
          >
            <AlertTriangle className={`h-6 w-6 ${iconColors[variant]}`} />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={
                variant === 'destructive'
                  ? 'destructive'
                  : variant === 'warning'
                    ? 'warning'
                    : 'default'
              }
              className="flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);

  const confirm = React.useCallback((action: () => void) => {
    setPendingAction(() => action);
    setIsOpen(true);
  }, []);

  const handleConfirm = React.useCallback(() => {
    pendingAction?.();
    setIsOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isOpen,
    confirm,
    handleConfirm,
    handleClose,
  };
}
