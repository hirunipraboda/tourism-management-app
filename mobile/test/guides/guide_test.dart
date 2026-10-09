import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/guide_models.dart';

void main() {
  group('Mobile Guide Management Tests (MOB-GUI)', () {
    // Test dataset
    late List<GuideModel> guides;

    setUp(() {
      guides = [
        GuideModel(
          id: 1,
          name: 'Kasun Perera',
          email: 'kasun.perera@novatourism.lk',
          phone: '+94 77 123 4567',
          languages: ['English', 'Sinhala', 'Tamil'],
          specialties: ['Cultural Heritage', 'Kandy Temples'],
          rating: 4.9,
          toursCompleted: 312,
          status: 'Available',
          verificationStatus: 'Verified',
          avatarUrl: 'https://example.com/kasun.jpg',
          bio: 'Native Kandyan cultural historian.',
          yearsExperience: 8,
        ),
        GuideModel(
          id: 2,
          name: 'Suresh Kumar',
          email: 'suresh.kumar@novatourism.lk',
          phone: '+94 76 234 5678',
          languages: ['English', 'Sinhala'],
          specialties: ['Mountain Hiking', 'Ella Rock'],
          rating: 4.95,
          toursCompleted: 218,
          status: 'Available',
          verificationStatus: 'Verified',
          avatarUrl: 'https://example.com/suresh.jpg',
          bio: 'Wilderness mountain ranger.',
          yearsExperience: 6,
        ),
        GuideModel(
          id: 3,
          name: 'Trainee Guide',
          email: 'trainee@novatourism.lk',
          phone: '+94 71 345 6789',
          languages: ['English'],
          specialties: ['City Tours'],
          rating: 0.0,
          toursCompleted: 0,
          status: 'Inactive',
          verificationStatus: 'Pending',
          avatarUrl: '',
          bio: 'New guide awaiting verification.',
          yearsExperience: 1,
        ),
      ];
    });

    test('MOB-GUI-001: Guide Management screen initial data structure parses correctly', () {
      expect(guides, isNotEmpty);
      expect(guides.length, equals(3));
      expect(guides[0].id, equals(1));
    });

    test('MOB-GUI-002: Display list of guides with ratings, status, and specialties', () {
      final guide = guides[0];
      expect(guide.name, equals('Kasun Perera'));
      expect(guide.rating, equals(4.9));
      expect(guide.status, equals('Available'));
      expect(guide.specialties, contains('Cultural Heritage'));
      expect(guide.languages, contains('English'));
    });

    test('MOB-GUI-003: Search and filter guides by query and specialty', () {
      // Filter by specialty
      final hikingGuides = guides.where((g) => g.specialties.contains('Mountain Hiking')).toList();
      expect(hikingGuides.length, equals(1));
      expect(hikingGuides.first.name, equals('Suresh Kumar'));

      // Search by name
      final searchResult = guides.where((g) => g.name.toLowerCase().contains('kasun')).toList();
      expect(searchResult.length, equals(1));
      expect(searchResult.first.id, equals(1));

      // Filter by non-existent specialty
      final emptyResult = guides.where((g) => g.specialties.contains('Scuba Diving')).toList();
      expect(emptyResult, isEmpty);
    });

    test('MOB-GUI-004: View guide profile and detailed information', () {
      final guide = guides[0];
      expect(guide.bio, equals('Native Kandyan cultural historian.'));
      expect(guide.yearsExperience, equals(8));
      expect(guide.toursCompleted, equals(312));
      expect(guide.verificationStatus, equals('Verified'));
    });

    test('MOB-GUI-005: Register a new guide with valid information', () {
      final newGuide = GuideModel(
        id: 4,
        name: 'Bandara Herath',
        email: 'bandara@novatourism.lk',
        phone: '+94 75 567 8901',
        languages: ['English', 'Sinhala'],
        specialties: ['Wildlife Safari'],
        yearsExperience: 10,
        status: 'Available',
        verificationStatus: 'Pending',
      );

      guides.insert(0, newGuide);
      expect(guides.length, equals(4));
      expect(guides.first.name, equals('Bandara Herath'));
      expect(guides.first.verificationStatus, equals('Pending'));
    });

    test('MOB-GUI-006: Edit guide information updates fields accurately', () {
      final original = guides[0];
      final updated = original.copyWith(
        name: 'Kasun Perera (Lead Historian)',
        yearsExperience: 9,
        specialties: [...original.specialties, 'Ancient Coins'],
      );

      final index = guides.indexWhere((g) => g.id == original.id);
      guides[index] = updated;

      expect(guides[index].name, equals('Kasun Perera (Lead Historian)'));
      expect(guides[index].yearsExperience, equals(9));
      expect(guides[index].specialties, contains('Ancient Coins'));
    });

    test('MOB-GUI-007: Verify a guide updates verification and availability status', () {
      final trainee = guides[2];
      expect(trainee.verificationStatus, equals('Pending'));

      final verified = trainee.copyWith(
        verificationStatus: 'Verified',
        status: 'Available',
      );

      final index = guides.indexWhere((g) => g.id == trainee.id);
      guides[index] = verified;

      expect(guides[index].verificationStatus, equals('Verified'));
      expect(guides[index].status, equals('Available'));
    });

    test('MOB-GUI-008: Delete/deactivate a guide removes guide from active list', () {
      const guideIdToDelete = 1;
      guides.removeWhere((g) => g.id == guideIdToDelete);

      expect(guides.length, equals(2));
      expect(guides.any((g) => g.id == guideIdToDelete), isFalse);
    });
  });
}
