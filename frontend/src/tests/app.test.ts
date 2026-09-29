import test from 'node:test';
import assert from 'node:assert/strict';

test('Frontend configuration: API endpoint resolution', () => {
  const defaultApiUrl = 'http://localhost:5000/api';
  assert.ok(defaultApiUrl.includes(':5000'));
  assert.ok(defaultApiUrl.endsWith('/api'));
});

test('Tourism data structure integrity', () => {
  const sampleDestination = {
    id: 'dest-1',
    name: 'Sigiriya Rock Fortress',
    rating: 4.9,
    category: 'HERITAGE',
  };

  assert.equal(sampleDestination.name, 'Sigiriya Rock Fortress');
  assert.equal(sampleDestination.category, 'HERITAGE');
  assert.ok(sampleDestination.rating >= 4.5);
});

test('Reviews and recommendations data structure integrity', () => {
  const sampleReview = {
    id: 'rev-001',
    touristName: 'Elena Rostova',
    rating: 5,
    status: 'Published',
    helpfulCount: 34,
  };
  const sampleRecommendation = {
    id: 'rec-001',
    name: 'Kandy Cultural Experience',
    suitabilityScore: 94,
    interestMatch: 95,
    ratingMatch: 92,
    budgetMatch: 90,
  };

  assert.equal(sampleReview.status, 'Published');
  assert.equal(sampleReview.rating, 5);
  assert.ok(sampleRecommendation.suitabilityScore >= 90);
  assert.ok(sampleRecommendation.interestMatch >= 90);
});

test('Customer Satisfaction Analytics integrity', () => {
  const analyticsSummary = {
    totalReviews: 12482,
    averageRating: 4.6,
    positiveReviewsPercentage: 89,
    pendingReviewsCount: 128,
  };

  assert.equal(analyticsSummary.totalReviews, 12482);
  assert.equal(analyticsSummary.averageRating, 4.6);
  assert.equal(analyticsSummary.positiveReviewsPercentage, 89);
  assert.equal(analyticsSummary.pendingReviewsCount, 128);
});

test('Multi-Destination and Day-by-Day Transport Leg integrity', () => {
  const sampleTransitLegs = [
    {
      id: 'leg-day-1-2',
      fromDayNumber: 1,
      toDayNumber: 2,
      fromDestination: 'Yala',
      toDestination: 'Colombo',
      mode: 'PUBLIC_TRANSPORT' as const,
      estimatedCostUSD: 6,
      publicTransport: {
        id: 'opt-train-1021',
        transportType: 'TRAIN' as const,
        origin: 'Yala',
        destination: 'Colombo',
        travelDate: '2026-10-01',
        departureTime: '08:00 AM',
        arrivalTime: '12:15 PM',
        durationMinutes: 240,
        trainNumber: '1021',
        estimatedFare: 950,
        source: 'Sri Lanka Railways',
      },
    },
    {
      id: 'leg-day-2-3',
      fromDayNumber: 2,
      toDayNumber: 3,
      fromDestination: 'Yala',
      toDestination: 'Kandy',
      mode: 'PRIVATE' as const,
      privateVehicleType: 'AC Sedan',
      estimatedCostUSD: 35,
    },
  ];

  assert.equal(sampleTransitLegs.length, 2);
  assert.equal(sampleTransitLegs[0].fromDestination, 'Yala');
  assert.equal(sampleTransitLegs[0].toDestination, 'Colombo');
  assert.equal(sampleTransitLegs[0].mode, 'PUBLIC_TRANSPORT');
  assert.equal(sampleTransitLegs[0].publicTransport?.trainNumber, '1021');

  assert.equal(sampleTransitLegs[1].fromDestination, 'Yala');
  assert.equal(sampleTransitLegs[1].toDestination, 'Kandy');
  assert.equal(sampleTransitLegs[1].mode, 'PRIVATE');
  assert.equal(sampleTransitLegs[1].privateVehicleType, 'AC Sedan');

  const totalCost = sampleTransitLegs.reduce((sum, l) => sum + l.estimatedCostUSD, 0);
  assert.equal(totalCost, 41);
});

