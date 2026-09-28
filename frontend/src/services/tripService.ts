import { MOCK_TRIPS } from '../mock/trips';
import type { Trip } from '../types/travel';

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    return Promise.resolve(MOCK_TRIPS);
  },
};
