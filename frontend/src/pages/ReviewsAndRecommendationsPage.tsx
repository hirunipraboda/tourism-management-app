import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  X,
  RefreshCcw,
  AlertCircle,
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
import { AddToTripModal } from '../components/reviews/AddToTripModal';
import { AiChatPanel } from '../components/recommendations/AiChatPanel';
import { PopularSection } from '../components/recommendations/PopularSection';
import { SkeletonRecommendationCard } from '../components/recommendations/SkeletonRecommendationCard';
import { reviewService } from '../services/reviewService';
import { recommendationService, debounce } from '../services/recommendationService';
import {
  Review,
  Recommendation,
  RecommendationFilterState,
  RecommendationInsightsData,
  SuitabilityBreakdown,
  TouristTab,
  AgentRecommendation,
} from '../types/reviewsAndRecommendations';

export const ReviewsAndRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route-based tab determination
  const determineInitialState = (): TouristTab => {
    const p = location.pathname;
    if (p.includes('/reviews/my-reviews')) return 'my-reviews';
    if (p.includes('/recommendations')) return 'recommendations';
    return 'reviews';
  };

  const [touristTab, setTouristTab] = useState<TouristTab>(determineInitialState());

  useEffect(() => {
    setTouristTab(determineInitialState());
  }, [location.pathname]);

  // ── Data State ─────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [popularItems, setPopularItems] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<RecommendationInsightsData | null>(null);
  const [suitabilityBreakdown, setSuitabilityBreakdown] = useState<SuitabilityBreakdown | null>(null);

  // ── Loading & Error State ──────────────────────────────────────────────────
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [isUpdatingRecs, setIsUpdatingRecs] = useState(false);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [recFilters, setRecFilters] = useState<RecommendationFilterState>({
    interests: ['All'],
    maxBudget: 100,
    maxDistance: 200,
    minRating: 0,
    activityType: 'All',
  });

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [viewingDetailsRec, setViewingDetailsRec] = useState<Recommendation | null>(null);
  const [addToTripRec, setAddToTripRec] = useState<Recommendation | null>(null);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<{ text: string; actionLabel?: string; actionHref?: string } | null>(null);
  const showToast = (msg: string, actionLabel?: string, actionHref?: string) => {
    setToastMessage({ text: msg, actionLabel, actionHref });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ── Fetch Personalized Recommendations ────────────────────────────────────
  const fetchPersonalized = useCallback(async (filters: RecommendationFilterState) => {
    setIsLoadingRecs(true);
    setRecError(null);
    try {
      const result = await recommendationService.getPersonalized(filters);
      setRecommendations(result);
    } catch (err: any) {
      setRecError('Could not load recommendations. Please try again.');
    } finally {
      setIsLoadingRecs(false);
    }
  }, []);

  // Debounced version for slider changes (300ms)
  const debouncedFetch = useRef(
    debounce((filters: RecommendationFilterState) => fetchPersonalized(filters), 300)
  ).current;

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      // Load reviews
      const revList = await reviewService.getReviews();
      setReviews(revList);
      const myRevList = await reviewService.getMyReviews();
      setMyReviews(myRevList.map((review) => ({ ...review, isCurrentTourist: true })));
    };
    loadData();

    const unsubscribe = reviewService.subscribe(async () => {
      const revList = await reviewService.getReviews();
      setReviews(revList);
      const myRevList = await reviewService.getMyReviews();
      setMyReviews(myRevList.map((review) => ({ ...review, isCurrentTourist: true })));
    });

    return unsubscribe;
  }, []);

  // Load recommendations + popular + insights when recommendations tab is opened
  useEffect(() => {
    if (touristTab !== 'recommendations') return;

    fetchPersonalized(recFilters);

    // Popular section
    setIsLoadingPopular(true);
    recommendationService.getPopular(6)
      .then(setPopularItems)
      .finally(() => setIsLoadingPopular(false));

    // Insights
    recommendationService.getInsights().then((data) => {
      if (data) setInsights(data);
    });
  }, [touristTab]);

  // Listen for admin-added recommendations event
  useEffect(() => {
    const handleRecsUpdated = () => {
      fetchPersonalized(recFilters);
      recommendationService.getPopular(6).then(setPopularItems);
    };
    window.addEventListener('recommendations:updated', handleRecsUpdated);
    return () => window.removeEventListener('recommendations:updated', handleRecsUpdated);
  }, [fetchPersonalized, recFilters]);

  const handleTouristTabChange = (tab: TouristTab) => {
    setTouristTab(tab);
    if (tab === 'reviews') navigate('/reviews');
    else if (tab === 'my-reviews') navigate('/reviews/my-reviews');
    else if (tab === 'recommendations') navigate('/recommendations');
  };

  // ── Recommendation Filter Update ──────────────────────────────────────────
  const handleUpdateRecommendations = async () => {
    setIsUpdatingRecs(true);
    try {
      await fetchPersonalized(recFilters);
      showToast('Recommendations updated based on your preferences.');
    } finally {
      setIsUpdatingRecs(false);
    }
  };

  const handleFilterChange = (f: RecommendationFilterState) => {
    setRecFilters(f);
    // Debounced re-fetch on filter change
    debouncedFetch(f);
  };

  // ── "Why this?" suitability modal ─────────────────────────────────────────
  const handleWhyThis = async (item: Recommendation) => {
    setSuitabilityBreakdown(null);
    setViewingDetailsRec(item);
    const breakdown = await recommendationService.getSuitability(item.id, recFilters);
    if (breakdown) setSuitabilityBreakdown(breakdown);
  };

  // ── Other Handlers ─────────────────────────────────────────────────────────
  const handleHelpfulToggle = async (id: string) => {
    const targetRev = reviews.find((r) => r.id === id) || myReviews.find((r) => r.id === id);
    const nextIsHelpful = !(targetRev?.isHelpfulByUser ?? false);
    const delta = nextIsHelpful ? 1 : -1;
    const nextCount = Math.max(0, (targetRev?.helpfulCount ?? 0) + delta);

    // Optimistically update both lists immediately
    setReviews((current) =>
      current.map((review) =>
        review.id === id
          ? { ...review, helpfulCount: nextCount, isHelpfulByUser: nextIsHelpful }
          : review
      )
    );
    setMyReviews((current) =>
      current.map((review) =>
        review.id === id
          ? { ...review, helpfulCount: nextCount, isHelpfulByUser: nextIsHelpful }
          : review
      )
    );

    try {
      const res = await reviewService.toggleHelpful(id);
      if (res && typeof res.helpfulCount === 'number') {
        setReviews((current) =>
          current.map((review) =>
            review.id === id
              ? { ...review, helpfulCount: res.helpfulCount, isHelpfulByUser: res.isHelpfulByUser }
              : review
          )
        );
        setMyReviews((current) =>
          current.map((review) =>
            review.id === id
              ? { ...review, helpfulCount: res.helpfulCount, isHelpfulByUser: res.isHelpfulByUser }
              : review
          )
        );
      }
      showToast(nextIsHelpful ? 'Marked review as helpful! 👍' : 'Removed helpful vote.');
    } catch {
      showToast(nextIsHelpful ? 'Marked review as helpful! 👍' : 'Removed helpful vote.');
    }
  };

  const handleReviewSubmit = async (formData: any) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, formData);
        setEditingReview(null);
        showToast('Review updated successfully.');
      } else {
        await reviewService.createReview(formData);
        showToast('Review submitted successfully.');
      }
      setIsWriteModalOpen(false);
    } catch {
      showToast('Review could not be saved. Check that the selected place exists in the database.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    // Immediately remove from local UI state
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setMyReviews((prev) => prev.filter((r) => r.id !== id));
    
    try {
      const deleted = await reviewService.deleteReview(id);
      showToast(deleted ? 'Review removed from your profile.' : 'Review could not be deleted.');
    } catch {
      showToast('Review removed from your profile.');
    }
  };

  const handleAddToTrip = (item: Recommendation) => {
    setViewingDetailsRec(null);
    setAddToTripRec(item);
  };

  const handleTripAddSuccess = (tripName: string, dayNumber: number, activityTitle: string, tripId: string) => {
    showToast(
      `Added "${activityTitle}" to Day ${dayNumber} of "${tripName}"!`,
      'View Itinerary →',
      `/trips?tripId=${encodeURIComponent(tripId)}`
    );
  };

  const handleBookNow = (item: Recommendation) => {
    navigate(`/payment?item=${encodeURIComponent(item.name)}&amount=${encodeURIComponent(item.price)}`);
  };

  const handleWriteReviewForAttraction = (_item: Recommendation) => {
    setViewingDetailsRec(null);
    setIsWriteModalOpen(true);
  };

  // Agent recommendation → find in our list or open details of closest match
  const handleAgentRecommendationSelect = (rec: AgentRecommendation) => {
    const found = recommendations.find((r) => r.id === String(rec.attractionId));
    if (found) {
      setViewingDetailsRec(found);
    } else {
      // Build a minimal Recommendation from agent data and open modal
      const minimal: Recommendation = {
        id: String(rec.attractionId),
        name: rec.name,
        location: rec.location,
        category: rec.category,
        targetType: 'attraction',
        rating: rec.avgRating,
        reviewCount: rec.reviewCount,
        price: rec.estimatedCost > 0 ? `~Rs. ${(rec.estimatedCost * 300).toLocaleString()} ($${rec.estimatedCost})` : 'Free entry',
        estimatedCost: rec.estimatedCost,
        matchReasons: [rec.reason],
        suitabilityScore: rec.matchScore,
        interestMatch: rec.matchScore,
        ratingMatch: rec.avgRating * 20,
        budgetMatch: 70,
        locationMatch: 60,
        popularityScore: 60,
        explanation: rec.reason,
        image: rec.imageUrl ||
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
      };
      setViewingDetailsRec(minimal);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-800 flex flex-col font-sans">
      <LandingNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3A53] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#16A6A1] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
          {toastMessage.actionHref && (
            <button
              onClick={() => navigate(toastMessage.actionHref!)}
              className="ml-2 px-3 py-1 rounded-full bg-[#16A6A1] hover:bg-[#138D89] text-white text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              {toastMessage.actionLabel || 'View →'}
            </button>
          )}
        </div>
      )}

      {/* Photo Lightbox */}
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

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#0B3A53] via-[#146C86] to-[#0B3A53] text-white py-12 px-4 sm:px-8 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#16A6A1]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-300 text-xs font-black uppercase tracking-wider border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
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

      <RolePerspectiveBar
        touristTab={touristTab}
        onTouristTabChange={handleTouristTabChange}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* ── TAB 1: REVIEWS ─────────────────────────────────────────────────── */}
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

        {/* ── TAB 2: MY REVIEWS ─────────────────────────────────────────────── */}
        {touristTab === 'my-reviews' && (
          <div className="space-y-6">
            <MyReviewsSection
              myReviews={myReviews}
              onWriteNewClick={() => {
                setEditingReview(null);
                setIsWriteModalOpen(true);
              }}
              onEditReview={(rev) => {
                setEditingReview(rev);
                setIsWriteModalOpen(true);
              }}
              onDeleteReview={handleDeleteReview}
              onHelpfulToggle={handleHelpfulToggle}
            />
          </div>
        )}

        {/* ── TAB 3: RECOMMENDATIONS ────────────────────────────────────────── */}
        {touristTab === 'recommendations' && (
          <div className="space-y-8">
            {/* AI Chat Panel */}
            <AiChatPanel
              filters={recFilters}
              onRecommendationSelect={handleAgentRecommendationSelect}
            />

            {/* Filter Bar */}
            <RecommendationFilters
              filters={recFilters}
              onFilterChange={handleFilterChange}
              onUpdateClick={handleUpdateRecommendations}
              isUpdating={isUpdatingRecs}
            />

            {/* Popular Section */}
            {(isLoadingPopular || popularItems.length > 0) && (
              <PopularSection
                items={popularItems}
                onSelect={(item) => setViewingDetailsRec(item)}
                loading={isLoadingPopular}
              />
            )}

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B3A53] font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Personalized Destination Matches</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Showing top {recommendations.length} places curated for you based on interest match, ratings, budget, distance & review history
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200">
                Showing <strong className="text-slate-900">{recommendations.length}</strong> top matches
              </span>
            </div>

            {/* Error state */}
            {recError && !isLoadingRecs && (
              <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-none" />
                <span className="text-sm text-red-700">{recError}</span>
                <button
                  onClick={() => fetchPersonalized(recFilters)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {/* Skeleton loading grid */}
            {isLoadingRecs && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRecommendationCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoadingRecs && !recError && recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                  🗺️
                </div>
                <h3 className="text-lg font-bold text-slate-700">No matches found</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Try widening your filters — increase the budget or distance, or select more interests.
                </p>
                <button
                  onClick={() => {
                    const relaxed: RecommendationFilterState = {
                      interests: ['All'],
                      maxBudget: 200,
                      maxDistance: 400,
                      minRating: 0,
                      activityType: 'All',
                    };
                    setRecFilters(relaxed);
                    fetchPersonalized(relaxed);
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full border border-teal-200 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset filters
                </button>
              </div>
            )}

            {/* Recommendations Grid */}
            {!isLoadingRecs && !recError && recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onViewDetails={(item) => setViewingDetailsRec(item)}
                    onAddToTrip={handleAddToTrip}
                    onWhyThis={handleWhyThis}
                  />
                ))}
              </div>
            )}
          </div>
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
        onClose={() => {
          setViewingDetailsRec(null);
          setSuitabilityBreakdown(null);
        }}
        onAddToTrip={handleAddToTrip}
        onBookNow={handleBookNow}
        onWriteReview={handleWriteReviewForAttraction}
        recentReviews={reviews}
        suitabilityBreakdown={suitabilityBreakdown}
      />

      {/* ADD TO TRIP ITINERARY MODAL */}
      <AddToTripModal
        isOpen={!!addToTripRec}
        onClose={() => setAddToTripRec(null)}
        recommendation={addToTripRec}
        onSuccess={handleTripAddSuccess}
      />

      <Footer />
    </div>
  );
};
