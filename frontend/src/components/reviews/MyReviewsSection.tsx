import React, { useState } from 'react';
import { Plus, User, AlertCircle, Trash2, CheckCircle2, Clock, XCircle, Edit3 } from 'lucide-react';
import { Review } from '../../types/reviewsAndRecommendations';
import { ReviewCard } from './ReviewCard';

interface MyReviewsSectionProps {
  myReviews: Review[];
  onEditReview: (review: Review) => void;
  onDeleteReview: (id: string) => void;
  onWriteNewClick: () => void;
  onHelpfulToggle: (id: string) => void;
}

export const MyReviewsSection: React.FC<MyReviewsSectionProps> = ({
  myReviews,
  onEditReview,
  onDeleteReview,
  onWriteNewClick,
  onHelpfulToggle,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const publishedCount = myReviews.filter((r) => r.status === 'Published').length;
  const pendingCount = myReviews.filter((r) => r.status === 'Pending Review').length;
  const rejectedCount = myReviews.filter((r) => r.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3A53] via-[#0E4461] to-[#146C86] text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-black text-[#16A6A1]">
            <User className="w-3.5 h-3.5" />
            <span>Tourist Feedback Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading">
            My Travel Reviews ({myReviews.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-medium">
            Manage your submitted ratings, track verification statuses, and update your journey stories anytime.
          </p>
        </div>

        {/* Status Counts Pill Bar & Write Review CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10 text-xs font-bold">
            <div className="flex items-center gap-1 text-emerald-300 px-2 py-1 bg-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{publishedCount} Published</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1 text-amber-300 px-2 py-1 bg-amber-500/20 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending</span>
              </div>
            )}
            {rejectedCount > 0 && (
              <div className="flex items-center gap-1 text-rose-300 px-2 py-1 bg-rose-500/20 rounded-lg">
                <XCircle className="w-3.5 h-3.5" />
                <span>{rejectedCount} Rejected</span>
              </div>
            )}
          </div>

          <button
            onClick={onWriteNewClick}
            className="px-5 py-2.5 rounded-2xl bg-[#16A6A1] hover:bg-[#138D89] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-heading">
                Delete this Review?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                This action cannot be undone. It will remove your review from the public ratings list.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteReview(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Reviews List */}
      {myReviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <User className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 font-heading">
              You haven't submitted any reviews yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Rate your favorite destinations, temples, or wildlife safaris and help fellow tourists plan their journey!
            </p>
          </div>
          <button
            onClick={onWriteNewClick}
            className="px-6 py-2.5 bg-[#16A6A1] hover:bg-[#138D89] text-white font-black text-xs rounded-full shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write Your First Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              isMyReview
              showActions
              onEdit={onEditReview}
              onDelete={(id) => setDeleteConfirmId(id)}
              onHelpfulToggle={onHelpfulToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
