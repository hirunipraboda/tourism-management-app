import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { Footer } from '../components/navigation/Footer';
import { RolePerspectiveBar } from '../components/reviews/RolePerspectiveBar';
import { ReviewList } from '../components/reviews/ReviewList';
import { MyReviewsSection } from '../components/reviews/MyReviewsSection';
import { RecommendationCard } from '../components/reviews/RecommendationCard';
import { RecommendationFilters } from '../components/reviews/RecommendationFilters';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { AttractionDetailsModal } from '../components/reviews/AttractionDetailsModal';
import { ReviewStats } from '../components/reviews/ReviewStats';
import { RatingDistribution } from '../components/reviews/RatingDistribution';
import { SatisfactionChart } from '../components/reviews/SatisfactionChart';
import { PopularAttractions } from '../components/reviews/PopularAttractions';
import { ReviewManagementTable } from '../components/reviews/ReviewManagementTable';
import { RecommendationInsights } from '../components/reviews/RecommendationInsights';
import { reviewService } from '../services/reviewService';
import { recommendationService } from '../services/recommendationService';
import { analyticsService } from '../services/analyticsService';
import {
  Review,
  Recommendation,
  RecommendationFilterState,
  CustomerSatisfactionAnalytics,
  RecommendationInsightsData,
  ModulePerspective,
  TouristTab,
  OperatorTab,
} from '../types/reviewsAndRecommendations';

