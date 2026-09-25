import { MOCK_DESTINATIONS } from '../mock/destinations';
import type { Destination } from '../types/travel';

export const destinationService = {
  async getDestinations(): Promise<Destination[]> {
    return Promise.resolve(MOCK_DESTINATIONS);
  },
  async getDestinationById(id: string): Promise<Destination | undefined> {
    return Promise.resolve(MOCK_DESTINATIONS.find(d => d.id === id));
  },
};
