import React from 'react';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  ...props
}) => {
  const sizes = {
    sm: 'p-1.5 text-xs rounded-lg',
    md: 'p-2 text-sm rounded-xl',
    lg: 'p-2.5 text-base rounded-xl',
  };

  const variants = {
    primary: 'bg-[#0B3A53] hover:bg-[#072537] text-white',
    secondary: 'bg-[#146C86] hover:bg-[#0E5367] text-white',
    accent: 'bg-[#16A6A1] hover:bg-[#138D89] text-white',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-600',
    ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  };

  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3A53]/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
