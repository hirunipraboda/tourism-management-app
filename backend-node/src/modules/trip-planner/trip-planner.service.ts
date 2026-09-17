import { prisma } from '../../config/database';
import { TravelPlannerAgent } from './trip-planner.agent';
import { TripPlanningRequest, TripPlan, ItineraryDayItem, ItineraryActivityItem } from './trip-planner.types';
import { TripStatus } from '@prisma/client';

export class TripPlannerService {
  private agent: TravelPlannerAgent;

  constructor() {
    this.agent = new TravelPlannerAgent();
  }

  public async generatePlan(req: TripPlanningRequest): Promise<TripPlan> {
    return this.agent.generatePlan(req);
  }

  public async saveTripPlan(userId: string, plan: TripPlan, reqInput: TripPlanningRequest) {
    const startDate = new Date(reqInput.startDate || new Date());
    const endDate = new Date(reqInput.endDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));

    // Find destination records to link via TripDestination
    const targetDestNames = plan.trip.destinations;
    const dbDestinations = await prisma.destination.findMany({
      where: {
        name: { in: targetDestNames, mode: 'insensitive' },
      },
    });

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: plan.trip.title,
        description: plan.trip.description,
        startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
        endDate: isNaN(endDate.getTime()) ? new Date() : endDate,
        numberOfTravelers: plan.trip.travelers || 2,
        budget: plan.budget.total || reqInput.budget?.amount || 600,
        transportRequired: reqInput.transportPreference !== 'none',
        status: TripStatus.PLANNED,
        aiScore: plan.metadata.aiScore || 92.0,
        destinations: {
          create: dbDestinations.map((d) => ({
            destinationId: d.id,
          })),
        },
        itineraries: {
          create: plan.days.flatMap((day) =>
            day.activities.map((act) => ({
              dayNumber: day.day,
              date: isNaN(new Date(day.date).getTime()) ? undefined : new Date(day.date),
              timeSlot: act.time,
              title: act.title,
              description: act.description,
              activities: act.description,
              type: act.type,
              cost: act.estimatedCost,
              duration: `${act.durationMinutes} mins`,
            }))
          ),
        },
      },
      include: {
        destinations: { include: { destination: true } },
        itineraries: { orderBy: { dayNumber: 'asc' } },
      },
    });

    return trip;
  }

  public async getTripPlanById(id: string, userId?: string, isAdmin = false) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        destinations: { include: { destination: true } },
        itineraries: { orderBy: { dayNumber: 'asc' } },
      },
    });

    if (!trip) return null;
    if (!isAdmin && userId && trip.userId !== userId) {
      throw new Error('Forbidden. You do not have permission to view this saved trip plan.');
    }

    return trip;
  }

  public async updateTripPlan(id: string, updateData: any, userId?: string, isAdmin = false) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return null;
    if (!isAdmin && userId && existing.userId !== userId) {
      throw new Error('Forbidden. You can only update your own saved trip.');
    }

    return prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        destinations: { include: { destination: true } },
        itineraries: { orderBy: { dayNumber: 'asc' } },
      },
    });
  }

  public async deleteTripPlan(id: string, userId?: string, isAdmin = false) {
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return null;
    if (!isAdmin && userId && existing.userId !== userId) {
      throw new Error('Forbidden. You can only delete your own saved trip.');
    }

    await prisma.trip.delete({ where: { id } });
    return true;
  }

  public async regenerateSingleDay(dayNumber: number, location: string, reqInput: TripPlanningRequest): Promise<ItineraryDayItem> {
    return this.agent.regenerateSingleDay(dayNumber, location, reqInput);
  }

  public async replaceSingleActivity(activityId: string, currentTitle: string, location: string): Promise<ItineraryActivityItem> {
    return this.agent.replaceSingleActivity(activityId, currentTitle, location);
  }
}
