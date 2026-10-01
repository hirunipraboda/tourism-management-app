import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Star,
  Plus,
  Heart,
  Eye,
  Navigation,
  Info,
} from 'lucide-react';
import { Recommendation } from '../../types/reviewsAndRecommendations';
import { SuitabilityScore } from './SuitabilityScore';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onViewDetails: (recommendation: Recommendation) => void;
  onAddToTrip: (recommendation: Recommendation) => void;
  onWhyThis?: (recommendation: Recommendation) => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
  onAddToTrip,
  onWhyThis,
  className = '',
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const matchReasons = recommendation.matchReasons ?? [];
  const hasReasons = matchReasons.length > 0;
  const hasDistance = (recommendation.distanceKm ?? 0) > 0;
  const hasRealRating = recommendation.rating > 0 && recommendation.reviewCount > 0;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group ${className}`}
    >
      {/* Top Media Image Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={recommendation.image}
          alt={recommendation.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-black text-[#0B3A53] shadow-xs">
            {recommendation.category}
          </span>

          {/* Suitability Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{Math.round(recommendation.suitabilityScore)}% Match</span>
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Location + Distance Label */}
        <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-extrabold drop-shadow">
            <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>{recommendation.location}</span>
          </div>
          {hasDistance && (
            <div className="flex items-center gap-1 text-xs font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Navigation className="w-3 h-3 text-cyan-300" />
              <span>{recommendation.distanceKm} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Rating & Review count */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {hasRealRating ? (
                <>
                  <span>{recommendation.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-semibold">
                    ({recommendation.reviewCount} reviews)
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-semibold">No reviews yet</span>
              )}
            </div>

            {/* Estimated Price */}
            <span className="text-xs font-black text-[#0B3A53] bg-slate-100 px-2.5 py-0.5 rounded-lg">
              {recommendation.price}
            </span>
          </div>

          {/* Attraction Name */}
          <h3
            onClick={() => onViewDetails(recommendation)}
            className="text-base sm:text-lg font-black text-slate-900 font-heading leading-snug group-hover:text-[#146C86] transition-colors cursor-pointer"
          >
            {recommendation.name}
          </h3>

          {/* Match Reason Chips */}
          {hasReasons && (
            <div className="flex flex-wrap gap-1.5">
              {matchReasons.slice(0, 3).map((reason, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded-full"
                >
                  ✓ {reason}
                </span>
              ))}
            </div>
          )}

          {/* Short Recommendation Explanation (fallback when no reasons) */}
          {!hasReasons && (
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100/90 text-[11px] text-emerald-900 space-y-1">
              <div className="flex items-center gap-1 font-black text-emerald-800 uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Why this? {Math.round(recommendation.suitabilityScore)}% match</span>
              </div>
              <p className="font-medium text-emerald-800 leading-relaxed line-clamp-2">
                "{recommendation.explanation}"
              </p>
            </div>
          )}
        </div>

        {/* Factor Breakdown Bars (Mini) */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span>Interest Match:</span>
            <span className="text-[#16A6A1] font-black">{Math.round(recommendation.interestMatch)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rating Match:</span>
            <span className="text-amber-600 font-black">{Math.round(recommendation.ratingMatch)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => onViewDetails(recommendation)}
            className="col-span-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </button>

          {/* "Why this?" suitability button */}
          {onWhyThis && (
            <button
              onClick={() => onWhyThis(recommendation)}
              className="col-span-1 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 font-bold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
              title="See why this was recommended"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Why?</span>
            </button>
          )}

          <button
            onClick={() => onAddToTrip(recommendation)}
            className={`${onWhyThis ? 'col-span-1' : 'col-span-2'} py-2.5 rounded-xl bg-[#0B3A53] hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs`}
          >
            <Plus className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>Add to Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
