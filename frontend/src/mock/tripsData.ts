import kandyImg from '../assets/destinations/Kandy.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';

export interface TripStepProgress {
  destination: boolean;
  preferences: boolean;
  aiPlanning: boolean; // actively generating or done
  itinerary: boolean;
  bookings: boolean;
}

export interface TripActivityDetail {
  time: string;
  title: string;
  location: string;
  description: string;
  status: 'Confirmed' | 'Planned' | 'Optional' | 'Completed' | 'In Progress' | 'Upcoming' | 'Today';
  type: 'Sightseeing' | 'Dining' | 'Transit' | 'Stay' | 'Activity';
  activityStatus?: 'Completed' | 'In Progress' | 'Upcoming' | 'Today';
}

export interface TripDayItinerary {
  day: number;
  date: string;
  title: string;
  status?: 'Completed' | 'Today' | 'Upcoming';
  activities: TripActivityDetail[];
}

export interface TripBookingDetail {
  id: string;
  type: 'Hotel' | 'Transport' | 'Activity' | 'Flight';
  provider: string;
  details: string;
  dates: string;
  confirmationCode: string;
  amount: string;
  status: 'Confirmed' | 'Pending';
  destination?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  packageName?: string;
  nights?: number;
  rooms?: number;
  checkInDate?: string;
  checkOutDate?: string;
  bookedAt?: string;
  paymentMethod?: string;
  taxesAndService?: string;
  subtotal?: string;
  includedFacilities?: string[];
  specialRequests?: string;
}

export interface UserTrip {
  id: string;
  name: string;
  destination: string;
  destinationId: string;
  startDate?: string;
  endDate?: string;
  dates: string;
  duration: string;
  travelers: number;
  travelerNames?: string[];
  status: 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed' | 'Cancelled';
  timelineLabel?: string;
  imageUrl: string;
  budget?: string;
  spentBudget?: string;
  isFeatured?: boolean;
  progress?: TripStepProgress;
  interests?: string[];
  notes?: string;
  weatherForecast?: string;
  dailyItinerary?: TripDayItinerary[];
  bookingsList?: TripBookingDetail[];
  budgetBreakdown?: { category: string; amount: string }[];
  aiNotes?: string;
}

