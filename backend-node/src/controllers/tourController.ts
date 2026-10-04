import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { TourCategory } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getTours = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { search, category, destination, maxPrice, maxDuration } = req.query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category && Object.values(TourCategory).includes(category as TourCategory)) {
      where.category = category as TourCategory;
    }

    if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice as string) };
    }

    if (maxDuration) {
      where.durationDays = { lte: parseInt(maxDuration as string) };
    }

    if (destination) {
      where.destinations = {
        some: {
          destination: {
            name: { contains: destination as string, mode: 'insensitive' },
          },
        },
      };
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          destinations: {
            include: {
              destination: { select: { id: true, name: true, location: true } },
            },
          },
          itineraries: {
            orderBy: { dayNumber: 'asc' },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tour.count({ where }),
    ]);

    const formatted = tours.map((t) => {
      const destNames = t.destinations.map((td) => td.destination.name).join(' & ');
      return {
        id: t.id,
        code: t.code || t.slug,
        title: t.title,
        destinationName: destNames || 'Sri Lanka',
        durationDays: t.durationDays,
        price: t.price,
        currency: t.currency,
        maxGroupSize: t.maxGroupSize,
        status: t.isActive ? 'Published' : 'Draft',
        rating: t.rating,
        category: t.category,
        imageUrl: t.imageUrl,
        itinerary: t.itineraries,
        destinations: t.destinations.map((td) => td.destination),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Tours retrieved successfully',
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[tourController.getTours] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tours',
      error: (error as Error).message,
    });
  }
};

export const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tour = await prisma.tour.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { code: id },
        ],
      },
      include: {
        destinations: {
          include: {
            destination: true,
          },
        },
        itineraries: {
          orderBy: { dayNumber: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    const destNames = tour.destinations.map((td) => td.destination.name).join(' & ');
    const formatted = {
      ...tour,
      code: tour.code || tour.slug,
      destinationName: destNames || 'Sri Lanka',
      status: tour.isActive ? 'Published' : 'Draft',
      destinations: tour.destinations.map((td) => td.destination),
    };

    return res.status(200).json({
      success: true,
      message: 'Tour details retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('[tourController.getTourById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tour details',
      error: (error as Error).message,
    });
  }
};

export const createTour = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, durationDays, price, currency, imageUrl, maxGroupSize, category, destinationIds, itineraries } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const code = `NV-${title.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const tour = await prisma.tour.create({
      data: {
        title,
        slug,
        code,
        description,
        durationDays: durationDays || 1,
        price,
        currency: currency || 'USD',
        imageUrl,
        maxGroupSize: maxGroupSize || 10,
        category: category || TourCategory.CULTURAL,
        createdById: req.user?.userId,
        destinations: destinationIds && Array.isArray(destinationIds) ? {
          create: destinationIds.map((destId: string, idx: number) => ({
            destinationId: destId,
            order: idx + 1,
          })),
        } : undefined,
        itineraries: itineraries && Array.isArray(itineraries) ? {
          create: itineraries.map((item: any, idx: number) => ({
            dayNumber: item.dayNumber || idx + 1,
            title: item.title,
            description: item.description,
            activities: item.activities,
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
      message: 'Tour created successfully',
      data: tour,
    });
  } catch (error) {
    console.error('[tourController.createTour] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create tour',
      error: (error as Error).message,
    });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tour.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found',
      });
    }

    const { destinationIds, ...updateData } = req.body;

    const updated = await prisma.tour.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Tour updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[tourController.updateTour] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update tour',
      error: (error as Error).message,
    });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.tour.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Tour deleted successfully',
    });
  } catch (error) {
    console.error('[tourController.deleteTour] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete tour',
      error: (error as Error).message,
    });
  }
};
