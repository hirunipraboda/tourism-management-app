import { fetchApi } from './api';
import { MOCK_TRIPS } from '../mock/trips';
import type { Trip } from '../types/travel';

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await fetchApi<any[]>('/trips');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((t: any) => ({
          id: t._id || t.id,
          title: t.title,
          travelerName: t.userId?.name || 'Tourist Explorer',
          travelerEmail: t.userId?.email || 'tourist@travellink.lk',
          destinationName: t.destinations?.[0] || 'Sri Lanka Highlights',
          startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '2026-09-10',
          endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '2026-09-17',
          durationDays: 7,
          budget: 1500,
          paxCount: t.numberOfTravelers || 2,
          status: 'Confirmed',
          aiScore: 96,
        }));
      }
      return MOCK_TRIPS;
    } catch {
      return MOCK_TRIPS;
    }
  },
};
