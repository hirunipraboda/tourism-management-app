export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Tourist' | 'Tour Operator' | 'Administrator';
  status: 'Active' | 'Inactive' | 'Pending';
  registeredAt: string;
  phone: string;
  totalBookings: number;
  completedTrips: number;
  reviewsCount: number;
}

export interface AdminDestination {
  id: string;
  name: string;
  province: string;
  category: 'Heritage' | 'Nature' | 'Beach' | 'Wildlife' | 'Adventure' | 'Cultural';
  location: string;
  lat: number;
  lng: number;
  coverImage: string;
  attractionsCount: number;
  status: 'Active' | 'Draft' | 'Inactive';
  description: string;
  accessibility: string;
  bestTimeToVisit: string;
  bookingsCount: number;
  growthPercentage: number;
}

export interface AdminAttraction {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  category: string;
  openingHours: string;
  entryFee: string;
  duration: string;
  availability: 'Open All Year' | 'Seasonal' | 'Under Maintenance';
  status: 'Active' | 'Inactive';
  description: string;
  imageUrl: string;
}

export interface AdminTourPackage {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  duration: string;
  daysCount: number;
  price: number;
  capacity: number;
  bookingsCount: number;
  transportOption: string;
  vehicleType: string;
  status: 'Active' | 'Draft' | 'Fully Booked' | 'Inactive';
  coverImage: string;
  description: string;
  activities: string[];
  includesGuideBot: boolean;
}

export interface AdminBooking {
  id: string;
  bookingCode: string;
  touristName: string;
  touristEmail: string;
  touristAvatar: string;
  packageId: string;
  packageName: string;
  destinationName: string;
  travelDate: string;
  travelersCount: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  createdAt: string;
  timeline: {
    title: string;
    timestamp: string;
    status: 'completed' | 'current' | 'upcoming';
  }[];
}

export interface AdminAvailabilityEvent {
  id: string;
  title: string;
  date: string;
  type: 'Tour Package' | 'System Slot' | 'Maintenance';
  capacity: number;
  bookedCount: number;
  status: 'Available' | 'Partially Booked' | 'Fully Booked' | 'Unavailable';
}

export interface AIWorkflowItem {
  id: string;
  workflowId: string;
  touristName: string;
  destination: string;
  createdAt: string;
  currentAgent: 'Travel Planner Agent' | 'Destination Research Agent' | 'Environment & Route Agent' | 'Itinerary Validation Agent';
  status: 'Pending' | 'Running' | 'Validation' | 'Awaiting Approval' | 'Approved' | 'Revision Requested' | 'Rejected' | 'Completed' | 'Failed';
  validationScore: number;
  notes: string;
  agentsTimeline: {
    agent: string;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Warning';
    duration: string;
    startTime: string;
    endTime?: string;
    result: string;
    warnings?: string[];
  }[];
}

export interface AIApprovalItem {
  id: string;
  workflowId: string;
  touristName: string;
  destination: string;
  travelDates: string;
  travelersCount: number;
  budgetRange: string;
  interests: string[];
  validationStatus: 'Passed with High Confidence' | 'Minor Route Notice' | 'Operator Review Required';
  warnings: string[];
  generatedItinerary: {
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
  }[];
  totalEstimatedCost: number;
  aiWorkflowStatus: string;
}

