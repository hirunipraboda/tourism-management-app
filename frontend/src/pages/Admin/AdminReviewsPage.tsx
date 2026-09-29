import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  X,
  Check,
  Ban,
} from 'lucide-react';
import { ReviewStats } from '../../components/reviews/ReviewStats';
import { RatingDistribution } from '../../components/reviews/RatingDistribution';
import { SatisfactionChart } from '../../components/reviews/SatisfactionChart';
import { PopularAttractions } from '../../components/reviews/PopularAttractions';
import { ReviewManagementTable } from '../../components/reviews/ReviewManagementTable';
import { RecommendationInsights } from '../../components/reviews/RecommendationInsights';
import { reviewService } from '../../services/reviewService';
import { analyticsService } from '../../services/analyticsService';
import {
  Review,
  CustomerSatisfactionAnalytics,
  RecommendationInsightsData,
  OperatorTab,
} from '../../types/reviewsAndRecommendations';

interface AdminReviewsPageProps {
  defaultTab?: OperatorTab;
}

export const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({
  defaultTab = 'review-management',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as OperatorTab | null;

  const [activeTab, setActiveTab] = useState<OperatorTab>(
    tabParam || defaultTab
  );

  // Synchronize activeTab when tabParam or defaultTab changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabParam, defaultTab]);

  const handleTabChange = (tab: OperatorTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Data State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<CustomerSatisfactionAnalytics | null>(null);
  const [insights, setInsights] = useState<RecommendationInsightsData | null>(null);
  const [reviewStats, setReviewStats] = useState(reviewService.getReviewStats());

  // Modal State
  const [viewingReviewDetails, setViewingReviewDetails] = useState<Review | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load reviews and stats on mount and subscribe to updates
  useEffect(() => {
    const loadData = async () => {
      const revs = await reviewService.getReviews();
      setReviews(revs);
      setReviewStats(reviewService.getReviewStats());

      const an = await analyticsService.getCustomerSatisfactionAnalytics();
      setAnalytics(an);

      const ins = await analyticsService.getRecommendationInsights();
      setInsights(ins);
    };

    loadData();

    const unsubscribe = reviewService.subscribe(() => {
      reviewService.getReviews().then((revs) => {
        setReviews(revs);
        setReviewStats(reviewService.getReviewStats());
      });
    });

    return () => unsubscribe();
  }, []);

  // Action handlers for reviews
  const handleApproveReview = async (id: string) => {
    await reviewService.updateStatus(id, 'Published');
    showToast('Review approved and published.');
  };

  const handleRejectReview = async (id: string, reason?: string) => {
    await reviewService.updateStatus(id, 'Rejected', reason);
    showToast('Review rejected.');
  };

  const pendingCount = reviews.filter((r) => r.status === 'Pending Review').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#16A6A1] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
          Reviews & Recommendations Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Moderate tourist feedback, inspect satisfaction ratings across destinations, and review AI recommendation algorithms.
        </p>
      </div>

      {/* Action Tabs Switcher */}
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabChange('review-management')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'review-management'
              ? 'bg-[#0B3A53] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Review Moderation</span>
          {pendingCount > 0 && (
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeTab === 'review-management'
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('customer-satisfaction')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'customer-satisfaction'
              ? 'bg-[#0B3A53] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Satisfaction Analytics</span>
        </button>

        <button
          onClick={() => handleTabChange('recommendation-insights')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'recommendation-insights'
              ? 'bg-[#0B3A53] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Recommendation Insights</span>
        </button>
      </div>

      {/* Tab 1: Review Moderation */}
      {activeTab === 'review-management' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <ReviewStats
            totalReviews={reviewStats.totalReviews}
            averageRating={reviewStats.averageRating}
            positivePercentage={reviewStats.positivePercentage}
            negativeCount={reviewStats.negativeCount}
            pendingCount={reviewStats.pendingCount}
          />

          {/* Reviews Table */}
          <ReviewManagementTable
            reviews={reviews}
            onApprove={handleApproveReview}
            onReject={handleRejectReview}
            onView={(rev) => setViewingReviewDetails(rev)}
          />
        </div>
      )}

      {/* Tab 2: Customer Satisfaction Analytics */}
      {activeTab === 'customer-satisfaction' && analytics && (
        <div className="space-y-6">
          {/* Top Summary Metric Cards */}
          <ReviewStats
            totalReviews={analytics.totalReviews}
            averageRating={analytics.averageRating}
            positivePercentage={analytics.positiveReviewsPercentage}
            negativeCount={analytics.negativeReviewsCount}
            pendingCount={analytics.pendingReviewsCount}
          />

          {/* Two Column Grid: Rating Distribution & Satisfaction Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RatingDistribution
              distribution={analytics.ratingDistribution}
              averageRating={analytics.averageRating}
              totalCount={analytics.totalReviews}
            />
            <SatisfactionChart data={analytics.satisfactionTrend} />
          </div>

          {/* Popular Attractions Table */}
          <PopularAttractions attractions={analytics.popularAttractions} />
        </div>
      )}

      {/* Tab 3: Recommendation Insights */}
      {activeTab === 'recommendation-insights' && insights && (
        <div className="space-y-6">
          <RecommendationInsights insights={insights} />
        </div>
      )}

      {/* Review Details Modal */}
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
                <span className="text-xs font-bold text-[#0B3A53] bg-slate-100 px-3 py-1 rounded-full">
                  Target: {viewingReviewDetails.targetName} ({viewingReviewDetails.targetType})
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
              {viewingReviewDetails.status !== 'Published' && (
                <button
                  onClick={() => {
                    handleApproveReview(viewingReviewDetails.id);
                    setViewingReviewDetails(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
              )}

              {viewingReviewDetails.status !== 'Rejected' && (
                <button
                  onClick={() => {
                    handleRejectReview(viewingReviewDetails.id);
                    setViewingReviewDetails(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject Review</span>
                </button>
              )}

              <button
                onClick={() => setViewingReviewDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
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
