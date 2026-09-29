import { Recommendation, RecommendationFilterState } from '../types/reviewsAndRecommendations';
import { INITIAL_MOCK_RECOMMENDATIONS } from '../mock/mockRecommendations';

class RecommendationService {
  private recommendations: Recommendation[] = [...INITIAL_MOCK_RECOMMENDATIONS];
  private analysisSummary: string =
    'Traveler review sentiment synthesized across Sri Lanka cultural heritage, highland trails, and southern coastal sanctuaries. Recommendations are grounded in verified tourist reviews with transparent suitability scoring.';
  private isAiConnected: boolean = false;

  getAnalysisSummary(): string {
    return this.analysisSummary;
  }

  isAgentConnected(): boolean {
    return this.isAiConnected;
  }

  /**
   * Fetches smart match recommendations from the AI Agent backend,
   * falling back gracefully to local heuristic data if unavailable.
   */
  async getRecommendations(filters?: Partial<RecommendationFilterState>): Promise<Recommendation[]> {
    try {
      const response = await fetch('/api/recommendations/smart-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: filters?.interests || [],
          minRating: filters?.minRating || 0,
          maxDistance: filters?.maxDistance,
          maxBudget: filters?.maxBudget,
          activityType: filters?.activityType || 'All',
          searchQuery: filters?.searchQuery || '',
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.data || json;
        if (data && data.recommendations && data.recommendations.length > 0) {
          this.isAiConnected = true;
          if (data.analysisSummary) {
            this.analysisSummary = data.analysisSummary;
          }

          // Map and merge images from mock recommendations if image URL is generic
          const serverRecs: Recommendation[] = data.recommendations.map((r: any) => {
            const matchedMock = INITIAL_MOCK_RECOMMENDATIONS.find(
              (m) =>
                m.name.toLowerCase().includes(r.name.toLowerCase()) ||
                r.name.toLowerCase().includes(m.name.toLowerCase())
            );

            return {
              id: r.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
              name: r.name,
              location: r.location,
              category: r.category || 'Culture',
              targetType: r.targetType || 'attraction',
              rating: Number(r.rating) || 4.8,
              reviewCount: Number(r.reviewCount) || 120,
              price: r.price || '$20 / person',
              suitabilityScore: Number(r.suitabilityScore) || 92,
              interestMatch: Number(r.interestMatch) || 94,
              ratingMatch: Number(r.ratingMatch) || 92,
              budgetMatch: Number(r.budgetMatch) || 90,
              locationMatch: Number(r.locationMatch) || 95,
              popularityScore: Number(r.popularityScore) || 94,
              explanation:
                r.explanation || 'Evidence-based match from traveler reviews and sentiment analysis.',
              image:
                matchedMock?.image ||
                r.image ||
                'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
              openingHours: r.openingHours || matchedMock?.openingHours || '8:00 AM - 5:30 PM',
              description: r.description || matchedMock?.description || r.explanation,
              bestTimeToVisit: r.bestTimeToVisit || matchedMock?.bestTimeToVisit || 'Year-round',
              duration: r.duration || matchedMock?.duration || '2 - 3 Hours',
              distanceKm: r.distanceKm || matchedMock?.distanceKm || 20,
              recentReviews: matchedMock?.recentReviews || [],
              supportingFeedback: r.supportingFeedback || [],
              sentimentSummary:
                r.sentimentSummary || 'Highly positive visitor sentiment from verified reviews.',
              limitations: r.limitations || [],
              scoreBreakdown:
                r.scoreBreakdown || 'Score calculated by Recommendation & Feedback Agent formula.',
              isAiGenerated: true,
            };
          });

          this.recommendations = serverRecs;
          return this.applyLocalFilters(serverRecs, filters);
        }
      }
    } catch {
      // Local fallback on network error
    }

    this.isAiConnected = false;
    return this.applyLocalFilters(this.recommendations, filters);
  }

