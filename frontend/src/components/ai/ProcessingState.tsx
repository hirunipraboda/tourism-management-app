import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

export interface ProcessingStateProps {
  taskName?: string;
  stepDescription?: string;
  progress?: number;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  taskName = 'AI Route Optimization',
  stepDescription = 'Analyzing live weather telemetry and trail accessibility...',
  progress = 64,
}) => {
  return (
    <div className="p-6 bg-gradient-to-br from-[#0B3A53] to-[#146C86] rounded-2xl text-white shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#16A6A1] animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A6A1]">
            NOVA Autonomous Engine
          </span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
          {progress}% Complete
        </span>
      </div>

      <div>
        <h3 className="text-lg font-black tracking-tight">{taskName}</h3>
        <p className="text-xs text-slate-300 mt-1">{stepDescription}</p>
      </div>

      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#16A6A1] h-full transition-all duration-300 shadow-[0_0_10px_#16A6A1]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
