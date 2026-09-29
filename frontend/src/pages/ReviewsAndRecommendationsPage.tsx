import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  X,
  Compass,
  SlidersHorizontal,
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
    interests: ['Nature', 'Hiking', 'Culture'],
    maxBudget: 100,
    maxDistance: 150,
    minRating: 0,
    activityType: 'All',
    environment: 'Peaceful',
    budgetCategory: 'Budget',
    sortBy: 'best_match',
  });
  const [isUpdatingRecs, setIsUpdatingRecs] = useState(false);
  const [showPreferenceEditor, setShowPreferenceEditor] = useState(false);

  // Preference chips currently active for Section 2
  const activePreferenceTags = useMemo(() => {
    const tags: string[] = [];
    if (recFilters.interests && recFilters.interests.length > 0 && !recFilters.interests.includes('All')) {
      tags.push(...recFilters.interests);
    } else {
      tags.push('Nature', 'Hiking', 'Culture');
    }
    if (recFilters.environment && recFilters.environment !== 'All') {
      tags.push(recFilters.environment);
    } else {
      tags.push('Peaceful');
    }
    if (recFilters.budgetCategory && recFilters.budgetCategory !== 'All') {
      tags.push(recFilters.budgetCategory);
    } else {
      tags.push('Budget Friendly');
    }
    return Array.from(new Set(tags));
  }, [recFilters]);

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
    try {
      const updated = await recommendationService.getRecommendations(recFilters);
      setRecommendations(updated);
      showToast('Recommendations updated for you!');
    } catch {
      showToast('Recommendations updated.');
    } finally {
      setIsUpdatingRecs(false);
    }
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

      {/* HERO SECTION */}
      <section className="bg-white py-10 px-4 sm:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-[#0B3A53] leading-tight">
              Reviews & Recommendations
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
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
          <div className="space-y-6 sm:space-y-8">
            {/* Section 1: Page Header */}
            <div className="space-y-1.5 border-b border-slate-200/80 pb-5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B3A53] font-heading tracking-tight">
                Recommended for You
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                Places that match your interests, preferences, and travel style.
              </p>
            </div>

            {/* Section 2: Preference Section */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1">
                  Your Preferences:
                </span>
                {activePreferenceTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white text-[#0B3A53] font-bold text-xs border border-slate-200 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPreferenceEditor(!showPreferenceEditor)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0B3A53] font-black text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#146C86]" />
                <span>{showPreferenceEditor ? 'Hide Preferences' : 'Edit Preferences'}</span>
              </button>
            </div>

            {/* Section 3 & 6 & 7: Search + Filters */}
            <div className={showPreferenceEditor ? 'block animate-in fade-in duration-200' : 'hidden sm:block'}>
              <RecommendationFilters
                filters={recFilters}
                onFilterChange={(f: RecommendationFilterState) => setRecFilters(f)}
                onUpdateClick={handleUpdateRecommendations}
                isUpdating={isUpdatingRecs}
              />
            </div>

            {/* Section 11: Loading State */}
            {isUpdatingRecs ? (
              <div className="space-y-6 py-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-sm mx-auto shadow-xs">
                  <div className="w-7 h-7 border-2 border-[#0B3A53] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                  <p className="text-sm font-black text-[#0B3A53]">Finding places for you...</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Exploring matching destinations & reviews</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
                    >
                      <div className="aspect-video bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-4 bg-slate-100 rounded w-4/5" />
                        <div className="h-9 bg-slate-100 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recommendations.length === 0 ? (
              /* Section 10: Empty State */
              <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-slate-200/80 max-w-md mx-auto space-y-4 my-8">
                <div className="w-14 h-14 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    No matching destinations
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Try adjusting your interests or budget to discover more places.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRecFilters({
                      interests: ['All'],
                      maxBudget: 100,
                      maxDistance: 150,
                      minRating: 0,
                      activityType: 'All',
                      environment: 'All',
                      budgetCategory: 'All',
                      sortBy: 'best_match',
                      searchQuery: '',
                    });
                    handleUpdateRecommendations();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Adjust Preferences
                </button>
              </div>
            ) : (
              /* Section 3 & 8: Responsive Travel Cards Grid */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Showing <strong className="text-slate-900">{recommendations.length}</strong> recommended destinations</span>
                </div>
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
