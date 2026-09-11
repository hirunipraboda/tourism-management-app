import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { destinationId, tourId } = req.query;

    const where: any = {};
    if (destinationId) where.destinationId = destinationId as string;
    if (tourId) where.tourId = tourId as string;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        destination: { select: { id: true, name: true } },
        tour: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
    });
  } catch (error) {
    console.error('[reviewController.getReviews] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: (error as Error).message,
    });
  }
};

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { destinationId, tourId, rating, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!destinationId && !tourId) {
      return res.status(400).json({
        success: false,
        message: 'A review must be associated with a destination or a tour.',
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        destinationId,
        tourId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment,
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('[reviewController.createReview] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: (error as Error).message,
    });
  }
};

export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user?.role !== 'ADMIN' && existing.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only update your own review.' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[reviewController.updateReview] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: (error as Error).message,
    });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user?.role !== 'ADMIN' && existing.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only delete your own review.' });
    }

    await prisma.review.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('[reviewController.deleteReview] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: (error as Error).message,
    });
  }
};
