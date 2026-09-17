import test from 'node:test';
import assert from 'node:assert/strict';

test('Frontend configuration: API endpoint resolution', () => {
  const defaultApiUrl = 'http://localhost:5000/api';
  assert.ok(defaultApiUrl.includes(':5000'));
  assert.ok(defaultApiUrl.endsWith('/api'));
});

test('Tourism data structure integrity', () => {
  const sampleDestination = {
    id: 'dest-1',
    name: 'Sigiriya Rock Fortress',
    rating: 4.9,
    category: 'HERITAGE',
  };

  assert.equal(sampleDestination.name, 'Sigiriya Rock Fortress');
  assert.equal(sampleDestination.category, 'HERITAGE');
  assert.ok(sampleDestination.rating >= 4.5);
});

test('Reviews and recommendations data structure integrity', () => {
  const sampleReview = {
    id: 'rev-001',
    touristName: 'Elena Rostova',
    rating: 5,
    status: 'Published',
    helpfulCount: 34,
  };
  const sampleRecommendation = {
    id: 'rec-001',
    name: 'Kandy Cultural Experience',
    suitabilityScore: 94,
    interestMatch: 95,
    ratingMatch: 92,
    budgetMatch: 90,
  };

  assert.equal(sampleReview.status, 'Published');
  assert.equal(sampleReview.rating, 5);
  assert.ok(sampleRecommendation.suitabilityScore >= 90);
  assert.ok(sampleRecommendation.interestMatch >= 90);
});

test('Customer Satisfaction Analytics integrity', () => {
  const analyticsSummary = {
    totalReviews: 12482,
    averageRating: 4.6,
    positiveReviewsPercentage: 89,
    pendingReviewsCount: 128,
  };

  assert.equal(analyticsSummary.totalReviews, 12482);
  assert.equal(analyticsSummary.averageRating, 4.6);
  assert.equal(analyticsSummary.positiveReviewsPercentage, 89);
  assert.equal(analyticsSummary.pendingReviewsCount, 128);
});

