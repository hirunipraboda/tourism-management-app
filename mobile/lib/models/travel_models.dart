class Attraction {
  final String id;
  final String destinationId;
  final String name;
  final String description;
  final String category;
  final String location;
  final String openingHours;
  final double entryFee;
  final int visitDurationMinutes;
  final bool isAccessible;
  final bool isAvailable;
  final double? latitude;
  final double? longitude;
  final String imageUrl;

  Attraction({
    required this.id,
    required this.destinationId,
    required this.name,
    required this.description,
    required this.category,
    required this.location,
    required this.openingHours,
    required this.entryFee,
    required this.visitDurationMinutes,
    required this.isAccessible,
    required this.isAvailable,
    this.latitude,
    this.longitude,
    required this.imageUrl,
  });

  factory Attraction.fromJson(Map<String, dynamic> json) {
    return Attraction(
      id: json['id']?.toString() ?? '',
      destinationId: json['destinationId']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'General',
      location: json['location'] ?? '',
      openingHours: json['openingHours'] ?? '09:00 - 18:00',
      entryFee: (json['entryFee'] as num?)?.toDouble() ?? 0.0,
      visitDurationMinutes: (json['visitDurationMinutes'] as num?)?.toInt() ?? 60,
      isAccessible: json['isAccessible'] ?? true,
      isAvailable: json['isAvailable'] ?? true,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      imageUrl: json['imageUrl'] ?? '',
    );
  }
}

class Destination {
  final String id;
  final String name;
  final String description;
  final String location;
  final String imageUrl;
  final double rating;
  final double entryFee;

  Destination({
    required this.id,
    required this.name,
    required this.description,
    required this.location,
    required this.imageUrl,
    required this.rating,
    required this.entryFee,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    return Destination(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      imageUrl: json['imageUrl'] ?? 'https://images.unsplash.com/photo-1588598198321-9735fd52455d',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      entryFee: (json['entryFee'] as num?)?.toDouble() ?? 0.0,
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

/// Chat message model used by the AI Guide chat screen.
class ChatMessage {
  final String id;
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
  });
}

/// Tour package model used by the Tours & Guide screen.
class TourPackage {
  final String id;
  final String name;
  final String coverImage;
  final int durationDays;
  final int durationNights;
  final double price;
  final double rating;
  final String destinations;
  final String inclusions;
  final String groupSize;
  final String transportType;
  final String travelStyle;

  TourPackage({
    required this.id,
    required this.name,
    required this.coverImage,
    required this.durationDays,
    required this.durationNights,
    required this.price,
    required this.rating,
    required this.destinations,
    required this.inclusions,
    required this.groupSize,
    required this.transportType,
    required this.travelStyle,
  });

  factory TourPackage.fromJson(Map<String, dynamic> json) {
    return TourPackage(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      coverImage: json['coverImage'] ?? json['imageUrl'] ?? '',
      durationDays: (json['durationDays'] as num?)?.toInt() ?? 0,
      durationNights: (json['durationNights'] as num?)?.toInt() ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      destinations: json['destinations'] ?? json['destination'] ?? '',
      inclusions: json['inclusions'] ?? '',
      groupSize: json['groupSize'] ?? '',
      transportType: json['transportType'] ?? 'Private AC Vehicle',
      travelStyle: json['travelStyle'] ?? '',
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
      aiScore: (meta['aiScore'] as num?)?.toDouble() ?? 90.0,
      days: daysList,
    );
  }
}
