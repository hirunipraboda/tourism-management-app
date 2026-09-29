import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Recommendation } from '../../types/reviewsAndRecommendations';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onViewDetails: (recommendation: Recommendation) => void;
  onAddToTrip?: (recommendation: Recommendation) => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
  className = '',
}) => {
  // Derive clean Traveler Sentiment label
  const getSentimentLabel = () => {
    if (recommendation.rating >= 4.8) return '😊 Mostly Positive';
    if (recommendation.rating >= 4.5) return '😊 Very Positive';
    return '🙂 Positive';
  };

  // Derive clean Budget category
  const getBudgetLabel = () => {
    const p = (recommendation.price || '').toLowerCase();
    if (p.includes('free') || p.includes('15') || p.includes('18') || p.includes('2,000') || p.includes('budget')) {
      return '💰 Budget Friendly';
    }
    if (p.includes('75') || p.includes('100') || p.includes('safari') || p.includes('premium')) {
      return '💎 Premium';
    }
    return '💵 Moderate';
  };

  // Relevant interest tags
  const getInterestTags = () => {
    const tags: string[] = [];
    if (recommendation.category) tags.push(recommendation.category);

    const name = recommendation.name.toLowerCase();
    const desc = (recommendation.description || recommendation.explanation || '').toLowerCase();

    if (name.includes('bridge') || desc.includes('photo') || desc.includes('scenic')) {
      if (!tags.includes('Photography')) tags.push('Photography');
    }
    if (name.includes('hike') || desc.includes('trek') || desc.includes('climb') || desc.includes('trail')) {
      if (!tags.includes('Hiking')) tags.push('Hiking');
    }
    if (name.includes('temple') || desc.includes('temple') || desc.includes('sacred') || desc.includes('ritual')) {
      if (!tags.includes('Culture')) tags.push('Culture');
    }
    if (name.includes('safari') || desc.includes('leopard') || desc.includes('elephant') || desc.includes('wildlife')) {
      if (!tags.includes('Wildlife')) tags.push('Wildlife');
    }
    if (name.includes('fort') || desc.includes('citadel') || desc.includes('history')) {
      if (!tags.includes('History')) tags.push('History');
    }

    if (tags.length < 3) tags.push('Sightseeing');
    return tags.slice(0, 3);
  };

  const shortDescription =
    recommendation.description && recommendation.description.length > 15
      ? recommendation.description
      : recommendation.explanation;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group ${className}`}
    >
      {/* 16:9 Destination Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={recommendation.image}
          alt={recommendation.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Visually prominent Match Percentage badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600/95 text-white font-black text-xs shadow-md backdrop-blur-xs border border-white/20">
          <span>{recommendation.suitabilityScore}% Match</span>
        </div>

        {/* Category tag */}
        <div className="absolute top-3.5 left-3.5">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-black text-[#0B3A53] shadow-xs">
            {recommendation.category}
          </span>
        </div>

        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-bold drop-shadow-md">
          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{recommendation.location}, Sri Lanka</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Destination Name */}
          <h3
            onClick={() => onViewDetails(recommendation)}
            className="text-lg font-black text-[#0B3A53] font-heading leading-snug group-hover:text-[#146C86] transition-colors cursor-pointer line-clamp-1"
            title={recommendation.name}
          >
            {recommendation.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
            "{shortDescription}"
          </p>

          {/* Interest Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {getInterestTags().map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Details & Meta */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {/* Traveler Sentiment & Budget */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Traveler Sentiment
              </span>
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                {getSentimentLabel()}
              </span>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Budget
              </span>
              <span className="font-extrabold text-slate-800 text-xs">
                {getBudgetLabel()}
              </span>
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(recommendation)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#0B3A53] text-[#0B3A53] hover:text-white font-black text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
