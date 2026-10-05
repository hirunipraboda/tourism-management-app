class ReviewItem {
  final String id;
  final String userName;
  final String? userAvatar;
  final int rating;
  final String comment;
  final DateTime createdAt;
  final String? destinationId;
  final String? destinationName;

  const ReviewItem({
    required this.id,
    required this.userName,
    this.userAvatar,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.destinationId,
    this.destinationName,
  });

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    return ReviewItem(
      id: json['id']?.toString() ?? '',
      userName: json['userName'] as String? ??
          json['touristName'] as String? ??
          'Anonymous',
      userAvatar: json['userAvatar'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      comment: json['comment'] as String? ?? '',
      createdAt: DateTime.tryParse(
              json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      destinationId: json['destinationId'] as String?,
      destinationName: json['destinationName'] as String? ??
          json['entityName'] as String?,
    );
  }

  /// Mock reviews for offline / development fallback.
  static List<ReviewItem> get mocks => [
        ReviewItem(
          id: 'r1',
          userName: 'Asel Perera',
          rating: 5,
          comment:
              'Absolutely stunning experience at Sigiriya! The ancient frescoes '
              'and panoramic views from the summit are simply breathtaking. Highly recommended.',
          createdAt: DateTime.now().subtract(const Duration(days: 3)),
          destinationName: 'Sigiriya Rock Fortress',
        ),
        ReviewItem(
          id: 'r2',
          userName: 'James Mitchell',
          rating: 4,
          comment:
              'Ella is a gem. The Nine Arches Bridge is magical at dawn, and '
              'the train journey from Kandy is one of the best rail rides in Asia.',
          createdAt: DateTime.now().subtract(const Duration(days: 7)),
          destinationName: 'Ella Nine Arches Bridge',
        ),
        ReviewItem(
          id: 'r3',
          userName: 'Nadia Fernandez',
          rating: 5,
          comment:
              'Galle Fort is a living museum. Walking the ramparts at sunset '
              'with the ocean crashing below was an unforgettable moment.',
          createdAt: DateTime.now().subtract(const Duration(days: 12)),
          destinationName: 'Galle Dutch Fort',
        ),
        ReviewItem(
          id: 'r4',
          userName: 'Roshan Silva',
          rating: 4,
          comment:
              'The Temple of the Sacred Tooth is a spiritual masterpiece. '
              'Arrive early to avoid crowds and witness the morning puja ceremony.',
          createdAt: DateTime.now().subtract(const Duration(days: 18)),
          destinationName: 'Kandy Temple',
        ),
      ];
}
