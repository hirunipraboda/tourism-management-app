import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  accentBorder?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  subtitle,
  badge,
  accentBorder = false,
}) => {
  return (
    <Card
      className={cn(
        'relative group',
        accentBorder && 'border-l-4 border-l-[#16A6A1]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        {icon && (
          <div className="p-3 bg-slate-100/80 group-hover:bg-[#16A6A1]/10 text-slate-700 group-hover:text-[#16A6A1] rounded-xl transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'font-bold px-1.5 py-0.5 rounded-md',
                changeType === 'positive' && 'bg-emerald-100 text-emerald-700',
                changeType === 'negative' && 'bg-rose-100 text-rose-700',
                changeType === 'neutral' && 'bg-slate-100 text-slate-600'
              )}
            >
              {change}
            </span>
            <span className="text-slate-500">vs last month</span>
          </div>
        )}
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
        {badge}
      </div>
    </Card>
  );
};
