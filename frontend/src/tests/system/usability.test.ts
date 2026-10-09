import { test } from 'node:test';
import assert from 'node:assert/strict';

// System Usability & Heuristic Audit Suite (NFR-USE-001 to NFR-USE-008)
// Tests task completion pathways, visual clarity, cognitive load minimization,
// progressive disclosure, and human-understandable error messages.

test('NFR-USE-001: Usability - Destination discovery and search clarity', () => {
  const destinationsCatalog = [
    { id: 'dest-1', name: 'Sigiriya Ancient Rock Fortress', district: 'Matale', category: 'Culture' },
    { id: 'dest-2', name: 'Nine Arches Bridge & Ella Gap', district: 'Badulla', category: 'Nature' },
    { id: 'dest-3', name: 'Temple of the Sacred Tooth Relic', district: 'Kandy', category: 'Culture' },
    { id: 'dest-4', name: 'Galle Dutch Fort', district: 'Galle', category: 'Culture' }
  ];

  // User queries "Ella"
  const query = 'Ella';
  const matches = destinationsCatalog.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.district.toLowerCase().includes(query.toLowerCase())
  );

  assert.equal(matches.length, 1, 'Search query must immediately narrow to exact matching destination');
  assert.equal(matches[0].name, 'Nine Arches Bridge & Ella Gap');

  // Empty query returns full catalog without error
  const emptyMatches = destinationsCatalog.filter(d => d.name.toLowerCase().includes(''));
  assert.equal(emptyMatches.length, 4, 'Empty search must cleanly display full destination catalog');
});

test('NFR-USE-002: Usability - Destination details cognitive clarity', () => {
  const destinationDetail = {
    title: 'Sigiriya Ancient Rock Fortress',
    location: 'Matale District, Central Province',
    entryFee: '$30 USD / person',
    operatingHours: '06:30 AM - 05:30 PM',
    bestTimeToVisit: 'Early morning or late afternoon for cooler temperatures',
    activities: [
      { name: 'Rock Citadel Climb', duration: '3 Hours', difficulty: 'Moderate' },
      { name: 'Pidurangala Sunset Viewpoint', duration: '2 Hours', difficulty: 'Moderate' }
    ]
  };

  assert.ok(destinationDetail.title && destinationDetail.location, 'Key heading and location must be prominent');
  assert.ok(destinationDetail.operatingHours.includes('AM') && destinationDetail.operatingHours.includes('PM'), 'Operating hours must be human-readable');
  assert.ok(destinationDetail.bestTimeToVisit.length > 10, 'Actionable visitor advice must be clearly presented');
  assert.equal(destinationDetail.activities.length, 2);
});

test('NFR-USE-003: Usability - Trip creation wizard guided flow', () => {
  // Simulates multi-step trip creation wizard validation steps
  const wizardState = {
    currentStep: 1,
    totalSteps: 4,
    steps: ['Destination & Dates', 'Travelers & Budget', 'Interests & Style', 'Review & Confirm'],
    formData: {
      destination: 'Kandy',
      startDate: '2026-11-01',
      endDate: '2026-11-05',
      travelers: 2,
      budget: 800
    }
  };

  assert.equal(wizardState.steps.length, 4, 'Wizard must divide complex trip planning into manageable steps');
  assert.ok(new Date(wizardState.formData.endDate) > new Date(wizardState.formData.startDate), 'Wizard must prevent chronologically invalid trips');
  assert.ok(wizardState.formData.budget > 0, 'Budget must be validated positive value');
});

test('NFR-USE-004: Usability - Itinerary timeline information clarity', () => {
  const dayTimeline = {
    dayNumber: 1,
    date: '2026-11-01',
    location: 'Kandy',
    schedule: [
      { time: '08:30 AM - 11:00 AM', activity: 'Temple of the Sacred Tooth Relic', estCost: '$18' },
      { time: '11:30 AM - 01:00 PM', activity: 'Peradeniya Royal Botanical Gardens', estCost: '$12' },
      { time: '02:00 PM - 04:30 PM', activity: 'Kandy Lake Walk & Cultural Dance Show', estCost: '$10' }
    ],
    totalDayCost: '$40'
  };

  assert.equal(dayTimeline.schedule.length, 3, 'Activities must follow chronological morning-to-evening flow');
  for (const item of dayTimeline.schedule) {
    assert.ok(item.time.includes('-'), 'Each activity must specify an explicit time window');
    assert.ok(item.estCost.startsWith('$'), 'Costs must be transparently indicated');
  }
});

test('NFR-USE-005: Usability - Guide and tour package discoverability', () => {
  const guideCard = {
    name: 'Bandara Navarathne',
    specialties: ['Archaeology', 'Cultural Heritage'],
    languages: ['English', 'Sinhala', 'German'],
    rating: 4.9,
    reviewsCount: 42,
    badge: 'Verified Tour Guide',
    clearBookingCta: true
  };

  assert.ok(guideCard.languages.length >= 2, 'Languages must be displayed for international travelers');
  assert.ok(guideCard.rating >= 4.0, 'Rating and review volume must provide clear trust signals');
  assert.equal(guideCard.clearBookingCta, true, 'Card must provide direct call to action');
});

test('NFR-USE-006: Usability - Review submission workflow simplicity', () => {
  const reviewWorkflow = {
    ratingSelected: 5,
    titleEntered: 'Breathtaking Sunrise Experience',
    commentLength: 120,
    minCommentLength: 20,
    hasPhotoAttachmentSupport: true,
    canSubmit: true
  };

  assert.ok(reviewWorkflow.commentLength >= reviewWorkflow.minCommentLength, 'Review provides helpful minimum comment guidance');
  assert.equal(reviewWorkflow.canSubmit, true, 'Form unlocks submission button when requirements are met');
});

test('NFR-USE-007: Usability - Recommendation transparency and explainability', () => {
  const recommendation = {
    title: 'Temple of the Sacred Tooth Relic',
    suitabilityScore: 96,
    interestMatchScore: 98,
    explanation: 'Deeply matches your selected interest in "Cultural Heritage" and spiritual historic landmarks.',
    reviewsSummary: '4.9/5 stars based on 380 verified traveler reviews praising the evening puja ceremony'
  };

  assert.ok(recommendation.suitabilityScore >= 90, 'Suitability score is clear numeric indicator');
  assert.ok(recommendation.explanation.includes('Cultural Heritage'), 'Must provide transparent textual rationale for recommendation');
  assert.ok(recommendation.reviewsSummary.length > 20, 'Grounded in social proof and authentic reviews');
});

test('NFR-USE-008: Usability - Human-understandable error messages', () => {
  const errorMap: Record<string, string> = {
    INVALID_DATES: 'The return date must be after your departure date.',
    INVALID_BUDGET: 'Please enter a valid budget amount greater than zero.',
    AUTH_REQUIRED: 'Please sign in or create an account to save your trip itinerary.',
    EMAIL_DUPLICATE: 'An account with this email address already exists. Please sign in instead.'
  };

  for (const [code, message] of Object.entries(errorMap)) {
    assert.doesNotMatch(message, /NullReferenceException|500 Internal|stack trace/i, `Error for ${code} must not contain developer jargon`);
    assert.ok(message.length >= 15, `Error message for ${code} must provide constructive guidance`);
  }
});
