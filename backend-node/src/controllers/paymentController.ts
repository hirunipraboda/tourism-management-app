import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { BookingStatus, PaymentStatus, TravelOption } from '@prisma/client';

export const processCheckout = async (req: Request, res: Response) => {
  try {
    const {
      type, // 'TRAVEL_PACKAGE' | 'AI_CHATBOT'
      customerName,
      customerEmail,
      customerPhone,
      packageName,
      amount,
      startDate,
      numberOfParticipants,
      paymentMethod,
      maskedCard,
      planId,
      tourId,
    } = req.body;

    const email = (customerEmail || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Customer email is required to process payment.' });
    }

    // Identify or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerName || 'Explorer Guest',
          email,
          password: 'Guest@' + Math.random().toString(36).slice(-8),
          role: 'USER',
          phone: customerPhone || null,
        },
      });
    }

    if (type === 'TRAVEL_PACKAGE') {
      const parsedAmount = Math.max(0, parseFloat(amount) || 100);
      const bookingRef = `TL-BK-${Math.floor(100000 + Math.random() * 900000)}`;

      // Match tour if possible
      let matchedTourId: string | undefined = tourId;
      if (!matchedTourId && packageName) {
        const foundTour = await prisma.tour.findFirst({
          where: { title: { contains: packageName, mode: 'insensitive' } },
        });
        if (foundTour) matchedTourId = foundTour.id;
      }

      const booking = await prisma.booking.create({
        data: {
          bookingRef,
          userId: user.id,
          tourId: matchedTourId,
          customerName: customerName || user.name,
          customerEmail: email,
          numberOfParticipants: Math.max(1, parseInt(numberOfParticipants) || 1),
          startDate: startDate ? new Date(startDate) : new Date(Date.now() + 7 * 86400000),
          totalPrice: parsedAmount,
          paymentStatus: PaymentStatus.PAID,
          status: BookingStatus.CONFIRMED,
          travelOption: TravelOption.PRIVATE,
          transportRequired: true,
        },
        include: {
          tour: { select: { title: true } },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Travel package payment completed and recorded successfully.',
        data: {
          orderId: booking.bookingRef,
          bookingId: booking.id,
          type: 'TRAVEL_PACKAGE',
          category: 'Travel Package',
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          packageName: booking.tour?.title || packageName || 'Travel Package Tour',
          amount: booking.totalPrice,
          paymentMethod: paymentMethod || 'Credit Card (Visa)',
          maskedCard: maskedCard || '•••• •••• •••• 4242',
          date: booking.createdAt,
          status: 'COMPLETED',
        },
      });
    } else if (type === 'AI_CHATBOT') {
      const parsedAmount = Math.max(0, parseFloat(amount) || 9.99);

      // Match or create chatbot package tier
      let pkg = await prisma.chatbotPackage.findFirst({
        where: {
          OR: [
            { name: { contains: packageName || '', mode: 'insensitive' } },
            { name: { contains: planId || '', mode: 'insensitive' } },
          ],
        },
      });

      if (!pkg) {
        pkg = await prisma.chatbotPackage.create({
          data: {
            name: packageName || 'AI Explorer Tier',
            description: 'Automated AI virtual travel guide subscription',
            price: parsedAmount,
            questionLimit: parsedAmount > 20 ? 500 : parsedAmount > 8 ? 100 : 50,
            durationDays: 30,
            status: 'Active',
            includesPhotoQueries: true,
          },
        });
      }

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (pkg.durationDays || 30));
      const queries = pkg.questionLimit || 50;

      const userPackage = await prisma.userChatbotPackage.create({
        data: {
          userId: user.id,
          packageId: pkg.id,
          price: parsedAmount,
          remainingQueries: queries,
          totalQueries: queries,
          status: 'Active',
          expiresAt: expiry,
        },
        include: {
          package: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'AI Chatbot subscription payment completed and recorded successfully.',
        data: {
          orderId: `AI-${userPackage.id.slice(0, 8).toUpperCase()}`,
          packagePurchaseId: userPackage.id,
          type: 'AI_CHATBOT',
          category: 'AI Chatbot',
          customerName: user.name,
          customerEmail: user.email,
          packageName: pkg.name,
          amount: userPackage.price,
          paymentMethod: paymentMethod || 'Credit Card (Stripe)',
          maskedCard: maskedCard || '•••• •••• •••• 4242',
          date: userPackage.createdAt,
          status: 'COMPLETED',
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid payment type. Must be either TRAVEL_PACKAGE or AI_CHATBOT.',
    });
  } catch (error) {
    console.error('[processCheckout] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process checkout payment.',
      error: (error as Error).message,
    });
  }
};
