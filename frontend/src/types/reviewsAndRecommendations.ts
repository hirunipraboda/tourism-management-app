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
  helpfulCount: number;
  isHelpfulByUser?: boolean;
  status: ReviewStatus;
  photos?: string[];
  tags?: string[];
  highlightRating?: HighlightRatings;
  isCurrentTourist?: boolean; // Used to identify reviews by logged-in tourist
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
  suitabilityScore: number; // Overall percentage e.g. 94%
  interestMatch: number; // e.g. 95%
  ratingMatch: number; // e.g. 92%
  budgetMatch: number; // e.g. 90%
  locationMatch: number; // e.g. 96%
  popularityScore: number; // e.g. 94%
  explanation: string;
  image: string;
  openingHours?: string;
  description?: string;
  bestTimeToVisit?: string;
  duration?: string;
  distanceKm?: number;
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
  satisfactionRate: number; // percentage e.g. 92
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
  satisfaction: number; // e.g. 94%
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

export type ModulePerspective = 'tourist' | 'operator';
export type TouristTab = 'reviews' | 'my-reviews' | 'recommendations';
export type OperatorTab = 'review-management' | 'customer-satisfaction' | 'recommendation-insights';
