import React from 'react';
import { User, Star, Sparkles } from 'lucide-react';
import { ModulePerspective, TouristTab, OperatorTab } from '../../types/reviewsAndRecommendations';

interface RolePerspectiveBarProps {
  perspective?: ModulePerspective;
  onPerspectiveChange?: (p: ModulePerspective) => void;
  touristTab: TouristTab;
  onTouristTabChange: (t: TouristTab) => void;
  operatorTab?: OperatorTab;
  onOperatorTabChange?: (t: OperatorTab) => void;
  className?: string;
}

export const RolePerspectiveBar: React.FC<RolePerspectiveBarProps> = ({
  touristTab,
  onTouristTabChange,
  className = '',
}) => {
  return (
    <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs sticky top-[72px] sm:top-[82px] z-30 py-3 px-4 sm:px-8 transition-all ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-start gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto no-scrollbar">
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
        </div>
      </div>
    </div>
  );
};
