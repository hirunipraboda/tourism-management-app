import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  position = 'right',
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full z-10',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          className={cn(
            'w-screen bg-white shadow-2xl border-l border-slate-100 flex flex-col',
            sizes[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-[#0B3A53]">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="p-6 overflow-y-auto flex-1">{children}</div>

          {footer && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