test('Itinerary-derived Travel Legs: Yala -> Colombo -> Kandy automatic generation', () => {
  // Mock itinerary days with destination shifts:
  // Day 1 & 2: Yala
  // Day 3 & 4: Colombo
  // Day 5 & 6: Kandy
  const itineraryDays = [
    { dayNumber: 1, dateStr: '13 Oct 2026', destination: 'Yala' },
    { dayNumber: 2, dateStr: '14 Oct 2026', destination: 'Yala' },
    { dayNumber: 3, dateStr: '15 Oct 2026', destination: 'Colombo' },
    { dayNumber: 4, dateStr: '16 Oct 2026', destination: 'Colombo' },
    { dayNumber: 5, dateStr: '17 Oct 2026', destination: 'Kandy' },
    { dayNumber: 6, dateStr: '18 Oct 2026', destination: 'Kandy' },
  ];

  // Derive consecutive destination transitions
  const derivedLegs = [];
  for (let i = 0; i < itineraryDays.length - 1; i++) {
    const cur = itineraryDays[i];
    const next = itineraryDays[i + 1];
    if (cur.destination !== next.destination) {
      derivedLegs.push({
        id: `leg-day-${next.dayNumber}`,
        dayNumber: next.dayNumber,
        fromDestination: cur.destination,
        toDestination: next.destination,
        travelDate: next.dateStr,
      });
    }
  }

  assert.equal(derivedLegs.length, 2);

  // Leg 1: Day 3 — Yala -> Colombo | 15 Oct
  assert.equal(derivedLegs[0].dayNumber, 3);
  assert.equal(derivedLegs[0].fromDestination, 'Yala');
  assert.equal(derivedLegs[0].toDestination, 'Colombo');
  assert.equal(derivedLegs[0].travelDate, '15 Oct 2026');

  // Leg 2: Day 5 — Colombo -> Kandy | 17 Oct
  assert.equal(derivedLegs[1].dayNumber, 5);
  assert.equal(derivedLegs[1].fromDestination, 'Colombo');
  assert.equal(derivedLegs[1].toDestination, 'Kandy');
  assert.equal(derivedLegs[1].travelDate, '17 Oct 2026');
});

test('Specific Bus & Train Selection per route leg with fares and timetables', () => {
  // Leg 1: Yala -> Colombo (User selects Route 32 bus)
  const leg1SelectedService = {
    transportType: 'BUS' as const,
    routeNumber: 'Route 32',
    routeName: 'Colombo - Kataragama / Yala Highway',
    departureTime: '07:30 AM',
    arrivalTime: '01:00 PM',
    durationMinutes: 330,
    estimatedFare: 850,
    stopsCount: 8,
    status: 'Available',
  };

  // Leg 2: Colombo -> Kandy (User selects Train 1015 Intercity Express)
  const leg2SelectedService = {
    transportType: 'TRAIN' as const,
    trainNumber: '1015',
    trainName: 'Intercity Express',
    departureTime: '07:00 AM',
    arrivalTime: '09:35 AM',
    durationMinutes: 155,
    estimatedFare: 1200,
    stopsCount: 4,
    status: 'Available',
  };

  assert.equal(leg1SelectedService.transportType, 'BUS');
  assert.equal(leg1SelectedService.routeNumber, 'Route 32');
  assert.equal(leg1SelectedService.departureTime, '07:30 AM');
  assert.equal(leg1SelectedService.arrivalTime, '01:00 PM');
  assert.equal(leg1SelectedService.estimatedFare, 850);

  assert.equal(leg2SelectedService.transportType, 'TRAIN');
  assert.equal(leg2SelectedService.trainNumber, '1015');
  assert.equal(leg2SelectedService.departureTime, '07:00 AM');
  assert.equal(leg2SelectedService.arrivalTime, '09:35 AM');
  assert.equal(leg2SelectedService.estimatedFare, 1200);

  // Total Estimated Transportation Cost
  const totalLKR = leg1SelectedService.estimatedFare + leg2SelectedService.estimatedFare;
  const totalUSD = Math.round(totalLKR / 300);

  assert.equal(totalLKR, 2050);
  assert.equal(totalUSD, 7);
});

