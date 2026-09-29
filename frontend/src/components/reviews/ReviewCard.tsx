import React, { useState } from 'react';
import {
  ThumbsUp,
  MapPin,
  Calendar,
  ShieldCheck,
  Share2,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { Review } from '../../types/reviewsAndRecommendations';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  review: Review;
  onHelpfulToggle?: (id: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  isMyReview?: boolean;
  className?: string;
  onPhotoClick?: (photoUrl: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpfulToggle,
  onEdit,
  onDelete,
  showActions = false,
  isMyReview = false,
  className = '',
  onPhotoClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Review['status']) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Published</span>
          </span>
        );
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-black">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  const getTargetTypeBadge = (targetType: Review['targetType']) => {
    const map = {
      destination: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Destination' },
      attraction: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Attraction' },
      tour: { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Tour Package' },
    };
    const c = map[targetType] || map.attraction;
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  return (
    <article
      className={`bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 space-y-4 ${className}`}
    >
      {/* Header: Tourist Profile & Target Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tourist Avatar & Meta */}
        <div className="flex items-center gap-3.5">
          <img
            src={review.touristAvatar}
            alt={review.touristName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#16A6A1]/20 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-heading">
                {review.touristName}
              </h4>
              {review.isCurrentTourist && (
                <span className="px-2 py-0.5 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-[10px] font-black">
                  You
                </span>
              )}
              {isMyReview && getStatusBadge(review.status)}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{review.touristCountry}</span>
              <span>•</span>
              <span className="capitalize">{review.travelerType}</span>
              <span>•</span>
              <span className="text-slate-400">{review.date}</span>
            </div>
          </div>
        </div>

        {/* Rating and Target Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {getTargetTypeBadge(review.targetType)}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0B3A53] text-xs font-extrabold">
            <MapPin className="w-3.5 h-3.5 text-[#16A6A1] shrink-0" />
            <span className="truncate max-w-[200px]">{review.targetName}</span>
          </div>

          <RatingStars rating={review.rating} size="sm" showValue />
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading leading-snug">
          {review.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          "{review.comment}"
        </p>
      </div>

      {/* Optional Photo Previews */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {review.photos.map((photo, pIdx) => (
            <div
              key={pIdx}
              onClick={() => onPhotoClick?.(photo)}
              className="relative group overflow-hidden rounded-2xl border border-slate-200 shadow-2xs cursor-pointer"
            >
              <img
                src={photo}
                alt="Review photograph"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Camera className="w-5 h-5 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operator Notes (if rejected or flagged) */}
      {review.operatorNotes && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-0.5">
          <span className="font-black uppercase tracking-wider text-[10px] text-rose-900">
            Operator Note:
          </span>
          <p className="font-medium">{review.operatorNotes}</p>
        </div>
      )}

      {/* Footer: Tags & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {review.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Helpful Button */}
          {onHelpfulToggle && (
            <button
              onClick={() => onHelpfulToggle(review.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                review.isHelpfulByUser
                  ? 'bg-[#16A6A1] text-white border-[#16A6A1] shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${review.isHelpfulByUser ? 'fill-white' : ''}`} />
              <span>Helpful 👍 {review.helpfulCount}</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors cursor-pointer"
            title="Share review link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          {copied && (
            <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
          )}

          {/* Edit Button for My Reviews */}
          {showActions && onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {/* Delete Button for My Reviews */}
          {showActions && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition-colors cursor-pointer border border-rose-200/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
