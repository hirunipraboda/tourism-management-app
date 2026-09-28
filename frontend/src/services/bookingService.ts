import { MOCK_BOOKINGS } from '../mock/bookings';
import type { Booking } from '../types/travel';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return Promise.resolve(MOCK_BOOKINGS);
  },
};
