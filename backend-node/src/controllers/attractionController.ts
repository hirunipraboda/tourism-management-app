import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getAttractionsByDestination = async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;

    const attractions = await prisma.attraction.findMany({
      where: { destinationId, isActive: true },
      include: {
        destination: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = attractions.map((a) => ({
      id: a.id,
      destinationId: a.destinationId,
      destinationName: a.destination?.name || '',
      name: a.name,
      category: a.category || 'Sightseeing',
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
      durationHours: a.durationHours,
      pricePerPerson: a.pricePerPerson || a.entryFee,
      rating: a.rating,
      reviewsCount: a.reviewsCount,
      status: a.isActive ? 'Active' : 'Maintenance',
    }));

    return res.status(200).json({
      success: true,
      message: 'Attractions retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('[attractionController.getAttractionsByDestination] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attractions',
      error: (error as Error).message,
    });
  }
};

export const getAttractionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attraction = await prisma.attraction.findUnique({
      where: { id },
      include: {
        destination: true,
      },
    });

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attraction details retrieved',
      data: attraction,
    });
  } catch (error) {
    console.error('[attractionController.getAttractionById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attraction',
      error: (error as Error).message,
    });
  }
};

export const createAttraction = async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;
    const bodyDestId = req.body.destinationId;
    const targetDestId = destinationId || bodyDestId;

    if (!targetDestId) {
      return res.status(400).json({
        success: false,
        message: 'destinationId is required',
      });
    }

    const attraction = await prisma.attraction.create({
      data: {
        ...req.body,
        destinationId: targetDestId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Attraction created successfully',
      data: attraction,
    });
  } catch (error) {
    console.error('[attractionController.createAttraction] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create attraction',
      error: (error as Error).message,
    });
  }
};

export const updateAttraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.attraction.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Attraction updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[attractionController.updateAttraction] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attraction',
      error: (error as Error).message,
    });
  }
};

export const deleteAttraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.attraction.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Attraction deleted successfully',
    });
  } catch (error) {
    console.error('[attractionController.deleteAttraction] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete attraction',
      error: (error as Error).message,
    });
  }
};