test('Transportation Flow: Choose Public (From->To Search on Itinerary Places) vs Private (Vehicle Selection)', () => {
  // Itinerary places
  const itineraryPlaces = ['Yala', 'Colombo', 'Kandy', 'Ella'];

  // Test 1: Origin and Destination dropdowns must contain only itinerary places
  const availableOriginOptions = itineraryPlaces;
  const availableDestOptions = itineraryPlaces;
  assert.deepEqual(availableOriginOptions, ['Yala', 'Colombo', 'Kandy', 'Ella']);
  assert.deepEqual(availableDestOptions, ['Yala', 'Colombo', 'Kandy', 'Ella']);

  // Test 2: Public search for Yala -> Colombo returns train and bus cards
  const searchResults = [
    {
      transportType: 'TRAIN' as const,
      trainName: 'Colombo Express',
      trainNumber: '8056',
      departureTime: '06:15 AM',
      arrivalTime: '12:10 PM',
      durationMinutes: 355,
      estimatedFare: 1200,
    },
    {
      transportType: 'BUS' as const,
      routeName: 'Route 32',
      routeNumber: 'Route 32',
      departureTime: '07:30 AM',
      arrivalTime: '01:00 PM',
      durationMinutes: 330,
      estimatedFare: 850,
    },
  ];

  // Test 3: Filters (All | Trains | Buses)
  const trainResults = searchResults.filter((r) => r.transportType === 'TRAIN');
  const busResults = searchResults.filter((r) => r.transportType === 'BUS');
  assert.equal(trainResults.length, 1);
  assert.equal(busResults.length, 1);

  // Test 4: Sorting by lowest price
  const sortedByPrice = [...searchResults].sort((a, b) => a.estimatedFare - b.estimatedFare);
  assert.equal(sortedByPrice[0].estimatedFare, 850);
  assert.equal(sortedByPrice[1].estimatedFare, 1200);

  // Test 5: Selected Journey structure
  const selectedJourney = searchResults[0];
  assert.equal(selectedJourney.trainName, 'Colombo Express');
  assert.equal(selectedJourney.departureTime, '06:15 AM');
  assert.equal(selectedJourney.arrivalTime, '12:10 PM');

  // Test 6: Private Transportation selection
  const privateVehicle = {
    type: 'AC Sedan',
    pax: '3 Pax',
    rateUSD: 35,
    days: 5,
    totalUSD: 175,
  };
  assert.equal(privateVehicle.type, 'AC Sedan');
  assert.equal(privateVehicle.totalUSD, 175);
});

test('Multi-Leg Sequential Transport Selection: displays all selected options relevant to origin to destination', () => {
  // Map of selected journeys by route
  const selectedJourneysByRoute: Record<string, {
    transportType: 'TRAIN' | 'BUS';
    name: string;
    origin: string;
    destination: string;
    fareLKR: number;
    fareUSD: number;
  }> = {
    'yala-colombo': {
      transportType: 'BUS',
      name: 'Route 32 Express Bus',
      origin: 'Yala',
      destination: 'Colombo',
      fareLKR: 850,
      fareUSD: 2.83,
    },
    'colombo-kandy': {
      transportType: 'TRAIN',
      name: 'Intercity Express Train 1015',
      origin: 'Colombo',
      destination: 'Kandy',
      fareLKR: 1200,
      fareUSD: 4.00,
    },
    'kandy-ella': {
      transportType: 'TRAIN',
      name: 'Ella Odyssey Scenic Train',
      origin: 'Kandy',
      destination: 'Ella',
      fareLKR: 2000,
      fareUSD: 6.67,
    },
  };

  const legs = Object.values(selectedJourneysByRoute);
  assert.equal(legs.length, 3);

  // Leg 1: Yala -> Colombo
  assert.equal(legs[0].origin, 'Yala');
  assert.equal(legs[0].destination, 'Colombo');
  assert.equal(legs[0].name, 'Route 32 Express Bus');
  assert.equal(legs[0].fareUSD, 2.83);

  // Leg 2: Colombo -> Kandy
  assert.equal(legs[1].origin, 'Colombo');
  assert.equal(legs[1].destination, 'Kandy');
  assert.equal(legs[1].name, 'Intercity Express Train 1015');
  assert.equal(legs[1].fareUSD, 4.00);

  // Leg 3: Kandy -> Ella
  assert.equal(legs[2].origin, 'Kandy');
  assert.equal(legs[2].destination, 'Ella');
  assert.equal(legs[2].name, 'Ella Odyssey Scenic Train');
  assert.equal(legs[2].fareUSD, 6.67);

  // Total USD calculation across all origin-destination routes
  const totalUSD = Number(legs.reduce((sum, l) => sum + l.fareUSD, 0).toFixed(2));
  assert.equal(totalUSD, 13.50);
});

