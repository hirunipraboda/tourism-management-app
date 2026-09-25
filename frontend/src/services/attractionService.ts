import { MOCK_ATTRACTIONS } from '../mock/attractions';
import type { Attraction } from '../types/travel';

export const attractionService = {
  async getAttractions(): Promise<Attraction[]> {
    return Promise.resolve(MOCK_ATTRACTIONS);
  },
};
