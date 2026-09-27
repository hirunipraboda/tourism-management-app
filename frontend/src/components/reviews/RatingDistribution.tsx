import React from 'react';
import { Star } from 'lucide-react';
import { StarDistributionItem } from '../../types/reviewsAndRecommendations';

interface RatingDistributionProps {
  distribution: StarDistributionItem[];
  averageRating: number;
  totalCount: number;
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  averageRating,
  totalCount,
  className = '',
}) => {
  const getBarColor = (stars: number) => {
    switch (stars) {
      case 5:
        return 'bg-emerald-500';
      case 4:
        return 'bg-teal-500';
      case 3:
        return 'bg-amber-400';
      case 2:
        return 'bg-orange-400';
      case 1:
        return 'bg-rose-500';
      default:
        return 'bg-[#16A6A1]';
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-[#0B3A53] font-heading">
            Rating Distribution
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Overall breakdown across {totalCount.toLocaleString()} verified customer ratings
          </p>
        </div>

        {/* Big Overall Rating Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900 font-heading leading-none">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex text-amber-400 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-3">
        {distribution.map((item) => (
          <div key={item.stars} className="flex items-center gap-3 text-xs">
            {/* Star Label */}
            <div className="flex items-center gap-1 w-16 shrink-0 font-extrabold text-slate-700">
              <span>{item.stars}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(item.stars)} rounded-full transition-all duration-700`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            {/* Percentage & Count */}
            <div className="w-24 shrink-0 text-right flex items-center justify-end gap-2 text-slate-500 font-semibold">
              <span className="font-extrabold text-slate-800">{item.percentage}%</span>
              <span className="text-[11px] text-slate-400">({item.count.toLocaleString()})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