// ----------------------------------------------------------------------
// MOCK DATASETS
// ----------------------------------------------------------------------

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-101',
    name: 'Sanath Wickramasinghe',
    email: 'sanath.w@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Tourist',
    status: 'Active',
    registeredAt: '12 Jan 2026',
    phone: '+94 77 123 4567',
    totalBookings: 4,
    completedTrips: 3,
    reviewsCount: 5,
  },
  {
    id: 'usr-102',
    name: 'Anula Wickramasinghe',
    email: 'anula.w@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'Tourist',
    status: 'Active',
    registeredAt: '03 Feb 2026',
    phone: '+94 71 987 6543',
    totalBookings: 2,
    completedTrips: 2,
    reviewsCount: 2,
  },
  {
    id: 'usr-103',
    name: 'Ceylon Travels Operator',
    email: 'operator@ceylontravels.lk',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'Tour Operator',
    status: 'Active',
    registeredAt: '15 Nov 2025',
    phone: '+94 11 234 5678',
    totalBookings: 148,
    completedTrips: 140,
    reviewsCount: 42,
  },
  {
    id: 'usr-104',
    name: 'Admin Desk Officer',
    email: 'admin@travellink.lk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'Administrator',
    status: 'Active',
    registeredAt: '01 Oct 2025',
    phone: '+94 11 777 0000',
    totalBookings: 0,
    completedTrips: 0,
    reviewsCount: 0,
  },
  {
    id: 'usr-105',
    name: 'Samantha Perera',
    email: 'samantha.p@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'Tourist',
    status: 'Active',
    registeredAt: '18 Feb 2026',
    phone: '+94 75 444 3322',
    totalBookings: 1,
    completedTrips: 0,
    reviewsCount: 0,
  },
  {
    id: 'usr-106',
    name: 'Lanka Heritage Tours',
    email: 'tours@lankaheritage.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'Tour Operator',
    status: 'Pending',
    registeredAt: '20 Feb 2026',
    phone: '+94 81 222 1100',
    totalBookings: 0,
    completedTrips: 0,
    reviewsCount: 0,
  },
];

export const MOCK_ADMIN_DESTINATIONS: AdminDestination[] = [
  {
    id: 'dest-kandy',
    name: 'Kandy',
    province: 'Central Province',
    category: 'Cultural',
    location: 'Central Highlands',
    lat: 7.2906,
    lng: 80.6337,
    coverImage: 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 14,
    status: 'Active',
    description: 'The sacred hill capital housing the Temple of the Sacred Tooth Relic surrounded by lush mist-covered mountains.',
    accessibility: 'Highway & Scenic Train Connected',
    bestTimeToVisit: 'December to April',
    bookingsCount: 1240,
    growthPercentage: 14.8,
  },
  {
    id: 'dest-ella',
    name: 'Ella',
    province: 'Uva Province',
    category: 'Nature',
    location: 'Badulla District',
    lat: 6.8667,
    lng: 81.0467,
    coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 10,
    status: 'Active',
    description: 'Picturesque mountain village famous for Nine Arch Bridge, Little Adam’s Peak, and rolling emerald tea plantations.',
    accessibility: 'Main Line Train & Scenic Route',
    bestTimeToVisit: 'January to May',
    bookingsCount: 980,
    growthPercentage: 22.4,
  },
  {
    id: 'dest-galle',
    name: 'Galle',
    province: 'Southern Province',
    category: 'Heritage',
    location: 'Southern Coast',
    lat: 6.0535,
    lng: 80.221,
    coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 12,
    status: 'Active',
    description: 'Historic Dutch Fort city blending colonial European architecture with tropical Indian Ocean coastlines.',
    accessibility: 'Southern Expressway Direct Access',
    bestTimeToVisit: 'November to April',
    bookingsCount: 890,
    growthPercentage: 11.2,
  },
  {
    id: 'dest-sigiriya',
    name: 'Sigiriya',
    province: 'Central Province',
    category: 'Heritage',
    location: 'Matale District',
    lat: 7.957,
    lng: 80.7603,
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 8,
    status: 'Active',
    description: 'UNESCO World Heritage 5th-century rock fortress soaring 200m above ancient water gardens and forests.',
    accessibility: 'Central Expressway Connection',
    bestTimeToVisit: 'January to April',
    bookingsCount: 820,
    growthPercentage: 18.5,
  },
  {
    id: 'dest-nuwaraeliya',
    name: 'Nuwara Eliya',
    province: 'Central Province',
    category: 'Nature',
    location: 'Highland Plateau',
    lat: 6.9497,
    lng: 80.7891,
    coverImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 11,
    status: 'Active',
    description: 'Known as "Little England", featuring cool mountain climate, colonial bungalows, Lake Gregory, and Horton Plains.',
    accessibility: 'A5 Highway & Nanu Oya Rail',
    bestTimeToVisit: 'March to May',
    bookingsCount: 650,
    growthPercentage: 8.4,
  },
  {
    id: 'dest-mirissa',
    name: 'Mirissa',
    province: 'Southern Province',
    category: 'Beach',
    location: 'Matara Coast',
    lat: 5.9483,
    lng: 80.4716,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 7,
    status: 'Active',
    description: 'Pristine crescent bay famed for blue whale watching safaris, coconut tree hills, and sunset surfing.',
    accessibility: 'Coastal Road & Expressway Exit',
    bestTimeToVisit: 'November to April',
    bookingsCount: 540,
    growthPercentage: 16.1,
  },
  {
    id: 'dest-yala',
    name: 'Yala National Park',
    province: 'Southern/Uva Province',
    category: 'Wildlife',
    location: 'Southeastern Wilds',
    lat: 6.3725,
    lng: 81.5165,
    coverImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    attractionsCount: 6,
    status: 'Active',
    description: 'Sri Lanka’s premier wildlife sanctuary boasting the world’s highest density of Sri Lankan leopards.',
    accessibility: 'Highway via Tissamaharama',
    bestTimeToVisit: 'February to July',
    bookingsCount: 480,
    growthPercentage: 19.3,
  },
];

