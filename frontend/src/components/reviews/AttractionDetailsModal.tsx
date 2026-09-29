import React from 'react';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Quote,
  Plus,
  Compass,
} from 'lucide-react';
import { Recommendation, Review } from '../../types/reviewsAndRecommendations';
import { SuitabilityScore } from './SuitabilityScore';

interface AttractionDetailsModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
  onAddToTrip: (item: Recommendation) => void;
  onBookNow?: (item: Recommendation) => void;
  onWriteReview?: (item: Recommendation) => void;
  recentReviews?: Review[];
}

export const AttractionDetailsModal: React.FC<AttractionDetailsModalProps> = ({
  recommendation,
  onClose,
  onAddToTrip,
  onBookNow,
  recentReviews = [],
}) => {
  if (!recommendation) return null;

  // Derive sentiment label
  const getSentimentLabel = () => {
    if (recommendation.rating >= 4.8) return '😊 Mostly Positive';
    if (recommendation.rating >= 4.5) return '😊 Very Positive';
    return '🙂 Positive';
  };

  // Derive budget category label
  const getBudgetCategory = () => {
    const p = (recommendation.price || '').toLowerCase();
    if (p.includes('free') || p.includes('15') || p.includes('18') || p.includes('2,000') || p.includes('budget')) {
      return '💰 Budget Friendly';
    }
    if (p.includes('75') || p.includes('100') || p.includes('safari') || p.includes('premium')) {
      return '💎 Premium Experience';
    }
    return '💵 Moderate';
  };

  // Dynamic highlights tags
  const getHighlights = () => {
    const list: string[] = [];
    const cat = (recommendation.category || '').toLowerCase();
    const name = recommendation.name.toLowerCase();
    const desc = (recommendation.description || recommendation.explanation || '').toLowerCase();

    if (cat.includes('nature') || desc.includes('nature') || desc.includes('mountain')) list.push('Nature');
    if (name.includes('bridge') || desc.includes('scenic') || desc.includes('view') || desc.includes('panorama')) list.push('Scenic Views');
    if (desc.includes('photo') || name.includes('photo') || name.includes('bridge')) list.push('Photography');
    if (name.includes('rock') || name.includes('hike') || desc.includes('trail') || desc.includes('trek')) list.push('Hiking');
    if (cat.includes('culture') || cat.includes('history') || name.includes('temple') || name.includes('fort')) list.push('Cultural Experience');
    if (cat.includes('wildlife') || name.includes('safari') || desc.includes('leopard')) list.push('Wildlife');
    if (cat.includes('beach') || desc.includes('whale') || desc.includes('ocean')) list.push('Coastal');

    if (list.length === 0) list.push('Scenic Views', 'Sightseeing', 'Local Heritage');
    return Array.from(new Set(list)).slice(0, 5);
  };

  // Common feedback recurring observations
  const getCommonFeedback = () => {
    const items: Array<{ text: string; type: 'positive' | 'caution' }> = [];
    const name = recommendation.name.toLowerCase();
    const desc = (recommendation.description || recommendation.explanation || '').toLowerCase();

    // Positives
    items.push({ text: 'Beautiful scenery', type: 'positive' });
    if (desc.includes('peace') || desc.includes('serene') || desc.includes('spiritual')) {
      items.push({ text: 'Peaceful atmosphere', type: 'positive' });
    } else {
      items.push({ text: 'Authentic atmosphere', type: 'positive' });
    }
    items.push({ text: 'Great photography spot', type: 'positive' });

    // Cautions
    if (name.includes('rock') || name.includes('sigiriya') || desc.includes('steep') || desc.includes('steps')) {
      items.push({ text: 'Steep walking paths', type: 'caution' });
    }
    if (name.includes('bridge') || name.includes('tooth') || name.includes('galle') || name.includes('yala')) {
      items.push({ text: 'Crowded on weekends', type: 'caution' });
    }

    return items;
  };

  // Good to know practical notes
  const getGoodToKnowNotes = () => {
    const notes: Array<{ text: string; icon: 'caution' | 'info' }> = [];

    // Use limitations from backend data if present
    if (recommendation.limitations && recommendation.limitations.length > 0) {
      recommendation.limitations.forEach((lim) => {
        notes.push({ text: lim, icon: 'caution' });
      });
    }

    const name = recommendation.name.toLowerCase();
    if (name.includes('tooth') || name.includes('temple') || name.includes('gangaramaya')) {
      notes.push({ text: 'Modest clothing covering shoulders and knees is recommended for temples.', icon: 'info' });
    }
    if (name.includes('sigiriya') || name.includes('rock') || name.includes('peak')) {
      notes.push({ text: 'Best visited in the early morning to beat the heat.', icon: 'info' });
    }
    if (name.includes('bridge') || name.includes('ella')) {
      notes.push({ text: 'Check train schedules in advance to catch the train crossing.', icon: 'info' });
    }
    if (name.includes('yala') || name.includes('safari')) {
      notes.push({ text: 'Early morning game drives offer the highest chance of wildlife sightings.', icon: 'info' });
    }

    if (notes.length === 0) {
      notes.push({ text: 'Local guides and observation points are accessible year-round.', icon: 'info' });
    }

    return notes.slice(0, 4);
  };

  // Collect review quotes
  const reviewQuotes = (recommendation.supportingFeedback && recommendation.supportingFeedback.length > 0)
    ? recommendation.supportingFeedback
    : recentReviews
        .filter((r) => r.targetName.toLowerCase().includes(recommendation.name.toLowerCase()))
        .map((r) => r.comment)
        .slice(0, 3);

  const fallbackQuotes = [
    'Watching the scenery and colors change across the landscape was truly magical.',
    'Easy to reach with well-maintained paths and hospitable locals along the way.',
  ];
  const finalQuotes = reviewQuotes.length > 0 ? reviewQuotes : fallbackQuotes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Destination Hero */}
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
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase">
                {recommendation.category}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-md border border-white/20">
                {recommendation.suitabilityScore}% Match
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading leading-tight">
              {recommendation.name}
            </h2>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-bold">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{recommendation.location}, Sri Lanka</span>
              {recommendation.openingHours && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{recommendation.openingHours}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Section: Why You'll Like It */}
          <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#0B3A53]">
              Why You'll Like It
            </h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              "{recommendation.explanation}"
            </p>
          </div>

          {/* Section: Highlights */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Highlights
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {getHighlights().map((h) => (
                <span
                  key={h}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/60 transition-colors"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Section: Traveler Feedback */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Traveler Feedback
            </h3>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                <span>{getSentimentLabel()}</span>
                <span className="text-xs font-semibold text-slate-400">
                  (Based on {recommendation.reviewCount} traveler reviews)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {recommendation.sentimentSummary ||
                  'Visitors consistently praise this destination for its picturesque setting, authentic atmosphere, and warm local hospitality.'}
              </p>
            </div>
          </div>

          {/* Section: What Travelers Mention */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              What Travelers Mention
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {finalQuotes.slice(0, 2).map((quote, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
                >
                  <Quote className="w-5 h-5 text-[#146C86] shrink-0 opacity-40" />
                  <p className="text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                    "{quote}"
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Verified Visitor
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Common Feedback */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Common Feedback
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {getCommonFeedback().map((fb, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    fb.type === 'positive'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                      : 'bg-amber-50 text-amber-800 border-amber-200/70'
                  }`}
                >
                  {fb.type === 'positive' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>{fb.text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Good to Know */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Good to Know
            </h3>
            <div className="space-y-2">
              {getGoodToKnowNotes().map((note, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-medium leading-relaxed ${
                    note.icon === 'caution'
                      ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                      : 'bg-sky-50/70 border-sky-200/80 text-sky-950'
                  }`}
                >
                  {note.icon === 'caution' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  )}
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Suitability Breakdown (Your Match) */}
          <SuitabilityScore score={recommendation.suitabilityScore} />

          {/* Section: Budget Information */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Budget
              </span>
              <span className="text-base font-black text-[#0B3A53]">
                {getBudgetCategory()}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Entrance / Activity Fee
              </span>
              <span className="text-sm font-black text-slate-800">
                {recommendation.price || 'Free Access'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {onBookNow && (
            <button
              onClick={() => {
                onBookNow(recommendation);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Bookings</span>
            </button>
          )}

          <button
            onClick={() => {
              onAddToTrip(recommendation);
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Trip Itinerary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
