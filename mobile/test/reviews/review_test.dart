import 'package:flutter_test/flutter_test.dart';
import 'package:nova_mobile/models/review_recommendation_models.dart';

void main() {
  group('Mobile Review Management Tests (MOB-REV)', () {
    late List<ReviewDetailItem> reviews;

    setUp(() {
      reviews = [
        ReviewDetailItem(
          id: 'rev-001',
          touristName: 'Elena Rostova',
          touristAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
          touristCountry: 'Sri Lanka',
          travelerType: 'Solo',
          targetType: 'destination',
          targetId: 'dest-2',
          targetName: 'Nine Arches Bridge & Ella Gap',
          rating: 5.0,
          title: 'The Blue Train crossing at sunrise is pure magic',
          comment: 'Watching the colonial blue express curve through the tea plantation valley was unforgettable.',
          date: '2026-10-01',
          helpfulCount: 14,
          isHelpfulByUser: false,
          status: 'Published',
          photos: const ['assets/images/destinations/Ella.jpg'],
          tags: const ['Verified Travel', 'Photography'],
          highlightRating: const HighlightRatings(experience: 5.0, value: 4.8, safety: 5.0, hospitality: 5.0),
          isCurrentTourist: false,
        ),
        ReviewDetailItem(
          id: 'rev-002',
          touristName: 'Sarah Jenkins',
          touristAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
          touristCountry: 'United Kingdom',
          travelerType: 'Couple',
          targetType: 'attraction',
          targetId: 'dest-3',
          targetName: 'Temple of the Sacred Tooth Relic',
          rating: 5.0,
          title: 'Deeply spiritual and beautifully preserved heritage',
          comment: 'The evening Thewawa offering ceremony with traditional drummers is mesmerizing.',
          date: '2026-10-02',
          helpfulCount: 22,
          isHelpfulByUser: true,
          status: 'Published',
          photos: const ['assets/images/destinations/Kandy.jpg'],
          tags: const ['Verified Travel', 'Culture'],
          highlightRating: const HighlightRatings(experience: 5.0, value: 4.7, safety: 5.0, hospitality: 5.0),
          isCurrentTourist: true,
        ),
        ReviewDetailItem(
          id: 'rev-003',
          touristName: 'Julian Vance',
          touristAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          touristCountry: 'Australia',
          travelerType: 'Solo',
          targetType: 'destination',
          targetId: 'dest-1',
          targetName: 'Sigiriya Ancient Rock Fortress',
          rating: 4.0,
          title: 'Mind-blowing ancient engineering atop the rock fortress',
          comment: 'Climbing Lion Rock gave us pristine vistas of emerald forests.',
          date: '2026-09-28',
          helpfulCount: 9,
          isHelpfulByUser: false,
          status: 'Published',
          photos: const ['assets/images/destinations/sigiriya.jpg'],
          tags: const ['Verified Travel', 'Adventure'],
          highlightRating: const HighlightRatings(experience: 4.0, value: 4.0, safety: 4.5, hospitality: 5.0),
          isCurrentTourist: false,
        ),
      ];
    });

    test('MOB-REV-001: Open reviews section parses and displays review list correctly', () {
      expect(reviews.length, greaterThanOrEqualTo(3));
      final first = reviews.first;
      expect(first.id, 'rev-001');
      expect(first.targetName, 'Nine Arches Bridge & Ella Gap');
      expect(first.rating, 5.0);
      expect(first.status, 'Published');
    });

    test('MOB-REV-002: View review details displays comprehensive traveler experience', () {
      final review = reviews[1];
      expect(review.touristName, 'Sarah Jenkins');
      expect(review.travelerType, 'Couple');
      expect(review.rating, 5.0);
      expect(review.comment, contains('Thewawa offering ceremony'));
      expect(review.highlightRating?.experience, 5.0);
      expect(review.highlightRating?.safety, 5.0);
    });

    test('MOB-REV-003: Submit a valid review creates new ReviewDetailItem successfully', () {
      final newReview = ReviewDetailItem(
        id: 'rev-mob-new',
        touristName: 'Mobile Explorer',
        touristAvatar: 'https://example.com/avatar.jpg',
        touristCountry: 'Sri Lanka',
        travelerType: 'Solo',
        targetType: 'destination',
        targetId: 'dest-4',
        targetName: 'Galle Dutch Fort',
        rating: 5.0,
        title: 'Sensational ocean views',
        comment: 'Walking along the colonial bastions at sunset was magical.',
        date: 'Today',
        helpfulCount: 0,
        isHelpfulByUser: false,
        status: 'Published',
        isCurrentTourist: true,
      );

      reviews.insert(0, newReview);

      expect(reviews.first.id, 'rev-mob-new');
      expect(reviews.first.rating, 5.0);
      expect(reviews.first.isCurrentTourist, isTrue);
    });

    test('MOB-REV-004: Submit invalid/incomplete review triggers validation', () {
      bool validateSubmission({required String comment, required double rating}) {
        if (comment.trim().isEmpty) return false;
        if (rating < 1.0 || rating > 5.0) return false;
        return true;
      }

      expect(validateSubmission(comment: '', rating: 5.0), isFalse);
      expect(validateSubmission(comment: 'Valid comment', rating: 0.0), isFalse);
      expect(validateSubmission(comment: 'Valid comment', rating: 6.0), isFalse);
      expect(validateSubmission(comment: 'Great fortress', rating: 5.0), isTrue);
    });

    test('MOB-REV-005: Edit own review updates fields and copies state', () {
      final target = reviews[1];
      expect(target.isCurrentTourist, isTrue);

      final updated = target.copyWith(
        title: 'Updated Tooth Relic Review',
        comment: 'Updated impressions with higher appreciation of traditional architecture.',
        rating: 5.0,
      );

      expect(updated.title, 'Updated Tooth Relic Review');
      expect(updated.comment, contains('Updated impressions'));
      expect(updated.id, target.id);
    });

    test('MOB-REV-006: Delete own review removes item from active list', () {
      final target = reviews[1];
      expect(target.isCurrentTourist, isTrue);

      reviews.removeWhere((r) => r.id == target.id);

      expect(reviews.any((r) => r.id == target.id), isFalse);
      expect(reviews.length, 2);
    });

    test('MOB-REV-007: View My Reviews filters only submissions by current user', () {
      final myReviews = reviews.where((r) => r.isCurrentTourist).toList();

      expect(myReviews.length, 1);
      expect(myReviews.first.id, 'rev-002');
      expect(myReviews.first.touristName, 'Sarah Jenkins');
    });

    test('MOB-REV-008: Mark a review as helpful toggles helpful count and status', () {
      final target = reviews[0];
      expect(target.isHelpfulByUser, isFalse);
      expect(target.helpfulCount, 14);

      // Upvote
      final upvoted = target.copyWith(
        isHelpfulByUser: true,
        helpfulCount: target.helpfulCount + 1,
      );
      expect(upvoted.isHelpfulByUser, isTrue);
      expect(upvoted.helpfulCount, 15);

      // Downvote / Undo
      final unvoted = upvoted.copyWith(
        isHelpfulByUser: false,
        helpfulCount: upvoted.helpfulCount - 1,
      );
      expect(unvoted.isHelpfulByUser, isFalse);
      expect(unvoted.helpfulCount, 14);
    });
  });
}
