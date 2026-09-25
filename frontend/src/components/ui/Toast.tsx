import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ToastMessage } from '../../types/ui';

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          error: <XCircle className="w-5 h-5 text-rose-500" />,
          info: <Info className="w-5 h-5 text-[#16A6A1]" />,
        };

        const bgBorders = {
          success: 'border-emerald-200 bg-emerald-50/95',
          warning: 'border-amber-200 bg-amber-50/95',
          error: 'border-rose-200 bg-rose-50/95',
          info: 'border-slate-200 bg-white/95',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5',
              bgBorders[toast.type]
            )}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-normal">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
