import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  late Future<List<ReviewItem>> _reviewsFuture;

  @override
  void initState() {
    super.initState();
    _reviewsFuture = ApiService.getReviews();
  }

  void _reload() {
    setState(() {
      _reviewsFuture = ApiService.getReviews();
    });
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inDays >= 30) return '${(diff.inDays / 30).floor()} mo ago';
    if (diff.inDays >= 1) return '${diff.inDays}d ago';
    if (diff.inHours >= 1) return '${diff.inHours}h ago';
    return 'Just now';
  }

  Future<void> _showAddReviewDialog() async {
    final destinations = await ApiService.getDestinations();
    if (!mounted) return;

    final commentController = TextEditingController();
    double rating = 5.0;
    String? destinationId = destinations.isNotEmpty ? destinations.first.id : null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                top: 20,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Write a Review',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: NovaBrand.primary,
                      ),
                    ),
                    Text(
                      'Share your Sri Lankan journey experience with fellow travelers',
                      style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                    ),
                    const SizedBox(height: 14),
                    if (destinations.isNotEmpty)
                      DropdownButtonFormField<String>(
                        value: destinationId,
                        isExpanded: true,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: NovaBrand.slateLight,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(color: NovaBrand.cardBorder),
                          ),
                        ),
                        items: destinations
                            .map((d) => DropdownMenuItem(value: d.id, child: Text(d.name)))
                            .toList(),
                        onChanged: (v) => setModalState(() => destinationId = v),
                      ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final starNum = index + 1;
                        return IconButton(
                          icon: Icon(
                            starNum <= rating ? Icons.star_rounded : Icons.star_border_rounded,
                            color: NovaBrand.accentAmber,
                            size: 32,
                          ),
                          onPressed: () => setModalState(() => rating = starNum.toDouble()),
                        );
                      }),
                    ),
                    TextField(
                      controller: commentController,
                      maxLines: 3,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Describe your destination, sights, or tour guide experience...',
                        hintStyle: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                        filled: true,
                        fillColor: NovaBrand.slateLight,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: NovaBrand.cardBorder),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          final text = commentController.text.trim();
                          if (text.isEmpty) return;
                          Navigator.pop(ctx);
                          final res = await ApiService.submitReview(
                            comment: text,
                            rating: rating.toInt(),
                            destinationId: destinationId,
                          );
                          if (!mounted) return;
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            SnackBar(
                              backgroundColor: res['success'] == true ? Colors.teal : null,
                              content: Text(
                                res['success'] == true
                                    ? 'Review published and synced with the web platform!'
                                    : (res['message'] ?? 'Please sign in to submit a review'),
                              ),
                            ),
                          );
                          if (res['success'] == true) _reload();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NovaBrand.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Text(
                          'Submit Review',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: Navigator.canPop(context)
          ? AppBar(
              title: Text(
                'Reviews & Recs',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary),
              ),
            )
          : null,
      body: FutureBuilder<List<ReviewItem>>(
        future: _reviewsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: NovaBrand.primary));
          }
          final reviews = snapshot.data ?? [];
          final avg = reviews.isEmpty
              ? 0.0
              : reviews.map((r) => r.rating).reduce((a, b) => a + b) / reviews.length;

          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: NovaBrand.heroGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: NovaBrand.cardShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            reviews.isEmpty ? '--' : avg.toStringAsFixed(1),
                            style: GoogleFonts.outfit(
                              fontSize: 42,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              height: 1.0,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: List.generate(
                                  5,
                                  (i) => Icon(
                                    i < avg.round() ? Icons.star_rounded : Icons.star_border_rounded,
                                    color: NovaBrand.accentAmber,
                                    size: 16,
                                  ),
                                ),
                              ),
                              Text('out of 5.0 rating',
                                  style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Based on ${reviews.length} verified traveler review${reviews.length == 1 ? '' : 's'}',
                        style: GoogleFonts.inter(fontSize: 11, color: Colors.white.withOpacity(0.8)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Traveler Experiences (${reviews.length})',
                      style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary),
                    ),
                    TextButton(
                      onPressed: _showAddReviewDialog,
                      child: Text(
                        '+ Add Review',
                        style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: NovaBrand.secondary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (reviews.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Column(
                      children: [
                        const Icon(Icons.rate_review_outlined, size: 44, color: NovaBrand.slateMuted),
                        const SizedBox(height: 10),
                        Text(
                          'No reviews yet. Be the first to share your journey!',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 13, color: NovaBrand.slateMuted),
                        ),
                      ],
                    ),
                  )
                else
                  ...reviews.map(_buildReviewCard),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildReviewCard(ReviewItem r) {
    final target = r.destinationName ?? r.tourName ?? 'Sri Lanka';
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: NovaBrand.primary,
                backgroundImage: r.userAvatar != null && r.userAvatar!.startsWith('http')
                    ? NetworkImage(r.userAvatar!)
                    : null,
                child: r.userAvatar == null || !r.userAvatar!.startsWith('http')
                    ? Text(
                        r.userName.isNotEmpty ? r.userName[0].toUpperCase() : 'T',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.userName,
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: NovaBrand.slateDark),
                    ),
                    Text(
                      _timeAgo(r.createdAt),
                      style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: NovaBrand.accentAmber.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 14),
                    const SizedBox(width: 3),
                    Text(
                      '${r.rating}',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFFD97706)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: NovaBrand.slateLight,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: NovaBrand.cardBorderSoft),
            ),
            child: Text(
              target,
              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: NovaBrand.secondary),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            r.comment,
            style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateDark, height: 1.4),
          ),
        ],
      ),
    );
  }
}
