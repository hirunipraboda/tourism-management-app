import { fetchApi } from './api';
import type { TourPackage } from '../types/travel';

export const MOCK_TOURS: TourPackage[] = [
  {
    id: 'tour-1',
    code: 'NV-KY-01',
    title: 'Essential Sri Lanka Heritage & Cultural Explorer',
    destinationName: 'Sigiriya & Kandy',
    durationDays: 7,
    price: 850,
    maxGroupSize: 12,
    status: 'Published',
    rating: 4.9,
  },
  {
    id: 'tour-2',
    code: 'NV-AM-02',
    title: 'Southern Coast Ocean & Yala Safari Trail',
    destinationName: 'Galle & Yala',
    durationDays: 5,
    price: 680,
    maxGroupSize: 8,
    status: 'Published',
    rating: 4.85,
  },
];

export const tourService = {
  async getTours(): Promise<TourPackage[]> {
    try {
      const res = await fetchApi<TourPackage[]>('/tours');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((t: any) => ({
          id: t._id || t.id,
          code: t.slug || t.code || 'TL-01',
          title: t.title,
          destinationName: typeof t.destinationIds?.[0] === 'object' ? t.destinationIds[0].name : (t.destinationName || 'Sri Lanka'),
          durationDays: t.duration || t.durationDays || 5,
          price: t.price,
          maxGroupSize: t.maxParticipants || t.maxGroupSize || 10,
          status: t.isActive ? 'Published' : 'Draft',
          rating: t.rating || 4.8,
        }));
      }
      return MOCK_TOURS;
    } catch {
      return MOCK_TOURS;
    }
  },
};
