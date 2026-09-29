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
