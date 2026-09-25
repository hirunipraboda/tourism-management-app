import { fetchApi } from './api';

export interface CreateAvailabilityPayload {
    guideId: number;
    availableDate: string; // YYYY-MM-DD
    startTime: string;     // HH:mm:ss
    endTime: string;       // HH:mm:ss
}

export interface AvailabilitySlotResponse {
    availabilityId: number;
    guideId: number;
    guideName: string;
    availableDate: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

export const guideAvailabilityService = {
    async getByGuide(guideId: number): Promise<AvailabilitySlotResponse[]> {
        const response = await fetchApi<AvailabilitySlotResponse[]>(`/guides/${guideId}/availability`);
        return response.data;
    },

    async create(guideId: number, payload: CreateAvailabilityPayload): Promise<AvailabilitySlotResponse> {
        const response = await fetchApi<AvailabilitySlotResponse>(`/guides/${guideId}/availability`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.data;
    },

    async delete(guideId: number, availabilityId: number): Promise<void> {
        await fetchApi<void>(`/guides/${guideId}/availability/${availabilityId}`, {
            method: 'DELETE',
        });
    },
};
