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

export interface CatalogDestination {
  id: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  type: 'Beach' | 'Mountain' | 'City' | 'Nature' | 'Cultural' | 'Adventure';
  budget: 'Budget' | 'Moderate' | 'Luxury';
  duration: 'Weekend' | '3–5 days' | '1 week+';
  continent: 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Oceania';
  isFeatured?: boolean;
}

export const CATALOG_DESTINATIONS: CatalogDestination[] = [
  {
    id: 'ella',
    name: 'Ella & Nine Arch Bridge',
    country: 'Sri Lanka',
    region: 'Badulla Highlands',
    imageUrl: ellaImg,
    description: 'Mountain views, tea estates, misty cloud forests and iconic blue train railway journeys.',
    rating: 4.9,
    reviewCount: 1240,
    categories: ['Mountains', 'Nature', 'Adventure'],
    type: 'Mountain',
    budget: 'Moderate',
    duration: '3–5 days',
    continent: 'Asia',
    isFeatured: true,
  },
  {
    id: 'sigiriya',
    name: 'Sigiriya Rock Fortress',
    country: 'Sri Lanka',
    region: 'Matale District',
    imageUrl: sigiriyaImg,
    description: 'UNESCO 5th-century palace fortress carved into a dramatic monolith with water gardens.',
    rating: 4.92,
    reviewCount: 1580,
    categories: ['Culture', 'Adventure'],
    type: 'Cultural',
    budget: 'Moderate',
    duration: '3–5 days',
    continent: 'Asia',
    isFeatured: true,
  },
  {
    id: 'mirissa',
    name: 'Mirissa & South Coast',
    country: 'Sri Lanka',
    region: 'Southern Province',
    imageUrl: mirissaImg,
    description: 'Azure Indian Ocean bay with Coconut Tree Hill, blue whale watching, and palm surfing.',
    rating: 4.88,
    reviewCount: 980,
    categories: ['Beaches', 'Nature'],
    type: 'Beach',
    budget: 'Budget',
    duration: '3–5 days',
    continent: 'Asia',
    isFeatured: true,
  },
  {
    id: 'galle',
    name: 'Galle Dutch Fort',
    country: 'Sri Lanka',
    region: 'Galle District',
    imageUrl: galleImg,
    description: 'Living 16th-century sea-facing fortress with cobblestone alleys, lighthouse and artisan cafes.',
    rating: 4.86,
    reviewCount: 1120,
    categories: ['Culture', 'Cities'],
    type: 'City',
    budget: 'Luxury',
    duration: 'Weekend',
    continent: 'Asia',
    isFeatured: true,
  },
  {
    id: 'horton_plains',
    name: "Horton Plains & World's End",
    country: 'Sri Lanka',
    region: 'Central Highlands',
    imageUrl: hortonPlainsImg,
    description: 'High-altitude cloud forest plateau terminating at a sheer 880-meter vertical cliff precipice.',
    rating: 4.84,
    reviewCount: 760,
    categories: ['Nature', 'Mountains', 'Adventure'],
    type: 'Nature',
    budget: 'Moderate',
    duration: 'Weekend',
    continent: 'Asia',
  },
  {
    id: 'nilaveli',
    name: 'Nilaveli & Pigeon Island',
    country: 'Sri Lanka',
    region: 'Trincomalee',
    imageUrl: nilaveliImg,
    description: 'Pristine powdery white beach with turquoise coral reefs perfect for shark & turtle snorkeling.',
    rating: 4.82,
    reviewCount: 540,
    categories: ['Beaches', 'Adventure'],
    type: 'Beach',
    budget: 'Budget',
    duration: '3–5 days',
    continent: 'Asia',
  },
  {
    id: 'anuradhapura',
    name: 'Anuradhapura Sacred City',
    country: 'Sri Lanka',
    region: 'Cultural Triangle',
    imageUrl: anuradhapuraImg,
    description: 'Ancient royal capital featuring towering white stupas, sacred Bodhi tree, and lotus pools.',
    rating: 4.85,
    reviewCount: 890,
    categories: ['Culture', 'Cities'],
    type: 'Cultural',
    budget: 'Budget',
    duration: '3–5 days',
    continent: 'Asia',
  },
  {
    id: 'riverston',
    name: 'Riverston Ridge & Knuckles',
    country: 'Sri Lanka',
    region: 'Matale Highlands',
    imageUrl: riverstonImg,
    description: 'Off-the-beaten-path mountain ridge with panoramic waterfalls, wind gaps and quiet trails.',
    rating: 4.89,
    reviewCount: 420,
    categories: ['Adventure', 'Mountains', 'Nature'],
    type: 'Adventure',
    budget: 'Budget',
    duration: 'Weekend',
    continent: 'Asia',
  },
  {
    id: 'kandy',
    name: 'Kandy Sacred Hill Capital',
    country: 'Sri Lanka',
    region: 'Central Province',
    imageUrl: kandyImg,
    description: 'Lakeside cultural sanctuary housing the Temple of the Sacred Tooth Relic & botanical gardens.',
    rating: 4.81,
    reviewCount: 1340,
    categories: ['Culture', 'Cities'],
    type: 'City',
    budget: 'Moderate',
    duration: '3–5 days',
    continent: 'Asia',
  },
  {
    id: 'yala',
    name: 'Yala National Park Safari',
    country: 'Sri Lanka',
    region: 'Southern Wildlife Zone',
    imageUrl: yalaImg,
    description: 'World’s highest density of leopards, wild elephant herds, and coastal jungle lagoons.',
    rating: 4.87,
    reviewCount: 1670,
    categories: ['Nature', 'Adventure'],
    type: 'Nature',
    budget: 'Luxury',
    duration: '3–5 days',
    continent: 'Asia',
  },
];
