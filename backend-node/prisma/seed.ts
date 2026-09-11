import { PrismaClient, Role, UserStatus, Province, DestinationCategory, TourCategory, TripStatus, TravelOption, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed without human guides...');

  // 1. Clean existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tripItinerary.deleteMany();
  await prisma.tripDestination.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.tourItinerary.deleteMany();
  await prisma.tourDestination.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.attraction.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.transportPartner.deleteMany();
  await prisma.user.deleteMany();

  // 2. Password Hashes
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const userPassword = await bcrypt.hash('UserPassword123!', 10);

  // 3. Users (ADMIN & USER roles only)
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@travellink.lk',
      password: adminPassword,
      role: Role.ADMIN,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+94 77 123 4567',
      department: 'Operations',
      status: UserStatus.ACTIVE,
    },
  });

  const touristUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'tourist@travellink.lk',
      password: userPassword,
      role: Role.USER,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      phone: '+94 75 111 2233',
      status: UserStatus.ACTIVE,
    },
  });

  // 4. Destinations
  const destSigiriya = await prisma.destination.create({
    data: {
      name: 'Sigiriya',
      slug: 'sigiriya',
      description: 'The ancient rock fortress of Sigiriya, a UNESCO World Heritage site known as the 8th Wonder of the World, featuring ancient frescoes, water gardens, and the famous Lion Gate.',
      location: 'Matale District',
      province: Province.CENTRAL,
      district: 'Matale',
      imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.HERITAGE,
      rating: 4.9,
      reviewCount: 320,
      entryFee: 30.0,
      openingTime: '06:30 AM',
      closingTime: '05:30 PM',
      bestTimeToVisit: 'January to April',
      isActive: true,
    },
  });

  const destKandy = await prisma.destination.create({
    data: {
      name: 'Kandy',
      slug: 'kandy',
      description: 'Sri Lanka’s cultural capital nestled among misty hills, housing the Sacred Temple of the Tooth Relic, lush botanical gardens, and rich Kandyan heritage.',
      location: 'Kandy District',
      province: Province.CENTRAL,
      district: 'Kandy',
      imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.CULTURE,
      rating: 4.8,
      reviewCount: 280,
      entryFee: 15.0,
      openingTime: '05:30 AM',
      closingTime: '08:00 PM',
      bestTimeToVisit: 'December to April',
      isActive: true,
    },
  });

  const destGalle = await prisma.destination.create({
    data: {
      name: 'Galle',
      slug: 'galle',
      description: 'A historic coastal fortification built by the Portuguese and Dutch, featuring cobblestone streets, colonial ramparts, boutique cafes, and stunning ocean views.',
      location: 'Galle District',
      province: Province.SOUTHERN,
      district: 'Galle',
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.HERITAGE,
      rating: 4.85,
      reviewCount: 240,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'November to April',
      isActive: true,
    },
  });

  const destElla = await prisma.destination.create({
    data: {
      name: 'Ella',
      slug: 'ella',
      description: 'A picturesque mountain village surrounded by emerald tea plantations, misty valleys, the iconic Nine Arches Bridge, and challenging hiking trails.',
      location: 'Badulla District',
      province: Province.UVA,
      district: 'Badulla',
      imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.HILL_COUNTRY,
      rating: 4.9,
      reviewCount: 310,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'January to May',
      isActive: true,
    },
  });

  const destYala = await prisma.destination.create({
    data: {
      name: 'Yala',
      slug: 'yala',
      description: 'Sri Lanka’s premier national park, boasting one of the highest leopard densities in the world, alongside wild Asian elephants, sloth bears, and vibrant birdlife.',
      location: 'Hambantota District',
      province: Province.SOUTHERN,
      district: 'Hambantota',
      imageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.WILDLIFE,
      rating: 4.88,
      reviewCount: 295,
      entryFee: 35.0,
      openingTime: '06:00 AM',
      closingTime: '06:00 PM',
      bestTimeToVisit: 'February to July',
      isActive: true,
    },
  });

  const destNuwaraEliya = await prisma.destination.create({
    data: {
      name: 'Nuwara Eliya',
      slug: 'nuwara-eliya',
      description: 'Known as "Little England", Nuwara Eliya is famous for its cool climate, Tudor-style mansions, manicured gardens, and vast Ceylon tea estates.',
      location: 'Nuwara Eliya District',
      province: Province.CENTRAL,
      district: 'Nuwara Eliya',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.HILL_COUNTRY,
      rating: 4.75,
      reviewCount: 190,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'March to May',
      isActive: true,
    },
  });

  const destMirissa = await prisma.destination.create({
    data: {
      name: 'Mirissa',
      slug: 'mirissa',
      description: 'A tropical beach paradise famous for blue whale watching expeditions, palm-fringed bays, surf breaks, and vibrant beachfront night life.',
      location: 'Matara District',
      province: Province.SOUTHERN,
      district: 'Matara',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.BEACH,
      rating: 4.82,
      reviewCount: 220,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'November to April',
      isActive: true,
    },
  });

  const destArugamBay = await prisma.destination.create({
    data: {
      name: 'Arugam Bay',
      slug: 'arugam-bay',
      description: 'World-renowned surfing destination on the east coast, attracting global surfers to point breaks, lagoon safaris, and laid-back beach vibes.',
      location: 'Ampara District',
      province: Province.EASTERN,
      district: 'Ampara',
      imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.BEACH,
      rating: 4.78,
      reviewCount: 165,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'May to September',
      isActive: true,
    },
  });

  const destAnuradhapura = await prisma.destination.create({
    data: {
      name: 'Anuradhapura',
      slug: 'anuradhapura',
      description: 'The ancient sacred capital of Sri Lanka, home to giant stupas, ancient monastic complexes, and the Jaya Sri Maha Bodhi tree.',
      location: 'Anuradhapura District',
      province: Province.NORTH_CENTRAL,
      district: 'Anuradhapura',
      imageUrl: 'https://images.unsplash.com/photo-1625736332896-f9d299057885?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.RELIGIOUS,
      rating: 4.85,
      reviewCount: 175,
      entryFee: 25.0,
      openingTime: '06:00 AM',
      closingTime: '06:00 PM',
      bestTimeToVisit: 'May to September',
      isActive: true,
    },
  });

  const destTrincomalee = await prisma.destination.create({
    data: {
      name: 'Trincomalee',
      slug: 'trincomalee',
      description: 'A deep-water natural harbor destination featuring white-sand beaches, Koneswaram Hindu Temple perched on Swami Rock, and coral reef snorkeling at Pigeon Island.',
      location: 'Trincomalee District',
      province: Province.EASTERN,
      district: 'Trincomalee',
      imageUrl: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80',
      category: DestinationCategory.BEACH,
      rating: 4.8,
      reviewCount: 140,
      entryFee: 0.0,
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      bestTimeToVisit: 'May to October',
      isActive: true,
    },
  });

  // 5. Attractions
  await prisma.attraction.createMany({
    data: [
      {
        destinationId: destSigiriya.id,
        name: 'Sigiriya Lion Rock Citadel',
        description: 'Climb 1,200 steps past ancient wall frescoes to king Kasyapa royal palace summit.',
        imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80',
        category: 'Historical Site',
        entryFee: 30.0,
        openingTime: '06:30 AM',
        closingTime: '05:30 PM',
        durationHours: 3.5,
        pricePerPerson: 30.0,
        rating: 4.9,
      },
      {
        destinationId: destSigiriya.id,
        name: 'Pidurangala Rock Sunrise Viewpoint',
        description: 'Panoramic rock peak offering breathtaking sunrise views facing Sigiriya Rock Fortress.',
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
        category: 'Hiking & Viewpoint',
        entryFee: 3.0,
        openingTime: '05:00 AM',
        closingTime: '06:00 PM',
        durationHours: 2.5,
        pricePerPerson: 3.0,
        rating: 4.85,
      },
      {
        destinationId: destKandy.id,
        name: 'Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)',
        description: 'Venerated Buddhist shrine housing the sacred tooth relic of the Buddha.',
        imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
        category: 'Religious Site',
        entryFee: 10.0,
        openingTime: '05:30 AM',
        closingTime: '08:00 PM',
        durationHours: 2.0,
        pricePerPerson: 10.0,
        rating: 4.9,
      },
      {
        destinationId: destElla.id,
        name: 'Nine Arches Railway Bridge',
        description: 'Iconic colonial viaduct bridge set amid lush jungle and tea fields in Ella.',
        imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=600&q=80',
        category: 'Architecture & Nature',
        entryFee: 0.0,
        openingTime: '24 Hours',
        closingTime: '24 Hours',
        durationHours: 2.0,
        pricePerPerson: 0.0,
        rating: 4.92,
      },
      {
        destinationId: destYala.id,
        name: 'Yala Block 1 Jeep Safari',
        description: 'Exciting 4x4 game drive tracking leopards, elephants, crocodiles, and wild boars.',
        imageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80',
        category: 'Wildlife Safari',
        entryFee: 35.0,
        openingTime: '06:00 AM',
        closingTime: '06:00 PM',
        durationHours: 4.0,
        pricePerPerson: 45.0,
        rating: 4.88,
      },
    ],
  });

  // 6. Tours
  const tour1 = await prisma.tour.create({
    data: {
      title: 'Essential Sri Lanka Heritage & Cultural Explorer',
      slug: 'essential-sri-lanka-heritage-cultural-explorer',
      code: 'NV-KY-01',
      description: 'Immerse yourself in Sri Lanka’s ancient kingdoms, UNESCO rock fortresses, sacred temples, and hill country spice gardens.',
      durationDays: 7,
      price: 850.0,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
      maxGroupSize: 12,
      category: TourCategory.HERITAGE,
      rating: 4.9,
      isActive: true,
      createdById: adminUser.id,
      destinations: {
        create: [
          { destinationId: destSigiriya.id, order: 1 },
          { destinationId: destKandy.id, order: 2 },
          { destinationId: destNuwaraEliya.id, order: 3 },
        ],
      },
      itineraries: {
        create: [
          { dayNumber: 1, title: 'Arrival & Sigiriya Foothills', description: 'Check in at eco-resort and evening village bullock cart tour.' },
          { dayNumber: 2, title: 'Sigiriya Rock Fortress Summit', description: 'Early morning climb of Sigiriya Rock followed by Pidurangala sunset.' },
          { dayNumber: 3, title: 'Golden Temple of Dambulla & Kandy Transfer', description: 'Explore Dambulla cave monastery and arrive in Kandy city.' },
          { dayNumber: 4, title: 'Temple of the Tooth & Cultural Dance', description: 'Morning tooth relic ceremony and evening Kandyan dance performance.' },
        ],
      },
    },
  });

  const tour2 = await prisma.tour.create({
    data: {
      title: 'Southern Coast Ocean & Yala Safari Trail',
      slug: 'southern-coast-ocean-yala-safari-trail',
      code: 'NV-AM-02',
      description: 'Experience the perfect blend of wildlife jeep safaris in Yala National Park and colonial beachfront charm in Galle Fort.',
      durationDays: 5,
      price: 680.0,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
      maxGroupSize: 8,
      category: TourCategory.WILDLIFE,
      rating: 4.85,
      isActive: true,
      createdById: adminUser.id,
      destinations: {
        create: [
          { destinationId: destGalle.id, order: 1 },
          { destinationId: destMirissa.id, order: 2 },
          { destinationId: destYala.id, order: 3 },
        ],
      },
      itineraries: {
        create: [
          { dayNumber: 1, title: 'Galle Fort Ramparts Walk', description: 'Walk Dutch fort walls and dine at boutique lighthouse restaurants.' },
          { dayNumber: 2, title: 'Whale Watching in Mirissa', description: 'Early ocean cruise to spot blue whales and spinner dolphins.' },
          { dayNumber: 3, title: 'Yala Leopard Safari', description: 'Afternoon jeep safari inside Yala National Park.' },
        ],
      },
    },
  });

  // 7. Transport Partner (PickMe)
  await prisma.transportPartner.create({
    data: {
      name: 'PickMe Sri Lanka',
      description: 'Official transportation partner offering comfortable, reliable cars, tuk-tuks, and vans across Sri Lanka with exclusive Travel Link discounts.',
      logo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80',
      websiteUrl: 'https://pickme.lk',
      appUrl: 'https://pickme.lk/download',
      discount: 10.0,
      discountDescription: 'Get 10% OFF on all rides when booked through Travel Link app integration code TRAVELLINK10.',
      isActive: true,
    },
  });

  // 8. Sample Trip & Booking (without human guide fields)
  const sampleTrip = await prisma.trip.create({
    data: {
      userId: touristUser.id,
      title: 'Island Heritage & Coastal Getaway',
      description: 'A 7-day personalized trip spanning Sigiriya fortress, Kandy temples, and Mirissa beaches.',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-17'),
      numberOfTravelers: 2,
      budget: 1500.0,
      transportRequired: true,
      status: TripStatus.PLANNED,
      aiScore: 92.0,
      destinations: {
        create: [
          { destinationId: destSigiriya.id },
          { destinationId: destKandy.id },
          { destinationId: destMirissa.id },
        ],
      },
      itineraries: {
        create: [
          {
            dayNumber: 1,
            date: new Date('2026-09-10'),
            title: 'Arrival & Sigiriya Base',
            destinationId: destSigiriya.id,
            activities: 'Check in, pool relaxation, village safari.',
            type: 'Lodging',
            cost: 120.0,
          },
          {
            dayNumber: 2,
            date: new Date('2026-09-11'),
            title: 'Climb Sigiriya Rock',
            destinationId: destSigiriya.id,
            activities: 'Climb rock fortress at 07:00 AM.',
            type: 'Attraction',
            cost: 60.0,
          },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      bookingRef: 'TL-BK-8842',
      userId: touristUser.id,
      tourId: tour1.id,
      tripId: sampleTrip.id,
      customerName: touristUser.name,
      customerEmail: touristUser.email,
      numberOfParticipants: 2,
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-17'),
      travelOption: TravelOption.PRIVATE,
      transportRequired: true,
      totalPrice: 850.0,
      paymentStatus: PaymentStatus.PAID,
      status: BookingStatus.CONFIRMED,
    },
  });

  // 9. Sample Review (linked to Destination and Tour only)
  await prisma.review.create({
    data: {
      userId: touristUser.id,
      destinationId: destSigiriya.id,
      tourId: tour1.id,
      rating: 5,
      comment: 'An absolute masterpiece of a journey! The NOVA Guide Bot provided fascinating historical trivia and tips throughout the climb.',
    },
  });

  console.log('[Seed] Database seeding completed successfully without human guides.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
