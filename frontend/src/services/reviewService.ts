import { Review, ReviewStatus } from '../types/reviewsAndRecommendations';
import { INITIAL_MOCK_REVIEWS } from '../mock/mockReviews';

const STORAGE_KEY = 'travelwise_mock_reviews';

class ReviewService {
  private reviews: Review[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.reviews = JSON.parse(stored);
      } else {
        this.reviews = [...INITIAL_MOCK_REVIEWS];
        this.save();
      }
    } catch {
      this.reviews = [...INITIAL_MOCK_REVIEWS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Failed to persist reviews to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * GET /api/reviews
   * Retrieve reviews with filtering, search, and sorting
   */
  async getReviews(params?: {
    targetType?: string;
    targetName?: string;
    minRating?: number;
    status?: ReviewStatus | 'All';
    searchQuery?: string;
    sortBy?: 'newest' | 'highest' | 'helpful';
  }): Promise<Review[]> {
    let result = [...this.reviews];

    if (params?.status && params.status !== 'All') {
      result = result.filter((r) => r.status === params.status);
    }

    if (params?.targetType && params.targetType !== 'All') {
      const targetTypeLower = params.targetType.toLowerCase();
      result = result.filter((r) => r.targetType === targetTypeLower);
    }

    if (params?.targetName && params.targetName !== 'All') {
      result = result.filter((r) =>
        r.targetName.toLowerCase().includes(params.targetName!.toLowerCase())
      );
    }

    if (params?.minRating && params.minRating > 0) {
      result = result.filter((r) => r.rating >= params.minRating!);
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.targetName.toLowerCase().includes(q) ||
          r.touristName.toLowerCase().includes(q) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (params?.sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (params?.sortBy === 'helpful') {
      result.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else {
      // Default: newest
      // Since date is mock strings, we preserve array insertion order (newest first)
    }

    return result;
  }

  /**
   * GET /api/reviews/my-reviews
   * Retrieve reviews submitted by the current tourist
   */
  async getMyReviews(): Promise<Review[]> {
    return this.reviews.filter((r) => r.isCurrentTourist === true);
  }

  /**
   * GET /api/reviews/:id
   */
  async getReviewById(id: string): Promise<Review | undefined> {
    return this.reviews.find((r) => r.id === id);
  }

  /**
   * POST /api/reviews
   * Submit a new review
   */
  async createReview(data: {
    touristName: string;
    touristAvatar?: string;
    touristCountry?: string;
    travelerType?: 'Solo' | 'Couple' | 'Family' | 'Friends';
    targetType: 'destination' | 'attraction' | 'tour';
    targetId: string;
    targetName: string;
    rating: number;
    title: string;
    comment: string;
    photos?: string[];
    tags?: string[];
  }): Promise<Review> {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      touristName: data.touristName.trim() || 'Sarah Jenkins',
      touristAvatar:
        data.touristAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      touristCountry: data.touristCountry || 'United Kingdom',
      travelerType: data.travelerType || 'Solo',
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      rating: Math.max(1, Math.min(5, data.rating)),
      title: data.title.trim(),
      comment: data.comment.trim(),
      date: 'Just now',
      helpfulCount: 0,
      isHelpfulByUser: false,
      status: 'Published', // Defaults to Published for instant gratification
      photos: data.photos || [],
      tags: data.tags || ['Verified Travel', 'Community Feedback'],
      highlightRating: {
        experience: data.rating,
        value: Number((data.rating * 0.95).toFixed(1)),
        safety: 5.0,
        hospitality: 5.0,
      },
      isCurrentTourist: true,
    };

    this.reviews = [newReview, ...this.reviews];
    this.save();
    return newReview;
  }

  /**
   * PUT /api/reviews/:id
   * Edit review
   */
  async updateReview(
    id: string,
    updates: Partial<Pick<Review, 'rating' | 'title' | 'comment' | 'photos' | 'tags' | 'targetName' | 'targetType'>>
  ): Promise<Review> {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    const updated = {
      ...this.reviews[idx],
      ...updates,
      date: 'Edited just now',
    };

    this.reviews[idx] = updated;
    this.save();
    return updated;
  }

  /**
   * DELETE /api/reviews/:id
   */
  async deleteReview(id: string): Promise<boolean> {
    const initialLen = this.reviews.length;
    this.reviews = this.reviews.filter((r) => r.id !== id);
    if (this.reviews.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * POST /api/reviews/:id/helpful
   * Toggle helpful vote
   */
  async toggleHelpful(id: string): Promise<{ helpfulCount: number; isHelpfulByUser: boolean }> {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    const rev = this.reviews[idx];
    const isHelpful = !rev.isHelpfulByUser;
    const count = isHelpful ? rev.helpfulCount + 1 : Math.max(0, rev.helpfulCount - 1);

    this.reviews[idx] = {
      ...rev,
      isHelpfulByUser: isHelpful,
      helpfulCount: count,
    };

    this.save();
    return { helpfulCount: count, isHelpfulByUser: isHelpful };
  }

  /**
   * POST /api/reviews/:id/status
   * Approve or reject review
   */
  async updateStatus(id: string, status: ReviewStatus, operatorNotes?: string): Promise<Review> {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Review not found');

    const updated = {
      ...this.reviews[idx],
      status,
      operatorNotes: operatorNotes || this.reviews[idx].operatorNotes,
    };

    this.reviews[idx] = updated;
    this.save();
    return updated;
  }

  /**
   * GET summary metrics for review stats
   */
  getReviewStats() {
    const total = this.reviews.length;
    const published = this.reviews.filter((r) => r.status === 'Published');
    const pending = this.reviews.filter((r) => r.status === 'Pending Review');
    const rejected = this.reviews.filter((r) => r.status === 'Rejected');

    const avg =
      published.length > 0
        ? published.reduce((acc, r) => acc + r.rating, 0) / published.length
        : 4.8;

    const positive = published.filter((r) => r.rating >= 4).length;
    const positivePercentage = published.length > 0 ? Math.round((positive / published.length) * 100) : 90;

    return {
      totalReviews: 12480 + total,
      averageRating: Number(avg.toFixed(1)),
      positivePercentage,
      pendingCount: 128 + pending.length,
      negativeCount: 384 + rejected.length,
    };
  }

  /**
   * Reset reviews back to initial seed data
   */
  resetToInitial() {
    this.reviews = [...INITIAL_MOCK_REVIEWS];
    this.save();
  }
}

export const reviewService = new ReviewService();
