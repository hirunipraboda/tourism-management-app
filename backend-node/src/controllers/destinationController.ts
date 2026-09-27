import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { DestinationCategory, Province } from '@prisma/client';

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { search, category, province } = req.query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category && Object.values(DestinationCategory).includes(category as DestinationCategory)) {
      where.category = category as DestinationCategory;
    }

    if (province && Object.values(Province).includes(province as Province)) {
      where.province = province as Province;
    }

    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        include: {
          attractions: true,
          _count: {
            select: {
              attractions: true,
              trips: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.destination.count({ where }),
    ]);

    const formatted = destinations.map((d) => ({
      ...d,
      country: 'Sri Lanka',
      region: d.location,
      imageUrl: d.imageUrl,
      attractionsCount: d._count.attractions,
      activeTripsCount: d._count.trips,
      status: d.isActive ? 'Active' : 'Inactive',
    }));

    return res.status(200).json({
      success: true,
      message: 'Destinations retrieved successfully',
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[destinationController.getDestinations] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations',
      error: (error as Error).message,
    });
  }
};

export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const destination = await prisma.destination.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        attractions: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, profileImage: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tours: {
          include: {
            tour: true,
          },
        },
      },
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    const formatted = {
      ...destination,
      country: 'Sri Lanka',
      region: destination.location,
      imageUrl: destination.imageUrl,
      status: destination.isActive ? 'Active' : 'Inactive',
      attractionsCount: destination.attractions.length,
    };

    return res.status(200).json({
      success: true,
      message: 'Destination details retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('[destinationController.getDestinationById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch destination details',
      error: (error as Error).message,
    });
  }
};

export const createDestination = async (req: Request, res: Response) => {
  try {
    const { name, description, location, province, district, imageUrl, category, entryFee, openingTime, closingTime, bestTimeToVisit } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const destination = await prisma.destination.create({
      data: {
        name,
        slug,
        description,
        location,
        province: province || Province.CENTRAL,
        district,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
        category: category || DestinationCategory.HERITAGE,
        entryFee: entryFee || 0.0,
        openingTime,
        closingTime,
        bestTimeToVisit,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    console.error('[destinationController.createDestination] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create destination',
      error: (error as Error).message,
    });
  }
};

export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    const updated = await prisma.destination.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[destinationController.updateDestination] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update destination',
      error: (error as Error).message,
    });
  }
};

export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.destination.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    await prisma.destination.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    console.error('[destinationController.deleteDestination] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete destination',
      error: (error as Error).message,
    });
  }
};