export const MOCK_ADMIN_ATTRACTIONS: AdminAttraction[] = [
  {
    id: 'attr-1',
    name: 'Temple of the Sacred Tooth Relic',
    destinationId: 'dest-kandy',
    destinationName: 'Kandy',
    category: 'Cultural & Religious',
    openingHours: '05:30 AM – 08:00 PM Daily',
    entryFee: '$15 / LKR 4,500',
    duration: '2 – 3 Hours',
    availability: 'Open All Year',
    status: 'Active',
    description: 'Golden-roofed temple complex housing Sri Lanka’s most revered Buddhist relic.',
    imageUrl: 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'attr-2',
    name: 'Nine Arch Bridge',
    destinationId: 'dest-ella',
    destinationName: 'Ella',
    category: 'Heritage & Engineering',
    openingHours: '24 Hours Open',
    entryFee: 'Free Entry',
    duration: '1 – 2 Hours',
    availability: 'Open All Year',
    status: 'Active',
    description: 'Colonial viaduct bridge surrounded by dense jungle tea bush valleys.',
    imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'attr-3',
    name: 'Sigiriya Rock Citadel Fortress',
    destinationId: 'dest-sigiriya',
    destinationName: 'Sigiriya',
    category: 'Archaeological Citadel',
    openingHours: '06:30 AM – 05:30 PM Daily',
    entryFee: '$35 / LKR 10,500',
    duration: '3 – 4 Hours',
    availability: 'Open All Year',
    status: 'Active',
    description: '5th century royal palace complex with world-famous frescoes and Lion Paw entrance.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'attr-4',
    name: 'Galle Fort Ramparts & Lighthouse',
    destinationId: 'dest-galle',
    destinationName: 'Galle',
    category: 'Colonial Architecture',
    openingHours: '24 Hours Open',
    entryFee: 'Free Entry',
    duration: '2 – 3 Hours',
    availability: 'Open All Year',
    status: 'Active',
    description: 'Living UNESCO heritage fort featuring cobblestone streets, boutiques, and ocean rampart walks.',
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'attr-5',
    name: 'Yala Leopard Safari Zone 1',
    destinationId: 'dest-yala',
    destinationName: 'Yala National Park',
    category: 'Wildlife Safari',
    openingHours: '06:00 AM – 06:00 PM Daily',
    entryFee: '$40 / LKR 12,000',
    duration: '4 – 5 Hours',
    availability: 'Open All Year',
    status: 'Active',
    description: 'Jeep safari across dry-zone woodlands, coastal lagoons, and granite outcrops to spot leopards & elephants.',
    imageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&q=80',
  },
];

