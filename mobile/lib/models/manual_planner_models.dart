// Model definitions and catalogs for the Manual Trip Planner
// Mirroring frontend/src/mock/manualPlannerData.ts and ManualTripPlannerPage.tsx

class ManualDestination {
  final String name;
  final String region;
  final String imagePath;
  final String highlight;

  const ManualDestination({
    required this.name,
    required this.region,
    required this.imagePath,
    required this.highlight,
  });
}

class ManualTravelStyle {
  final String id;
  final String label;
  final String icon;
  final String desc;

  const ManualTravelStyle({
    required this.id,
    required this.label,
    required this.icon,
    required this.desc,
  });
}

enum AccommodationCategory { fiveStar, fourStar, privateCabana }

class ManualAccommodation {
  final String id;
  final String name;
  final String destination;
  final String typeString; // '5-Star Hotel', '4-Star Hotel', 'Private Cabana'
  final AccommodationCategory category;
  final double rating;
  final int reviewCount;
  final String imagePath;
  final double pricePerNight;
  final String packageName;
  final String packageDuration;
  final List<String> includedFacilities;
  final List<String> keyAmenities;
  final String availability;
  final String description;

  const ManualAccommodation({
    required this.id,
    required this.name,
    required this.destination,
    required this.typeString,
    required this.category,
    required this.rating,
    required this.reviewCount,
    required this.imagePath,
    required this.pricePerNight,
    required this.packageName,
    required this.packageDuration,
    required this.includedFacilities,
    required this.keyAmenities,
    required this.availability,
    required this.description,
  });
}

class ManualActivity {
  final String id;
  final String name;
  final String destination;
  final String imagePath;
  final String description;
  final int durationMinutes;
  final double estimatedCost;
  final String recommendedTime;
  final String category;
  final List<String> travelStyles;

  const ManualActivity({
    required this.id,
    required this.name,
    required this.destination,
    required this.imagePath,
    required this.description,
    required this.durationMinutes,
    required this.estimatedCost,
    required this.recommendedTime,
    required this.category,
    required this.travelStyles,
  });
}

class ManualScheduledActivity {
  final String id;
  final String sourceActivityId;
  final String name;
  final String destination;
  final String category;
  final int durationMinutes;
  final double cost;
  final String time;
  final String description;

  ManualScheduledActivity({
    required this.id,
    required this.sourceActivityId,
    required this.name,
    required this.destination,
    required this.category,
    required this.durationMinutes,
    required this.cost,
    required this.time,
    required this.description,
  });

  ManualScheduledActivity copyWith({
    String? id,
    String? time,
    String? destination,
  }) {
    return ManualScheduledActivity(
      id: id ?? this.id,
      sourceActivityId: sourceActivityId,
      name: name,
      destination: destination ?? this.destination,
      category: category,
      durationMinutes: durationMinutes,
      cost: cost,
      time: time ?? this.time,
      description: description,
    );
  }
}

class ManualPlannedDay {
  final int dayNumber;
  final String dateStr;
  String destination;
  List<ManualScheduledActivity> activities;

  ManualPlannedDay({
    required this.dayNumber,
    required this.dateStr,
    required this.destination,
    required this.activities,
  });
}

class ManualTransitLeg {
  final String id;
  final int fromDayNumber;
  final int toDayNumber;
  final String fromDestination;
  final String toDestination;
  final String mode; // 'PUBLIC_TRANSPORT' | 'PRIVATE'
  final String vehicleType;
  final double estimatedCostUSD;

  ManualTransitLeg({
    required this.id,
    required this.fromDayNumber,
    required this.toDayNumber,
    required this.fromDestination,
    required this.toDestination,
    required this.mode,
    required this.vehicleType,
    required this.estimatedCostUSD,
  });
}

// -------------------------------------------------------------
// CATALOG DATA
// -------------------------------------------------------------

