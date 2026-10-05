import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/review_item.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../theme/app_fonts.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen>
    with SingleTickerProviderStateMixin {
  late Future<List<ReviewItem>> _reviewsFuture;
  late AnimationController _fabAnimController;

  // Form state
  final _commentController = TextEditingController();
  int _selectedRating = 5;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _reviewsFuture = ApiService.getReviews();
    _fabAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _commentController.dispose();
    _fabAnimController.dispose();
    super.dispose();
  }

  void _reload() {
    setState(() {
      _reviewsFuture = ApiService.getReviews();
    });
  }

  double _avgRating(List<ReviewItem> reviews) {
    if (reviews.isEmpty) return 0.0;
    final total = reviews.fold<int>(0, (sum, r) => sum + r.rating);
    return total / reviews.length;
  }

  Future<void> _openSubmitSheet() async {
    _commentController.clear();
    _selectedRating = 5;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SubmitReviewSheet(
        commentController: _commentController,
        initialRating: _selectedRating,
        onSubmit: (rating, comment) async {
          setState(() => _isSubmitting = true);
          Navigator.of(ctx).pop();

          final result = await ApiService.submitReview(
            comment: comment,
            rating: rating,
          );

          setState(() => _isSubmitting = false);

          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                result['success'] == true
                    ? 'Review submitted successfully!'
                    : 'Failed: ${result['message']}',
              ),
              backgroundColor: result['success'] == true
                  ? NovaBrand.success
                  : NovaBrand.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(NovaBrand.radiusMd)),
            ),
          );

          if (result['success'] == true) _reload();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.surface,
      appBar: _buildAppBar(),
      floatingActionButton: _buildFab(),
      body: FutureBuilder<List<ReviewItem>>(
        future: _reviewsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: NovaBrand.primary),
            );
          }

          final reviews = snapshot.data ?? [];

          return RefreshIndicator(
            color: NovaBrand.primary,
            onRefresh: () async => _reload(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildSummaryCard(reviews)),
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                  sliver: reviews.isEmpty
                      ? SliverFillRemaining(child: _buildEmptyState())
                      : SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (ctx, i) => _ReviewCard(
                              review: reviews[i],
                              isLast: i == reviews.length - 1,
                            ),
                            childCount: reviews.length,
                          ),
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              gradient: NovaBrand.heroGradient,
              borderRadius: BorderRadius.circular(NovaBrand.radiusSm),
            ),
            child: const Icon(Icons.rate_review_rounded,
                color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          Text(
            'Traveller Reviews',
            style: AppFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: NovaBrand.slateDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFab() {
    return FloatingActionButton.extended(
      onPressed: _isSubmitting ? null : _openSubmitSheet,
      backgroundColor: NovaBrand.primary,
      foregroundColor: Colors.white,
      elevation: 4,
      icon: _isSubmitting
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                  color: Colors.white, strokeWidth: 2),
            )
          : const Icon(Icons.edit_rounded, size: 20),
      label: Text(
        'Write a Review',
        style: AppFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildSummaryCard(List<ReviewItem> reviews) {
    final avg = _avgRating(reviews);

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: NovaBrand.heroGradient,
        borderRadius: BorderRadius.circular(NovaBrand.radiusLg),
        boxShadow: NovaBrand.cardShadow,
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                avg.toStringAsFixed(1),
                style: GoogleFonts.outfit(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1,
                ),
              ),
              const SizedBox(height: 4),
              _StarRow(rating: avg.round(), size: 18, color: Colors.white70),
              const SizedBox(height: 4),
              Text(
                '${reviews.length} review${reviews.length == 1 ? '' : 's'}',
                style: AppFonts.inter(
                    fontSize: 13, color: Colors.white70),
              ),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(5, (i) {
              final star = 5 - i;
              final count = reviews.where((r) => r.rating == star).length;
              final pct =
                  reviews.isEmpty ? 0.0 : count / reviews.length;
              return _RatingBar(star: star, percent: pct, count: count);
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.rate_review_outlined,
              size: 64, color: NovaBrand.slateMuted),
          const SizedBox(height: 16),
          Text(
            'No reviews yet',
            style: AppFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: NovaBrand.slateBody),
          ),
          const SizedBox(height: 8),
          Text(
            'Be the first to share your experience!',
            style: AppFonts.inter(fontSize: 14, color: NovaBrand.slateMuted),
          ),
        ],
      ),
    );
  }
}

// ── Review Card ───────────────────────────────────────────────────────────────

class _ReviewCard extends StatelessWidget {
  final ReviewItem review;
  final bool isLast;

