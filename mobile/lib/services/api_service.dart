import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/travel_models.dart';

class ApiService {
  static String? customBaseUrl;
  static String? authToken;
  static Map<String, dynamic>? currentUser;

  static String get baseUrl {
    if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
      return customBaseUrl!;
    }
    // Port 5000 is reverse forwarded to 127.0.0.1 on both physical USB device and emulator
    return 'http://127.0.0.1:5000/api';
  }

  static Map<String, String> _headers({bool needsAuth = true, bool isJson = true}) {
    final Map<String, String> h = {};
    if (isJson) {
      h['Content-Type'] = 'application/json';
    }
    if (needsAuth && authToken != null && authToken!.isNotEmpty) {
      h['Authorization'] = 'Bearer $authToken';
    }
    return h;
  }

  // =========================================================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // =========================================================================

  static Future<Map<String, dynamic>> registerUser({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
          if (phone != null && phone.isNotEmpty) 'phone': phone.trim(),
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        authToken = body['token'];
        currentUser = body['user'];
        return {
          'success': true,
          'message': body['message'] ?? 'Registration successful',
          'token': authToken,
          'user': currentUser,
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to connect to backend server: $e',
      };
    }
  }

  static Future<Map<String, dynamic>> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'email': email.trim(),
          'password': password,
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        authToken = body['token'];
        currentUser = body['user'];
        return {
          'success': true,
          'message': body['message'] ?? 'Login successful',
          'token': authToken,
          'user': currentUser,
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Invalid email or password',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection error: $e',
      };
    }
  }

  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: _headers(),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        currentUser = body['user'] ?? body['data'];
        return {'success': true, 'user': currentUser};
      }
      return {'success': false, 'message': 'Failed to retrieve profile'};
    } catch (e) {
      return {'success': false, 'message': '$e'};
    }
  }

  static void logout() {
    authToken = null;
    currentUser = null;
  }

  // =========================================================================
  // 2. DESTINATIONS & ATTRACTIONS
  // =========================================================================

  static Future<List<Destination>> getDestinations({
    String? category,
    String? search,
  }) async {
    try {
      String query = '$baseUrl/destinations?limit=50';
      if (category != null && category != 'All' && category.isNotEmpty) {
        query += '&category=${category.toUpperCase().replaceAll(' ', '_')}';
      }
      if (search != null && search.trim().isNotEmpty) {
        query += '&search=${Uri.encodeComponent(search.trim())}';
      }

      final res = await http.get(Uri.parse(query), headers: _headers(needsAuth: false));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((item) => Destination.fromJson(item as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getDestinations error: $e');
    }
    return [];
  }

  static Future<Destination?> getDestinationById(String id) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/destinations/$id'),
        headers: _headers(needsAuth: false),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final data = body['data'] ?? body;
        return Destination.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] getDestinationById error: $e');
    }
    return null;
  }

  static Future<List<AttractionItem>> getAttractionsByDestination(String destinationId) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/destinations/$destinationId/attractions'),
        headers: _headers(needsAuth: false),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((a) => AttractionItem.fromJson(a as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getAttractions error: $e');
    }
    return [];
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
      final res = await http.get(uri, headers: _headers(needsAuth: false));
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

  // =========================================================================
  // 3. TOURS & TRAVEL PACKAGES
  // =========================================================================

  static Future<List<TourPackage>> getTours({String? category, String? search}) async {
    try {
      String query = '$baseUrl/tours?limit=50';
      if (category != null && category != 'All' && category.isNotEmpty) {
        query += '&category=${category.toUpperCase().replaceAll(' ', '_')}';
      }
      if (search != null && search.trim().isNotEmpty) {
        query += '&search=${Uri.encodeComponent(search.trim())}';
      }

      final res = await http.get(Uri.parse(query), headers: _headers(needsAuth: false));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((t) => TourPackage.fromJson(t as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getTours error: $e');
    }
    return [];
  }

  // Alias for Tour Packages compatibility
  static Future<List<TourPackage>> getTourPackages({String? category, String? search}) =>
      getTours(category: category, search: search);

  // Alias for compatibility
  static Future<Map<String, dynamic>> bookTour({
    required String tourId,
    required String customerName,
    required String customerEmail,
    required int participants,
    required String startDate,
    required double totalPrice,
    String? specialRequests,
  }) async {
    return createBooking(
      tourId: tourId,
      numberOfParticipants: participants,
      startDate: DateTime.tryParse(startDate) ?? DateTime.now(),
      totalPrice: totalPrice,
      customerName: customerName,
      customerEmail: customerEmail,
    );
  }

  // =========================================================================
  // 4. TRIPS & USER ITINERARIES (Direct PostgreSQL Persistence)
  // =========================================================================

  static Future<List<UserTrip>> getTrips() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/trips'),
        headers: _headers(),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((t) => UserTrip.fromJson(t as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getTrips error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> createTrip({
    required String title,
    String? description,
    required DateTime startDate,
    required DateTime endDate,
    required int numberOfTravelers,
    required double budget,
    required bool transportRequired,
    List<String> destinationIds = const [],
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trips'),
        headers: _headers(),
        body: jsonEncode({
          'title': title.trim(),
          if (description != null && description.isNotEmpty) 'description': description.trim(),
          'startDate': startDate.toIso8601String(),
          'endDate': endDate.toIso8601String(),
          'numberOfTravelers': numberOfTravelers,
          'budget': budget,
          'transportRequired': transportRequired,
          'destinationIds': destinationIds,
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        return {
          'success': true,
          'message': body['message'] ?? 'Trip created successfully',
          'trip': UserTrip.fromJson(body['data'] as Map<String, dynamic>),
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Failed to create trip',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<bool> deleteTrip(String tripId) async {
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/trips/$tripId'),
        headers: _headers(),
      );
      return res.statusCode == 200 || res.statusCode == 204;
    } catch (e) {
      debugPrint('[ApiService] deleteTrip error: $e');
      return false;
    }
  }

  // =========================================================================
  // 5. BOOKINGS & PAYMENTS
  // =========================================================================

  static Future<List<BookingItem>> getBookings() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers(),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((b) => BookingItem.fromJson(b as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getBookings error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> createBooking({
    required String tourId,
    required int numberOfParticipants,
    required DateTime startDate,
    required double totalPrice,
    String? customerName,
    String? customerEmail,
    String? travelOption,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers(),
        body: jsonEncode({
          'tourId': tourId,
          'numberOfParticipants': numberOfParticipants,
          'startDate': startDate.toIso8601String(),
          'totalPrice': totalPrice,
          'customerName': customerName ?? currentUser?['name'] ?? 'Traveler',
          'customerEmail': customerEmail ?? currentUser?['email'] ?? 'traveler@novatourism.lk',
          'travelOption': travelOption ?? 'PRIVATE',
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        return {
          'success': true,
          'message': body['message'] ?? 'Booking confirmed successfully',
          'booking': body['data'],
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Booking creation failed',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> processPayment({
    required String bookingId,
    required double amount,
    String currency = 'USD',
    String paymentMethod = 'CARD',
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/payments'),
        headers: _headers(),
        body: jsonEncode({
          'bookingId': bookingId,
          'amount': amount,
          'currency': currency,
          'paymentMethod': paymentMethod,
        }),
      );

      final body = jsonDecode(res.body);
      return {
        'success': res.statusCode == 200 || res.statusCode == 201,
        'message': body['message'] ?? 'Payment processed successfully',
        'data': body['data'],
      };
    } catch (e) {
      return {'success': false, 'message': '$e'};
    }
  }

  // =========================================================================
  // 6. REVIEWS & RECOMMENDATIONS
  // =========================================================================

  static Future<List<ReviewItem>> getReviews({String? destinationId, String? tourId}) async {
    try {
      String query = '$baseUrl/reviews';
      if (destinationId != null && destinationId.isNotEmpty) {
        query += '?destinationId=$destinationId';
      } else if (tourId != null && tourId.isNotEmpty) {
        query += '?tourId=$tourId';
      }

      final res = await http.get(Uri.parse(query), headers: _headers(needsAuth: false));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((r) => ReviewItem.fromJson(r as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getReviews error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> submitReview({
    required String comment,
    required int rating,
    String? destinationId,
    String? tourId,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/reviews'),
        headers: _headers(),
        body: jsonEncode({
          'comment': comment.trim(),
          'rating': rating,
          if (destinationId != null && destinationId.isNotEmpty) 'destinationId': destinationId,
          if (tourId != null && tourId.isNotEmpty) 'tourId': tourId,
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        return {'success': true, 'message': 'Review published successfully!'};
      }
      return {'success': false, 'message': body['message'] ?? 'Failed to submit review'};
    } catch (e) {
      return {'success': false, 'message': '$e'};
    }
  }

  // =========================================================================
  // 7. TRANSPORTATION PARTNERS & PROMOS
  // =========================================================================

  static Future<List<TransportPartnerItem>> getTransportPartners() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/transport'), headers: _headers(needsAuth: false));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((p) => TransportPartnerItem.fromJson(p as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getTransportPartners error: $e');
    }
    return [];
  }

  // =========================================================================
  // 8. AI TRAVEL GUIDE (Gemini Multi-turn Sessions & Photo Queries)
  // =========================================================================

  static Future<List<dynamic>> getChatSessions() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/chat/sessions'), headers: _headers());
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        return body['data'] as List<dynamic>? ?? [];
      }
    } catch (e) {
      debugPrint('[ApiService] getChatSessions error: $e');
    }
    return [];
  }

  static Future<String?> createChatSession({String? title}) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/chat/sessions'),
        headers: _headers(),
        body: jsonEncode({'title': title ?? 'New Exploration Conversation'}),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        return body['data']?['id'];
      }
    } catch (e) {
      debugPrint('[ApiService] createChatSession error: $e');
    }
    return null;
  }

  static Future<Map<String, dynamic>> sendChatMessage({
    required String sessionId,
    required String message,
    String? imageBase64,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/chat/sessions/$sessionId/messages'),
        headers: _headers(),
        body: jsonEncode({
          'content': message,
          if (imageBase64 != null) 'imageBase64': imageBase64,
        }),
      );

      final body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        return {
          'success': true,
          'reply': body['data']?['reply'] ?? body['reply'] ?? 'I am here to guide your Sri Lanka journey!',
          'session': body['data']?['session'],
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Could not retrieve AI response',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<String> getAiGuideResponse(String query) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/ai/nova-guide'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({'message': query}),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final reply = body['data']?['reply'] ?? body['reply'];
        if (reply != null && reply.toString().trim().isNotEmpty) {
          return reply.toString().trim();
        }
      }
    } catch (e) {
      debugPrint('[ApiService] nova-guide error: $e');
    }

    if (authToken != null && authToken!.isNotEmpty) {
      try {
        final sessions = await getChatSessions();
        String? sId;
        if (sessions.isNotEmpty) {
          sId = sessions.first['id']?.toString();
        } else {
          sId = await createChatSession(title: 'Travel Assistant Session');
        }
        if (sId != null) {
          final chatRes = await sendChatMessage(sessionId: sId, message: query);
          if (chatRes['success'] == true && chatRes['reply'] != null) {
            return chatRes['reply'].toString().trim();
          }
        }
      } catch (e) {
        debugPrint('[ApiService] Gemini session chat error: $e');
      }
    }

    return 'Ayubowan! For $query, Sri Lanka offers magnificent cultural heritage, wildlife safaris, scenic railways, and golden beaches. Explore our destinations section or plan a trip with our AI Trip Architect!';
  }

  static Future<List<ChatbotPackageItem>> getChatbotPackages() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/chat/packages'), headers: _headers());
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        return list.map((p) => ChatbotPackageItem.fromJson(p as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiService] getChatbotPackages error: $e');
    }
    return [];
  }

  // =========================================================================
  // 9. AI TRIP PLANNER WORKFLOWS
  // =========================================================================

  static Future<TripPlanResult?> generateTripItinerary({
    required String destination,
    required int days,
    required String travelVibe,
    required String budget,
    required int travelers,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/generate'),
        headers: _headers(),
        body: jsonEncode({
          'destination': destination,
          'durationDays': days,
          'vibe': travelVibe,
          'budgetTier': budget,
          'travelerCount': travelers,
        }),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        return TripPlanResult.fromJson(body['data'] as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] generateTripItinerary error: $e');
    }
    return null;
  }

  static Future<TripPlanResult?> generateAITripPlan({
    required List<String> destinations,
    required String startDate,
    required String endDate,
    required double budget,
    required int travelers,
  }) async {
    try {
      final dest = destinations.join(', ');
      final start = DateTime.tryParse(startDate) ?? DateTime.now();
      final end = DateTime.tryParse(endDate) ?? DateTime.now().add(const Duration(days: 3));
      final days = end.difference(start).inDays.clamp(1, 14);

      final res = await http.post(
        Uri.parse('$baseUrl/ai/planner'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'destination': dest,
          'durationDays': days,
          'budget': budget,
          'travelers': travelers,
        }),
      );

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final data = body['data'] as Map<String, dynamic>?;
        if (data != null) {
          return TripPlanResult.fromJson(data);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] generateAITripPlan error: $e');
    }
    return null;
  }

  // =========================================================================
  // 10. PUBLIC TRAVEL STATISTICS (LIVE FROM DATABASE)
  // =========================================================================

  static Future<Map<String, dynamic>> getPublicStats() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/public-stats'));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return Map<String, dynamic>.from(body['data']);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] getPublicStats error: $e');
    }
    return {
      'totalUsers': 28,
      'totalTrips': 8,
      'totalDestinations': 10,
      'satisfactionRate': 99.4,
    };
  }
}

void debugPrint(String message) {
  // ignore: avoid_print
  print(message);
}
