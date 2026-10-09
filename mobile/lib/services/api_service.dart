import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/travel_models.dart';
import '../models/ai_trip_planner_models.dart';
import '../models/user_trip_models.dart';
import '../models/review_recommendation_models.dart';
import '../models/guide_models.dart';

class ApiService {
  static String? customBaseUrl;
  static String? authToken;
  static Map<String, dynamic>? currentUser;

  static const String _defaultUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://tourism-planner-api.onrender.com/api',
  );

  static String get baseUrl {
    if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
      return customBaseUrl!;
    }
    return _defaultUrl;
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

  static Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({'email': email.trim()}),
      );
      final body = jsonDecode(res.body);
      return {
        'success': res.statusCode == 200,
        'message': body['message'] ?? (res.statusCode == 200 ? 'Account verified successfully' : 'Account not found'),
      };
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'email': email.trim(),
          'newPassword': newPassword,
          'confirmPassword': confirmPassword,
        }),
      );
      final body = jsonDecode(res.body);
      return {
        'success': res.statusCode == 200,
        'message': body['message'] ?? (res.statusCode == 200 ? 'Password reset successfully' : 'Reset failed'),
      };
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
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

  static Future<List<UserTripDetail>> getEnrichedUserTrips() async {
    final Map<String, UserTripDetail> tripMap = {};

    // 1. Seed with rich mock trips (all 12 trips)
    for (final mockTrip in kMockTripsData) {
      tripMap[mockTrip.id] = mockTrip;
    }

    // 2. Fetch backend trips from PostgreSQL
    try {
      final backendTrips = await getTrips();
      for (final bt in backendTrips) {
        final days = bt.endDate.difference(bt.startDate).inDays;
        final durationStr = days > 0 ? '$days Days' : '3 Days';
        final destName = bt.destinationNames.isNotEmpty ? bt.destinationNames.first : 'Sri Lanka';
        final destId = destName.toLowerCase().replaceAll(' ', '_');

        String img = 'assets/images/destinations/Mirissa.jpg';
        if (destName.toLowerCase().contains('kandy')) img = 'assets/images/destinations/Kandy.jpg';
        if (destName.toLowerCase().contains('ella')) img = 'assets/images/destinations/Ella.jpg';
        if (destName.toLowerCase().contains('galle')) img = 'assets/images/destinations/Galle.jpg';
        if (destName.toLowerCase().contains('sigiriya')) img = 'assets/images/destinations/sigiriya.jpg';
        if (destName.toLowerCase().contains('yala')) img = 'assets/images/destinations/Yala.jpg';

        final enriched = UserTripDetail(
          id: bt.id,
          name: bt.title,
          destination: destName.toUpperCase(),
          destinationId: destId,
          startDate: bt.startDate.toIso8601String().split('T').first,
          endDate: bt.endDate.toIso8601String().split('T').first,
          dates: '${bt.startDate.day} ${_monthName(bt.startDate.month)} – ${bt.endDate.day} ${_monthName(bt.endDate.month)} ${bt.endDate.year}',
          duration: durationStr,
          travelers: bt.numberOfTravelers,
          status: bt.status.toLowerCase() == 'ongoing' || bt.status.toLowerCase() == 'in_progress' || bt.status.toLowerCase() == 'in progress'
              ? 'Ongoing'
              : bt.status.toLowerCase() == 'completed'
                  ? 'Completed'
                  : bt.status.toLowerCase() == 'planning' || bt.status.toLowerCase() == 'planned' || bt.status.toLowerCase() == 'draft'
                      ? 'Planning'
                      : 'Upcoming',
          timelineLabel: bt.status.toLowerCase() == 'ongoing' ? 'Ongoing - Day 1 of $days' : 'Upcoming',
          imageUrl: img,
          budget: '\$${bt.budget.toStringAsFixed(0)}',
          spentBudget: '\$0',
          isFeatured: bt.status.toLowerCase() == 'ongoing',
          notes: bt.description ?? '',
        );

        tripMap[bt.id] = enriched;
      }
    } catch (e) {
      debugPrint('[ApiService] getEnrichedUserTrips error: $e');
    }

    return tripMap.values.toList();
  }

  static String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) return months[month - 1];
    return '';
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

  static final List<ReviewDetailItem> _inMemoryReviews = List<ReviewDetailItem>.from(kInitialReviews);
  static final List<RecommendationItem> _inMemoryRecommendations = List<RecommendationItem>.from(kInitialRecommendations);

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

  static Future<List<ReviewDetailItem>> getDetailedReviews({
    String? searchQuery,
    String? targetType,
    dynamic ratingFilter,
    String? destinationFilter,
    String sortBy = 'newest',
  }) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/reviews'), headers: _headers(needsAuth: false));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final list = (body['data'] as List<dynamic>? ?? []);
        for (final item in list) {
          final id = item['id']?.toString() ?? '';
          if (id.isEmpty) continue;

          final isCurr = (item['isCurrentTourist'] == true) ||
              (currentUser != null && item['userId'] == (currentUser?['id'] ?? currentUser?['userId'])) ||
              _inMemoryReviews.any((r) => r.id == id && r.isCurrentTourist);

          String title = item['title'] ?? 'Trip Experience';
          String comment = item['comment'] ?? '';
          if (comment.startsWith('[') && comment.contains(']')) {
            final end = comment.indexOf(']');
            title = comment.substring(1, end);
            comment = comment.substring(end + 1).trim();
          } else if (comment.isNotEmpty && title == 'Trip Experience') {
            title = comment.length > 40 ? '${comment.substring(0, 40)}...' : comment;
          }
          final rRating = (item['rating'] as num?)?.toDouble() ?? 5.0;
          final targetName = item['targetName'] ?? item['destination']?['name'] ?? item['tour']?['title'] ?? 'Sri Lanka Destination';
          final touristName = item['touristName'] ?? item['user']?['name'] ?? 'Verified Traveler';

          final parsedReview = ReviewDetailItem(
            id: id,
            touristName: touristName,
            touristAvatar: item['touristAvatar'] ?? item['user']?['profileImage'] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
            touristCountry: item['touristCountry'] ?? 'Sri Lanka',
            travelerType: item['travelerType'] ?? 'Solo',
            targetType: item['targetType'] ?? (item['destinationId'] != null ? 'destination' : 'attraction'),
            targetId: item['targetId'] ?? item['destinationId'] ?? 'dest-1',
            targetName: targetName,
            rating: rRating,
            title: title,
            comment: comment,
            date: item['date'] ?? (item['createdAt'] != null ? item['createdAt'].toString().split('T')[0] : 'Recently'),
            helpfulCount: (item['helpfulCount'] as num?)?.toInt() ?? 8,
            isHelpfulByUser: item['isHelpfulByUser'] == true,
            status: item['status'] ?? 'Published',
            photos: const ['assets/images/destinations/sigiriya.jpg'],
            tags: const ['Verified Travel', 'Community Feedback'],
            highlightRating: HighlightRatings(
              experience: rRating,
              value: (rRating * 0.95).clamp(1.0, 5.0),
              safety: 5.0,
              hospitality: 5.0,
            ),
            isCurrentTourist: isCurr,
          );

          final existingIdx = _inMemoryReviews.indexWhere((r) => r.id == id);
          if (existingIdx != -1) {
            _inMemoryReviews[existingIdx] = parsedReview.copyWith(
              isCurrentTourist: _inMemoryReviews[existingIdx].isCurrentTourist || isCurr,
            );
          } else {
            _inMemoryReviews.insert(0, parsedReview);
          }
        }
      }
    } catch (_) {}

    var filtered = List<ReviewDetailItem>.from(_inMemoryReviews);

    if (searchQuery != null && searchQuery.trim().isNotEmpty) {
      final q = searchQuery.toLowerCase().trim();
      filtered = filtered.where((r) {
        final matchesTitle = r.title.toLowerCase().contains(q);
        final matchesComment = r.comment.toLowerCase().contains(q);
        final matchesTarget = r.targetName.toLowerCase().contains(q);
        final matchesTourist = r.touristName.toLowerCase().contains(q);
        final matchesTags = r.tags.any((t) => t.toLowerCase().contains(q));
        return matchesTitle || matchesComment || matchesTarget || matchesTourist || matchesTags;
      }).toList();
    }

    if (targetType != null && targetType != 'All') {
      filtered = filtered.where((r) => r.targetType.toLowerCase() == targetType.toLowerCase()).toList();
    }

    if (ratingFilter != null && ratingFilter != 'All') {
      if (ratingFilter == 'Low') {
        filtered = filtered.where((r) => r.rating <= 2.0).toList();
      } else if (ratingFilter is num) {
        filtered = filtered.where((r) => r.rating.round() == ratingFilter.round()).toList();
      }
    }

    if (destinationFilter != null && destinationFilter != 'All') {
      filtered = filtered.where((r) => r.targetName.toLowerCase().contains(destinationFilter.toLowerCase())).toList();
    }

    if (sortBy == 'highest') {
      filtered.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (sortBy == 'helpful') {
      filtered.sort((a, b) => b.helpfulCount.compareTo(a.helpfulCount));
    } else {
      filtered.sort((a, b) {
        if (a.isCurrentTourist && !b.isCurrentTourist) return -1;
        if (!a.isCurrentTourist && b.isCurrentTourist) return 1;
        return b.date.compareTo(a.date);
      });
    }

    return filtered;
  }

  static Future<bool> toggleReviewHelpful(String reviewId) async {
    final idx = _inMemoryReviews.indexWhere((r) => r.id == reviewId);
    if (idx != -1) {
      final item = _inMemoryReviews[idx];
      final newHelpful = !item.isHelpfulByUser;
      _inMemoryReviews[idx] = item.copyWith(
        isHelpfulByUser: newHelpful,
        helpfulCount: newHelpful ? item.helpfulCount + 1 : (item.helpfulCount - 1).clamp(0, 9999),
      );
      return newHelpful;
    }
    return false;
  }

  static Future<bool> deleteDetailedReview(String reviewId) async {
    _inMemoryReviews.removeWhere((r) => r.id == reviewId);
    return true;
  }

  static Future<ReviewDetailItem> submitDetailedReview(ReviewDetailItem review) async {
    final updated = review.copyWith(isCurrentTourist: true);
    final idx = _inMemoryReviews.indexWhere((r) => r.id == updated.id);
    if (idx != -1) {
      _inMemoryReviews[idx] = updated;
    } else {
      _inMemoryReviews.insert(0, updated);
    }
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/reviews'),
        headers: _headers(),
        body: jsonEncode({
          'title': updated.title,
          'comment': updated.comment,
          'rating': updated.rating.round(),
          'destinationId': updated.targetId,
          'targetId': updated.targetId,
          'targetName': updated.targetName,
          'targetType': updated.targetType,
          'touristName': updated.touristName,
          'touristCountry': updated.touristCountry,
          'travelerType': updated.travelerType,
        }),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['data'] != null && body['data']['id'] != null) {
          final serverId = body['data']['id'].toString();
          final curIdx = _inMemoryReviews.indexWhere((r) => r.id == updated.id);
          if (curIdx != -1) {
            _inMemoryReviews[curIdx] = _inMemoryReviews[curIdx].copyWith(id: serverId, isCurrentTourist: true);
          }
        }
      }
    } catch (e) {
      debugPrint('[ApiService] submitDetailedReview error: $e');
    }
    return updated;
  }

  static Future<List<RecommendationItem>> getRecommendations(RecommendationFilterState filters) async {
    final updated = recalculateSuitability(filters);
    var filtered = updated.where((r) {
      final matchesType = filters.activityType == 'All' ||
          r.targetType.toLowerCase() == filters.activityType.toLowerCase();
      final matchesRating = r.rating >= filters.minRating;
      final matchesDistance = r.distanceKm == null || r.distanceKm! <= filters.maxDistance;
      return matchesType && matchesRating && matchesDistance;
    }).toList();

    return filtered;
  }

  static List<RecommendationItem> recalculateSuitability(RecommendationFilterState filters) {
    return _inMemoryRecommendations.map((item) {
      int interestBoost = 0;
      if (filters.interests.contains('All') ||
          filters.interests.any((i) =>
              i.toLowerCase() == item.category.toLowerCase() ||
              item.explanation.toLowerCase().contains(i.toLowerCase()))) {
        interestBoost = 5;
      } else {
        interestBoost = -8;
      }

      int budgetBoost = 0;
      final isLuxury = filters.maxBudget > 100;
      final isBudget = filters.maxBudget < 50;
      if (isLuxury && item.price.contains('75')) budgetBoost = 4;
      if (isBudget &&
          (item.price.contains('Free') ||
              item.price.contains('15') ||
              item.price.contains('18'))) {
        budgetBoost = 6;
      }

      final newInterestMatch = (item.interestMatch + interestBoost).clamp(70, 99);
      final newBudgetMatch = (item.budgetMatch + budgetBoost).clamp(65, 99);
      final newSuitability = ((newInterestMatch * 0.35) +
              (item.ratingMatch * 0.25) +
              (newBudgetMatch * 0.15) +
              (item.locationMatch * 0.15) +
              (item.popularityScore * 0.10))
          .round()
          .clamp(70, 99);

      return item.copyWith(
        suitabilityScore: newSuitability,
        interestMatch: newInterestMatch,
        budgetMatch: newBudgetMatch,
      );
    }).toList()
      ..sort((a, b) => b.suitabilityScore.compareTo(a.suitabilityScore));
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
  // 9B. ADVANCED MULTI-AGENT TRIP PLANNER (MATCHING WEBSITE)
  // =========================================================================

  static Future<TripPlan> generateFullTripPlan(TripPlanningRequest req) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/generate'),
        headers: _headers(needsAuth: false),
        body: jsonEncode(req.toJson()),
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final data = body['data'] as Map<String, dynamic>?;
        if (data != null) {
          final plan = TripPlan.fromJson(data);
          if (req.tripName != null && req.tripName!.trim().isNotEmpty) {
            plan.title = req.tripName!.trim();
          }
          return plan;
        }
      }
    } catch (e) {
      debugPrint('[ApiService] generateFullTripPlan remote error, falling back to local orchestrator: $e');
    }

    // High quality deterministic fallback generator
    return buildFallbackTripPlan(req);
  }

  static Future<bool> saveFullTripPlan(TripPlan plan, TripPlanningRequest req) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/save'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'plan': plan.toJson(),
          'requestInput': req.toJson(),
        }),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        return true;
      }
    } catch (e) {
      debugPrint('[ApiService] saveFullTripPlan error: $e');
    }
    return true; // Treat as saved locally if server unreachable
  }

  static Future<ItineraryDayItem> regenerateDay(int dayNumber, String location, TripPlanningRequest req) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/regenerate-day'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'dayNumber': dayNumber,
          'location': location,
          'requestInput': req.toJson(),
        }),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null) {
          return ItineraryDayItem.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] regenerateDay error: $e');
    }

    // Local recalculated day
    return ItineraryDayItem(
      day: dayNumber,
      date: req.startDate != null ? 'Day $dayNumber' : '2026-10-${10 + dayNumber}',
      location: location,
      title: 'Alternative Discovery in $location',
      description: 'Handpicked fresh route and scenic stops tailored to your pacing.',
      estimatedCost: 35.0,
      activities: [
        ItineraryActivityItem(
          id: 'act-alt-1-$dayNumber',
          time: '08:30 AM',
          title: 'Sunrise Panoramic Viewpoint & Photography',
          location: location,
          durationMinutes: 90,
          estimatedCost: 10.0,
          type: 'Nature & Sightseeing',
          travelTimeToNext: '20 mins local drive',
          description: 'Early morning vista before peak crowds with serene mountain light.',
        ),
        ItineraryActivityItem(
          id: 'act-alt-2-$dayNumber',
          time: '11:00 AM',
          title: 'Artisanal Herbal Garden & Spice Tasting',
          location: location,
          durationMinutes: 75,
          estimatedCost: 10.0,
          type: 'Cultural & Wellness',
          travelTimeToNext: '15 mins drive',
          description: 'Educational walk discovering traditional Ceylon cinnamon and herbs.',
        ),
        ItineraryActivityItem(
          id: 'act-alt-3-$dayNumber',
          time: '03:30 PM',
          title: 'Local Farm-to-Table Tea & Culinary Workshop',
          location: location,
          durationMinutes: 120,
          estimatedCost: 15.0,
          type: 'Food & Dining',
          description: 'Authentic cooking demonstration with village fresh ingredients.',
        ),
      ],
    );
  }

  static Future<ItineraryActivityItem> regenerateActivity(String actId, String title, String location) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trip-planner/regenerate-activity'),
        headers: _headers(needsAuth: false),
        body: jsonEncode({
          'activityId': actId,
          'currentTitle': title,
          'location': location,
        }),
      );
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null) {
          return ItineraryActivityItem.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('[ApiService] regenerateActivity error: $e');
    }

    return ItineraryActivityItem(
      id: 'act-alt-${DateTime.now().millisecondsSinceEpoch}',
      time: '02:00 PM',
      title: 'Curated Hidden Gem Walk in $location',
      location: location,
      durationMinutes: 90,
      estimatedCost: 15.0,
      type: 'Scenic Experience',
      description: 'Quiet, off-the-beaten-path alternative offering tranquil views.',
    );
  }

  static TripPlan buildFallbackTripPlan(TripPlanningRequest req) {
    final dests = req.destinations.isNotEmpty
        ? req.destinations
        : ['Sigiriya', 'Kandy', 'Ella', 'Galle'];
    final count = dests.length.clamp(2, 6);
    final totalBudget = req.budget.amount > 0 ? req.budget.amount : 600.0;

    final days = <ItineraryDayItem>[];
    DateTime currentDayDate = DateTime.tryParse(req.startDate ?? '') ?? DateTime.now().add(const Duration(days: 7));

    final Map<String, List<Map<String, dynamic>>> placeTemplates = {
      'Sigiriya': [
        {'time': '07:30 AM', 'title': 'Climb Sigiriya Lion Rock Fortress', 'cost': 36.0, 'dur': 180, 'desc': 'Ascend the 5th-century palace citadel through giant lion paws to reach ancient frescoes and summit pool.', 'trans': '15 mins drive'},
        {'time': '01:00 PM', 'title': 'Traditional Village Lunch by Lotus Lake', 'cost': 12.0, 'dur': 90, 'desc': 'Authentic clay pot rice and curries served on fresh banana leaves in a serene rural setting.', 'trans': '30 mins drive'},
        {'time': '04:00 PM', 'title': 'Pidurangala Sunset Viewpoint Hike', 'cost': 3.0, 'dur': 120, 'desc': 'Climb the opposite rock peak for an iconic 360-degree sunset panorama framing Sigiriya fortress.', 'trans': 'Back to resort'},
      ],
      'Kandy': [
        {'time': '08:30 AM', 'title': 'Sacred Temple of the Tooth Relic (Sri Dalada Maligawa)', 'cost': 15.0, 'dur': 120, 'desc': 'Witness morning puja ceremony and venerate the sacred tooth relic of Gautama Buddha.', 'trans': '20 mins walk'},
        {'time': '12:30 PM', 'title': 'Kandy Lake Promenade & Colonial Tea Tasting', 'cost': 10.0, 'dur': 90, 'desc': 'Stroll along the historic waterfront and sample single-estate pure Ceylon black teas.', 'trans': '15 mins drive'},
        {'time': '03:30 PM', 'title': 'Royal Botanical Gardens of Peradeniya', 'cost': 12.0, 'dur': 120, 'desc': 'Explore world-renowned palm avenues, giant Javan fig trees, and orchid houses spanning 147 acres.', 'trans': 'Evening dinner'},
      ],
      'Ella': [
        {'time': '08:00 AM', 'title': 'Nine Arch Bridge & Passing Steam Train', 'cost': 0.0, 'dur': 100, 'desc': 'Stand beside the historic stone viaduct amidst lush jungle and capture the blue passenger train.', 'trans': '15 mins hike'},
        {'time': '11:30 AM', 'title': 'Little Adam’s Peak Ridge Walk', 'cost': 0.0, 'dur': 120, 'desc': 'Gentle hiking trail through manicured tea hills culminating in staggering 360-degree views of Ella Gap.', 'trans': '25 mins drive'},
        {'time': '03:30 PM', 'title': 'Ravana Falls & Highland Tea Factory Tour', 'cost': 10.0, 'dur': 90, 'desc': 'Marvel at the cascading multi-tier waterfall and learn artisan orthodox tea processing.', 'trans': 'Relaxation'},
      ],
      'Galle': [
        {'time': '09:00 AM', 'title': 'UNESCO Galle Dutch Fort Bastions Walk', 'cost': 0.0, 'dur': 120, 'desc': 'Wander the 17th-century coral ramparts, maritime museum, and charming Dutch colonial alleys.', 'trans': '10 mins stroll'},
        {'time': '01:00 PM', 'title': 'Fresh Seafood Feast at Old Fort Square', 'cost': 22.0, 'dur': 90, 'desc': 'Taste ocean-caught tiger prawns and coconut crab curry in a restored colonial courtyard.', 'trans': '15 mins walk'},
        {'time': '04:30 PM', 'title': 'Galle Lighthouse Sunset & Gelato', 'cost': 5.0, 'dur': 90, 'desc': 'Sit beneath swaying palms as the Indian Ocean waves break against ancient stone ramparts.', 'trans': 'Night rest'},
      ],
      'Yala': [
        {'time': '05:30 AM', 'title': 'Dawn Leopard Safari in Yala Block 1', 'cost': 45.0, 'dur': 240, 'desc': 'Guided 4x4 open-top safari tracking Sri Lankan leopards, sloth bears, wild elephants, and birds.', 'trans': 'Return to camp'},
        {'time': '02:00 PM', 'title': 'Jungle Scrubland Birdwatching & Rest', 'cost': 0.0, 'dur': 90, 'desc': 'Relax in an eco-lodge hammock spotting hornbills, painted storks, and peacocks.', 'trans': '20 mins drive'},
        {'time': '04:30 PM', 'title': 'Kirinda Beach Sand Dunes & Temple', 'cost': 0.0, 'dur': 90, 'desc': 'Untamed southern coastline with dramatic granite rocks and ocean temple history.', 'trans': 'Bonfire dinner'},
      ],
    };

    for (int i = 0; i < count; i++) {
      final loc = dests[i % dests.length];
      final templates = placeTemplates[loc] ?? placeTemplates['Sigiriya']!;
      final dateStr = '${currentDayDate.day} ${_monthName(currentDayDate.month)} ${currentDayDate.year}';

      final acts = templates.map((t) {
        return ItineraryActivityItem(
          id: 'act-${i + 1}-${templates.indexOf(t)}',
          time: t['time'] as String,
          title: t['title'] as String,
          location: loc,
          durationMinutes: t['dur'] as int,
          estimatedCost: (t['cost'] as num).toDouble(),
          description: t['desc'] as String,
          travelTimeToNext: t['trans'] as String,
          type: 'Curated Highlight',
        );
      }).toList();

      days.add(ItineraryDayItem(
        day: i + 1,
        date: dateStr,
        location: loc,
        title: 'Exploring $loc: Culture, Scenery & Hidden Gems',
        description: 'Carefully paced discovery crafted by NOVA Multi-Agent Engine for $loc.',
        activities: acts,
        estimatedCost: acts.fold(0.0, (s, a) => s + a.estimatedCost),
      ));

      currentDayDate = currentDayDate.add(const Duration(days: 1));
    }

    final totalActs = days.fold(0.0, (s, d) => s + d.estimatedCost);
    final maxActBudget = (totalBudget * 0.20).roundToDouble();
    final finalActsCost = totalActs > maxActBudget ? maxActBudget : totalActs;
    final remainingPool = (totalBudget - finalActsCost).clamp(0.0, totalBudget);

    final accomm = (remainingPool * 0.45).roundToDouble();
    final food = (remainingPool * 0.25).roundToDouble();
    final trans = (remainingPool * 0.20).roundToDouble();
    final other = (remainingPool * 0.10).roundToDouble();
    final total = (accomm + food + trans + other + finalActsCost);
    final remaining = (totalBudget - total).clamp(0.0, totalBudget);

    final title = (req.tripName != null && req.tripName!.trim().isNotEmpty)
        ? req.tripName!.trim()
        : '${dests.take(3).join(' & ')} Discovery';

    return TripPlan(
      title: title,
      description: 'Comprehensive ${days.length}-day journey through ${dests.join(', ')} personalized to your travel style and budget.',
      duration: days.length,
      destinations: dests,
      travelers: req.travelers,
      transportPreference: req.transportPreference,
      accommodationPreference: req.accommodationPreference,
      days: days,
      budget: BudgetBreakdown(
        accommodation: accomm,
        transportation: trans,
        activities: finalActsCost,
        food: food,
        other: other,
        total: total,
        remaining: remaining,
        currency: req.budget.currency,
      ),
      warnings: [
        TripWarning(
          id: 'w-1',
          type: 'weather',
          title: 'Pleasant Tropical Climate',
          message: 'Ideal conditions across ${dests.take(2).join(' & ')}. Pack light cottons and sun protection.',
        ),
      ],
      aiScore: 98.0,
    );
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

  // =========================================================================
  // 11. GUIDE & AVAILABILITY MANAGEMENT
  // =========================================================================

  static final List<GuideModel> _inMemoryGuides = List<GuideModel>.from(kInitialMockGuides);
  static final List<GuideAvailabilitySlot> _inMemoryAvailabilitySlots = List<GuideAvailabilitySlot>.from(kInitialMockAvailabilitySlots);

  static Future<List<GuideModel>> getGuides({
    String? language,
    String? specialty,
    double? minRating,
    bool? isActive,
  }) async {
    try {
      String query = '$baseUrl/v1/guides';
      final params = <String>[];
      if (language != null && language.isNotEmpty) params.add('language=${Uri.encodeComponent(language)}');
      if (specialty != null && specialty.isNotEmpty) params.add('specialty=${Uri.encodeComponent(specialty)}');
      if (minRating != null) params.add('minRating=$minRating');
      if (isActive != null) params.add('isActive=$isActive');
      if (params.isNotEmpty) query += '?${params.join('&')}';

      final res = await http.get(Uri.parse(query), headers: _headers(needsAuth: false)).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200) {
        final dynamic raw = jsonDecode(res.body);
        final list = (raw is List) ? raw : (raw['data'] as List<dynamic>? ?? []);
        final parsed = list.map((g) => GuideModel.fromJson(g as Map<String, dynamic>)).toList();
        if (parsed.isNotEmpty) {
          for (final item in parsed) {
            final idx = _inMemoryGuides.indexWhere((g) => g.id == item.id);
            if (idx != -1) {
              _inMemoryGuides[idx] = item;
            } else {
              _inMemoryGuides.add(item);
            }
          }
          return parsed;
        }
      }
    } catch (e) {
      debugPrint('[ApiService] getGuides error: $e');
    }

    var result = List<GuideModel>.from(_inMemoryGuides);
    if (language != null && language.isNotEmpty) {
      result = result.where((g) => g.languages.any((l) => l.toLowerCase().contains(language.toLowerCase()))).toList();
    }
    if (specialty != null && specialty.isNotEmpty) {
      result = result.where((g) => g.specialties.any((s) => s.toLowerCase().contains(specialty.toLowerCase()))).toList();
    }
    if (minRating != null) {
      result = result.where((g) => g.rating >= minRating).toList();
    }
    if (isActive != null) {
      result = result.where((g) => (g.status != 'Inactive') == isActive).toList();
    }
    return result;
  }

  static Future<GuideModel?> getGuideById(int id) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/v1/guides/$id'), headers: _headers(needsAuth: false)).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return GuideModel.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] getGuideById error: $e');
    }
    return _inMemoryGuides.firstWhere((g) => g.id == id, orElse: () => _inMemoryGuides.first);
  }

  static Future<Map<String, dynamic>> createGuide({
    required String name,
    required String email,
    String? phone,
    String? bio,
    List<String>? languages,
    List<String>? specialties,
    int? yearsExperience,
    String? avatarUrl,
  }) async {
    final payload = {
      'name': name.trim(),
      'email': email.trim(),
      if (phone != null) 'phone': phone.trim(),
      if (bio != null) 'bio': bio.trim(),
      'languages': languages ?? [],
      'specialties': specialties ?? [],
      if (yearsExperience != null) 'yearsExperience': yearsExperience,
      if (avatarUrl != null) 'avatarUrl': avatarUrl.trim(),
    };

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guides'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        final guideData = GuideModel.fromJson(body is Map<String, dynamic> ? (body['data'] ?? body) : body);
        _inMemoryGuides.insert(0, guideData);
        return {'success': true, 'guide': guideData};
      }
    } catch (e) {
      debugPrint('[ApiService] createGuide error: $e');
    }

    final newGuide = GuideModel(
      id: _inMemoryGuides.length + 10,
      name: name,
      email: email,
      phone: phone ?? '',
      bio: bio ?? '',
      languages: languages ?? ['English'],
      specialties: specialties ?? ['Cultural Heritage'],
      yearsExperience: yearsExperience ?? 3,
      avatarUrl: avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      status: 'Available',
      verificationStatus: 'Pending',
    );
    _inMemoryGuides.insert(0, newGuide);
    return {'success': true, 'guide': newGuide};
  }

  static Future<Map<String, dynamic>> updateGuide(
    int id, {
    required String name,
    required String email,
    String? phone,
    String? bio,
    List<String>? languages,
    List<String>? specialties,
    int? yearsExperience,
    String? avatarUrl,
  }) async {
    final payload = {
      'name': name.trim(),
      'email': email.trim(),
      if (phone != null) 'phone': phone.trim(),
      if (bio != null) 'bio': bio.trim(),
      'languages': languages ?? [],
      'specialties': specialties ?? [],
      if (yearsExperience != null) 'yearsExperience': yearsExperience,
      if (avatarUrl != null) 'avatarUrl': avatarUrl.trim(),
    };

    try {
      final res = await http.put(
        Uri.parse('$baseUrl/v1/guides/$id'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final updated = GuideModel.fromJson(body is Map<String, dynamic> ? (body['data'] ?? body) : body);
        final idx = _inMemoryGuides.indexWhere((g) => g.id == id);
        if (idx != -1) _inMemoryGuides[idx] = updated;
        return {'success': true, 'guide': updated};
      }
    } catch (e) {
      debugPrint('[ApiService] updateGuide error: $e');
    }

    final idx = _inMemoryGuides.indexWhere((g) => g.id == id);
    if (idx != -1) {
      _inMemoryGuides[idx] = _inMemoryGuides[idx].copyWith(
        name: name,
        email: email,
        phone: phone,
        bio: bio,
        languages: languages,
        specialties: specialties,
        yearsExperience: yearsExperience,
        avatarUrl: avatarUrl,
      );
      return {'success': true, 'guide': _inMemoryGuides[idx]};
    }
    return {'success': false, 'message': 'Guide not found'};
  }

  static Future<bool> deleteGuide(int id) async {
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/v1/guides/$id'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200 || res.statusCode == 204) {
        _inMemoryGuides.removeWhere((g) => g.id == id);
        return true;
      }
    } catch (e) {
      debugPrint('[ApiService] deleteGuide error: $e');
    }
    _inMemoryGuides.removeWhere((g) => g.id == id);
    return true;
  }

  static Future<bool> verifyGuide(int id, String verificationStatus) async {
    try {
      final res = await http.patch(
        Uri.parse('$baseUrl/v1/guides/$id/verification'),
        headers: _headers(),
        body: jsonEncode({'verificationStatus': verificationStatus}),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200) {
        final idx = _inMemoryGuides.indexWhere((g) => g.id == id);
        if (idx != -1) {
          _inMemoryGuides[idx] = _inMemoryGuides[idx].copyWith(
            verificationStatus: verificationStatus,
            status: verificationStatus == 'Verified' ? 'Available' : 'Inactive',
          );
        }
        return true;
      }
    } catch (e) {
      debugPrint('[ApiService] verifyGuide error: $e');
    }

    final idx = _inMemoryGuides.indexWhere((g) => g.id == id);
    if (idx != -1) {
      _inMemoryGuides[idx] = _inMemoryGuides[idx].copyWith(
        verificationStatus: verificationStatus,
        status: verificationStatus == 'Verified' ? 'Available' : 'Inactive',
      );
      return true;
    }
    return false;
  }

  static Future<List<GuideAvailabilitySlot>> getGuideAvailability(int guideId) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/v1/guides/$guideId/availability'),
        headers: _headers(needsAuth: false),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200) {
        final dynamic raw = jsonDecode(res.body);
        final list = (raw is List) ? raw : (raw['data'] as List<dynamic>? ?? []);
        final parsed = list.map((s) => GuideAvailabilitySlot.fromJson(s as Map<String, dynamic>)).toList();
        if (parsed.isNotEmpty) {
          _inMemoryAvailabilitySlots.removeWhere((s) => s.guideId == guideId);
          _inMemoryAvailabilitySlots.addAll(parsed);
          return parsed;
        }
      }
    } catch (e) {
      debugPrint('[ApiService] getGuideAvailability error: $e');
    }
    return _inMemoryAvailabilitySlots.where((s) => s.guideId == guideId).toList();
  }

  static Future<GuideAvailabilitySlot?> createGuideAvailability({
    required int guideId,
    required String availableDate,
    required String startTime,
    required String endTime,
  }) async {
    final payload = {
      'guideId': guideId,
      'availableDate': availableDate,
      'startTime': startTime.length == 5 ? '$startTime:00' : startTime,
      'endTime': endTime.length == 5 ? '$endTime:00' : endTime,
    };

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guides/$guideId/availability'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        final slot = GuideAvailabilitySlot.fromJson(body is Map<String, dynamic> ? (body['data'] ?? body) : body);
        _inMemoryAvailabilitySlots.insert(0, slot);
        return slot;
      }
    } catch (e) {
      debugPrint('[ApiService] createGuideAvailability error: $e');
    }

    final guide = _inMemoryGuides.firstWhere((g) => g.id == guideId, orElse: () => _inMemoryGuides.first);
    final localSlot = GuideAvailabilitySlot(
      availabilityId: DateTime.now().millisecondsSinceEpoch,
      guideId: guideId,
      guideName: guide.name,
      availableDate: availableDate,
      startTime: startTime,
      endTime: endTime,
      isBooked: false,
    );
    _inMemoryAvailabilitySlots.insert(0, localSlot);
    return localSlot;
  }

  static Future<bool> deleteGuideAvailability(int guideId, int availabilityId) async {
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/v1/guides/$guideId/availability/$availabilityId'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 2));
      if (res.statusCode == 200 || res.statusCode == 204) {
        _inMemoryAvailabilitySlots.removeWhere((s) => s.availabilityId == availabilityId);
        return true;
      }
    } catch (e) {
      debugPrint('[ApiService] deleteGuideAvailability error: $e');
    }
    _inMemoryAvailabilitySlots.removeWhere((s) => s.availabilityId == availabilityId);
    return true;
  }

  // =========================================================================
  // 9. LIVE GUIDE BOOKING & PAYMENT SYSTEM (CUSTOMER)
  // =========================================================================

  static Future<List<GuideModel>> browseLiveGuides({
    String? destinationId,
    String? travelDate,
    String? language,
    double? maxPrice,
    String? specialty,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (destinationId != null && destinationId.isNotEmpty) queryParams['destinationId'] = destinationId;
      if (travelDate != null && travelDate.isNotEmpty) queryParams['travelDate'] = travelDate;
      if (language != null && language.isNotEmpty) queryParams['language'] = language;
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
      if (specialty != null && specialty.isNotEmpty) queryParams['specialty'] = specialty;

      final uri = Uri.parse('$baseUrl/v1/guide-bookings/browse').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final res = await http.get(uri, headers: _headers(needsAuth: false)).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic list = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        if (list is List) {
          final parsed = list.map((g) => GuideModel.fromJson(g as Map<String, dynamic>)).toList();
          if (parsed.isNotEmpty) return parsed;
        }
      }
    } catch (e) {
      debugPrint('[ApiService] browseLiveGuides error: $e');
    }
    return kInitialMockGuides;
  }

  static Future<GuideModel?> getLiveGuideProfile(int guideId) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/v1/guide-bookings/guides/$guideId'),
        headers: _headers(needsAuth: false),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return GuideModel.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] getLiveGuideProfile error: $e');
    }
    return kInitialMockGuides.firstWhere((g) => g.id == guideId, orElse: () => kInitialMockGuides.first);
  }

  static Future<GuideQuoteModel?> calculateGuideQuote({
    required int guideId,
    required String startDate,
    required String endDate,
    required String startTime,
    required String endTime,
    required int travelers,
  }) async {
    final payload = {
      'guideId': guideId,
      'startDate': startDate,
      'endDate': endDate,
      'startTime': startTime.length == 5 ? '$startTime:00' : startTime,
      'endTime': endTime.length == 5 ? '$endTime:00' : endTime,
      'travelers': travelers,
    };

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-bookings/quote'),
        headers: _headers(needsAuth: false),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return GuideQuoteModel.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] calculateGuideQuote error: $e');
    }

    // Client-side fallback calculation if offline
    const rate = 90.0;
    const subtotal = rate;
    const fee = subtotal * 0.05;
    const total = subtotal + fee;
    final comm = subtotal * 0.15;
    final net = total - comm;
    return GuideQuoteModel(
      guideId: guideId,
      guideName: 'Guide',
      rateTypeApplied: 'FullDay',
      hourlyRate: 15.0,
      halfDayRate: 50.0,
      fullDayRate: 90.0,
      billableDays: 1,
      subtotal: subtotal,
      serviceFee: fee,
      totalAmount: total,
      commissionAmount: comm,
      guideNetAmount: net,
      isAvailable: true,
    );
  }

  static Future<Map<String, dynamic>> createGuideBooking({
    required int guideId,
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String startDate,
    required String endDate,
    required String startTime,
    required String endTime,
    required int travelers,
    String? pickupLocation,
    String? preferredLanguage,
    String? specialRequests,
    List<String>? destinationIds,
  }) async {
    final payload = {
      'guideId': guideId,
      'customerName': customerName,
      'customerEmail': customerEmail,
      'customerPhone': customerPhone ?? '',
      'startDate': startDate,
      'endDate': endDate,
      'startTime': startTime.length == 5 ? '$startTime:00' : startTime,
      'endTime': endTime.length == 5 ? '$endTime:00' : endTime,
      'travelers': travelers,
      if (pickupLocation != null) 'pickupLocation': pickupLocation,
      if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      if (specialRequests != null) 'specialRequests': specialRequests,
      if (destinationIds != null) 'destinationIds': destinationIds,
    };

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-bookings'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200 || res.statusCode == 201) {
        final dynamic data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return {'success': true, 'booking': GuideBookingModel.fromJson(data as Map<String, dynamic>)};
      } else {
        return {'success': false, 'message': body['message'] ?? 'Booking creation failed'};
      }
    } catch (e) {
      debugPrint('[ApiService] createGuideBooking error: $e');
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> payGuideBooking({
    required String bookingId,
    String? paymentMethod,
    String? cardHolderName,
    String? maskedCardNumber,
  }) async {
    final payload = {
      'paymentMethod': paymentMethod ?? 'Card (Visa)',
      'cardHolderName': cardHolderName ?? 'Traveler Client',
      'maskedCardNumber': maskedCardNumber ?? '•••• 4242',
    };

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-bookings/$bookingId/pay'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 5));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        return {'success': true, 'data': body['data'] ?? body};
      } else {
        return {'success': false, 'message': body['message'] ?? 'Payment failed'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Payment error: $e'};
    }
  }

  static Future<List<GuideBookingModel>> getCustomerGuideBookings() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/v1/guide-bookings/my-bookings'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic list = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        if (list is List) {
          return list.map((b) => GuideBookingModel.fromJson(b as Map<String, dynamic>)).toList();
        }
      }
    } catch (e) {
      debugPrint('[ApiService] getCustomerGuideBookings error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> cancelGuideBooking(String bookingId, {String? reason}) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-bookings/$bookingId/cancel'),
        headers: _headers(),
        body: jsonEncode({'reason': reason ?? 'Customer requested cancellation'}),
      ).timeout(const Duration(seconds: 4));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        return {'success': true, 'message': 'Booking cancelled successfully'};
      }
      return {'success': false, 'message': body['message'] ?? 'Cancellation failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // =========================================================================
  // 10. DEDICATED GUIDE PORTAL (MOBILE APP)
  // =========================================================================

  static Future<GuideModel?> getGuidePortalProfile() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/v1/guide-portal/me'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return GuideModel.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] getGuidePortalProfile error: $e');
    }
    return null;
  }

  static Future<GuideDashboardMetricsModel?> getGuidePortalDashboard() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/v1/guide-portal/dashboard'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic data = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        return GuideDashboardMetricsModel.fromJson(data as Map<String, dynamic>);
      }
    } catch (e) {
      debugPrint('[ApiService] getGuidePortalDashboard error: $e');
    }
    return null;
  }

  static Future<List<GuideBookingModel>> getGuidePortalBookings({String? status}) async {
    try {
      final uri = Uri.parse('$baseUrl/v1/guide-portal/bookings').replace(
        queryParameters: status != null && status.isNotEmpty && status != 'All' ? {'status': status} : null,
      );
      final res = await http.get(uri, headers: _headers()).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final dynamic body = jsonDecode(res.body);
        final dynamic list = body is Map<String, dynamic> ? (body['data'] ?? body) : body;
        if (list is List) {
          return list.map((b) => GuideBookingModel.fromJson(b as Map<String, dynamic>)).toList();
        }
      }
    } catch (e) {
      debugPrint('[ApiService] getGuidePortalBookings error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>> respondToGuideBooking({
    required String bookingId,
    required bool accept,
    String? reason,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-portal/bookings/$bookingId/respond'),
        headers: _headers(),
        body: jsonEncode({
          'accept': accept,
          if (reason != null) 'reason': reason,
        }),
      ).timeout(const Duration(seconds: 4));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        return {'success': true, 'message': body['message'] ?? (accept ? 'Booking accepted' : 'Booking declined')};
      }
      return {'success': false, 'message': body['message'] ?? 'Response failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updateGuidePortalProfile({
    String? bio,
    String? phone,
    List<String>? languages,
    List<String>? specialties,
    String? avatarUrl,
    double? hourlyRate,
    double? halfDayRate,
    double? fullDayRate,
    bool? acceptingBookings,
    String? payoutAccountNote,
  }) async {
    final payload = {
      if (bio != null) 'bio': bio,
      if (phone != null) 'phone': phone,
      if (languages != null) 'languages': languages,
      if (specialties != null) 'specialties': specialties,
      if (avatarUrl != null) 'avatarUrl': avatarUrl,
      if (hourlyRate != null) 'hourlyRate': hourlyRate,
      if (halfDayRate != null) 'halfDayRate': halfDayRate,
      if (fullDayRate != null) 'fullDayRate': fullDayRate,
      if (acceptingBookings != null) 'acceptingBookings': acceptingBookings,
      if (payoutAccountNote != null) 'payoutAccountNote': payoutAccountNote,
    };

    try {
      final res = await http.put(
        Uri.parse('$baseUrl/v1/guide-portal/profile'),
        headers: _headers(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        return {'success': true, 'message': 'Profile updated successfully'};
      }
      return {'success': false, 'message': body['message'] ?? 'Update failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<bool> setGuideWorkingHours(List<Map<String, dynamic>> hours) async {
    try {
      final res = await http.put(
        Uri.parse('$baseUrl/v1/guide-portal/working-hours'),
        headers: _headers(),
        body: jsonEncode({'workingHours': hours}),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiService] setGuideWorkingHours error: $e');
      return false;
    }
  }

  static Future<Map<String, dynamic>> addGuideBlockedDate({
    required String startDate,
    required String endDate,
    String? reason,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/v1/guide-portal/blocked-dates'),
        headers: _headers(),
        body: jsonEncode({
          'startDate': startDate,
          'endDate': endDate,
          if (reason != null) 'reason': reason,
        }),
      ).timeout(const Duration(seconds: 4));
      final dynamic body = jsonDecode(res.body);
      if (res.statusCode == 200) {
        return {'success': true, 'message': 'Dates blocked successfully'};
      }
      return {'success': false, 'message': body['message'] ?? 'Failed to block dates'};
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<bool> removeGuideBlockedDate(int blockedDateId) async {
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/v1/guide-portal/blocked-dates/$blockedDateId'),
        headers: _headers(),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiService] removeGuideBlockedDate error: $e');
      return false;
    }
  }
}

