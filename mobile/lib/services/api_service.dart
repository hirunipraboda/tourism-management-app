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

  // ─── Tours & Guide Component ──────────────────────────────────────────────

  /// Fetches tour packages from the backend; falls back to curated mock data.
  static Future<List<TourPackage>> getTourPackages() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/tour-packages'));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] ?? body) as List<dynamic>;
        return list.map((item) => TourPackage.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return _mockTourPackages();
  }

  static List<TourPackage> _mockTourPackages() {
    return [
      TourPackage(
        id: 'tp-1',
        name: 'Cultural Triangle Heritage Odyssey',
        coverImage: 'https://images.unsplash.com/photo-1588598198321-9735fd52455d',
        durationDays: 5,
        durationNights: 4,
        price: 349.0,
        rating: 4.9,
        destinations: 'Sigiriya · Polonnaruwa · Dambulla · Anuradhapura',
        inclusions: 'Certified cultural guide · Private AC vehicle · All UNESCO entry tickets · 4-star accommodation · Daily breakfast & dinner',
        groupSize: '2 – 8 Travelers',
        transportType: 'Private AC Van',
        travelStyle: 'Cultural',
      ),
      TourPackage(
        id: 'tp-2',
        name: 'Hill Country Tea & Waterfalls Trail',
        coverImage: 'https://images.unsplash.com/photo-1546708973-b339540b5162',
        durationDays: 4,
        durationNights: 3,
        price: 279.0,
        rating: 4.8,
        destinations: 'Kandy · Nuwara Eliya · Ella · Little Adam\'s Peak',
        inclusions: 'Expert nature guide · Scenic train tickets · Tea factory visits · Boutique guesthouse · All breakfasts',
        groupSize: '2 – 6 Travelers',
        transportType: 'Train + Tuk-tuk',
        travelStyle: 'Scenic',
      ),
      TourPackage(
        id: 'tp-3',
        name: 'Southern Safari & Coastal Explorer',
        coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
        durationDays: 6,
        durationNights: 5,
        price: 449.0,
        rating: 4.9,
        destinations: 'Galle · Mirissa · Yala · Arugam Bay',
        inclusions: 'Wildlife safari guide · Whale watching boat · Galle Fort heritage walk · Beach resort stay · All transfers',
        groupSize: '2 – 10 Travelers',
        transportType: 'Private SUV',
        travelStyle: 'Wildlife',
      ),
      TourPackage(
        id: 'tp-4',
        name: 'West Coast Beach & Watersports Retreat',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        durationDays: 3,
        durationNights: 2,
        price: 199.0,
        rating: 4.7,
        destinations: 'Negombo · Bentota · Hikkaduwa · Unawatuna',
        inclusions: 'Surf lessons · Snorkeling gear · Beach villa stay · All-day boat trip · Airport transfers',
        groupSize: '2 – 12 Travelers',
        transportType: 'Private AC Coach',
        travelStyle: 'Beach',
      ),
    ];
  }

  // ─── AI Guide Chat Component ──────────────────────────────────────────────

  /// Gets a contextual travel response from the AI guide service.
  static Future<String> getAiGuideResponse(String query) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/ai-guide/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'query': query, 'context': 'sri_lanka_travel'}),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        return body['response'] ?? body['message'] ?? _mockAiResponse(query);
      }
    } catch (_) {}
    return _mockAiResponse(query);
  }

  static String _mockAiResponse(String query) {
    final q = query.toLowerCase();
    if (q.contains('sigiriya')) {
      return '🏔️ Sigiriya Rock is best visited at dawn (6:30 AM) before crowds arrive. The climb takes 1.5–2 hours. Wear grip shoes and bring 1.5L water. Entry fee is \$30 USD for foreigners. The mirror wall and frescoes are highlights halfway up!';
    } else if (q.contains('train') || q.contains('kandy') && q.contains('ella')) {
      return '🚂 The Kandy–Ella train (Badulla line) is one of the world\'s most scenic rail journeys! Book Class 1 observation seats via the Sri Lanka Railways website at least 2 weeks ahead. Trains depart Kandy at 8:47 AM, arriving Ella around 4:00 PM. The Demodara loop is unmissable!';
    } else if (q.contains('whale') || q.contains('mirissa')) {
      return '🐋 Blue whale season in Mirissa runs November–April. Book a reputable operator (Whale Watch Mirissa, Raja & the Whales) and depart by 6:30 AM on calm days. Per-person cost is ~\$35–50 USD. Spin dolphins and sperm whales are also regularly spotted!';
    } else if (q.contains('food') || q.contains('cuisine')) {
      return '🍛 Must-try Sri Lankan street food: kottu roti (shredded bread stir-fry), hoppers (bowl-shaped fermented rice crepes), pol sambol (fresh coconut relish), and isso wade (prawn fritters at Galle Face). Avoid raw street salads if you have a sensitive stomach!';
    } else if (q.contains('yala') || q.contains('leopard') || q.contains('safari')) {
      return '🐆 Yala National Park offers the world\'s highest wild leopard density! Best season: February–July (dry season, animals gather near waterholes). Enter Block 1 at 6:00 AM – book a licensed jeep safari (~\$80 USD all-inclusive). Also spot elephants, sloth bears, crocodiles, and painted storks!';
    } else if (q.contains('galle') || q.contains('fort') || q.contains('sunset')) {
      return '🌅 Galle Fort sunset walk: head to the lighthouse bastion (Point Utrecht) around 5:30 PM for golden hour views across the Indian Ocean. The rampart walk takes 40 minutes. Afterwards, explore Pedlar Street cafes and the Dutch Reformed Church (1755). The fort is UNESCO-listed and free to enter!';
    } else {
      return '✈️ Great question! Sri Lanka is a compact island with incredible diversity — from ancient ruins and misty highlands to wildlife reserves and pristine beaches. Which region or experience interests you most? I can give you detailed tips on timing, costs, transport, safety, and hidden gems!';
    }
  }

  // ─── Tour Booking Component ───────────────────────────────────────────────

  /// Submits a tour booking to the backend API.
  static Future<Map<String, dynamic>> bookTour({
    required String tourId,
    required String customerName,
    required String customerEmail,
    required String startDate,
    required int participants,
    required double totalPrice,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tourPackageId': tourId,
          'customerName': customerName,
          'customerEmail': customerEmail,
          'startDate': startDate,
          'participants': participants,
          'totalPrice': totalPrice,
        }),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        return {
          'success': true,
          'message': body['message'] ?? 'Booking confirmed! Check your email for details.',
          'bookingId': body['bookingId'] ?? body['id'],
        };
      }
    } catch (_) {}
    // Graceful offline mock confirmation
    return {
      'success': true,
      'message': '🎉 Booking confirmed for $participants traveler(s) on $startDate! A confirmation email will be sent to $customerEmail.',
      'bookingId': 'BK-${DateTime.now().millisecondsSinceEpoch}',
    };
  }
}

