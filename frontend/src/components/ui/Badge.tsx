import React from 'react';
import { cn } from '../../utils/cn';
import { BadgeVariant } from '../../types/ui';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  icon,
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-[#0B3A53]/10 text-[#0B3A53] border-[#0B3A53]/20 font-semibold',
    secondary: 'bg-[#146C86]/10 text-[#146C86] border-[#146C86]/20 font-semibold',
    accent: 'bg-[#16A6A1]/10 text-[#138D89] border-[#16A6A1]/30 font-semibold',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    outline: 'border border-slate-300 text-slate-600 bg-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
    >
      {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};
