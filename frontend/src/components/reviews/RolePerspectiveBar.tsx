import React from 'react';
import { User, Shield, Star, Sparkles, MessageSquare, BarChart3, Compass, CheckCircle } from 'lucide-react';
import { ModulePerspective, TouristTab, OperatorTab } from '../../types/reviewsAndRecommendations';

interface RolePerspectiveBarProps {
  perspective: ModulePerspective;
  onPerspectiveChange: (p: ModulePerspective) => void;
  touristTab: TouristTab;
  onTouristTabChange: (t: TouristTab) => void;
  operatorTab: OperatorTab;
  onOperatorTabChange: (t: OperatorTab) => void;
  className?: string;
}

export const RolePerspectiveBar: React.FC<RolePerspectiveBarProps> = ({
  perspective,
  onPerspectiveChange,
  touristTab,
  onTouristTabChange,
  operatorTab,
  onOperatorTabChange,
  className = '',
}) => {
  return (
    <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs sticky top-[72px] sm:top-[82px] z-30 py-3 px-4 sm:px-8 transition-all ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Sub-Navigation Tabs based on active perspective */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
          {perspective === 'tourist' ? (
            <>
              <button
                onClick={() => onTouristTabChange('reviews')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  touristTab === 'reviews'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Reviews</span>
              </button>

              <button
                onClick={() => onTouristTabChange('my-reviews')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  touristTab === 'my-reviews'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Reviews</span>
              </button>

              <button
                onClick={() => onTouristTabChange('recommendations')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  touristTab === 'recommendations'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommendations</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOperatorTabChange('review-management')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  operatorTab === 'review-management'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Review Management</span>
              </button>

              <button
                onClick={() => onOperatorTabChange('customer-satisfaction')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  operatorTab === 'customer-satisfaction'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Customer Satisfaction</span>
              </button>

              <button
                onClick={() => onOperatorTabChange('recommendation-insights')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  operatorTab === 'recommendation-insights'
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#16A6A1]" />
                <span>Recommendation Insights</span>
              </button>
            </>
          )}
        </div>

        {/* Perspective Role Switcher Pill */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 hidden sm:inline-block">
            View Perspective:
          </span>
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => onPerspectiveChange('tourist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                perspective === 'tourist'
                  ? 'bg-white text-[#0B3A53] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#16A6A1]" />
              <span>Tourist</span>
            </button>

            <button
              onClick={() => onPerspectiveChange('operator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                perspective === 'operator'
                  ? 'bg-[#0B3A53] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Operator / Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