export const MOCK_ADMIN_TOURS: AdminTourPackage[] = [
  {
    id: 'pkg-1',
    name: 'Sri Lanka Grand Cultural & Scenic Odyssey',
    destinationId: 'dest-kandy',
    destinationName: 'Kandy & Sigiriya',
    duration: '7 Days / 6 Nights',
    daysCount: 7,
    price: 1250,
    capacity: 12,
    bookingsCount: 340,
    transportOption: 'Private AC Mini Van',
    vehicleType: 'Toyota KDH Luxury Van',
    status: 'Active',
    coverImage: 'https://images.unsplash.com/photo-1588598056972-2d12f6a73c1d?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive island tour covering UNESCO citadel fortresses, highland tea country, and sacred Kandy temples.',
    activities: ['Sigiriya Rock Climb', 'Tooth Relic Temple Ceremony', 'Tea Factory Tasting', 'Scenic Train Ride to Ella'],
    includesGuideBot: true,
  },
  {
    id: 'pkg-2',
    name: 'Ella Mountain Trail & Tea Country Escape',
    destinationId: 'dest-ella',
    destinationName: 'Ella & Nuwara Eliya',
    duration: '4 Days / 3 Nights',
    daysCount: 4,
    price: 680,
    capacity: 8,
    bookingsCount: 210,
    transportOption: 'Private SUV 4x4',
    vehicleType: 'Mitsubishi Montero 4WD',
    status: 'Active',
    coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
    description: 'Highland trek featuring Nine Arch Bridge sunrise, Little Adam’s Peak, waterfalls, and tea estate bungalows.',
    activities: ['Nine Arch Bridge Sunrise', 'Ravana Falls Trek', 'Little Adam’s Peak Hike', 'Highland Railway Journey'],
    includesGuideBot: true,
  },
  {
    id: 'pkg-3',
    name: 'Southern Coast Surf & Colonial Fort Retreat',
    destinationId: 'dest-galle',
    destinationName: 'Galle & Mirissa',
    duration: '5 Days / 4 Nights',
    daysCount: 5,
    price: 890,
    capacity: 10,
    bookingsCount: 195,
    transportOption: 'Private AC Sedan',
    vehicleType: 'Toyota Axio Hybrid',
    status: 'Active',
    coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    description: 'Relaxed beach retreat taking in Galle Fort Rampart walks, Mirissa whale watching, and ocean sunset dining.',
    activities: ['Galle Fort Walking Tour', 'Blue Whale Watching Boat Safari', 'Coconut Tree Hill Sunset', 'Seafood Sunset BBQ'],
    includesGuideBot: true,
  },
];

