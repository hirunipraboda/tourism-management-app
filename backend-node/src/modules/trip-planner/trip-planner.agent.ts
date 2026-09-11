import {
  TripPlanningRequest,
  TripPlan,
  ItineraryDayItem,
  ItineraryActivityItem,
  BudgetBreakdown,
  TripWarning,
  TripRecommendation,
  DestinationResearchAgent,
  RouteTravelOptimizationAgent,
  ItineraryOptimizationValidationAgent,
  DestinationResearchRequest,
  DestinationResearchResult,
  RouteOptimizationRequest,
  RouteOptimizationResult,
  ItineraryValidationRequest,
  ItineraryValidationResult,
} from './trip-planner.types';
const uuidv4 = (): string => 'tp-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);

// Modular Fallback Sub-Agents
export class DefaultDestinationResearchAgent implements DestinationResearchAgent {
  async research(request: DestinationResearchRequest): Promise<DestinationResearchResult> {
    const list = request.targetDestinations.length > 0 ? request.targetDestinations : ['Sigiriya', 'Kandy', 'Ella'];
    return {
      destinationsInfo: list.map((name) => ({
        name,
        topAttractions: [`${name} Cultural Tour`, `${name} Nature Walk`, `${name} Local Cuisine`],
        bestTimeToVisit: 'Dry Season (Dec - Apr)',
        highlights: `Famous for stunning vistas, rich historical background, and local Sri Lankan culture.`,
      })),
    };
  }
}

export class DefaultRouteOptimizationAgent implements RouteTravelOptimizationAgent {
  async optimize(request: RouteOptimizationRequest): Promise<RouteOptimizationResult> {
    const ordered = [...request.destinations];
    return {
      orderedDestinations: ordered.length > 0 ? ordered : ['Sigiriya', 'Kandy', 'Ella'],
      estimatedTotalTravelDistanceKm: 320,
      recommendedTransport: 'Private AC Sedan / Vehicle with PickMe Partner Integration',
    };
  }
}

export class DefaultItineraryValidationAgent implements ItineraryOptimizationValidationAgent {
  async validate(request: ItineraryValidationRequest): Promise<ItineraryValidationResult> {
    const warnings: TripWarning[] = [];
    const totalCost = request.days.reduce((acc, d) => acc + d.estimatedCost, 0);

    if (totalCost > request.budgetAmount) {
      warnings.push({
        id: uuidv4(),
        type: 'budget',
        title: 'Budget Alert',
        message: `Estimated total ($${totalCost}) exceeds your allocated budget ($${request.budgetAmount}). Consider adjusting activity choices.`,
      });
    }

    return {
      isValid: warnings.length === 0,
      score: Math.max(75, Math.min(98, 100 - warnings.length * 10)),
      warnings,
    };
  }
}

export class TravelPlannerAgent {
  private researchAgent: DestinationResearchAgent;
  private routeAgent: RouteTravelOptimizationAgent;
  private validationAgent: ItineraryOptimizationValidationAgent;

  constructor(
    researchAgent?: DestinationResearchAgent,
    routeAgent?: RouteTravelOptimizationAgent,
    validationAgent?: ItineraryOptimizationValidationAgent
  ) {
    this.researchAgent = researchAgent || new DefaultDestinationResearchAgent();
    this.routeAgent = routeAgent || new DefaultRouteOptimizationAgent();
    this.validationAgent = validationAgent || new DefaultItineraryValidationAgent();
  }

  public async generatePlan(req: TripPlanningRequest): Promise<TripPlan> {
    // 1. Calculate duration in days
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    let durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    if (isNaN(durationDays) || durationDays <= 0) durationDays = 5;

    // 2. Determine target destinations
    let chosenDestinations = req.destinations && req.destinations.length > 0 ? req.destinations : ['Sigiriya', 'Kandy', 'Ella', 'Galle'];
    if (chosenDestinations.includes('Let AI recommend') || chosenDestinations.length === 0) {
      chosenDestinations = ['Sigiriya', 'Kandy', 'Ella', 'Galle'];
    }

    // 3. Sub-Agent Orchestration: Research & Route Optimization
    const researchData = await this.researchAgent.research({
      targetDestinations: chosenDestinations,
      interests: req.interests || [],
      travelStyle: Array.isArray(req.travelStyle) ? req.travelStyle : [],
    });

    const routeData = await this.routeAgent.optimize({
      destinations: chosenDestinations,
      durationDays,
    });

    const activeDestinations = routeData.orderedDestinations;

    // 4. Generate Day-by-Day Itinerary
    const days: ItineraryDayItem[] = [];
    const baseDate = isNaN(start.getTime()) ? new Date() : start;

    for (let d = 1; d <= durationDays; d++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + (d - 1));
      const dateStr = currentDate.toISOString().split('T')[0];

      const destName = activeDestinations[(d - 1) % activeDestinations.length];
      const activities = this.generateDayActivities(d, destName, req);

      const dayCost = activities.reduce((sum, act) => sum + act.estimatedCost, 0);

      days.push({
        day: d,
        date: dateStr,
        location: destName,
        title: d === 1 ? `Arrival & Exploration in ${destName}` : d === durationDays ? `Final Coastal Farewell & Departure` : `${destName} Excursion & Highlights`,
        description: `Experience the finest ${req.travelStyle.join(', ') || 'heritage and nature'} highlights in ${destName}.`,
        activities,
        estimatedCost: dayCost,
      });
    }

