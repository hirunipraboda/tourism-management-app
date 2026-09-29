import { fetchApi } from './api';
import { TripPlanningRequest, TripPlan, ItineraryDayItem, ItineraryActivityItem } from '../types/tripPlanner';

export const tripPlannerService = {
  async generateTripPlan(req: TripPlanningRequest): Promise<TripPlan> {
    const res = await fetchApi<TripPlan>('/trip-planner/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (!res.data) throw new Error(res.message || 'Failed to generate AI trip plan');
    return res.data;
  },

  async saveTripPlan(plan: TripPlan, requestInput: TripPlanningRequest): Promise<any> {
    const res = await fetchApi<any>('/trip-planner/save', {
      method: 'POST',
      body: JSON.stringify({ plan, requestInput }),
    });
    if (!res.data) throw new Error(res.message || 'Failed to save trip plan');
    return res.data;
  },

  async regenerateDay(dayNumber: number, location: string, requestInput: TripPlanningRequest): Promise<ItineraryDayItem> {
    const res = await fetchApi<ItineraryDayItem>('/trip-planner/regenerate-day', {
      method: 'POST',
      body: JSON.stringify({ dayNumber, location, requestInput }),
    });
    if (!res.data) throw new Error(res.message || 'Failed to regenerate day');
    return res.data;
  },

  async regenerateActivity(activityId: string, currentTitle: string, location: string): Promise<ItineraryActivityItem> {
    const res = await fetchApi<ItineraryActivityItem>('/trip-planner/regenerate-activity', {
      method: 'POST',
      body: JSON.stringify({ activityId, currentTitle, location }),
    });
    if (!res.data) throw new Error(res.message || 'Failed to replace activity');
    return res.data;
  },

  async getTripPlan(id: string): Promise<any> {
    const res = await fetchApi<any>(`/trip-planner/${id}`);
    if (!res.data) throw new Error(res.message || 'Failed to fetch trip plan');
    return res.data;
  },

  async deleteTripPlan(id: string): Promise<void> {
    await fetchApi<any>(`/trip-planner/${id}`, { method: 'DELETE' });
  },
};
