import React from 'react';
import { MessageSquare, Star, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReviewStatsProps {
  totalReviews: number;
  averageRating: number;
  positivePercentage: number;
  negativeCount: number;
  pendingCount: number;
  className?: string;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  totalReviews,
  averageRating,
  positivePercentage,
  negativeCount,
  pendingCount,
  className = '',
}) => {
  const safeTotal = Number(totalReviews) || 0;
  const safeRating = Number(averageRating) || 0;
  const safePositive = Math.round(Number(positivePercentage) || 0);
  const safeNegative = Number(negativeCount) || 0;

  const stats = [
    {
      id: 'total',
      label: 'Total Reviews',
      value: safeTotal.toLocaleString(),
      subtext: '+248 this month',
      icon: MessageSquare,
      color: 'text-[#0B3A53]',
      bg: 'bg-sky-50/70 border-sky-100',
    },
    {
      id: 'rating',
      label: 'Average Rating',
      value: `${safeRating > 0 ? safeRating.toFixed(1) : '0.0'} ⭐`,
      subtext: 'Across all verified sights',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50/70 border-amber-100',
    },
    {
      id: 'positive',
      label: 'Positive Reviews',
      value: `${safePositive}%`,
      subtext: '4★ & 5★ ratings',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/70 border-emerald-100',
    },
    {
      id: 'negative',
      label: 'Negative Reviews',
      value: safeNegative.toLocaleString(),
      subtext: 'Requires operational follow-up',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50/70 border-rose-100',
    },
    {
      id: 'verified',
      label: 'Monitored Sights',
      value: `${safeTotal > 0 ? '10+' : '0'}`,
      subtext: 'Active attractions & tours',
      icon: CheckCircle2,
      color: 'text-[#16A6A1]',
      bg: 'bg-teal-50/70 border-teal-100',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`p-5 rounded-3xl border ${item.bg} bg-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between min-h-[140px]`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={item.label}>
                {item.label}
              </span>
              <div className={`p-2 rounded-xl bg-slate-50 shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight leading-none">
                {item.value}
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-400 truncate" title={item.subtext}>
              {item.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