    // 5. Budget Allocation & Breakdown
    const totalActivityCost = days.reduce((sum, d) => sum + d.estimatedCost, 0);
    const budgetAmount = req.budget.amount || 600;
    const travelersCount = req.travelers || 2;

    const accommodationCost = Math.round(budgetAmount * 0.35);
    const transportCost = Math.round(budgetAmount * 0.25);
    const foodCost = Math.round(budgetAmount * 0.20);
    const activityTotalCost = Math.round(totalActivityCost * travelersCount);
    const calculatedTotal = accommodationCost + transportCost + foodCost + activityTotalCost;
    const remaining = Math.max(0, budgetAmount - calculatedTotal);

    const budgetBreakdown: BudgetBreakdown = {
      accommodation: accommodationCost,
      transportation: transportCost,
      activities: activityTotalCost,
      food: foodCost,
      other: Math.round(budgetAmount * 0.05),
      total: calculatedTotal,
      remaining,
      currency: req.budget.currency || 'USD',
    };

    // 6. Sub-Agent Validation & Warnings Generation
    const validationRes = await this.validationAgent.validate({
      days,
      budgetAmount,
    });

    const warnings: TripWarning[] = [...validationRes.warnings];

    // Check weather warning
    const styleList = Array.isArray(req.travelStyle) ? req.travelStyle : [];
    const activityList = Array.isArray(req.activities) ? req.activities : [];
    if (activeDestinations.includes('Ella') || styleList.includes('nature') || activityList.includes('hiking')) {
      warnings.push({
        id: uuidv4(),
        type: 'weather',
        title: 'Weather Advisory — Hill Country Trails',
        message: 'Occasional light showers expected in Ella during hiking windows. Rain gear and waterproof footwear recommended.',
      });
    }

    // Check schedule warning
    if (durationDays < activeDestinations.length) {
      warnings.push({
        id: uuidv4(),
        type: 'schedule',
        title: 'Tight Travel Schedule',
        message: `Visiting ${activeDestinations.length} destinations in ${durationDays} days requires early morning transfers. Travel itinerary has been optimized for efficiency.`,
      });
    }

    // Recommendations
    const recommendations: TripRecommendation[] = [
      {
        id: uuidv4(),
        category: 'Transportation Partner',
        title: '10% Off Rides with PickMe Sri Lanka',
        description: 'Use partner promo code TRAVELLINK10 for discounted tuk-tuk and car transfers across all cities.',
      },
      {
        id: uuidv4(),
        category: 'Cultural Etiquette',
        title: 'Temple Dress Code Reminder',
        description: 'Cover shoulders and knees when visiting sacred temple sites like Sri Dalada Maligawa in Kandy.',
      },
    ];

