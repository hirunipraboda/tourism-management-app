import React, { useState } from 'react';
import { Filter, Sliders, RefreshCw, Sparkles, DollarSign, MapPin, Star } from 'lucide-react';
import { RecommendationFilterState } from '../../types/reviewsAndRecommendations';

interface RecommendationFiltersProps {
  filters: RecommendationFilterState;
  onFilterChange: (filters: RecommendationFilterState) => void;
  onUpdateClick: () => void;
  isUpdating?: boolean;
}

const INTEREST_OPTIONS = [
  'Culture',
  'History',
  'Nature',
  'Adventure',
  'Food',
  'Wildlife',
  'Beaches',
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

  const isSelected = (interest: string) => {
    return filters.interests.includes(interest);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#146C86]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Personalized Discovery Engine</span>
          </div>
          <h3 className="text-lg font-black text-[#0B3A53] font-heading">
            Refine Smart Recommendations
          </h3>
        </div>

        {/* Update Recommendations CTA Button */}
        <button
          onClick={onUpdateClick}
          disabled={isUpdating}
          className="px-6 py-2.5 rounded-full bg-[#16A6A1] hover:bg-[#138D89] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>Update Recommendations</span>
        </button>
      </div>

      {/* Grid of Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        {/* 1. Interests Multi-select */}
        <div className="space-y-2 lg:col-span-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
            Tourist Interests & Themes
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, interests: ['All'] })}
              className={`px-3 py-1.5 rounded-full font-extrabold transition-all cursor-pointer ${
                filters.interests.includes('All')
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Interests
            </button>
            {INTEREST_OPTIONS.map((interest) => {
              const active = isSelected(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#16A6A1] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Budget Range */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <label className="uppercase tracking-wider text-[11px] font-black">
              Max Daily Budget
            </label>
            <span className="text-[#16A6A1] font-black">${filters.maxBudget} / day</span>
          </div>
          <input
            type="range"
            min={20}
            max={150}
            step={5}
            value={filters.maxBudget}
            onChange={(e) =>
              onFilterChange({ ...filters, maxBudget: Number(e.target.value) })
            }
            className="w-full accent-[#16A6A1] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>$20 (Budget)</span>
            <span>$80 (Comfort)</span>
            <span>$150+ (Luxury)</span>
          </div>
        </div>

        {/* 3. Distance Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <label className="uppercase tracking-wider text-[11px] font-black">
              Travel Distance
            </label>
            <span className="text-[#16A6A1] font-black">Up to {filters.maxDistance} km</span>
          </div>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={filters.maxDistance}
            onChange={(e) =>
              onFilterChange({ ...filters, maxDistance: Number(e.target.value) })
            }
            className="w-full accent-[#16A6A1] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>Nearby (20 km)</span>
            <span>Island-wide (200 km)</span>
          </div>
        </div>
      </div>

      {/* Row 2: Rating & Activity Type */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Minimum Rating */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Minimum Rating:</span>
            {[0, 4.5, 4.8].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onFilterChange({ ...filters, minRating: val })}
                className={`px-3 py-1 rounded-full font-extrabold cursor-pointer transition-all ${
                  filters.minRating === val
                    ? 'bg-[#0B3A53] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {val === 0 ? 'Any Rating' : `${val}★ & above`}
              </button>
            ))}
          </div>

          {/* Activity Type */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Activity Type:</span>
            {['All', 'attraction', 'tour'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onFilterChange({ ...filters, activityType: type })}
                className={`px-3 py-1 rounded-full font-extrabold capitalize cursor-pointer transition-all ${
                  filters.activityType === type
                    ? 'bg-[#16A6A1] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'attraction' ? 'Sightseeing / Attractions' : type === 'tour' ? 'Guided Tours' : 'All Types'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
