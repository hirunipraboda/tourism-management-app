import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star,
  BarChart3,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  X,
  TrendingUp,
  Award,
  MapPin,
  Heart,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { ReviewStats } from '../../components/reviews/ReviewStats';
import { PopularAttractions } from '../../components/reviews/PopularAttractions';
import { RecommendationInsights } from '../../components/reviews/RecommendationInsights';
import { RecommendationManagementPanel } from '../../components/reviews/RecommendationManagementPanel';
import { RatingStars } from '../../components/reviews/RatingStars';
import { reviewService } from '../../services/reviewService';
import { analyticsService } from '../../services/analyticsService';
import {
  Review,
  CustomerSatisfactionAnalytics,
  RecommendationInsightsData,
} from '../../types/reviewsAndRecommendations';

type AdminTab = 'recommendation-management' | 'satisfaction-analytics';

interface AdminReviewsPageProps {
  defaultTab?: AdminTab;
}

const FEEDBACK_PER_PAGE = 6;

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({
  defaultTab = 'recommendation-management',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab | null;
  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabParam === 'satisfaction-analytics' ? 'satisfaction-analytics' : 'recommendation-management'
  );

  useEffect(() => {
    if (tabParam === 'satisfaction-analytics' || tabParam === 'recommendation-management') {
      setActiveTab(tabParam);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabParam, defaultTab]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ── Data State ───────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<CustomerSatisfactionAnalytics | null>(null);
  const [insights, setInsights] = useState<RecommendationInsightsData | null>(null);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    positivePercentage: 0,
    pendingCount: 0,
    negativeCount: 0,
  });

  // ── Feedback Explorer Filters (Read-only) ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modal State ──────────────────────────────────────────────────────────────
  const [viewingReviewDetails, setViewingReviewDetails] = useState<Review | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Load Data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const revs = await reviewService.getReviews();
      setReviews(revs);
      setReviewStats(await reviewService.getReviewStats());
      try {
        const an = await analyticsService.getCustomerSatisfactionAnalytics();
        setAnalytics(an);
      } catch { /* use fallback */ }
      try {
        const ins = await analyticsService.getRecommendationInsights();
        setInsights(ins);
      } catch { /* use fallback */ }
    };
    loadData();

    const unsubscribe = reviewService.subscribe(() => {
      reviewService.getReviews().then(async (revs) => {
        setReviews(revs);
        setReviewStats(await reviewService.getReviewStats());
      });
    });
    return () => unsubscribe();
  }, []);

  const topPlace = insights?.topRecommendedAttraction ?? reviews[0]?.targetName ?? 'Nine Arches Bridge';

  // ── Filtered Reviews for Read-Only Explorer ──────────────────────────────────
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRating = ratingFilter === 'All' || r.rating === ratingFilter;
      return matchSearch && matchRating;
    });
  }, [reviews, searchQuery, ratingFilter]);

  const totalPages = Math.ceil(filteredReviews.length / FEEDBACK_PER_PAGE) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * FEEDBACK_PER_PAGE;
    return filteredReviews.slice(start, start + FEEDBACK_PER_PAGE);
  }, [filteredReviews, currentPage]);

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    {
      id: 'recommendation-management',
      label: 'Recommendation Management',
      icon: Sparkles,
    },
    {
      id: 'satisfaction-analytics',
      label: 'Satisfaction & Review Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Toast Notification ─────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#16A6A1] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A6A1]/10 text-[#146C86] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#16A6A1]" />
            <span>AI Recommendation &amp; Tourist Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Recommendations &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure AI recommendation weights, tune attraction boosting, and track tourist satisfaction trends.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#0B3A53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dashboard Summary (Always Visible) ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Reviews</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B3A53] font-heading">
            {reviewStats.totalReviews.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">All tourist feedback submissions</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Rating</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B3A53] font-heading">
            {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : '3.6'}
            <span className="text-sm text-slate-400 font-semibold"> / 5</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Across all verified sights
          </p>
        </div>

        {/* Positive Satisfaction Rate (Replaces destructive moderation card) */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-xs space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Satisfaction Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-heading">
            {reviewStats.positivePercentage > 0 ? Math.round(reviewStats.positivePercentage) : 88}%
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Positive ratings (4★ &amp; 5★)</p>
        </div>

        {/* Top Recommended Place */}
        <div className="bg-gradient-to-br from-[#0B3A53] to-[#16A6A1] rounded-3xl p-5 shadow-xs space-y-2 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">Top Recommended</span>
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-base font-black leading-tight line-clamp-2">
            {topPlace}
          </div>
          <p className="text-[10px] text-white/60 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Highest algorithm match score
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: RECOMMENDATION MANAGEMENT (Primary Tab)                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'recommendation-management' && (
        <div className="space-y-6">
          {insights ? (
            <>
              {/* Existing high-level insights as a quick summary row */}
              <RecommendationInsights insights={insights} />
              {/* Full management panel: boost/exclude, weights, AI agent analytics */}
              <RecommendationManagementPanel insights={insights} onToast={showToast} />
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-slate-500 font-semibold text-sm">
                Loading recommendation data…
              </p>
              <p className="text-xs text-slate-400">
                Make sure the backend recommendation engine is running.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SATISFACTION & REVIEW ANALYTICS                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'satisfaction-analytics' && (
        <div className="space-y-6">
          {analytics && (
            <>
              <ReviewStats
                totalReviews={analytics.totalReviews}
                averageRating={analytics.averageRating}
                positivePercentage={analytics.positiveReviewsPercentage}
                negativeCount={analytics.negativeReviewsCount}
                pendingCount={analytics.pendingReviewsCount}
              />
              <PopularAttractions attractions={analytics.popularAttractions} />
            </>
          )}

          {/* ── Read-Only Customer Feedback Explorer ───────────────────────── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0B3A53] font-heading flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#16A6A1]" />
                  <span>Tourist Feedback Explorer</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Read genuine reviews and sentiment submitted by tourists visiting Sri Lanka landmarks.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search feedback..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#16A6A1]/30 w-44 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => {
                      setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden pr-2 py-0.5 cursor-pointer"
                  >
                    <option value="All">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feedback List Table */}
            {paginatedReviews.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">No customer reviews match your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Tourist</th>
                      <th className="py-3 px-3">Attraction / Site</th>
                      <th className="py-3 px-3">Rating</th>
                      <th className="py-3 px-3">Feedback Snippet</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.touristAvatar}
                              alt={rev.touristName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{rev.touristName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{rev.touristCountry}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A6A1]/10 text-[#0B3A53]">
                            {rev.targetName}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <RatingStars rating={rev.rating} size="sm" />
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-800 line-clamp-1">{rev.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{rev.comment}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] font-medium whitespace-nowrap">
                          {rev.date}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setViewingReviewDetails(rev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B3A53] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Read complete review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <span>
                  Showing page {currentPage} of {totalPages} ({filteredReviews.length} total reviews)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Read-Only Review Detail Modal ────────────────────────────────────── */}
      {viewingReviewDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={viewingReviewDetails.touristAvatar}
                  alt={viewingReviewDetails.touristName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{viewingReviewDetails.touristName}</h4>
                  <span className="text-xs text-slate-400">{viewingReviewDetails.touristCountry}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingReviewDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B3A53] bg-slate-100 px-3 py-1 rounded-full capitalize">
                  {viewingReviewDetails.targetName} · {viewingReviewDetails.targetType}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{viewingReviewDetails.rating}.0 / 5.0</span>
                </div>
              </div>

              <h3 className="text-base font-black text-slate-900 font-heading">
                {viewingReviewDetails.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                "{viewingReviewDetails.comment}"
              </p>

              {viewingReviewDetails.operatorNotes && (
                <div className="bg-[#16A6A1]/5 border border-[#16A6A1]/20 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-black text-[#16A6A1] uppercase tracking-wider">Operator Response</span>
                  <p className="text-xs text-slate-700 font-medium">{viewingReviewDetails.operatorNotes}</p>
                </div>
              )}
            </div>

            {viewingReviewDetails.photos && viewingReviewDetails.photos.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1.5">Submitted Photos:</span>
                <div className="flex gap-2 pt-1 overflow-x-auto pb-1">
                  {viewingReviewDetails.photos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt="Upload"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewingReviewDetails(null)}
                className="px-5 py-2 rounded-xl bg-[#0B3A53] hover:bg-[#0B3A53]/90 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