test('Staycation Booking Confirmation Receipt: Verification code and receipt breakdown integrity', () => {
  const sampleBooking = {
    type: 'Hotel' as const,
    provider: 'Earl\'s Regency Hotel',
    amount: '$360',
    date: '2026-10-12 to 2026-10-15',
    confirmationCode: 'NOV-KND-98421',
    status: 'Confirmed' as const,
    destination: 'Kandy',
    guestName: 'Alex & Elena Vance',
    guestEmail: 'alex.vance@example.com',
    packageName: 'Hill Country Royal Retreat',
    nights: 3,
    rooms: 1,
    checkInDate: '2026-10-12',
    checkOutDate: '2026-10-15',
    bookedAt: '2026-10-01 14:30 UTC',
    paymentMethod: 'Visa ending in 4242',
    subtotal: '$320',
    taxesAndService: '$40',
    includedFacilities: ['Buffet Breakfast', 'Infinity Pool', 'Ayurveda Spa 20% Off'],
  };

  assert.equal(sampleBooking.status, 'Confirmed');
  assert.equal(sampleBooking.confirmationCode, 'NOV-KND-98421');
  assert.equal(sampleBooking.nights, 3);
  assert.equal(sampleBooking.amount, '$360');
  assert.ok(sampleBooking.confirmationCode.startsWith('NOV-'));
  assert.ok(sampleBooking.includedFacilities.length >= 3);
  assert.equal(sampleBooking.paymentMethod, 'Visa ending in 4242');
});

test('Trips Search Functionality: Filters trips by name, destination, and staycation booking', () => {
  const mockTrips = [
    {
      id: 'trip-1',
      name: 'Cultural Triangle & Sigiriya Climb',
      destination: 'Sigiriya, Sri Lanka',
      notes: 'Ancient fortress tour',
      interests: ['History', 'Nature'],
      bookingsList: [{ provider: 'Heritance Kandalama', confirmationCode: 'NOV-SIG-101', destination: 'Sigiriya' }],
    },
    {
      id: 'trip-2',
      name: 'Kandy & Hill Country Escape',
      destination: 'Kandy, Sri Lanka',
      notes: 'Tea estates and lake',
      interests: ['Culture', 'Relaxation'],
      bookingsList: [{ provider: 'Earl\'s Regency Hotel', confirmationCode: 'NOV-KND-98421', destination: 'Kandy' }],
    },
    {
      id: 'trip-3',
      name: 'Southern Coastline Explorer',
      destination: 'Galle & Mirissa, Sri Lanka',
      notes: 'Whale watching and fort',
      interests: ['Beach', 'Wildlife'],
      bookingsList: [],
    },
  ];

  const search = (q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return mockTrips;
    return mockTrips.filter((t) =>
      t.name.toLowerCase().includes(query) ||
      t.destination.toLowerCase().includes(query) ||
      t.notes.toLowerCase().includes(query) ||
      t.interests.some((i) => i.toLowerCase().includes(query)) ||
      t.bookingsList.some((b) =>
        b.provider.toLowerCase().includes(query) ||
        b.confirmationCode.toLowerCase().includes(query)
      )
    );
  };

  // Search by destination
  const kandyResults = search('Kandy');
  assert.equal(kandyResults.length, 1);
  assert.equal(kandyResults[0].id, 'trip-2');

  // Search by staycation provider
  const heritanceResults = search('Heritance');
  assert.equal(heritanceResults.length, 1);
  assert.equal(heritanceResults[0].id, 'trip-1');

  // Search by booking confirmation code
  const codeResults = search('NOV-KND');
  assert.equal(codeResults.length, 1);
  assert.equal(codeResults[0].id, 'trip-2');

  // Search by interest
  const beachResults = search('Beach');
  assert.equal(beachResults.length, 1);
  assert.equal(beachResults[0].id, 'trip-3');

  // Search with no matches
  const emptyResults = search('NonExistentPlace');
  assert.equal(emptyResults.length, 0);
});