const List<ManualDestination> kSriLankaDestinations = [
  ManualDestination(
    name: 'Sigiriya',
    region: 'Cultural Triangle',
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    highlight: 'Ancient Lion Rock & Royal Water Gardens',
  ),
  ManualDestination(
    name: 'Kandy',
    region: 'Central Highlands',
    imagePath: 'assets/images/destinations/Kandy.jpg',
    highlight: 'Sacred Temple of Tooth & Botanical Marvels',
  ),
  ManualDestination(
    name: 'Ella',
    region: 'Highland Ridge',
    imagePath: 'assets/images/destinations/Ella.jpg',
    highlight: 'Nine Arch Bridge & Misty Tea Panoramas',
  ),
  ManualDestination(
    name: 'Galle',
    region: 'Southern Coast',
    imagePath: 'assets/images/destinations/Galle.jpg',
    highlight: 'UNESCO Dutch Fort & Cobblestone Streets',
  ),
  ManualDestination(
    name: 'Mirissa',
    region: 'Southern Coast',
    imagePath: 'assets/images/destinations/Mirissa.jpg',
    highlight: 'Whale Watching & Golden Tropical Beaches',
  ),
  ManualDestination(
    name: 'Yala',
    region: 'Southern Province',
    imagePath: 'assets/images/destinations/Yala.jpg',
    highlight: 'Leopard Safaris & Wild National Parks',
  ),
  ManualDestination(
    name: 'Colombo',
    region: 'Western Province',
    imagePath: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    highlight: 'Vibrant Capital, Waterfront & Heritage',
  ),
  ManualDestination(
    name: 'Nuwara Eliya',
    region: 'Central Province',
    imagePath: 'assets/images/destinations/Horton Plains.jpg',
    highlight: 'Cool Mountain Air, Waterfalls & Tea Estates',
  ),
  ManualDestination(
    name: 'Anuradhapura',
    region: 'North Central',
    imagePath: 'assets/images/destinations/Anuradhapura.jpg',
    highlight: 'Ancient Monasteries & Sacred Stupas',
  ),
];

