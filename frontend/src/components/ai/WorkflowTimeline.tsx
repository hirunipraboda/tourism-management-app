import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { AIWorkflowStep } from '../../types/ai';
import { cn } from '../../utils/cn';

export interface WorkflowTimelineProps {
  currentStep: AIWorkflowStep;
  steps?: AIWorkflowStep[];
  className?: string;
}

const DEFAULT_STEPS: AIWorkflowStep[] = [
  'Planning',
  'Researching',
  'Route Analysis',
  'Building Itinerary',
  'Validating',
  'Approval Required',
  'Approved',
];

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  currentStep,
  steps = DEFAULT_STEPS,
  className,
}) => {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className={cn('w-full py-4', className)}>
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || currentStep === 'Approved';
          const isCurrent = idx === currentIndex && currentStep !== 'Approved';
          const isPending = idx > currentIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center group relative z-10">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2',
                    isCompleted && 'bg-emerald-500 border-emerald-500 text-white shadow-xs',
                    isCurrent &&
                      'bg-[#0B3A53] border-[#16A6A1] text-[#16A6A1] shadow-[0_0_12px_rgba(22,166,161,0.4)] animate-pulse',
                    isPending && 'bg-slate-100 border-slate-300 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-[#16A6A1]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-[11px] font-semibold tracking-tight text-center max-w-[90px]',
                    isCompleted && 'text-slate-800',
                    isCurrent && 'text-[#0B3A53] font-extrabold',
                    isPending && 'text-slate-400'
                  )}
                >
                  {step}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors duration-300',
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Accordion/Simple View */}
      <div className="flex md:hidden flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0B3A53]">Current AI Phase:</span>
          <span className="text-xs font-extrabold text-[#16A6A1] bg-[#16A6A1]/10 px-2 py-0.5 rounded-full border border-[#16A6A1]/30">
            {currentStep}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#16A6A1] h-full transition-all duration-300"
            style={{
              width: `${Math.round(((currentIndex + 1) / steps.length) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
