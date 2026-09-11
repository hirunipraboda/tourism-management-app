import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TripStatus } from '@prisma/client';

export const getTrips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'ADMIN';

    const where: any = isUserAdmin ? {} : { userId };

    const trips = await prisma.trip.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        destinations: {
          include: { destination: { select: { id: true, name: true, imageUrl: true } } },
        },
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = trips.map((t) => {
      const destNames = t.destinations.map((td) => td.destination.name).join(', ') || 'Sri Lanka';
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: t.id,
        title: t.title,
        travelerName: t.user?.name || 'Explorer',
        travelerEmail: t.user?.email || '',
        destinationName: destNames,
        startDate: t.startDate.toISOString().split('T')[0],
        endDate: t.endDate.toISOString().split('T')[0],
        durationDays,
        budget: t.budget,
        paxCount: t.numberOfTravelers,
        status: t.status === 'PLANNED' ? 'Planning' : t.status === 'COMPLETED' ? 'Completed' : t.status === 'CANCELLED' ? 'Cancelled' : 'In Progress',
        aiScore: t.aiScore,
        transportRequired: t.transportRequired,
        itinerary: t.itineraries,
        destinations: t.destinations.map((td) => td.destination),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Trips retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('[tripController.getTrips] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trips',
      error: (error as Error).message,
    });
  }
};

export const getTripById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        destinations: {
          include: { destination: true },
        },
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
        bookings: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (req.user?.role !== 'ADMIN' && trip.userId !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only view your own trip.',
      });
    }

    const destNames = trip.destinations.map((td) => td.destination.name).join(', ') || 'Sri Lanka';
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const formatted = {
      ...trip,
      travelerName: trip.user?.name,
      travelerEmail: trip.user?.email,
      destinationName: destNames,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      durationDays,
      paxCount: trip.numberOfTravelers,
      status: trip.status === 'PLANNED' ? 'Planning' : trip.status === 'COMPLETED' ? 'Completed' : trip.status === 'CANCELLED' ? 'Cancelled' : 'In Progress',
      destinations: trip.destinations.map((td) => td.destination),
    };

    return res.status(200).json({
      success: true,
      message: 'Trip details retrieved',
      data: formatted,
    });
  } catch (error) {
    console.error('[tripController.getTripById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trip details',
      error: (error as Error).message,
    });
  }
};

export const createTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, numberOfTravelers, budget, transportRequired, destinationIds, itineraries } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfTravelers: numberOfTravelers || 1,
        budget: budget || 0,
        transportRequired: !!transportRequired,
        status: TripStatus.PLANNED,
        aiScore: 88.0,
        destinations: destinationIds && Array.isArray(destinationIds) ? {
          create: destinationIds.map((destId: string) => ({
            destinationId: destId,
          })),
        } : undefined,
        itineraries: itineraries && Array.isArray(itineraries) ? {
          create: itineraries.map((item: any, idx: number) => ({
            dayNumber: item.dayNumber || idx + 1,
            title: item.title,
            description: item.description,
            activities: item.activities,
            type: item.type || 'Attraction',
            cost: item.cost || 0,
            duration: item.duration,
          })),
        } : undefined,
      },
      include: {
        destinations: { include: { destination: true } },
        itineraries: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    });
  } catch (error) {
    console.error('[tripController.createTrip] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: (error as Error).message,
    });
  }
};

export const updateTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (req.user?.role !== 'ADMIN' && existing.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only update your own trip.' });
    }

    const { startDate, endDate, destinationIds, ...updateData } = req.body;

    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updated = await prisma.trip.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[tripController.updateTrip] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: (error as Error).message,
    });
  }
};

export const deleteTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (req.user?.role !== 'ADMIN' && existing.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only delete your own trip.' });
    }

    await prisma.trip.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('[tripController.deleteTrip] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: (error as Error).message,
    });
  }
};
