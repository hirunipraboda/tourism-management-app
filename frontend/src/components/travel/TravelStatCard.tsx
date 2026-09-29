import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

export interface TravelStatCardProps {
  title: string;
  count: number | string;
  metricLabel?: string;
  icon: React.ReactNode;
  trend?: string;
  bgGradient?: string;
}

export const TravelStatCard: React.FC<TravelStatCardProps> = ({
  title,
  count,
  metricLabel,
  icon,
  trend,
  bgGradient = 'from-[#0B3A53] to-[#146C86]',
}) => {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br space-y-3 relative overflow-hidden',
        bgGradient
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">{title}</span>
        <div className="p-2 bg-white/10 rounded-xl text-[#16A6A1] backdrop-blur-xs">{icon}</div>
      </div>
      <div>
        <h3 className="text-3xl font-black tracking-tight">{count}</h3>
        {metricLabel && <p className="text-xs text-slate-300 mt-0.5">{metricLabel}</p>}
      </div>
      {trend && (
        <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-semibold">
          {trend}
        </div>
      )}
    </div>
  );
};
