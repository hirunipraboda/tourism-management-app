import React from 'react';
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Plus,
  Send,
  MessageSquare,
} from 'lucide-react';
import { Recommendation, Review } from '../../types/reviewsAndRecommendations';
import { SuitabilityScore } from './SuitabilityScore';
import { RatingStars } from './RatingStars';
import { ReviewCard } from './ReviewCard';

interface AttractionDetailsModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
  onAddToTrip: (item: Recommendation) => void;
  onBookNow: (item: Recommendation) => void;
  onWriteReview: (item: Recommendation) => void;
  recentReviews?: Review[];
}

export const AttractionDetailsModal: React.FC<AttractionDetailsModalProps> = ({
  recommendation,
  onClose,
  onAddToTrip,
  onBookNow,
  onWriteReview,
  recentReviews = [],
}) => {
  if (!recommendation) return null;

  const filteredItemReviews = recentReviews.filter(
    (r) =>
      r.targetName.toLowerCase().includes(recommendation.name.toLowerCase()) ||
      recommendation.name.toLowerCase().includes(r.targetName.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={recommendation.image}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase">
                {recommendation.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0B3A53] text-white text-xs font-black border border-white/20">
                {recommendation.suitabilityScore}% Suitable For You
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading leading-tight">
              {recommendation.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#16A6A1]" />
                {recommendation.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                {recommendation.rating.toFixed(1)} ({recommendation.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="text-white font-extrabold">{recommendation.price}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-sidebar-scroll">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Opening Hours</span>
              <span className="font-extrabold text-slate-800">
                {recommendation.openingHours || 'Open Daily'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Best Season</span>
              <span className="font-extrabold text-slate-800">
                {recommendation.bestTimeToVisit || 'Year-round'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Estimated Duration</span>
              <span className="font-extrabold text-slate-800">
                {recommendation.duration || '2 - 4 Hours'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Pricing / Fee</span>
              <span className="font-extrabold text-[#0B3A53]">{recommendation.price}</span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-900 font-heading">
              About this Sight & Tour
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {recommendation.description ||
                'Discover one of Sri Lanka’s most spectacular highlights. Experience authentic local heritage, panoramic landscape views, and unforgettable cultural stories with certified local guidance.'}
            </p>
          </div>

          {/* Detailed Suitability Score Breakdown Component */}
          <SuitabilityScore
            score={recommendation.suitabilityScore}
            interestMatch={recommendation.interestMatch}
            ratingMatch={recommendation.ratingMatch}
            budgetMatch={recommendation.budgetMatch}
            locationMatch={recommendation.locationMatch}
            popularityScore={recommendation.popularityScore}
            explanation={recommendation.explanation}
          />

          {/* Recent Reviews for this Attraction */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Recent Traveler Reviews
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verified feedback from travelers who visited recently
                </p>
              </div>

              <button
                onClick={() => onWriteReview(recommendation)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {filteredItemReviews.length > 0 ? (
              <div className="space-y-3">
                {filteredItemReviews.slice(0, 2).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.touristAvatar}
                          alt={rev.touristName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-extrabold text-slate-800">{rev.touristName}</span>
                        <span className="text-slate-400">• {rev.date}</span>
                      </div>
                      <RatingStars rating={rev.rating} size="xs" showValue />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{rev.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-2">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                Be the first traveler to write a detailed review for {recommendation.name}!
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Bar Sticky Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Estimated Price:</span>
            <span className="text-base font-black text-[#0B3A53]">{recommendation.price}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onWriteReview(recommendation)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Write a Review
            </button>

            <button
              onClick={() => onAddToTrip(recommendation)}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#0B3A53] font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>

            <button
              onClick={() => onBookNow(recommendation)}
              className="px-6 py-2.5 rounded-xl bg-[#0B3A53] hover:bg-slate-900 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Book Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