export const MOCK_ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: 'bkg-101',
    bookingCode: 'TL10294',
    touristName: 'Sanath Wickramasinghe',
    touristEmail: 'sanath.w@gmail.com',
    touristAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    packageId: 'pkg-1',
    packageName: 'Sri Lanka Grand Cultural & Scenic Odyssey',
    destinationName: 'Kandy & Sigiriya',
    travelDate: '15 Oct 2026 – 21 Oct 2026',
    travelersCount: 2,
    totalAmount: 2500,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    createdAt: '21 Aug 2026',
    timeline: [
      { title: 'Booking Created & Details Received', timestamp: '21 Aug 2026, 09:30 AM', status: 'completed' },
      { title: 'AI Itinerary Validation & Route Optimization', timestamp: '21 Aug 2026, 09:32 AM', status: 'completed' },
      { title: 'Payment Confirmed & Voucher Issued', timestamp: '21 Aug 2026, 09:35 AM', status: 'completed' },
      { title: 'NOVA AI Guide Bot Assigned', timestamp: '21 Aug 2026, 09:36 AM', status: 'completed' },
      { title: 'Journey Departure & Live Assistance', timestamp: '15 Oct 2026', status: 'upcoming' },
    ],
  },
  {
    id: 'bkg-102',
    bookingCode: 'TL10295',
    touristName: 'Anula Wickramasinghe',
    touristEmail: 'anula.w@gmail.com',
    touristAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    packageId: 'pkg-2',
    packageName: 'Ella Mountain Trail & Tea Country Escape',
    destinationName: 'Ella & Nuwara Eliya',
    travelDate: '01 Nov 2026 – 04 Nov 2026',
    travelersCount: 2,
    totalAmount: 1360,
    status: 'Pending',
    paymentStatus: 'Pending',
    createdAt: '21 Aug 2026',
    timeline: [
      { title: 'Booking Created', timestamp: '21 Aug 2026, 11:15 AM', status: 'completed' },
      { title: 'Awaiting Operator Approval', timestamp: '21 Aug 2026, 11:16 AM', status: 'current' },
      { title: 'Confirmation & Payment', timestamp: 'Pending', status: 'upcoming' },
    ],
  },
  {
    id: 'bkg-103',
    bookingCode: 'TL10296',
    touristName: 'Samantha Perera',
    touristEmail: 'samantha.p@gmail.com',
    touristAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    packageId: 'pkg-3',
    packageName: 'Southern Coast Surf & Colonial Fort Retreat',
    destinationName: 'Galle & Mirissa',
    travelDate: '10 Dec 2026 – 14 Dec 2026',
    travelersCount: 4,
    totalAmount: 3560,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    createdAt: '20 Aug 2026',
    timeline: [
      { title: 'Booking Created & Payment Received', timestamp: '20 Aug 2026, 04:20 PM', status: 'completed' },
      { title: 'Itinerary Validated & Travel Voucher Issued', timestamp: '20 Aug 2026, 04:22 PM', status: 'completed' },
      { title: 'Departure Ready', timestamp: '10 Dec 2026', status: 'upcoming' },
    ],
  },
];

export const MOCK_ADMIN_AVAILABILITY: AdminAvailabilityEvent[] = [
  {
    id: 'av-1',
    title: 'Sri Lanka Grand Cultural Odyssey Slot 1',
    date: '2026-10-15',
    type: 'Tour Package',
    capacity: 12,
    bookedCount: 8,
    status: 'Partially Booked',
  },
  {
    id: 'av-2',
    title: 'Ella Mountain Trail Slot A',
    date: '2026-11-01',
    type: 'Tour Package',
    capacity: 8,
    bookedCount: 8,
    status: 'Fully Booked',
  },
  {
    id: 'av-3',
    title: 'Highland Express Railway Slot Block',
    date: '2026-10-18',
    type: 'System Slot',
    capacity: 20,
    bookedCount: 15,
    status: 'Partially Booked',
  },
];

