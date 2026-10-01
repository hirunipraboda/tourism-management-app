import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import riverstonImg from '../assets/destinations/riverston.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';
import kandyImg from '../assets/destinations/Kandy.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';
import anuradhapuraImg from '../assets/destinations/Anuradhapura.jpg';

export interface TravelPackage {
  id: string;
  name: string;
  destination: string;
  destinationsList: string[];
  duration: string;
  nights: string;
  priceFrom: string;
  imageUrl: string;
  inclusions: string[];
  exclusions: string[];
  about: string;
  groupSize: string;
  travelStyle: string;
  bestFor: string;
  dailyItinerary: {
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
  }[];
  guide: {
    name: string;
    title: string;
    languages: string;
    rating: number;
    experience: string;
  };
  transport: {
    type: string;
    capacity: string;
    features: string;
  };
}

export interface GuidePackage {
  id: string;
  name: string;
  destination: string;
  duration: string;
  guideType: string;
  languages: string;
  rating: number;
  reviewCount: number;
  priceFrom: string;
  imageUrl: string;
  meetingPoint: string;
  inclusions: string[];
  guide: {
    name: string;
    title: string;
    experience: string;
    bio: string;
  };
}

export const TRAVEL_PACKAGES: TravelPackage[] = [
  {
    id: 'pkg-[#16A6A1]-sri-lanka-highlights',
    name: 'Sri Lanka Highlights',
    destination: 'Sri Lanka',
    destinationsList: ['Colombo', 'Kandy', 'Ella', 'Galle'],
    duration: '7 Days',
    nights: '6 Nights',
    priceFrom: '$480',
    imageUrl: sigiriyaImg,
    inclusions: ['Accommodation', 'Private Transportation', 'Selected Activities', 'Entrance Fees', 'Local Cultural Guide', 'Daily Breakfast'],
    exclusions: ['International Flights', 'Personal Expenses', 'Optional Watersports', 'Unspecified Dinners'],
    about: 'Experience Sri Lanka through its heritage, culture and surrounding landscapes with a carefully planned seven-day journey covering Colombo, Kandy, Ella, and Galle.',
    groupSize: '2–8 travelers',
    travelStyle: 'Culture · Nature · Coastal',
    bestFor: 'Couples · Families · Small Groups',
    dailyItinerary: [
      { day: 1, title: 'Arrival & Colombo Coastal Walk', morning: 'Airport arrival & private hotel transfer', afternoon: 'Colombo Fort colonial architecture walk', evening: 'Galle Face Green seaside sunset & street food' },
      { day: 2, title: 'Culture & Sacred Kandy Temple', morning: 'Travel to Kandy via Kadugannawa Pass', afternoon: 'Temple of the Sacred Tooth Relic tour', evening: 'Kandyan cultural drumming & dance performance' },
      { day: 3, title: 'Royal Botanical Gardens & Tea Estate', morning: 'Peradeniya Royal Botanical Gardens stroll', afternoon: 'Giragama Tea Factory plucking & tasting flight', evening: 'Lakeside dinner overlooking Kandy Lake' },
      { day: 4, title: 'Highland Train & Nine Arch Sunrise', morning: 'Kandy to Ella scenic observation train journey', afternoon: 'Nine Arch Bridge railway photography', evening: 'Relaxed mountain dinner at Cafe Chill Ella' },
      { day: 5, title: 'Southern Coast & Galle Fort Ramparts', morning: 'Coastal transfer to Galle', afternoon: 'Galle Dutch Fort cobblestone ramparts tour', evening: 'White lighthouse cliff sunset & artisan shopping' },
      { day: 6, title: 'Mirissa Palm Cove & Ocean Breeze', morning: 'Coconut Tree Hill palm cove photography', afternoon: 'Oceanfront tiger prawn lunch on Mirissa beach', evening: 'Beachside campfire & evening relaxation' },
      { day: 7, title: 'Final Morning & Departure', morning: 'Breakfast & Ceylon spices market stop', afternoon: 'Private transfer to Colombo Airport', evening: 'Departure fly-out' },
    ],
    guide: {
      name: 'Kasun Perera',
      title: 'Senior Cultural Guide',
      languages: 'English · Sinhala · Tamil',
      rating: 4.9,
      experience: '8 years experience',
    },
    transport: {
      type: 'Private Luxury SUV',
      capacity: '1–4 travelers',
      features: 'Air conditioning · Luggage space · Certified Chauffeur',
    },
  },
  {
    id: 'pkg-hill-country-escape',
    name: 'Hill Country Escape',
    destination: 'Ella & Nuwara Eliya',
    destinationsList: ['Kandy', 'Nuwara Eliya', 'Ella'],
    duration: '4 Days',
    nights: '3 Nights',
    priceFrom: '$260',
    imageUrl: ellaImg,
    inclusions: ['Boutique Tea Bungalow Stay', 'First-Class Train Tickets', 'Tea Tasting Session', 'Guided Trekking'],
    exclusions: ['Lunch & Dinner Drinks', 'Personal Souvenirs'],
    about: 'Escape into misty mountain peaks, rolling Ceylon tea plantations, cascading waterfalls, and crisp highland climate.',
    groupSize: '2–4 travelers',
    travelStyle: 'Nature · Hiking · Relaxation',
    bestFor: 'Couples · Nature Lovers',
    dailyItinerary: [
      { day: 1, title: 'Kandy to Nuwara Eliya Highlands', morning: 'Scenic drive through Ramboda Waterfalls', afternoon: 'Pedro Tea Estate tour & tasting', evening: 'Cozy fireplace dinner at Little England' },
      { day: 2, title: 'Observation Train to Ella', morning: 'Board classic blue train to Ella', afternoon: 'Nine Arch Bridge photography', evening: 'Charming Ella town dinner' },
      { day: 3, title: 'Little Adam’s Peak & Ravana Falls', morning: 'Sunrise trek up Little Adam’s Peak', afternoon: 'Ravana Falls natural pool dip', evening: 'Highland bungalow sunset cocktail' },
      { day: 4, title: 'Highland Departure', morning: 'Morning breakfast & return transfer', afternoon: 'Airport / Colombo transfer', evening: 'Departure' },
    ],
    guide: {
      name: 'Suresh Kumar',
      title: 'Highland Adventure Guide',
      languages: 'English · Sinhala',
      rating: 4.95,
      experience: '6 years experience',
    },
    transport: {
      type: 'Private SUV / Van',
      capacity: '1–6 travelers',
      features: 'AC · Mountain Suspension · Luggage Space',
    },
  },
  {
    id: 'pkg-southern-coast-journey',
    name: 'Southern Coast Journey',
    destination: 'Galle & Mirissa',
    destinationsList: ['Galle', 'Mirissa', 'Unawatuna'],
    duration: '5 Days',
    nights: '4 Nights',
    priceFrom: '$310',
    imageUrl: galleImg,
    inclusions: ['Beachfront Resort Stay', 'Galle Fort Heritage Tour', 'Mirissa Catamaran Charter', 'Daily Breakfast'],
    exclusions: ['Flight Tickets', 'Personal Water Sports'],
    about: 'Unwind along golden palm beaches, historic 17th-century Dutch Fort ramparts, and turquoise ocean waters.',
    groupSize: '2–6 travelers',
    travelStyle: 'Beach · Heritage · Wildlife',
    bestFor: 'Beach Lovers · Families',
    dailyItinerary: [
      { day: 1, title: 'Arrival in Galle Dutch Fort', morning: 'Transfer to Galle Fort', afternoon: 'Check in boutique colonial hotel', evening: 'Ramparts sunset walk' },
      { day: 2, title: 'Heritage & Spiced Dining', morning: 'Guided cobblestone fort history walk', afternoon: 'Artisanal gem & gelato tasting', evening: 'Seafood dinner inside Fort' },
      { day: 3, title: 'Mirissa Blue Whale Safari', morning: 'Early catamaran ocean charter', afternoon: 'Coconut Tree Hill photography', evening: 'Sunset beach lounge' },
      { day: 4, title: 'Unawatuna Jungle Beach', morning: 'Jungle beach secluded cove swim', afternoon: 'Japanese Peace Pagoda view', evening: 'Beachfront barbecue dinner' },
      { day: 5, title: 'Coastal Farewell', morning: 'Morning ocean dip & breakfast', afternoon: 'Express highway return transfer', evening: 'Departure' },
    ],
    guide: {
      name: 'Fatima Nazeer',
      title: 'Fort & Coastal Specialist',
      languages: 'English · Sinhala · Arabic',
      rating: 4.88,
      experience: '5 years experience',
    },
    transport: {
      type: 'Private Sedan / Van',
      capacity: '1–6 travelers',
      features: 'AC · Leather Seats · Ocean Drive',
    },
  },
  {
    id: 'pkg-kandy-cultural-escape',
    name: 'Kandy Cultural Escape',
    destination: 'Kandy',
    destinationsList: ['Kandy', 'Peradeniya'],
    duration: '3 Days',
    nights: '2 Nights',
    priceFrom: '$150',
    imageUrl: kandyImg,
    inclusions: ['Lakeside Hotel Accommodation', 'Temple Fast-Track Tickets', 'Botanical Gardens Guide', 'Private Vehicle'],
    exclusions: ['Personal Expenses', 'Unspecified Dinners'],
    about: 'Experience Kandy through its sacred heritage, Royal Botanical Gardens, and surrounding mountain valley landscapes.',
    groupSize: '2–8 travelers',
    travelStyle: 'Culture · Heritage',
    bestFor: 'Couples · Families · Culture Seekers',
    dailyItinerary: [
      { day: 1, title: 'Arrival & Kandy Lake', morning: 'Arrival & hotel check-in', afternoon: 'Kandy city exploration', evening: 'Temple of the Tooth Relic evening puja' },
      { day: 2, title: 'Culture & Nature', morning: 'Kandyan ves dance performance', afternoon: 'Peradeniya Royal Botanical Gardens', evening: 'Kandy viewpoint sunset' },
      { day: 3, title: 'Final Morning & Spices', morning: 'Breakfast & local spice market walk', afternoon: 'Artisan souvenir shopping', evening: 'Return transfer' },
    ],
    guide: {
      name: 'Kasun Perera',
      title: 'Local Cultural Guide',
      languages: 'English · Sinhala · Tamil',
      rating: 4.9,
      experience: '8 years experience',
    },
    transport: {
      type: 'Private Sedan / SUV',
      capacity: '1–4 travelers',
      features: 'AC · Certified Chauffeur Guide',
    },
  },
];

