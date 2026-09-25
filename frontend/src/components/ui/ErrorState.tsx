import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'A temporary telemetry connection issue occurred. Please check your network or try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 border border-rose-200/80 rounded-2xl">
      <div className="p-3 bg-rose-100 rounded-full text-rose-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 max-w-sm mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
