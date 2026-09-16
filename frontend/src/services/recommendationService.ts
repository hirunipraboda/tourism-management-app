import { Recommendation, RecommendationFilterState } from '../types/reviewsAndRecommendations';
import { INITIAL_MOCK_RECOMMENDATIONS } from '../mock/mockRecommendations';

class RecommendationService {
  private recommendations: Recommendation[] = [...INITIAL_MOCK_RECOMMENDATIONS];

  /**
   * GET /api/recommendations
   */
  async getRecommendations(filters?: Partial<RecommendationFilterState>): Promise<Recommendation[]> {
    let result = [...this.recommendations];

    if (!filters) return result;

    if (filters.interests && filters.interests.length > 0 && !filters.interests.includes('All')) {
      const selectedLower = filters.interests.map((i) => i.toLowerCase());
      result = result.filter((r) =>
        selectedLower.includes(r.category.toLowerCase()) ||
        selectedLower.some((interest) =>
          r.explanation.toLowerCase().includes(interest) ||
          r.name.toLowerCase().includes(interest) ||
          (r.description && r.description.toLowerCase().includes(interest))
        )
      );
    }

    if (filters.minRating && filters.minRating > 0) {
      result = result.filter((r) => r.rating >= filters.minRating!);
    }

    if (filters.maxDistance && filters.maxDistance > 0) {
      result = result.filter((r) => !r.distanceKm || r.distanceKm <= filters.maxDistance!);
    }

    if (filters.activityType && filters.activityType !== 'All') {
      result = result.filter(
        (r) =>
          r.targetType.toLowerCase() === filters.activityType?.toLowerCase() ||
          r.category.toLowerCase() === filters.activityType?.toLowerCase()
      );
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

    // Sort by suitability score descending
    result.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

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
  recalculateSuitability(
    preferences: {
      interests: string[];
      budgetTier?: 'budget' | 'moderate' | 'luxury';
      distanceKm?: number;
    }
  ): Recommendation[] {
    return this.recommendations.map((item) => {
      let interestBoost = 0;
      if (
        preferences.interests.includes('All') ||
        preferences.interests.some(
          (i) => i.toLowerCase() === item.category.toLowerCase()
        )
      ) {
        interestBoost = 5;
      } else {
        interestBoost = -8;
      }

      let budgetBoost = 0;
      if (preferences.budgetTier === 'luxury' && item.price.includes('75')) budgetBoost = 4;
      if (preferences.budgetTier === 'budget' && (item.price.includes('Free') || item.price.includes('15') || item.price.includes('18'))) {
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
          item.popularityScore * 0.10
        )
      );

      return {
        ...item,
        suitabilityScore: newSuitability,
        interestMatch: newInterestMatch,
        budgetMatch: newBudgetMatch,
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
}

export const recommendationService = new RecommendationService();
