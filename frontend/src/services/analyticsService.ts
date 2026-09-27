import {
  CustomerSatisfactionAnalytics,
  RecommendationInsightsData,
} from '../types/reviewsAndRecommendations';
import { MOCK_ANALYTICS, MOCK_RECOMMENDATION_INSIGHTS } from '../mock/mockAnalytics';

class AnalyticsService {
  /**
   * GET /api/reviews/analytics
   */
  async getCustomerSatisfactionAnalytics(): Promise<CustomerSatisfactionAnalytics> {
    return { ...MOCK_ANALYTICS };
  }

  /**
   * GET /api/recommendations/insights
   */
  async getRecommendationInsights(): Promise<RecommendationInsightsData> {
    return { ...MOCK_RECOMMENDATION_INSIGHTS };
  }
}

export const analyticsService = new AnalyticsService();
