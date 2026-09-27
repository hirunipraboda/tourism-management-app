import React from 'react';
import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/helpers';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
}) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const statusDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover border border-slate-200 shadow-xs', sizes[size], className)}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-[#0B3A53] text-white font-semibold flex items-center justify-center border border-white/20 shadow-xs',
            sizes[size],
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusDotSizes[size],
            status === 'online' && 'bg-emerald-500',
            status === 'busy' && 'bg-amber-500',
            status === 'offline' && 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};
