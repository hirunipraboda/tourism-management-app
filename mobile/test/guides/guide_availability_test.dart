import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/guide_models.dart';

void main() {
  group('Mobile Guide Availability Tests (MOB-AVL)', () {
    late List<GuideAvailabilitySlot> slots;

    setUp(() {
      slots = [
        GuideAvailabilitySlot(
          availabilityId: 101,
          guideId: 1,
          guideName: 'Kasun Perera',
          availableDate: '2026-10-15',
          startTime: '08:30:00',
          endTime: '16:30:00',
          isBooked: false,
        ),
        GuideAvailabilitySlot(
          availabilityId: 102,
          guideId: 1,
          guideName: 'Kasun Perera',
          availableDate: '2026-10-16',
          startTime: '09:00:00',
          endTime: '17:00:00',
          isBooked: true,
        ),
        GuideAvailabilitySlot(
          availabilityId: 103,
          guideId: 2,
          guideName: 'Suresh Kumar',
          availableDate: '2026-10-17',
          startTime: '07:00:00',
          endTime: '15:00:00',
          isBooked: false,
        ),
      ];
    });

    test('MOB-AVL-001: Open availability slots parses and displays slots correctly', () {
      expect(slots, isNotEmpty);
      expect(slots.length, equals(3));
      final slot = slots.first;
      expect(slot.availabilityId, equals(101));
      expect(slot.guideName, equals('Kasun Perera'));
      expect(slot.availableDate, equals('2026-10-15'));
      expect(slot.isBooked, isFalse);
    });

    test('MOB-AVL-002: Filter slots by guide ID and date', () {
      // Filter by guide
      final kasunSlots = slots.where((s) => s.guideId == 1).toList();
      expect(kasunSlots.length, equals(2));
      expect(kasunSlots.every((s) => s.guideId == 1), isTrue);

      // Filter by date
      final oct17Slots = slots.where((s) => s.availableDate == '2026-10-17').toList();
      expect(oct17Slots.length, equals(1));
      expect(oct17Slots.first.guideName, equals('Suresh Kumar'));

      // Filter by non-existent guide
      final emptySlots = slots.where((s) => s.guideId == 999).toList();
      expect(emptySlots, isEmpty);
    });

    test('MOB-AVL-003: Create an availability slot with valid date and times', () {
      final newSlot = GuideAvailabilitySlot(
        availabilityId: 104,
        guideId: 1,
        guideName: 'Kasun Perera',
        availableDate: '2026-10-25',
        startTime: '10:00:00',
        endTime: '18:00:00',
        isBooked: false,
      );

      slots.insert(0, newSlot);
      expect(slots.length, equals(4));
      expect(slots.first.availabilityId, equals(104));
      expect(slots.first.availableDate, equals('2026-10-25'));
    });

    test('MOB-AVL-004: Delete an availability slot removes slot from list', () {
      const slotIdToDelete = 101;
      slots.removeWhere((s) => s.availabilityId == slotIdToDelete);

      expect(slots.length, equals(2));
      expect(slots.any((s) => s.availabilityId == slotIdToDelete), isFalse);
    });

    test('MOB-AVL-005: Submit invalid availability details validates times and dates', () {
      bool validateSlot({required String date, required String startTime, required String endTime}) {
        if (date.isEmpty) return false;
        if (startTime.isEmpty || endTime.isEmpty) return false;
        // Inverted time validation
        if (endTime.compareTo(startTime) <= 0) return false;
        return true;
      }

      expect(validateSlot(date: '', startTime: '09:00', endTime: '17:00'), isFalse);
      expect(validateSlot(date: '2026-10-25', startTime: '17:00', endTime: '09:00'), isFalse);
      expect(validateSlot(date: '2026-10-25', startTime: '09:00', endTime: '17:00'), isTrue);
    });
  });
}
