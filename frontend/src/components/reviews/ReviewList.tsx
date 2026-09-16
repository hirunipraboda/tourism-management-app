import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Star, MessageSquare } from 'lucide-react';
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
  const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');

  // Available unique destination/targets
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
        // Show only published reviews in tourist list
        if (r.status !== 'Published') return false;

        const matchesSearch =
          !searchQuery.trim() ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesType =
          targetTypeFilter === 'All' || r.targetType === targetTypeFilter;

        const matchesRating =
          selectedRating === 'All' || r.rating >= Number(selectedRating);

        const matchesDest =
          destinationFilter === 'All' || r.targetName.toLowerCase().includes(destinationFilter.toLowerCase());

        return matchesSearch && matchesType && matchesRating && matchesDest;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
        return 0; // default order
      });
  }, [reviews, searchQuery, targetTypeFilter, selectedRating, sortBy, destinationFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setTargetTypeFilter('All');
    setSelectedRating('All');
    setSortBy('newest');
    setDestinationFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Row 1: Search & Target Type Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by sight, tour, tea estate, or keywords (e.g., Tooth Relic, Sigiriya, train)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A6A1] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
            {['All', 5, 4, 3].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(r as any)}
                className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                  selectedRating === r
                    ? 'bg-[#16A6A1] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'All' ? 'All' : `${r}★ & up`}
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
