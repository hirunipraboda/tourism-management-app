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
  const stats = [
    {
      id: 'total',
      label: 'Total Reviews',
      value: totalReviews.toLocaleString(),
      subtext: '+248 this month',
      icon: MessageSquare,
      color: 'text-[#0B3A53]',
      bg: 'bg-sky-50 border-sky-100',
    },
    {
      id: 'rating',
      label: 'Average Rating',
      value: `${averageRating.toFixed(1)} ⭐`,
      subtext: 'Across all verified sights',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      id: 'positive',
      label: 'Positive Reviews',
      value: `${positivePercentage}%`,
      subtext: '4★ & 5★ ratings',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      id: 'negative',
      label: 'Negative Reviews',
      value: negativeCount.toLocaleString(),
      subtext: 'Requires operational follow-up',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
    },
    {
      id: 'pending',
      label: 'Pending Reviews',
      value: pendingCount.toLocaleString(),
      subtext: 'Awaiting moderation',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`p-5 rounded-3xl border ${item.bg} bg-white shadow-2xs hover:shadow-sm transition-all space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {item.label}
              </span>
              <div className={`p-2 rounded-xl bg-slate-50 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {item.value}
            </div>

            <p className="text-[11px] font-semibold text-slate-400 truncate">
              {item.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
