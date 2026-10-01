import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  MessageSquare,
  MapPin,
  Tag,
  Compass,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Review, TargetType } from '../../types/reviewsAndRecommendations';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  reviews: Review[];
  onHelpfulToggle: (id: string) => void;
  onWriteReviewClick: () => void;
  onPhotoClick?: (photoUrl: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onHelpfulToggle,
  onWriteReviewClick,
  onPhotoClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<'All' | TargetType>('All');
  const [selectedRating, setSelectedRating] = useState<number | 'All' | 'Low'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unique places / attractions with their review counts & types
  const existingTargets = useMemo(() => {
    const map = new Map<string, { name: string; type: TargetType; count: number }>();
    reviews.forEach((r) => {
      if (r.targetName) {
        const existing = map.get(r.targetName);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(r.targetName, {
            name: r.targetName,
            type: r.targetType,
            count: 1,
          });
        }
      }
    });

    // Add common fallback destinations if not in reviews yet
    const defaults: { name: string; type: TargetType; count: number }[] = [
      { name: 'Sigiriya Rock Fortress', type: 'attraction', count: 0 },
      { name: 'Temple of the Tooth', type: 'attraction', count: 0 },
      { name: 'Nine Arches Bridge', type: 'attraction', count: 0 },
      { name: 'Mirissa Blue Whale Ocean Expedition', type: 'tour', count: 0 },
      { name: 'Yala National Park 4x4 Leopard Safari', type: 'tour', count: 0 },
      { name: 'Galle Dutch Fort Ramparts', type: 'attraction', count: 0 },
      { name: 'Ella Highlands', type: 'destination', count: 0 },
    ];

    defaults.forEach((d) => {
      if (!map.has(d.name)) {
        map.set(d.name, d);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [reviews]);

  // Compute unique tags from existing reviews
  const existingTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    reviews.forEach((r) => {
      r.tags?.forEach((t) => {
        const clean = t.trim();
        if (clean) tagCount.set(clean, (tagCount.get(clean) || 0) + 1);
      });
    });

    // Default top tags
    ['Culture', 'Scenic', 'Wildlife', 'Photography', 'Recommended', 'History', 'Adventure'].forEach(
      (t) => {
        if (!tagCount.has(t)) tagCount.set(t, 0);
      }
    );

    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [reviews]);

  // Compute suggestions based on current search input
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return {
        targets: existingTargets.slice(0, 5),
        tags: existingTags.slice(0, 6),
        reviews: [],
      };
    }

    const matchedTargets = existingTargets
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedTags = existingTags
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedReviews = reviews
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.touristName.toLowerCase().includes(q)
      )
      .slice(0, 4);

    return {
      targets: matchedTargets,
      tags: matchedTags,
      reviews: matchedReviews,
    };
  }, [searchQuery, existingTargets, existingTags, reviews]);

  // Quick popular search chips
  const popularChips = useMemo(() => {
    return [
      'Sigiriya',
      'Temple of the Tooth',
      'Nine Arches',
      'Yala Safari',
      'Ella',
      'Mirissa',
      'Culture',
      'Scenic',
    ];
  }, []);

  // Available unique destination/targets for location dropdown
  const availableDestinations = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => {
      if (r.targetName.includes('Kandy')) set.add('Kandy');
      else if (r.targetName.includes('Sigiriya')) set.add('Sigiriya');
      else if (r.targetName.includes('Ella')) set.add('Ella');
      else if (r.targetName.includes('Galle')) set.add('Galle');
      else if (r.targetName.includes('Mirissa')) set.add('Mirissa');
      else if (r.targetName.includes('Yala')) set.add('Yala');
      else if (r.targetName.includes('Horton')) set.add('Horton Plains');
    });
    return ['All', ...Array.from(set)];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (r.status !== 'Published') return false;

        const matchesSearch =
          !searchQuery.trim() ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesType = targetTypeFilter === 'All' || r.targetType === targetTypeFilter;

        const matchesRating =
          selectedRating === 'All' ||
          (selectedRating === 'Low' ? r.rating <= 2 : r.rating === selectedRating);

        const matchesDest =
          destinationFilter === 'All' ||
          r.targetName.toLowerCase().includes(destinationFilter.toLowerCase());

        return matchesSearch && matchesType && matchesRating && matchesDest;
      })
      .sort((a, b) => {
        const newestFirst = (b.sortDate ?? b.date).localeCompare(a.sortDate ?? a.date);
        if (sortBy === 'highest') {
          return b.rating - a.rating || b.helpfulCount - a.helpfulCount || newestFirst;
        }
        if (sortBy === 'helpful') {
          return b.helpfulCount - a.helpfulCount || newestFirst;
        }
        return newestFirst;
      });
  }, [reviews, searchQuery, targetTypeFilter, selectedRating, sortBy, destinationFilter]);

  const handleSelectSuggestion = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTargetTypeFilter('All');
    setSelectedRating('All');
    setSortBy('newest');
    setDestinationFilter('All');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Row 1: Search & Target Type Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="w-4 h-4 text-[#16A6A1] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search reviews by sight, tour, tea estate, or keywords (e.g., Tooth Relic, Sigiriya, train)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A6A1] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Smart Suggestions & Included Data Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-[380px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="p-3 bg-slate-50/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-black text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
                    <span>
                      {searchQuery.trim()
                        ? `Suggestions for "${searchQuery}"`
                        : 'Explore & Search Included Data'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Click any item to search
                  </span>
                </div>

                {/* Section 1: Places & Sights */}
                {searchSuggestions.targets.length > 0 && (
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                      <MapPin className="w-3 h-3 text-[#146C86]" />
                      <span>Destinations & Sights ({searchSuggestions.targets.length})</span>
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.targets.map((target) => (
                        <button
                          key={target.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(target.name)}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#16A6A1]/10 text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#16A6A1]/20 text-[#0B3A53] shrink-0">
                              <Compass className="w-3.5 h-3.5 text-[#16A6A1]" />
                            </span>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-[#0B3A53] truncate">
                              {target.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 capitalize">
                              {target.type}
                            </span>
                            {target.count > 0 && (
                              <span className="text-[10px] font-extrabold text-[#16A6A1]">
                                {target.count} review{target.count > 1 ? 's' : ''}
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#16A6A1]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: Review Keywords & Titles */}
                {searchSuggestions.reviews.length > 0 && (
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                      <MessageSquare className="w-3 h-3 text-amber-500" />
                      <span>Matching Reviews ({searchSuggestions.reviews.length})</span>
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.reviews.map((rev) => (
                        <button
                          key={rev.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(rev.title || rev.targetName)}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-amber-50 text-left transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate">
                              {rev.title || rev.comment}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              by {rev.touristName} • {rev.targetName}
                            </span>
                          </div>
                          <span className="text-amber-500 text-xs font-black shrink-0">
                            ★ {rev.rating}.0
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: Popular Tags */}
                {searchSuggestions.tags.length > 0 && (
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      <span>Categories & Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {searchSuggestions.tags.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(t.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>#{t.name}</span>
                          {t.count > 0 && (
                            <span className="text-[10px] text-indigo-500">({t.count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State in Dropdown */}
                {searchSuggestions.targets.length === 0 &&
                  searchSuggestions.reviews.length === 0 &&
                  searchSuggestions.tags.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No matching sights or reviews found for "{searchQuery}".
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Target Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
            {[
              { id: 'All', label: 'All Items' },
              { id: 'attraction', label: 'Attractions' },
              { id: 'tour', label: 'Tour Packages' },
              { id: 'destination', label: 'Destinations' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setTargetTypeFilter(type.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                  targetTypeFilter === type.id
                    ? 'bg-[#0B3A53] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Search Chips for Fast 1-Click Searching */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0">
            <TrendingUp className="w-3 h-3 text-[#16A6A1]" />
            <span>Popular:</span>
          </div>
          {popularChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                searchQuery.toLowerCase() === chip.toLowerCase()
                  ? 'bg-[#16A6A1] text-white border-[#16A6A1] shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80 hover:border-[#16A6A1]'
              }`}
            >
              {chip}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-bold text-rose-600 hover:underline shrink-0 ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Row 2: Secondary Filters (Destination, Rating, Sort By) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Destination filter */}
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              <span>Location:</span>
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {availableDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Rating:</span>
            </div>
            {['All', 5, 4, 3, 'Low'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(r as any)}
                className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                  selectedRating === r
                    ? 'bg-[#16A6A1] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'All' ? 'All' : r === 'Low' ? 'Lower Rating' : `${r}★`}
              </button>
            ))}

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 font-bold text-slate-600 ml-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          <div className="text-slate-500 font-semibold">
            Showing <strong className="text-slate-900">{filteredReviews.length}</strong> reviews
          </div>
        </div>
      </div>

      {/* Review Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-black text-slate-800 font-heading">
            No matching reviews found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or clear your filters to view all genuine traveler feedback.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onWriteReviewClick}
              className="px-5 py-2.5 bg-[#16A6A1] text-white text-xs font-bold rounded-full hover:bg-[#138D89] transition-colors cursor-pointer"
            >
              Be First to Review
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onHelpfulToggle={onHelpfulToggle}
              onPhotoClick={onPhotoClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
