import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { BookingStatus } from '@prisma/client';

export const getAdminStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalDestinations,
      activeDestinations,
      totalTours,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalTrips,
      completedTrips,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.destination.count(),
      prisma.destination.count({ where: { isActive: true } }),
      prisma.tour.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.review.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin statistics computed successfully from PostgreSQL',
      data: {
        totalUsers,
        totalDestinations,
        activeDestinations,
        totalTours,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalTrips,
        completedTrips,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('[adminController.getAdminStatistics] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate admin statistics',
      error: (error as Error).message,
    });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const statsRes = await Promise.all([
      prisma.user.count(),
      prisma.destination.count({ where: { isActive: true } }),
      prisma.tour.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          tour: { select: { title: true } },
        },
      }),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
    ]);

    const dashboard = {
      kpis: {
        totalUsers: statsRes[0],
        activeDestinations: statsRes[1],
        tourPackages: statsRes[2],
        totalBookings: statsRes[3],
        completedTrips: statsRes[5],
      },
      recentBookings: statsRes[4],
    };

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard overview loaded',
      data: dashboard,
    });
  } catch (error) {
    console.error('[adminController.getAdminDashboard] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard',
      error: (error as Error).message,
    });
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === 'ADMIN' ? 'Administrator' : 'Tourist',
      status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
      createdAt: u.createdAt.toISOString().split('T')[0],
      lastActive: u.createdAt.toISOString().split('T')[0],
    }));

    return res.status(200).json({
      success: true,
      message: 'Admin users retrieved',
      data: formatted,
    });
  } catch (error) {
    console.error('[adminController.getAdminUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: (error as Error).message,
    });
  }
};

export const getAdminBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        tour: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      customerName: b.customerName || b.user?.name || 'Explorer Customer',
      customerEmail: b.customerEmail || b.user?.email || '',
      tourName: b.tour?.title || 'Sigiriya & Cultural Tour',
      bookingDate: b.createdAt.toISOString().split('T')[0],
      travelDate: b.startDate.toISOString().split('T')[0],
      pax: b.numberOfParticipants,
      totalAmount: b.totalPrice,
      paymentStatus: b.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
      status: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
    }));

    return res.status(200).json({
      success: true,
      message: 'Admin bookings retrieved',
      data: formatted,
    });
  } catch (error) {
    console.error('[adminController.getAdminBookings] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin bookings',
      error: (error as Error).message,
    });
  }
};
