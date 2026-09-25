import { fetchApi } from './api';

export interface TourPackagePayload {
    guideId: number;
    packageName: string;
    description: string;
    destination: string;
    durationDays: number;
    price: number;
    maxGroupSize: number;
    imageUrl?: string;
}

export interface TourPackageUpdatePayload {
    packageName: string;
    description: string;
    destination: string;
    durationDays: number;
    price: number;
    maxGroupSize: number;
    isActive: boolean;
    imageUrl?: string;
}

export interface TourPackageResponse {
    tourPackageId: number;
    guideId: number;
    guideName: string;
    packageName: string;
    description: string;
    destination: string;
    durationDays: number;
    price: number;
    maxGroupSize: number;
    isActive: boolean;
    createdAt: string;
    imageUrl?: string;
}

export const tourPackageService = {
    async getAll(guideId?: number): Promise<TourPackageResponse[]> {
        const query = guideId ? `?guideId=${guideId}` : '';
        const response = await fetchApi<TourPackageResponse[]>(`/tour-packages${query}`);
        return response.data;
    },

    async getById(id: number): Promise<TourPackageResponse> {
        const response = await fetchApi<TourPackageResponse>(`/tour-packages/${id}`);
        return response.data;
    },

    async getByGuide(guideId: number): Promise<TourPackageResponse[]> {
        const response = await fetchApi<TourPackageResponse[]>(`/guides/${guideId}/packages`);
        return response.data;
    },

    async create(payload: TourPackagePayload): Promise<TourPackageResponse> {
        const response = await fetchApi<TourPackageResponse>('/tour-packages', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.data;
    },

    async update(id: number, payload: TourPackageUpdatePayload): Promise<TourPackageResponse> {
        const response = await fetchApi<TourPackageResponse>(`/tour-packages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return response.data;
    },

    async deactivate(id: number): Promise<void> {
        await fetchApi<void>(`/tour-packages/${id}`, { method: 'DELETE' });
    },
};
