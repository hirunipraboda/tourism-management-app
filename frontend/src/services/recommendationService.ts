import {
  Recommendation,
  RecommendationFilterState,
  RecommendationInsightsData,
  SuitabilityBreakdown,
  AgentResponse,
} from '../types/reviewsAndRecommendations';
import { fetchApi } from './api';

// ─── Backend DTO → Frontend Recommendation mapper ────────────────────────────
function mapBackendRec(r: any): Recommendation {
  const cost = r.estimatedCostUSD ?? r.estimatedCost ?? r.price ?? 0;
  const lkr = r.estimatedCostLKR ?? Math.round(cost * 300);
  const priceLabel =
    cost === 0 ? 'Free entry'
    : `Rs ${lkr.toLocaleString()} ($${cost})`;

  return {
    id: String(r.id ?? r.attractionId ?? Math.random()),
    name: r.name ?? r.attractionName ?? 'Attraction',
    location: r.location ?? r.city ?? 'Sri Lanka',
    category: r.category ?? r.type ?? 'Attraction',
    // New: activity type as targetType (backend returns "attraction" or "tour")
    targetType: (r.activityType ?? r.targetType ?? r.entityType ?? 'attraction').toLowerCase() as any,
    rating: r.avgRating ?? r.averageRating ?? r.rating ?? 0,
    reviewCount: r.reviewCount ?? r.totalReviews ?? 0,
    price: priceLabel,
    estimatedCost: cost,
    distanceKm: r.distanceKm ?? undefined,
    matchReasons: r.matchReasons ?? [],
    description: r.description ?? '',
    image:
      r.imageUrl ??
      r.image ??
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    // Scores are 0-100 from backend — use directly
    suitabilityScore: r.matchScore ?? r.suitabilityScore ?? 0,
    explanation: (r.matchReasons?.[0]) ?? r.explanation ?? 'Recommended based on your preferences.',
    ratingMatch: r.ratingMatchPercent ?? r.ratingScore ?? r.ratingMatch ?? 0,
    budgetMatch: r.budgetScore ?? r.budgetMatch ?? 0,
    locationMatch: r.distanceScore ?? r.locationMatch ?? 0,
    popularityScore: r.popularityScore ?? 0,
    interestMatch: r.interestMatchPercent ?? r.interestScore ?? r.interestMatch ?? 0,
    openingHours: r.openingHours ?? 'Open Daily',
    bestTimeToVisit: r.bestTimeToVisit ?? 'Year-round',
    duration: r.duration ?? '2 - 4 hours',
    tags: r.tags ?? [],
    highlights: r.highlights ?? [],
  };
}

export interface CreateRecommendationInput {
  name: string;
  destinationName?: string;
  category?: string;
  activityType?: 'attraction' | 'tour';
  imageUrl?: string;
  estimatedCostUsd?: number;
  description?: string;
  openingHours?: string;
  bestTimeToVisit?: string;
  duration?: string;
  isFeatured?: boolean;
  initialRating?: number;
}

// ─── Debounce helper ─────────────────────────────────────────────────────────
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  } as T;
}

// ─── Service ─────────────────────────────────────────────────────────────────
class RecommendationService {
  private conversationId: string | null = null;