    return {
      trip: {
        title: `${durationDays}-Day ${req.destination || 'Sri Lanka'} ${styleList.slice(0, 2).join(' & ') || 'Custom'} Journey`,
        description: `A custom planned trip for ${travelersCount} traveler(s) combining ${styleList.join(', ') || 'heritage, nature and scenic landmarks'}.`,
        duration: durationDays,
        destinations: activeDestinations,
        travelers: travelersCount,
        transportPreference: req.transportPreference || 'AI Recommended',
        accommodationPreference: req.accommodationPreference || '3 Star',
      },
      days,
      budget: budgetBreakdown,
      warnings,
      recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        agent: 'TravelPlannerAgent v2.0',
        aiScore: validationRes.score,
      },
    };
  }

  public generateDayActivities(dayNum: number, location: string, req: TripPlanningRequest): ItineraryActivityItem[] {
    const travelStyle = Array.isArray(req.travelStyle) ? req.travelStyle : [];
    const activities = Array.isArray(req.activities) ? req.activities : [];
    const isHeritage = travelStyle.includes('culture') || activities.includes('temples') || location === 'Sigiriya' || location === 'Kandy';
    const isNature = travelStyle.includes('nature') || activities.includes('hiking') || location === 'Ella';
    const isWildlife = travelStyle.includes('wildlife') || activities.includes('safari') || location === 'Yala';

    if (location === 'Sigiriya') {
      return [
        {
          id: uuidv4(),
          time: '06:30 AM',
          title: 'Sigiriya Rock Fortress Summit Climb',
          location: 'Sigiriya Citadel',
          durationMinutes: 180,
          estimatedCost: 30,
          description: 'Climb 1,200 steps past ancient frescoes to King Kasyapa’s 5th-century royal palace ruins.',
          type: 'Attraction',
          travelTimeToNext: '20 mins transfer',
        },
        {
          id: uuidv4(),
          time: '11:00 AM',
          title: 'Authentic Village Bullock Cart & Rice & Curry Lunch',
          location: 'Sigiriya Village',
          durationMinutes: 120,
          estimatedCost: 15,
          description: 'Traditional Sri Lankan home-cooked meal served on banana leaves with village catamaran ride.',
          type: 'Dining',
          travelTimeToNext: '15 mins',
        },
        {
          id: uuidv4(),
          time: '04:00 PM',
          title: 'Pidurangala Rock Sunset Viewpoint',
          location: 'Pidurangala',
          durationMinutes: 120,
          estimatedCost: 3,
          description: 'Scenic rock hike offering panoramic 360-degree sunset views directly facing Sigiriya Fortress.',
          type: 'Activity',
          travelTimeToNext: 'End of day schedule',
        },
      ];
    } else if (location === 'Kandy') {
      return [
        {
          id: uuidv4(),
          time: '09:00 AM',
          title: 'Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)',
          location: 'Kandy Lake Round',
          durationMinutes: 120,
          estimatedCost: 10,
          description: 'Venerated temple complex housing the sacred tooth relic of the Buddha.',
          type: 'Attraction',
          travelTimeToNext: '10 mins walk',
        },
        {
          id: uuidv4(),
          time: '01:00 PM',
          title: 'Royalty Botanical Gardens Walk & Lunch',
          location: 'Peradeniya',
          durationMinutes: 150,
          estimatedCost: 12,
          description: 'Stroll through 147 acres of tropical orchid houses and giant palm avenues.',
          type: 'Activity',
          travelTimeToNext: '25 mins',
        },
        {
          id: uuidv4(),
          time: '05:30 PM',
          title: 'Traditional Kandyan Cultural Dance Show',
          location: 'Kandy Lake Club',
          durationMinutes: 90,
          estimatedCost: 10,
          description: 'Vibrant performance featuring traditional drummers, fire-walkers, and ceremonial dancers.',
          type: 'Activity',
          travelTimeToNext: 'End of day schedule',
        },
      ];
    } else if (location === 'Ella') {
      return [
        {
          id: uuidv4(),
          time: '08:30 AM',
          title: 'Nine Arches Railway Bridge Walk',
          location: 'Ella Demodara',
          durationMinutes: 120,
          estimatedCost: 0,
          description: 'Watch the scenic mountain train cross the iconic colonial viaduct bridge surrounded by tea fields.',
          type: 'Attraction',
          travelTimeToNext: '30 mins hike',
        },
        {
          id: uuidv4(),
          time: '01:00 PM',
          title: 'Little Adam’s Peak Trail & Zipline',
          location: 'Ella Pass',
          durationMinutes: 150,
          estimatedCost: 20,
          description: 'Easy mountain trail trek followed by thrilling flying ravine zipline experience.',
          type: 'Activity',
          travelTimeToNext: '15 mins',
        },
      ];
    } else {
      return [
        {
          id: uuidv4(),
          time: '09:00 AM',
          title: `${location} Coastal Ramparts & Heritage Walk`,
          location,
          durationMinutes: 120,
          estimatedCost: 15,
          description: `Explore historic landmarks, local artisan markets, and scenic coastal vistas in ${location}.`,
          type: 'Attraction',
          travelTimeToNext: '15 mins',
        },
        {
          id: uuidv4(),
          time: '02:00 PM',
          title: `${location} Seafood & Relaxing Excursion`,
          location,
          durationMinutes: 180,
          estimatedCost: 25,
          description: `Enjoy local coconut water, fresh seafood, and beach relaxation.`,
          type: 'Dining',
          travelTimeToNext: 'End of day schedule',
        },
      ];
    }
  }

  public async regenerateSingleDay(dayNumber: number, location: string, req: TripPlanningRequest): Promise<ItineraryDayItem> {
    const activities = this.generateDayActivities(dayNumber, location, req);
    // Shuffle or customize activities to give fresh alternatives
    const altActivities = activities.map((act, i) => ({
      ...act,
      id: uuidv4(),
      title: i === 0 ? `Alternative: ${act.title}` : act.title,
    }));

    return {
      day: dayNumber,
      date: new Date().toISOString().split('T')[0],
      location,
      title: `Optimized Day ${dayNumber} in ${location}`,
      description: `Regenerated day plan focusing on alternative activities and optimized timing.`,
      activities: altActivities,
      estimatedCost: altActivities.reduce((s, a) => s + a.estimatedCost, 0),
    };
  }

  public async replaceSingleActivity(activityId: string, currentTitle: string, location: string): Promise<ItineraryActivityItem> {
    return {
      id: uuidv4(),
      time: '02:30 PM',
      title: `Alternative Experience: ${location} Cultural & Artisan Workshop`,
      location,
      durationMinutes: 90,
      estimatedCost: 15,
      description: `Hands-on pottery and mask carving session guided by local traditional master craftsmen.`,
      type: 'Activity',
      travelTimeToNext: '20 mins transfer',
    };
  }
}
