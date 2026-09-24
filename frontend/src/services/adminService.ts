import { fetchApi } from './api';
import {
  AdminDashboardData,
  AdminUserItem,
  AdminTripItem,
  AdminTripDetail,
  PromoCodeItem,
  BusRouteItem,
  TrainScheduleItem,
  PackagePurchaseItem,
  ChatbotPackageItem,
  AdminBookingItem,
  AIWorkflowMonitoringItem,
  ReviewItem,
  AttractionItem,
  ChatbotPaymentItem,
  PromoPaymentItem,
  AIGuideUsageData,
  AIGuideAnalyticsData,
  SystemMonitoringData,
} from '../types/adminTypes';
import {
  MOCK_ADMIN_DESTINATIONS,
  MOCK_ADMIN_ATTRACTIONS,
  MOCK_ADMIN_TOURS,
  MOCK_ADMIN_AVAILABILITY,
  MOCK_ADMIN_AI_APPROVALS,
  AdminDestination,
  AdminAttraction,
  AdminTourPackage,
  AdminAvailabilityEvent,
  AIApprovalItem,
} from '../mock/mockAdminData';

// Mutable mock state for backwards compatibility
let mockDestinations: AdminDestination[] = [...MOCK_ADMIN_DESTINATIONS];
let mockAttractions: AdminAttraction[] = [...MOCK_ADMIN_ATTRACTIONS];
let mockTours: AdminTourPackage[] = [...MOCK_ADMIN_TOURS];
let mockAvailability: AdminAvailabilityEvent[] = [...MOCK_ADMIN_AVAILABILITY];
let mockApprovals: AIApprovalItem[] = [...MOCK_ADMIN_AI_APPROVALS];

