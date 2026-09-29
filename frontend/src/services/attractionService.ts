import { fetchApi } from './api';
import { MOCK_ATTRACTIONS } from '../mock/attractions';
import type { Attraction } from '../types/travel';

export const attractionService = {
  async getAttractions(destinationId?: string): Promise<Attraction[]> {
    try {
      const endpoint = destinationId ? `/destinations/${destinationId}/attractions` : '/attractions';
      const res = await fetchApi<Attraction[]>(endpoint);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_ATTRACTIONS;
    } catch {
      return MOCK_ATTRACTIONS;
    }
  },
};
