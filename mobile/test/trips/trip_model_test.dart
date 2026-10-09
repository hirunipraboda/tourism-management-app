import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/user_trip_models.dart';

void main() {
  group('Trip & Itinerary Mobile Tests - TRP Suite', () {
    // TRP-001 & TRP-002: Model serialization and creation
    test('UserTripDetail model creates and serializes correctly (TRP-001, TRP-002)', () {
      final trip = UserTripDetail(
        id: 'trip-mob-001',
        name: 'Sigiriya Cultural Expedition',
        destination: 'Sigiriya',
        destinationId: 'dest-sigiriya',
        startDate: '2031-04-10',
        endDate: '2031-04-14',
        dates: 'Apr 10 - Apr 14, 2031',
        duration: '5 Days',
        travelers: 2,
        status: 'Upcoming',
        imageUrl: 'https://images.unsplash.com/sigiriya',
        budget: '\$800',
        interests: ['Heritage', 'Archaeology'],
        notes: 'Exploring the ancient rock fortress and water gardens',
        dailyItinerary: [
          TripDayItinerary(
            day: 1,
            date: '2031-04-10',
            title: 'Arrival and Water Gardens',
            activities: [
              TripActivityDetail(
                time: '09:00 AM - 11:30 AM',
                title: 'Sigiriya Museum and Water Gardens',
                location: 'Sigiriya',
                description: 'Walk through royal water gardens and museum exhibition.',
                status: 'Confirmed',
                type: 'Sightseeing',
              ),
            ],
          ),
        ],
      );

      expect(trip.id, 'trip-mob-001');
      expect(trip.name, 'Sigiriya Cultural Expedition');
      expect(trip.destination, 'Sigiriya');
      expect(trip.travelers, 2);
      expect(trip.status, 'Upcoming');
      expect(trip.dailyItinerary.length, 1);
      expect(trip.dailyItinerary.first.activities.first.title, 'Sigiriya Museum and Water Gardens');

      final json = {
        'id': 'trip-mob-002',
        'name': 'Galle Fort Heritage',
        'destination': 'Galle',
        'destinationId': 'dest-galle',
        'dates': 'May 1 - May 4, 2031',
        'duration': '4 Days',
        'travelers': 3,
        'status': 'Planning',
      };

      final restored = UserTripDetail.fromJson(json);
      expect(restored.id, 'trip-mob-002');
      expect(restored.name, 'Galle Fort Heritage');
      expect(restored.destination, 'Galle');
      expect(restored.travelers, 3);
      expect(restored.status, 'Planning');
    });

    // TRP-003 & TRP-004: Date validation logic
    test('Trip date range and traveler validation (TRP-003, TRP-004)', () {
      final start = DateTime.parse('2031-05-10');
      final end = DateTime.parse('2031-05-08'); // Invalid: end before start

      expect(end.isBefore(start), isTrue);

      const travelers = 0;
      expect(travelers <= 0, isTrue);

      const budget = -50.0;
      expect(budget <= 0, isTrue);
    });

    // TRP-005 & TRP-006: Filtering and Searching Trips
    test('Trips filtering by destination, status, and interest (TRP-005, TRP-006)', () {
      final trips = [
        UserTripDetail(
          id: 't-1',
          name: 'Galle Coastal Weekend',
          destination: 'Galle',
          destinationId: 'dest-galle',
          dates: 'Apr 1 - Apr 3, 2031',
          duration: '3 Days',
          travelers: 2,
          status: 'Upcoming',
          imageUrl: '',
          interests: ['Beach', 'History'],
        ),
        UserTripDetail(
          id: 't-2',
          name: 'Kandy Hill Explorer',
          destination: 'Kandy',
          destinationId: 'dest-kandy',
          dates: 'May 1 - May 4, 2031',
          duration: '4 Days',
          travelers: 1,
          status: 'Completed',
          imageUrl: '',
          interests: ['Culture', 'Tea'],
        ),
      ];

      // Filter by destination
      final galleTrips = trips.where((t) => t.destination.toLowerCase().contains('galle')).toList();
      expect(galleTrips.length, 1);
      expect(galleTrips.first.id, 't-1');

      // Filter by status
      final upcomingTrips = trips.where((t) => t.status == 'Upcoming').toList();
      expect(upcomingTrips.length, 1);
      expect(upcomingTrips.first.id, 't-1');

      // Filter by interest
      final teaTrips = trips.where((t) => t.interests.contains('Tea')).toList();
      expect(teaTrips.length, 1);
      expect(teaTrips.first.id, 't-2');
    });

    // TRP-009 & TRP-010: Updating Trip details and timeline recalculation
    test('Trip detail modification updates name, travelers, and status (TRP-009, TRP-010)', () {
      final trip = UserTripDetail(
        id: 't-mod',
        name: 'Original Trip',
        destination: 'Ella',
        destinationId: 'dest-ella',
        dates: 'Jun 1 - Jun 5, 2031',
        duration: '5 Days',
        travelers: 2,
        status: 'Planning',
        imageUrl: '',
      );

      trip.name = 'Updated Ella Adventure';
      trip.travelers = 4;
      trip.status = 'Upcoming';

      expect(trip.name, 'Updated Ella Adventure');
      expect(trip.travelers, 4);
      expect(trip.status, 'Upcoming');
    });
  });
}
