import { fetchApi } from './api';
import { MOCK_BOOKINGS } from '../mock/bookings';
import type { Booking } from '../types/travel';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetchApi<any[]>('/bookings');
      if (Array.isArray(res.data)) {
        return res.data.map((b: any) => ({
          id: b.id || b._id,
          bookingRef: b.bookingRef || `TL-BK-${(b.id || b._id || '').toString().slice(-4).toUpperCase()}`,
          customerName: b.customerName || b.user?.name || 'Explorer Customer',
          customerEmail: b.customerEmail || b.user?.email || '',
          tourName: b.tourName || b.tour?.title || b.trip?.title || 'Sri Lanka Tour',
          bookingDate: b.bookingDate || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          travelDate: b.travelDate || (b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          pax: b.pax || b.numberOfParticipants || 1,
          totalAmount: b.totalAmount || b.totalPrice || 0,
          paymentStatus: b.paymentStatus || 'Pending',
          bookingStatus: b.bookingStatus || (b.status === 'CONFIRMED' || b.status === 'confirmed' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Pending'),
        }));
      }
      return [];
    } catch {
      return [];
    }
  },
};
