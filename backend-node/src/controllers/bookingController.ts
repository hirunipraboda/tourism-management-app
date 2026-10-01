import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BookingStatus, PaymentStatus, TravelOption } from '@prisma/client';

export const getBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isUserAdmin = req.user?.role === 'ADMIN';

    const where: any = isUserAdmin ? {} : { userId };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        tour: { select: { id: true, title: true, price: true } },
        trip: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      customerName: b.customerName || b.user?.name || 'Explorer Customer',
      customerEmail: b.customerEmail || b.user?.email || '',
      tourName: b.tour?.title || b.trip?.title || 'Sigiriya & Heritage Tour',
      bookingDate: b.createdAt.toISOString().split('T')[0],
      travelDate: b.startDate.toISOString().split('T')[0],
      pax: b.numberOfParticipants,
      totalAmount: b.totalPrice,
      paymentStatus: b.paymentStatus === 'PAID' ? 'Paid' : b.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Pending',
      bookingStatus: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'COMPLETED' ? 'Completed' : b.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
      travelOption: b.travelOption,
      transportRequired: b.transportRequired,
    }));

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    console.error('[bookingController.getBookings] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: (error as Error).message,
    });
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tour: true,
        trip: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user?.role !== 'ADMIN' && booking.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. Access restricted to own booking.' });
    }

    const formatted = {
      ...booking,
      bookingDate: booking.createdAt.toISOString().split('T')[0],
      travelDate: booking.startDate.toISOString().split('T')[0],
      pax: booking.numberOfParticipants,
      totalAmount: booking.totalPrice,
    };

    return res.status(200).json({
      success: true,
      message: 'Booking details retrieved',
      data: formatted,
    });
  } catch (error) {
    console.error('[bookingController.getBookingById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: (error as Error).message,
    });
  }
};

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tourId, tripId, customerName, customerEmail, numberOfParticipants, startDate, endDate, travelOption, transportRequired, totalPrice } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const bookingRef = `TL-BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId,
        tourId,
        tripId,
        customerName: customerName || 'Explorer',
        customerEmail: customerEmail || 'user@travellink.lk',
        numberOfParticipants: numberOfParticipants || 1,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        travelOption: travelOption && Object.values(TravelOption).includes(travelOption) ? travelOption : TravelOption.NONE,
        transportRequired: !!transportRequired,
        totalPrice: totalPrice || 100.0,
        paymentStatus: PaymentStatus.PENDING,
        status: BookingStatus.PENDING,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('[bookingController.createBooking] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: (error as Error).message,
    });
  }
};

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user?.role !== 'ADMIN') {
      if (existing.userId !== req.user?.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      if (status !== 'CANCELLED' && status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Only admins can modify booking status to confirmed/completed.' });
      }
    }

    const updateData: any = {};
    if (status) {
      const s = status.toUpperCase();
      if (s === 'CONFIRMED') updateData.status = BookingStatus.CONFIRMED;
      else if (s === 'CANCELLED') updateData.status = BookingStatus.CANCELLED;
      else if (s === 'COMPLETED') updateData.status = BookingStatus.COMPLETED;
      else updateData.status = BookingStatus.PENDING;
    }

    if (paymentStatus) {
      const p = paymentStatus.toUpperCase();
      if (p === 'PAID') updateData.paymentStatus = PaymentStatus.PAID;
      else if (p === 'REFUNDED') updateData.paymentStatus = PaymentStatus.REFUNDED;
      else updateData.paymentStatus = PaymentStatus.PENDING;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[bookingController.updateBookingStatus] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: (error as Error).message,
    });
  }
};

export const cancelBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user?.role !== 'ADMIN' && existing.userId !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updated,
    });
  } catch (error) {
    console.error('[bookingController.cancelBooking] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: (error as Error).message,
    });
  }
};
