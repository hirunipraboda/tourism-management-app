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
