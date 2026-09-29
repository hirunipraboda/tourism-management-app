import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types/reviewsAndRecommendations';
import { RatingStars } from './RatingStars';

interface ReviewManagementTableProps {
  reviews: Review[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onView: (review: Review) => void;
  className?: string;
}

const ITEMS_PER_PAGE = 6;

export const ReviewManagementTable: React.FC<ReviewManagementTableProps> = ({
  reviews,
  onApprove,
  onReject,
  onView,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReviewStatus>('All');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Violates community policy guidelines');

  // Filtered reviews
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchRating = ratingFilter === 'All' || r.rating === ratingFilter;

      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleStatusChange = (status: 'All' | ReviewStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getStatusPill = (status: ReviewStatus) => {
    switch (status) {
      case 'Published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published</span>
          </span>
        );
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-black border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-[#0B3A53] font-heading">
            Review Moderation & Operator Table
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Monitor, inspect, approve, or reject customer feedback across destinations and tours
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 shrink-0 text-xs">
          {(['All', 'Pending Review', 'Published', 'Rejected'] as ('All' | ReviewStatus)[]).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0B3A53] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by tourist name, destination, title or review text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#16A6A1] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Rating:</span>
          {['All', 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRatingFilter(r as any);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                ratingFilter === r
                  ? 'bg-[#16A6A1] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'All' ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 font-heading">
                  Reject Review Submission
                </h4>
                <p className="text-xs text-slate-500">Provide an operational rejection reason</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(rejectingId, rejectionReason);
                  setRejectingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
              <th className="pb-3 font-black">Tourist</th>
              <th className="pb-3 font-black">Destination / Attraction</th>
              <th className="pb-3 font-black">Rating</th>
              <th className="pb-3 font-black">Review Snippet</th>
              <th className="pb-3 font-black">Date</th>
              <th className="pb-3 font-black">Status</th>
              <th className="pb-3 text-right font-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                  No reviews matching moderation filters.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Tourist */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.touristAvatar}
                        alt={rev.touristName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 truncate">
                          {rev.touristName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {rev.touristCountry}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Target Name */}
                  <td className="py-3.5 pr-3">
                    <div className="font-bold text-slate-800 line-clamp-1">{rev.targetName}</div>
                    <div className="text-[10px] font-semibold text-slate-400 capitalize">
                      {rev.targetType}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-1 font-black text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Review Snippet */}
                  <td className="py-3.5 pr-3 max-w-[240px]">
                    <div className="font-bold text-slate-800 line-clamp-1">{rev.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                      "{rev.comment}"
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 pr-3 text-slate-500 font-medium whitespace-nowrap">
                    {rev.date}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-3 whitespace-nowrap">{getStatusPill(rev.status)}</td>

                  {/* Actions */}
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* View button */}
                      <button
                        onClick={() => onView(rev)}
                        className="p-1.5 text-slate-500 hover:text-[#0B3A53] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View Full Review"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve button */}
                      {rev.status !== 'Published' && (
                        <button
                          onClick={() => onApprove(rev.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Approve Review"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {/* Reject button */}
                      {rev.status !== 'Rejected' && (
                        <button
                          onClick={() => setRejectingId(rev.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Reject Review"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {paginatedReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={rev.touristAvatar}
                  alt={rev.touristName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-extrabold text-slate-900">{rev.touristName}</div>
                  <div className="text-[10px] text-slate-400">{rev.targetName}</div>
                </div>
              </div>
              {getStatusPill(rev.status)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 font-black text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rev.rating}</span>
                <span className="text-slate-800 ml-1 font-extrabold">{rev.title}</span>
              </div>
              <p className="text-slate-600 line-clamp-2">"{rev.comment}"</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 text-[11px]">{rev.date}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(rev)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700"
                >
                  View
                </button>
                {rev.status !== 'Published' && (
                  <button
                    onClick={() => onApprove(rev.id)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Approve
                  </button>
                )}
                {rev.status !== 'Rejected' && (
                  <button
                    onClick={() => setRejectingId(rev.id)}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-semibold">
          Showing {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 font-extrabold text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
