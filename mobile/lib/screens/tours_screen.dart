import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ToursScreen extends StatefulWidget {
  const ToursScreen({super.key});

  @override
  State<ToursScreen> createState() => _ToursScreenState();
}

class _ToursScreenState extends State<ToursScreen> {
  late Future<List<TourPackage>> _toursFuture;
  String _selectedStyle = 'All';

  final List<String> _styles = [
    'All',
    'Cultural',
    'Scenic',
    'Wildlife',
    'Beach',
  ];

  @override
  void initState() {
    super.initState();
    _toursFuture = ApiService.getTourPackages();
  }

  void _showBookingDialog(TourPackage tour) {
    final nameController = TextEditingController(text: 'Traveler Guest');
    final emailController = TextEditingController(text: 'traveler@example.com');
    int participants = 2;
    DateTime selectedDate = DateTime.now().add(const Duration(days: 14));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final total = tour.price * participants;
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Book ${tour.name}',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: NovaBrand.primary,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: NovaBrand.tertiary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '\$${tour.price.toInt()} / person',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w800,
                              color: NovaBrand.secondary,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${tour.durationDays} Days / ${tour.durationNights} Nights · ${tour.destinations}',
                      style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                    ),
                    const Divider(height: 24, color: NovaBrand.cardBorder),

                    // Traveler Name
                    Text('Full Name', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: NovaBrand.slateLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Email
                    Text('Email Address', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: emailController,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: NovaBrand.slateLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Participants Counter
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Number of Travelers', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: NovaBrand.slateDark)),
                        Row(
                          children: [
                            IconButton(
                              onPressed: participants > 1 ? () => setModalState(() => participants--) : null,
                              icon: const Icon(Icons.remove_circle_outline, color: NovaBrand.secondary),
                            ),
                            Text(
                              '$participants',
                              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              onPressed: () => setModalState(() => participants++),
                              icon: const Icon(Icons.add_circle_outline, color: NovaBrand.secondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Total Calculation Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: NovaBrand.slateLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: NovaBrand.cardBorderSoft),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Total Estimated Price', style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                              Text('All permits & private AC vehicle included', style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.tertiary, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          Text(
                            '\$${total.toInt()}',
                            style: GoogleFonts.outfit(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: NovaBrand.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Confirm Booking Action
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          final res = await ApiService.bookTour(
                            tourId: tour.id,
                            customerName: nameController.text.trim(),
                            customerEmail: emailController.text.trim(),
                            startDate: '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}',
                            participants: participants,
                            totalPrice: total,
                          );

                          Navigator.pop(ctx);
                          final isSuccess = res['success'] == true;
                          final msg = res['message'] ?? 'Booking processed successfully!';
                          if (!mounted) return;

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: isSuccess ? NovaBrand.primary : const Color(0xFFBE123C),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              content: Text(
                                msg,
                                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NovaBrand.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Text(
                          'Confirm & Reserve Package',
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800),
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
                'Tour & Guide',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary),
              ),
              backgroundColor: Colors.white,
              elevation: 0,
            )
          : null,
      body: FutureBuilder<List<TourPackage>>(
        future: _toursFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: NovaBrand.primary));
          }

          final allTours = snapshot.data ?? [];
          final filtered = allTours.where((t) {
            if (_selectedStyle == 'All') return true;
            return t.travelStyle.toLowerCase().contains(_selectedStyle.toLowerCase());
          }).toList();

          return CustomScrollView(
            slivers: [
              // Header & Style Filter
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Curated Sri Lanka Journeys',
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: NovaBrand.primary,
                        ),
                      ),
                      Text(
                        'Handcrafted packages with certified guides & private transport',
                        style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                      ),
                      const SizedBox(height: 14),

                      // Travel Style Chips
                      SizedBox(
                        height: 38,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _styles.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (context, index) {
                            final style = _styles[index];
                            final isSelected = _selectedStyle == style;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedStyle = style),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? NovaBrand.primary : Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? NovaBrand.primary : NovaBrand.cardBorder,
                                  ),
                                  boxShadow: isSelected ? NovaBrand.softShadow : null,
                                ),
                                child: Text(
                                  style,
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    color: isSelected ? Colors.white : NovaBrand.slateDark,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Tour Package Cards List
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final tour = filtered[index];
                      return _buildTourCard(tour);
                    },
                    childCount: filtered.length,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTourCard(TourPackage tour) {
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover Image with Badges
          Stack(
            children: [
              SizedBox(
                height: 180,
                width: double.infinity,
                child: Image.network(
                  tour.coverImage,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(color: NovaBrand.primary),
                ),
              ),

              // Gradient Overlay
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.3),
                        Colors.transparent,
                        Colors.black.withOpacity(0.7),
                      ],
                    ),
                  ),
                ),
              ),

              // Duration Badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: NovaBrand.primary,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.schedule, color: Colors.white, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        '${tour.durationDays}D / ${tour.durationNights}N',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Price Pill
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white24, width: 0.8),
                  ),
                  child: Text(
                    'From \$${tour.price.toInt()}',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: NovaBrand.accentAmber,
                    ),
                  ),
                ),
              ),

              // Title & Rating
              Positioned(
                bottom: 12,
                left: 14,
                right: 14,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tour.name,
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${tour.rating} · Certified Guide Included',
                          style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Route tags
                Row(
                  children: [
                    const Icon(Icons.alt_route, size: 14, color: NovaBrand.secondary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        tour.destinations,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: NovaBrand.slateDark,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Inclusions
                Text(
                  tour.inclusions,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted, height: 1.3),
                ),
                const SizedBox(height: 12),

                // Group Size & Transport
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.groups_outlined, size: 14, color: NovaBrand.tertiary),
                        const SizedBox(width: 4),
                        Text(tour.groupSize, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(Icons.directions_car_outlined, size: 14, color: NovaBrand.tertiary),
                        const SizedBox(width: 4),
                        Text(tour.transportType, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                      ],
                    ),
                  ],
                ),
                const Divider(height: 24, color: NovaBrand.cardBorderSoft),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _showBookingDialog(tour),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: NovaBrand.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Book Package Now',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, size: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
