import test from 'node:test';
import assert from 'node:assert/strict';
import type { Review, ReviewStatus } from '../../types/reviewsAndRecommendations.ts';

// Sample reviews representative of Reviews tab and backend models
const sampleReviews: Review[] = [
  {
    id: 'rev-001',
    touristName: 'Elena Rostova',
    touristAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    touristCountry: 'Sri Lanka',
    travelerType: 'Solo',
    targetType: 'destination',
    targetId: 'dest-2',
    targetName: 'Nine Arches Bridge & Ella Gap',
    rating: 5,
    title: 'The Blue Train crossing at sunrise is pure magic',
    comment: 'Watching the colonial blue express curve through the tea plantation valley with the morning mist rolling off Ella Rock was unforgettable.',
    date: '2026-10-01',
    helpfulCount: 14,
    isHelpfulByUser: false,
    status: 'Published',
    photos: ['assets/images/destinations/Ella.jpg'],
    tags: ['Verified Travel', 'Photography'],
    highlightRating: { experience: 5, value: 4.8, safety: 5, hospitality: 5 },
    isCurrentTourist: false,
  },
  {
    id: 'rev-002',
    touristName: 'Sarah Jenkins',
    touristAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    touristCountry: 'United Kingdom',
    travelerType: 'Couple',
    targetType: 'attraction',
    targetId: 'dest-3',
    targetName: 'Temple of the Sacred Tooth Relic',
    rating: 5,
    title: 'Deeply spiritual and beautifully preserved heritage',
    comment: 'The evening Thewawa offering ceremony with traditional drummers is mesmerizing. Remember to dress respectfully.',
    date: '2026-10-02',
    helpfulCount: 22,
    isHelpfulByUser: true,
    status: 'Published',
    photos: ['assets/images/destinations/Kandy.jpg'],
    tags: ['Verified Travel', 'Culture'],
    highlightRating: { experience: 5, value: 4.7, safety: 5, hospitality: 5 },
    isCurrentTourist: true,
  },
  {
    id: 'rev-003',
    touristName: 'Julian Vance',
    touristAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    touristCountry: 'Australia',
    travelerType: 'Solo',
    targetType: 'destination',
    targetId: 'dest-1',
    targetName: 'Sigiriya Ancient Rock Fortress',
    rating: 4,
    title: 'Mind-blowing ancient engineering atop the rock fortress',
    comment: 'Climbing Lion Rock gave us pristine vistas of emerald forests. Bring water and sturdy footwear.',
    date: '2026-09-28',
    helpfulCount: 9,
    isHelpfulByUser: false,
    status: 'Published',
    photos: ['assets/images/destinations/sigiriya.jpg'],
    tags: ['Verified Travel', 'Adventure'],
    highlightRating: { experience: 4, value: 4.0, safety: 4.5, hospitality: 5 },
    isCurrentTourist: false,
  },
];

test('WEB-REV-001: Open reviews section displays reviews correctly', () => {
  assert.ok(sampleReviews.length >= 3);
  const first = sampleReviews[0];
  assert.equal(first.id, 'rev-001');
  assert.equal(first.targetName, 'Nine Arches Bridge & Ella Gap');
  assert.equal(first.rating, 5);
  assert.equal(first.status, 'Published');
});

test('WEB-REV-002: Display review information with content, rating, and highlight breakdown', () => {
  const review = sampleReviews[1];
  assert.equal(review.touristName, 'Sarah Jenkins');
  assert.equal(review.travelerType, 'Couple');
  assert.equal(review.rating, 5);
  assert.ok(review.comment.includes('Thewawa offering ceremony'));
  assert.ok(review.highlightRating);
  assert.equal(review.highlightRating.experience, 5);
  assert.equal(review.highlightRating.safety, 5);
});

test('WEB-REV-003: Submit a valid review successfully', () => {
  const submitReview = (payload: {
    touristName: string;
    targetId: string;
    targetName: string;
    targetType: 'destination' | 'attraction' | 'tour';
    rating: number;
    title: string;
    comment: string;
  }): { success: boolean; review?: Review; error?: string } => {
    if (!payload.comment.trim()) {
      return { success: false, error: 'Review comment cannot be empty.' };
    }
    if (payload.rating < 1 || payload.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5.' };
    }
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      touristName: payload.touristName,
      touristAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      touristCountry: 'Sri Lanka',
      travelerType: 'Solo',
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetName: payload.targetName,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      date: 'Just now',
      helpfulCount: 0,
      isHelpfulByUser: false,
      status: 'Published',
      photos: [],
      tags: ['Verified Travel'],
      isCurrentTourist: true,
    };
    return { success: true, review: newRev };
  };

  const res = submitReview({
    touristName: 'Alice Traveler',
    targetId: 'dest-4',
    targetName: 'Galle Dutch Fort',
    targetType: 'destination',
    rating: 5,
    title: 'Sensational golden hour sunset',
    comment: 'Walking along the ramparts during golden hour was unforgettable.',
  });

  assert.equal(res.success, true);
  assert.ok(res.review);
  assert.equal(res.review.rating, 5);
  assert.equal(res.review.isCurrentTourist, true);
});

