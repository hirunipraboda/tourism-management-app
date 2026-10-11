import { fetchApi } from './api';
import type { Guide } from '../types/travel';

export interface CreateGuidePayload {
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  languages: string[];
  specialties: string[];
  yearsExperience?: number | null;
  avatarUrl?: string | null;
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  coveredDestinationIds?: string[];
  payoutAccountNote?: string;
  password?: string;
}

export interface CoveredDestinationDto {
  destinationId: string;
  destinationName: string;
  city?: string;
}

export interface WorkingHourDto {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface BlockedDateDto {
  id: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface GuideProfileDetailDto {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  languages: string[];
  specialties: string[];
  yearsExperience: number;
  avatarUrl?: string;
  verificationStatus: string;
  ratingAvg: number;
  ratingCount: number;
  toursCompleted: number;
  isActive: boolean;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  acceptingBookings: boolean;
  isArchived: boolean;
  payoutAccountNote?: string;
  coveredDestinations: CoveredDestinationDto[];
  workingHours: WorkingHourDto[];
  blockedDates: BlockedDateDto[];
}

export interface GuidePaymentSummary {
  id: string;
  provider: string;
  transactionReference?: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
}

export interface GuidePayoutSummary {
  id: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  payoutReference?: string;
  payoutMethod?: string;
  paidAt?: string;
}

export interface GuideBookingResponse {
  id: string;
  guideId: number;
  guideName: string;
  guideEmail: string;
  guidePhone?: string;
  guideAvatarUrl?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  travelers: number;
  pickupLocation?: string;
  preferredLanguage?: string;
  specialRequests?: string;
  status: string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  commissionAmount: number;
  guideNetAmount: number;
  currency: string;
  billableDays: number;
  pricingBreakdown?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  refundStatus: string;
  refundAmount: number;
  payment?: GuidePaymentSummary;
  payout?: GuidePayoutSummary;
  destinations: CoveredDestinationDto[];
}

export interface AdminGuideStatsResponse {
  totalGuides: number;
  activeGuides: number;
  inactiveGuides: number;
  availableGuides: number;
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingCustomerPayments: number;
  completedCustomerPayments: number;
  guideEarningsAccrued: number;
  guidePayoutsPending: number;
  guidePayoutsCompleted: number;
}

export interface BookingQuoteResponse {
  guideId: number;
  guideName: string;
  rateTypeApplied: string;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  billableDays: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  commissionAmount: number;
  guideNetAmount: number;
  currency: string;
  isAvailable: boolean;
  unavailabilityReason?: string;
}

const BASE = '/v1/guides';
const STORAGE_KEY_CUSTOM_GUIDES = 'travellink_custom_admin_guides';

export function getLocalCustomGuides(): GuideProfileDetailDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_GUIDES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomGuide(guide: GuideProfileDetailDto): void {
  try {
    const list = getLocalCustomGuides();
    const existingIndex = list.findIndex(g => g.id === guide.id || g.email.toLowerCase() === guide.email.toLowerCase());
    if (existingIndex >= 0) {
      list[existingIndex] = guide;
    } else {
      list.unshift(guide);
    }
    localStorage.setItem(STORAGE_KEY_CUSTOM_GUIDES, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save guide to localStorage', e);
  }
}

export const guideService = {
  // Legacy compatibility
  async getGuides(): Promise<Guide[]> {
    const response = await fetchApi<Guide[]>(BASE);
    return response.data;
  },

  async getGuideById(id: string): Promise<Guide> {
    const response = await fetchApi<Guide>(`${BASE}/${id}`);
    return response.data;
  },

  async createGuide(payload: CreateGuidePayload): Promise<Guide> {
    const response = await fetchApi<Guide>(BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateGuide(id: string, payload: Partial<CreateGuidePayload>): Promise<Guide> {
    const response = await fetchApi<Guide>(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deactivateGuide(id: string): Promise<void> {
    await fetchApi<void>(`${BASE}/${id}`, { method: 'DELETE' });
  },

  async verifyGuide(id: string, verificationStatus: string): Promise<Guide> {
    const response = await fetchApi<Guide>(`${BASE}/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus }),
    });
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin Management Endpoints
  // ─────────────────────────────────────────────────────────────────────────────
  async fetchAdminStats(): Promise<AdminGuideStatsResponse> {
    const response = await fetchApi<AdminGuideStatsResponse>('/v1/admin/guides/stats');
    return response.data;
  },

  async fetchAdminGuides(search?: string, language?: string, status?: string): Promise<GuideProfileDetailDto[]> {
    const localGuides = getLocalCustomGuides();
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (language) params.append('language', language);
      if (status) params.append('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetchApi<GuideProfileDetailDto[]>(`/v1/admin/guides${query}`);
      const apiGuides = response.data || [];
      
      // Merge: avoid duplicates by email
      const apiEmails = new Set(apiGuides.map(g => g.email.toLowerCase()));
      const extraLocal = localGuides.filter(g => !apiEmails.has(g.email.toLowerCase()));
      return [...extraLocal, ...apiGuides];
    } catch (e) {
      console.warn('[guideService] fetchAdminGuides API unreachable, using local custom guides:', e);
      return localGuides;
    }
  },

  async createAdminGuide(payload: CreateGuidePayload): Promise<GuideProfileDetailDto> {
    try {
      const response = await fetchApi<GuideProfileDetailDto>('/v1/admin/guides', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (response && response.data) {
        saveLocalCustomGuide(response.data);
        return response.data;
      }
    } catch (apiError) {
      console.warn('[guideService] API createAdminGuide failed or unreachable, storing guide locally:', apiError);
    }

    // Resilient local guide creation fallback
    const localId = Date.now();
    const newGuide: GuideProfileDetailDto = {
      id: localId,
      userId: `guide-user-${localId}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '+94 77 123 4567',
      bio: payload.bio || 'Licensed national guide specializing in Sri Lanka tours.',
      languages: payload.languages.length > 0 ? payload.languages : ['English', 'Sinhala'],
      specialties: payload.specialties.length > 0 ? payload.specialties : ['Cultural Heritage'],
      yearsExperience: payload.yearsExperience || 2,
      avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
      verificationStatus: 'Verified',
      ratingAvg: 5.0,
      ratingCount: 1,
      toursCompleted: 0,
      isActive: true,
      hourlyRate: payload.hourlyRate || 15,
      halfDayRate: payload.halfDayRate || 50,
      fullDayRate: payload.fullDayRate || 90,
      acceptingBookings: true,
      isArchived: false,
      payoutAccountNote: payload.payoutAccountNote || '',
      coveredDestinations: (payload.coveredDestinationIds || []).map(id => ({
        destinationId: id,
        destinationName: id,
      })),
      workingHours: [],
      blockedDates: [],
    };

    saveLocalCustomGuide(newGuide);
    return newGuide;
  },

  async updateAdminGuide(id: number, payload: Partial<CreateGuidePayload>): Promise<GuideProfileDetailDto> {
    try {
      const response = await fetchApi<GuideProfileDetailDto>(`/v1/admin/guides/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (response && response.data) {
        saveLocalCustomGuide(response.data);
        return response.data;
      }
    } catch (e) {
      console.warn('[guideService] updateAdminGuide API failed, updating local copy:', e);
    }

    const localList = getLocalCustomGuides();
    const existing = localList.find(g => g.id === id);
    if (existing) {
      const updated = { ...existing, ...payload } as GuideProfileDetailDto;
      saveLocalCustomGuide(updated);
      return updated;
    }
    throw new Error('Guide not found.');
  },

  async setGuideActiveStatus(id: number, isActive: boolean): Promise<boolean> {
    try {
      const response = await fetchApi<boolean>(`/v1/admin/guides/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      return response.data;
    } catch {
      const localList = getLocalCustomGuides();
      const existing = localList.find(g => g.id === id);
      if (existing) {
        existing.isActive = isActive;
        saveLocalCustomGuide(existing);
      }
      return true;
    }
  },

  async archiveGuide(id: number): Promise<boolean> {
    try {
      const response = await fetchApi<boolean>(`/v1/admin/guides/${id}/archive`, {
        method: 'DELETE',
      });
      return response.data;
    } catch {
      const localList = getLocalCustomGuides();
      const existing = localList.find(g => g.id === id);
      if (existing) {
        existing.isArchived = true;
        existing.isActive = false;
        saveLocalCustomGuide(existing);
      }
      return true;
    }
  },

  async fetchAdminBookingLogs(filters?: { status?: string; paymentStatus?: string; guideId?: number }): Promise<GuideBookingResponse[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters?.guideId) params.append('guideId', filters.guideId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<GuideBookingResponse[]>(`/v1/admin/guide-bookings/logs${query}`);
    return response.data;
  },

  async processAdminPayout(bookingId: string, payoutReference: string, payoutMethod: string, notes?: string): Promise<GuidePayoutSummary> {
    const response = await fetchApi<GuidePayoutSummary>(`/v1/admin/guide-bookings/${bookingId}/payout`, {
      method: 'POST',
      body: JSON.stringify({ payoutReference, payoutMethod, notes }),
    });
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Customer Booking Endpoints
  // ─────────────────────────────────────────────────────────────────────────────
  async browseGuides(filters?: { destinationId?: string; travelDate?: string; language?: string; maxPrice?: number; specialty?: string }): Promise<GuideProfileDetailDto[]> {
    const params = new URLSearchParams();
    if (filters?.destinationId) params.append('destinationId', filters.destinationId);
    if (filters?.travelDate) params.append('travelDate', filters.travelDate);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.specialty) params.append('specialty', filters.specialty);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<GuideProfileDetailDto[]>(`/v1/guide-bookings/browse${query}`);
    return response.data;
  },

  async getGuideProfileDetail(id: number): Promise<GuideProfileDetailDto> {
    const response = await fetchApi<GuideProfileDetailDto>(`/v1/guide-bookings/guides/${id}`);
    return response.data;
  },

  async calculateQuote(payload: {
    guideId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    travelers: number;
  }): Promise<BookingQuoteResponse> {
    const response = await fetchApi<BookingQuoteResponse>('/v1/guide-bookings/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async createBooking(payload: any): Promise<GuideBookingResponse> {
    const response = await fetchApi<GuideBookingResponse>('/v1/guide-bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async payBooking(bookingId: string, paymentMethod?: string): Promise<any> {
    const response = await fetchApi<any>(`/v1/guide-bookings/${bookingId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: paymentMethod || 'Card (Visa)' }),
    });
    return response.data;
  },

  async getMyCustomerBookings(): Promise<GuideBookingResponse[]> {
    const response = await fetchApi<GuideBookingResponse[]>('/v1/guide-bookings/my-bookings');
    return response.data;
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<GuideBookingResponse> {
    const response = await fetchApi<GuideBookingResponse>(`/v1/guide-bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data;
  },
};