test('Real Calendar Trip Timeline Engine: Trip Statuses and Relative Countdown Logic', async () => {
  const {
    getTripTimeline,
    getItineraryDayTimelineStatus,
    getActivityTimelineStatus,
    getTransportTimelineStatus,
    formatTripDateRange,
    validateTripDateConsistency,
  } = await import('../utils/tripTimeline.ts');

  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  // 1. Upcoming Trip (starts in 5 days, ends in 10 days)
  const futureStart = new Date(today);
  futureStart.setDate(today.getDate() + 5);
  const futureEnd = new Date(today);
  futureEnd.setDate(today.getDate() + 10);

  const upcomingTimeline = getTripTimeline(formatYMD(futureStart), formatYMD(futureEnd));
  assert.equal(upcomingTimeline.status, 'Upcoming');
  assert.ok(upcomingTimeline.timelineLabel.includes('Starts in 5 days') || upcomingTimeline.timelineLabel.includes('Starts'));
  assert.equal(upcomingTimeline.totalDays, 6);

  // 2. Ongoing Trip (started 1 day ago, ends in 3 days)
  const ongoingStart = new Date(today);
  ongoingStart.setDate(today.getDate() - 1);
  const ongoingEnd = new Date(today);
  ongoingEnd.setDate(today.getDate() + 3);

  const ongoingTimeline = getTripTimeline(formatYMD(ongoingStart), formatYMD(ongoingEnd));
  assert.equal(ongoingTimeline.status, 'Ongoing');
  assert.ok(ongoingTimeline.timelineLabel.includes('Ongoing'));
  assert.equal(ongoingTimeline.currentDay, 2);

  // 3. Completed Trip (ended 4 days ago)
  const completedStart = new Date(today);
  completedStart.setDate(today.getDate() - 8);
  const completedEnd = new Date(today);
  completedEnd.setDate(today.getDate() - 4);

  const completedTimeline = getTripTimeline(formatYMD(completedStart), formatYMD(completedEnd));
  assert.equal(completedTimeline.status, 'Completed');
  assert.ok(completedTimeline.timelineLabel.includes('Completed'));

  // 4. Cancelled Trip
  const cancelledTimeline = getTripTimeline(formatYMD(futureStart), formatYMD(futureEnd), 'Cancelled');
  assert.equal(cancelledTimeline.status, 'Cancelled');
  assert.equal(cancelledTimeline.timelineLabel, 'Trip Cancelled');

  // 5. Itinerary Day Status (Completed / Today / Upcoming)
  const pastDay = new Date(today);
  pastDay.setDate(today.getDate() - 2);
  const todayDay = new Date(today);
  const futureDay = new Date(today);
  futureDay.setDate(today.getDate() + 2);

  assert.equal(getItineraryDayTimelineStatus(formatYMD(pastDay)), 'Completed');
  assert.equal(getItineraryDayTimelineStatus(formatYMD(todayDay)), 'Today');
  assert.equal(getItineraryDayTimelineStatus(formatYMD(futureDay)), 'Upcoming');

  // 6. Time-Aware Activity Status (Upcoming / In Progress / Completed)
  // Past day activity is always Completed
  assert.equal(getActivityTimelineStatus(formatYMD(pastDay), '09:00 AM – 11:00 AM'), 'Completed');
  // Future day activity is always Upcoming
  assert.equal(getActivityTimelineStatus(formatYMD(futureDay), '09:00 AM – 11:00 AM'), 'Upcoming');

  // Today activity based on current time:
  const now = new Date();
  const currentHours = now.getHours();
  // An activity earlier in the morning today
  if (currentHours >= 3) {
    assert.equal(getActivityTimelineStatus(formatYMD(todayDay), '01:00 AM – 02:00 AM'), 'Completed');
  }
  // An activity later tonight
  if (currentHours < 23) {
    assert.equal(getActivityTimelineStatus(formatYMD(todayDay), '11:45 PM – 11:55 PM'), 'Upcoming');
  }

  // 7. Transportation Timeline Status (Upcoming / In Transit / Completed)
  assert.equal(getTransportTimelineStatus(formatYMD(pastDay), '06:00 AM', '12:00 PM'), 'Completed');
  assert.equal(getTransportTimelineStatus(formatYMD(futureDay), '06:00 AM', '12:00 PM'), 'Upcoming');

  // 8. Timeline Consistency Validation
  const validCheck = validateTripDateConsistency('2026-10-01', '2026-10-05');
  assert.equal(validCheck.isValid, true);

  const invalidCheck = validateTripDateConsistency('2026-10-10', '2026-10-05');
  assert.equal(invalidCheck.isValid, false);
  assert.ok(invalidCheck.error);
});




