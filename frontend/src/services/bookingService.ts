import { fetchApi } from './api';
import { MOCK_BOOKINGS } from '../mock/bookings';
import type { Booking } from '../types/travel';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetchApi<any[]>('/bookings');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((b: any) => ({
          id: b._id || b.id,
          bookingRef: `TL-BK-${(b._id || b.id).toString().slice(-4).toUpperCase()}`,
          customerName: b.userId?.name || 'Explorer Customer',
          customerEmail: b.userId?.email || 'tourist@travellink.lk',
          tourName: b.tourId?.title || b.tripId?.title || 'Sigiriya & Heritage Tour',
          bookingDate: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '2026-08-20',
          travelDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '2026-09-10',
          pax: b.numberOfParticipants || 2,
          totalAmount: b.totalPrice || 850,
          paymentStatus: 'Paid',
          bookingStatus: b.status === 'confirmed' ? 'Confirmed' : 'Pending',
        }));
      }
      return MOCK_BOOKINGS;
    } catch {
      return MOCK_BOOKINGS;
    }
  },
};
