export interface TripBudgetInput {
  amount: number;
  currency: string;
  category?: 'Budget' | 'Moderate' | 'Luxury';
}

export interface TripPlanningRequest {
  destination: string;
  destinations?: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  adults?: number;
  children?: number;
  budget: TripBudgetInput;
  travelStyle: string[];
  interests?: string[];
  activities: string[];
  accommodationPreference?: string;
  transportPreference?: string;
  specialRequirements?: string;
}

export interface ItineraryActivityItem {
  id: string;
  time: string;
  title: string;
  location: string;
  durationMinutes: number;
  estimatedCost: number;
  description: string;
  type: 'Attraction' | 'Dining' | 'Transport' | 'Lodging' | 'Activity';
  travelTimeToNext?: string;
  notes?: string;
  imageUrl?: string;
}

export interface ItineraryDayItem {
  day: number;
  date: string;
  location: string;
  title: string;
  description?: string;
  activities: ItineraryActivityItem[];
  estimatedCost: number;
}

export interface BudgetBreakdown {
  accommodation: number;
  transportation: number;
  activities: number;
  food: number;
  other: number;
  total: number;
  remaining: number;
  currency: string;
}

export interface TripWarning {
  id: string;
  type: 'weather' | 'schedule' | 'budget' | 'general';
  title: string;
  message: string;
}

export interface TripRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface TripPlan {
  trip: {
    title: string;
    description: string;
    duration: number;
    destinations: string[];
    travelers: number;
    transportPreference: string;
    accommodationPreference: string;
  };
  days: ItineraryDayItem[];
  budget: BudgetBreakdown;
  warnings: TripWarning[];
  recommendations: TripRecommendation[];
  metadata: {
    generatedAt: string;
    agent: string;
    aiScore: number;
  };
}

// Sub-Agent Interfaces for Multi-Agent Integration Readiness
export interface DestinationResearchRequest {
  targetDestinations: string[];
  interests: string[];
  travelStyle: string[];
}

export interface DestinationResearchResult {
  destinationsInfo: Array<{
    name: string;
    topAttractions: string[];
    bestTimeToVisit: string;
    highlights: string;
  }>;
}

export interface DestinationResearchAgent {
  research(request: DestinationResearchRequest): Promise<DestinationResearchResult>;
}

export interface RouteOptimizationRequest {
  destinations: string[];
  durationDays: number;
  startLocation?: string;
}

export interface RouteOptimizationResult {
  orderedDestinations: string[];
  estimatedTotalTravelDistanceKm: number;
  recommendedTransport: string;
}

export interface RouteTravelOptimizationAgent {
  optimize(request: RouteOptimizationRequest): Promise<RouteOptimizationResult>;
}

export interface ItineraryValidationRequest {
  days: ItineraryDayItem[];
  budgetAmount: number;
}

export interface ItineraryValidationResult {
  isValid: boolean;
  score: number;
  warnings: TripWarning[];
}

export interface ItineraryOptimizationValidationAgent {
  validate(request: ItineraryValidationRequest): Promise<ItineraryValidationResult>;
}
