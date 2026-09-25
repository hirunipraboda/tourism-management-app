import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import galleImg from '../assets/destinations/Galle.jpg';
import hortonPlainsImg from '../assets/destinations/Horton Plains.jpg';
import nilaveliImg from '../assets/destinations/Nilaweli.png';
import anuradhapuraImg from '../assets/destinations/Anuradhapura.jpg';
import riverstonImg from '../assets/destinations/riverston.jpg';
import kandyImg from '../assets/destinations/Kandy.jpg';
import yalaImg from '../assets/destinations/Yala.jpg';

export interface AttractionItem {
  id: string;
  name: string;
  shortDesc: string;
  category: string;
  rating: number;
  duration: string;
  image: string;
  lat: number;
  lng: number;
  openingHours: string;
  entryFee: {
    local: string;
    foreign: string;
    student?: string;
  };
  details: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  price: string;
  image: string;
  category: string;
}

export interface MapPinLocation {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  lat: number;
  lng: number;
  rating: number;
  address: string;
  image: string;
  priceLevel?: string;
}

export interface UserReview {
  id: string;
  userName: string;
  userAvatar: string;
  userCountry: string;
  rating: number;
  date: string;
  text: string;
  visitedLocation: string;
  helpfulCount: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  estimatedDuration: string;
  image: string;
  activities: {
    time: string;
    title: string;
    desc: string;
    location: string;
  }[];
}

export interface DestinationDetailRecord {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  heroImage: string;
  gallery: string[];
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  category: string;
  quickInfo: {
    bestTime: string;
    avgTemp: string;
    recommendedStay: string;
    difficulty: string;
    dailyBudget: string;
  };
  attractions: AttractionItem[];
  weather: {
    currentTemp: number;
    condition: string;
    humidity: string;
    wind: string;
    precipitation: string;
    forecast: {
      day: string;
      temp: number;
      condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';
    }[];
  };
  activities: ActivityItem[];
  mapLocations: MapPinLocation[];
  reviews: UserReview[];
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  itinerary: ItineraryDay[];
}

