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
          title: t.title || t.tripName || t.destination,
          travelerName: t.travelerName || t.user?.name || 'Explorer',
          travelerEmail: t.travelerEmail || t.user?.email || '',
          destinationName: t.destinationName || t.destination || 'Sri Lanka Highlights',
          startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          durationDays: t.durationDays || 5,
          budget: Number(t.budget) || 1200,
          paxCount: t.paxCount || t.numberOfTravelers || 2,
          status: t.status || 'Confirmed',
          aiScore: t.aiScore || 90,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async getUserTrips(userId?: string): Promise<UserTrip[]> {
    try {
      const endpoint = userId ? `/trips` : `/trips`;
      const res = await fetchApi<any[]>(endpoint);
      const tripsList = Array.isArray(res.data) ? res.data : [];

      if (tripsList.length > 0) {
        const mapped: UserTrip[] = tripsList.map((t: any) => {
          const startDate = t.startDate ? new Date(t.startDate) : new Date();
          const endDate = t.endDate ? new Date(t.endDate) : new Date(startDate.getTime() + 86400000 * 4);
          const durationDays = t.durationDays || Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

          const formattedDates = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

          // Map itineraries
          const primaryItinerary = t.itineraries?.[0];
          const dailyItinerary = (t.itineraries || []).map((d: any, idx: number) => ({
            day: d.dayNumber || idx + 1,
            date: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
            title: d.title || `Day ${d.dayNumber || idx + 1}`,
            activities: Array.isArray(d.activities) ? d.activities.map((act: any) => ({
              time: act.time || '09:00 - 11:30',
              title: act.title || act.activityName || 'Activity',
              location: act.location || 'Location',
              description: act.description || '',
              status: 'Confirmed' as const,
              type: 'Sightseeing' as const,
            })) : [],
          }));

          // Map bookings
          const bookingsList = (t.bookings || []).map((b: any) => ({
            id: b.id,
            type: 'Hotel' as const,
            provider: 'NOVA Partner',
            details: `Booking for ${t.title || t.destinationName || 'Trip'}`,
            dates: formattedDates,
            confirmationCode: `CONF-${(b.id || '').substring(0, 6).toUpperCase()}`,
            amount: `$${b.totalPrice || b.totalAmount || 0}`,
            status: 'Confirmed' as const,
          }));

          let status: 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed' = 'Upcoming';
          if (t.status === 'Draft' || t.status === 'Planning' || t.status === 'PLANNED') status = 'Planning';
          else if (t.status === 'Ongoing' || t.status === 'IN_PROGRESS' || t.status === 'In Progress') status = 'Ongoing';
          else if (t.status === 'Completed' || t.status === 'COMPLETED') status = 'Completed';
          else status = 'Upcoming';

          const destLower = (t.destinationName || t.destination || t.title || '').toLowerCase();
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
            name: t.title || t.tripName || `${t.destinationName || 'Sri Lanka'} Journey`,
            destination: t.destinationName || t.destination || 'Sri Lanka',
            destinationId: t.destinationId || 'dest-general',
            dates: formattedDates,
            duration: `${durationDays} Days, ${Math.max(1, durationDays - 1)} Nights`,
            travelers: t.paxCount || t.numberOfTravelers || 1,
            travelerNames: [t.travelerName || t.user?.name || 'Explorer'],
            status,
            imageUrl,
            budget: `$${t.budget || 0}`,
            spentBudget: bookingsList.length > 0 ? `$${bookingsList.reduce((sum: number, b: any) => sum + parseInt(b.amount.replace('$', '') || '0', 10), 0)}` : undefined,
            isFeatured: false,
            progress: {
              destination: true,
              preferences: true,
              aiPlanning: true,
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

        return mapped;
      }

      return [];
    } catch (e) {
      console.warn('Backend trips fetch error:', e);
      return [];
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
      // Backend reads 'title' not 'tripName' — map the field correctly
      const { tripName, ...rest } = tripData;
      const res = await fetchApi<any>('/trips', {
        method: 'POST',
        body: JSON.stringify({ ...rest, title: tripName || tripData.destination }),
      });
      return res.data;
    } catch (err) {
      console.warn('API trip creation failed, fallback to local storage', err);
      return null;
    }
  },
};

