import { fetchApi } from './api';
import { MOCK_DESTINATIONS } from '../mock/destinations';
import type { Destination } from '../types/travel';

export const destinationService = {
  async getDestinations(): Promise<Destination[]> {
    try {
      const res = await fetchApi<any>('/destinations');
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.destinations)) return res.data.destinations;
      return MOCK_DESTINATIONS;
    } catch (e) {
      return MOCK_DESTINATIONS;
    }
  },
  async getDestinationById(id: string): Promise<Destination | undefined> {
    try {
      const res = await fetchApi<Destination>(`/destinations/${id}`);
      return res.data || MOCK_DESTINATIONS.find(d => d.id === id);
    } catch (e) {
      return MOCK_DESTINATIONS.find(d => d.id === id);
    }
  },
};