export const DESTINATION_DETAILS_DATABASE: Record<string, DestinationDetailRecord> = {
  ella: {
    id: 'ella',
    name: 'Ella & Nine Arch Bridge',
    shortName: 'Ella',
    country: 'Sri Lanka',
    region: 'Badulla Highlands',
    heroImage: ellaImg,
    gallery: [ellaImg, riverstonImg, hortonPlainsImg, kandyImg],
    tagline: 'Discover misty mountains, scenic train rides and peaceful tea estates.',
    description:
      'Tucked away in the misty emerald hills of Sri Lanka’s central highlands, Ella is a tranquil mountain village famed for its dramatic topography, crisp mountain air, and rich Ceylon tea heritage. Elevated at 1,041 meters above sea level, Ella offers travelers a romantic sanctuary surrounded by pine forests, cascading waterfalls, and terraced tea estates.\n\nThe town’s defining landmark is the world-renowned Nine Arches Bridge—a colonial engineering masterpiece built entirely of stone, brick, and mortar without structural steel. Visitors gather daily along lush jungle hilltops to watch the iconic azure mountain trains rumble across the 24-meter-high arches amidst rolling mist. Beyond railway heritage, Ella serves as Sri Lanka’s premier trekking hub, featuring rewarding summit trails to Little Adam’s Peak and Ella Rock cliff precipices overlooking the vast southern lowlands, as well as refreshing swims by Ravana Waterfalls and authentic clay-pot culinary classes.',
    rating: 4.9,
    reviewCount: 1240,
    category: 'Mountain & Tea Country',
    quickInfo: {
      bestTime: 'Dec – April',
      avgTemp: '21°C - 26°C',
      recommendedStay: '3 – 4 Days',
      difficulty: 'Easy to Moderate',
      dailyBudget: '$45 – $90 / day',
    },
    attractions: [
      {
        id: 'att-1',
        name: 'Nine Arches Bridge',
        shortDesc: 'Iconic colonial viaduct tucked in dense jungle, world-famous for scenic blue mountain train crossings.',
        category: 'Colonial Heritage Viaduct',
        rating: 4.95,
        duration: '1.5 - 2 hrs',
        image: ellaImg,
        lat: 6.8768,
        lng: 81.0608,
        openingHours: 'Open 24 Hours (Best train sightings: 9:30 AM & 3:30 PM)',
        entryFee: {
          local: 'Free',
          foreign: 'Free',
          student: 'Free',
        },
        details:
          'Built entirely of brick, stone, and cement without a single piece of steel during the British colonial era, this 24-meter-high architectural masterpiece connects Demodara and Ella railway stations.',
      },
      {
        id: 'att-2',
        name: "Little Adam's Peak",
        shortDesc: 'Gentle 45-minute hiking trail winding through tea bushes to 360-degree mountain ridge panoramas.',
        category: 'Trekking Viewpoint',
        rating: 4.88,
        duration: '2 - 2.5 hrs',
        image: riverstonImg,
        lat: 6.8667,
        lng: 81.0545,
        openingHours: '5:30 AM – 6:30 PM (Recommended for Sunrise / Sunset)',
        entryFee: {
          local: 'Free',
          foreign: 'Free',
        },
        details:
          'Named after the sacred Adam’s Peak due to its matching pyramidal shape, Little Adam’s Peak offers an accessible, highly scenic trail suitable for all fitness levels.',
      },
      {
        id: 'att-3',
        name: 'Ella Rock Summit',
        shortDesc: 'Rewarding highland mountain trek leading to sheer cliffs overlooking the Ella Gap and Southern Plains.',
        category: 'Hiking & Adventure Peak',
        rating: 4.85,
        duration: '4 - 5 hrs',
        image: hortonPlainsImg,
        lat: 6.8522,
        lng: 81.0423,
        openingHours: '5:00 AM – 5:30 PM',
        entryFee: {
          local: 'Free',
          foreign: 'Free (Local trekking guide optional $10 - $15)',
        },
        details:
          'A dramatic cliff summit standing at 1,041 meters elevation. The trail takes hikers along railway lines, eucalyptus forests, and tea fields before reaching a breathless precipice over the gap.',
      },
      {
        id: 'att-4',
        name: 'Ravana Falls & Cave',
        shortDesc: 'Cascading 25-meter mountain waterfall surrounded by ancient cave legends from the Ramayana epicenter.',
        category: 'Natural Waterfall',
        rating: 4.76,
        duration: '1 - 1.5 hrs',
        image: sigiriyaImg,
        lat: 6.8415,
        lng: 81.0488,
        openingHours: '7:00 AM – 6:00 PM',
        entryFee: {
          local: 'Free',
          foreign: 'Free (LKR 200 parking fee)',
        },
        details:
          'Located just 10 minutes outside Ella town center, Ravana Falls is one of Sri Lanka’s widest waterfalls, cascading over wild rock formations amidst dense flora.',
      },
    ],
    weather: {
      currentTemp: 22,
      condition: 'Partly Cloudy',
      humidity: '74%',
      wind: '11 km/h',
      precipitation: '15%',
      forecast: [
        { day: 'Mon', temp: 22, condition: 'Sunny' },
        { day: 'Tue', temp: 24, condition: 'Partly Cloudy' },
        { day: 'Wed', temp: 21, condition: 'Rainy' },
        { day: 'Thu', temp: 23, condition: 'Sunny' },
        { day: 'Fri', temp: 25, condition: 'Partly Cloudy' },
        { day: 'Sat', temp: 22, condition: 'Sunny' },
      ],
    },
    activities: [
      {
        id: 'act-1',
        title: 'Kandy to Ella Blue Train Ride',
        desc: 'Experience one of the world’s most scenic railway journeys through cloud forests, pinewood valleys, and tea plantations.',
        duration: '6 - 7 Hours',
        difficulty: 'Easy',
        price: '$15 / ticket',
        image: ellaImg,
        category: 'Scenic Railway',
      },
      {
        id: 'act-2',
        title: 'Demodara Organic Tea Estate & Factory Tour',
        desc: 'Walk through heritage tea fields, pick fresh tea leaves with local pluckers, and enjoy a curated single-origin tea tasting session.',
        duration: '2 Hours',
        difficulty: 'Easy',
        price: '$12 / person',
        image: hortonPlainsImg,
        category: 'Cultural & Culinary',
      },
      {
        id: 'act-3',
        title: 'Nine Arches Sunrise Photography Session',
        desc: 'Arrive at dawn when misty fog blankets the valley and capture the iconic blue train emerging across the 9 arches.',
        duration: '2.5 Hours',
        difficulty: 'Easy',
        price: 'Free',
        image: riverstonImg,
        category: 'Photography',
      },
      {
        id: 'act-4',
        title: 'Authentic Sri Lankan Rice & Curry Cooking Class',
        desc: 'Learn the secret blend of freshly roasted highland spices, coconut milk curries, and clay-pot cooking techniques with a local family.',
        duration: '3 Hours',
        difficulty: 'Easy',
        price: '$25 / person',
        image: kandyImg,
        category: 'Gastronomy',
      },
    ],
    mapLocations: [
      {
        id: 'map-1',
        name: 'Nine Arches Bridge',
        type: 'attraction',
        lat: 6.8768,
        lng: 81.0608,
        rating: 4.9,
        address: 'Gotuwala, Ella 90090, Sri Lanka',
        image: ellaImg,
      },
      {
        id: 'map-2',
        name: "Little Adam's Peak Viewpoint",
        type: 'attraction',
        lat: 6.8667,
        lng: 81.0545,
        rating: 4.8,
        address: 'Passara Road, Ella, Sri Lanka',
        image: riverstonImg,
      },
      {
        id: 'map-3',
        name: 'Cafe Chill Ella',
        type: 'restaurant',
        lat: 6.8712,
        lng: 81.0478,
        rating: 4.7,
        address: 'Main Street, Ella Town Center',
        image: kandyImg,
        priceLevel: '$$',
      },
      {
        id: 'map-4',
        name: '98 Acres Resort & Spa',
        type: 'hotel',
        lat: 6.8685,
        lng: 81.0520,
        rating: 4.9,
        address: 'Green Tea Estate, Ella, Sri Lanka',
        image: hortonPlainsImg,
        priceLevel: '$$$',
      },
      {
        id: 'map-5',
        name: 'Ravana Falls Pool',
        type: 'activity',
        lat: 6.8415,
        lng: 81.0488,
        rating: 4.6,
        address: 'Wellawaya-Ella Highway',
        image: sigiriyaImg,
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        userCountry: 'Switzerland',
        rating: 5,
        date: '3 days ago',
        text: 'Ella exceeded every single expectation. The train ride from Kandy was magical, but standing on Nine Arches Bridge at 9:15 AM as the train crossed through mountain fog felt like a scene out of a movie. NOVA’s daily itinerary timing was spot on!',
        visitedLocation: 'Nine Arches & Little Adam’s Peak',
        helpfulCount: 42,
      },
      {
        id: 'rev-2',
        userName: 'Marcus Vance',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        userCountry: 'Australia',
        rating: 5,
        date: '1 week ago',
        text: 'Clean air, cozy cafes, breathtaking sunrises over Little Adam’s Peak. If you visit, make sure to do the early morning hike to beat the afternoon heat. NOVA’s interactive map made finding local eateries effortless.',
        visitedLocation: 'Ella Rock Summit',
        helpfulCount: 29,
      },
      {
        id: 'rev-3',
        userName: 'Aisha Patel',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        userCountry: 'United Kingdom',
        rating: 5,
        date: '2 weeks ago',
        text: 'The tea estate tour and local rice & curry cooking class were highlights of our Sri Lanka trip. Ella has a wonderful relaxed energy that makes you want to stay forever.',
        visitedLocation: 'Demodara Tea Estate',
        helpfulCount: 18,
      },
    ],
    ratingBreakdown: {
      5: 86,
      4: 11,
      3: 2,
      2: 1,
      1: 0,
    },
    itinerary: [
      {
        day: 1,
        title: 'Highland Arrival & Nine Arches Sunset',
        estimatedDuration: 'Full Day',
        image: ellaImg,
        activities: [
          {
            time: '01:30 PM',
            title: 'Arrive in Ella via Scenic Blue Train',
            desc: 'Pull into Ella Railway Station after an iconic journey through misty highlands.',
            location: 'Ella Railway Station',
          },
          {
            time: '03:30 PM',
            title: 'Nine Arches Viaduct Walk & Train Spotting',
            desc: 'Walk down through eucalyptus trails to Nine Arches Bridge for the afternoon train crossing.',
            location: 'Nine Arches Bridge',
          },
          {
            time: '07:00 PM',
            title: 'Ella Town Center Evening Dinner',
            desc: 'Savor organic fusion cuisine & local beverages at Cafe Chill in the heart of Ella.',
            location: 'Ella Town Center',
          },
        ],
      },
      {
        day: 2,
        title: "Little Adam's Peak & Tea Factory Experience",
        estimatedDuration: 'Full Day',
        image: riverstonImg,
        activities: [
          {
            time: '06:00 AM',
            title: "Sunrise Hike up Little Adam's Peak",
            desc: 'Ascend the gentle stairs to watch golden sunlight pierce the morning clouds over Ella Gap.',
            location: "Little Adam's Peak",
          },
          {
            time: '10:30 AM',
            title: 'Heritage Organic Tea Factory Tour & Tasting',
            desc: 'Discover the art of orthodox Ceylon tea production and enjoy single-origin brew flights.',
            location: 'Demodara Tea Estate',
          },
          {
            time: '04:00 PM',
            title: 'Zip-lining Adventure & Flying Ravana',
            desc: 'Optional thrill over emerald tea canopies on Sri Lanka’s longest mega zip-line.',
            location: 'Flying Ravana Adventure Park',
          },
        ],
      },
      {
        day: 3,
        title: 'Ella Rock Challenge & Ravana Waterfalls',
        estimatedDuration: 'Full Day',
        image: hortonPlainsImg,
        activities: [
          {
            time: '06:30 AM',
            title: 'Ella Rock Cliff Summit Trek',
            desc: 'Embark on a rewarding 4-hour hike along tracks and pine forests to the summit precipice.',
            location: 'Ella Rock Peak',
          },
          {
            time: '01:00 PM',
            title: 'Ravana Falls Visit & Refreshing Dip',
            desc: 'Cool down by the misty natural pool at Ravana Falls before concluding your highland journey.',
            location: 'Ravana Falls',
          },
        ],
      },
    ],
  },
};

