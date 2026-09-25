import type { Destination } from '../types/travel';

import sigiriyaImg from '../assets/destinations/sigiriya.jpg';
import ellaImg from '../assets/destinations/Ella.jpg';
import mirissaImg from '../assets/destinations/Mirissa.jpg';
import galleImg from '../assets/destinations/Galle.jpg';

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'dest-sl-1',
    name: 'Sigiriya Rock Fortress',
    country: 'Sri Lanka',
    region: 'Matale District',
    imageUrl: sigiriyaImg,
    description: 'Ancient 5th-century palace fortress carved into a 200-meter monolith surrounded by royal gardens and water moats.',
    category: 'Historical',
    rating: 4.9,
    attractionsCount: 38,
    activeTripsCount: 42,
    status: 'Featured',
    weather: { temp: 28, condition: 'Sunny' },
  },
  {
    id: 'dest-sl-2',
    name: 'Ella & Nine Arch Bridge',
    country: 'Sri Lanka',
    region: 'Badulla Highlands',
    imageUrl: ellaImg,
    description: 'Misty mountain tea plantations, cascading waterfalls, and the iconic colonial Nine Arch railway viaduct.',
    category: 'Mountain',
    rating: 4.8,
    attractionsCount: 26,
    activeTripsCount: 35,
    status: 'Featured',
    weather: { temp: 21, condition: 'Cloudy' },
  },
  {
    id: 'dest-sl-3',
    name: 'Mirissa & South Coast',
    country: 'Sri Lanka',
    region: 'Southern Province',
    imageUrl: mirissaImg,
    description: 'Azure Indian Ocean bay with coconut palm hills, blue whale watching sanctuaries, and golden sunset surfing.',
    category: 'Coastal',
    rating: 4.9,
    attractionsCount: 31,
    activeTripsCount: 29,
    status: 'Featured',
    weather: { temp: 29, condition: 'Clear' },
  },
  {
    id: 'dest-sl-4',
    name: 'Galle Dutch Fort',
    country: 'Sri Lanka',
    region: 'Galle District',
    imageUrl: galleImg,
    description: 'UNESCO 16th-century Portuguese and Dutch colonial seaside fortress with cobblestone streets and artisan cafes.',
    category: 'Cultural',
    rating: 4.85,
    attractionsCount: 40,
    activeTripsCount: 22,
    status: 'Active',
    weather: { temp: 28, condition: 'Sunny' },
  },
];
