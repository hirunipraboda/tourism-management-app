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
  status: 'Confirmed' | 'Planned' | 'Optional';
  type: 'Sightseeing' | 'Dining' | 'Transit' | 'Stay' | 'Activity';
}

export interface TripDayItinerary {
  day: number;
  date: string;
  title: string;
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
}

export interface UserTrip {
  id: string;
  name: string;
  destination: string;
  destinationId: string;
  dates: string;
  duration: string;
  travelers: number;
  travelerNames?: string[];
  status: 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed';
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
    dates: '12 – 15 September 2026',
    duration: '3 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    status: 'Upcoming',
    imageUrl: kandyImg,
    budget: '$250',
    spentBudget: '$110',
    isFeatured: true,
    progress: {
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: false,
    },
    interests: ['Culture', 'Temple Relics', 'Highland Gardens', 'Tea Tasting'],
    notes: 'Stay at Earl’s Regency Hotel. Scenic train tickets reserved for 12th morning departure from Fort Station.',
    weatherForecast: '24°C · Mostly Sunny with mild evening highland breeze',
    aiNotes: 'Pro tip: Dress modestly covering shoulders and knees for the Temple of the Tooth Relic visit. Late afternoon rains are common in the hill country.',
    dailyItinerary: [
      {
        day: 1,
        date: 'Sep 12, 2026',
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
        date: 'Sep 13, 2026',
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
        date: 'Sep 14, 2026',
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
    ],
    bookingsList: [
      {
        id: 'bk-1',
        type: 'Hotel',
        provider: "Earl's Regency Hotel Kandy",
        details: '2 Nights · Deluxe River View Room with Breakfast',
        dates: '12 Sep – 14 Sep 2026',
        confirmationCode: 'KND-88219',
        amount: '$140',
        status: 'Confirmed',
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
        date: 'Oct 24, 2026',
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
    dates: '10 – 15 November 2026',
    duration: '5 Days',
    travelers: 3,
    travelerNames: ['Sanath Wickramasinghe', 'Nipuni Fernando', 'Kavinda Silva'],
    status: 'Planning',
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
    dates: '01 – 03 December 2026',
    duration: '3 Days',
    travelers: 2,
    status: 'Planning',
    imageUrl: hortonPlainsImg,
    budget: '$220',
  },
  {
    id: 'trip-yala-safari',
    name: 'Wild Yala Wildlife Safari',
    destination: 'Yala National Park, Sri Lanka',
    destinationId: 'yala',
    dates: '10 – 12 February 2026',
    duration: '2 Days',
    travelers: 4,
    status: 'Completed',
    imageUrl: yalaImg,
    budget: '$370',
  },
];
