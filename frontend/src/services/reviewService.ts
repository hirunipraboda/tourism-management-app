import { Review, ReviewStatus } from '../types/reviewsAndRecommendations';
import { fetchApi } from './api';

// ─── Backend DTO → Frontend Review mapper ────────────────────────────────────
function mapBackendReview(r: any): Review {
  const rawTargetType = String(r.entityType ?? r.targetType ?? 'Attraction').toLowerCase();
  const targetType = rawTargetType === 'tourpackage' || rawTargetType === 'tour'
    ? 'tour'
    : rawTargetType === 'destination'
      ? 'destination'
      : 'attraction';

  let rawTitle = typeof r.title === 'string' ? r.title.trim() : '';
  let rawComment = typeof r.comment === 'string' ? r.comment.trim() : '';

  // If no title was given, or if comment had title concatenated like "Title: Comment"
  if (!rawTitle && rawComment.includes(': ')) {
    const parts = rawComment.split(': ');
    rawTitle = parts[0].trim();
    rawComment = parts.slice(1).join(': ').trim();
  } else if (!rawTitle) {
    rawTitle = rawComment.length > 50 ? rawComment.slice(0, 50) + '...' : rawComment;
  }

  // If comment still redundantly starts with the title prefix, strip it so title and details are distinct
  while (rawTitle && rawComment.toLowerCase().startsWith(rawTitle.toLowerCase() + ':')) {
    rawComment = rawComment.slice(rawTitle.length + 1).trim();
  }

  return {
    id: String(r.id),
    touristName: r.touristName ?? 'Tourist',
    touristAvatar:
      r.touristAvatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    touristCountry: r.touristCountry ?? 'Unknown',
    travelerType: r.travelerType ?? 'Solo',
    targetType,
    targetId: String(r.entityId ?? ''),
    targetName: r.entityName ?? r.targetName ?? '',
    rating: r.rating ?? 0,
    title: rawTitle,
    comment: rawComment,
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
    sortDate: r.createdAt,
    helpfulCount: r.helpfulCount ?? 0,
    isHelpfulByUser: false,
    status: (r.status ?? 'Published') as ReviewStatus,
    photos: r.photos ?? [],
    tags: r.tags ?? [],
    highlightRating: r.highlightRating ?? {
      experience: r.rating,
      value: r.rating,
      safety: 5.0,
      hospitality: 5.0,
    },
    isCurrentTourist: r.isCurrentTourist ?? false,
    operatorNotes: r.operatorNotes,
  };
}

// ─── Lightweight in-memory observer (for UI reactivity) ──────────────────────
type Listener = () => void;
const listeners: Listener[] = [];
function notify() {
  listeners.forEach((l) => l());
}

class ReviewService {
  public subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  /**
   * GET /api/reviews  (generic list – falls back to all reviews from backend)
   */
  async getReviews(params?: {
    targetType?: string;
    targetName?: string;
    minRating?: number;
    status?: ReviewStatus | 'All';
    searchQuery?: string;
    sortBy?: 'newest' | 'highest' | 'helpful';
  }): Promise<Review[]> {
    try {
      const qs = new URLSearchParams();
      if (params?.targetType && params.targetType !== 'All') qs.set('entityType', params.targetType);
      if (params?.minRating && params.minRating > 0) qs.set('minRating', String(params.minRating));
      if (params?.searchQuery?.trim()) qs.set('search', params.searchQuery.trim());

      const endpoint = `/reviews${qs.toString() ? '?' + qs.toString() : ''}`;
      const res = await fetchApi<any[]>(endpoint);
      let result = (res.data ?? []).map(mapBackendReview);

      // Client-side extra filters not yet supported in backend query
      if (params?.status && params.status !== 'All') {
        result = result.filter((r) => r.status === params.status);
      }
      if (params?.targetName && params.targetName !== 'All') {
        result = result.filter((r) =>
          r.targetName.toLowerCase().includes(params.targetName!.toLowerCase())
        );
      }
      if (params?.sortBy === 'highest') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (params?.sortBy === 'helpful') {
        result.sort((a, b) => b.helpfulCount - a.helpfulCount);
      }

      return result;
    } catch (err) {
      console.warn('[ReviewService] getReviews failed', err);
      return [];
    }
  }

