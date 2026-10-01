import {
  CustomerSatisfactionAnalytics,
  RecommendationInsightsData,
} from '../types/reviewsAndRecommendations';
import { fetchApi } from './api';

class AnalyticsService {
  /**
   * GET /api/reviews/analytics
   */
  async getCustomerSatisfactionAnalytics(): Promise<CustomerSatisfactionAnalytics> {
    const res = await fetchApi<any>('/reviews/analytics');
    const data = res.data ?? {};
    const totalReviews = data.totalReviews ?? 0;
    const averageRating = data.averageRating ?? 0;
    const distribution = data.ratingDistribution ?? [];

    return {
      totalReviews,
      averageRating,
      positiveReviewsPercentage: data.customerSatisfactionPercentage ?? 0,
      negativeReviewsCount: data.lowRatedReviews ?? 0,
      pendingReviewsCount: data.pendingReviews ?? 0,
      ratingDistribution: distribution,
      satisfactionTrend: data.satisfactionTrend ?? [],
      popularAttractions: (data.popularAttractions ?? []).map((item: any) => ({
        id: String(item.id),
        name: item.name ?? 'Attraction',
        location: item.location ?? 'Sri Lanka',
        category: item.category ?? 'Attraction',
        rating: item.averageRating ?? 0,
        reviews: item.totalReviews ?? 0,
        satisfaction: item.satisfaction ?? 0,
      })),
    };
  }

  /**
   * GET /api/recommendations/insights
   */
  async getRecommendationInsights(): Promise<RecommendationInsightsData> {
    const res = await fetchApi<any>('/recommendations/insights');
    return res.data;
  }
}

export const analyticsService = new AnalyticsService();
