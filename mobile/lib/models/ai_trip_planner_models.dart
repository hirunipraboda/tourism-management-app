class TripBudgetInput {
  final double amount;
  final String currency;
  final String category;

  const TripBudgetInput({
    this.amount = 600.0,
    this.currency = 'USD',
    this.category = 'Moderate',
  });

  Map<String, dynamic> toJson() => {
    'amount': amount,
    'currency': currency,
    'category': category,
  };

  factory TripBudgetInput.fromJson(Map<String, dynamic> json) {
    return TripBudgetInput(
      amount: (json['amount'] as num?)?.toDouble() ?? 600.0,
      currency: json['currency'] ?? 'USD',
      category: json['category'] ?? 'Moderate',
    );
  }
}

class TripPlanningRequest {
  final String? tripName;
  final String destination;
  final List<String> destinations;
  final String? startDate;
  final String? endDate;
  final int travelers;
  final int adults;
  final int children;
  final TripBudgetInput budget;
  final List<String> travelStyle;
  final List<String> activities;
  final String accommodationPreference;
  final String transportPreference;
  final String specialRequirements;

  const TripPlanningRequest({
    this.tripName,
    this.destination = 'Sri Lanka',
    this.destinations = const [],
    this.startDate,
    this.endDate,
    this.travelers = 2,
    this.adults = 2,
    this.children = 0,
    this.budget = const TripBudgetInput(),
    this.travelStyle = const [],
    this.activities = const [],
    this.accommodationPreference = '3 Star',
    this.transportPreference = 'Public Transport (Trains & Buses)',
    this.specialRequirements = '',
  });

  Map<String, dynamic> toJson() => {
    if (tripName != null && tripName!.trim().isNotEmpty) 'tripName': tripName!.trim(),
    'destination': destination,
    'destinations': destinations,
    if (startDate != null) 'startDate': startDate,
    if (endDate != null) 'endDate': endDate,
    'travelers': travelers,
    'adults': adults,
    'children': children,
    'budget': budget.toJson(),
    'travelStyle': travelStyle,
    'activities': activities,
    'accommodationPreference': accommodationPreference,
    'transportPreference': transportPreference,
    'specialRequirements': specialRequirements,
  };
}

class ItineraryActivityItem {
  final String id;
  String time;
  String title;
  String location;
  int durationMinutes;
  double estimatedCost;
  String description;
  String type;
  String? travelTimeToNext;
  String? notes;
  String? imageUrl;

