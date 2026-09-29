import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glass = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200 overflow-hidden',
        hoverable && 'nova-card-hover cursor-pointer hover:border-slate-300',
        glass && 'nova-glass',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
