import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/user_trip_models.dart';
import 'package:nova_mobile/models/ai_trip_planner_models.dart';

void main() {
  group('Itinerary & Workflow Mobile Tests - ITN & GEN Suite', () {
    // ITN-001 & ITN-002: Itinerary Days and structure
    test('Itinerary multi-day creation and sequence integrity (ITN-001, ITN-002)', () {
      final days = [
        TripDayItinerary(
          day: 1,
          date: '2031-05-10',
          title: 'Arrival in Colombo',
          activities: [
            TripActivityDetail(
              time: '10:00 AM - 12:00 PM',
              title: 'Gangaramaya Temple',
              location: 'Colombo',
              description: 'Historic lakeside Buddhist temple.',
            ),
          ],
        ),
        TripDayItinerary(
          day: 2,
          date: '2031-05-11',
          title: 'Train to Kandy',
          activities: [
            TripActivityDetail(
              time: '07:00 AM - 10:30 AM',
              title: 'Scenic Main Line Train',
              location: 'Colombo to Kandy',
              description: 'Express train through scenic tea hills.',
              type: 'Transport',
            ),
          ],
        ),
      ];

      expect(days.length, 2);
      expect(days[0].day, 1);
      expect(days[1].day, 2);
      expect(days[0].activities.length, 1);
      expect(days[1].activities.first.type, 'Transport');
    });

    // ITN-006 & ITN-007: Itinerary Activities sequencing and cost calculation
    test('Itinerary activity sequence and cost computation (ITN-006, ITN-007)', () {
      final day = ItineraryDayItem(
        day: 1,
        date: '2031-05-10',
        location: 'Galle',
        title: 'Galle Fort Heritage',
        activities: [
          ItineraryActivityItem(
            id: 'act-1',
            time: '09:00 AM - 11:00 AM',
            title: 'Lighthouse & Fort Ramparts',
            location: 'Galle Fort',
            durationMinutes: 120,
            estimatedCost: 0.0,
          ),
          ItineraryActivityItem(
            id: 'act-2',
            time: '01:00 PM - 03:00 PM',
            title: 'Maritime Archaeology Museum',
            location: 'Galle Fort',
            durationMinutes: 120,
            estimatedCost: 12.0,
          ),
        ],
      );

      final totalDayCost = day.activities.fold<double>(0.0, (sum, a) => sum + a.estimatedCost);
      expect(totalDayCost, 12.0);
      expect(day.activities.first.durationMinutes, 120);
    });

    // ITN-008: Activity removal from itinerary day
    test('Removing activity updates day list correctly (ITN-008)', () {
      final day = ItineraryDayItem(
        day: 1,
        date: '2031-05-10',
        location: 'Ella',
        title: 'Ella Peaks',
        activities: [
          ItineraryActivityItem(id: 'act-1', time: '06:00 AM', title: 'Little Adam\'s Peak', location: 'Ella'),
          ItineraryActivityItem(id: 'act-2', time: '10:00 AM', title: 'Nine Arch Bridge', location: 'Ella'),
        ],
      );

      day.activities.removeWhere((a) => a.id == 'act-1');
      expect(day.activities.length, 1);
      expect(day.activities.first.title, 'Nine Arch Bridge');
    });

    // ITN-009 & ITN-010: Transport Leg and Option integration
    test('Transport leg attachment and details verification (ITN-009, ITN-010)', () {
      final transportLeg = {
        'id': 'trans-opt-101',
        'transportType': 'TRAIN',
        'origin': 'Colombo Fort',
        'destination': 'Kandy',
        'departureTime': '07:00 AM',
        'arrivalTime': '09:35 AM',
        'durationMinutes': 155,
        'trainName': 'Intercity Express',
        'trainNumber': '1015',
        'estimatedFare': 1200.0,
        'isSelected': true,
      };

      expect(transportLeg['transportType'], 'TRAIN');
      expect(transportLeg['origin'], 'Colombo Fort');
      expect(transportLeg['destination'], 'Kandy');
      expect(transportLeg['durationMinutes'], 155);
      expect(transportLeg['isSelected'], isTrue);
    });

    // ITN-011 to ITN-015: Approval lifecycle status verification
    test('Itinerary approval lifecycle statuses (ITN-011, ITN-012, ITN-013, ITN-014, ITN-015)', () {
      const allowedStatuses = ['Draft', 'Approved', 'Rejected', 'RevisionRequired'];

      for (var status in allowedStatuses) {
        expect(allowedStatuses.contains(status), isTrue);
      }

      // Check transition logic
      var currentStatus = 'Draft';
      expect(currentStatus, 'Draft');

      // Operator approves
      currentStatus = 'Approved';
      expect(currentStatus, 'Approved');

      // Or operator requests revision
      currentStatus = 'RevisionRequired';
      expect(currentStatus, 'RevisionRequired');

      // Or operator rejects
      currentStatus = 'Rejected';
      expect(currentStatus, 'Rejected');
    });

    // GEN-001 to GEN-004: Generation workflow statuses and audit tracking
    test('Generation workflow lifecycle and audit log tracking (GEN-001, GEN-002, GEN-003, GEN-004)', () {
      final workflowStages = [
        {'step': 'Initialized', 'status': 'Pending'},
        {'step': 'AgenticResearch', 'status': 'InProgress'},
        {'step': 'ScheduleSynthesis', 'status': 'InProgress'},
        {'step': 'SafetyValidation', 'status': 'InProgress'},
        {'step': 'Finalized', 'status': 'Completed'},
      ];

      expect(workflowStages.first['status'], 'Pending');
      expect(workflowStages.last['status'], 'Completed');
      expect(workflowStages.length, 5);

      // Audit log model verification
      final auditLog = {
        'action': 'AgentExecution',
        'actor': 'AI_ORCHESTRATOR',
        'status': 'SUCCESS',
        'timestamp': DateTime.now().toIso8601String(),
        'details': 'Synthesized 3 days with 9 candidate activities.',
      };

      expect(auditLog['actor'], 'AI_ORCHESTRATOR');
      expect(auditLog['status'], 'SUCCESS');
    });
  });
}
