class Destination {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String location;
  final String province;
  final String district;
  final String category;
  final String imageUrl;
  final double rating;
  final int reviewCount;
  final double entryFee;
  final String bestTimeToVisit;
  final String recommendedStayDays;
  final String avgBudgetPerDay;
  final String openingHours;
  final String entryFeeLocal;
  final String entryFeeForeign;
  final List<String> topAttractions;
  final List<AttractionItem> attractions;
  final double liveTemp;
  final String liveCondition;
  final int humidity;
  final double windSpeed;

  Destination({
    required this.id,
    required this.name,
    this.slug = '',
    required this.description,
    required this.location,
    this.province = 'Central Province',
    this.district = '',
    this.category = 'Cultural',
    required this.imageUrl,
    required this.rating,
    this.reviewCount = 0,
    required this.entryFee,
    this.bestTimeToVisit = 'Year-round',
    this.recommendedStayDays = '2 - 3 Days',
    this.avgBudgetPerDay = '\$60 - \$90 / day',
    this.openingHours = '06:00 AM – 06:00 PM Daily',
    this.entryFeeLocal = 'Free Entry',
    this.entryFeeForeign = '\$25 USD',
    this.topAttractions = const [],
    this.attractions = const [],
    this.liveTemp = 24.5,
    this.liveCondition = 'Pleasant & Clear',
    this.humidity = 68,
    this.windSpeed = 12.0,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    List<String> topAttrList = [];
    List<AttractionItem> attrItems = [];

    if (json['attractions'] is List) {
      for (var a in json['attractions']) {
        if (a is Map<String, dynamic>) {
          attrItems.add(AttractionItem.fromJson(a));
          if (a['name'] != null) topAttrList.add(a['name'].toString());
        } else if (a != null) {
          topAttrList.add(a.toString());
        }
      }
    }
    if (topAttrList.isEmpty && json['topAttractions'] is List) {
      topAttrList = (json['topAttractions'] as List).map((e) => e.toString()).toList();
    }

    final double rawEntry = (json['entryFee'] as num?)?.toDouble() ?? 0.0;
    final String entryStr = rawEntry > 0 ? '\$$rawEntry USD' : 'Free Entry';

    return Destination(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? json['region'] ?? 'Sri Lanka',
      province: json['province'] ?? 'Central Province',
      district: json['district'] ?? '',
      category: json['category'] ?? 'Heritage',
      imageUrl: json['imageUrl'] ?? json['coverImage'] ?? 'https://images.unsplash.com/photo-1588598198321-9735fd52455d?auto=format&fit=crop&w=1200&q=80',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      entryFee: rawEntry,
      bestTimeToVisit: json['bestTimeToVisit'] ?? 'December to April',
      recommendedStayDays: json['recommendedStayDays']?.toString() ?? '2 - 3 Days',
      avgBudgetPerDay: json['avgBudgetPerDay'] ?? '\$60 - \$95 / day',
      openingHours: (json['openingTime'] != null && json['closingTime'] != null)
          ? '${json['openingTime']} – ${json['closingTime']}'
          : '06:00 AM – 06:00 PM Daily',
      entryFeeLocal: rawEntry == 0 ? 'Free Entry' : 'LKR 500',
      entryFeeForeign: entryStr,
      topAttractions: topAttrList,
      attractions: attrItems,
      liveTemp: (json['liveTemp'] as num?)?.toDouble() ?? 24.2,
      liveCondition: json['liveCondition'] ?? 'Tropical Sunshine',
      humidity: json['humidity'] ?? 68,
      windSpeed: (json['windSpeed'] as num?)?.toDouble() ?? 14.0,
    );
  }
}

class AttractionItem {
  final String id;
  final String destinationId;
  final String name;
  final String description;
  final String? imageUrl;
  final String? category;
  final double entryFee;
  final double durationHours;
  final double rating;

  AttractionItem({
    required this.id,
    required this.destinationId,
    required this.name,
    required this.description,
    this.imageUrl,
    this.category,
    this.entryFee = 0.0,
    this.durationHours = 2.0,
    this.rating = 4.8,
  });

  factory AttractionItem.fromJson(Map<String, dynamic> json) {
    return AttractionItem(
      id: json['id'] ?? '',
      destinationId: json['destinationId'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'],
      category: json['category'],
      entryFee: (json['entryFee'] as num?)?.toDouble() ?? 0.0,
      durationHours: (json['durationHours'] as num?)?.toDouble() ?? 2.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
    );
  }
}

class TourPackage {
  final String id;
  final String code;
  final String name;
  final String destinations;
  final int durationDays;
  final int durationNights;
  final double price;
  final String currency;
  final String groupSize;
  final String travelStyle;
  final String coverImage;
  final String inclusions;
  final String transportType;
  final double rating;
  final List<dynamic> itineraries;

