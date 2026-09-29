import { fetchApi } from './api';
import { MOCK_TRIPS } from '../mock/trips';
import { MOCK_USER_TRIPS, UserTrip } from '../mock/tripsData';
import type { Trip } from '../types/travel';

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await fetchApi<any>('/trips');
      const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
      if (items.length > 0) {
        return items.map((t: any) => ({
          id: t.id || t._id,
          title: t.tripName || t.destination,
          travelerName: 'Hiruni Praboda',
          travelerEmail: 'hiruni@example.com',
          destinationName: t.destination || 'Sri Lanka Highlights',
          startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '2026-10-12',
          endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '2026-10-16',
          durationDays: t.durationDays || 5,
          budget: Number(t.budget) || 1200,
          paxCount: t.numberOfTravelers || 2,
          status: t.status || 'Confirmed',
          aiScore: 96,
        }));
      }
      return MOCK_TRIPS;
    } catch {
      return MOCK_TRIPS;
    }
  },

  async getUserTrips(userId: string = 'U001'): Promise<UserTrip[]> {
    try {
      const res = await fetchApi<any[]>(`/trips/user/${userId}`);
      const tripsList = Array.isArray(res.data) ? res.data : [];

      if (tripsList.length > 0) {
        const mapped: UserTrip[] = tripsList.map((t: any) => {
          const startDate = t.startDate ? new Date(t.startDate) : new Date();
          const endDate = t.endDate ? new Date(t.endDate) : new Date(startDate.getTime() + 86400000 * 4);
          const durationDays = t.durationDays || Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

          const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

          // Map itineraries
          const primaryItinerary = t.itineraries?.[0];
          const dailyItinerary = primaryItinerary?.days?.map((d: any) => ({
            day: d.dayNumber,
            date: d.date ? new Date(d.date).toISOString().split('T')[0] : '',
            title: d.title || `Day ${d.dayNumber}: ${d.location}`,
            activities: (d.items || []).map((itm: any) => ({
              time: itm.startTime && itm.endTime ? `${itm.startTime} - ${itm.endTime}` : '09:00 - 11:30',
              title: itm.activityName,
              location: itm.location || d.location,
              description: itm.notes || `Curated activity in ${d.location}`,
              status: 'Confirmed' as const,
              type: 'Sightseeing' as const,
            })),
          })) || [];

          // Map bookings
          const bookingsList = (t.bookings || []).map((b: any) => ({
            id: b.id,
            type: (b.serviceType === 'Hotel' ? 'Hotel' : b.serviceType === 'Transport' ? 'Transport' : 'Activity') as any,
            provider: b.serviceName || 'NOVA Travel Partner',
            details: `Booking for ${t.tripName || t.destination}`,
            dates: formattedDates,
            confirmationCode: `CONF-${b.id.substring(0, 6).toUpperCase()}`,
            amount: `$${b.totalAmount || 0}`,
            status: 'Confirmed' as const,
          }));

          let status: 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed' = 'Upcoming';
          if (t.status === 'Draft' || t.status === 'Planning' || t.status === 'Planned') status = 'Planning';
          else if (t.status === 'Ongoing') status = 'Ongoing';
          else if (t.status === 'Completed') status = 'Completed';
          else status = 'Upcoming';

          const destLower = (t.destination || '').toLowerCase();
          const imageUrl = destLower.includes('sigiriya')
            ? 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('nuwara') || destLower.includes('eliya')
            ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('ella')
            ? 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('kandy')
            ? 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('galle')
            ? 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('mirissa') || destLower.includes('weligama')
            ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
            : destLower.includes('yala')
            ? 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop&q=80';

          return {
            id: t.id,
            name: t.tripName || `${t.destination} Journey`,
            destination: t.destination,
            destinationId: t.destinationId || 'dest-general',
            dates: formattedDates,
            duration: `${durationDays} Days, ${Math.max(1, durationDays - 1)} Nights`,
            travelers: t.numberOfTravelers || 2,
            travelerNames: ['Hiruni Praboda'],
            status,
            imageUrl,
            budget: `$${t.budget || 600}`,
            spentBudget: bookingsList.length > 0 ? `$${bookingsList.reduce((sum: number, b: any) => sum + parseInt(b.amount.replace('$', '') || '0', 10), 0)}` : undefined,
            isFeatured: t.id === 'T001' || t.id === 'trip-kandy-escape',
            progress: {
              destination: true,
              preferences: true,
              aiPlanning: t.createdSource === 'AI',
              itinerary: dailyItinerary.length > 0,
              bookings: bookingsList.length > 0,
            },
            interests: t.interests || ['Culture', 'Nature'],
            itinerary: dailyItinerary,
            dailyItinerary,
            bookings: bookingsList,
            bookingsList,
          } as UserTrip;
        });

        // Read existing local cached trips so we don't wipe out freshly planned trips
        const localRaw = localStorage.getItem('nova_user_trips');
        let localTrips: UserTrip[] = [];
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) localTrips = parsed;
          } catch {}
        }

        // Merge: combine server trips with local cached trips, preserving rich client details
        const localMap = new Map<string, UserTrip>();
        for (const lt of localTrips) {
          if (lt && lt.id) localMap.set(lt.id, lt);
        }

        const enrichedServerTrips = mapped.map((st) => {
          const localMatch = localMap.get(st.id);
          if (!localMatch) return st;
          return {
            ...st,
            imageUrl: localMatch.imageUrl || st.imageUrl,
            notes: localMatch.notes || st.notes,
            aiNotes: localMatch.aiNotes || st.aiNotes,
            weatherForecast: localMatch.weatherForecast || st.weatherForecast,
            budgetBreakdown: localMatch.budgetBreakdown || st.budgetBreakdown,
            bookingsList: (localMatch.bookingsList && localMatch.bookingsList.length > 0) ? localMatch.bookingsList : st.bookingsList,
            dailyItinerary: (localMatch.dailyItinerary && localMatch.dailyItinerary.length > 0) ? localMatch.dailyItinerary : st.dailyItinerary,
            spentBudget: localMatch.spentBudget || st.spentBudget,
          };
        });

        const serverIdSet = new Set(mapped.map((t) => t.id));
        const localOnlyTrips = localTrips.filter((lt) => !serverIdSet.has(lt.id));
        const merged: UserTrip[] = [...localOnlyTrips, ...enrichedServerTrips];

        // Mirror cache to localStorage for offline convenience
        try {
          localStorage.setItem('nova_user_trips', JSON.stringify(merged));
        } catch {}

        return merged;
      }

      // If backend returns empty array, check localStorage mirror
      const cached = localStorage.getItem('nova_user_trips');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return MOCK_USER_TRIPS;
    } catch (e) {
      console.warn('Backend unavailable, reading trips from local mirror:', e);
      const cached = localStorage.getItem('nova_user_trips');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
      return MOCK_USER_TRIPS;
    }
  },

  async deleteTrip(tripId: string): Promise<boolean> {
    try {
      await fetchApi(`/trips/${tripId}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      console.warn(`Failed to delete trip ${tripId} from backend:`, e);
      return false;
    }
  },

  async createTrip(tripData: {
    tripName?: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfTravelers: number;
    budget: number;
    interests: string[];
    tripStyle?: string;
  }): Promise<any> {
    try {
      const res = await fetchApi<any>('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      return res.data;
    } catch (err) {
      console.warn('API trip creation failed, fallback to local storage', err);
      return null;
    }
  },
};