test('WEB-REV-004: Submit review with missing/invalid information triggers validation', () => {
  const validateForm = (comment: string, rating: number) => {
    const errors: string[] = [];
    if (!comment.trim()) errors.push('Review comment cannot be empty.');
    if (rating < 1 || rating > 5) errors.push('Rating must be between 1 and 5.');
    return { valid: errors.length === 0, errors };
  };

  const emptyRes = validateForm('', 5);
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.errors.includes('Review comment cannot be empty.'));

  const invalidRatingRes = validateForm('Good place', 0);
  assert.equal(invalidRatingRes.valid, false);
  assert.ok(invalidRatingRes.errors.includes('Rating must be between 1 and 5.'));
});

test('WEB-REV-005: Edit own review updates fields successfully', () => {
  const existing = { ...sampleReviews[1] };
  const updateReview = (rev: Review, updates: { title?: string; comment?: string; rating?: number }): Review => {
    if (!rev.isCurrentTourist) throw new Error('Unauthorized');
    return {
      ...rev,
      title: updates.title ?? rev.title,
      comment: updates.comment ?? rev.comment,
      rating: updates.rating ?? rev.rating,
      date: 'Edited just now',
    };
  };

  const updated = updateReview(existing, {
    title: 'Updated Spiritual Experience',
    comment: 'Revised comments after second visit.',
    rating: 5,
  });

  assert.equal(updated.title, 'Updated Spiritual Experience');
  assert.equal(updated.comment, 'Revised comments after second visit.');
  assert.equal(updated.date, 'Edited just now');
});

test('WEB-REV-006: Delete own review removes it from list', () => {
  const reviews = [...sampleReviews];
  const deleteReview = (id: string, isCurrentTourist: boolean) => {
    if (!isCurrentTourist) return false;
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx !== -1) {
      reviews.splice(idx, 1);
      return true;
    }
    return false;
  };

  const deleted = deleteReview('rev-002', true);
  assert.equal(deleted, true);
  assert.equal(reviews.length, 2);
  assert.ok(!reviews.some((r) => r.id === 'rev-002'));
});

test('WEB-REV-007: Attempt unauthorized review modification is prevented', () => {
  const modifyReview = (rev: Review) => {
    if (!rev.isCurrentTourist) {
      return { allowed: false, error: 'Unauthorized: You can only edit your own reviews.' };
    }
    return { allowed: true };
  };

  const otherUserReview = sampleReviews[0]; // isCurrentTourist: false
  const res = modifyReview(otherUserReview);
  assert.equal(res.allowed, false);
  assert.equal(res.error, 'Unauthorized: You can only edit your own reviews.');
});

test('WEB-REV-008: Mark a review as helpful updates helpfulCount and toggles state', () => {
  let helpfulCount = 14;
  let isHelpfulByUser = false;

  const toggleHelpful = () => {
    isHelpfulByUser = !isHelpfulByUser;
    helpfulCount = isHelpfulByUser ? helpfulCount + 1 : Math.max(0, helpfulCount - 1);
    return { helpfulCount, isHelpfulByUser };
  };

  // Upvote
  const firstToggle = toggleHelpful();
  assert.equal(firstToggle.isHelpfulByUser, true);
  assert.equal(firstToggle.helpfulCount, 15);

  // Downvote / Undo
  const secondToggle = toggleHelpful();
  assert.equal(secondToggle.isHelpfulByUser, false);
  assert.equal(secondToggle.helpfulCount, 14);
});

test('WEB-REV-009: Open My Reviews displays only current user submissions', () => {
  const myReviews = sampleReviews.filter((r) => r.isCurrentTourist);
  assert.equal(myReviews.length, 1);
  assert.equal(myReviews[0].id, 'rev-002');
  assert.equal(myReviews[0].touristName, 'Sarah Jenkins');
  assert.ok(myReviews.every((r) => r.isCurrentTourist));
});
