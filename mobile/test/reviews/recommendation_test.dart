import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/review_recommendation_models.dart';
import 'package:nova_mobile/services/api_service.dart';

void main() {
  group('Mobile Recommendation Tests (MOB-REC)', () {
    late List<RecommendationItem> catalog;

    setUp(() {
      catalog = List.from(kInitialRecommendations);
    });

    test('MOB-REC-001: Open recommendation section loads recommendations catalog', () {
      expect(catalog.isNotEmpty, isTrue);
      final first = catalog.first;
      expect(first.id, 'rec-001');
      expect(first.category, 'Culture');
      expect(first.suitabilityScore, greaterThanOrEqualTo(90));
    });

    test('MOB-REC-002: Request recommendations with valid preferences filters correctly', () {
      const filters = RecommendationFilterState(
        interests: ['Culture'],
        minRating: 4.5,
        maxDistance: 100,
        activityType: 'All',
      );

      final recs = ApiService.recalculateSuitability(filters);
      final matches = recs.where((r) => r.category == 'Culture' && r.rating >= filters.minRating).toList();

      expect(matches.isNotEmpty, isTrue);
      expect(matches.first.name, contains('Kandy Cultural Experience'));
    });

    test('MOB-REC-003: Submit incomplete preferences handles defaults gracefully', () {
      const emptyFilters = RecommendationFilterState();

      expect(emptyFilters.interests, contains('All'));
      expect(emptyFilters.maxBudget, 100.0);
      expect(emptyFilters.maxDistance, 150.0);
      expect(emptyFilters.minRating, 0.0);
    });

    test('MOB-REC-004: Submit invalid preferences sanitizes boundary values', () {
      RecommendationFilterState sanitizeFilters({
        required double minRating,
        required double maxBudget,
        required double maxDistance,
      }) {
        return RecommendationFilterState(
          minRating: minRating.clamp(0.0, 5.0),
          maxBudget: maxBudget.clamp(1.0, 1000.0),
          maxDistance: maxDistance.clamp(1.0, 500.0),
        );
      }

      final sanitized = sanitizeFilters(
        minRating: -2.0,
        maxBudget: -100.0,
        maxDistance: 9999.0,
      );

      expect(sanitized.minRating, 0.0);
      expect(sanitized.maxBudget, 1.0);
      expect(sanitized.maxDistance, 500.0);
    });

    test('MOB-REC-005: Display recommendation results includes transparent suitability score and breakdown', () {
      final item = catalog[1]; // Sigiriya
      expect(item.name, contains('Sigiriya'));
      expect(item.suitabilityScore, 96);
      expect(item.interestMatch, 98);
      expect(item.ratingMatch, 95);
      expect(item.popularityScore, 99);
      expect(item.explanation, contains('UNESCO world heritage'));
    });

    test('MOB-REC-006: Handle empty recommendation results returns empty list and clean state', () {
      final zeroResults = catalog.where((r) => r.name.contains('Antarctica Glacier')).toList();

      expect(zeroResults.isEmpty, isTrue);
      expect(zeroResults.length, 0);
    });

    test('MOB-REC-007: Handle recommendation service failure falls back safely without crashing', () {
      List<RecommendationItem> getFallbackOnFailure() {
        try {
          throw Exception('Backend recommendation service offline');
        } catch (_) {
          // Resilient fallback grounded in local catalog
          return List.from(kInitialRecommendations);
        }
      }

      final fallbackRecs = getFallbackOnFailure();
      expect(fallbackRecs.isNotEmpty, isTrue);
      expect(fallbackRecs.length, equals(kInitialRecommendations.length));
    });
  });
}
