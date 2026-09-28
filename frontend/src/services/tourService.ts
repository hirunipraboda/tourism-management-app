import type { TourPackage } from '../types/travel';

export const MOCK_TOURS: TourPackage[] = [
  {
    id: 'tour-1',
    code: 'NV-KY-01',
    title: 'Kyoto Imperial & Zen Garden Pilgrimage',
    destinationName: 'Kyoto',
    durationDays: 7,
    price: 2450,
    maxGroupSize: 12,
    status: 'Published',
    rating: 4.9,
  },
  {
    id: 'tour-2',
    code: 'NV-AM-02',
    title: 'Amalfi Coastal Yacht & Culinary Hideaways',
    destinationName: 'Amalfi Coast',
    durationDays: 5,
    price: 3200,
    maxGroupSize: 8,
    status: 'Published',
    rating: 4.95,
  },
];

export const tourService = {
  async getTours(): Promise<TourPackage[]> {
    return Promise.resolve(MOCK_TOURS);
  },
};
