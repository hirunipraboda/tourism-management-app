import { fetchApi } from './api';

export interface CreateTourOperationPayload {
    tourPackageId: number;
    guideId: number;
    scheduledDate: string;
    numberOfTourists: number;
    totalCost: number;
    notes?: string;
}

export interface UpdateTourOperationPayload {
    tourPackageId: number;
    guideId: number;
    scheduledDate: string;
    numberOfTourists: number;
    totalCost: number;
    notes?: string;
}

export interface TourOperationResponse {
    tourOperationId: number;
    tourPackageId: number;
    packageName: string;
    guideId: number;
    guideName: string;
    scheduledDate: string;
    numberOfTourists: number;
    totalCost: number;
    status: 'Scheduled' | 'CheckedIn' | 'InProgress' | 'Completed' | 'NoShow' | 'Cancelled';
    notes: string;
    createdAt: string;
}

export const tourOperationService = {
    async getAll(guideId?: number, packageId?: number, status?: string): Promise<TourOperationResponse[]> {
        const params = new URLSearchParams();
        if (guideId) params.append('guideId', guideId.toString());
        if (packageId) params.append('packageId', packageId.toString());
        if (status) params.append('status', status);

        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await fetchApi<TourOperationResponse[]>(`/tour-operations${query}`);
        return response.data;
    },

    async getById(id: number): Promise<TourOperationResponse> {
        const response = await fetchApi<TourOperationResponse>(`/tour-operations/${id}`);
        return response.data;
    },

    async create(payload: CreateTourOperationPayload): Promise<TourOperationResponse> {
        const response = await fetchApi<TourOperationResponse>('/tour-operations', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.data;
    },

    async update(id: number, payload: UpdateTourOperationPayload): Promise<TourOperationResponse> {
        const response = await fetchApi<TourOperationResponse>(`/tour-operations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return response.data;
    },

    async updateStatus(id: number, status: string): Promise<TourOperationResponse> {
        const response = await fetchApi<TourOperationResponse>(`/tour-operations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await fetchApi<void>(`/tour-operations/${id}`, { method: 'DELETE' });
    },
};

