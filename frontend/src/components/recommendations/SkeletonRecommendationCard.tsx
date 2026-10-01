import React from 'react';

/**
 * Animated skeleton placeholder matching the RecommendationCard dimensions.
 * Shown during the loading state of the recommendations grid.
 */
export const SkeletonRecommendationCard: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse border border-gray-100">
    {/* Image placeholder */}
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />

    <div className="p-5 space-y-3">
      {/* Category badge */}
      <div className="h-5 w-20 bg-gray-200 rounded-full" />

      {/* Title */}
      <div className="h-6 w-3/4 bg-gray-200 rounded" />

      {/* Location */}
      <div className="h-4 w-1/2 bg-gray-200 rounded" />

      {/* Rating row */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-8 bg-gray-200 rounded" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full" />
      </div>

      {/* Reason chips */}
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>

      {/* Button row */}
      <div className="flex gap-2 pt-1">
        <div className="h-9 flex-1 bg-gray-200 rounded-xl" />
        <div className="h-9 w-16 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export default SkeletonRecommendationCard;
