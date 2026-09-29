import React, { useState, useMemo } from 'react';
import {
  Building2,
  Star,
  Tag,
  Check,
  Filter,
  DollarSign,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { AccommodationItem, AccommodationType, ACCOMMODATIONS_CATALOG } from '../../mock/manualPlannerData';

interface StaycationSelectorProps {
  destinations: string[];
  selectedStaycations: Record<string, AccommodationItem>;
  onSelectStaycation: (dest: string, staycation: AccommodationItem) => void;
  allowAiOption?: boolean;
  aiDecidesStaycation?: boolean;
  onToggleAiDecides?: () => void;
}

export const StaycationSelector: React.FC<StaycationSelectorProps> = ({
  destinations,
  selectedStaycations,
  onSelectStaycation,
  allowAiOption = false,
  aiDecidesStaycation = false,
  onToggleAiDecides,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');

  const normalizedDests = destinations.length > 0 ? destinations : ['Sigiriya', 'Kandy', 'Ella'];

  return (
    <div className="space-y-8">
      {/* Selector Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'ALL', label: 'All Stays' },
            { id: '5-Star Hotel', label: '5-Star Hotels' },
            { id: '4-Star Hotel', label: '4-Star Hotels' },
            { id: 'Private Cabana', label: 'Private Cabanas' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
          >
            <option value="recommended">Best Recommended</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* AI Automated Staycation Option (if enabled) */}
      {allowAiOption && onToggleAiDecides && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm text-teal-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" /> Automated AI Staycation Selection
            </h4>
            <p className="text-xs text-teal-800">
              Let NOVA optimize the best-matched hotels and private cabanas matching your travel budget and style.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleAiDecides}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              aiDecidesStaycation
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-teal-800 border border-teal-300 hover:bg-teal-100/50'
            }`}
          >
            {aiDecidesStaycation ? '✓ AI Deciding Stays' : 'Let AI Choose'}
          </button>
        </div>
      )}

      {/* Destination Sections */}
      <div className="space-y-8">
        {normalizedDests.map((dest) => {
          let destStays = ACCOMMODATIONS_CATALOG.filter((acc) => acc.destination.toLowerCase() === dest.toLowerCase());

          // If no exact match, fallback to general best stays
          if (destStays.length === 0) {
            destStays = ACCOMMODATIONS_CATALOG.slice(0, 3);
          }

          // Apply type filter
          if (filterType !== 'ALL') {
            destStays = destStays.filter((a) => a.type === filterType);
          }

          // Apply sort
          const sortedStays = [...destStays].sort((a, b) => {
            if (sortBy === 'price_low') return a.pricePerNight - b.pricePerNight;
            if (sortBy === 'price_high') return b.pricePerNight - a.pricePerNight;
            if (sortBy === 'rating') return b.rating - a.rating;
            return b.reviewCount - a.reviewCount;
          });

          const currentSelected = selectedStaycations[dest];

          return (
            <div key={dest} className="space-y-4">
              {/* Destination Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                  <h3 className="text-lg font-black text-slate-900">{dest} Staycations</h3>
                  <span className="text-xs text-slate-500 font-semibold">({sortedStays.length} stays available)</span>
                </div>
                {currentSelected ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Selected: {currentSelected.name} ({currentSelected.type})
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Pick a hotel or private cabana in {dest}
                  </span>
                )}
              </div>

              {/* Cards Grid */}
              {sortedStays.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 italic">
                  No staycations matching the "{filterType}" filter in {dest}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {sortedStays.map((stay) => {
                    const isSelected = currentSelected?.id === stay.id;

                    return (
                      <div
                        key={stay.id}
                        className={`rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between bg-white ${
                          isSelected
                            ? 'border-teal-600 shadow-xl ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:border-teal-400/60 hover:shadow-md'
                        }`}
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative h-44 w-full overflow-hidden">
                            <img
                              src={stay.image}
                              alt={stay.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <span
                                className={`px-2.5 py-1 text-white text-[10px] font-black uppercase rounded-lg shadow-xs ${
                                  stay.type === 'Private Cabana'
                                    ? 'bg-amber-600/90'
                                    : stay.type === '5-Star Hotel'
                                    ? 'bg-teal-700/90'
                                    : 'bg-indigo-700/90'
                                }`}
                              >
                                {stay.type}
                              </span>

                              <span
                                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md shadow-xs ${
                                  stay.availability === 'Instant Confirmation'
                                    ? 'bg-emerald-600 text-white'
                                    : stay.availability === 'Few Rooms Left'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-black/60 text-white'
                                }`}
                              >
                                {stay.availability}
                              </span>
                            </div>

                            {/* Bottom Floating Info */}
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                              <div className="flex items-center gap-1 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{stay.rating}</span>
                                <span className="text-slate-300 text-[11px] font-normal">({stay.reviewCount})</span>
                              </div>
                              <span className="font-extrabold text-sm text-emerald-300">
                                ${stay.pricePerNight} <span className="text-[10px] font-normal text-slate-200">/ night</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 space-y-3">
                            <div>
                              <h4 className="font-black text-slate-900 text-base leading-tight line-clamp-1">
                                {stay.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {stay.description}
                              </p>
                            </div>

                            {/* Curated Package Pill */}
                            <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl p-2.5 space-y-1">
                              <div className="flex items-center gap-1.5 text-teal-900 text-xs font-bold">
                                <Tag className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                <span className="line-clamp-1">{stay.packageName}</span>
                              </div>
                              <span className="text-[10px] text-teal-700 font-semibold block">
                                Duration: {stay.packageDuration}
                              </span>
                            </div>

                            {/* Facilities Tag List */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Package Inclusions
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {stay.includedFacilities.slice(0, 3).map((f, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                                  >
                                    ✓ {f}
                                  </span>
                                ))}
                                {stay.includedFacilities.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                                    +{stay.includedFacilities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Selection Button */}
                        <div className="p-4 pt-0">
                          <button
                            type="button"
                            onClick={() => onSelectStaycation(dest, stay)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                                : 'bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 border border-slate-200'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                <span>Selected Staycation</span>
                              </>
                            ) : (
                              <span>Select {stay.type === 'Private Cabana' ? 'Cabana' : 'Hotel'}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
