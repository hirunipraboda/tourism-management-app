import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import riverstonImg from '../assets/destinations/riverston.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';
import kandyImg from '../assets/destinations/Kandy.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';
import anuradhapuraImg from '../assets/destinations/Anuradhapura.jpg';

export interface CatalogTour {
  id: string;
  name: string;
  tagline: string;
  destination: string;
  destinationId: string;
  imageUrl: string;
  category: 'Adventure' | 'Culture' | 'Nature' | 'Food' | 'Wildlife' | 'Wellness' | 'Beach' | 'City';
  duration: string;
  rating: number;
  reviewCount: number;
  priceFrom: string;
  isFeatured?: boolean;
  isLovedByTravelers?: boolean;
  distanceNearYou?: string;
  highlights: string[];
  included: string[];
  meetingPoint: string;
  guideInfo: string;
}

export const CATALOG_TOURS: CatalogTour[] = [
  {
    id: 'tour-knuckles-mountain',
    name: 'Knuckles Mountain Cloud Trek',
    tagline: 'Above the clouds, beyond the ordinary.',
    destination: 'Knuckles Ridge, Sri Lanka',
    destinationId: 'riverston',
    imageUrl: riverstonImg,
    category: 'Adventure',
    duration: '6 hours',
    rating: 4.9,
    reviewCount: 420,
    priceFrom: '$40',
    isFeatured: true,
    isLovedByTravelers: true,
    distanceNearYou: '5.4 km away',
    highlights: [
      'Summit sunrise above cloud blanket',
      'Cascading waterfall natural dip',
      'Indigenous highland fauna spotting',
    ],
    included: ['Highland Trekking Guide', 'Organic Picnic Breakfast', 'Hotel Pickup & Dropoff'],
    meetingPoint: 'Riverston Ridge Trek Base Camp',
    guideInfo: 'Guided by Kasun, 8 years Certified Highland Ranger',
  },
  {
    id: 'tour-sigiriya-sunrise',
    name: 'Sigiriya Fortress Sunrise & Royal Gardens',
    tagline: 'Witness the golden hour over 5th-century royal water gardens.',
    destination: 'Sigiriya, Sri Lanka',
    destinationId: 'sigiriya',
    imageUrl: sigiriyaImg,
    category: 'Culture',
    duration: '4 hours',
    rating: 4.95,
    reviewCount: 890,
    priceFrom: '$50',
    isFeatured: true,
    isLovedByTravelers: true,
    distanceNearYou: '12.8 km away',
    highlights: [
      'Early access before main tourist crowds',
      'Frescoes & Mirror Wall historical deep-dive',
      '360-degree summit jungle panorama',
    ],
    included: ['UNESCO Fast-Track Ticket', 'Licensed Historian Guide', 'Fresh King Coconut Refresher'],
    meetingPoint: 'Sigiriya Main Gate Visitor Center',
    guideInfo: 'Guided by Dr. Jayatilleke, Archeological Historian',
  },
  {
    id: 'tour-galle-fort-walk',
    name: 'Galle Fort Heritage & Colonial Ramparts Walk',
    tagline: 'Step through 400 years of living Dutch maritime history.',
    destination: 'Galle Fort, Sri Lanka',
    destinationId: 'galle',
    imageUrl: galleImg,
    category: 'Culture',
    duration: '2.5 hours',
    rating: 4.88,
    reviewCount: 650,
    priceFrom: '$25',
    isLovedByTravelers: true,
    distanceNearYou: '3.2 km away',
    highlights: [
      'Sunset stroll along granite sea bastions',
      'Dutch Reformed Church & Old Gateway secrets',
      'Artisan gem & spiced gelato tasting',
    ],
    included: ['Heritage Storyteller Guide', 'Artisanal Gelato & Spiced Chai'],
    meetingPoint: 'Galle Fort Clock Tower Plaza',
    guideInfo: 'Guided by Fatima, 4th Generation Fort Local',
  },
  {
    id: 'tour-ella-tea-train',
    name: 'Ella Nine Arch Railway & Tea Estate Walk',
    tagline: 'Capture the iconic blue train emerging through mountain mist.',
    destination: 'Ella, Sri Lanka',
    destinationId: 'ella',
    imageUrl: ellaImg,
    category: 'Nature',
    duration: '5 hours',
    rating: 4.92,
    reviewCount: 1120,
    priceFrom: '$35',
    isFeatured: true,
    isLovedByTravelers: true,
    distanceNearYou: '8.1 km away',
    highlights: [
      'Nine Arch Bridge railway photography spot',
      'Ceylon tea plucking with estate pickers',
      'Factory orthodox tea tasting flight',
    ],
    included: ['Tea Estate Specialist Guide', 'Fresh Leaf Tasting Flight', 'Tuk-Tuk Transfers'],
    meetingPoint: 'Ella Railway Station Concourse',
    guideInfo: 'Guided by Suresh, Master Tea Sommelier',
  },
  {
    id: 'tour-mirissa-whale',
    name: 'Mirissa Blue Whale Catamaran Safari',
    tagline: 'Sail alongside the ocean’s largest living creatures.',
    destination: 'Mirissa Coast, Sri Lanka',
    destinationId: 'mirissa',
    imageUrl: mirissaImg,
    category: 'Wildlife',
    duration: '5 hours',
    rating: 4.87,
    reviewCount: 780,
    priceFrom: '$60',
    isLovedByTravelers: true,
    highlights: [
      'Deep sea catamaran blue whale spotting',
      'Spinner dolphin pods in natural habitat',
      'Onboard tropical fruit breakfast buffet',
    ],
    included: ['Eco-Certified Marine Biology Guide', 'Onboard Breakfast & Drinks', 'Life Vests'],
    meetingPoint: 'Mirissa Fisheries Harbor Berth 4',
    guideInfo: 'Guided by Capt. Dilshan, Marine Conservationist',
  },
  {
    id: 'tour-yala-leopard',
    name: 'Yala Dawn Leopard & Sloth Bear Safari',
    tagline: 'Explore Sri Lanka’s wild sanctuary in open 4x4 jeeps.',
    destination: 'Yala National Park, Sri Lanka',
    destinationId: 'yala',
    imageUrl: yalaImg,
    category: 'Wildlife',
    duration: '6 hours',
    rating: 4.89,
    reviewCount: 940,
    priceFrom: '$75',
    isLovedByTravelers: true,
    highlights: [
      'High density leopard tracking',
      'Wild elephant herds at watering holes',
      'Coastal lagoon birdlife photography',
    ],
    included: ['Custom 4x4 Safari Jeep', 'Wildlife Ranger', 'Park Permits & Refreshments'],
    meetingPoint: 'Palatupana Park Gate',
    guideInfo: 'Guided by Bandara, Senior Wildlife Ranger',
  },
  {
    id: 'tour-anuradhapura-sacred',
    name: 'Anuradhapura Sacred Stupas & Kingdom Ruins',
    tagline: 'Journey through 2,500 years of ancient royal civilization.',
    destination: 'Anuradhapura, Sri Lanka',
    destinationId: 'anuradhapura',
    imageUrl: anuradhapuraImg,
    category: 'Culture',
    duration: '4 hours',
    rating: 4.84,
    reviewCount: 510,
    priceFrom: '$30',
    highlights: [
      'Jaya Sri Maha Bodhi ancient tree reverence',
      'Ruwanwelisaya immense white stupa',
      'Twin lotus ponds & stone carved guardstones',
    ],
    included: ['Bicycle or Electric Buggy Transport', 'Archeological Historian', 'Hydration Pack'],
    meetingPoint: 'Sacred City Entrance Pavilion',
    guideInfo: 'Guided by Venerable Rahula’s scholar team',
  },
  {
    id: 'tour-horton-plains-trek',
    name: 'Horton Plains & World’s End Cloud Forest Hike',
    tagline: 'Stand on the precipice of a sheer 880-meter vertical drop.',
    destination: 'Horton Plains, Sri Lanka',
    destinationId: 'horton_plains',
    imageUrl: hortonPlainsImg,
    category: 'Nature',
    duration: '5 hours',
    rating: 4.86,
    reviewCount: 630,
    priceFrom: '$38',
    highlights: [
      'World’s End precipice viewpoint',
      'Baker’s Waterfalls mountain stream trail',
      'Endemic sambar deer spotting',
    ],
    included: ['High Altitude Ranger', 'National Park Permit', 'Warm Herbal Tea & Snacks'],
    meetingPoint: 'Farr Inn Visitor Center',
    guideInfo: 'Guided by Nimal, Mountain Ecology Ranger',
  },
];
