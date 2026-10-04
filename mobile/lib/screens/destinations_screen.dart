import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'destination_detail_screen.dart';

class DestinationsScreen extends StatefulWidget {
  final String? initialCategory;
  const DestinationsScreen({super.key, this.initialCategory});

  @override
  State<DestinationsScreen> createState() => _DestinationsScreenState();
}

class _DestinationsScreenState extends State<DestinationsScreen> {
  late Future<List<Destination>> _destinationsFuture;
  late String _selectedCategory;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Nature',
    'Culture',
    'Adventure',
    'Beach',
    'Food',
    'Wellness',
    'Heritage',
    'Wildlife',
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _destinationsFuture = ApiService.getDestinations();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      body: FutureBuilder<List<Destination>>(
        future: _destinationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: NovaBrand.primary));
          }

          final allDestinations = snapshot.data ?? [];
          final filtered = allDestinations.where((d) {
            final matchesCat = _selectedCategory == 'All' ||
                d.category.toLowerCase() == _selectedCategory.toLowerCase();
            final matchesQuery = _searchQuery.isEmpty ||
                d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                d.location.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                d.province.toLowerCase().contains(_searchQuery.toLowerCase());
            return matchesCat && matchesQuery;
          }).toList();

          return CustomScrollView(
            slivers: [
              // Search & Filter Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Destinations Catalog',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: NovaBrand.primary,
                        ),
                      ),
                      Text(
                        'Explore Sri Lanka’s top sights with live telemetry & visitor insights',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: NovaBrand.slateMuted,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Search Input
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: NovaBrand.cardBorder),
                          boxShadow: NovaBrand.softShadow,
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val),
                          style: GoogleFonts.inter(fontSize: 13, color: NovaBrand.slateDark),
                          decoration: InputDecoration(
                            hintText: 'Search destinations, provinces, sights...',
                            hintStyle: GoogleFonts.inter(fontSize: 13, color: NovaBrand.slateMuted),
                            prefixIcon: const Icon(Icons.search, color: NovaBrand.tertiary, size: 22),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18, color: NovaBrand.slateMuted),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Category Pills
                      SizedBox(
                        height: 38,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _categories.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (context, index) {
                            final cat = _categories[index];
                            final isSelected = _selectedCategory == cat;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedCategory = cat),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? NovaBrand.primary : Colors.white,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: isSelected ? NovaBrand.primary : NovaBrand.cardBorder,
                                    width: 1,
                                  ),
                                  boxShadow: isSelected ? NovaBrand.softShadow : null,
                                ),
                                child: Text(
                                  cat,
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
                      const SizedBox(height: 12),

                      // Results count & Live weather indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Showing ${filtered.length} Destinations',
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: NovaBrand.slateDark,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: NovaBrand.tertiary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.sensors, size: 12, color: NovaBrand.secondary),
                                const SizedBox(width: 4),
                                Text(
                                  'Live Telemetry',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: NovaBrand.secondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Destination Cards List
              if (filtered.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.search_off_rounded, size: 56, color: NovaBrand.slateMuted),
                          const SizedBox(height: 12),
                          Text(
                            'No destinations match "$_searchQuery"',
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: NovaBrand.primary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Try selecting another category or check your spelling.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.inter(fontSize: 13, color: NovaBrand.slateMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final dest = filtered[index];
                        return _buildDestinationCard(dest);
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

  Widget _buildDestinationCard(Destination dest) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
          // Photo with Badges
          Stack(
            children: [
              SizedBox(
                height: 180,
                width: double.infinity,
                child: Image.network(
                  dest.imageUrl,
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
                        Colors.black.withOpacity(0.35),
                        Colors.transparent,
                        Colors.black.withOpacity(0.65),
                      ],
                    ),
                  ),
                ),
              ),

              // Top Live Weather Tag
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white24, width: 0.8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.wb_sunny_rounded, color: NovaBrand.accentAmber, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        '${dest.liveTemp}°C',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '· ${dest.liveCondition}',
                        style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF99F6E4)),
                      ),
                    ],
                  ),
                ),
              ),

              // Category Pill
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: NovaBrand.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    dest.category.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              // Bottom Title on Image
              Positioned(
                bottom: 12,
                left: 14,
                right: 14,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dest.name,
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: NovaBrand.tertiary, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${dest.province} · ${dest.location}',
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withOpacity(0.9)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Body Details & Telemetry
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dest.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted, height: 1.35),
                ),
                const SizedBox(height: 14),

                // Metrics Grid (Stay, Budget, Local & Foreign Fee)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: NovaBrand.slateLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: NovaBrand.cardBorderSoft),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildMetric(
                          icon: Icons.calendar_month_outlined,
                          title: 'Rec. Stay',
                          val: dest.recommendedStayDays,
                        ),
                      ),
                      Container(width: 1, height: 32, color: NovaBrand.cardBorder),
                      Expanded(
                        child: _buildMetric(
                          icon: Icons.payments_outlined,
                          title: 'Daily Budget',
                          val: dest.avgBudgetPerDay,
                        ),
                      ),
                      Container(width: 1, height: 32, color: NovaBrand.cardBorder),
                      Expanded(
                        child: _buildMetric(
                          icon: Icons.confirmation_number_outlined,
                          title: 'Foreign Fee',
                          val: dest.entryFeeForeign,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // View Details Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => DestinationDetailScreen(destination: dest),
                        ),
                      );
                    },
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
                          'View Destination Details',
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

  Widget _buildMetric({required IconData icon, required String title, required String val}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: NovaBrand.secondary),
              const SizedBox(width: 4),
              Text(
                title,
                style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            val,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: NovaBrand.slateDark,
            ),
          ),
        ],
      ),
    );
  }
}
