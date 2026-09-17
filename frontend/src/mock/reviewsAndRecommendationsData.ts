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

export interface TravelerReviewItem {
  id: string;
  userName: string;
  userAvatar: string;
  userCountry: string;
  travelerType: 'Solo' | 'Couple' | 'Family' | 'Friends';
  destinationId: string;
  destinationName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  isVerified: boolean;
  tags: string[];
  highlightRating?: {
    experience: number;
    value: number;
    safety: number;
    hospitality: number;
  };
}

export interface RecommendationCardItem {
  id: string;
  title: string;
  destinationId: string;
  destinationName: string;
  tagline: string;
  category: 'Hidden Gem' | 'Seasonal Top Pick' | 'Wildlife & Nature' | 'Heritage & Culture' | 'Coastal Escapes' | 'Highland Treks';
  image: string;
  rating: number;
  reviewCount: number;
  aiMatchScore: number;
  matchReasons: string[];
  bestSeason: string;
  idealDays: string;
  estimatedBudget: string;
  travelStyles: string[];
  isEditorChoice?: boolean;
}

export const MOCK_REVIEWS: TravelerReviewItem[] = [
  {
    id: 'rev-101',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    userCountry: 'Germany',
    travelerType: 'Solo',
    destinationId: 'dest-ella',
    destinationName: 'Ella Highlands',
    rating: 5,
    date: 'Yesterday',
    title: 'The Blue Train & Nine Arches sunrise is pure magic',
    comment:
      'I followed NOVA’s AI recommended itinerary for Ella. Watching the colonial blue train cross the Nine Arches Bridge surrounded by morning fog at 9:15 AM felt like stepping into another world. The hike up Little Adam’s peak was gentle and the views of Ella gap are unforgettable!',
    photos: [ellaImg, riverstonImg],
    helpfulCount: 64,
    isVerified: true,
    tags: ['Scenic Views', 'Hiking', 'Photography', 'Tea Estates'],
    highlightRating: { experience: 5, value: 5, safety: 5, hospitality: 5 },
  },
  {
    id: 'rev-102',
    userName: 'Julian & Maya Sterling',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    userCountry: 'United Kingdom',
    travelerType: 'Couple',
    destinationId: 'dest-sigiriya',
    destinationName: 'Sigiriya Ancient Citadel',
    rating: 5,
    date: '3 days ago',
    title: 'Climbing the Lion Rock at 6:30 AM was the highlight of our year',
    comment:
      'Starting at dawn before the sun heats up the stone steps is absolute essential advice. The ancient water gardens and royal summit ruins left us speechless. The local guide arranged through NOVA provided fascinating historical insights on King Kashyapa.',
    photos: [sigiriyaImg],
    helpfulCount: 51,
    isVerified: true,
    tags: ['UNESCO Heritage', 'Archaeology', 'History', 'Sunrise'],
    highlightRating: { experience: 5, value: 4.8, safety: 4.9, hospitality: 5 },
  },
  {
    id: 'rev-103',
    userName: 'Liam Chen',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    userCountry: 'Singapore',
    travelerType: 'Friends',
    destinationId: 'dest-mirissa',
    destinationName: 'Mirissa Bay',
    rating: 5,
    date: '5 days ago',
    title: 'Spotted Blue Whales and enjoyed golden beach sunsets',
    comment:
      'The ethical whale-watching catamaran recommended by the platform was spotless, respectful to the ocean giants, and had marine biologists explaining whale behaviors. Coconut Tree Hill sunset was sensational!',
    photos: [mirissaImg],
    helpfulCount: 38,
    isVerified: true,
    tags: ['Whale Watching', 'Beach', 'Seafood', 'Surfing'],
    highlightRating: { experience: 5, value: 4.7, safety: 5, hospitality: 4.9 },
  },
  {
    id: 'rev-104',
    userName: 'Chloe Dubois',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    userCountry: 'France',
    travelerType: 'Solo',
    destinationId: 'dest-galle',
    destinationName: 'Galle Dutch Fort',
    rating: 5,
    date: '1 week ago',
    title: 'Cobblestone streets, art boutiques, and colonial ramparts',
    comment:
      'Walking along the fort walls at dusk while listening to waves crashing against the stone bastions is pure peace. Lots of cozy artisanal gelato shops, historic museums, and friendly locals.',
    photos: [galleImg],
    helpfulCount: 29,
    isVerified: true,
    tags: ['Colonial Architecture', 'Art & Culture', 'Sunsets', 'Boutiques'],
    highlightRating: { experience: 4.9, value: 4.8, safety: 5, hospitality: 5 },
  },
  {
    id: 'rev-105',
    userName: 'David & Family',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    userCountry: 'Australia',
    travelerType: 'Family',
    destinationId: 'dest-yala',
    destinationName: 'Yala National Park',
    rating: 4.8,
    date: '2 weeks ago',
    title: 'Incredible Leopard and Elephant encounters in Block 1',
    comment:
      'Our kids were thrilled beyond words when a male leopard crossed right in front of our open safari jeep! The driver was remarkably knowledgeable and respectful of the wildlife boundaries.',
    photos: [yalaImg],
    helpfulCount: 45,
    isVerified: true,
    tags: ['Wildlife Safari', 'Leopards', 'Elephants', 'Family Friendly'],
    highlightRating: { experience: 4.9, value: 4.6, safety: 4.8, hospitality: 4.9 },
  },
  {
    id: 'rev-106',
    userName: 'Sarah & Noah',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    userCountry: 'Canada',
    travelerType: 'Couple',
    destinationId: 'dest-horton',
    destinationName: 'Horton Plains & World’s End',
    rating: 4.9,
    date: '2 weeks ago',
    title: 'Chilly plateau mist and an 880-meter sheer cliff drop',
    comment:
      'We set our alarms for 5:00 AM to beat the cloud cover reaching World’s End precipice. Baker’s Falls trail was pristine. Carry a light windbreaker as the temperature can be brisk in the early morning!',
    photos: [hortonPlainsImg],
    helpfulCount: 32,
    isVerified: true,
    tags: ['Highland Plateau', 'Cloud Forests', 'Waterfalls', 'Trekking'],
    highlightRating: { experience: 4.9, value: 4.7, safety: 4.8, hospitality: 4.8 },
  },
];

