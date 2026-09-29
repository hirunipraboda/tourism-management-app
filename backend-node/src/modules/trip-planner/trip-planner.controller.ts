import { Request, Response } from 'express';
import { TripPlannerService } from './trip-planner.service';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { prisma } from '../../config/database';

const service = new TripPlannerService();

export const generateTripPlan = async (req: Request, res: Response) => {
  try {
    const plan = await service.generatePlan(req.body);
    return res.status(200).json({
      success: true,
      message: 'AI trip itinerary generated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('[tripPlannerController.generateTripPlan] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI trip plan',
      error: (error as Error).message,
    });
  }
};

export const saveTripPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let userId = req.user?.userId;

    if (!userId) {
      // Find or fallback to default Tourist user if unauthenticated demo
      const tourist = await prisma.user.findFirst({ where: { role: 'USER' } });
      if (tourist) userId = tourist.id;
      else return res.status(401).json({ success: false, message: 'Authentication required to save trip' });
    }

    const { plan, requestInput } = req.body;
    if (!plan || !plan.trip) {
      return res.status(400).json({ success: false, message: 'Invalid trip plan payload' });
    }

    const savedTrip = await service.saveTripPlan(userId, plan, requestInput || {});

    return res.status(201).json({
      success: true,
      message: 'Trip plan saved to PostgreSQL database successfully',
      data: savedTrip,
    });
  } catch (error) {
    console.error('[tripPlannerController.saveTripPlan] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save trip plan',
      error: (error as Error).message,
    });
  }
};

export const getTripPlanById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const trip = await service.getTripPlanById(id, userId, isAdmin);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip plan not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip plan details retrieved',
      data: trip,
    });
  } catch (error) {
    console.error('[tripPlannerController.getTripPlanById] Error:', error);
    return res.status(403).json({
      success: false,
      message: (error as Error).message || 'Failed to fetch trip plan',
    });
  }
};

export const updateTripPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const updated = await service.updateTripPlan(id, req.body, userId, isAdmin);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Trip plan not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip plan updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[tripPlannerController.updateTripPlan] Error:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to update trip plan',
    });
  }
};

export const deleteTripPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const result = await service.deleteTripPlan(id, userId, isAdmin);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Trip plan not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip plan deleted successfully',
    });
  } catch (error) {
    console.error('[tripPlannerController.deleteTripPlan] Error:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to delete trip plan',
    });
  }
};

export const regenerateDay = async (req: Request, res: Response) => {
  try {
    const { dayNumber, location, requestInput } = req.body;
    const dayItem = await service.regenerateSingleDay(dayNumber || 1, location || 'Kandy', requestInput || {});

    return res.status(200).json({
      success: true,
      message: `Day ${dayNumber} itinerary recalculated`,
      data: dayItem,
    });
  } catch (error) {
    console.error('[tripPlannerController.regenerateDay] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to recalculate day itinerary',
      error: (error as Error).message,
    });
  }
};

export const regenerateActivity = async (req: Request, res: Response) => {
  try {
    const { activityId, currentTitle, location } = req.body;
    const replacement = await service.replaceSingleActivity(activityId || 'act-1', currentTitle || 'Tour', location || 'Sri Lanka');

    return res.status(200).json({
      success: true,
      message: 'Alternative activity option generated',
      data: replacement,
    });
  } catch (error) {
    console.error('[tripPlannerController.regenerateActivity] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to find alternative activity',
      error: (error as Error).message,
    });
  }
};