  const _ReviewCard({required this.review, required this.isLast});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: isLast ? 0 : 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(NovaBrand.radiusMd),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Avatar(name: review.userName, avatar: review.userAvatar),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.userName,
                        style: AppFonts.outfit(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      if (review.destinationName != null) ...[
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.place_outlined,
                                size: 12, color: NovaBrand.slateMuted),
                            const SizedBox(width: 2),
                            Text(
                              review.destinationName!,
                              style: AppFonts.inter(
                                  fontSize: 12, color: NovaBrand.slateMuted),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                _StarRow(rating: review.rating, size: 14),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              review.comment,
              style: AppFonts.inter(
                  fontSize: 14, color: NovaBrand.slateBody, height: 1.5),
            ),
            const SizedBox(height: 10),
            Text(
              _formatDate(review.createdAt),
              style: AppFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }
}

// ── Submit Review Bottom Sheet ────────────────────────────────────────────────

class _SubmitReviewSheet extends StatefulWidget {
  final TextEditingController commentController;
  final int initialRating;
  final void Function(int rating, String comment) onSubmit;

  const _SubmitReviewSheet({
    required this.commentController,
    required this.initialRating,
    required this.onSubmit,
  });

  @override
  State<_SubmitReviewSheet> createState() => _SubmitReviewSheetState();
}

class _SubmitReviewSheetState extends State<_SubmitReviewSheet> {
  late int _rating;

  @override
  void initState() {
    super.initState();
    _rating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      margin: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(
            top: Radius.circular(NovaBrand.radiusXl)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: NovaBrand.cardBorder,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Share Your Experience',
            style: AppFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: NovaBrand.slateDark),
          ),
          const SizedBox(height: 6),
          Text(
            'Your review helps other travellers plan their trip.',
            style: AppFonts.inter(fontSize: 14, color: NovaBrand.slateMuted),
          ),
          const SizedBox(height: 20),
          // Star selector
          Text(
            'Rating',
            style: AppFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: NovaBrand.slateBody),
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (i) {
              final star = i + 1;
              return GestureDetector(
                onTap: () => setState(() => _rating = star),
                child: Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: Icon(
                    star <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: star <= _rating
                        ? NovaBrand.secondary
                        : NovaBrand.cardBorderSoft,
                    size: 36,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 20),
          Text(
            'Your Review',
            style: AppFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: NovaBrand.slateBody),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: widget.commentController,
            maxLines: 4,
            maxLength: 500,
            style: AppFonts.inter(fontSize: 14, color: NovaBrand.slateBody),
            decoration: InputDecoration(
              hintText: 'Describe your experience...',
              hintStyle: AppFonts.inter(
                  fontSize: 14, color: NovaBrand.slateMuted),
              filled: true,
              fillColor: NovaBrand.slateLight,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(NovaBrand.radiusMd),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(NovaBrand.radiusMd),
                borderSide: const BorderSide(color: NovaBrand.primary, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () {
                final comment = widget.commentController.text.trim();
                if (comment.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please write a comment.')),
                  );
                  return;
                }
                widget.onSubmit(_rating, comment);
              },
              style: FilledButton.styleFrom(
                backgroundColor: NovaBrand.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(NovaBrand.radiusMd),
                ),
              ),
              child: Text(
                'Submit Review',
                style: AppFonts.outfit(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Shared Helpers ─────────────────────────────────────────────────────────────

class _Avatar extends StatelessWidget {
  final String name;
  final String? avatar;

  const _Avatar({required this.name, this.avatar});

  @override
  Widget build(BuildContext context) {
    if (avatar != null) {
      return CircleAvatar(
        radius: 22,
        backgroundImage: NetworkImage(avatar!),
      );
    }
    return CircleAvatar(
      radius: 22,
      backgroundColor: NovaBrand.primary.withValues(alpha: 0.15),
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: AppFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: NovaBrand.primary),
      ),
    );
  }
}

class _StarRow extends StatelessWidget {
  final int rating;
  final double size;
  final Color? color;

  const _StarRow({required this.rating, this.size = 16, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final filled = i < rating;
        return Icon(
          filled ? Icons.star_rounded : Icons.star_outline_rounded,
          size: size,
          color: color ?? (filled ? NovaBrand.secondary : NovaBrand.cardBorderSoft),
        );
      }),
    );
  }
}

class _RatingBar extends StatelessWidget {
  final int star;
  final double percent;
  final int count;

  const _RatingBar(
      {required this.star, required this.percent, required this.count});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(
            '$star',
            style: AppFonts.inter(fontSize: 11, color: Colors.white70),
          ),
          const SizedBox(width: 4),
          const Icon(Icons.star_rounded, size: 11, color: Colors.white70),
          const SizedBox(width: 6),
          SizedBox(
            width: 80,
            height: 5,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: percent,
                backgroundColor: Colors.white24,
                valueColor:
                    const AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ),
          const SizedBox(width: 6),
          Text(
            '$count',
            style: AppFonts.inter(fontSize: 11, color: Colors.white70),
          ),
        ],
      ),
    );
  }
}