export const ReviewsAndRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route-based perspective & tab determination
  const determineInitialState = () => {
    const p = location.pathname;
    if (p.includes('/operator/customer-satisfaction')) {
      return { perspective: 'operator' as ModulePerspective, operatorTab: 'customer-satisfaction' as OperatorTab, touristTab: 'reviews' as TouristTab };
    }
    if (p.includes('/operator/recommendation-insights')) {
      return { perspective: 'operator' as ModulePerspective, operatorTab: 'recommendation-insights' as OperatorTab, touristTab: 'reviews' as TouristTab };
    }
    if (p.includes('/operator')) {
      return { perspective: 'operator' as ModulePerspective, operatorTab: 'review-management' as OperatorTab, touristTab: 'reviews' as TouristTab };
    }
    if (p.includes('/reviews/my-reviews')) {
      return { perspective: 'tourist' as ModulePerspective, operatorTab: 'review-management' as OperatorTab, touristTab: 'my-reviews' as TouristTab };
    }
    if (p.includes('/recommendations')) {
      return { perspective: 'tourist' as ModulePerspective, operatorTab: 'review-management' as OperatorTab, touristTab: 'recommendations' as TouristTab };
    }
    return { perspective: 'tourist' as ModulePerspective, operatorTab: 'review-management' as OperatorTab, touristTab: 'reviews' as TouristTab };
  };

  const initial = determineInitialState();
  const [perspective, setPerspective] = useState<ModulePerspective>(initial.perspective);
  const [touristTab, setTouristTab] = useState<TouristTab>(initial.touristTab);
  const [operatorTab, setOperatorTab] = useState<OperatorTab>(initial.operatorTab);

  // Sync state when URL route changes
  useEffect(() => {
    const s = determineInitialState();
    setPerspective(s.perspective);
    setTouristTab(s.touristTab);
    setOperatorTab(s.operatorTab);
  }, [location.pathname]);

  // Data State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<CustomerSatisfactionAnalytics | null>(null);
  const [insights, setInsights] = useState<RecommendationInsightsData | null>(null);

  // Recommendations Filters
  const [recFilters, setRecFilters] = useState<RecommendationFilterState>({
    interests: ['All'],
    maxBudget: 100,
    maxDistance: 150,
    minRating: 0,
    activityType: 'All',
  });
  const [isUpdatingRecs, setIsUpdatingRecs] = useState(false);

  // Modals and UI overlays
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [viewingDetailsRec, setViewingDetailsRec] = useState<Recommendation | null>(null);
  const [viewingReviewDetails, setViewingReviewDetails] = useState<Review | null>(null);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Load initial data and subscribe to reviewService updates
  useEffect(() => {
    const loadData = async () => {
      const revList = await reviewService.getReviews();
      setReviews(revList);

      const recList = await recommendationService.getRecommendations(recFilters);
      setRecommendations(recList);

      const an = await analyticsService.getCustomerSatisfactionAnalytics();
      setAnalytics(an);

      const ins = await analyticsService.getRecommendationInsights();
      setInsights(ins);
    };

    loadData();

    const unsubscribe = reviewService.subscribe(async () => {
      const revList = await reviewService.getReviews();
      setReviews(revList);
    });

    return unsubscribe;
  }, []);

  // Filtered My Reviews (reviews submitted by current tourist)
  const myReviews = useMemo(() => {
    return reviews.filter((r) => r.isCurrentTourist === true);
  }, [reviews]);

  // Review stats from reviewService
  const reviewStats = useMemo(() => {
    return reviewService.getReviewStats();
  }, [reviews]);

  // Handle Tab Switch & URL Navigation
  const handlePerspectiveChange = (newPerspective: ModulePerspective) => {
    setPerspective(newPerspective);
    if (newPerspective === 'tourist') {
      navigate('/reviews');
    } else {
      navigate('/operator/reviews');
    }
  };

  const handleTouristTabChange = (tab: TouristTab) => {
    setTouristTab(tab);
    if (tab === 'reviews') navigate('/reviews');
    else if (tab === 'my-reviews') navigate('/reviews/my-reviews');
    else if (tab === 'recommendations') navigate('/recommendations');
  };

  const handleOperatorTabChange = (tab: OperatorTab) => {
    setOperatorTab(tab);
    if (tab === 'review-management') navigate('/operator/reviews');
    else if (tab === 'customer-satisfaction') navigate('/operator/customer-satisfaction');
    else if (tab === 'recommendation-insights') navigate('/operator/recommendation-insights');
  };

  // Handle Helpful Toggle
  const handleHelpfulToggle = async (id: string) => {
    try {
      const res = await reviewService.toggleHelpful(id);
      showToast(res.isHelpfulByUser ? 'Marked review as helpful! 👍' : 'Removed helpful vote.');
    } catch {
      showToast('Action could not be completed.');
    }
  };

  // Handle Submit or Update Review
  const handleReviewSubmit = async (formData: any) => {
    if (editingReview) {
      await reviewService.updateReview(editingReview.id, formData);
      setEditingReview(null);
      showToast('Review updated successfully.');
    } else {
      await reviewService.createReview(formData);
      showToast('Review submitted successfully.');
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (id: string) => {
    await reviewService.deleteReview(id);
    showToast('Review removed from your profile.');
  };

  // Handle Operator Approval
  const handleApproveReview = async (id: string) => {
    await reviewService.updateStatus(id, 'Published');
    showToast('Review approved.');
  };

  // Handle Operator Rejection
  const handleRejectReview = async (id: string, reason?: string) => {
    await reviewService.updateStatus(id, 'Rejected', reason);
    showToast('Review rejected.');
  };

  // Handle Recommendation Filter Update
  const handleUpdateRecommendations = async () => {
    setIsUpdatingRecs(true);
    setTimeout(async () => {
      const updated = recommendationService.recalculateSuitability({
        interests: recFilters.interests,
        distanceKm: recFilters.maxDistance,
        budgetTier: recFilters.maxBudget < 50 ? 'budget' : recFilters.maxBudget > 100 ? 'luxury' : 'moderate',
      });

      const filtered = updated.filter((r) => {
        const matchesType =
          recFilters.activityType === 'All' ||
          r.targetType.toLowerCase() === recFilters.activityType.toLowerCase();
        const matchesRating = r.rating >= recFilters.minRating;
        const matchesDistance = !r.distanceKm || r.distanceKm <= recFilters.maxDistance;
        return matchesType && matchesRating && matchesDistance;
      });

      setRecommendations(filtered);
      setIsUpdatingRecs(false);
      showToast('Recommendations updated.');
    }, 450);
  };

  // Actions for Recommendations
  const handleAddToTrip = (item: Recommendation) => {
    showToast(`Added "${item.name}" to your trip itinerary!`);
  };

  const handleBookNow = (item: Recommendation) => {
    navigate(`/payment?item=${encodeURIComponent(item.name)}&amount=${encodeURIComponent(item.price)}`);
  };

  const handleWriteReviewForAttraction = (item: Recommendation) => {
    setViewingDetailsRec(null);
    setIsWriteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-800 flex flex-col font-sans">
      {/* Top Main Navigation */}
      <LandingNavbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#16A6A1] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {activePhotoPreview && (
        <div
          onClick={() => setActivePhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20">
            <img src={activePhotoPreview} alt="Enlarged view" className="w-full h-full object-contain" />
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Full Review Modal for Operator */}
      {viewingReviewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={viewingReviewDetails.touristAvatar}
                  alt={viewingReviewDetails.touristName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900">{viewingReviewDetails.touristName}</h4>
                  <span className="text-xs text-slate-400">{viewingReviewDetails.touristCountry}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingReviewDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#0B3A53] bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                Target: {viewingReviewDetails.targetName} ({viewingReviewDetails.targetType})
              </div>
              <h3 className="text-base font-black text-slate-900 font-heading">
                {viewingReviewDetails.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                "{viewingReviewDetails.comment}"
              </p>
            </div>

            {viewingReviewDetails.photos && viewingReviewDetails.photos.length > 0 && (
              <div className="flex gap-2 pt-1">
                {viewingReviewDetails.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt="Upload"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              {viewingReviewDetails.status !== 'Published' && (
                <button
                  onClick={() => {
                    handleApproveReview(viewingReviewDetails.id);
                    setViewingReviewDetails(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  Approve Review
                </button>
              )}
              {viewingReviewDetails.status !== 'Rejected' && (
                <button
                  onClick={() => {
                    handleRejectReview(viewingReviewDetails.id, 'Declined upon detailed operator review');
                    setViewingReviewDetails(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
                >
                  Reject Review
                </button>
              )}
              <button
                onClick={() => setViewingReviewDetails(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO / HEADER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B3A53] via-[#0E4461] to-[#0B3A53] text-white pt-10 pb-14 px-4 sm:px-8 border-b border-white/10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#16A6A1]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Breadcrumb & Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
                Home
              </button>
              <span>/</span>
              <span className="text-[#16A6A1]">Reviews & Recommendations</span>
              <span>/</span>
              <span className="text-white capitalize">{perspective} View</span>
            </div>

            {perspective === 'tourist' && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsWriteModalOpen(true);
                }}
                className="bg-[#16A6A1] hover:bg-[#138D89] text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            )}
          </div>

          {/* Title & Subtitle from prompt */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-black text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Tourism Sentiment & AI Suitability Matching</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Reviews & Recommendations
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              Discover what other travelers think and find places recommended for you.
            </p>
          </div>
        </div>
      </section>

      {/* ROLE PERSPECTIVE & SUB-NAVIGATION BAR */}
      <RolePerspectiveBar
        perspective={perspective}
        onPerspectiveChange={handlePerspectiveChange}
        touristTab={touristTab}
        onTouristTabChange={handleTouristTabChange}
        operatorTab={operatorTab}
        onOperatorTabChange={handleOperatorTabChange}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* =========================================================================
            PERSPECTIVE A: TOURIST PERSPECTIVE
            ========================================================================= */}
        {perspective === 'tourist' && (
          <>
            {/* SUB-TAB 1: REVIEWS PAGE */}
            {touristTab === 'reviews' && (
              <div className="space-y-6">
                <ReviewList
                  reviews={reviews}
                  onHelpfulToggle={handleHelpfulToggle}
                  onWriteReviewClick={() => {
                    setEditingReview(null);
                    setIsWriteModalOpen(true);
                  }}
                  onPhotoClick={(url) => setActivePhotoPreview(url)}
                />
              </div>
            )}

            {/* SUB-TAB 2: MY REVIEWS */}
            {touristTab === 'my-reviews' && (
              <MyReviewsSection
                myReviews={myReviews}
                onEditReview={(rev) => {
                  setEditingReview(rev);
                  setIsWriteModalOpen(true);
                }}
                onDeleteReview={handleDeleteReview}
                onWriteNewClick={() => {
                  setEditingReview(null);
                  setIsWriteModalOpen(true);
                }}
                onHelpfulToggle={handleHelpfulToggle}
              />
            )}

            {/* SUB-TAB 3: RECOMMENDATIONS ("Recommended For You") */}
            {touristTab === 'recommendations' && (
              <div className="space-y-8">
                {/* Recommendation Filters Panel */}
                <RecommendationFilters
                  filters={recFilters}
                  onFilterChange={setRecFilters}
                  onUpdateClick={handleUpdateRecommendations}
                  isUpdating={isUpdatingRecs}
                />

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#16A6A1] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Curated Just For You</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading">
                      Recommended For You
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Calculated from historical reviews, category preferences, and budget affinities
                    </p>
                  </div>

                  <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200">
                    Showing <strong className="text-slate-900">{recommendations.length}</strong> top matches
                  </span>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onViewDetails={(item) => setViewingDetailsRec(item)}
                      onAddToTrip={handleAddToTrip}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            PERSPECTIVE B: TOUR OPERATOR / ADMINISTRATOR PERSPECTIVE
            ========================================================================= */}
        {perspective === 'operator' && (
          <>
            {/* SUB-TAB 1: REVIEW MANAGEMENT */}
            {operatorTab === 'review-management' && (
              <div className="space-y-8">
                {/* Summary Cards from Section 9 */}
                <ReviewStats
                  totalReviews={reviewStats.totalReviews}
                  averageRating={reviewStats.averageRating}
                  positivePercentage={reviewStats.positivePercentage}
                  negativeCount={reviewStats.negativeCount}
                  pendingCount={reviewStats.pendingCount}
                />

                {/* Review Management Table from Section 11 */}
                <ReviewManagementTable
                  reviews={reviews}
                  onApprove={handleApproveReview}
                  onReject={handleRejectReview}
                  onView={(rev) => setViewingReviewDetails(rev)}
                />
              </div>
            )}

            {/* SUB-TAB 2: CUSTOMER SATISFACTION ANALYTICS */}
            {operatorTab === 'customer-satisfaction' && analytics && (
              <div className="space-y-8">
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
                  {/* Rating Distribution (5★ to 1★ breakdown) */}
                  <RatingDistribution
                    distribution={analytics.ratingDistribution}
                    averageRating={analytics.averageRating}
                    totalCount={analytics.totalReviews}
                  />

                  {/* Monthly Satisfaction Trend (Recharts Area Chart) */}
                  <SatisfactionChart data={analytics.satisfactionTrend} />
                </div>

                {/* Popular Attractions Table */}
                <PopularAttractions attractions={analytics.popularAttractions} />
              </div>
            )}

            {/* SUB-TAB 3: RECOMMENDATION INSIGHTS */}
            {operatorTab === 'recommendation-insights' && insights && (
              <div className="space-y-8">
                <RecommendationInsights insights={insights} />
              </div>
            )}
          </>
        )}
      </main>

      {/* WRITE / EDIT REVIEW MODAL */}
      <ReviewForm
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleReviewSubmit}
        initialData={editingReview}
      />

      {/* ATTRACTION DETAILS MODAL */}
      <AttractionDetailsModal
        recommendation={viewingDetailsRec}
        onClose={() => setViewingDetailsRec(null)}
        onAddToTrip={handleAddToTrip}
        onBookNow={handleBookNow}
        onWriteReview={handleWriteReviewForAttraction}
        recentReviews={reviews}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
