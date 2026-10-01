import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Compass,
  Award,
  Layers,
  Star,
  Activity,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { RecommendationInsightsData } from '../../types/reviewsAndRecommendations';

interface RecommendationInsightsProps {
  insights: RecommendationInsightsData;
  className?: string;
}

export const RecommendationInsights: React.FC<RecommendationInsightsProps> = ({
  insights,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Recommended Attraction */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Top Recommended</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-heading">
            {insights.topRecommendedAttraction}
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">
            Highest affinity across 94% of visitors
          </p>
        </div>

        {/* Most Popular Category */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Most Popular Category</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#0B3A53] font-heading">
            {insights.mostPopularCategory}
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">
            34% of tourist searches & selections
          </p>
        </div>

        {/* Trending Destination */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Trending Destination</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 font-heading">
            {insights.trendingDestination}
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">
            +42% increase in recommendation saves
          </p>
        </div>

        {/* Average Recommendation Match */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Avg Match Score</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#16A6A1] font-heading">
            {insights.averageRecommendationMatch}%
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">
            High correlation with tourist interests
          </p>
        </div>
      </div>

      {/* Two Column Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Activities */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <h4 className="text-base font-black text-[#0B3A53] font-heading">
                Most Popular Activities
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Activities generating the highest engagement & review generation
              </p>
            </div>
            <Activity className="w-4 h-4 text-[#16A6A1]" />
          </div>

          <div className="space-y-3">
            {insights.mostPopularActivities.map((act, i) => (
              <div
                key={act.name}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-slate-700 font-black flex items-center justify-center border border-slate-200 text-[11px]">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-extrabold text-slate-900">{act.name}</div>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-[#0B3A53] text-sm">
                    {act.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">recommendations</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Rated Attractions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <h4 className="text-base font-black text-[#0B3A53] font-heading">
                Highest-Rated Attractions
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Sights earning top-tier 4.8★+ ratings with positive reviews
              </p>
            </div>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>

          <div className="space-y-3">
            {insights.highestRatedAttractions.map((att) => (
              <div
                key={att.name}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div>
                  <div className="font-extrabold text-slate-900">{att.name}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                    {att.badge}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 font-black text-amber-600 text-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{att.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {att.reviews.toLocaleString()} reviews
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Category Preferences & Average Suitability Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequently Selected Categories */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-0.5 pb-3 border-b border-slate-100">
            <h4 className="text-base font-black text-[#0B3A53] font-heading">
              Frequently Selected Categories
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Distribution of traveler interests across recommendation filters
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {insights.frequentlySelectedCategories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>{cat.name}</span>
                  <span className="text-slate-900 font-black">{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16A6A1] rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Suitability Scores by Theme */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-0.5 pb-3 border-b border-slate-100">
            <h4 className="text-base font-black text-[#0B3A53] font-heading">
              Average Suitability Score by Theme
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Calculated suitability match percentage averaged per category
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {insights.averageSuitabilityScores.map((scoreItem) => (
              <div
                key={scoreItem.category}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1"
              >
                <div className="text-2xl font-black text-[#0B3A53] font-heading">
                  {scoreItem.score}%
                </div>
                <div className="text-xs font-bold text-slate-600">{scoreItem.category}</div>
                <div className="text-[10px] text-emerald-600 font-extrabold">High Suitability</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
