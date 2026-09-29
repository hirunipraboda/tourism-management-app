export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalDestinations: number;
    totalAttractions: number;
    totalActivities: number;
    totalTrips: number;
    aiGeneratedTrips: number;
    chatbotPurchases: number;
    transportRoutes?: number;
    aiGuideQueries: number;
  };
  recentTrips: Array<{
    id: string;
    userName: string;
    destination: string;
    startDate: string;
    endDate: string;
    tripType: string;
    approvalStatus: string;
    createdAt: string;
  }>;
  recentChatbotPurchases: Array<{
    id: string;
    userName: string;
    packageName: string;
    amount: number;
    paymentMethod: string;
    maskedCardNumber: string;
    status: string;
    createdAt: string;
  }>;
  recentPromoPurchases: Array<{
    id: string;
    userName: string;
    promoCode: string;
    amountPaid: number;
    paymentMethod: string;
    maskedCardNumber: string;
    status: string;
    createdAt: string;
  }>;
  recentAiGuideActivity: Array<{
    id: string;
    userName: string;
    topic: string;
    queryCount: number;
    lastActivityAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    userName: string;
    destinationName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  tripsCount: number;
  bookingsCount: number;
  aiGuideUsage: number;
}

export interface AttractionItem {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  description: string;
  location?: string;
  category?: string;
  openingTime?: string;
  closingTime?: string;
  openingHours?: string;
  entryFee?: string;
  duration?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  imageUrl: string;
  status: 'Active' | 'Inactive';
  availability?: string;
  createdAt?: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  slug?: string;
  description: string;
  location: string;
  province: string;
  imageUrl: string;
  rating?: number;
  status?: 'Active' | 'Draft' | 'Inactive';
  activities?: any[];
}

export interface ActivityItem {
  id: string;
  name: string;
  destinationId: string;
  destinationName?: string;
  description: string;
  category: string;
  costPerPerson: number;
  durationMinutes: number;
  openingTime?: string;
  closingTime?: string;
  imageUrl?: string;
  status?: string;
}

export interface ItineraryTransportDetail {
  type: 'Train' | 'Bus' | string;
  name?: string;
  from?: string;
  to?: string;
  departure?: string;
  arrival?: string;
  fare?: number;
}

export interface ItineraryItemDetail {
  activityName: string;
  location: string;
  date?: string;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  durationMinutes?: number;
  travelTime?: string;
  transport?: ItineraryTransportDetail | null;
}

export interface ItineraryDayDetail {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  items: ItineraryItemDetail[];
}

export interface AdminTripItem {
  id: string;
  displayId?: string;
  userName: string;
  userEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  daysCount?: number;
  numberOfTravelers: number;
  budget: number;
  estimatedCost: number;
  tripType: 'AI GENERATED' | 'USER CREATED' | string;
  status?: string; // 'Draft' | 'Active' | 'Completed' | 'Cancelled'
  validationStatus?: 'PASSED' | 'WARNING' | 'FAILED' | string;
  userApprovalStatus: 'PENDING_USER_APPROVAL' | 'APPROVED_BY_USER' | 'REVISION_REQUESTED' | 'REJECTED_BY_USER' | 'COMPLETED' | 'NOT_APPLICABLE' | string;
  revisionReason?: string;
  revisionDate?: string;
  decisionDate?: string;
  hasAiWorkflow: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminTripDetail {
  id: string;
  displayId?: string;
  user: { id?: string; name: string; email: string };
  destination: string;
  startDate: string;
  endDate: string;
  numberOfDays?: number;
  numberOfTravelers: number;
  budget: number;
  tripStyle: string;
  interests: string[];
  status: string; // Trip status: 'Draft' | 'Active' | 'Completed' | 'Cancelled'
  tripType?: 'AI GENERATED' | 'USER CREATED' | string;
  createdAt?: string;
  updatedAt?: string;
  itinerary?: {
    id: string;
    title: string;
    totalEstimatedCost: number;
    feasibilityScore?: number;
    status?: string;
    days: ItineraryDayDetail[];
  } | null;
  validationResults?: Array<{
    rule: string;
    status: 'Passed' | 'Warning' | 'Failed' | string;
    detail: string;
  }>;
  userApproval: {
    status: 'PENDING_USER_APPROVAL' | 'APPROVED_BY_USER' | 'REVISION_REQUESTED' | 'REJECTED_BY_USER' | 'COMPLETED' | 'NOT_APPLICABLE' | string;
    decisionDate?: string;
    revisionReason?: string;
    requestedDate?: string;
    notice?: string;
  };
  workflowTrace?: {
    id: string;
    status: string;
    currentStep?: string;
    auditLogs: Array<{
      actor: string;
      action: string;
      details: string;
      timestamp: string;
    }>;
  };
}

export interface ChatbotPaymentItem {
  id: string;
  purchaseId?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  packageName: string;
  amount: number;
  queriesAllowed?: number;
  paymentMethod: string;
  maskedCardNumber: string;
  transactionReference?: string;
  status: 'Pending' | 'Successful' | 'Completed' | 'Failed' | 'Refunded';
  purchaseDate?: string;
  createdAt: string;
}

export interface PromoPaymentItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  promoCode: string;
  discountRate?: string;
  amountPaid: number;
  paymentMethod: string;
  maskedCardNumber: string;
  transactionReference?: string;
  status: 'Pending' | 'Successful' | 'Completed' | 'Failed' | 'Refunded';
  promoCodeStatus?: string;
  purchaseDate?: string;
  createdAt: string;
}

