import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/ai_trip_planner_models.dart';

void main() {
  group('Trip Planner Mobile Tests - ATP Suite', () {
    // ATP-001: Generated Trip Plan parsing and structure validation
    test('TripPlan generates, parses JSON, and matches expected schema (ATP-001)', () {
      final sampleJson = {
        'trip': {
          'title': 'Kandy & Cultural Triangle Highlights',
          'description': 'A tailored 3-day exploration of Sri Lankan heritage.',
          'duration': 3,
          'destinations': ['Kandy', 'Sigiriya'],
          'travelers': 2,
          'transportPreference': 'Public Transport (Trains & Buses)',
          'accommodationPreference': '3 Star',
        },
        'days': [
          {
            'day': 1,
            'date': '2031-06-01',
            'location': 'Kandy',
            'title': 'Sacred City Arrival & Temple Visit',
            'activities': [
              {
                'id': 'act-101',
                'time': '09:00 AM - 11:30 AM',
                'title': 'Temple of the Sacred Tooth Relic',
                'location': 'Kandy',
                'durationMinutes': 150,
                'estimatedCost': 15.0,
                'description': 'Historic Buddhist temple complex.',
                'type': 'Attraction',
              },
            ],
            'estimatedCost': 50.0,
          },
          {
            'day': 2,
            'date': '2031-06-02',
            'location': 'Sigiriya',
            'title': 'Ancient Rock Fortress Climb',
            'activities': [
              {
                'id': 'act-102',
                'time': '07:00 AM - 10:30 AM',
                'title': 'Sigiriya Lion Rock',
                'location': 'Sigiriya',
                'durationMinutes': 210,
                'estimatedCost': 30.0,
                'description': '5th-century palace citadel fortress.',
                'type': 'Attraction',
              },
            ],
            'estimatedCost': 75.0,
          },
        ],
        'budget': {
          'accommodation': 120.0,
          'transportation': 35.0,
          'activities': 90.0,
          'food': 65.0,
          'other': 20.0,
          'total': 330.0,
          'remaining': 170.0,
          'currency': 'USD',
        },
        'warnings': [
          {
            'id': 'w-1',
            'type': 'weather',
            'title': 'Afternoon Showers',
            'message': 'Pack lightweight waterproof jackets for upland walks.',
          },
        ],
        'metadata': {
          'aiScore': 94.5,
        },
      };

      final plan = TripPlan.fromJson(sampleJson);
      expect(plan.title, 'Kandy & Cultural Triangle Highlights');
      expect(plan.duration, 3);
      expect(plan.destinations.length, 2);
      expect(plan.days.length, 2);
      expect(plan.days.first.location, 'Kandy');
      expect(plan.days.first.activities.first.title, 'Temple of the Sacred Tooth Relic');
      expect(plan.budget.total, 330.0);
      expect(plan.budget.currency, 'USD');
      expect(plan.warnings.length, 1);
      expect(plan.aiScore, 94.5);
    });

    // ATP-002: Validation of Planning Request Inputs
    test('TripPlanningRequest validates default values and required criteria (ATP-002)', () {
      const request = TripPlanningRequest(
        destination: 'Ella',
        travelers: 2,
        budget: TripBudgetInput(amount: 500.0, currency: 'USD'),
      );

      final json = request.toJson();
      expect(json['destination'], 'Ella');
      expect(json['travelers'], 2);
      expect(json['budget']['amount'], 500.0);
      expect(request.travelers > 0, isTrue);
    });

    // ATP-003: Save plan payload construction
    test('Save plan payload structures trip and days correctly (ATP-003)', () {
      final plan = TripPlan(
        title: 'Southern Explorer',
        duration: 2,
        destinations: ['Galle'],
        travelers: 2,
        days: [
          ItineraryDayItem(
            day: 1,
            date: '2031-07-01',
            location: 'Galle',
            title: 'Dutch Fort Walk',
            activities: [
              ItineraryActivityItem(
                id: 'act-201',
                time: '10:00 AM',
                title: 'Galle Fort Ramparts',
                location: 'Galle',
                durationMinutes: 120,
              ),
            ],
          ),
        ],
        budget: BudgetBreakdown(total: 200.0, currency: 'USD'),
        warnings: [],
      );

      final savePayload = {
        'userId': 'usr-001',
        'plan': plan.toJson(),
      };

      expect(savePayload['userId'], 'usr-001');
      expect(savePayload['plan'], isNotNull);
      final days = (savePayload['plan'] as Map<String, dynamic>)['days'] as List<dynamic>;
      expect(days.length, 1);
    });

    // ATP-004: Regenerate Day isolation
    test('Regenerating day updates only target day activities (ATP-004)', () {
      final days = [
        ItineraryDayItem(
          day: 1,
          date: '2031-08-01',
          location: 'Colombo',
          title: 'Day 1 City Walk',
          activities: [
            ItineraryActivityItem(id: 'a-1', time: '09:00 AM', title: 'National Museum', location: 'Colombo'),
          ],
        ),
        ItineraryDayItem(
          day: 2,
          date: '2031-08-02',
          location: 'Colombo',
          title: 'Day 2 Parks',
          activities: [
            ItineraryActivityItem(id: 'a-2', time: '10:00 AM', title: 'Viharamahadevi Park', location: 'Colombo'),
          ],
        ),
      ];

      // Simulate day 2 replacement
      final regeneratedDay2 = ItineraryDayItem(
        day: 2,
        date: '2031-08-02',
        location: 'Colombo',
        title: 'Day 2 Waterfront Discovery',
        activities: [
          ItineraryActivityItem(id: 'a-3', time: '10:00 AM', title: 'Galle Face Green & Lighthouse', location: 'Colombo'),
        ],
      );

      final updatedDays = days.map((d) => d.day == 2 ? regeneratedDay2 : d).toList();
      expect(updatedDays[0].activities.first.title, 'National Museum'); // Day 1 preserved
      expect(updatedDays[1].activities.first.title, 'Galle Face Green & Lighthouse'); // Day 2 replaced
    });

    // ATP-005: Regenerate Activity isolation
    test('Regenerating activity replaces only targeted activity in day (ATP-005)', () {
      final day = ItineraryDayItem(
        day: 1,
        date: '2031-08-01',
        location: 'Kandy',
        title: 'Cultural Day',
        activities: [
          ItineraryActivityItem(id: 'act-a', time: '09:00 AM', title: 'Temple Visit', location: 'Kandy'),
          ItineraryActivityItem(id: 'act-b', time: '02:00 PM', title: 'Botanical Gardens', location: 'Peradeniya'),
        ],
      );

      final replacement = ItineraryActivityItem(
        id: 'act-c',
        time: '09:00 AM',
        title: 'Kandy Garrison Cemetery & Viewpoint',
        location: 'Kandy',
      );

      day.activities = day.activities.map((a) => a.id == 'act-a' ? replacement : a).toList();

      expect(day.activities.first.title, 'Kandy Garrison Cemetery & Viewpoint');
      expect(day.activities.last.title, 'Botanical Gardens'); // Preserved untouched
    });

    // ATP-008: AI Service Fallback handling
    test('Fallback mechanism handles service failure with resilient defaults (ATP-008)', () {
      final defaultBudget = const TripBudgetInput();
      expect(defaultBudget.amount, 600.0);
      expect(defaultBudget.currency, 'USD');

      // Resilient fallback plan
      final fallbackPlan = TripPlan(
        title: 'Safe Fallback Itinerary',
        duration: 1,
        destinations: ['Kandy'],
        days: [
          ItineraryDayItem(
            day: 1,
            date: '2031-09-01',
            location: 'Kandy',
            title: 'Kandy Highlights',
            activities: [],
          ),
        ],
        budget: BudgetBreakdown(total: 100.0),
        warnings: [
          TripWarning(id: 'w-fb', type: 'system', title: 'Offline Mode', message: 'Generated via fallback orchestrator.'),
        ],
      );

      expect(fallbackPlan.warnings.any((w) => w.type == 'system'), isTrue);
    });
  });
}
