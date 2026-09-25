import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`p-3 rounded-full mb-3 ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600'
              : variant === 'warning'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-sky-100 text-sky-600'
          }`}
        >
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1.5 mb-6">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'accent'}
            size="md"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