export const adminService = {
  // 1. DASHBOARD
  async fetchDashboard(): Promise<AdminDashboardData> {
    const res = await fetchApi<AdminDashboardData>('/admin/dashboard');
    return res.data;
  },

  // 2. USERS
  async fetchUsers(search?: string, role?: string): Promise<AdminUserItem[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'All') params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<AdminUserItem[]>(`/admin/users${query}`);
    return res.data || [];
  },

  async fetchUserById(id: string): Promise<any> {
    const res = await fetchApi<any>(`/admin/users/${id}`);
    return res.data;
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    const res = await fetchApi<any>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    return res.data;
  },

  // 3. DESTINATIONS & ATTRACTIONS & ACTIVITIES
  async fetchDestinations(search?: string): Promise<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetchApi<any[]>(`/admin/destinations${query}`);
    return res.data || [];
  },

  async createDestination(data: any): Promise<any> {
    const res = await fetchApi<any>('/admin/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateDestination(id: string, data: any): Promise<any> {
    const res = await fetchApi<any>(`/admin/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteDestination(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/destinations/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // Attractions API
  async fetchAttractions(destinationId?: string, search?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (destinationId && destinationId !== 'All') params.append('destinationId', destinationId);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<any[]>(`/admin/attractions${query}`);
    return res.data || [];
  },

  async createAttraction(data: any): Promise<any> {
    const res = await fetchApi<any>('/admin/attractions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateAttraction(id: string, data: any): Promise<any> {
    const res = await fetchApi<any>(`/admin/attractions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteAttraction(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/attractions/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async fetchCategories(): Promise<any[]> {
    const res = await fetchApi<any[]>('/admin/categories');
    return res.data || [];
  },

  async fetchActivities(destinationId?: string, category?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (destinationId) params.append('destinationId', destinationId);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<any[]>(`/admin/activities${query}`);
    return res.data || [];
  },

  async createActivity(data: any): Promise<any> {
    const res = await fetchApi<any>('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateActivity(id: string, data: any): Promise<any> {
    const res = await fetchApi<any>(`/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteActivity(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/activities/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // 4. TRIPS & USER APPROVAL MONITORING (Strictly read-only monitoring)
  async fetchTrips(
    filterOrStatus?: string | {
      status?: string;
      search?: string;
      tripType?: string;
      approvalStatus?: string;
      destination?: string;
      startDate?: string;
      endDate?: string;
    },
    searchParam?: string
  ): Promise<AdminTripItem[]> {
    const params = new URLSearchParams();
    if (typeof filterOrStatus === 'object' && filterOrStatus !== null) {
      if (filterOrStatus.status && filterOrStatus.status !== 'All') params.append('status', filterOrStatus.status);
      if (filterOrStatus.search) params.append('search', filterOrStatus.search);
      if (filterOrStatus.tripType && filterOrStatus.tripType !== 'All') params.append('tripType', filterOrStatus.tripType);
      if (filterOrStatus.approvalStatus && filterOrStatus.approvalStatus !== 'All') params.append('approvalStatus', filterOrStatus.approvalStatus);
      if (filterOrStatus.destination && filterOrStatus.destination !== 'All') params.append('destination', filterOrStatus.destination);
      if (filterOrStatus.startDate) params.append('startDate', filterOrStatus.startDate);
      if (filterOrStatus.endDate) params.append('endDate', filterOrStatus.endDate);
    } else {
      if (filterOrStatus && filterOrStatus !== 'All') params.append('status', filterOrStatus);
      if (searchParam) params.append('search', searchParam);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<AdminTripItem[]>(`/admin/trips${query}`);
    return res.data || [];
  },

  async fetchTripDetails(id: string): Promise<AdminTripDetail> {
    const res = await fetchApi<AdminTripDetail>(`/admin/trips/${id}`);
    return res.data;
  },

  // 5. BOOKINGS
  async fetchBookings(status?: string, search?: string): Promise<AdminBookingItem[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<AdminBookingItem[]>(`/admin/bookings${query}`);
    return res.data || [];
  },

  async updateBookingStatus(id: string, status: string): Promise<any> {
    const res = await fetchApi<any>(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // 5. CHATBOT PAYMENTS
  async fetchChatbotPayments(
    searchOrParams?: string | { search?: string; status?: string; startDate?: string; endDate?: string },
    statusParam?: string
  ): Promise<ChatbotPaymentItem[]> {
    const q = new URLSearchParams();
    if (typeof searchOrParams === 'object' && searchOrParams !== null) {
      if (searchOrParams.search) q.append('search', searchOrParams.search);
      if (searchOrParams.status && searchOrParams.status !== 'All') q.append('status', searchOrParams.status);
      if (searchOrParams.startDate) q.append('startDate', searchOrParams.startDate);
      if (searchOrParams.endDate) q.append('endDate', searchOrParams.endDate);
    } else {
      if (searchOrParams) q.append('search', searchOrParams);
      if (statusParam && statusParam !== 'All') q.append('status', statusParam);
    }
    const queryString = q.toString() ? `?${q.toString()}` : '';
    const res = await fetchApi<ChatbotPaymentItem[]>(`/admin/payments/chatbot${queryString}`);
    return res.data || [];
  },

  // 6. PROMO PAYMENTS
  async fetchPromoPayments(
    searchOrParams?: string | { search?: string; status?: string; startDate?: string; endDate?: string },
    statusParam?: string
  ): Promise<PromoPaymentItem[]> {
    const q = new URLSearchParams();
    if (typeof searchOrParams === 'object' && searchOrParams !== null) {
      if (searchOrParams.search) q.append('search', searchOrParams.search);
      if (searchOrParams.status && searchOrParams.status !== 'All') q.append('status', searchOrParams.status);
      if (searchOrParams.startDate) q.append('startDate', searchOrParams.startDate);
      if (searchOrParams.endDate) q.append('endDate', searchOrParams.endDate);
    } else {
      if (searchOrParams) q.append('search', searchOrParams);
      if (statusParam && statusParam !== 'All') q.append('status', statusParam);
    }
    const queryString = q.toString() ? `?${q.toString()}` : '';
    const res = await fetchApi<PromoPaymentItem[]>(`/admin/payments/promo${queryString}`);
    return res.data || [];
  },

  // 7. TRANSPORTATION: BUS, TRAIN, PROMO CODES
  async fetchPromoCodes(): Promise<PromoCodeItem[]> {
    const res = await fetchApi<PromoCodeItem[]>('/admin/transportation/promo-codes');
    return res.data || [];
  },

  async createPromoCode(data: Partial<PromoCodeItem>): Promise<PromoCodeItem> {
    const res = await fetchApi<PromoCodeItem>('/admin/transportation/promo-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updatePromoCode(id: string, data: Partial<PromoCodeItem>): Promise<PromoCodeItem> {
    const res = await fetchApi<PromoCodeItem>(`/admin/transportation/promo-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deletePromoCode(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/transportation/promo-codes/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },



  async fetchBusRoutes(search?: string): Promise<BusRouteItem[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetchApi<BusRouteItem[]>(`/admin/transportation/bus-routes${query}`);
    return res.data || [];
  },

  async createBusRoute(data: Partial<BusRouteItem>): Promise<BusRouteItem> {
    const res = await fetchApi<BusRouteItem>('/admin/transportation/bus-routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateBusRoute(id: string, data: Partial<BusRouteItem>): Promise<BusRouteItem> {
    const res = await fetchApi<BusRouteItem>(`/admin/transportation/bus-routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteBusRoute(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/transportation/bus-routes/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async fetchTrainSchedules(search?: string): Promise<TrainScheduleItem[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetchApi<TrainScheduleItem[]>(`/admin/transportation/train-schedules${query}`);
    return res.data || [];
  },

  async createTrainSchedule(data: Partial<TrainScheduleItem>): Promise<TrainScheduleItem> {
    const res = await fetchApi<TrainScheduleItem>('/admin/transportation/train-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateTrainSchedule(id: string, data: Partial<TrainScheduleItem>): Promise<TrainScheduleItem> {
    const res = await fetchApi<TrainScheduleItem>(`/admin/transportation/train-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteTrainSchedule(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/transportation/train-schedules/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // 7. AI TRAVEL GUIDE (VIRTUAL GUIDE)
  async fetchChatbotPackages(): Promise<ChatbotPackageItem[]> {
    const res = await fetchApi<ChatbotPackageItem[]>('/admin/ai-guide/packages');
    return res.data || [];
  },

  async createChatbotPackage(data: Partial<ChatbotPackageItem>): Promise<ChatbotPackageItem> {
    const res = await fetchApi<ChatbotPackageItem>('/admin/ai-guide/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateChatbotPackage(id: string, data: Partial<ChatbotPackageItem>): Promise<ChatbotPackageItem> {
    const res = await fetchApi<ChatbotPackageItem>(`/admin/ai-guide/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteChatbotPackage(id: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/admin/ai-guide/packages/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  async fetchPackagePurchases(): Promise<PackagePurchaseItem[]> {
    const res = await fetchApi<PackagePurchaseItem[]>('/admin/ai-guide/purchases');
    return res.data || [];
  },

  async fetchAiGuideStats(): Promise<any> {
    const res = await fetchApi<any>('/admin/ai-guide/stats');
    return res.data;
  },

  async fetchAiGuideUsage(): Promise<AIGuideUsageData> {
    const res = await fetchApi<AIGuideUsageData>('/admin/ai-guide/usage');
    return res.data;
  },

  async fetchAiGuideAnalytics(): Promise<AIGuideAnalyticsData> {
    const res = await fetchApi<AIGuideAnalyticsData>('/admin/ai-guide/analytics');
    return res.data;
  },

  async fetchAiGuideActivity(): Promise<any[]> {
    const res = await fetchApi<any[]>('/admin/ai-guide/activity');
    return res.data || [];
  },

  // 9. REVIEWS & FEEDBACK
  async fetchReviews(destinationId?: string, rating?: number): Promise<ReviewItem[]> {
    const params = new URLSearchParams();
    if (destinationId) params.append('destinationId', destinationId);
    if (rating) params.append('rating', rating.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchApi<ReviewItem[]>(`/admin/reviews${query}`);
    return res.data || [];
  },

  async updateReviewStatus(id: string, status: string): Promise<any> {
    const res = await fetchApi<any>(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  // 10. GENERAL SYSTEM MONITORING
  async fetchSystemMonitoring(activityType?: string): Promise<SystemMonitoringData> {
    const query = activityType && activityType !== 'All' ? `?activityType=${encodeURIComponent(activityType)}` : '';
    const res = await fetchApi<SystemMonitoringData>(`/admin/monitoring${query}`);
    return res.data;
  },

  // 9. AI WORKFLOW MONITORING
  async fetchWorkflows(): Promise<AIWorkflowMonitoringItem[]> {
    const res = await fetchApi<AIWorkflowMonitoringItem[]>('/admin/ai-workflows');
    return res.data || [];
  },

  async fetchWorkflowDetails(id: string): Promise<any> {
    const res = await fetchApi<any>(`/admin/ai-workflows/${id}`);
    return res.data;
  },

  // 10. ANALYTICS & REPORTS
  async fetchAnalytics(): Promise<any> {
    const res = await fetchApi<any>('/admin/analytics');
    return res.data;
  },

  // 11. SYSTEM SETTINGS
  async fetchSettings(): Promise<any> {
    const res = await fetchApi<any>('/admin/settings');
    return res.data;
  },

  // 12. BACKWARDS-COMPATIBILITY SYNCHRONOUS METHODS (for legacy mock views)
  getDestinations(): AdminDestination[] {
    return mockDestinations;
  },

  toggleDestinationStatus(id: string): AdminDestination[] {
    mockDestinations = mockDestinations.map((d) =>
      d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
    );
    return mockDestinations;
  },

  addDestination(data: Partial<AdminDestination>): AdminDestination {
    const newDest: AdminDestination = {
      id: `dest-${Date.now()}`,
      name: data.name || '',
      province: data.province || 'Western Province',
      category: data.category || 'Cultural',
      location: data.location || '',
      lat: data.lat || 6.9271,
      lng: data.lng || 79.8612,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80',
      attractionsCount: 0,
      status: 'Active',
      description: data.description || '',
      accessibility: data.accessibility || 'Highway Connected',
      bestTimeToVisit: data.bestTimeToVisit || 'Year-round',
      bookingsCount: 0,
      growthPercentage: 0,
      ...data,
    };
    mockDestinations.unshift(newDest);
    return newDest;
  },

  getAttractions(): AdminAttraction[] {
    return mockAttractions;
  },

  toggleAttractionStatus(id: string): AdminAttraction[] {
    mockAttractions = mockAttractions.map((a) =>
      a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a
    );
    return mockAttractions;
  },

  addAttraction(data: Partial<AdminAttraction>): AdminAttraction {
    const newAttr: AdminAttraction = {
      id: `attr-${Date.now()}`,
      name: data.name || '',
      destinationId: data.destinationId || 'dest-kandy',
      destinationName: data.destinationName || 'Kandy',
      category: data.category || 'Sightseeing',
      openingHours: data.openingHours || '08:00 AM – 06:00 PM',
      entryFee: data.entryFee || 'Free',
      duration: data.duration || '1-2 Hours',
      availability: 'Open All Year',
      status: 'Active',
      description: data.description || '',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80',
      ...data,
    };
    mockAttractions.unshift(newAttr);
    return newAttr;
  },

  getTours(): AdminTourPackage[] {
    return mockTours;
  },

  toggleTourStatus(id: string): AdminTourPackage[] {
    mockTours = mockTours.map((t) =>
      t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
    );
    return mockTours;
  },

  addTour(data: Partial<AdminTourPackage>): AdminTourPackage {
    const newTour: AdminTourPackage = {
      id: `pkg-${Date.now()}`,
      name: data.name || '',
      destinationId: data.destinationId || 'dest-kandy',
      destinationName: data.destinationName || 'Kandy',
      duration: data.duration || '3 Days',
      daysCount: data.daysCount || 3,
      price: data.price || 500,
      capacity: data.capacity || 10,
      bookingsCount: 0,
      transportOption: data.transportOption || 'Private AC Van',
      vehicleType: data.vehicleType || 'Van',
      status: 'Active',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
      description: data.description || '',
      activities: data.activities || [],
      includesGuideBot: true,
      ...data,
    };
    mockTours.unshift(newTour);
    return newTour;
  },

  getAvailability(): AdminAvailabilityEvent[] {
    return mockAvailability;
  },

  getApprovals(): AIApprovalItem[] {
    return mockApprovals;
  },

  approveItinerary(id: string): AIApprovalItem[] {
    mockApprovals = mockApprovals.map((a) =>
      a.id === id ? { ...a, aiWorkflowStatus: 'Approved by Operator' } : a
    );
    return mockApprovals;
  },

  rejectItinerary(id: string): AIApprovalItem[] {
    mockApprovals = mockApprovals.map((a) =>
      a.id === id ? { ...a, aiWorkflowStatus: 'Rejected' } : a
    );
    return mockApprovals;
  },
};
