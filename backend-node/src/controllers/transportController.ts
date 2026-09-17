import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getTransportPartners = async (req: Request, res: Response) => {
  try {
    const partners = await prisma.transportPartner.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    if (partners.length === 0) {
      // Fallback response for PickMe partner requirement
      return res.status(200).json({
        success: true,
        message: 'Transport partners retrieved',
        data: [
          {
            id: 'pickme-default',
            name: 'PickMe Sri Lanka',
            description: 'Official transportation partner offering comfortable, reliable cars, tuk-tuks, and vans across Sri Lanka with exclusive Travel Link discounts.',
            logo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80',
            websiteUrl: 'https://pickme.lk',
            appUrl: 'https://pickme.lk/download',
            discount: 10,
            discountDescription: 'Introducing PickMe — our transportation partner. Download the PickMe app through Travel Link and get 10% off your rides using promo code TRAVELLINK10.',
            isActive: true,
          },
        ],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transport partners retrieved successfully',
      data: partners,
    });
  } catch (error) {
    console.error('[transportController.getTransportPartners] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transport partners',
      error: (error as Error).message,
    });
  }
};
