
import { fetchApi } from './api';
import type { Guide } from '../types/travel';

// What the registration form sends — matches the backend's CreateGuideRequest exactly
export interface CreateGuidePayload {
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  languages: string[];
  specialties: string[];
  yearsExperience?: number | null;
  avatarUrl?: string | null;
}

export const guideService = {
  async getGuides(): Promise<Guide[]> {
    const response = await fetchApi<Guide[]>('/guides');
    return response.data;
  },

  async getGuideById(id: string): Promise<Guide> {
    const response = await fetchApi<Guide>(`/guides/${id}`);
    return response.data;
  },

  async createGuide(payload: CreateGuidePayload): Promise<Guide> {
    const response = await fetchApi<Guide>('/guides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateGuide(id: string, payload: Partial<CreateGuidePayload>): Promise<Guide> {
    const response = await fetchApi<Guide>(`/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deactivateGuide(id: string): Promise<void> {
    await fetchApi<void>(`/guides/${id}`, { method: 'DELETE' });
  },

  // Admin-only: approve or reject a guide's verification status
  // verificationStatus: 'Verified' | 'Rejected' | 'Pending'
  async verifyGuide(id: string, verificationStatus: string): Promise<Guide> {
    const response = await fetchApi<Guide>(`/guides/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus }),
    });
    return response.data;
  },
};
