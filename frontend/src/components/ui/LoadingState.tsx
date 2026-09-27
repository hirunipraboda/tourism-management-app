import React from 'react';
import { Cpu } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Synchronizing NOVA Journey Engine...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0B3A53] flex items-center justify-center text-white shadow-md animate-pulse">
          <Cpu className="w-6 h-6 text-[#16A6A1]" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A6A1] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A6A1]"></span>
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">NOVA Platform v1.0 • Real-time telemetry</p>
    </div>
  );
};
