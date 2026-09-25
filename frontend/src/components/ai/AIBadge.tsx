import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AIBadgeProps {
  label?: string;
  className?: string;
  pulse?: boolean;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  label = 'AI Powered',
  className,
  pulse = true,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#16A6A1]/10 text-[#138D89] border border-[#16A6A1]/30 shadow-2xs',
        className
      )}
    >
      <Sparkles className={cn('w-3 h-3 text-[#16A6A1]', pulse && 'animate-pulse')} />
      <span>{label}</span>
    </span>
  );
};