export const MOCK_USER_TRIPS: UserTrip[] = [
  {
    id: 'trip-kandy-escape',
    name: 'Kandy Escape',
    destination: 'Kandy, Sri Lanka',
    destinationId: 'kandy',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    dates: '28 Sep – 02 Oct 2026',
    duration: '5 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    status: 'Ongoing',
    imageUrl: kandyImg,
    budget: '$250',
    spentBudget: '$110',
    isFeatured: true,
    progress: {
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    },
    interests: ['Culture', 'Temple Relics', 'Highland Gardens', 'Tea Tasting'],
    notes: 'Stay at Earl’s Regency Hotel. Scenic train tickets reserved for morning departure from Fort Station.',
    weatherForecast: '24°C · Mostly Sunny with mild evening highland breeze',
    aiNotes: 'Pro tip: Dress modestly covering shoulders and knees for the Temple of the Tooth Relic visit. Late afternoon rains are common in the hill country.',
    dailyItinerary: [
      {
        day: 1,
        date: '2026-09-28',
        title: 'Scenic Train Ride & Sacred Temple Exploration',
        activities: [
          {
            time: '07:00 AM',
            title: 'Colombo Fort to Kandy Observation Car Train',
            location: 'Colombo Fort Railway Station',
            description: 'Board the historic main-line train winding through misty mountain tunnels and tea plantations.',
            status: 'Confirmed',
            type: 'Transit',
          },
          {
            time: '11:30 AM',
            title: 'Check-in at Earl’s Regency Hotel',
            location: 'Tennekumbura, Kandy',
            description: 'Unpack and enjoy welcome Ceylon iced tea overlooking Mahaweli River views.',
            status: 'Confirmed',
            type: 'Stay',
          },
          {
            time: '04:30 PM',
            title: 'Temple of the Sacred Tooth Relic Evening Puja',
            location: 'Kandy Royal Palace Complex',
            description: 'Attend the sacred evening drum ritual and view the golden relic casket.',
            status: 'Planned',
            type: 'Sightseeing',
          },
          {
            time: '07:30 PM',
            title: 'Lakeside Dinner at Cafe Bamboo',
            location: 'Kandy Lake Round Road',
            description: 'Authentic Kandyan spiced rice, curry, and fresh papaya juices.',
            status: 'Planned',
            type: 'Dining',
          },
        ],
      },
      {
        day: 2,
        date: '2026-09-29',
        title: 'Royal Botanical Gardens & Ceylon Tea Estate',
        activities: [
          {
            time: '08:30 AM',
            title: 'Peradeniya Royal Botanical Gardens Tour',
            location: 'Peradeniya, Kandy',
            description: 'Stroll through the 147-acre gardens, Giant Javan Fig tree lawn, and Orchid House.',
            status: 'Planned',
            type: 'Activity',
          },
          {
            time: '01:30 PM',
            title: 'Giragama Tea Factory Tasting Session',
            location: 'Giragama Estate',
            description: 'Learn orthodox tea leaf processing and sample Single-Origin BOP Tea.',
            status: 'Planned',
            type: 'Activity',
          },
          {
            time: '06:30 PM',
            title: 'Kandyan Cultural Dance & Fire Walking Show',
            location: 'Kandy Cultural Center',
            description: 'Traditional drum rhythms, ves dancers, and dramatic fire-walking performances.',
            status: 'Planned',
            type: 'Sightseeing',
          },
        ],
      },
      {
        day: 3,
        date: '2026-09-30',
        title: 'Udawatta Kele Forest & Artisan Craft Shopping',
        activities: [
          {
            time: '07:30 AM',
            title: 'Udawatta Kele Sanctuary Canopy Hike',
            location: 'Udawatta Kele Forest',
            description: 'Morning birdwatching trail past ancient hermit caves and royal monkey troops.',
            status: 'Optional',
            type: 'Activity',
          },
          {
            time: '12:00 PM',
            title: 'Handloom & Wood Carving Souvenir Shopping',
            location: 'Kandy City Center',
            description: 'Pick up hand-carved masks, brassware, and Ceylon cinnamon spices.',
            status: 'Planned',
            type: 'Activity',
          },
        ],
      },
      {
        day: 4,
        date: '2026-10-01',
        title: 'Knuckles Mountain Foothills & Spice Grove',
        activities: [
          {
            time: '09:00 AM',
            title: 'Matale Organic Spice Garden Guided Tour',
            location: 'Matale',
            description: 'Discover cardamom, vanilla, and clove cultivation with herbal massage demonstration.',
            status: 'Planned',
            type: 'Activity',
          },
        ],
      },
      {
        day: 5,
        date: '2026-10-02',
        title: 'Highland Leisure & Return Scenic Transit',
        activities: [
          {
            time: '10:00 AM',
            title: 'Hotel Check-out & Scenic Lake Stroll',
            location: 'Kandy Lake Round',
            description: 'Final morning coffee overlooking clouds lifting off the lake.',
            status: 'Planned',
            type: 'Activity',
          },
          {
            time: '02:30 PM',
            title: 'Return Intercity Express to Colombo Fort',
            location: 'Kandy Railway Station',
            description: 'Afternoon express transit descending from highlands.',
            status: 'Confirmed',
            type: 'Transit',
          },
        ],
      },
    ],
    bookingsList: [
      {
        id: 'bk-1',
        type: 'Hotel',
        provider: "Earl's Regency Hotel Kandy",
        details: '4 Nights · Deluxe River View Room with Breakfast',
        dates: '28 Sep – 02 Oct 2026',
        confirmationCode: 'KND-88219',
        amount: '$280',
        status: 'Confirmed',
        destination: 'Kandy',
        packageName: 'Deluxe River View Retreat',
        guestName: 'Hiruni Praboda',
        guestEmail: 'hiruni.praboda@gmail.com',
        guestPhone: '+94 77 123 4567',
        nights: 4,
        rooms: 1,
        checkInDate: '2026-09-28',
        checkOutDate: '2026-10-02',
        bookedAt: 'Sep 10, 2026 · 14:32',
        paymentMethod: 'Credit / Debit Card (Online Verified)',
        taxesAndService: '$14',
        subtotal: '$126',
        includedFacilities: ['Swimming Pool & Cabana Access', 'Daily Gourmet Breakfast', 'Free High-speed Wi-Fi', 'Balcony River View'],
        specialRequests: 'Quiet high-floor room overlooking Mahaweli river',
      },
      {
        id: 'bk-2',
        type: 'Transport',
        provider: 'Sri Lanka Railways',
        details: '2 First-Class Observation Car Train Seats (Colombo -> Kandy)',
        dates: '12 Sep 2026 (07:00 AM)',
        confirmationCode: 'SCR-44120',
        amount: '$25',
        status: 'Confirmed',
      },
      {
        id: 'bk-3',
        type: 'Activity',
        provider: 'Temple of Tooth Relic Entry Pass',
        details: '2 Foreign Visitor Fast-Track Entry Tickets + Audio Guide',
        dates: '12 Sep 2026',
        confirmationCode: 'TTR-90124',
        amount: '$15',
        status: 'Confirmed',
      },
    ],
    budgetBreakdown: [
      { category: 'Accommodations', amount: '$140' },
      { category: 'Transfers & Train', amount: '$35' },
      { category: 'Activities & Tickets', amount: '$40' },
      { category: 'Meals & Dining', amount: '$35' },
    ],
  },
  {
    id: 'trip-hill-country',
    name: 'Hill Country Escape',
    destination: 'Ella, Sri Lanka',
    destinationId: 'ella',
    startDate: '2026-10-24',
    endDate: '2026-10-28',
    dates: '24 – 28 October 2026',
    duration: '4 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Kasun Perera'],
    status: 'Upcoming',
    imageUrl: ellaImg,
    budget: '$320',
    spentBudget: '$190',
    progress: {
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    },
    interests: ['Mountains', 'Tea Estates', 'Hiking', 'Railway Engineering'],
    weatherForecast: '21°C · Crisp Highland Mist & Cool Evenings',
    aiNotes: 'Sunrise at Nine Arches Bridge occurs around 05:45 AM. Arrive early for crowd-free photography.',
    dailyItinerary: [
      {
        day: 1,
        date: '2026-10-24',
        title: 'Nine Arches Sunrise & Mountain Check-in',
        activities: [
          {
            time: '06:00 AM',
            title: 'Nine Arches Bridge Morning Train Spotting',
            location: 'Gotuwala, Ella',
            description: 'Watch the morning express train emerge through misty jungle hills across the 9 arches.',
            status: 'Confirmed',
            type: 'Sightseeing',
          },
          {
            time: '02:00 PM',
            title: 'Check-in at 98 Acres Resort & Spa',
            location: 'Ella Tea Estate',
            description: 'Eco-luxury chalet overlooking Little Adam’s Peak valley.',
            status: 'Confirmed',
            type: 'Stay',
          },
        ],
      },
    ],
    bookingsList: [
      {
        id: 'bk-ella-1',
        type: 'Hotel',
        provider: '98 Acres Resort & Spa',
        details: '3 Nights · Premium Chalet with Breakfast & Tea Plantation Tour',
        dates: '24 Oct – 27 Oct 2026',
        confirmationCode: 'ELA-77182',
        amount: '$240',
        status: 'Confirmed',
      },
    ],
  },
  {
    id: 'trip-southern-coast',
    name: 'Southern Coast Explorer',
    destination: 'Galle & Mirissa, Sri Lanka',
    destinationId: 'mirissa',
    startDate: '2026-11-10',
    endDate: '2026-11-15',
    dates: '10 – 15 November 2026',
    duration: '5 Days',
    travelers: 3,
    travelerNames: ['Sanath Wickramasinghe', 'Nipuni Fernando', 'Kavinda Silva'],
    status: 'Upcoming',
    imageUrl: galleImg,
    budget: '$400',
    spentBudget: '$50',
    progress: {
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: false,
      bookings: false,
    },
    interests: ['Beaches', 'Dutch Fort', 'Whale Safari', 'Seafood'],
    weatherForecast: '28°C · Tropical Sunshine & Warm Ocean Breezes',
  },
  {
    id: 'trip-cultural-journey',
    name: 'Cultural Triangle Journey',
    destination: 'Sigiriya & Anuradhapura, Sri Lanka',
    destinationId: 'sigiriya',
    startDate: '2026-05-15',
    endDate: '2026-05-18',
    dates: '15 – 18 May 2026',
    duration: '3 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    status: 'Completed',
    imageUrl: sigiriyaImg,
    budget: '$270',
    spentBudget: '$265',
    progress: {
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    },
    interests: ['Ancient Ruins', 'Royal Palaces'],
  },
  {
    id: 'trip-highland-mist',
    name: 'Highland Mist Retreat',
    destination: 'Horton Plains, Sri Lanka',
    destinationId: 'horton_plains',
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    dates: '01 – 03 December 2026',
    duration: '3 Days',
    travelers: 2,
    status: 'Upcoming',
    imageUrl: hortonPlainsImg,
    budget: '$220',
  },
  {
    id: 'trip-yala-safari',
    name: 'Wild Yala Wildlife Safari',
    destination: 'Yala National Park, Sri Lanka',
    destinationId: 'yala',
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    dates: '10 – 12 February 2026',
    duration: '2 Days',
    travelers: 4,
    status: 'Completed',
    imageUrl: yalaImg,
    budget: '$370',
  },
];