const List<ManualTravelStyle> kTravelStylesList = [
  ManualTravelStyle(id: 'Adventure', label: 'Adventure', icon: '🧗', desc: 'Hiking, rock climbs & outdoor action'),
  ManualTravelStyle(id: 'Relaxation', label: 'Relaxation', icon: '🧘', desc: 'Ayurvedic wellness & serene views'),
  ManualTravelStyle(id: 'Luxury', label: 'Luxury', icon: '✨', desc: '5-star resorts & private chalets'),
  ManualTravelStyle(id: 'Cultural', label: 'Cultural', icon: '🏛️', desc: 'Historic temples & sacred ruins'),
  ManualTravelStyle(id: 'Nature', label: 'Nature', icon: '🌿', desc: 'Lush rainforests & mountain trails'),
  ManualTravelStyle(id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Safe activities & all-age tours'),
  ManualTravelStyle(id: 'Romantic', label: 'Romantic', icon: '💖', desc: 'Sunset viewpoints & private stays'),
  ManualTravelStyle(id: 'Food & Dining', label: 'Food & Dining', icon: '🍛', desc: 'Ceylon spices & seafood feasts'),
  ManualTravelStyle(id: 'Shopping', label: 'Shopping', icon: '🛍️', desc: 'Handcrafted batiks, gems & tea'),
  ManualTravelStyle(id: 'Entertainment', label: 'Entertainment', icon: '🎭', desc: 'Cultural dance shows & nightlife'),
  ManualTravelStyle(id: 'Budget-friendly', label: 'Budget-friendly', icon: '💰', desc: 'Value stays & scenic walks'),
];

const List<ManualAccommodation> kAccommodationsCatalog = [
  // Sigiriya
  ManualAccommodation(
    id: 'acc-sig-5star',
    name: 'Heritance Kandalama',
    destination: 'Sigiriya',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.9,
    reviewCount: 384,
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 240,
    packageName: 'Signature Eco-Luxury Experience',
    packageDuration: 'Flexible (1–14 Nights)',
    includedFacilities: ['Buffet Breakfast & Dinner', 'Free WiFi', 'Infinity Cliffside Pool', 'Spa Discount'],
    keyAmenities: ['Panoramic Lake View', 'Private Balcony', 'Jacuzzi', '24/7 Butler Service'],
    availability: 'Available',
    description: 'Iconic architectural marvel sculpted into a rocky cliff overlooking Kandalama Lake and Sigiriya Rock.',
  ),
  ManualAccommodation(
    id: 'acc-sig-4star',
    name: 'Amaya Lake Resort Dambulla',
    destination: 'Sigiriya',
    typeString: '4-Star Hotel',
    category: AccommodationCategory.fourStar,
    rating: 4.6,
    reviewCount: 220,
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 135,
    packageName: 'Cultural Explorer Sanctuary',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Continental Breakfast', 'Free WiFi', 'Outdoor Swimming Pool', 'Ayurvedic Treatment'],
    keyAmenities: ['Garden Chalet', 'Free Bicycle Rental', 'Lakeside Lounge', 'Mini Bar'],
    availability: 'Available',
    description: 'Tranquil chalets nestled along the peaceful banks of Kandalama Lake, minutes from the fortress.',
  ),
  ManualAccommodation(
    id: 'acc-sig-cabana',
    name: 'Sigiriya Forest Eco Cabanas',
    destination: 'Sigiriya',
    typeString: 'Private Cabana',
    category: AccommodationCategory.privateCabana,
    rating: 4.8,
    reviewCount: 165,
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 85,
    packageName: 'Private Treehouse & Cabana Retreat',
    packageDuration: '1–5 Nights',
    includedFacilities: ['Traditional Sri Lankan Breakfast', 'Free WiFi', 'Campfire Evening', 'Rock Climb Advice'],
    keyAmenities: ['Private Wooden Deck', 'Open-Air Rain Shower', 'Forest View', 'Solar Heated Water'],
    availability: 'Instant Confirmation',
    description: 'Secluded handcrafted timber cabanas immersed in lush jungle canopy with direct views of Pidurangala.',
  ),

  // Kandy
  ManualAccommodation(
    id: 'acc-kdy-5star',
    name: "Earl's Regency Kandy",
    destination: 'Kandy',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.8,
    reviewCount: 412,
    imagePath: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 195,
    packageName: 'Royal Hill Capital Package',
    packageDuration: 'Flexible (1–10 Nights)',
    includedFacilities: ['Sumptuous Buffet Breakfast', 'Free WiFi', 'Scenic Hillside Pool', 'Ayurveda Spa'],
    keyAmenities: ['Mahaweli River View', 'Private Balcony', 'Bathtub', '24h Room Service'],
    availability: 'Available',
    description: 'Perched along the winding Mahaweli River, offering regal luxury and world-class Kandyan hospitality.',
  ),
  ManualAccommodation(
    id: 'acc-kdy-4star',
    name: 'Cinnamon Citadel Kandy',
    destination: 'Kandy',
    typeString: '4-Star Hotel',
    category: AccommodationCategory.fourStar,
    rating: 4.7,
    reviewCount: 310,
    imagePath: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 125,
    packageName: 'Riverside Serenity Package',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Daily Breakfast Included', 'Free WiFi', 'Riverside Pool', 'Cultural Show Booking'],
    keyAmenities: ['River View Terrace', 'Coffee Maker', 'Air Conditioning', 'Ensuite Bath'],
    availability: 'Few Rooms Left',
    description: 'A riverside sanctuary surrounded by misty green hills and tropical gardens just minutes from the Sacred Temple.',
  ),
  ManualAccommodation(
    id: 'acc-kdy-cabana',
    name: 'Hanthana Mountain View Cabanas',
    destination: 'Kandy',
    typeString: 'Private Cabana',
    category: AccommodationCategory.privateCabana,
    rating: 4.7,
    reviewCount: 98,
    imagePath: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 75,
    packageName: 'Private Cloud Forest Cabana',
    packageDuration: '1–4 Nights',
    includedFacilities: ['Homestyle Breakfast', 'Free WiFi', 'Tea Plantation Walk', 'Birdwatching Guide'],
    keyAmenities: ['Glass Panorama Windows', 'Hammock on Deck', 'Fireplace', 'Natural Spring Water'],
    availability: 'Instant Confirmation',
    description: 'Cozy private wooden chalets nestled in the cool mist of the Hanthana mountain range overlooking tea hills.',
  ),

  // Ella
  ManualAccommodation(
    id: 'acc-ela-5star',
    name: '98 Acres Resort & Spa',
    destination: 'Ella',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.9,
    reviewCount: 520,
    imagePath: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 280,
    packageName: 'Signature Highland Luxury Chalet',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Gourmet Breakfast', 'Free WiFi', 'Infinity Pool Facing Ella Gap', 'Spa Ceylon'],
    keyAmenities: ['Ella Gap View Chalet', 'Stone Bathroom', 'Balcony Daybed', 'Tea Estate Access'],
    availability: 'Few Rooms Left',
    description: 'A luxury eco-resort built on a 98-acre scenic tea estate with breathtaking panoramas of the famous Ella Gap.',
  ),
  ManualAccommodation(
    id: 'acc-ela-4star',
    name: 'The Secret Ella',
    destination: 'Ella',
    typeString: '4-Star Hotel',
    category: AccommodationCategory.fourStar,
    rating: 4.6,
    reviewCount: 180,
    imagePath: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 140,
    packageName: 'Colonial Tea Planter Bungalow',
    packageDuration: 'Flexible (1–5 Nights)',
    includedFacilities: ['Full Breakfast', 'Free WiFi', 'Courtyard Pool', 'Tea Garden Walks'],
    keyAmenities: ['Fireplace Suite', 'Mountain Vistas', 'Heritage Wooden Decor'],
    availability: 'Available',
    description: 'Nestled amidst 10 acres of tea plantations with private chalets overlooking Nine Arch Bridge valley.',
  ),
  ManualAccommodation(
    id: 'acc-ela-cabana',
    name: 'Ella Eco Jungle Cabanas',
    destination: 'Ella',
    typeString: 'Private Cabana',
    category: AccommodationCategory.privateCabana,
    rating: 4.8,
    reviewCount: 230,
    imagePath: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 70,
    packageName: 'Sunrise Ridge Cabana Pass',
    packageDuration: '1–4 Nights',
    includedFacilities: ['Ceylon Tea & Roti Breakfast', 'Free WiFi', 'Yoga Mat', 'Ella Rock Guide Map'],
    keyAmenities: ['Highland View Terrace', 'Outdoor Shower', 'Hammock', 'Solar Charging'],
    availability: 'Instant Confirmation',
    description: 'Eco-conscious timber chalets nestled high on the mountain ridge with front-row sunrise views of Ella Rock.',
  ),

  // Galle
  ManualAccommodation(
    id: 'acc-gle-5star',
    name: 'Amangalla Galle Fort',
    destination: 'Galle',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.9,
    reviewCount: 410,
    imagePath: 'assets/images/destinations/Galle.jpg',
    pricePerNight: 350,
    packageName: 'Ultra-Luxury Colonial Heritage',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Heritage High Tea & Breakfast', 'Free WiFi', 'Hydrotherapy Pools', 'Fort Walking Tour'],
    keyAmenities: ['Antique Four-Poster Bed', 'Freestanding Tub', 'Fort Rampart Views', 'Personal Host'],
    availability: 'Few Rooms Left',
    description: 'Historic 17th-century colonial sanctuary inside the UNESCO World Heritage Galle Fort.',
  ),
  ManualAccommodation(
    id: 'acc-gle-4star',
    name: 'Fort Bazaar Galle',
    destination: 'Galle',
    typeString: '4-Star Hotel',
    category: AccommodationCategory.fourStar,
    rating: 4.7,
    reviewCount: 245,
    imagePath: 'assets/images/destinations/Galle.jpg',
    pricePerNight: 160,
    packageName: 'Boutique Fort Merchant Experience',
    packageDuration: 'Flexible (1–5 Nights)',
    includedFacilities: ['Artisan Bakery Breakfast', 'Free WiFi', 'Z Spa Access', 'Cinema Room'],
    keyAmenities: ['Courtyard View Room', 'Espresso Machine', 'Air Conditioning'],
    availability: 'Available',
    description: 'Chic boutique hotel built inside a restored 17th-century merchants townhouse on Church Street.',
  ),

  // Mirissa
  ManualAccommodation(
    id: 'acc-mir-5star',
    name: 'Sri Sharavi Beach Villas & Spa',
    destination: 'Mirissa',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.8,
    reviewCount: 190,
    imagePath: 'assets/images/destinations/Mirissa.jpg',
    pricePerNight: 260,
    packageName: 'Beachfront Villa Luxury Getaway',
    packageDuration: 'Flexible (1–10 Nights)',
    includedFacilities: ['Oceanfront Breakfast', 'Free WiFi', '45m Saltwater Infinity Pool', 'Spa Sessions'],
    keyAmenities: ['Direct Beach Access', 'Ocean View Terrace', 'Designer Bathrooms'],
    availability: 'Available',
    description: 'Eco-chic beachfront luxury retreat steps from golden sands and turquoise coastal surf.',
  ),
  ManualAccommodation(
    id: 'acc-mir-cabana',
    name: 'Mirissa Secret Beach Cabanas',
    destination: 'Mirissa',
    typeString: 'Private Cabana',
    category: AccommodationCategory.privateCabana,
    rating: 4.8,
    reviewCount: 160,
    imagePath: 'assets/images/destinations/Mirissa.jpg',
    pricePerNight: 75,
    packageName: 'Sunset Bay Private Cabana',
    packageDuration: '1–5 Nights',
    includedFacilities: ['Island Coconut & Pancake Breakfast', 'Free WiFi', 'Private Hammocks', 'Surfboard Use'],
    keyAmenities: ['Direct Sunset View', 'Private Garden', 'Outdoor Shower', 'Queen Canopy Bed'],
    availability: 'Instant Confirmation',
    description: 'Charming private wooden beach hut overlooking Secret Beach with romantic sunset vistas and sea breeze.',
  ),

  // Yala
  ManualAccommodation(
    id: 'acc-yal-5star',
    name: 'Wild Coast Tented Lodge',
    destination: 'Yala',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.9,
    reviewCount: 310,
    imagePath: 'assets/images/destinations/Yala.jpg',
    pricePerNight: 420,
    packageName: 'Ultra-Luxury Safari Cocoon Suite',
    packageDuration: '2–4 Nights',
    includedFacilities: ['All-Inclusive Gourmet Dining', 'Daily Guided 4x4 Game Drive', 'Free WiFi', 'Sanctuary Spa'],
    keyAmenities: ['Cocoon Tent Architecture', 'Copper Bath', 'Beach & Wilderness Views', 'Personal Ranger'],
    availability: 'Few Rooms Left',
    description: 'World-renowned luxury tented camp where the jungle meets the rugged coast of the Indian Ocean.',
  ),
  ManualAccommodation(
    id: 'acc-yal-cabana',
    name: 'Yala Bush Eco Cabanas',
    destination: 'Yala',
    typeString: 'Private Cabana',
    category: AccommodationCategory.privateCabana,
    rating: 4.7,
    reviewCount: 110,
    imagePath: 'assets/images/destinations/Yala.jpg',
    pricePerNight: 90,
    packageName: 'Rustic Safari Camp & Cabana',
    packageDuration: '1–3 Nights',
    includedFacilities: ['Campfire BBQ Dinner & Breakfast', 'Free WiFi', 'Evening Stargazing', 'Safari Jeep Setup'],
    keyAmenities: ['Thatched Safari Cabana', 'Private Veranda', 'Ensuite Bathroom', 'Solar Power'],
    availability: 'Available',
    description: 'Authentic eco-cabana experience on the edge of the wilderness with evening campfires and animal sounds.',
  ),

  // Colombo
  ManualAccommodation(
    id: 'acc-cmb-5star',
    name: 'Galle Face Hotel Colombo',
    destination: 'Colombo',
    typeString: '5-Star Hotel',
    category: AccommodationCategory.fiveStar,
    rating: 4.8,
    reviewCount: 580,
    imagePath: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    pricePerNight: 190,
    packageName: 'Grand Colonial Heritage Suite',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Verandah Buffet Breakfast', 'Free WiFi', 'Saltwater Oceanfront Pool', 'Museum Tour'],
    keyAmenities: ['Ocean View Suite', 'Antique Furnishings', 'Bathtub', '24h Concierge'],
    availability: 'Available',
    description: 'South Asias legendary seaside grand hotel established in 1864 overlooking Galle Face Green.',
  ),
  ManualAccommodation(
    id: 'acc-cmb-4star',
    name: 'Cinnamon Red Colombo',
    destination: 'Colombo',
    typeString: '4-Star Hotel',
    category: AccommodationCategory.fourStar,
    rating: 4.6,
    reviewCount: 440,
    imagePath: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    pricePerNight: 95,
    packageName: 'Modern City Explorer Package',
    packageDuration: 'Flexible (1–5 Nights)',
    includedFacilities: ['Rooftop Breakfast', 'Free WiFi', '26th Floor Infinity Sky Pool', 'Cloud 9 Lounge Access'],
    keyAmenities: ['Skyline View Room', 'IPTV System', 'Tea/Coffee Station', 'Gym'],
    availability: 'Instant Confirmation',
    description: 'Chic modern lifestyle hotel with an iconic 26th-floor rooftop pool with sweeping city & ocean views.',
  ),
];

const List<ManualActivity> kActivitiesCatalog = [
  // Sigiriya
  ManualActivity(
    id: 'act-sig-1',
    name: 'Climb Sigiriya Rock Fortress',
    destination: 'Sigiriya',
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    description: 'Ascend 1,200 steps of King Kashyapas 5th-century sky palace to marvel at ancient frescoes and jungle views.',
    durationMinutes: 180,
    estimatedCost: 35,
    recommendedTime: 'Morning 07:30 AM',
    category: 'Tourist Attraction',
    travelStyles: ['Cultural', 'Adventure', 'Nature', 'Sightseeing'],
  ),
  ManualActivity(
    id: 'act-sig-2',
    name: 'Pidurangala Sunset Hike',
    destination: 'Sigiriya',
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    description: 'A rewarding 45-minute trek to a granite summit with the most breathtaking 360-degree viewpoint facing Sigiriya.',
    durationMinutes: 120,
    estimatedCost: 5,
    recommendedTime: 'Sunset 04:45 PM',
    category: 'Adventure',
    travelStyles: ['Adventure', 'Nature', 'Romantic', 'Sightseeing'],
  ),
  ManualActivity(
    id: 'act-sig-3',
    name: 'Minneriya Wild Elephant Safari',
    destination: 'Sigiriya',
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    description: 'Jeep safari to witness the world-famous Elephant Gathering where hundreds of wild Asian elephants congregate.',
    durationMinutes: 210,
    estimatedCost: 55,
    recommendedTime: 'Afternoon 02:30 PM',
    category: 'Nature & Wildlife',
    travelStyles: ['Nature', 'Family', 'Adventure', 'Entertainment'],
  ),
  ManualActivity(
    id: 'act-sig-4',
    name: 'Hiriwadunna Traditional Village Tour',
    destination: 'Sigiriya',
    imagePath: 'assets/images/destinations/sigiriya.jpg',
    description: 'Catamaran canoe ride across lotus lakes, bullock cart ride, and authentic clay pot curry lunch in a village hut.',
    durationMinutes: 150,
    estimatedCost: 22,
    recommendedTime: 'Morning 10:30 AM',
    category: 'Cultural Experience',
    travelStyles: ['Cultural', 'Family', 'Food & Dining', 'Relaxation'],
  ),

  // Kandy
  ManualActivity(
    id: 'act-kdy-1',
    name: 'Temple of the Sacred Tooth Relic',
    destination: 'Kandy',
    imagePath: 'assets/images/destinations/Kandy.jpg',
    description: 'Visit Sri Lankas most revered Buddhist shrine housing the sacred tooth relic during the drumming ceremony.',
    durationMinutes: 120,
    estimatedCost: 15,
    recommendedTime: 'Morning 09:30 AM',
    category: 'Cultural Experience',
    travelStyles: ['Cultural', 'Sightseeing', 'Family'],
  ),
  ManualActivity(
    id: 'act-kdy-2',
    name: 'Royal Botanical Gardens Peradeniya',
    destination: 'Kandy',
    imagePath: 'assets/images/destinations/Kandy.jpg',
    description: 'Explore 147 acres of world-renowned flora, giant Javan fig trees, towering royal palm avenues, and orchids.',
    durationMinutes: 150,
    estimatedCost: 12,
    recommendedTime: 'Afternoon 02:00 PM',
    category: 'Nature & Wildlife',
    travelStyles: ['Nature', 'Relaxation', 'Family', 'Romantic'],
  ),
  ManualActivity(
    id: 'act-kdy-3',
    name: 'Kandy Lake Walk & Arthur Seat Viewpoint',
    destination: 'Kandy',
    imagePath: 'assets/images/destinations/Kandy.jpg',
    description: 'Stroll around the royal lake built in 1807 and head up to Arthurs seat for sweeping views of the city and temple.',
    durationMinutes: 75,
    estimatedCost: 0,
    recommendedTime: 'Sunset 05:30 PM',
    category: 'Sightseeing',
    travelStyles: ['Relaxation', 'Sightseeing', 'Budget-friendly', 'Romantic'],
  ),
  ManualActivity(
    id: 'act-kdy-4',
    name: 'Kandyan Cultural Dance Performance',
    destination: 'Kandy',
    imagePath: 'assets/images/destinations/Kandy.jpg',
    description: 'Mesmerizing evening performance featuring traditional masked dancers, rhythmic drum beats, and fire walking.',
    durationMinutes: 60,
    estimatedCost: 10,
    recommendedTime: 'Night 06:30 PM',
    category: 'Cultural Experience',
    travelStyles: ['Cultural', 'Entertainment', 'Family'],
  ),

  // Ella
  ManualActivity(
    id: 'act-ela-1',
    name: 'Nine Arch Bridge Train Viewing',
    destination: 'Ella',
    imagePath: 'assets/images/destinations/Ella.jpg',
    description: 'Watch the iconic blue mountain express train roll across the 91-meter colonial viaduct surrounded by emerald tea slopes.',
    durationMinutes: 120,
    estimatedCost: 0,
    recommendedTime: 'Morning 08:45 AM',
    category: 'Sightseeing',
    travelStyles: ['Sightseeing', 'Nature', 'Budget-friendly', 'Adventure'],
  ),
  ManualActivity(
    id: 'act-ela-2',
    name: 'Little Adams Peak Sunrise Hike',
    destination: 'Ella',
    imagePath: 'assets/images/destinations/Ella.jpg',
    description: 'Gentle, scenic 40-minute hike through lush tea bushes leading to sweeping 360-degree views of Ella Rock.',
    durationMinutes: 120,
    estimatedCost: 0,
    recommendedTime: 'Morning 06:00 AM',
    category: 'Adventure',
    travelStyles: ['Adventure', 'Nature', 'Romantic', 'Budget-friendly'],
  ),
  ManualActivity(
    id: 'act-ela-3',
    name: 'Ravana Falls & Scenic View',
    destination: 'Ella',
    imagePath: 'assets/images/destinations/Ella.jpg',
    description: 'Marvel at one of Sri Lankas widest cascades tumbling down 25 meters, linked to the legendary Ramayana epic.',
    durationMinutes: 90,
    estimatedCost: 5,
    recommendedTime: 'Afternoon 01:30 PM',
    category: 'Nature & Wildlife',
    travelStyles: ['Nature', 'Relaxation', 'Family'],
  ),

  // Galle
  ManualActivity(
    id: 'act-gle-1',
    name: 'Galle Fort Sunset Ramparts Walk',
    destination: 'Galle',
    imagePath: 'assets/images/destinations/Galle.jpg',
    description: 'Walk atop 400-year-old ocean bastions, gaze out at the iconic white lighthouse, and browse cobblestone boutique streets.',
    durationMinutes: 120,
    estimatedCost: 0,
    recommendedTime: 'Sunset 05:15 PM',
    category: 'Sightseeing',
    travelStyles: ['Romantic', 'Sightseeing', 'Cultural', 'Budget-friendly'],
  ),
  ManualActivity(
    id: 'act-gle-2',
    name: 'Sea Turtle Hatchery & Conservation',
    destination: 'Galle',
    imagePath: 'assets/images/destinations/Galle.jpg',
    description: 'Learn about marine biology, hold newly hatched baby sea turtles, and witness ethical conservation efforts.',
    durationMinutes: 75,
    estimatedCost: 8,
    recommendedTime: 'Morning 10:00 AM',
    category: 'Nature & Wildlife',
    travelStyles: ['Nature', 'Family', 'Cultural'],
  ),

  // Mirissa
  ManualActivity(
    id: 'act-mir-1',
    name: 'Mirissa Blue Whale Watching Cruise',
    destination: 'Mirissa',
    imagePath: 'assets/images/destinations/Mirissa.jpg',
    description: 'Cruise into deep ocean waters with expert marine naturalists to encounter majestic Blue Whales, Sperm Whales, and spinner dolphins.',
    durationMinutes: 240,
    estimatedCost: 50,
    recommendedTime: 'Morning 06:15 AM',
    category: 'Nature & Wildlife',
    travelStyles: ['Adventure', 'Nature', 'Family'],
  ),
  ManualActivity(
    id: 'act-mir-2',
    name: 'Coconut Tree Hill Sunset Photoshoot',
    destination: 'Mirissa',
    imagePath: 'assets/images/destinations/Mirissa.jpg',
    description: 'Iconic terracotta headland with towering swaying palms and panoramic turquoise Indian Ocean sunset views.',
    durationMinutes: 60,
    estimatedCost: 0,
    recommendedTime: 'Sunset 05:30 PM',
    category: 'Sightseeing',
    travelStyles: ['Romantic', 'Sightseeing', 'Budget-friendly'],
  ),

  // Yala
  ManualActivity(
    id: 'act-yal-1',
    name: 'Full-Day Yala Leopard Safari',
    destination: 'Yala',
    imagePath: 'assets/images/destinations/Yala.jpg',
    description: 'Venture through Block 1 of Yala National Park in a private open-top 4x4 with an expert tracker to spot Sri Lankan leopards, sloth bears, and crocodiles.',
    durationMinutes: 300,
    estimatedCost: 65,
    recommendedTime: 'Morning 05:45 AM',
    category: 'Nature & Wildlife',
    travelStyles: ['Adventure', 'Nature', 'Family'],
  ),

  // Colombo
  ManualActivity(
    id: 'act-cmb-1',
    name: 'Galle Face Green Street Food Feast',
    destination: 'Colombo',
    imagePath: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    description: 'Stroll along the historic ocean promenade, fly kites with locals, and savor freshly prepared crispy Isso Vade and Ceylon Kottu.',
    durationMinutes: 90,
    estimatedCost: 10,
    recommendedTime: 'Sunset 05:30 PM',
    category: 'Restaurant & Food',
    travelStyles: ['Food & Dining', 'Cultural', 'Budget-friendly', 'Family'],
  ),
  ManualActivity(
    id: 'act-cmb-2',
    name: 'National Museum & Independence Square',
    destination: 'Colombo',
    imagePath: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    description: 'Explore royal crowns, ancient stone thrones, and Sri Lankan heritage inside a majestic colonial mansion.',
    durationMinutes: 120,
    estimatedCost: 6,
    recommendedTime: 'Morning 10:00 AM',
    category: 'Cultural Experience',
    travelStyles: ['Cultural', 'Sightseeing'],
  ),
];

class PrivateVehicleOption {
  final String title;
  final String capacity;
  final double dailyRate;
  final String icon;
  final String description;

  const PrivateVehicleOption({
    required this.title,
    required this.capacity,
    required this.dailyRate,
    required this.icon,
    required this.description,
  });
}

const List<PrivateVehicleOption> kPrivateVehicleOptions = [
  PrivateVehicleOption(
    title: 'AC Sedan',
    capacity: '1–3 Passengers',
    dailyRate: 35,
    icon: '🚗',
    description: 'Toyota Prius or Axio with air conditioning, perfect for couples and solo travelers.',
  ),
  PrivateVehicleOption(
    title: 'Tourist Van',
    capacity: '4–8 Passengers',
    dailyRate: 55,
    icon: '🚐',
    description: 'Spacious Toyota KDH / HiAce van with ample luggage capacity and elevated seating.',
  ),
  PrivateVehicleOption(
    title: 'Luxury SUV',
    capacity: '1–4 Passengers',
    dailyRate: 75,
    icon: '🚙',
    description: 'Premium Prado / Montero 4WD vehicle built for ultimate comfort across hill country routes.',
  ),
];
