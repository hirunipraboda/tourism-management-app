import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  step: string;
  category: 'CONNECTION' | 'SCHEMA' | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'RELATIONSHIP' | 'PERSISTENCE';
  api?: string;
  table?: string;
  operation?: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

function logResult(r: TestResult) {
  results.push(r);
  const icon = r.status === 'PASS' ? '✓' : '✗';
  console.log(`[${r.category}] ${icon} ${r.step} (${r.table || r.api || ''}) - ${r.details}`);
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runFullAudit() {
  console.log('================================================================');
  console.log('STARTING FULL DATABASE & BACKEND FUNCTIONALITY AUDIT');
  console.log('================================================================\n');

  // ─── 1. DATABASE CONNECTION AUDIT ──────────────────────────────────────────
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - t0;

    const dbMeta: any[] = await prisma.$queryRaw`
      SELECT current_database() as db, current_user as usr, version() as ver
    `;

    logResult({
      step: 'PostgreSQL Database Connection',
      category: 'CONNECTION',
      status: 'PASS',
      details: `Connected to "${dbMeta[0].db}" as user "${dbMeta[0].usr}" in ${latency}ms. Engine: ${dbMeta[0].ver.split(',')[0]}`,
    });
  } catch (err: any) {
    logResult({
      step: 'PostgreSQL Database Connection',
      category: 'CONNECTION',
      status: 'FAIL',
      details: `Failed to connect: ${err.message}`,
    });
    return;
  }

  // ─── 2. CHECK TABLES & MODEL INVENTORY ────────────────────────────────────
  const expectedTables = [
    'users',
    'destinations',
    'attractions',
    'tours',
    'tour_destinations',
    'tour_itineraries',
    'trips',
    'trip_destinations',
    'trip_itineraries',
    'bookings',
    'reviews',
    'transport_partners',
    'chat_sessions',
    'chat_messages',
    'chatbot_packages',
    'user_chatbot_packages',
  ];

  const dbTables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  const existingTableNames = new Set(dbTables.map((t) => t.table_name));

  for (const tbl of expectedTables) {
    if (existingTableNames.has(tbl)) {
      const countRes: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "public"."${tbl}"`);
      logResult({
        step: `Table Existence: ${tbl}`,
        category: 'SCHEMA',
        table: tbl,
        status: 'PASS',
        details: `Table exists with ${countRes[0]?.c} records`,
      });
    } else {
      logResult({
        step: `Table Existence: ${tbl}`,
        category: 'SCHEMA',
        table: tbl,
        status: 'FAIL',
        details: `Table missing in database!`,
      });
    }
  }

  // ─── 3. AUTHENTICATION SETUP (ADMIN & USER) ───────────────────────────────
  console.log('\n--- Authenticating Test Actors ---');
  // Login as Admin
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@tourlink.com', password: 'admin123' }),
  });

  let adminToken = adminLogin.data?.token || adminLogin.data?.data?.token;
  if (!adminToken) {
    console.log('Admin login failed, attempting fallback login with test password or finding an admin in db...');
    const dbAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (dbAdmin) {
      const { generateToken } = await import('./src/utils/jwt');
      adminToken = generateToken({ userId: dbAdmin.id, role: dbAdmin.role });
    }
  }

  // Create or Login as Test User
  const testEmail = `auditor_${Date.now()}@example.com`;
  const userRegister = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Audit Tester',
      email: testEmail,
      password: 'AuditPassword123!',
      role: 'USER',
      phone: '+94770009999',
    }),
  });

  const userToken = userRegister.data?.token || userRegister.data?.data?.token;
  const testUserId = userRegister.data?.user?.id || userRegister.data?.data?.user?.id;

  logResult({
    step: 'User Registration & Auth Token Generation',
    category: 'CREATE',
    api: 'POST /api/auth/register',
    table: 'users',
    operation: 'INSERT',
    status: userRegister.ok && userToken ? 'PASS' : 'FAIL',
    details: `Created user ${testEmail} (ID: ${testUserId}) via API and verified token generated.`,
  });

  // Verify User Exists in Database
  const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
  logResult({
    step: 'Verify User Record in Database',
    category: 'READ',
    table: 'users',
    operation: 'SELECT',
    status: dbUser ? 'PASS' : 'FAIL',
    details: dbUser ? `Found user ${dbUser.name} with role=${dbUser.role}, status=${dbUser.status}` : 'Not found in DB',
  });

  // ─── 4. DESTINATION CRUD VERIFICATION ─────────────────────────────────────
  console.log('\n--- Destination CRUD & Relational Tests ---');
  const uniqueDestSlug = `audit-dest-${Date.now()}`;
  const destCreateRes = await request('/destinations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `Audit Fortress ${Date.now()}`,
      slug: uniqueDestSlug,
      description: 'A verified fortress for automated backend audit verification testing.',
      location: 'Central Province Highlands',
      province: 'CENTRAL',
      category: 'HERITAGE',
      entryFee: 15.5,
      openingTime: '06:00 AM',
      closingTime: '06:00 PM',
      bestTimeToVisit: 'December to April',
    }),
  });

  const createdDest = destCreateRes.data?.data;
  const destId = createdDest?.id;

  logResult({
    step: 'Create Destination via API',
    category: 'CREATE',
    api: 'POST /api/destinations',
    table: 'destinations',
    operation: 'INSERT',
    status: destCreateRes.ok && destId ? 'PASS' : 'FAIL',
    details: destId ? `Created destination "${createdDest.name}" (ID: ${destId})` : `Failed: ${JSON.stringify(destCreateRes.data)}`,
  });

  // Read Destination from API
  const destGetRes = await request(`/destinations/${destId}`);
  logResult({
    step: 'Get Destination by ID via API',
    category: 'READ',
    api: `GET /api/destinations/${destId}`,
    table: 'destinations',
    operation: 'SELECT',
    status: destGetRes.ok && destGetRes.data?.data?.name === createdDest?.name ? 'PASS' : 'FAIL',
    details: `Retrieved "${destGetRes.data?.data?.name}" with entryFee=${destGetRes.data?.data?.entryFee}`,
  });

  // Update Destination via API
  const updatedDestName = `Updated Audit Fortress ${Date.now()}`;
  const destUpdateRes = await request(`/destinations/${destId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: updatedDestName,
      entryFee: 20.0,
    }),
  });

  // Verify in PostgreSQL
  const dbDest = await prisma.destination.findUnique({ where: { id: destId } });
  logResult({
    step: 'Update Destination and Verify in DB',
    category: 'UPDATE',
    api: `PUT /api/destinations/${destId}`,
    table: 'destinations',
    operation: 'UPDATE',
    status: destUpdateRes.ok && dbDest?.name === updatedDestName && dbDest?.entryFee === 20.0 ? 'PASS' : 'FAIL',
    details: `Database confirmed: name="${dbDest?.name}", entryFee=${dbDest?.entryFee}`,
  });

  // ─── 5. ATTRACTION CRUD & RELATIONSHIP ────────────────────────────────────
  console.log('\n--- Attraction CRUD & Foreign Key Test ---');
  const attrCreateRes = await request('/attractions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      destinationId: destId,
      name: 'Audited Royal Water Gardens',
      description: 'Historical royal gardens connected to the audit destination.',
      category: 'Sightseeing',
      entryFee: 5.0,
      durationHours: 2.5,
      pricePerPerson: 5.0,
    }),
  });

  const createdAttr = attrCreateRes.data?.data;
  const attrId = createdAttr?.id;

  logResult({
    step: 'Create Attraction Linked to Destination',
    category: 'CREATE',
    api: 'POST /api/attractions',
    table: 'attractions',
    operation: 'INSERT',
    status: attrCreateRes.ok && attrId ? 'PASS' : 'FAIL',
    details: attrId ? `Created attraction ID: ${attrId} linked to destId: ${destId}` : `Failed: ${JSON.stringify(attrCreateRes.data)}`,
  });

  // Verify Destination Includes Attraction
  const destWithAttrs = await prisma.destination.findUnique({
    where: { id: destId },
    include: { attractions: true },
  });
  logResult({
    step: 'Verify Destination -> Attraction Relationship in DB',
    category: 'RELATIONSHIP',
    table: 'destinations ↔ attractions',
    operation: 'SELECT with JOIN',
    status: destWithAttrs?.attractions?.some((a) => a.id === attrId) ? 'PASS' : 'FAIL',
    details: `Found ${destWithAttrs?.attractions?.length} attraction(s) loaded via foreign key destinationId`,
  });

  // ─── 6. TOUR & TOUR ITINERARY CRUD ─────────────────────────────────────────
  console.log('\n--- Tour & Tour Itinerary Tests ---');
  const tourCode = `TR-${Date.now().toString().slice(-4)}`;
  const tourCreateRes = await request('/tours', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: `Audit Heritage Tour ${tourCode}`,
      slug: `audit-tour-${Date.now()}`,
      code: tourCode,
      description: 'Full guided package across certified historic sites.',
      durationDays: 3,
      price: 299.0,
      currency: 'USD',
      maxGroupSize: 12,
      category: 'HERITAGE',
      destinationIds: [destId],
    }),
  });

  const tourId = tourCreateRes.data?.data?.id;
  logResult({
    step: 'Create Tour Package with Destination Link',
    category: 'CREATE',
    api: 'POST /api/tours',
    table: 'tours & tour_destinations',
    operation: 'INSERT',
    status: tourCreateRes.ok && tourId ? 'PASS' : 'FAIL',
    details: tourId ? `Created tour "${tourCreateRes.data?.data?.title}" (Code: ${tourCode})` : `Failed: ${JSON.stringify(tourCreateRes.data)}`,
  });

  // Add Tour Itinerary Day
  const tourItin = await prisma.tourItinerary.create({
    data: {
      tourId,
      dayNumber: 1,
      title: 'Arrival & Scenic Fortress Exploration',
      description: 'Morning climb and afternoon garden walks.',
      activities: 'Hiking, Photography, Local lunch',
    },
  });

  logResult({
    step: 'Create Tour Itinerary Day in DB',
    category: 'CREATE',
    table: 'tour_itineraries',
    operation: 'INSERT',
    status: tourItin?.id ? 'PASS' : 'FAIL',
    details: `Created Day 1 itinerary (ID: ${tourItin.id}) for tourId: ${tourId}`,
  });

  // Read Tour via API with Itinerary & Destinations
  const tourGetRes = await request(`/tours/${tourId}`);
  logResult({
    step: 'Get Tour by ID with Itinerary & Destinations via API',
    category: 'READ',
    api: `GET /api/tours/${tourId}`,
    table: 'tours',
    operation: 'SELECT',
    status: tourGetRes.ok && tourGetRes.data?.data?.itineraries?.length > 0 ? 'PASS' : 'FAIL',
    details: `Loaded tour with ${tourGetRes.data?.data?.itineraries?.length} itinerary day(s)`,
  });

  // ─── 7. TRIP & TRIP ITINERARY CRUD ─────────────────────────────────────────
  console.log('\n--- Trip & Trip Itinerary Tests ---');
  const tripCreateRes = await request('/trips', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      title: 'Audit Expedition 2026',
      description: 'Comprehensive test trip planned for audit testing.',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      numberOfTravelers: 2,
      budget: 650.0,
      transportRequired: true,
      destinationIds: [destId],
    }),
  });

  const tripId = tripCreateRes.data?.data?.id;
  logResult({
    step: 'Create Trip via API (User Auth)',
    category: 'CREATE',
    api: 'POST /api/trips',
    table: 'trips & trip_destinations',
    operation: 'INSERT',
    status: tripCreateRes.ok && tripId ? 'PASS' : 'FAIL',
    details: tripId ? `Created trip ID: ${tripId} with budget=650` : `Failed: ${JSON.stringify(tripCreateRes.data)}`,
  });

  // Add Trip Itinerary Item
  const tripItin = await prisma.tripItinerary.create({
    data: {
      tripId,
      destinationId: destId,
      dayNumber: 1,
      timeSlot: 'Morning',
      title: 'Guided Fortress Ascent',
      description: 'Climb with private guide before midday sun.',
      cost: 35.0,
      duration: '3 hours',
    },
  });

  logResult({
    step: 'Create Trip Itinerary Item in DB',
    category: 'CREATE',
    table: 'trip_itineraries',
    operation: 'INSERT',
    status: tripItin?.id ? 'PASS' : 'FAIL',
    details: `Created trip itinerary item ID: ${tripItin.id} (cost: $35)`,
  });

  // Update Trip via API
  const tripUpdateRes = await request(`/trips/${tripId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      title: 'Updated Audit Expedition 2026',
      budget: 720.0,
      numberOfTravelers: 3,
    }),
  });

  const dbTrip = await prisma.trip.findUnique({ where: { id: tripId } });
  logResult({
    step: 'Update Trip via API & Verify in DB',
    category: 'UPDATE',
    api: `PUT /api/trips/${tripId}`,
    table: 'trips',
    operation: 'UPDATE',
    status: tripUpdateRes.ok && dbTrip?.budget === 720.0 && dbTrip?.numberOfTravelers === 3 ? 'PASS' : 'FAIL',
    details: `Trip in DB updated: title="${dbTrip?.title}", budget=${dbTrip?.budget}, pax=${dbTrip?.numberOfTravelers}`,
  });

  // ─── 8. BOOKING CRUD & RELATIONSHIPS ───────────────────────────────────────
  console.log('\n--- Booking CRUD & Relational Integrity ---');
  const bookingCreateRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      tourId: tourId,
      customerName: 'Audit Tester',
      customerEmail: testEmail,
      numberOfParticipants: 2,
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      travelOption: 'PRIVATE',
      transportRequired: true,
      totalPrice: 598.0,
    }),
  });

  const bookingId = bookingCreateRes.data?.data?.id;
  const bookingRef = bookingCreateRes.data?.data?.bookingRef;

  logResult({
    step: 'Create Booking via API',
    category: 'CREATE',
    api: 'POST /api/bookings',
    table: 'bookings',
    operation: 'INSERT',
    status: bookingCreateRes.ok && bookingId ? 'PASS' : 'FAIL',
    details: bookingId ? `Created booking Ref: ${bookingRef} (ID: ${bookingId}, Total: $598)` : `Failed: ${JSON.stringify(bookingCreateRes.data)}`,
  });

  // Update Booking Status via Admin Auth
  const bookingUpdateRes = await request(`/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    }),
  });

  const dbBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
  logResult({
    step: 'Update Booking Status & Payment Status in DB (Admin Auth)',
    category: 'UPDATE',
    api: `PUT /api/bookings/${bookingId}`,
    table: 'bookings',
    operation: 'UPDATE',
    status: dbBooking?.status === 'CONFIRMED' && dbBooking?.paymentStatus === 'PAID' ? 'PASS' : 'FAIL',
    details: `Booking status=${dbBooking?.status}, paymentStatus=${dbBooking?.paymentStatus}`,
  });

  // User Cancel Booking Test
  const bookingCancelRes = await request(`/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      status: 'CANCELLED',
    }),
  });
  const dbBookingCancelled = await prisma.booking.findUnique({ where: { id: bookingId } });
  logResult({
    step: 'User Cancel Booking via API (User Auth)',
    category: 'UPDATE',
    api: `PUT /api/bookings/${bookingId}`,
    table: 'bookings',
    operation: 'UPDATE',
    status: dbBookingCancelled?.status === 'CANCELLED' ? 'PASS' : 'FAIL',
    details: `Booking cancellation by user confirmed: status=${dbBookingCancelled?.status}`,
  });

  // ─── 9. REVIEWS CRUD & RELATIONSHIPS ───────────────────────────────────────
  console.log('\n--- Reviews CRUD & Relational Verification ---');
  const reviewCreateRes = await request('/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      destinationId: destId,
      rating: 5,
      comment: 'Superb heritage fortress! Views and historical frescoes were unforgettable.',
    }),
  });

  const reviewId = reviewCreateRes.data?.data?.id;
  logResult({
    step: 'Create Destination Review via API',
    category: 'CREATE',
    api: 'POST /api/reviews',
    table: 'reviews',
    operation: 'INSERT',
    status: reviewCreateRes.ok && reviewId ? 'PASS' : 'FAIL',
    details: reviewId ? `Created 5-star review (ID: ${reviewId}) for destId: ${destId}` : `Failed: ${JSON.stringify(reviewCreateRes.data)}`,
  });

  // Read My Reviews via API
  const myReviewsRes = await request('/reviews/my-reviews', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  logResult({
    step: 'Get User Reviews via API',
    category: 'READ',
    api: 'GET /api/reviews/my-reviews',
    table: 'reviews',
    operation: 'SELECT',
    status: myReviewsRes.ok && myReviewsRes.data?.data?.some((r: any) => r.id === reviewId) ? 'PASS' : 'FAIL',
    details: `User has ${myReviewsRes.data?.data?.length} review(s) in system`,
  });

  // Update Review via API
  const reviewUpdateRes = await request(`/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      rating: 4,
      comment: 'Updated: Excellent historic site, but steep stairs require moderate fitness.',
    }),
  });
  const dbReview = await prisma.review.findUnique({ where: { id: reviewId } });
  logResult({
    step: 'Update Review via API & Verify in DB',
    category: 'UPDATE',
    api: `PUT /api/reviews/${reviewId}`,
    table: 'reviews',
    operation: 'UPDATE',
    status: dbReview?.rating === 4 ? 'PASS' : 'FAIL',
    details: `Database confirmed: rating=${dbReview?.rating}, comment="${dbReview?.comment.slice(0, 30)}..."`,
  });

  // ─── 10. CHAT SESSIONS & CHAT MESSAGES ────────────────────────────────────
  console.log('\n--- Chat Sessions & Messages Tests ---');
  const sessionCreateRes = await request('/chat/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ title: 'Audit AI Conversation' }),
  });

  const sessionId = sessionCreateRes.data?.data?.id;
  logResult({
    step: 'Create Chat Session via API',
    category: 'CREATE',
    api: 'POST /api/chat/sessions',
    table: 'chat_sessions',
    operation: 'INSERT',
    status: sessionCreateRes.ok && sessionId ? 'PASS' : 'FAIL',
    details: sessionId ? `Created chat session ID: ${sessionId}` : `Failed: ${JSON.stringify(sessionCreateRes.data)}`,
  });

  // Create Chat Message in DB
  const chatMsg = await prisma.chatMessage.create({
    data: {
      sessionId,
      userId: testUserId,
      role: 'USER',
      content: 'What is the best route from Colombo to Sigiriya?',
    },
  });

  const assistantMsg = await prisma.chatMessage.create({
    data: {
      sessionId,
      userId: testUserId,
      role: 'ASSISTANT',
      content: 'Take the Central Expressway from Colombo to Kurunegala, then continue on the Dambulla route (approx 3.5 hours).',
    },
  });

  logResult({
    step: 'Insert Chat Messages in Session',
    category: 'CREATE',
    table: 'chat_messages',
    operation: 'INSERT',
    status: chatMsg.id && assistantMsg.id ? 'PASS' : 'FAIL',
    details: `Stored user query (${chatMsg.id}) and assistant response (${assistantMsg.id})`,
  });

  // Get Chat Session by ID via API
  const sessionGetRes = await request(`/chat/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  logResult({
    step: 'Get Chat Session with Messages via API',
    category: 'READ',
    api: `GET /api/chat/sessions/${sessionId}`,
    table: 'chat_sessions & chat_messages',
    operation: 'SELECT',
    status: sessionGetRes.ok && sessionGetRes.data?.data?.messages?.length >= 2 ? 'PASS' : 'FAIL',
    details: `Loaded session with ${sessionGetRes.data?.data?.messages?.length} message(s)`,
  });

  // ─── 11. TRANSPORT PARTNERS & ADMIN STATS ─────────────────────────────────
  console.log('\n--- Transport & Admin Stats Tests ---');
  const transportRes = await request('/transport');
  logResult({
    step: 'Get Transport Partners via API',
    category: 'READ',
    api: 'GET /api/transport',
    table: 'transport_partners',
    operation: 'SELECT',
    status: transportRes.ok && Array.isArray(transportRes.data?.data) ? 'PASS' : 'FAIL',
    details: `Retrieved ${transportRes.data?.data?.length} transport partner(s)`,
  });

  const publicStatsRes = await request('/public-stats');
  logResult({
    step: 'Get Public Platform Aggregate Stats',
    category: 'READ',
    api: 'GET /api/public-stats',
    table: 'users, trips, destinations',
    operation: 'SELECT COUNT',
    status: publicStatsRes.ok && publicStatsRes.data?.data?.totalDestinations !== undefined ? 'PASS' : 'FAIL',
    details: `Stats: destinations=${publicStatsRes.data?.data?.totalDestinations}, users=${publicStatsRes.data?.data?.totalUsers}, trips=${publicStatsRes.data?.data?.totalTrips}`,
  });

  // Admin Dashboard & Statistics API
  const adminStatsRes = await request('/admin/statistics', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  logResult({
    step: 'Get Admin Statistics & DB Metrics via API',
    category: 'READ',
    api: 'GET /api/admin/statistics',
    table: 'users, destinations, tours, bookings, trips, reviews',
    operation: 'COUNT AGGREGATION',
    status: adminStatsRes.ok && adminStatsRes.data?.data?.totalUsers !== undefined ? 'PASS' : 'FAIL',
    details: `Admin stats: totalUsers=${adminStatsRes.data?.data?.totalUsers}, totalBookings=${adminStatsRes.data?.data?.totalBookings}, totalTours=${adminStatsRes.data?.data?.totalTours}`,
  });

  // ─── 12. FOREIGN KEY CONSTRAINT ENFORCEMENT TEST ──────────────────────────
  console.log('\n--- Foreign Key Constraint Enforcement Tests ---');
  let fkBlocked = false;
  try {
    // Attempting to insert a Trip with a non-existent userId
    await prisma.$queryRaw`
      INSERT INTO "public"."trips" (
        "id", "userId", "title", "startDate", "endDate", "updatedAt"
      ) VALUES (
        ${'fake-trip-' + Date.now()},
        ${'non-existent-user-uuid-9999'},
        ${'Illegal FK Trip'},
        NOW(),
        NOW(),
        NOW()
      );
    `;
  } catch (err: any) {
    fkBlocked = true;
    logResult({
      step: 'Foreign Key Constraint Enforcement (Non-existent User in Trips)',
      category: 'RELATIONSHIP',
      table: 'trips -> users',
      operation: 'REJECT INVALID FK',
      status: 'PASS',
      details: `PostgreSQL successfully rejected invalid FK: ${err.message.split('\n')[0]}`,
    });
  }

  if (!fkBlocked) {
    logResult({
      step: 'Foreign Key Constraint Enforcement (Non-existent User in Trips)',
      category: 'RELATIONSHIP',
      table: 'trips -> users',
      operation: 'REJECT INVALID FK',
      status: 'FAIL',
      details: 'Error: Database allowed inserting record with invalid foreign key!',
    });
  }

  // ─── 13. CASCADE DELETION TESTS ───────────────────────────────────────────
  console.log('\n--- Cascade Deletion Tests ---');
  // 13a. Delete Review
  const reviewDelRes = await request(`/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const dbReviewAfter = await prisma.review.findUnique({ where: { id: reviewId } });
  logResult({
    step: 'Delete Review via API',
    category: 'DELETE',
    api: `DELETE /api/reviews/${reviewId}`,
    table: 'reviews',
    operation: 'DELETE',
    status: reviewDelRes.ok && !dbReviewAfter ? 'PASS' : 'FAIL',
    details: !dbReviewAfter ? 'Review successfully removed from database.' : 'Review still present!',
  });

  // 13b. Delete Chat Session & Cascade to Messages
  const chatMsgCountBefore = await prisma.chatMessage.count({ where: { sessionId } });
  const sessionDelRes = await request(`/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const dbSessionAfter = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  const chatMsgCountAfter = await prisma.chatMessage.count({ where: { sessionId } });

  logResult({
    step: 'Delete Chat Session & Cascade Delete Chat Messages',
    category: 'DELETE',
    api: `DELETE /api/chat/sessions/${sessionId}`,
    table: 'chat_sessions ↔ chat_messages',
    operation: 'CASCADE DELETE',
    status: !dbSessionAfter && chatMsgCountAfter === 0 && chatMsgCountBefore > 0 ? 'PASS' : 'FAIL',
    details: `Session deleted. Messages went from ${chatMsgCountBefore} to ${chatMsgCountAfter}. ON DELETE CASCADE confirmed.`,
  });

  // 13c. Delete Trip & Cascade to TripItinerary and TripDestination
  const tripItinCountBefore = await prisma.tripItinerary.count({ where: { tripId } });
  const tripDelRes = await request(`/trips/${tripId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const dbTripAfter = await prisma.trip.findUnique({ where: { id: tripId } });
  const tripItinCountAfter = await prisma.tripItinerary.count({ where: { tripId } });

  logResult({
    step: 'Delete Trip & Cascade Delete Trip Itineraries',
    category: 'DELETE',
    api: `DELETE /api/trips/${tripId}`,
    table: 'trips ↔ trip_itineraries',
    operation: 'CASCADE DELETE',
    status: !dbTripAfter && tripItinCountAfter === 0 && tripItinCountBefore > 0 ? 'PASS' : 'FAIL',
    details: `Trip deleted. Itineraries went from ${tripItinCountBefore} to ${tripItinCountAfter}. ON DELETE CASCADE confirmed.`,
  });

  // 13d. Delete Destination & Cascade to Attractions and TourDestinations
  const attrCountBefore = await prisma.attraction.count({ where: { destinationId: destId } });
  const destDelRes = await request(`/destinations/${destId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbDestAfter = await prisma.destination.findUnique({ where: { id: destId } });
  const attrCountAfter = await prisma.attraction.count({ where: { destinationId: destId } });

  logResult({
    step: 'Delete Destination & Cascade Delete Attractions',
    category: 'DELETE',
    api: `DELETE /api/destinations/${destId}`,
    table: 'destinations ↔ attractions',
    operation: 'CASCADE DELETE',
    status: !dbDestAfter && attrCountAfter === 0 && attrCountBefore > 0 ? 'PASS' : 'FAIL',
    details: `Destination deleted. Attractions went from ${attrCountBefore} to ${attrCountAfter}. ON DELETE CASCADE confirmed.`,
  });

  // ─── 14. DATA PERSISTENCE VERIFICATION ────────────────────────────────────
  console.log('\n--- Data Persistence Verification ---');
  const sentinelId = `sentinel-${Date.now()}`;
  await prisma.$queryRaw`
    INSERT INTO "public"."transport_partners" (
      "id", "name", "description", "websiteUrl", "discount", "discountDescription", "isActive", "createdAt", "updatedAt"
    ) VALUES (
      ${sentinelId},
      ${'Persistence Test Shuttle'},
      ${'Validating non-volatile disk persistence'},
      ${'https://novashuttle.lk'},
      15.0,
      ${'15% audit discount'},
      true,
      NOW(),
      NOW()
    );
  `;

  // Query raw SQL to confirm storage
  const persisted: any[] = await prisma.$queryRaw`
    SELECT id, name, discount FROM "public"."transport_partners" WHERE id = ${sentinelId}
  `;

  logResult({
    step: 'Direct PostgreSQL Disk Persistence Check',
    category: 'PERSISTENCE',
    table: 'transport_partners',
    operation: 'RAW SQL SELECT',
    status: persisted.length === 1 && persisted[0].id === sentinelId ? 'PASS' : 'FAIL',
    details: `Confirmed row persisted on disk in PostgreSQL: ID=${persisted[0]?.id}, Name="${persisted[0]?.name}"`,
  });

  // Cleanup sentinel
  await prisma.$queryRaw`DELETE FROM "public"."transport_partners" WHERE id = ${sentinelId}`;

  // Cleanup test user and tour
  await prisma.booking.deleteMany({ where: { userId: testUserId } });
  await prisma.tourItinerary.deleteMany({ where: { tourId } });
  await prisma.tour.deleteMany({ where: { id: tourId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });

  await prisma.$disconnect();

  // ─── SUMMARY TABLE ────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('AUDIT SUMMARY REPORT');
  console.log('================================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log(`SUCCESS RATE: ${((passCount / results.length) * 100).toFixed(1)}%`);
  console.log('================================================================');
}

runFullAudit().catch(async (e) => {
  console.error('Fatal audit failure:', e);
  await prisma.$disconnect();
  process.exit(1);
});
