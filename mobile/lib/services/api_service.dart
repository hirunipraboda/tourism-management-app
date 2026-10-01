import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/travel_models.dart';

class ApiService {
  // Configured to point to the ASP.NET Core Web API (use 10.0.2.2 for Android emulator or localhost for Web/Desktop)
  static const String baseUrl = 'http://localhost:5123/api';

  // ─── Destinations & Attractions Component ──────────────────────────────────

  static Future<List<Attraction>> getAttractionsByDestination(String destinationId) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/attractions?destinationId=$destinationId'));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] ?? body) as List<dynamic>;
        return list.map((item) => Attraction.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _mockAttractions(destinationId);
  }

  static Future<List<Attraction>> searchAttractions({
    String? query,
    String? category,
    String? sortBy,
    bool? accessibleOnly,
  }) async {
    try {
      final params = <String, String>{};
      if (query != null && query.isNotEmpty) params['search'] = query;
      if (category != null && category != 'All') params['category'] = category;
      if (sortBy != null) params['sortBy'] = sortBy;
      if (accessibleOnly == true) params['accessible'] = 'true';

      final uri = Uri.parse('$baseUrl/attractions').replace(queryParameters: params);
      final res = await http.get(uri);
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] ?? body) as List<dynamic>;
        return list.map((item) => Attraction.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _mockAttractions(null);
  }

  static List<Attraction> _mockAttractions(String? destinationId) {
    return [
      Attraction(
        id: 'a1', destinationId: destinationId ?? '1',
        name: 'Sigiriya Rock Fortress Summit',
        description: 'Ancient palace ruins atop a massive rock column. Frescoes, gardens and breathtaking panoramic views.',
        category: 'Cultural', location: 'Matale District, Central Province',
        openingHours: '07:00 - 17:30', entryFee: 30.0, visitDurationMinutes: 180,
        isAccessible: false, isAvailable: true,
        latitude: 7.9572, longitude: 80.7601,
        imageUrl: 'https://images.unsplash.com/photo-1588598198321-9735fd52455d',
      ),
      Attraction(
        id: 'a2', destinationId: destinationId ?? '1',
        name: 'Temple of the Sacred Tooth',
        description: 'Sri Lanka\'s most sacred Buddhist temple housing a tooth relic of the Buddha. Stunning Kandyan architecture.',
        category: 'Religious', location: 'Kandy City Centre',
        openingHours: '05:30 - 20:00', entryFee: 15.0, visitDurationMinutes: 90,
        isAccessible: true, isAvailable: true,
        latitude: 7.2936, longitude: 80.6413,
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      ),
      Attraction(
        id: 'a3', destinationId: destinationId ?? '2',
        name: 'Nine Arches Bridge',
        description: 'Iconic colonial-era viaduct surrounded by lush tea plantations. Best viewed with passing trains.',
        category: 'Scenic', location: 'Ella, Badulla District',
        openingHours: 'Open 24 hours', entryFee: 0.0, visitDurationMinutes: 60,
        isAccessible: true, isAvailable: true,
        latitude: 6.8750, longitude: 81.0592,
        imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162',
      ),
      Attraction(
        id: 'a4', destinationId: destinationId ?? '2',
        name: 'Ella Rock Hiking Trail',
        description: 'Challenging but rewarding hike through tea estates and jungle to panoramic summit views.',
        category: 'Adventure', location: 'Ella, Badulla District',
        openingHours: '06:00 - 15:00', entryFee: 5.0, visitDurationMinutes: 240,
        isAccessible: false, isAvailable: true,
        latitude: 6.8600, longitude: 81.0460,
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      ),
      Attraction(
        id: 'a5', destinationId: destinationId ?? '3',
        name: 'Galle Dutch Fort Ramparts',
        description: 'Walk the UNESCO-listed ramparts of the 17th-century Dutch colonial fort with ocean views.',
        category: 'Historical', location: 'Galle, Southern Province',
        openingHours: 'Open 24 hours', entryFee: 0.0, visitDurationMinutes: 120,
        isAccessible: true, isAvailable: true,
        latitude: 6.0300, longitude: 80.2170,
        imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
      ),
      Attraction(
        id: 'a6', destinationId: destinationId ?? '1',
        name: 'Royal Botanical Gardens Peradeniya',
        description: 'Sprawling 147-acre botanical garden with over 4,000 plant species. Giant Java fig tree canopy.',
        category: 'Scenic', location: 'Peradeniya, Kandy',
        openingHours: '08:00 - 17:00', entryFee: 10.0, visitDurationMinutes: 120,
        isAccessible: true, isAvailable: true,
        latitude: 7.2694, longitude: 80.5956,
        imageUrl: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b',
      ),
    ];
  }

  static Future<List<Destination>> getDestinations() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/destinations'));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = body['data'] as List<dynamic>? ?? [];
        return list.map((item) => Destination.fromJson(item)).toList();
      }
    } catch (_) {
      // Fallback offline mock for development
    }

    return [
      Destination(
        id: '1',
        name: 'Sigiriya Ancient Rock Fortress',
        description: 'Spectacular UNESCO world heritage site towering over emerald forests.',
        location: 'Matale District',
        imageUrl: 'https://images.unsplash.com/photo-1588598198321-9735fd52455d',
        rating: 4.9,
        entryFee: 30.0,
      ),
      Destination(
        id: '2',
        name: 'Ella Nine Arches Bridge & Peaks',
        description: 'Misty green tea valleys, waterfalls, and scenic colonial railway viaducts.',
        location: 'Badulla District',
        imageUrl: 'https://images.unsplash.com/photo-1546708973-b339540b5162',
        rating: 4.8,
        entryFee: 0.0,
      ),
      Destination(
        id: '3',
        name: 'Galle Dutch Fortified Citadel',
        description: 'Coastal living museum with cobblestone alleyways and ocean ramparts.',
        location: 'Southern Province',
        imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
        rating: 4.7,
        entryFee: 0.0,
      ),
    ];
  }

  static Future<TripPlanResult> generateAITripPlan({
    required List<String> destinations,
    required String startDate,
    required String endDate,
    required double budget,
    required int travelers,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/plan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'destinations': destinations,
          'startDate': startDate,
          'endDate': endDate,
          'budget': {'amount': budget, 'currency': 'USD'},
          'travelers': travelers,
          'travelStyle': ['culture', 'nature'],
        }),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        return TripPlanResult.fromJson(body['data']);
      }
    } catch (_) {
      // Fallback
    }

    return TripPlanResult(
      title: '5-Day Sri Lanka Explorer Journey',
      duration: 5,
      destinations: destinations.isNotEmpty ? destinations : ['Sigiriya', 'Kandy', 'Ella'],
      totalBudget: budget,
      aiScore: 94.0,
      days: [
        ItineraryDay(
          day: 1,
          date: startDate,
          location: destinations.isNotEmpty ? destinations.first : 'Sigiriya',
          title: 'Arrival & Ancient Citadel Exploration',
          description: 'Explore the royal gardens and climb the citadel at golden hour.',
          estimatedCost: 80.0,
        ),
        ItineraryDay(
          day: 2,
          date: endDate,
          location: 'Kandy',
          title: 'Temple of the Sacred Tooth & Scenic Lake Walk',
          description: 'Immerse in Kandyan cultural traditions and tropical botanical gardens.',
          estimatedCost: 65.0,
        ),
      ],
    );
  }
}