export const GUIDE_PACKAGES: GuidePackage[] = [
  {
    id: 'guide-kandy-cultural',
    name: 'Cultural Explorer',
    destination: 'Kandy',
    duration: '4 Hours',
    guideType: 'Cultural Guide',
    languages: 'English · Sinhala · Tamil',
    rating: 4.9,
    reviewCount: 420,
    priceFrom: '$30',
    imageUrl: kandyImg,
    meetingPoint: 'Kandy Royal Palace Visitor Complex Gate',
    inclusions: ['Temple of the Sacred Tooth Relic Guide', 'Kandy Lake Historical Lore', 'Royal Palace Grounds Access', 'Fresh King Coconut Refreshment'],
    guide: {
      name: 'Kasun Perera',
      title: 'Senior Cultural Historian',
      experience: '8 years experience',
      bio: 'Native to Kandy with an Archeological History degree from Peradeniya University. Specializes in 16th-century royal palace relics.',
    },
  },
  {
    id: 'guide-ella-adventure',
    name: 'Ella Adventure Guide',
    destination: 'Ella',
    duration: 'Full Day (8 Hours)',
    guideType: 'Adventure Guide',
    languages: 'English · Sinhala',
    rating: 4.95,
    reviewCount: 310,
    priceFrom: '$45',
    imageUrl: ellaImg,
    meetingPoint: 'Ella Railway Station Concourse',
    inclusions: ['Ella Rock Summit Guided Trail', 'Nine Arch Bridge Secret Viewpoint', 'Ravana Waterfalls Trail', 'Highland Energy Refreshment Pack'],
    guide: {
      name: 'Suresh Kumar',
      title: 'Certified Mountain Ranger',
      experience: '6 years experience',
      bio: 'Lifelong highland outdoorsman certified in mountain wilderness safety and flora identification.',
    },
  },
  {
    id: 'guide-galle-heritage',
    name: 'Galle Heritage Walk',
    destination: 'Galle',
    duration: '3 Hours',
    guideType: 'Local Guide',
    languages: 'English · Sinhala · Arabic',
    rating: 4.88,
    reviewCount: 520,
    priceFrom: '$25',
    imageUrl: galleImg,
    meetingPoint: 'Galle Fort Clock Tower Square',
    inclusions: ['Dutch Ramparts & Gateway Tour', 'Dutch Reformed Church Secrets', 'Artisan Gem & Antique Alley Walk', 'Artisanal Spiced Gelato Stop'],
    guide: {
      name: 'Fatima Nazeer',
      title: 'Heritage Storyteller',
      experience: '5 years experience',
      bio: '4th generation Galle Fort local passionate about Portuguese and Dutch maritime history stories.',
    },
  },
  {
    id: 'guide-sigiriya-history',
    name: 'Sigiriya Ancient Fortress Guide',
    destination: 'Sigiriya',
    duration: '4 Hours',
    guideType: 'Cultural Guide',
    languages: 'English · Sinhala · French',
    rating: 4.96,
    reviewCount: 680,
    priceFrom: '$35',
    imageUrl: sigiriyaImg,
    meetingPoint: 'Sigiriya Main Gate Visitor Pavilion',
    inclusions: ['5th-Century Water Gardens Explanation', 'Frescoes & Mirror Wall History', 'Summit Palace Ruins Guided Walk', 'Fast-Track Entrance Assistance'],
    guide: {
      name: 'Dr. Jayatilleke',
      title: 'UNESCO Archeological Historian',
      experience: '12 years experience',
      bio: 'Author and former researcher for the Central Cultural Fund specializing in King Kashyapa’s royal city.',
    },
  },
  {
    id: 'guide-yala-wildlife',
    name: 'Yala Wildlife Ranger',
    destination: 'Yala',
    duration: '6 Hours (Full Safari)',
    guideType: 'Wildlife Guide',
    languages: 'English · Sinhala',
    rating: 4.91,
    reviewCount: 440,
    priceFrom: '$50',
    imageUrl: yalaImg,
    meetingPoint: 'Palatupana Safari Park Gate',
    inclusions: ['Leopard & Sloth Bear Tracking', 'Custom 4x4 Jeep Spotting Assistance', 'Coastal Lagoon Birdlife Guide', 'Wilderness Refreshment Pack'],
    guide: {
      name: 'Bandara Herath',
      title: 'Senior Wildlife Tracker',
      experience: '10 years experience',
      bio: 'Grew up on the borders of Yala National Park with deep expert knowledge of leopard territory behavior.',
    },
  },
];
