import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
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
import { reviewService } from '../services/reviewService';
import { recommendationService } from '../services/recommendationService';
import {
  Review,
  Recommendation,
  RecommendationFilterState,
  TouristTab,
} from '../types/reviewsAndRecommendations';

export const ReviewsAndRecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route-based tab determination
  const determineInitialState = (): TouristTab => {
    const p = location.pathname;
    if (p.includes('/reviews/my-reviews')) {
      return 'my-reviews';
    }
    if (p.includes('/recommendations')) {
      return 'recommendations';
    }
    return 'reviews';
  };

  const [touristTab, setTouristTab] = useState<TouristTab>(determineInitialState());

  // Sync state when URL route changes
  useEffect(() => {
    setTouristTab(determineInitialState());
  }, [location.pathname]);

  // Data State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

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

  const handleTouristTabChange = (tab: TouristTab) => {
    setTouristTab(tab);
    if (tab === 'reviews') navigate('/reviews');
    else if (tab === 'my-reviews') navigate('/reviews/my-reviews');
    else if (tab === 'recommendations') navigate('/recommendations');
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

  const handleWriteReviewForAttraction = (_item: Recommendation) => {
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

      {/* HERO BANNER SECTION */}
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

      {/* SUB-NAVIGATION BAR (No perspective switch, clean user view) */}
      <RolePerspectiveBar
        touristTab={touristTab}
        onTouristTabChange={handleTouristTabChange}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
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

        {/* SUB-TAB 2: MY REVIEWS PAGE */}
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

        {/* SUB-TAB 3: RECOMMENDATIONS PAGE */}
        {touristTab === 'recommendations' && (
          <div className="space-y-8">
            {/* Filter Bar with AI Suitability Tuning */}
            <RecommendationFilters
              filters={recFilters}
              onFilterChange={(f: RecommendationFilterState) => setRecFilters(f)}
              onUpdateClick={handleUpdateRecommendations}
              isUpdating={isUpdatingRecs}
            />

            {/* Section Header with count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B3A53] font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Personalized Destination Matches</span>
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