  TourPackage({
    required this.id,
    this.code = '',
    required this.name,
    required this.destinations,
    required this.durationDays,
    required this.durationNights,
    required this.price,
    this.currency = 'USD',
    required this.groupSize,
    required this.travelStyle,
    required this.coverImage,
    required this.inclusions,
    required this.transportType,
    this.rating = 4.9,
    this.itineraries = const [],
  });

  factory TourPackage.fromJson(Map<String, dynamic> json) {
    final int days = (json['durationDays'] as num?)?.toInt() ?? 5;
    return TourPackage(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? json['title'] ?? 'Scenic Island Tour',
      destinations: json['destinationName'] ?? json['destinations'] ?? 'Colombo, Kandy, Ella, Galle',
      durationDays: days,
      durationNights: days > 1 ? days - 1 : 1,
      price: (json['price'] as num?)?.toDouble() ?? 340.0,
      currency: json['currency'] ?? 'USD',
      groupSize: json['maxGroupSize'] != null ? 'Up to ${json['maxGroupSize']} travelers' : 'Up to 8 travelers',
      travelStyle: json['category'] ?? json['travelStyle'] ?? 'Cultural · Nature · Scenic',
      coverImage: json['coverImage'] ?? json['imageUrl'] ?? 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80',
      inclusions: json['description'] ?? 'Guide, AC Transport, Hotel pickups, Breakfast',
      transportType: json['transportType'] ?? 'Private AC Vehicle & Chauffeur',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.9,
      itineraries: json['itinerary'] is List ? json['itinerary'] : (json['itineraries'] is List ? json['itineraries'] : const []),
    );
  }
}

class UserTrip {
  final String id;
  final String title;
  final String? description;
  final DateTime startDate;
  final DateTime endDate;
  final int numberOfTravelers;
  final double budget;
  final bool transportRequired;
  final String status;
  final double aiScore;
  final List<String> destinationNames;
  final List<dynamic> itineraries;

  UserTrip({
    required this.id,
    required this.title,
    this.description,
    required this.startDate,
    required this.endDate,
    required this.numberOfTravelers,
    required this.budget,
    required this.transportRequired,
    required this.status,
    required this.aiScore,
    this.destinationNames = const [],
    this.itineraries = const [],
  });

  factory UserTrip.fromJson(Map<String, dynamic> json) {
    List<String> destList = [];
    if (json['destinations'] is List) {
      for (var d in json['destinations']) {
        if (d is Map) {
          if (d['destination'] != null && d['destination']['name'] != null) {
            destList.add(d['destination']['name'].toString());
          } else if (d['name'] != null) {
            destList.add(d['name'].toString());
          }
        }
      }
    }

    return UserTrip(
      id: json['id'] ?? '',
      title: json['title'] ?? 'My Sri Lanka Trip',
      description: json['description'],
      startDate: json['startDate'] != null ? DateTime.tryParse(json['startDate']) ?? DateTime.now() : DateTime.now(),
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate']) ?? DateTime.now().add(const Duration(days: 4)) : DateTime.now().add(const Duration(days: 4)),
      numberOfTravelers: (json['numberOfTravelers'] as num?)?.toInt() ?? 1,
      budget: (json['budget'] as num?)?.toDouble() ?? 0.0,
      transportRequired: json['transportRequired'] ?? false,
      status: json['status'] ?? 'PLANNED',
      aiScore: (json['aiScore'] as num?)?.toDouble() ?? 88.0,
      destinationNames: destList,
      itineraries: json['itineraries'] is List ? json['itineraries'] : const [],
    );
  }
}

class BookingItem {
  final String id;
  final String bookingRef;
  final String customerName;
  final String customerEmail;
  final String startDate;
  final int numberOfParticipants;
  final double totalPrice;
  final String status;
  final String paymentStatus;
  final String tourName;

  BookingItem({
    required this.id,
    required this.bookingRef,
    required this.customerName,
    this.customerEmail = '',
    required this.startDate,
    required this.numberOfParticipants,
    required this.totalPrice,
    required this.status,
    required this.paymentStatus,
    this.tourName = 'Scenic Cultural Tour',
  });

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    return BookingItem(
      id: json['id'] ?? '',
      bookingRef: json['bookingRef'] ?? 'TL-BK-1001',
      customerName: json['customerName'] ?? 'Explorer',
      customerEmail: json['customerEmail'] ?? '',
      startDate: json['startDate'] ?? '2026-10-15',
      numberOfParticipants: (json['numberOfParticipants'] as num?)?.toInt() ?? 2,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 450.0,
      status: json['status'] ?? 'CONFIRMED',
      paymentStatus: json['paymentStatus'] ?? 'PAID',
      tourName: json['tour'] != null ? (json['tour']['title'] ?? 'Island Tour') : 'Sri Lanka Tour Package',
    );
  }
}

class ReviewItem {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String? destinationId;
  final String? destinationName;
  final String? tourId;
  final String? tourName;
  final int rating;
  final String comment;
  final DateTime createdAt;

