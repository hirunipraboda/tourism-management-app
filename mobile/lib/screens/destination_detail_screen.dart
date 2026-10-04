import 'package:flutter/material.dart';
import '../theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../theme/app_theme.dart';
import 'ai_planner_screen.dart';
import 'reviews_screen.dart';

import '../services/api_service.dart';

class DestinationDetailScreen extends StatelessWidget {
  final Destination destination;

  const DestinationDetailScreen({super.key, required this.destination});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      body: CustomScrollView(
        slivers: [
          // 1. Hero Image App Bar
          SliverAppBar(
            expandedHeight: 290,
            pinned: true,
            backgroundColor: NovaBrand.primary,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black.withValues(alpha: 0.55),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    destination.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: NovaBrand.primary,
                      child: const Icon(Icons.image, color: Colors.white54, size: 60),
                    ),
                  ),
                  // Gradient Overlay
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: NovaBrand.cardOverlayGradient,
                    ),
                  ),
                  // Live Weather Badge
                  Positioned(
                    top: 50,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.wb_sunny, color: NovaBrand.accentAmber, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            '${destination.liveTemp}°C',
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '· ${destination.liveCondition}',
                            style: GoogleFonts.inter(
                              color: const Color(0xFF99F6E4),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Bottom Title & Category
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: NovaBrand.tertiary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            destination.category.toUpperCase(),
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          destination.name,
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: NovaBrand.tertiary, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '${destination.province} · ${destination.location}',
                              style: GoogleFonts.inter(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 2. Body Details
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Travel Planning Metrics
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: NovaBrand.cardBorder),
                      boxShadow: NovaBrand.softShadow,
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _buildMetricTile(
                                icon: Icons.calendar_month,
                                title: 'Best Time to Visit',
                                value: destination.bestTimeToVisit,
                                iconColor: NovaBrand.tertiary,
                              ),
                            ),
                            Container(width: 1, height: 40, color: NovaBrand.cardBorderSoft),
                            Expanded(
                              child: _buildMetricTile(
                                icon: Icons.schedule,
                                title: 'Recommended Stay',
                                value: destination.recommendedStayDays,
                                iconColor: NovaBrand.tertiary,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24, color: NovaBrand.cardBorderSoft),
                        Row(
                          children: [
                            Expanded(
                              child: _buildMetricTile(
                                icon: Icons.payments,
                                title: 'Avg Budget / Day',
                                value: destination.avgBudgetPerDay,
                                iconColor: NovaBrand.secondary,
                              ),
                            ),
                            Container(width: 1, height: 40, color: NovaBrand.cardBorderSoft),
                            Expanded(
                              child: _buildMetricTile(
                                icon: Icons.access_time_filled,
                                title: 'Opening Hours',
                                value: destination.openingHours,
                                iconColor: NovaBrand.secondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Admission & Access Fees Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFCCFBF1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.confirmation_number, color: NovaBrand.secondary, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'ADMISSION & ENTRY FEES',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: NovaBrand.secondary,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFF99F6E4)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Local Citizens',
                                      style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted, fontWeight: FontWeight.w600),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      destination.entryFeeLocal,
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: NovaBrand.slateDark,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFF99F6E4)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Foreign Visitors',
                                      style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted, fontWeight: FontWeight.w600),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      destination.entryFeeForeign,
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: NovaBrand.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Top Attractions
                  if (destination.topAttractions.isNotEmpty) ...[
                    Container(
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Top Key Attractions',
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: NovaBrand.primary,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: NovaBrand.tertiary.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${destination.topAttractions.length} Sights',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: NovaBrand.secondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: destination.topAttractions.map((attr) {
                              return Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                                decoration: BoxDecoration(
                                  color: NovaBrand.slateLight,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: NovaBrand.cardBorderSoft),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star_rounded, size: 14, color: NovaBrand.accentAmber),
                                    const SizedBox(width: 6),
                                    Text(
                                      attr,
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: NovaBrand.slateDark,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Overview & Description
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: NovaBrand.cardBorder),
                      boxShadow: NovaBrand.softShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Destination Overview',
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: NovaBrand.primary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          destination.description,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: NovaBrand.slateDark,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Real-Time Telemetry Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: NovaBrand.heroGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: NovaBrand.cardShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.satellite_alt, color: Color(0xFF99F6E4), size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  'LIVE TELEMETRY STATION',
                                  style: GoogleFonts.inter(
                                    color: const Color(0xFF99F6E4),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'REAL-TIME',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildLiveStat('TEMPERATURE', '${destination.liveTemp}°C', Icons.thermostat),
                            _buildLiveStat('CONDITION', destination.liveCondition, Icons.wb_sunny_outlined),
                            _buildLiveStat('HUMIDITY', '${destination.humidity}%', Icons.water_drop_outlined),
                            _buildLiveStat('WIND', '${destination.windSpeed} km/h', Icons.air),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Traveler Reviews Section
                  FutureBuilder<List<ReviewItem>>(
                    future: ApiService.getReviews(destinationId: destination.id),
                    builder: (context, snapshot) {
                      final reviews = snapshot.data ?? [];
                      return Container(
                        padding: const EdgeInsets.all(18),
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
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 20),
                                    const SizedBox(width: 6),
                                    Text(
                                      'TRAVELER REVIEWS (${reviews.length})',
                                      style: GoogleFonts.outfit(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: NovaBrand.primary,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                                TextButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const ReviewsScreen()),
                                    );
                                  },
                                  child: Text(
                                    'Write Review',
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: NovaBrand.secondary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (reviews.isEmpty)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  'Be the first to review ${destination.name}!',
                                  style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                                ),
                              )
                            else
                              ...reviews.take(3).map((r) => Padding(
                                    padding: const EdgeInsets.only(top: 10),
                                    child: Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: NovaBrand.slateLight,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: NovaBrand.cardBorderSoft),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                r.authorName,
                                                style: GoogleFonts.outfit(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w700,
                                                  color: NovaBrand.slateDark,
                                                ),
                                              ),
                                              Row(
                                                children: List.generate(
                                                  5,
                                                  (i) => Icon(
                                                    i < r.rating ? Icons.star_rounded : Icons.star_border_rounded,
                                                    size: 14,
                                                    color: NovaBrand.accentAmber,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            r.comment,
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              color: NovaBrand.slateDark,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 24),

                  // Bottom Action: Add to AI Trip Plan
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
                      label: Text(
                        'Plan Trip to ${destination.name}',
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NovaBrand.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const AiPlannerScreen(),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required String title,
    required String value,
    required Color iconColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: iconColor),
              const SizedBox(width: 4),
              Text(
                title.toUpperCase(),
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: NovaBrand.slateMuted,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: NovaBrand.slateDark,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildLiveStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF99F6E4), size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            color: Colors.white60,
            fontSize: 9.5,
          ),
        ),
      ],
    );
  }
}
