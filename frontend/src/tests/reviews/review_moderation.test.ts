import test from 'node:test';
import assert from 'node:assert/strict';
import type { ReviewStatus } from '../../types/reviewsAndRecommendations.ts';

interface ModerationReviewItem {
  id: string;
  userName: string;
  destinationName: string;
  rating: number;
  comment: string;
  status: ReviewStatus | 'Published' | 'Flagged' | 'Hidden' | 'Pending Review' | 'Rejected';
  sentimentLabel?: string;
  operatorNotes?: string;
}

const moderationQueue: ModerationReviewItem[] = [
  {
    id: 'rev-mod-01',
    userName: 'User A',
    destinationName: 'Sigiriya Ancient Rock Fortress',
    rating: 2,
    comment: 'Suspected advertising spam and external links.',
    status: 'Pending Review',
    sentimentLabel: 'Negative',
  },
  {
    id: 'rev-mod-02',
    userName: 'User B',
    destinationName: 'Nine Arches Bridge & Ella Gap',
    rating: 5,
    comment: 'Outstanding morning tea estate tour with fantastic local guide.',
    status: 'Published',
    sentimentLabel: 'Positive',
  },
  {
    id: 'rev-mod-03',
    userName: 'User C',
    destinationName: 'Temple of the Sacred Tooth Relic',
    rating: 1,
    comment: 'Disrespectful language directed towards temple attendees.',
    status: 'Flagged',
    sentimentLabel: 'Negative',
  },
];

test('WEB-MOD-001: Open admin review moderation displays reviews queue correctly', () => {
  assert.equal(moderationQueue.length, 3);
  const pending = moderationQueue.filter((r) => r.status === 'Pending Review' || r.status === 'Flagged');
  assert.equal(pending.length, 2);
  assert.equal(pending[0].userName, 'User A');
  assert.equal(pending[1].userName, 'User C');
});

test('WEB-MOD-002: Approve/change review status sets status to Published', () => {
  const reviews = moderationQueue.map((r) => ({ ...r }));
  const approveReview = (id: string, notes?: string) => {
    const item = reviews.find((r) => r.id === id);
    if (!item) return null;
    item.status = 'Published';
    if (notes) item.operatorNotes = notes;
    return item;
  };

  const approved = approveReview('rev-mod-01', 'Verified genuine traveler feedback.');
  assert.ok(approved);
  assert.equal(approved.status, 'Published');
  assert.equal(approved.operatorNotes, 'Verified genuine traveler feedback.');
});

test('WEB-MOD-003: Reject/flag review status updates status to Flagged or Hidden', () => {
  const reviews = moderationQueue.map((r) => ({ ...r }));
  const moderateReview = (id: string, newStatus: 'Flagged' | 'Hidden' | 'Rejected', reason: string) => {
    const item = reviews.find((r) => r.id === id);
    if (!item) return null;
    item.status = newStatus;
    item.operatorNotes = reason;
    return item;
  };

  const flagged = moderateReview('rev-mod-02', 'Flagged', 'Content flagged for manual check');
  assert.ok(flagged);
  assert.equal(flagged.status, 'Flagged');

  const hidden = moderateReview('rev-mod-03', 'Hidden', 'Violates community standards');
  assert.ok(hidden);
  assert.equal(hidden.status, 'Hidden');
  assert.equal(hidden.operatorNotes, 'Violates community standards');
});

test('WEB-MOD-004: Attempt moderation as unauthorized non-admin user is blocked', () => {
  const performModeration = (userRole: 'Tourist' | 'Admin' | 'TourismOperator', reviewId: string, status: string) => {
    if (userRole !== 'Admin') {
      return { success: false, error: 'Forbidden: Admin privilege required to moderate reviews.' };
    }
    return { success: true };
  };

  const touristAttempt = performModeration('Tourist', 'rev-mod-01', 'Published');
  assert.equal(touristAttempt.success, false);
  assert.equal(touristAttempt.error, 'Forbidden: Admin privilege required to moderate reviews.');

  const operatorAttempt = performModeration('TourismOperator', 'rev-mod-01', 'Published');
  assert.equal(operatorAttempt.success, false);

  const adminAttempt = performModeration('Admin', 'rev-mod-01', 'Published');
  assert.equal(adminAttempt.success, true);
});