  public getLocalRecommendations(): Recommendation[] {
    try {
      const stored = localStorage.getItem('admin_created_recommendations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public saveLocalRecommendation(rec: Recommendation): void {
    try {
      const current = this.getLocalRecommendations();
      const updated = [rec, ...current.filter((r) => r.id !== rec.id && r.name.toLowerCase() !== rec.name.toLowerCase())];
      localStorage.setItem('admin_created_recommendations', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('recommendations:updated', { detail: rec }));
    } catch (e) {
      console.warn('Could not save local recommendation', e);
    }
  }

  /**
   * Admin: Add a new recommendation
   */
  async addRecommendation(input: CreateRecommendationInput): Promise<Recommendation> {
    try {
      const res = await fetchApi<any>('/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const rec = mapBackendRec(res.data);
      this.saveLocalRecommendation(rec);
      return rec;
    } catch (err) {
      console.warn('[RecommendationService] API add failed, saving locally as fallback', err);
      const fallbackRec: Recommendation = {
        id: 'rec-' + Date.now(),
        name: input.name,
        location: input.destinationName || 'Sri Lanka',
        category: input.category || 'Nature',
        targetType: (input.activityType || 'attraction') as any,
        rating: input.initialRating || 5.0,
        reviewCount: 1,
        price: input.estimatedCostUsd ? `~Rs. ${(input.estimatedCostUsd * 300).toLocaleString()} ($${input.estimatedCostUsd})` : 'Free entry',
        estimatedCost: input.estimatedCostUsd || 0,
        matchReasons: ['⭐ Curated Admin Pick', `Featured ${input.category || 'Nature'} attraction`],
        description: input.description || '',
        image: input.imageUrl || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
        suitabilityScore: 98,
        explanation: 'Recommended by tourism administration.',
        ratingMatch: 98,
        budgetMatch: 95,
        locationMatch: 90,
        popularityScore: 92,
        interestMatch: 98,
        openingHours: input.openingHours || 'Open Daily',
        bestTimeToVisit: input.bestTimeToVisit || 'Year-round',
        duration: input.duration || '2 - 4 hours',
        tags: [input.category || 'Nature', 'Featured Landmark'],
        highlights: ['Verified landmark', 'Top choice'],
      };
      this.saveLocalRecommendation(fallbackRec);
      return fallbackRec;
    }
  }

  /**
   * GET /api/Recommendations/personalized
   * Sends all active filters to the backend and returns scored results.
   * Falls back to /popular on error.
   */
  async getPersonalized(
    filters?: Partial<RecommendationFilterState>,
    coords?: { lat: number; lng: number }
  ): Promise<Recommendation[]> {
    try {
      const qs = new URLSearchParams();
      const interests = filters?.interests ?? [];
      const activeInterests = interests.filter((i) => i !== 'All');
      activeInterests.forEach((i) => qs.append('interests', i));
      if (filters?.maxBudget) qs.set('maxBudget', String(filters.maxBudget));
      if (filters?.maxDistance) qs.set('maxDistanceKm', String(filters.maxDistance));
      if (filters?.minRating) qs.set('minRating', String(filters.minRating));
      if (filters?.activityType && filters.activityType !== 'All')
        qs.set('activityType', filters.activityType);
      if (coords?.lat) qs.set('userLat', String(coords.lat));
      if (coords?.lng) qs.set('userLng', String(coords.lng));
      qs.set('limit', '10');

      const res = await fetchApi<any[]>(`/recommendations/personalized?${qs.toString()}`);
      let result = (res.data ?? []).map(mapBackendRec);

      // Prepend local admin-created recommendations so they are immediately visible
      const localRecs = this.getLocalRecommendations();
      for (const lr of localRecs) {
        if (!result.some((r) => r.id === lr.id || r.name.toLowerCase() === lr.name.toLowerCase())) {
          result.unshift(lr);
        }
      }

      // Client-side text search (instant, no round-trip)
      const q = filters?.searchQuery?.trim().toLowerCase();
      if (q) {
        result = result.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.explanation.toLowerCase().includes(q)
        );
      }

      return result;
    } catch (err) {
      console.warn('[RecommendationService] personalized failed, falling back to popular', err);
      const pop = await this.getPopular();
      const localRecs = this.getLocalRecommendations();
      for (const lr of localRecs) {
        if (!pop.some((r) => r.id === lr.id || r.name.toLowerCase() === lr.name.toLowerCase())) {
          pop.unshift(lr);
        }
      }
      return pop;
    }
  }

  /**
   * GET /api/Recommendations/popular
   * Cached 5 min on backend. No auth required.
   */
  async getPopular(limit = 10): Promise<Recommendation[]> {
    try {
      const res = await fetchApi<any[]>(`/recommendations/popular?limit=${limit}`);
      return (res.data ?? []).map(mapBackendRec);
    } catch (err) {
      console.warn('[RecommendationService] popular failed', err);
      return [];
    }
  }

  /**
   * GET /api/Recommendations/insights
   * Cached 5 min on backend.
   */
  async getInsights(): Promise<RecommendationInsightsData | null> {
    try {
      const res = await fetchApi<RecommendationInsightsData>('/recommendations/insights');
      return res.data ?? null;
    } catch (err) {
      console.warn('[RecommendationService] insights failed', err);
      return null;
    }
  }

  /**
   * GET /api/Recommendations/suitability/{id}
   * Returns per-criterion breakdown for "Why this?" modal.
   */
  async getSuitability(
    attractionId: string | number,
    filters?: Partial<RecommendationFilterState>
  ): Promise<SuitabilityBreakdown | null> {
    try {
      const qs = new URLSearchParams();
      const interests = filters?.interests?.filter((i) => i !== 'All') ?? [];
      interests.forEach((i) => qs.append('interests', i));
      if (filters?.maxBudget) qs.set('maxBudget', String(filters.maxBudget));
      if (filters?.maxDistance) qs.set('maxDistanceKm', String(filters.maxDistance));
      if (filters?.minRating) qs.set('minRating', String(filters.minRating));

      const res = await fetchApi<SuitabilityBreakdown>(
        `/recommendations/suitability/${attractionId}?${qs.toString()}`
      );
      return res.data ?? null;
    } catch (err) {
      console.warn('[RecommendationService] suitability failed', err);
      return null;
    }
  }

  /**
   * POST /api/Recommendations/agent
   * AI travel agent — natural language → ranked recommendations.
   */
  async askAgent(
    message: string,
    filters?: Partial<RecommendationFilterState>
  ): Promise<AgentResponse> {
    const body: any = {
      message,
      conversationId: this.conversationId ?? undefined,
      filters: filters
        ? {
            interests: filters.interests?.filter((i) => i !== 'All'),
            maxBudget: filters.maxBudget ?? 100,
            maxDistanceKm: filters.maxDistance ?? 200,
            minRating: filters.minRating ?? 0,
            activityType: filters.activityType ?? 'All',
          }
        : undefined,
    };

    const res = await fetchApi<AgentResponse>('/recommendations/agent', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = res.data!;
    this.conversationId = data.conversationId ?? null;
    return data;
  }

  /**
   * @deprecated Use getPersonalized() instead.
   * Kept for backward compatibility with existing callers.
   */
  async getRecommendations(filters?: Partial<RecommendationFilterState>): Promise<Recommendation[]> {
    return this.getPersonalized(filters);
  }

  /**
   * @deprecated Use getSuitability() instead.
   */
  async getRecommendationById(id: string): Promise<Recommendation | undefined> {
    const breakdown = await this.getSuitability(id);
    if (!breakdown) return undefined;
    // Return a minimal Recommendation so existing callers don't break
    return {
      id,
      name: breakdown.name,
      location: 'Sri Lanka',
      category: '',
      targetType: 'attraction',
      rating: 0,
      reviewCount: 0,
      price: '',
      suitabilityScore: breakdown.overallScore,
      interestMatch: 0,
      ratingMatch: 0,
      budgetMatch: 0,
      locationMatch: 0,
      popularityScore: 0,
      explanation: breakdown.verdict,
      image: '',
    };
  }

  /** Reset conversation context (call when user navigates away from chat) */
  resetConversation() {
    this.conversationId = null;
  }

  /**
   * Client-side re-scoring for instant UI feedback (slider drag, before fetch completes)
   */
  recalculateSuitability(
    preferences: { interests: string[]; budgetTier?: 'budget' | 'moderate' | 'luxury'; distanceKm?: number },
    currentItems: Recommendation[]
  ): Recommendation[] {
    return currentItems
      .map((item) => {
        const interestBoost =
          preferences.interests.includes('All') ||
          preferences.interests.some((i) => i.toLowerCase() === item.category.toLowerCase())
            ? 5
            : -8;
        const newInterestMatch = Math.min(99, Math.max(70, item.interestMatch + interestBoost));
        const newSuitability = Math.min(
          99,
          Math.round(
            newInterestMatch * 0.30 +
            item.ratingMatch * 0.25 +
            item.budgetMatch * 0.15 +
            item.locationMatch * 0.15 +
            item.popularityScore * 0.10
          )
        );
        return { ...item, suitabilityScore: newSuitability, interestMatch: newInterestMatch };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
}

export const recommendationService = new RecommendationService();
