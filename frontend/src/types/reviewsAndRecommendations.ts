export type TargetType = 'destination' | 'attraction' | 'tour';

export type ReviewStatus = 'Published' | 'Pending Review' | 'Rejected';

export type TravelerType = 'Solo' | 'Couple' | 'Family' | 'Friends';

export interface HighlightRatings {
  experience: number;
  value: number;
  safety: number;
  hospitality: number;
}

export interface Review {
  id: string;
  touristName: string;
  touristAvatar: string;
  touristCountry: string;
  travelerType: TravelerType;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  sortDate?: string;
  helpfulCount: number;
  isHelpfulByUser?: boolean;
  status: ReviewStatus;
  photos?: string[];
  tags?: string[];
  highlightRating?: HighlightRatings;
  isCurrentTourist?: boolean;
  operatorNotes?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  location: string;
  category: 'Culture' | 'History' | 'Nature' | 'Adventure' | 'Food' | 'Wildlife' | 'Beaches' | string;
  targetType: TargetType;
  rating: number;
  reviewCount: number;
  price: string;
  estimatedCost?: number;       // raw USD cost from backend
  distanceKm?: number;
  matchReasons?: string[];      // short human-readable reason chips
  suitabilityScore: number;     // 0-100
  interestMatch: number;
  ratingMatch: number;
  budgetMatch: number;
  locationMatch: number;
  popularityScore: number;
  explanation: string;
  image: string;
  openingHours?: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  bestTimeToVisit?: string;
  duration?: string;
  recentReviews?: Review[];
}

export interface RecommendationFilterState {
  interests: string[];
  maxBudget: number;
  maxDistance: number;
  minRating: number;
  activityType: string;
  searchQuery?: string;
}

export interface StarDistributionItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface SatisfactionTrendPoint {
  month: string;
  satisfactionRate: number;
  reviewsCount: number;
  avgRating: number;
}

export interface PopularAttractionItem {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  reviews: number;
  satisfaction: number;
}

export interface CustomerSatisfactionAnalytics {
  totalReviews: number;
  averageRating: number;
  positiveReviewsPercentage: number;
  negativeReviewsCount: number;
  pendingReviewsCount: number;
  ratingDistribution: StarDistributionItem[];
  satisfactionTrend: SatisfactionTrendPoint[];
  popularAttractions: PopularAttractionItem[];
}

export interface RecommendationInsightsData {
  topRecommendedAttraction: string;
  mostPopularCategory: string;
  trendingDestination: string;
  averageRecommendationMatch: number;
  mostPopularActivities: { name: string; count: number; category: string }[];
  highestRatedAttractions: { name: string; rating: number; reviews: number; badge: string }[];
  frequentlySelectedCategories: { name: string; percentage: number; count: number }[];
  averageSuitabilityScores: { category: string; score: number }[];
}

// ── Suitability Breakdown ──────────────────────────────────────────────────────

export interface SuitabilityCriterion {
  name: string;
  score: number;    // 0-100
  weight: number;   // 0.0 - 1.0
  reason: string;
}

export interface SuitabilityBreakdown {
  attractionId: number;
  name: string;
  overallScore: number;
  verdict: string;
  criteria: SuitabilityCriterion[];
}

// ── AI Agent Types ─────────────────────────────────────────────────────────────

export interface AgentRecommendation {
  attractionId: number;
  name: string;
  reason: string;
  matchScore: number;
  category: string;
  imageUrl: string;
  avgRating: number;
  reviewCount: number;
  estimatedCost: number;
  location: string;
}

export interface AgentResponse {
  summary: string;
  recommendations: AgentRecommendation[];
  followUpQuestion?: string;
  conversationId: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AgentRecommendation[];
  followUpQuestion?: string;
  timestamp: Date;
}

export type ModulePerspective = 'tourist' | 'operator';
export type TouristTab = 'reviews' | 'my-reviews' | 'recommendations';
export type OperatorTab = 'review-management' | 'customer-satisfaction' | 'recommendation-insights';
