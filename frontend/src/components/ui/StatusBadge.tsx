import React from 'react';
import { cn } from '../../utils/cn';
import { STATUS_COLORS } from '../../constants/theme';
import { StatusVariant } from '../../types/ui';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  showDot = true,
  className,
}) => {
  // Infer variant if not provided
  let inferredVariant: StatusVariant = variant || 'neutral';
  if (!variant) {
    const s = status.toLowerCase();
    if (['active', 'confirmed', 'paid', 'approved', 'completed', 'valid', 'published', 'available'].includes(s)) {
      inferredVariant = 'success';
    } else if (['pending', 'planning', 'in progress', 'optimization needed'].includes(s)) {
      inferredVariant = 'pending';
    } else if (['approval required', 'assigned', 'seasonal'].includes(s)) {
      inferredVariant = 'warning';
    } else if (['error', 'failed', 'cancelled', 'conflict detected'].includes(s)) {
      inferredVariant = 'error';
    } else if (['validating', 'researching', 'processing'].includes(s)) {
      inferredVariant = 'info';
    }
  }

  const styles = STATUS_COLORS[inferredVariant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        styles.bg,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', styles.dot)} />}
      <span>{status}</span>
    </span>
  );
};