  ItineraryActivityItem({
    required this.id,
    required this.time,
    required this.title,
    required this.location,
    this.durationMinutes = 90,
    this.estimatedCost = 0.0,
    this.description = '',
    this.type = 'Activity',
    this.travelTimeToNext,
    this.notes,
    this.imageUrl,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'time': time,
    'title': title,
    'location': location,
    'durationMinutes': durationMinutes,
    'estimatedCost': estimatedCost,
    'description': description,
    'type': type,
    if (travelTimeToNext != null) 'travelTimeToNext': travelTimeToNext,
    if (notes != null) 'notes': notes,
    if (imageUrl != null) 'imageUrl': imageUrl,
  };

  factory ItineraryActivityItem.fromJson(Map<String, dynamic> json) {
    return ItineraryActivityItem(
      id: json['id']?.toString() ?? 'act-${DateTime.now().millisecondsSinceEpoch}',
      time: json['time'] ?? '10:00 AM',
      title: json['title'] ?? 'Scenic Discovery',
      location: json['location'] ?? 'Sri Lanka',
      durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 90,
      estimatedCost: (json['estimatedCost'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] ?? '',
      type: json['type'] ?? 'Attraction',
      travelTimeToNext: json['travelTimeToNext']?.toString(),
      notes: json['notes']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
    );
  }

  ItineraryActivityItem copyWith({
    String? id,
    String? time,
    String? title,
    String? location,
    int? durationMinutes,
    double? estimatedCost,
    String? description,
    String? type,
    String? travelTimeToNext,
  }) {
    return ItineraryActivityItem(
      id: id ?? this.id,
      time: time ?? this.time,
      title: title ?? this.title,
      location: location ?? this.location,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      description: description ?? this.description,
      type: type ?? this.type,
      travelTimeToNext: travelTimeToNext ?? this.travelTimeToNext,
      notes: notes,
      imageUrl: imageUrl,
    );
  }
}

class ItineraryDayItem {
  final int day;
  final String date;
  final String location;
  String title;
  String? description;
  List<ItineraryActivityItem> activities;
  double estimatedCost;

  ItineraryDayItem({
    required this.day,
    required this.date,
    required this.location,
    required this.title,
    this.description,
    required this.activities,
    this.estimatedCost = 0.0,
  });

  Map<String, dynamic> toJson() => {
    'day': day,
    'date': date,
    'location': location,
    'title': title,
    if (description != null) 'description': description,
    'activities': activities.map((a) => a.toJson()).toList(),
    'estimatedCost': estimatedCost,
  };

  factory ItineraryDayItem.fromJson(Map<String, dynamic> json) {
    var rawActs = json['activities'] as List<dynamic>? ?? [];
    var actList = rawActs
        .map((a) => ItineraryActivityItem.fromJson(a as Map<String, dynamic>))
        .toList();
    return ItineraryDayItem(
      day: (json['day'] as num?)?.toInt() ?? 1,
      date: json['date'] ?? '',
      location: json['location'] ?? '',
      title: json['title'] ?? 'Day Exploration',
      description: json['description'],
      activities: actList,
      estimatedCost: (json['estimatedCost'] as num?)?.toDouble() ??
          actList.fold(0.0, (s, a) => s + a.estimatedCost),
    );
  }
}

class BudgetBreakdown {
  double accommodation;
  double transportation;
  double activities;
  double food;
  double other;
  double total;
  double remaining;
  String currency;

  BudgetBreakdown({
    this.accommodation = 0.0,
    this.transportation = 0.0,
    this.activities = 0.0,
    this.food = 0.0,
    this.other = 0.0,
    this.total = 0.0,
    this.remaining = 0.0,
    this.currency = 'USD',
  });

  Map<String, dynamic> toJson() => {
    'accommodation': accommodation,
    'transportation': transportation,
    'activities': activities,
    'food': food,
    'other': other,
    'total': total,
    'remaining': remaining,
    'currency': currency,
  };

  factory BudgetBreakdown.fromJson(Map<String, dynamic> json) {
    return BudgetBreakdown(
      accommodation: (json['accommodation'] as num?)?.toDouble() ?? 0.0,
      transportation: (json['transportation'] as num?)?.toDouble() ?? 0.0,
      activities: (json['activities'] as num?)?.toDouble() ?? 0.0,
      food: (json['food'] as num?)?.toDouble() ?? 0.0,
      other: (json['other'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      remaining: (json['remaining'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'USD',
    );
  }
}

class TripWarning {
  final String id;
  final String type;
  final String title;
  final String message;

  TripWarning({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
  });

  factory TripWarning.fromJson(Map<String, dynamic> json) {
    return TripWarning(
      id: json['id'] ?? '',
      type: json['type'] ?? 'general',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
    );
  }
}

class TripPlan {
  String title;
  String description;
  int duration;
  List<String> destinations;
  int travelers;
  String transportPreference;
  String accommodationPreference;
  List<ItineraryDayItem> days;
  BudgetBreakdown budget;
  List<TripWarning> warnings;
  double aiScore;

  TripPlan({
    required this.title,
    this.description = '',
    required this.duration,
    required this.destinations,
    this.travelers = 2,
    this.transportPreference = 'Public Transport (Trains & Buses)',
    this.accommodationPreference = '3 Star',
    required this.days,
    required this.budget,
    this.warnings = const [],
    this.aiScore = 96.0,
  });

  Map<String, dynamic> toJson() => {
    'trip': {
      'title': title,
      'description': description,
      'duration': duration,
      'destinations': destinations,
      'travelers': travelers,
      'transportPreference': transportPreference,
      'accommodationPreference': accommodationPreference,
    },
    'days': days.map((d) => d.toJson()).toList(),
    'budget': budget.toJson(),
    'metadata': {'aiScore': aiScore},
  };

  factory TripPlan.fromJson(Map<String, dynamic> json) {
    final trip = json['trip'] as Map<String, dynamic>? ?? {};
    final budgetJson = json['budget'] as Map<String, dynamic>? ?? {};
    final meta = json['metadata'] as Map<String, dynamic>? ?? {};
    final rawDays = json['days'] as List<dynamic>? ?? [];
    final daysList = rawDays
        .map((d) => ItineraryDayItem.fromJson(d as Map<String, dynamic>))
        .toList();
    final rawWarnings = json['warnings'] as List<dynamic>? ?? [];
    final warningsList = rawWarnings
        .map((w) => TripWarning.fromJson(w as Map<String, dynamic>))
        .toList();

    return TripPlan(
      title: trip['title'] ?? 'My Sri Lanka AI Adventure',
      description: trip['description'] ?? 'Personalized trip curated by NOVA Multi-Agent Engine.',
      duration: (trip['duration'] as num?)?.toInt() ?? daysList.length,
      destinations: (trip['destinations'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      travelers: (trip['travelers'] as num?)?.toInt() ?? 2,
      transportPreference: trip['transportPreference'] ?? 'Public Transport',
      accommodationPreference: trip['accommodationPreference'] ?? '3 Star',
      days: daysList,
      budget: BudgetBreakdown.fromJson(budgetJson),
      warnings: warningsList,
      aiScore: (meta['aiScore'] as num?)?.toDouble() ?? 96.0,
    );
  }
}

class AccommodationItem {
  final String id;
  final String name;
  final String destination;
  final String type;
  final double rating;
  final int reviewCount;
  final String image;
  final double pricePerNight;
  final String packageName;
  final String packageDuration;
  final List<String> includedFacilities;
  final String availability;
  final String description;

  const AccommodationItem({
    required this.id,
    required this.name,
    required this.destination,
    required this.type,
    required this.rating,
    required this.reviewCount,
    required this.image,
    required this.pricePerNight,
    required this.packageName,
    required this.packageDuration,
    required this.includedFacilities,
    this.availability = 'Available',
    required this.description,
  });
}

const List<AccommodationItem> kAccommodationsCatalog = [
  // Sigiriya
  AccommodationItem(
    id: 'acc-sig-5star',
    name: 'Heritance Kandalama',
    destination: 'Sigiriya',
    type: '5-Star Hotel',
    rating: 4.9,
    reviewCount: 384,
    image: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 240,
    packageName: 'Signature Eco-Luxury Experience',
    packageDuration: 'Flexible (1–14 Nights)',
    includedFacilities: ['Buffet Breakfast & Dinner', 'Free High-Speed WiFi', 'Infinity Cliffside Pool', 'Spa Discount', 'Nature Walk with Naturalist'],
    description: 'Iconic architectural marvel sculpted into a rocky cliff overlooking Kandalama Lake and Sigiriya Rock.',
  ),
  AccommodationItem(
    id: 'acc-sig-4star',
    name: 'Amaya Lake Resort Dambulla',
    destination: 'Sigiriya',
    type: '4-Star Hotel',
    rating: 4.6,
    reviewCount: 220,
    image: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 135,
    packageName: 'Cultural Explorer Sanctuary',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Continental Breakfast', 'Free WiFi', 'Outdoor Swimming Pool', 'Ayurvedic Treatment Center'],
    description: 'Tranquil chalets nestled along the peaceful banks of Kandalama Lake, minutes from the ancient fortress.',
  ),
  AccommodationItem(
    id: 'acc-sig-cabana',
    name: 'Sigiriya Forest Eco Cabanas',
    destination: 'Sigiriya',
    type: 'Private Cabana',
    rating: 4.8,
    reviewCount: 165,
    image: 'assets/images/destinations/sigiriya.jpg',
    pricePerNight: 85,
    packageName: 'Private Treehouse & Cabana Retreat',
    packageDuration: '1–5 Nights',
    includedFacilities: ['Traditional Sri Lankan Breakfast', 'Free WiFi', 'Campfire Evening', 'Free Rock Climb Advice'],
    description: 'Secluded handcrafted timber cabanas immersed in lush jungle canopy with direct views of Pidurangala.',
  ),

  // Kandy
  AccommodationItem(
    id: 'acc-kdy-5star',
    name: "Earl's Regency Kandy",
    destination: 'Kandy',
    type: '5-Star Hotel',
    rating: 4.8,
    reviewCount: 412,
    image: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 195,
    packageName: 'Royal Hill Capital Package',
    packageDuration: 'Flexible (1–10 Nights)',
    includedFacilities: ['Sumptuous Buffet Breakfast', 'Free High-Speed WiFi', 'Scenic Hillside Pool', 'Ayurveda Spa'],
    description: 'Perched along the winding Mahaweli River, offering regal luxury and world-class Kandyan hospitality.',
  ),
  AccommodationItem(
    id: 'acc-kdy-4star',
    name: 'Cinnamon Citadel Kandy',
    destination: 'Kandy',
    type: '4-Star Hotel',
    rating: 4.7,
    reviewCount: 310,
    image: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 125,
    packageName: 'Riverside Serenity Package',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Daily Breakfast Included', 'Free WiFi', 'Riverside Pool', 'Cultural Show Booking'],
    description: 'A riverside sanctuary surrounded by misty green hills and tropical gardens just minutes from the Sacred Temple.',
  ),
  AccommodationItem(
    id: 'acc-kdy-cabana',
    name: 'Hanthana Mountain View Cabanas',
    destination: 'Kandy',
    type: 'Private Cabana',
    rating: 4.7,
    reviewCount: 98,
    image: 'assets/images/destinations/Kandy.jpg',
    pricePerNight: 75,
    packageName: 'Private Cloud Forest Cabana',
    packageDuration: '1–4 Nights',
    includedFacilities: ['Homestyle Breakfast', 'Free WiFi', 'Tea Plantation Walk', 'Birdwatching Guide'],
    description: 'Cozy private wooden chalets nestled in the cool mist of the Hanthana mountain range overlooking tea hills.',
  ),

  // Ella
  AccommodationItem(
    id: 'acc-ela-5star',
    name: '98 Acres Resort & Spa',
    destination: 'Ella',
    type: '5-Star Hotel',
    rating: 4.9,
    reviewCount: 520,
    image: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 280,
    packageName: 'Signature Highland Luxury Chalet',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Gourmet Breakfast', 'Free High-Speed WiFi', 'Infinity Pool Facing Ella Gap', 'Spa Treatments'],
    description: 'A luxury eco-resort built on a 98-acre scenic tea estate with breathtaking panoramas of Ella Gap.',
  ),
  AccommodationItem(
    id: 'acc-ela-4star',
    name: 'The Secret Ella',
    destination: 'Ella',
    type: '4-Star Hotel',
    rating: 4.6,
    reviewCount: 180,
    image: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 140,
    packageName: 'Colonial Tea Planter Bungalow',
    packageDuration: 'Flexible (1–5 Nights)',
    includedFacilities: ['Full Breakfast Included', 'Free WiFi', 'Courtyard Pool', 'Tea Garden Walks'],
    description: 'Nestled amidst 10 acres of tea plantations with private chalets overlooking Nine Arch Bridge valley.',
  ),
  AccommodationItem(
    id: 'acc-ela-cabana',
    name: 'Ella Eco Jungle Cabana & Tents',
    destination: 'Ella',
    type: 'Private Cabana',
    rating: 4.8,
    reviewCount: 230,
    image: 'assets/images/destinations/Ella.jpg',
    pricePerNight: 70,
    packageName: 'Sunrise Ridge Cabana Pass',
    packageDuration: '1–4 Nights',
    includedFacilities: ['Tropical Breakfast', 'Free WiFi', 'Hammock on Private Veranda', 'Bonfire Setup'],
    description: 'Open-air wooden cabanas with jaw-dropping views of Little Adam’s Peak and passing mountain trains.',
  ),

  // Galle
  AccommodationItem(
    id: 'acc-gal-5star',
    name: 'Amangalla Galle Fort',
    destination: 'Galle',
    type: '5-Star Hotel',
    rating: 4.9,
    reviewCount: 275,
    image: 'assets/images/destinations/Galle.jpg',
    pricePerNight: 350,
    packageName: 'UNESCO Colonial Heritage Suite',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['A La Carte Breakfast', 'Afternoon Ceylon Tea', 'Historic Fort Walk', 'Baths & Hydrotherapy'],
    description: 'Step back into colonial romance inside the 17th-century ramparts of UNESCO World Heritage Galle Fort.',
  ),
  AccommodationItem(
    id: 'acc-gal-cabana',
    name: 'Galle Lighthouse Breeze Cabanas',
    destination: 'Galle',
    type: 'Private Cabana',
    rating: 4.7,
    reviewCount: 120,
    image: 'assets/images/destinations/Galle.jpg',
    pricePerNight: 80,
    packageName: 'Seaside Coastal Cabana',
    packageDuration: '1–5 Nights',
    includedFacilities: ['Seafood Breakfast', 'Free WiFi', 'Lighthouse Sunset Access', 'Surfboard Rental'],
    description: 'Charming beachfront cabanas overlooking breaking ocean waves near historic Galle Lighthouse.',
  ),

  // Yala
  AccommodationItem(
    id: 'acc-yal-5star',
    name: 'Chena Huts by Uga Escapes',
    destination: 'Yala',
    type: '5-Star Hotel',
    rating: 4.9,
    reviewCount: 310,
    image: 'assets/images/destinations/Yala.jpg',
    pricePerNight: 420,
    packageName: 'All-Inclusive Safari Wilderness Cabin',
    packageDuration: 'Flexible (1–5 Nights)',
    includedFacilities: ['All Meals & Premium Beverages', 'Twice Daily Private 4x4 Jeep Safari', 'Private Plunge Pool', 'Dedicated Ranger'],
    description: 'Ultra-luxurious thatched pavilion cabins with private plunge pools nestled where the jungle meets the ocean.',
  ),
  AccommodationItem(
    id: 'acc-yal-cabana',
    name: 'Yala Leopard Nest Glamping Cabana',
    destination: 'Yala',
    type: 'Private Cabana',
    rating: 4.8,
    reviewCount: 185,
    image: 'assets/images/destinations/Yala.jpg',
    pricePerNight: 110,
    packageName: 'Wilderness Treehouse Glamping',
    packageDuration: '1–3 Nights',
    includedFacilities: ['BBQ Dinner & Breakfast', 'Campfire Evening', 'Guided Safari Logistics', 'Free WiFi'],
    description: 'Elevated treehouses and canvas luxury cabanas surrounded by untouched wildlife scrubland.',
  ),

  // Mirissa
  AccommodationItem(
    id: 'acc-mir-4star',
    name: 'Paradise Beach Club Mirissa',
    destination: 'Mirissa',
    type: '4-Star Hotel',
    rating: 4.6,
    reviewCount: 290,
    image: 'assets/images/destinations/Mirissa.jpg',
    pricePerNight: 115,
    packageName: 'Oceanfront Coconut Palms Getaway',
    packageDuration: 'Flexible (1–7 Nights)',
    includedFacilities: ['Buffet Breakfast', 'Beachfront Pool', 'Whale Watching Booking Desk', 'Free WiFi'],
    description: 'Direct sandy beach access with sunset lounges right in front of Mirissa’s surfing and whale excursions.',
  ),
];