  String get authorName => userName;

  ReviewItem({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    this.destinationId,
    this.destinationName,
    this.tourId,
    this.tourName,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    final dest = json['destination'] as Map<String, dynamic>? ?? {};
    final tour = json['tour'] as Map<String, dynamic>? ?? {};

    return ReviewItem(
      id: json['id'] ?? '',
      userId: json['userId'] ?? user['id'] ?? '',
      userName: user['name'] ?? 'Verified Traveler',
      userAvatar: user['profileImage'],
      destinationId: json['destinationId'],
      destinationName: dest['name'],
      tourId: json['tourId'],
      tourName: tour['title'],
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      comment: json['comment'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) ?? DateTime.now() : DateTime.now(),
    );
  }
}

class TransportPartnerItem {
  final String id;
  final String name;
  final String description;
  final String? logo;
  final String websiteUrl;
  final String? appUrl;
  final double discount;
  final String discountDescription;
  final bool isActive;

  TransportPartnerItem({
    required this.id,
    required this.name,
    required this.description,
    this.logo,
    required this.websiteUrl,
    this.appUrl,
    required this.discount,
    required this.discountDescription,
    this.isActive = true,
  });

  factory TransportPartnerItem.fromJson(Map<String, dynamic> json) {
    return TransportPartnerItem(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Transport Partner',
      description: json['description'] ?? '',
      logo: json['logo'],
      websiteUrl: json['websiteUrl'] ?? 'https://pickme.lk',
      appUrl: json['appUrl'],
      discount: (json['discount'] as num?)?.toDouble() ?? 10.0,
      discountDescription: json['discountDescription'] ?? '10% OFF on all rides',
      isActive: json['isActive'] ?? true,
    );
  }
}

class ChatbotPackageItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final int questionLimit;
  final int durationDays;
  final bool includesPhotoQueries;

  ChatbotPackageItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.questionLimit,
    required this.durationDays,
    this.includesPhotoQueries = true,
  });

  factory ChatbotPackageItem.fromJson(Map<String, dynamic> json) {
    return ChatbotPackageItem(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Traveler Package',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      questionLimit: (json['questionLimit'] as num?)?.toInt() ?? 25,
      durationDays: (json['durationDays'] as num?)?.toInt() ?? 30,
      includesPhotoQueries: json['includesPhotoQueries'] ?? true,
    );
  }
}

class ItineraryDay {
  final int day;
  final String date;
  final String location;
  final String title;
  final String description;
  final double estimatedCost;

  ItineraryDay({
    required this.day,
    required this.date,
    required this.location,
    required this.title,
    required this.description,
    required this.estimatedCost,
  });

  factory ItineraryDay.fromJson(Map<String, dynamic> json) {
    return ItineraryDay(
      day: json['day'] ?? 1,
      date: json['date'] ?? '',
      location: json['location'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      estimatedCost: (json['estimatedCost'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class TripPlanResult {
  final String title;
  final int duration;
  final List<String> destinations;
  final double totalBudget;
  final double aiScore;
  final List<ItineraryDay> days;

  TripPlanResult({
    required this.title,
    required this.duration,
    required this.destinations,
    required this.totalBudget,
    required this.aiScore,
    required this.days,
  });

  factory TripPlanResult.fromJson(Map<String, dynamic> json) {
    final trip = json['trip'] as Map<String, dynamic>? ?? {};
    final budget = json['budget'] as Map<String, dynamic>? ?? {};
    final meta = json['metadata'] as Map<String, dynamic>? ?? {};
    final daysList = (json['days'] as List<dynamic>? ?? [])
        .map((d) => ItineraryDay.fromJson(d as Map<String, dynamic>))
        .toList();

    return TripPlanResult(
      title: trip['title'] ?? 'AI Planned Journey',
      duration: trip['duration'] ?? 1,
      destinations: (trip['destinations'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
      totalBudget: (budget['total'] as num?)?.toDouble() ?? 0.0,
      aiScore: (meta['aiScore'] as num?)?.toDouble() ?? 94.0,
      days: daysList,
    );
  }
}

class ChatMessage {
  final String id;
  final String role; // 'user' | 'assistant'
  final String content;
  final String? imageBase64;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.imageBase64,
    required this.timestamp,
  });
}
