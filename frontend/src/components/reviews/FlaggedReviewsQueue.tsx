import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  Star,
  Flag,
  Eye,
} from 'lucide-react';
import { Review } from '../../types/reviewsAndRecommendations';

interface FlaggedReview extends Review {
  flagReason: string;
  flaggedBy: string;
  flaggedAt: string;
}

interface FlaggedReviewsQueueProps {
  reviews: Review[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (review: Review) => void;
}

// Simulate flagged reviews from the review list (low-rated + pending)
function buildFlaggedQueue(reviews: Review[]): FlaggedReview[] {
  const FLAG_REASONS = [
    'Reported as spam',
    'Contains offensive language',
    'Suspected fake/bot review',
    'Irrelevant content',
    'Duplicate submission',
  ];
  return reviews
    .filter((r) => r.status === 'Pending Review' || r.rating <= 2)
    .slice(0, 8)
    .map((r, i) => ({
      ...r,
      flagReason: FLAG_REASONS[i % FLAG_REASONS.length],
      flaggedBy: `user_${Math.floor(Math.random() * 9000) + 1000}`,
      flaggedAt: r.date,
    }));
}

export const FlaggedReviewsQueue: React.FC<FlaggedReviewsQueueProps> = ({
  reviews,
  onApprove,
  onDelete,
  onView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const flagged = buildFlaggedQueue(reviews);
  const count = flagged.length;

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-50/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-100 text-amber-600 shrink-0">
            <Flag className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-black text-slate-900">
                Flagged &amp; Reported Reviews
              </h3>
              {count > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase animate-pulse">
                  {count} pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Reviews reported by users for spam, offensive content, or suspected fakes
            </p>
          </div>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors shrink-0 ml-4">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-amber-100 px-6 pb-6 pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {count === 0 ? (
            <div className="text-center py-8 text-slate-400 font-semibold text-sm">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No flagged reviews at this time.
            </div>
          ) : (
            flagged.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100 hover:border-amber-200 transition-all"
              >
                {/* Tourist */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={rev.touristAvatar}
                    alt={rev.touristName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 text-xs truncate">
                      {rev.touristName}
                      <span className="font-semibold text-slate-400 ml-1.5">· {rev.touristCountry}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {rev.targetName} ({rev.targetType})
                    </div>
                  </div>
                </div>

                {/* Flag reason */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black">
                    <AlertTriangle className="w-3 h-3" />
                    {rev.flagReason}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-700">{rev.rating}.0</span>
                </div>

                {/* Review snippet */}
                <div className="flex-1 min-w-0 hidden lg:block">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{rev.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">"{rev.comment}"</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onView(rev)}
                    title="View Full Review"
                    className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-[#0B3A53] border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onApprove(rev.id)}
                    title="Approve & Publish"
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(rev.id)}
                    title="Delete Review"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