export interface BusRouteItem {
  id: string;
  busNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  operatingDays: string;
  fare: number;
  status: 'Active' | 'Inactive' | 'Delayed' | 'Cancelled';
}

export interface TrainScheduleItem {
  id: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  trainType: string;
  operatingDays: string;
  fare: number;
  status: 'Active' | 'Inactive' | 'Delayed' | 'Cancelled';
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  description: string;
  partner?: string;
  createdAt: string;
}

export interface PackagePurchaseItem {
  id: string;
  userName: string;
  userEmail: string;
  packageName: string;
  price: number;
  remainingQueries: number;
  purchaseDate: string;
  status: string;
}

export interface ChatbotPackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  questionLimit: number;
  durationDays: number;
  status: 'Active' | 'Inactive';
  includesPhotoQueries: boolean;
}

export interface AIGuideUsageData {
  totalQueries: number;
  totalActiveUsers?: number;
  textQueries: number;
  photoQueries: number;
  queriesToday?: number;
  queriesThisWeek?: number;
  queriesThisMonth?: number;
  todayQueries?: number;
  weekQueries?: number;
  monthQueries?: number;
  dailyUsage: Array<{
    date: string;
    textQueries: number;
    photoQueries: number;
    total: number;
  }>;
}

export interface AIGuideAnalyticsData {
  topQuestionTypes: Array<{
    type?: string;
    category?: string;
    count: number;
    percentage: number;
  }>;
  topPlaces: Array<{
    place?: string;
    placeName?: string;
    count?: number;
    queriesCount?: number;
    province?: string;
    category: string;
  }>;
  recentPlaceQueries?: Array<{
    id: string;
    place: string;
    category: string;
    status: string;
    latencyMs: number;
    date: string;
  }>;
}

export interface ReviewItem {
  id: string;
  userName: string;
  destinationName: string;
  rating: number;
  comment: string;
  sentimentLabel: string;
  sentimentScore: number;
  status: 'Published' | 'Flagged' | 'Hidden';
  createdAt: string;
}

export interface SystemActivityItem {
  id: string;
  activityType: 'Trip' | 'Payment' | 'Chatbot' | 'Transport' | 'Review' | 'User' | 'System';
  description: string;
  actorName: string;
  actorRole: string;
  severity: 'Info' | 'Warning' | 'Error';
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
}

export interface ActivityFeedItem {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  entityType: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
  ipAddress?: string;
}

export interface SystemMonitoringData {
  summary?: {
    totalActivities: number;
    tripActivities: number;
    paymentActivities: number;
    transportActivities: number;
    chatbotActivities: number;
    userActivities: number;
    reviewActivities: number;
    systemStatus: string;
    lastCheck: string;
  };
  systemHealth?: {
    status: string;
    uptime: string;
    activeServices: number;
    avgLatencyMs: number;
  };
  activities?: SystemActivityItem[];
  feed?: ActivityFeedItem[];
}

export interface AdminBookingItem {
  id: string;
  userName?: string;
  userEmail?: string;
  customerName?: string;
  customerEmail?: string;
  tourName?: string;
  tourId?: string;
  serviceName?: string;
  serviceType?: string;
  amount?: number;
  bookingDate?: string;
  date?: string;
  numberOfPersons?: number;
  totalPrice?: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export interface AIWorkflowMonitoringItem {
  id: string;
  tripId: string;
  travelerName?: string;
  userName?: string;
  destination: string;
  status: string;
  currentStep?: string;
  auditLogsCount?: number;
  confidenceScore?: number;
  agentName?: string;
  executionTimeMs?: number;
  createdAt: string;
}


export interface AIGuideStatsItem {
  totalQueries: number;
  textQueries: number;
  photoQueries: number;
  photoSuccessRate: number;
  topDestinations: Array<{ destination: string; count: number }>;
}

export interface AIChatSessionItem {
  id: string;
  userName: string;
  topic: string;
  queryCount: number;
  startTime: string;
  lastActivity: string;
  status: string;
}