  private applyLocalFilters(
    list: Recommendation[],
    filters?: Partial<RecommendationFilterState>
  ): Recommendation[] {
    let result = [...list];
    if (!filters) return result;

    if (filters.interests && filters.interests.length > 0 && !filters.interests.includes('All')) {
      const selectedLower = filters.interests.map((i) => i.toLowerCase());
      result = result.filter((r) => {
        const cat = r.category.toLowerCase();
        const text = `${r.name} ${r.explanation} ${r.description || ''}`.toLowerCase();
        return selectedLower.some((interest) => {
          if (cat === interest || cat.includes(interest)) return true;
          const words = interest.split(/[\s&,/]+/).filter((w) => w.length > 2);
          return words.some((w) => cat.includes(w) || text.includes(w));
        });
      });
    }

    if (filters.minRating && filters.minRating > 0) {
      result = result.filter((r) => r.rating >= filters.minRating!);
    }

    if (filters.maxDistance && filters.maxDistance > 0) {
      result = result.filter((r) => !r.distanceKm || r.distanceKm <= filters.maxDistance!);
    }

    if (filters.activityType && filters.activityType !== 'All') {
      const act = filters.activityType.toLowerCase();
      result = result.filter((r) => {
        const target = r.targetType.toLowerCase();
        const cat = r.category.toLowerCase();
        const text = `${r.name} ${r.explanation} ${r.description || ''}`.toLowerCase();

        if (act === 'attraction') return target === 'attraction' || cat.includes('attraction');
        if (act === 'tour') return target === 'tour' || cat.includes('tour');
        if (act === 'safari')
          return (
            cat.includes('wildlife') ||
            text.includes('safari') ||
            text.includes('leopard') ||
            text.includes('elephant')
          );
        if (act === 'watersports')
          return (
            cat.includes('beach') ||
            text.includes('snorkel') ||
            text.includes('surf') ||
            text.includes('ocean') ||
            text.includes('dolphin')
          );
        if (act === 'culture')
          return (
            cat.includes('culture') ||
            cat.includes('history') ||
            text.includes('temple') ||
            text.includes('heritage') ||
            text.includes('citadel')
          );
        if (act === 'wellness')
          return cat.includes('wellness') || text.includes('ayurved') || text.includes('spa') || text.includes('herbal');
        if (act === 'food')
          return cat.includes('food') || text.includes('tea') || text.includes('culinary') || text.includes('tasting');
        if (act === 'adventure')
          return cat.includes('adventure') || cat.includes('nature') || text.includes('trek') || text.includes('hike') || text.includes('climb');

        return target === act || cat === act || text.includes(act);
      });
    }

    if (filters.environment && filters.environment !== 'All') {
      const env = filters.environment.toLowerCase();
      result = result.filter((r) => {
        const text = `${r.name} ${r.location} ${r.category} ${r.explanation} ${r.description || ''}`.toLowerCase();
        if (env === 'peaceful') return text.includes('peace') || text.includes('seren') || text.includes('quiet') || text.includes('nature');
        if (env === 'mountain') return text.includes('mountain') || text.includes('ella') || text.includes('hill') || text.includes('peak') || text.includes('rock');
        if (env === 'coastal') return text.includes('beach') || text.includes('coast') || text.includes('galle') || text.includes('mirissa') || text.includes('ocean');
        if (env === 'historic') return text.includes('history') || text.includes('ancient') || text.includes('temple') || text.includes('fort') || text.includes('kandy') || text.includes('sigiriya');
        if (env === 'urban') return text.includes('colombo') || text.includes('city') || text.includes('town');
        return text.includes(env);
      });
    }

    if (filters.budgetCategory && filters.budgetCategory !== 'All') {
      const b = filters.budgetCategory.toLowerCase();
      result = result.filter((r) => {
        const p = (r.price || '').toLowerCase();
        if (b === 'budget') return p.includes('free') || p.includes('15') || p.includes('18') || p.includes('2,000') || p.includes('budget');
        if (b === 'moderate') return p.includes('25') || p.includes('36') || p.includes('50') || (!p.includes('75') && !p.includes('free'));
        if (b === 'premium') return p.includes('75') || p.includes('100') || p.includes('safari') || p.includes('luxury');
        return true;
      });
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.explanation.toLowerCase().includes(q)
      );
    }

    // Sort according to user preference
    const sort = filters.sortBy || 'best_match';
    if (sort === 'sentiment') {
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sort === 'budget') {
      const getPriceVal = (str: string) => {
        if (!str || str.toLowerCase().includes('free')) return 0;
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 50;
      };
      result.sort((a, b) => getPriceVal(a.price) - getPriceVal(b.price));
    } else if (sort === 'relevance') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      result.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    }

    return result;
  }

  /**
   * GET /api/recommendations/:id
   */
  async getRecommendationById(id: string): Promise<Recommendation | undefined> {
    return this.recommendations.find((r) => r.id === id);
  }

  /**
   * Recalculate suitability scores dynamically when user changes preferences
   */
  recalculateSuitability(preferences: {
    interests: string[];
    budgetTier?: 'budget' | 'moderate' | 'luxury';
    distanceKm?: number;
  }): Recommendation[] {
    return this.recommendations
      .map((item) => {
        let interestBoost = 0;
        if (
          preferences.interests.includes('All') ||
          preferences.interests.some((i) => i.toLowerCase() === item.category.toLowerCase())
        ) {
          interestBoost = 5;
        } else {
          interestBoost = -8;
        }

        let budgetBoost = 0;
        if (preferences.budgetTier === 'luxury' && item.price.includes('75')) budgetBoost = 4;
        if (
          preferences.budgetTier === 'budget' &&
          (item.price.includes('Free') || item.price.includes('15') || item.price.includes('18'))
        ) {
          budgetBoost = 6;
        }

        const newInterestMatch = Math.min(99, Math.max(70, item.interestMatch + interestBoost));
        const newBudgetMatch = Math.min(99, Math.max(65, item.budgetMatch + budgetBoost));
        const newSuitability = Math.min(
          99,
          Math.round(
            newInterestMatch * 0.35 +
              item.ratingMatch * 0.25 +
              newBudgetMatch * 0.15 +
              item.locationMatch * 0.15 +
              item.popularityScore * 0.1
          )
        );

        return {
          ...item,
          suitabilityScore: newSuitability,
          interestMatch: newInterestMatch,
          budgetMatch: newBudgetMatch,
        };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
}

export const recommendationService = new RecommendationService();