export const MOCK_RECOMMENDATIONS: RecommendationCardItem[] = [
  {
    id: 'rec-1',
    title: 'Misty Highlands & Colonial Heritage Journey',
    destinationId: 'dest-ella',
    destinationName: 'Ella & Badulla Highlands',
    tagline: 'Ideal for scenic train rides, panoramic trails & tea plantation tranquility',
    category: 'Highland Treks',
    image: ellaImg,
    rating: 4.94,
    reviewCount: 1280,
    aiMatchScore: 99,
    matchReasons: ['Top rated by 98% solo & couple travelers', 'Optimal weather this season', 'Rich cultural culinary workshops'],
    bestSeason: 'Dec - May',
    idealDays: '3 - 4 Days',
    estimatedBudget: '$45 - $80 / day',
    travelStyles: ['Nature', 'Hiking', 'Photography', 'Relaxation'],
    isEditorChoice: true,
  },
  {
    id: 'rec-2',
    title: 'Ancient Royal Citadel & Cultural Triangle',
    destinationId: 'dest-sigiriya',
    destinationName: 'Sigiriya Rock Fortress',
    tagline: 'Step into the 5th-century sky palace, mirror walls & water gardens',
    category: 'Heritage & Culture',
    image: sigiriyaImg,
    rating: 4.96,
    reviewCount: 2450,
    aiMatchScore: 97,
    matchReasons: ['UNESCO World Heritage flagship', 'Ranked #1 architectural wonder in South Asia', 'Accessible day hikes'],
    bestSeason: 'Jan - Sept',
    idealDays: '2 - 3 Days',
    estimatedBudget: '$50 - $95 / day',
    travelStyles: ['Culture & Heritage', 'History', 'Adventure'],
    isEditorChoice: true,
  },
  {
    id: 'rec-3',
    title: 'Secret Knuckles Mountain Ridge & Mini World’s End',
    destinationId: 'dest-riverston',
    destinationName: 'Riverston & Matale Cloud Forest',
    tagline: 'Untouched biodiversity, windy gaps, and dramatic sheer cliff drops',
    category: 'Hidden Gem',
    image: riverstonImg,
    rating: 4.88,
    reviewCount: 420,
    aiMatchScore: 96,
    matchReasons: ['Zero tourist overcrowding', 'Pristine mountain trekking trails', 'Exceptional nature photography'],
    bestSeason: 'Year-round',
    idealDays: '2 Days',
    estimatedBudget: '$35 - $65 / day',
    travelStyles: ['Adventure', 'Nature', 'Off the Beaten Track'],
    isEditorChoice: true,
  },
  {
    id: 'rec-4',
    title: 'Golden Coconut Coasts & Ocean Whale Safaris',
    destinationId: 'dest-mirissa',
    destinationName: 'Mirissa & Weligama Bay',
    tagline: 'Sun-drenched beaches, surf breaks, and marine encounters',
    category: 'Coastal Escapes',
    image: mirissaImg,
    rating: 4.91,
    reviewCount: 1890,
    aiMatchScore: 95,
    matchReasons: ['World-class blue whale observation zone', 'Beginner to pro surf breaks', 'Vibrant seaside seafood dining'],
    bestSeason: 'Nov - April',
    idealDays: '3 - 5 Days',
    estimatedBudget: '$40 - $85 / day',
    travelStyles: ['Beach', 'Water Sports', 'Foodie', 'Relaxation'],
  },
  {
    id: 'rec-5',
    title: 'Apex Predator Safari & Birdwatching Wilderness',
    destinationId: 'dest-yala',
    destinationName: 'Yala & Bundala Reserves',
    tagline: 'South Asia’s highest leopard density alongside wild elephant herds',
    category: 'Wildlife & Nature',
    image: yalaImg,
    rating: 4.89,
    reviewCount: 1670,
    aiMatchScore: 94,
    matchReasons: ['High sighting probability for elusive Sri Lankan leopards', 'Diverse lagoon ecosystems', 'Comfortable luxury safari glamping'],
    bestSeason: 'Feb - July',
    idealDays: '2 - 3 Days',
    estimatedBudget: '$80 - $160 / day',
    travelStyles: ['Wildlife', 'Adventure', 'Photography'],
  },
  {
    id: 'rec-6',
    title: 'Pristine White Coral Sands & Pigeon Island Snorkeling',
    destinationId: 'dest-nilaveli',
    destinationName: 'Nilaveli & Trincomalee',
    tagline: 'Crystal clear calm waters, vibrant coral reefs and marine turtles',
    category: 'Seasonal Top Pick',
    image: nilaveliImg,
    rating: 4.87,
    reviewCount: 840,
    aiMatchScore: 93,
    matchReasons: ['Best coastal clarity during Eastern season', 'Pigeon Island National Marine Park', 'Historic Koneswaram temple'],
    bestSeason: 'April - Oct',
    idealDays: '3 - 4 Days',
    estimatedBudget: '$40 - $75 / day',
    travelStyles: ['Beach', 'Snorkeling', 'Culture'],
  },
];
