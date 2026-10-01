import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Star,
  Sparkles,
  Plus,
  Send,
  MessageSquare,
  Compass,
  CheckCircle2,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Recommendation, Review, SuitabilityBreakdown } from '../../types/reviewsAndRecommendations';
import { SuitabilityScore } from './SuitabilityScore';
import { RatingStars } from './RatingStars';

interface AttractionDetailsModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
  onAddToTrip: (item: Recommendation) => void;
  onBookNow: (item: Recommendation) => void;
  onWriteReview: (item: Recommendation) => void;
  recentReviews?: Review[];
  suitabilityBreakdown?: SuitabilityBreakdown | null;
}

export const AttractionDetailsModal: React.FC<AttractionDetailsModalProps> = ({
  recommendation,
  onClose,
  onAddToTrip,
  onBookNow,
  onWriteReview,
  recentReviews = [],
  suitabilityBreakdown,
}) => {
  if (!recommendation) return null;

  const filteredItemReviews = recentReviews.filter(
    (r) =>
      r.targetName.toLowerCase().includes(recommendation.name.toLowerCase()) ||
      recommendation.name.toLowerCase().includes(r.targetName.toLowerCase())
  );

  const lkrPrice =
    recommendation.estimatedCost && recommendation.estimatedCost > 0
      ? `Rs. ${(recommendation.estimatedCost * 300).toLocaleString()}`
      : recommendation.price || 'Free entry';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* ── 1. Top Clean Header Bar ───────────────────────────────────────── */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-[#146C86] text-xs font-black uppercase tracking-wider border border-teal-100/80 flex items-center gap-1.5 shrink-0">
              <Tag className="w-3 h-3" />
              {recommendation.category}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading truncate">
              {recommendation.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Scrollable Body Content ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-sidebar-scroll">
          
          {/* Top Hero Banner & Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Image Card */}
            <div className="md:col-span-6 relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-sm">
              <img
                src={recommendation.image}
                alt={recommendation.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Suitability Pill on top left */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{Math.round(recommendation.suitabilityScore)}% Match For You</span>
              </div>

              {/* Location pin on bottom */}
              <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-bold drop-shadow">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{recommendation.location}, Sri Lanka</span>
              </div>
            </div>

            {/* Quick Details & Stats Overview */}
            <div className="md:col-span-6 flex flex-col justify-between gap-3 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70">
              <div className="space-y-3">
                {/* Rating line */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={recommendation.rating} size="sm" showValue />
                    <span className="text-xs font-semibold text-slate-500">
                      ({recommendation.reviewCount} traveler reviews)
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Verified Destination
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#146C86]" /> Opening Hours
                    </span>
                    <p className="font-extrabold text-slate-800 truncate">
                      {recommendation.openingHours || '6:00 AM – 6:00 PM'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#146C86]" /> Best Season
                    </span>
                    <p className="font-extrabold text-slate-800 truncate">
                      {recommendation.bestTimeToVisit || 'Year-round'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#146C86]" /> Duration
                    </span>
                    <p className="font-extrabold text-slate-800 truncate">
                      {recommendation.duration || '2 – 4 Hours'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" /> Estimated Cost
                    </span>
                    <p className="font-black text-[#0B3A53] truncate">
                      {lkrPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match Highlights / Reason Chips */}
              {recommendation.matchReasons && recommendation.matchReasons.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {recommendation.matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── About This Destination ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] font-heading flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#16A6A1]" />
              <span>About this Sight & Tour</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {recommendation.description ||
                'Discover one of Sri Lanka’s most spectacular highlights. Experience authentic local heritage, panoramic landscape views, and unforgettable cultural stories with certified local guidance.'}
            </p>
          </div>

          {/* ── AI Suitability Factor Breakdown ──────────────────────────────── */}
          {suitabilityBreakdown ? (
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2 font-heading">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Why this matches you — {Math.round(suitabilityBreakdown.overallScore)}% Overall Match</span>
                </h3>
                <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                  {suitabilityBreakdown.verdict}
                </span>
              </div>
              <div className="space-y-3 pt-1">
                {suitabilityBreakdown.criteria.map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900">
                        {c.name} <span className="text-emerald-600 font-normal">({Math.round(c.weight * 100)}% weight)</span>
                      </span>
                      <span className="font-black text-emerald-950">{Math.round(c.score)}%</span>
                    </div>
                    <div className="h-2 bg-emerald-100/90 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(c.score)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <SuitabilityScore
              score={recommendation.suitabilityScore}
              interestMatch={recommendation.interestMatch}
              ratingMatch={recommendation.ratingMatch}
              budgetMatch={recommendation.budgetMatch}
              locationMatch={recommendation.locationMatch}
              popularityScore={recommendation.popularityScore}
              explanation={recommendation.explanation}
            />
          )}

          {/* ── Recent Traveler Reviews Section ──────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53] font-heading flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#16A6A1]" />
                  <span>Recent Traveler Reviews</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verified opinions from travelers who experienced this location
                </p>
              </div>

              <button
                onClick={() => onWriteReview(recommendation)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#146C86] font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-teal-200/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>

            {filteredItemReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredItemReviews.slice(0, 4).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={rev.touristAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.touristName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <span className="font-black text-slate-900 truncate">{rev.touristName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RatingStars rating={rev.rating} size="xs" showValue />
                      {rev.title && (
                        <span className="text-xs font-bold text-slate-800 truncate">• {rev.title}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">No traveler reviews yet for {recommendation.name}</p>
                <p className="text-[11px] text-slate-400">Be the first to share your experience with fellow travelers!</p>
              </div>
            )}
          </div>

        </div>

        {/* ── 3. Sticky Bottom Action Bar ───────────────────────────────────── */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Entry / Tour Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#0B3A53]">{lkrPrice}</span>
              {recommendation.estimatedCost && recommendation.estimatedCost > 0 && (
                <span className="text-xs font-semibold text-slate-400">
                  (~${recommendation.estimatedCost} USD)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onWriteReview(recommendation)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Write Review
            </button>

            <button
              onClick={() => onAddToTrip(recommendation)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>

            <button
              onClick={() => onBookNow(recommendation)}
              className="px-6 py-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Book Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
