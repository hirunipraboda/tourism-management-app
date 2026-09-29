import React from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { RecommendationFilterState } from '../../types/reviewsAndRecommendations';

interface RecommendationFiltersProps {
  filters: RecommendationFilterState;
  onFilterChange: (filters: RecommendationFilterState) => void;
  onUpdateClick: () => void;
  isUpdating?: boolean;
}

const PRIMARY_INTERESTS = [
  'Nature',
  'Hiking',
  'Culture',
  'Adventure',
  'Photography',
  'History',
];

const ENVIRONMENT_OPTIONS = [
  'All',
  'Peaceful',
  'Mountain',
  'Coastal',
  'Historic',
  'Urban',
];

const BUDGET_OPTIONS: Array<'All' | 'Budget' | 'Moderate' | 'Premium'> = [
  'All',
  'Budget',
  'Moderate',
  'Premium',
];

const SORT_OPTIONS: Array<{ value: 'best_match' | 'sentiment' | 'budget' | 'relevance'; label: string }> = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'sentiment', label: 'Traveler Sentiment' },
  { value: 'budget', label: 'Budget' },
  { value: 'relevance', label: 'Relevance' },
];

export const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  filters,
  onFilterChange,
  onUpdateClick,
  isUpdating = false,
}) => {
  const toggleInterest = (interest: string) => {
    let updated: string[];
    if (filters.interests.includes(interest)) {
      updated = filters.interests.filter((i) => i !== interest);
      if (updated.length === 0) updated = ['All'];
    } else {
      updated = filters.interests.filter((i) => i !== 'All');
      updated.push(interest);
    }
    onFilterChange({ ...filters, interests: updated });
  };

  const isInterestSelected = (interest: string) => {
    return filters.interests.includes(interest);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search destinations by name or location..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0B3A53] focus:ring-2 focus:ring-[#0B3A53]/15 text-xs sm:text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Refresh / Apply Button */}
        <button
          onClick={onUpdateClick}
          disabled={isUpdating}
          className="px-5 py-2.5 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-black text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Updating...' : 'Update Results'}</span>
        </button>
      </div>

      {/* Filter Options Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
        {/* Row 1: Interests */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#146C86]" />
            <span>Interests</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, interests: ['All'] })}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                filters.interests.includes('All')
                  ? 'bg-[#0B3A53] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Interests
            </button>
            {PRIMARY_INTERESTS.map((interest) => {
              const active = isInterestSelected(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B3A53] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Environment, Budget, and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Environment */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Environment
            </label>
            <div className="flex flex-wrap items-center gap-1">
              {ENVIRONMENT_OPTIONS.map((env) => {
                const isSelected = (filters.environment || 'All') === env;
                return (
                  <button
                    type="button"
                    key={env}
                    onClick={() => onFilterChange({ ...filters, environment: env })}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#146C86] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {env}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Budget
            </label>
            <div className="flex items-center gap-1">
              {BUDGET_OPTIONS.map((b) => {
                const isSelected = (filters.budgetCategory || 'All') === b;
                return (
                  <button
                    type="button"
                    key={b}
                    onClick={() => onFilterChange({ ...filters, budgetCategory: b })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#146C86] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Sort by
            </label>
            <select
              value={filters.sortBy || 'best_match'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  sortBy: e.target.value as 'best_match' | 'sentiment' | 'budget' | 'relevance',
                })
              }
              className="w-full px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#0B3A53] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