export const MOCK_ADMIN_AI_WORKFLOWS: AIWorkflowItem[] = [
  {
    id: 'wf-801',
    workflowId: 'WF-TL-801',
    touristName: 'Sanath Wickramasinghe',
    destination: 'Kandy, Ella & Galle',
    createdAt: '21 Aug 2026, 08:30 AM',
    currentAgent: 'Itinerary Validation Agent',
    status: 'Awaiting Approval',
    validationScore: 96,
    notes: 'Scenic train seat allocations checked for Kandy to Nanu Oya segment. Operator confirmation recommended.',
    agentsTimeline: [
      { agent: 'Travel Planner Agent', status: 'Completed', duration: '1.2s', startTime: '08:30:00 AM', result: 'Drafted 7-day multi-destination sequence based on culture & scenery' },
      { agent: 'Destination Research Agent', status: 'Completed', duration: '2.4s', startTime: '08:30:01 AM', result: 'Fetched opening hours for Temple of Tooth & Sigiriya entrance slots' },
      { agent: 'Environment & Route Agent', status: 'Completed', duration: '1.8s', startTime: '08:30:04 AM', result: 'Optimized highway transit vs mountain train connections' },
      { agent: 'Itinerary Validation Agent', status: 'In Progress', duration: '0.9s', startTime: '08:30:06 AM', result: 'Validation passed with 96% score. Requires human operator sign-off' },
    ],
  },
  {
    id: 'wf-802',
    workflowId: 'WF-TL-802',
    touristName: 'Samantha Perera',
    destination: 'Galle & Mirissa Coast',
    createdAt: '21 Aug 2026, 10:15 AM',
    currentAgent: 'Environment & Route Agent',
    status: 'Running',
    validationScore: 92,
    notes: 'Checking ocean tide tables for Mirissa whale watching departure window.',
    agentsTimeline: [
      { agent: 'Travel Planner Agent', status: 'Completed', duration: '1.1s', startTime: '10:15:00 AM', result: 'Drafted coastal relaxation itinerary' },
      { agent: 'Destination Research Agent', status: 'Completed', duration: '2.1s', startTime: '10:15:01 AM', result: 'Verified Galle Fort rampart museum timings' },
      { agent: 'Environment & Route Agent', status: 'In Progress', duration: '1.5s', startTime: '10:15:03 AM', result: 'Calculating coastal expressway drive times' },
      { agent: 'Itinerary Validation Agent', status: 'Pending', duration: '-', startTime: '-', result: 'Pending route agent output' },
    ],
  },
];

export const MOCK_ADMIN_AI_APPROVALS: AIApprovalItem[] = [
  {
    id: 'app-901',
    workflowId: 'WF-TL-801',
    touristName: 'Sanath Wickramasinghe',
    destination: 'Kandy & Ella Hill Country',
    travelDates: '15 Oct 2026 – 21 Oct 2026',
    travelersCount: 2,
    budgetRange: '$1,200 – $2,500',
    interests: ['Cultural Heritage', 'Scenic Railways', 'Tea Country Trekking', 'Sunset Viewpoints'],
    validationStatus: 'Passed with High Confidence',
    warnings: [
      'Highland monsoon rain chance (15%) on Day 4 afternoon around Ella Gap.',
      'Peak tourist hour expected at Nine Arch Bridge between 11 AM - 1 PM.',
    ],
    generatedItinerary: [
      {
        day: 1,
        title: 'Arrival in Kandy & Temple Evening Ceremony',
        morning: 'Pickup from Colombo Airport / Hotel in private AC vehicle. Drive to Kandy via Pinnawala scenic bypass.',
        afternoon: 'Check-in to Kandy hill resort. Afternoon walk around Kandy Lake and Royal Botanical Gardens.',
        evening: 'Attend evening Puja ceremony at Temple of the Sacred Tooth Relic with traditional drummers.',
      },
      {
        day: 2,
        title: 'Scenic Highland Railway to Ella',
        morning: 'Board the historic blue train from Peradeniya station to Nanu Oya / Ella.',
        afternoon: 'Enjoy tea plantation panoramas across St. Clair & Devon Falls.',
        evening: 'Arrive in Ella, check-in to mountain view eco-lodge, and dinner at Cafe Chill.',
      },
      {
        day: 3,
        title: 'Nine Arch Bridge Sunrise & Little Adam’s Peak',
        morning: 'Early morning sunrise walk to Nine Arch Bridge before peak crowd arrival.',
        afternoon: 'Hike to Little Adam’s Peak and enjoy zip-lining over the tea valley.',
        evening: 'Relaxing herbal massage and bonfire dinner in Ella village.',
      },
    ],
    totalEstimatedCost: 1850,
    aiWorkflowStatus: 'Awaiting Operator Approval',
  },
];
