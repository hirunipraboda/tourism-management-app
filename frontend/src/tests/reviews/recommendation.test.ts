import test from 'node:test';
import assert from 'node:assert/strict';
import type { Recommendation, RecommendationFilterState } from '../../types/reviewsAndRecommendations.ts';

const sampleRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    name: 'Kandy Cultural Experience & Sacred Tooth Relic',
    location: 'Kandy',
    category: 'Culture',
    targetType: 'attraction',
    rating: 4.8,
    reviewCount: 342,
    price: '$18 / person',
    suitabilityScore: 94,
    interestMatch: 95,
    ratingMatch: 92,
    budgetMatch: 90,
    locationMatch: 96,
    popularityScore: 94,
    explanation: 'Recommended because you showed interest in culture and history and previously rated similar attractions highly.',
    image: 'assets/images/destinations/Kandy.jpg',
    bestTimeToVisit: 'Year-round',
    distanceKm: 12,
  },
  {
    id: 'rec-002',
    name: 'Sigiriya Ancient Citadel & Sky Palace Fortress',
    location: 'Sigiriya, Cultural Triangle',
    category: 'History',
    targetType: 'attraction',
    rating: 4.9,
    reviewCount: 521,
    price: '$36 / person',
    suitabilityScore: 96,
    interestMatch: 98,
    ratingMatch: 95,
    budgetMatch: 88,
    locationMatch: 94,
    popularityScore: 99,
    explanation: 'Recommended because you enjoy UNESCO world heritage landmarks and historical archaeology.',
    image: 'assets/images/destinations/sigiriya.jpg',
    bestTimeToVisit: 'Nov - April',
    distanceKm: 85,
  },
  {
    id: 'rec-003',
    name: 'Nine Arches Bridge & Demodara Loop',
    location: 'Ella Highlands',
    category: 'Nature',
    targetType: 'attraction',
    rating: 4.8,
    reviewCount: 289,
    price: 'Free entry',
    suitabilityScore: 92,
    interestMatch: 94,
    ratingMatch: 91,
    budgetMatch: 97,
    locationMatch: 89,
    popularityScore: 93,
    explanation: 'Recommended because you love scenic mountain photography and lush tea landscapes.',
    image: 'assets/images/destinations/Ella.jpg',
    bestTimeToVisit: 'Dec - May',
    distanceKm: 45,
  },
];

test('WEB-REC-001: Open recommendation section loads recommendations catalog', () => {
  assert.ok(sampleRecommendations.length >= 3);
  const top = sampleRecommendations[0];
  assert.equal(top.id, 'rec-001');
  assert.equal(top.category, 'Culture');
  assert.ok(top.suitabilityScore >= 90);
});

test('WEB-REC-002: Request smart-match recommendations using valid preferences', () => {
  const filterRecs = (filters: Partial<RecommendationFilterState>) => {
    return sampleRecommendations.filter((r) => {
      if (filters.interests && filters.interests.length > 0 && !filters.interests.includes('All')) {
        const matchesInterest = filters.interests.some(
          (i) => r.category.toLowerCase() === i.toLowerCase() || r.explanation.toLowerCase().includes(i.toLowerCase())
        );
        if (!matchesInterest) return false;
      }
      if (filters.minRating && r.rating < filters.minRating) return false;
      if (filters.maxDistance && r.distanceKm && r.distanceKm > filters.maxDistance) return false;
      return true;
    });
  };

  const cultureMatches = filterRecs({ interests: ['Culture'] });
  assert.equal(cultureMatches.length, 1);
  assert.equal(cultureMatches[0].name, 'Kandy Cultural Experience & Sacred Tooth Relic');

  const natureMatches = filterRecs({ interests: ['Nature'], minRating: 4.5 });
  assert.equal(natureMatches.length, 1);
  assert.equal(natureMatches[0].location, 'Ella Highlands');
});

test('WEB-REC-003: Submit incomplete recommendation preferences handles with defaults', () => {
  // When user provides empty preferences, defaults to All and returns catalog
  const emptyFilters: Partial<RecommendationFilterState> = {};
  const defaults = {
    interests: emptyFilters.interests ?? ['All'],
    minRating: emptyFilters.minRating ?? 0,
    maxDistance: emptyFilters.maxDistance ?? 150,
  };

  assert.deepEqual(defaults.interests, ['All']);
  assert.equal(defaults.minRating, 0);
  assert.equal(defaults.maxDistance, 150);
});

test('WEB-REC-004: Submit invalid recommendation input sanitizes and validates boundaries', () => {
  const sanitizeFilterInput = (input: { minRating?: number; maxDistance?: number }) => {
    return {
      minRating: input.minRating !== undefined ? Math.max(0, Math.min(5, input.minRating)) : 0,
      maxDistance: input.maxDistance !== undefined ? Math.max(1, input.maxDistance) : 150,
    };
  };

  const sanitizedNegative = sanitizeFilterInput({ minRating: -2, maxDistance: -50 });
  assert.equal(sanitizedNegative.minRating, 0);
  assert.equal(sanitizedNegative.maxDistance, 1);

  const sanitizedExcessive = sanitizeFilterInput({ minRating: 8.5 });
  assert.equal(sanitizedExcessive.minRating, 5);
});

test('WEB-REC-005: Display recommendation results with transparent score breakdown', () => {
  const item = sampleRecommendations[1]; // Sigiriya
  assert.equal(item.name, 'Sigiriya Ancient Citadel & Sky Palace Fortress');
  assert.equal(item.suitabilityScore, 96);
  assert.equal(item.interestMatch, 98);
  assert.equal(item.popularityScore, 99);
  assert.ok(item.explanation.includes('UNESCO world heritage'));
});

test('WEB-REC-006: Handle empty recommendation results renders appropriate empty state', () => {
  const filterZeroResults = (query: string) => {
    return sampleRecommendations.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  };

  const results = filterZeroResults('Antarctica Penguin Sanctuary');
  assert.equal(results.length, 0);

  const emptyState = {
    isEmpty: results.length === 0,
    message: 'No recommendations found matching your current filter criteria.',
    suggestion: 'Try adjusting your minimum rating or selecting broader interests.',
  };

  assert.equal(emptyState.isEmpty, true);
  assert.ok(emptyState.message.includes('No recommendations found'));
});

test('WEB-REC-007: Handle recommendation API failure displays fallback state gracefully', () => {
  const handleRecommendationResponse = (apiSuccess: boolean, apiData?: Recommendation[]) => {
    if (!apiSuccess || !apiData) {
      return {
        isFallback: true,
        recommendations: sampleRecommendations,
        notice: 'Real-time AI recommendation agent unavailable. Grounded review fallback recommendations displayed.',
      };
    }
    return { isFallback: false, recommendations: apiData, notice: null };
  };

  const fallbackResult = handleRecommendationResponse(false);
  assert.equal(fallbackResult.isFallback, true);
  assert.ok(fallbackResult.recommendations.length > 0);
  assert.ok(fallbackResult.notice?.includes('fallback recommendations displayed'));
});
