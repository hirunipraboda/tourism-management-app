import { fetchApi } from './api';

export interface TransportOption {
  id: string;
  transportType: 'BUS' | 'TRAIN' | 'PICKME';
  origin: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  routeNumber?: string;
  routeName?: string;
  direction?: string;
  intermediateStops?: string[] | string;
  trainName?: string;
  trainNumber?: string;
  departureStation?: string;
  arrivalStation?: string;
  trainType?: string;
  estimatedFare?: number;
  source: string;
  retrievedAt?: string;
  isSelected?: boolean;
}

export interface PublicTransportResponse {
  transportType: string;
  origin: string;
  destination: string;
  travelDate: string;
  buses: TransportOption[];
  trains: TransportOption[];
  totalOptions: number;
}

export interface BusTransportResponse {
  transportType: 'BUS';
  options: TransportOption[];
}

export interface TrainTransportResponse {
  transportType: 'TRAIN';
  options: TransportOption[];
}

export interface SelectTransportPayload {
  transportOptionId?: string;
  transportType?: string;
  origin?: string;
  destination?: string;
  travelDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  routeNumber?: string;
  routeName?: string;
  direction?: string;
  intermediateStops?: string[];
  trainName?: string;
  trainNumber?: string;
  departureStation?: string;
  arrivalStation?: string;
  trainType?: string;
  estimatedFare?: number;
  source?: string;
}

export interface SelectedTransportResponse {
  itineraryItemId: string;
  tripId?: string;
  transportOption: TransportOption;
  selectedAt: string;
}

export const transportService = {
  /**
   * Search both buses and trains between origin and destination.
   */
  async searchPublicTransport(
    origin: string,
    destination: string,
    date: string,
    preferredDepartureTime?: string,
    numberOfTravelers: number = 1
  ): Promise<PublicTransportResponse> {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      numberOfTravelers: numberOfTravelers.toString(),
    });
    if (preferredDepartureTime) {
      params.append('preferredDepartureTime', preferredDepartureTime);
    }

    const res = await fetchApi<PublicTransportResponse>(`/transport/public?${params.toString()}`, {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Search only bus routes.
   */
  async searchBuses(
    origin: string,
    destination: string,
    date: string,
    preferredDepartureTime?: string,
    numberOfTravelers: number = 1
  ): Promise<TransportOption[]> {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      numberOfTravelers: numberOfTravelers.toString(),
    });
    if (preferredDepartureTime) {
      params.append('preferredDepartureTime', preferredDepartureTime);
    }

    const res = await fetchApi<BusTransportResponse>(`/transport/bus?${params.toString()}`, {
      method: 'GET',
    });
    return res.data.options || [];
  },

  /**
   * Search only train schedules.
   */
  async searchTrains(
    origin: string,
    destination: string,
    date: string,
    preferredDepartureTime?: string,
    numberOfTravelers: number = 1
  ): Promise<TransportOption[]> {
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      numberOfTravelers: numberOfTravelers.toString(),
    });
    if (preferredDepartureTime) {
      params.append('preferredDepartureTime', preferredDepartureTime);
    }

    const res = await fetchApi<TrainTransportResponse>(`/transport/train?${params.toString()}`, {
      method: 'GET',
    });
    return res.data.options || [];
  },

  /**
   * Attach/select transport option for an itinerary item.
   */
  async selectItineraryTransport(
    itineraryItemId: string,
    payload: SelectTransportPayload
  ): Promise<SelectedTransportResponse> {
    const res = await fetchApi<SelectedTransportResponse>(`/itinerary-items/${itineraryItemId}/transport`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Retrieve selected transport for an itinerary item.
   */
  async getSelectedItineraryTransport(itineraryItemId: string): Promise<SelectedTransportResponse> {
    const res = await fetchApi<SelectedTransportResponse>(`/itinerary-items/${itineraryItemId}/transport`, {
      method: 'GET',
    });
    return res.data;
  },

  /**
   * Remove selected transport from an itinerary item.
   */
  async deleteItineraryTransport(itineraryItemId: string): Promise<boolean> {
    const res = await fetchApi<boolean>(`/itinerary-items/${itineraryItemId}/transport`, {
      method: 'DELETE',
    });
    return res.data;
  },
};
