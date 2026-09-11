import { Request, Response } from 'express';

export const planTripWithAI = async (req: Request, res: Response) => {
  try {
    const { destination, durationDays, interests, budget } = req.body;

    const itinerary = [
      {
        dayNumber: 1,
        title: `Arrival & Welcome to ${destination || 'Sri Lanka'}`,
        description: `Explore top landmarks and experience local Sri Lankan cuisine in ${destination || 'Sigiriya & Kandy'}.`,
        activities: ['Check-in at boutique eco-lodge', 'Evening cultural walking tour', 'Authentic rice & curry dinner'],
        type: 'Attraction',
        cost: 45,
      },
      {
        dayNumber: 2,
        title: 'UNESCO Heritage & Nature Exploration',
        description: 'Guided excursion to ancient monuments and natural viewpoints.',
        activities: ['Early morning fortress climb', 'Spice garden guided tour', 'Sunset tea tasting'],
        type: 'Activity',
        cost: 65,
      },
    ];

    return res.status(200).json({
      success: true,
      message: 'AI trip itinerary generated successfully',
      data: {
        destination: destination || 'Sigiriya & Kandy',
        durationDays: durationDays || 3,
        aiScore: 94.5,
        estimatedTotalCost: (budget || 500),
        itinerary,
      },
    });
  } catch (error) {
    console.error('[aiController.planTripWithAI] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI trip plan',
      error: (error as Error).message,
    });
  }
};

export const novaGuideBotChat = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    const query = (message || '').toLowerCase();
    let reply = 'Ayubowan! I am NOVA, your intelligent Sri Lanka travel assistant. How can I help you plan your island adventure?';

    if (query.includes('sigiriya') || query.includes('fortress')) {
      reply = 'Sigiriya Lion Rock Citadel is a 5th-century ancient palace complex. Best climbed early morning around 06:30 AM to beat heat and crowds. Entry fee is $30 USD.';
    } else if (query.includes('kandy') || query.includes('tooth')) {
      reply = 'Kandy is Sri Lanka’s cultural heart! Be sure to visit Sri Dalada Maligawa (Temple of the Tooth Relic) during ceremony hours (05:30 AM, 09:30 AM, or 06:30 PM).';
    } else if (query.includes('yala') || query.includes('safari') || query.includes('leopard')) {
      reply = 'Yala National Park is famous for having one of the highest leopard densities in the world. Recommended booking: 4x4 morning jeep safari in Block 1.';
    } else if (query.includes('pickme') || query.includes('transport') || query.includes('car')) {
      reply = 'Through our official transport partner PickMe, you can get 10% OFF all rides across Sri Lanka using promo code TRAVELLINK10.';
    }

    return res.status(200).json({
      success: true,
      message: 'NOVA Guide Bot reply generated',
      data: {
        reply,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[aiController.novaGuideBotChat] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat query',
      error: (error as Error).message,
    });
  }
};