// Fallback dynamic generator for any missing destination ID
export function getDestinationDetails(id: string): DestinationDetailRecord {
  const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalizedId.includes('ella') || DESTINATION_DETAILS_DATABASE[normalizedId]) {
    return DESTINATION_DETAILS_DATABASE[normalizedId] || DESTINATION_DETAILS_DATABASE['ella'];
  }

  if (normalizedId.includes('sigiriya')) {
    return {
      ...DESTINATION_DETAILS_DATABASE['ella'],
      id: 'sigiriya',
      name: 'Sigiriya Rock Fortress',
      shortName: 'Sigiriya',
      region: 'Matale District',
      heroImage: sigiriyaImg,
      tagline: 'Step back in time at Sri Lanka’s 5th-century royal palace in the sky.',
      description:
        'Rising abruptly 200 meters above the surrounding emerald jungle canopy in Sri Lanka’s Cultural Triangle, Sigiriya (Lion Rock) is a UNESCO World Heritage site and one of the ancient world’s most astonishing urban planning achievements. Built in the 5th century AD by King Kasyapa, this ancient citadel served as both a royal palace complex and a secluded monastic sanctuary.\n\nAscending the rock takes travelers past immaculate 1,500-year-old water gardens, lily ponds, and marble fountains before reaching the Mirror Wall and world-famous colorful wall frescoes depicting celestial maidens. The final ascent leads through giant carved stone lion paws onto the summit plateau, where sprawling ruins of royal reception halls, swimming pools, and thrones offer 360-degree vistas over dense rainforest reserves.',
      rating: 4.92,
      reviewCount: 1580,
      category: 'UNESCO World Heritage',
      quickInfo: {
        bestTime: 'Jan – April',
        avgTemp: '27°C - 32°C',
        recommendedStay: '2 – 3 Days',
        difficulty: 'Moderate Climb',
        dailyBudget: '$50 – $100 / day',
      },
    };
  }

  if (normalizedId.includes('mirissa')) {
    return {
      ...DESTINATION_DETAILS_DATABASE['ella'],
      id: 'mirissa',
      name: 'Mirissa & South Coast',
      shortName: 'Mirissa',
      region: 'Southern Province',
      heroImage: mirissaImg,
      tagline: 'Golden palm-lined bays, blue whale encounters, and relaxed ocean vibes.',
      description:
        'Nestled along Sri Lanka’s sun-drenched southern coastline, Mirissa is a tropical coastal haven celebrated for its crescent-shaped palm bay, turquoise surfing waves, and relaxed beachside living. Famed globally as one of the world’s premier marine sanctuaries for blue whale and dolphin watching, Mirissa’s deep offshore continental shelf brings magnificent marine giants within easy reach of morning catamarans.\n\nIn addition to marine safaris, Mirissa features iconic landmarks like Coconut Tree Hill—a golden palm-covered peninsula jutting into the Indian Ocean—Secret Beach cove, and lively sunset seafood shacks where travelers dine on freshly caught tiger prawns under hanging lantern lights.',
      rating: 4.89,
      reviewCount: 980,
      category: 'Coastal Paradise',
      quickInfo: {
        bestTime: 'Nov – April',
        avgTemp: '28°C - 31°C',
        recommendedStay: '3 – 5 Days',
        difficulty: 'Easy',
        dailyBudget: '$40 – $85 / day',
      },
    };
  }

  if (normalizedId.includes('galle')) {
    return {
      ...DESTINATION_DETAILS_DATABASE['ella'],
      id: 'galle',
      name: 'Galle Dutch Fort',
      shortName: 'Galle',
      region: 'Galle District',
      heroImage: galleImg,
      tagline: 'Wander cobblestone ramparts, Portuguese bastions, and coastal artisan shops.',
      description:
        'Enclosed by solid granite ramparts on a rocky peninsula jutting into the Indian Ocean, Galle Dutch Fort is a living UNESCO World Heritage site blending 16th-century European colonial architecture with vibrant South Asian island culture. Originally constructed by Portuguese explorers in 1588 and fortified by the Dutch East India Company during the 17th century, the fort has weathered centuries of maritime trade and natural tides.\n\nToday, cobblestone alleys inside the ramparts host chic artisan boutiques, jewelers, colonial boutique hotels, and atmospheric cafes. Walking along the oceanfront stone ramparts at dusk to watch local cliff divers by the white colonial lighthouse remains one of Sri Lanka’s most cherished travel rituals.',
      rating: 4.87,
      reviewCount: 1120,
      category: 'Colonial Coastal Fort',
      quickInfo: {
        bestTime: 'Dec – April',
        avgTemp: '27°C - 30°C',
        recommendedStay: '2 – 3 Days',
        difficulty: 'Easy Walking',
        dailyBudget: '$55 – $110 / day',
      },
    };
  }

  // Default fallback to Ella
  return DESTINATION_DETAILS_DATABASE['ella'];
}