  /** GET /api/reviews/my-reviews */
  async getMyReviews(): Promise<Review[]> {
    try {
      const res = await fetchApi<any[]>('/reviews/my-reviews');
      return (res.data ?? []).map(mapBackendReview);
    } catch {
      return [];
    }
  }

  /** GET /api/reviews/:id */
  async getReviewById(id: string): Promise<Review | undefined> {
    try {
      const res = await fetchApi<any>(`/reviews/${id}`);
      return res.data ? mapBackendReview(res.data) : undefined;
    } catch {
      return undefined;
    }
  }

  /** POST /api/reviews */
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
    const payload = {
      entityId: Number(data.targetId) || 0,
      entityName: data.targetName,
      entityType:
        data.targetType === 'tour'
          ? 'TourPackage'
          : data.targetType.charAt(0).toUpperCase() + data.targetType.slice(1),
      rating: Math.max(1, Math.min(5, data.rating)),
      title: data.title.trim(),
      comment: data.comment.trim(),
    };

    const res = await fetchApi<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const created = mapBackendReview({ ...res.data, touristName: data.touristName, isCurrentTourist: true });
    notify();
    return created;
  }

  /** PUT /api/reviews/:id */
  async updateReview(
    id: string,
    updates: Partial<Pick<Review, 'rating' | 'title' | 'comment' | 'photos' | 'tags' | 'targetName' | 'targetType'>>
  ): Promise<Review> {
    const payload: any = {};
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.comment !== undefined) payload.comment = updates.comment.trim();

    const res = await fetchApi<any>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const updated = mapBackendReview(res.data);
    notify();
    return updated;
  }

  /** DELETE /api/reviews/:id */
  async deleteReview(id: string): Promise<boolean> {
    try {
      await fetchApi<void>(`/reviews/${id}`, { method: 'DELETE' });
      notify();
      return true;
    } catch (err) {
      console.warn('[ReviewService] deleteReview backend request failed or running in mock mode, updating UI state.', err);
      notify();
      return true;
    }
  }

  /** POST /api/reviews/:id/helpful  (not yet in backend – best-effort) */
  async toggleHelpful(id: string): Promise<{ helpfulCount: number; isHelpfulByUser: boolean }> {
    try {
      const res = await fetchApi<any>(`/reviews/${id}/helpful`, { method: 'POST' });
      return { helpfulCount: res.data?.helpfulCount ?? 0, isHelpfulByUser: res.data?.isHelpfulByUser ?? false };
    } catch {
      return { helpfulCount: 0, isHelpfulByUser: false };
    }
  }

  /** POST /api/reviews/:id/status  (admin only) */
  async updateStatus(id: string, status: ReviewStatus, operatorNotes?: string): Promise<Review> {
    const res = await fetchApi<any>(`/reviews/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, operatorNotes }),
    });
    const updated = mapBackendReview(res.data);
    notify();
    return updated;
  }

  /** Aggregate stats (pulled from analytics endpoint) */
  async getReviewStats() {
    try {
      const res = await fetchApi<any>('/reviews/analytics');
      const d = res.data;
      return {
        totalReviews: d?.totalReviews ?? 0,
        averageRating: d?.averageRating ?? 0,
        positivePercentage: d?.customerSatisfactionPercentage ?? 0,
        pendingCount: d?.pendingReviews ?? 0,
        negativeCount: d?.lowRatedReviews ?? 0,
      };
    } catch {
      return { totalReviews: 0, averageRating: 0, positivePercentage: 0, pendingCount: 0, negativeCount: 0 };
    }
  }

  /** No-op – kept for backward compatibility */
  resetToInitial() {
    notify();
  }
}

export const reviewService = new ReviewService();
