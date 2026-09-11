import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/travel_models.dart';

class ApiService {
  // Configured to point to the ASP.NET Core Web API (use 10.0.2.2 for Android emulator or localhost for Web/Desktop)
  static const String baseUrl = 'http://localhost:5000/api';

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
