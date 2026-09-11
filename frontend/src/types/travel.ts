export interface Location {
  name: string;
  country: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  description: string;
  category: 'Coastal' | 'Mountain' | 'Cultural' | 'Urban' | 'Nature' | 'Historical';
  rating: number;
  attractionsCount: number;
  activeTripsCount: number;
  status: 'Featured' | 'Active' | 'Seasonal' | 'Draft';
  weather?: {
    temp: number;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Clear';
  };
}

export interface Attraction {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  category: string;
  imageUrl: string;
  durationHours: number;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  status: 'Active' | 'Maintenance' | 'Seasonal';
}

export interface Trip {
  id: string;
  title: string;
  travelerName: string;
  travelerEmail: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  budget: number;
  paxCount: number;
  status: 'Planning' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  aiScore: number;
}

export interface ItineraryItem {
  id: string;
  dayNumber: number;
  timeSlot: string;
  title: string;
  location: string;
  type: 'Attraction' | 'Dining' | 'Transport' | 'Lodging' | 'Activity';
  cost: number;
  duration: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  tripTitle: string;
  destinationName: string;
  items: ItineraryItem[];
  totalCost: number;
  aiValidationState: 'Valid' | 'Optimization Needed' | 'Conflict Detected';
}

export interface TourPackage {
  id: string;
  code: string;
  title: string;
  destinationName: string;
  durationDays: number;
  price: number;
  maxGroupSize: number;
  status: 'Published' | 'Draft' | 'Archived';
  rating: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  tourName: string;
  bookingDate: string;
  travelDate: string;
  pax: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingStatus: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
}
