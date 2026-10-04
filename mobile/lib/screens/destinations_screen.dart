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
  final Map<String, bool> _favorites = {};

  // Categories list matching Sri Lanka website travel styles
  final List<String> _categories = [
    'All',
    'Cultural',
    'Heritage',
    'Nature',
    'Beach',
    'Wildlife',
    'Adventure',
    'Popular',
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _destinationsFuture = _loadDestinationsWithCatalog();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Pre-seeded Sri Lanka catalog destinations matching the website dataset
  static final List<Destination> _catalogDestinations = [
    Destination(
      id: 'kandy',
      name: 'Kandy',
      slug: 'kandy',
      description: 'Immerse in Sri Lanka’s cultural heart, home to the sacred Temple of the Tooth Relic, mist-shrouded hills, and serene central lake.',
      location: 'Central Highlands',
      province: 'Central Province',
      category: 'Cultural',
      imageUrl: 'assets/images/destinations/Kandy.jpg',
      rating: 4.88,
      reviewCount: 1420,
      entryFee: 15,
      bestTimeToVisit: 'December to April',
      recommendedStayDays: '2 - 3 Days',
      avgBudgetPerDay: '\$60 - \$95 / day',
      openingHours: '05:30 AM – 08:00 PM Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: '\$15 USD / LKR 4,500',
      topAttractions: ['Temple of the Sacred Tooth Relic', 'Royal Botanical Gardens Peradeniya', 'Kandy Lake Promenade', 'Bahirawakanda Vihara Buddha Statue'],
      liveTemp: 25.0,
      liveCondition: 'Mild Highland Breeze',
    ),
    Destination(
      id: 'ella',
      name: 'Ella & Nine Arch Bridge',
      slug: 'ella',
      description: 'Mountain views, tea estates, misty cloud forests and iconic blue train railway journeys across colonial stone viaducts.',
      location: 'Badulla Highlands',
      province: 'Uva Province',
      category: 'Nature',
      imageUrl: 'assets/images/destinations/Ella.jpg',
      rating: 4.90,
      reviewCount: 1240,
      entryFee: 0,
      bestTimeToVisit: 'January to May',
      recommendedStayDays: '2 - 3 Days',
      avgBudgetPerDay: '\$35 - \$60 / day',
      openingHours: '24 Hours Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: 'Free Access',
      topAttractions: ['Nine Arches Railway Bridge', 'Little Adam’s Peak', 'Ravana Falls', 'Ella Rock Trail'],
      liveTemp: 22.3,
      liveCondition: 'Misty Mountain Air',
    ),
    Destination(
      id: 'galle',
      name: 'Galle Dutch Fort',
      slug: 'galle',
      description: 'Living 16th-century sea-facing fortress with cobblestone alleys, Dutch colonial mansions, lighthouse, and vibrant artisan cafes.',
      location: 'Galle District',
      province: 'Southern Province',
      category: 'Heritage',
      imageUrl: 'assets/images/destinations/Galle.jpg',
      rating: 4.86,
      reviewCount: 1120,
      entryFee: 0,
      bestTimeToVisit: 'November to April',
      recommendedStayDays: '1 - 2 Days',
      avgBudgetPerDay: '\$70 - \$120 / day',
      openingHours: '24 Hours Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: 'Free Access',
      topAttractions: ['Galle Lighthouse', 'Dutch Reformed Church', 'Flag Rock Bastion', 'Maritime Archeology Museum'],
      liveTemp: 29.8,
      liveCondition: 'Tropical Coastal Sun',
    ),
    Destination(
      id: 'sigiriya',
      name: 'Sigiriya (Lion Rock)',
      slug: 'sigiriya',
      description: 'Ascend the 5th-century Lion Rock fortress to discover ancient frescoes, royal water gardens, and 360° jungle canopy panoramas.',
      location: 'Matale District',
      province: 'Central Province',
      category: 'Heritage',
      imageUrl: 'assets/images/destinations/sigiriya.jpg',
      rating: 4.92,
      reviewCount: 1580,
      entryFee: 30,
      bestTimeToVisit: 'January to April',
      recommendedStayDays: '1 - 2 Days',
      avgBudgetPerDay: '\$60 - \$95 / day',
      openingHours: '06:00 AM – 05:30 PM Daily',
      entryFeeLocal: 'LKR 100',
      entryFeeForeign: '\$30 USD / LKR 9,000',
      topAttractions: ['Lion Rock Citadel', 'Sigiriya Frescoes & Mirror Wall', 'Pidurangala Rock Sunrise Viewpoint', 'Royal Water Gardens'],
      liveTemp: 32.0,
      liveCondition: 'Warm Cultural Triangle',
    ),
    Destination(
      id: 'mirissa',
      name: 'Mirissa Coast',
      slug: 'mirissa',
      description: 'Azure Indian Ocean bay with Coconut Tree Hill, world-renowned blue whale watching safaris, and palm-fringed surfing shores.',
      location: 'Matara District',
      province: 'Southern Province',
      category: 'Beach',
      imageUrl: 'assets/images/destinations/Mirissa.jpg',
      rating: 4.88,
      reviewCount: 980,
      entryFee: 0,
      bestTimeToVisit: 'November to April',
      recommendedStayDays: '2 - 4 Days',
      avgBudgetPerDay: '\$40 - \$75 / day',
      openingHours: '24 Hours Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: 'Free Access',
      topAttractions: ['Coconut Tree Hill', 'Mirissa Beach Reef Surf Point', 'Blue Whale Watching Safaris', 'Parrot Rock'],
      liveTemp: 29.5,
      liveCondition: 'Coastal Ocean Breeze',
    ),
    Destination(
      id: 'yala',
      name: 'Yala National Park',
      slug: 'yala',
      description: 'Untamed coastal savannah renowned for the world’s highest density of wild leopards, Asian elephants, and sloth bears.',
      location: 'Hambantota District',
      province: 'Southern Province',
      category: 'Wildlife',
      imageUrl: 'assets/images/destinations/Yala.jpg',
      rating: 4.92,
      reviewCount: 890,
      entryFee: 40,
      bestTimeToVisit: 'February to July',
      recommendedStayDays: '1 - 2 Days',
      avgBudgetPerDay: '\$80 - \$150 / day',
      openingHours: '06:00 AM – 06:00 PM Daily',
      entryFeeLocal: 'LKR 500',
      entryFeeForeign: '\$40 USD + Jeep Safari',
      topAttractions: ['Leopard Safari Block 1', 'Elephant Gathering Point', 'Kumbukkan Oya River', 'Patanangala Beach'],
      liveTemp: 33.0,
      liveCondition: 'Dry Safari Sun',
    ),
    Destination(
      id: 'horton_plains',
      name: 'Horton Plains & World\'s End',
      slug: 'horton-plains',
      description: 'High-altitude cloud forest plateau terminating at a sheer 880-meter vertical cliff precipice overlooking southern plains.',
      location: 'Central Highlands',
      province: 'Central Province',
      category: 'Nature',
      imageUrl: 'assets/images/destinations/horton_plains.jpg',
      rating: 4.90,
      reviewCount: 760,
      entryFee: 25,
      bestTimeToVisit: 'January to March',
      recommendedStayDays: '1 Day',
      avgBudgetPerDay: '\$50 - \$85 / day',
      openingHours: '06:00 AM – 04:00 PM Daily',
      entryFeeLocal: 'LKR 300',
      entryFeeForeign: '\$25 USD / LKR 7,500',
      topAttractions: ['World’s End Precipice', 'Baker’s Falls', 'Mini World’s End', 'Chimakanda Cloud Forest Trail'],
      liveTemp: 15.5,
      liveCondition: 'Chilly Highland Mist',
    ),
    Destination(
      id: 'nilaveli',
      name: 'Nilaveli & Pigeon Island',
      slug: 'nilaveli',
      description: 'Pristine white sand bays, turquoise waters, and shallow coral reef snorkeling around Pigeon Island National Marine Park.',
      location: 'Trincomalee District',
      province: 'Eastern Province',
      category: 'Beach',
      imageUrl: 'assets/images/destinations/nilaveli.png',
      rating: 4.85,
      reviewCount: 640,
      entryFee: 15,
      bestTimeToVisit: 'May to October',
      recommendedStayDays: '2 - 3 Days',
      avgBudgetPerDay: '\$50 - \$90 / day',
      openingHours: '06:00 AM – 06:00 PM Daily',
      entryFeeLocal: 'LKR 200',
      entryFeeForeign: '\$15 USD + Boat Shuttle',
      topAttractions: ['Pigeon Island Marine Sanctuary', 'Nilaveli White Sand Beach', 'Swami Rock Cliff', 'Irakkandy Lagoon'],
      liveTemp: 31.0,
      liveCondition: 'Sunny Beach Waters',
    ),
    Destination(
      id: 'anuradhapura',
      name: 'Anuradhapura Sacred Citadel',
      slug: 'anuradhapura',
      description: 'Ancient sacred stupas, sprawling monastic ruins, and the venerated Jaya Sri Maha Bodhi tree standing for over 2,300 years.',
      location: 'North Central Province',
      province: 'North Central Province',
      category: 'Heritage',
      imageUrl: 'assets/images/destinations/Anuradhapura.jpg',
      rating: 4.85,
      reviewCount: 820,
      entryFee: 25,
      bestTimeToVisit: 'May to September',
      recommendedStayDays: '1 - 2 Days',
      avgBudgetPerDay: '\$45 - \$80 / day',
      openingHours: '06:00 AM – 06:00 PM Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: '\$25 USD / LKR 7,500',
      topAttractions: ['Jaya Sri Maha Bodhi', 'Ruwanwelisaya White Stupa', 'Jetavanaramaya Monastery', 'Twin Ponds (Kuttam Pokuna)'],
      liveTemp: 32.5,
      liveCondition: 'Dry Ancient Plains',
    ),
    Destination(
      id: 'arugam_bay',
      name: 'Arugam Bay Surf Point',
      slug: 'arugam-bay',
      description: 'World-renowned right-hand point break surf paradise with relaxed bohemian beach shacks, lagoon safaris, and sunrise yoga.',
      location: 'Ampara District',
      province: 'Eastern Province',
      category: 'Adventure',
      imageUrl: 'assets/images/destinations/Sri_lanka_beauty.jpg',
      rating: 4.82,
      reviewCount: 590,
      entryFee: 0,
      bestTimeToVisit: 'May to September',
      recommendedStayDays: '3 - 5 Days',
      avgBudgetPerDay: '\$35 - \$65 / day',
      openingHours: '24 Hours Daily',
      entryFeeLocal: 'Free Entry',
      entryFeeForeign: 'Free Access',
      topAttractions: ['Main Surf Point', 'Elephant Rock Sunset', 'Whiskey Point', 'Kottukal Lagoon Safari'],
      liveTemp: 30.5,
      liveCondition: 'Warm Surf Breeze',
    ),
  ];

  Future<List<Destination>> _loadDestinationsWithCatalog() async {
    try {
      final apiList = await ApiService.getDestinations();
      if (apiList.isNotEmpty) {
        // Merge API destinations with catalog to ensure complete collection
        final existingNames = apiList.map((d) => d.name.toLowerCase().trim()).toSet();
        final combined = [...apiList];
        for (final catDest in _catalogDestinations) {
          final hasMatch = existingNames.any((name) =>
              name.contains(catDest.name.toLowerCase().split(' ').first) ||
              catDest.name.toLowerCase().contains(name.split(' ').first));
          if (!hasMatch) {
            combined.add(catDest);
          }
        }
        return combined;
      }
    } catch (e) {
      debugPrint('[DestinationsScreen] Error loading destinations from API: $e');
    }
    return _catalogDestinations;
  }

  static String getBestImage(Destination dest) {
    final lower = dest.name.toLowerCase();
    if (lower.contains('kandy')) return 'assets/images/destinations/Kandy.jpg';
    if (lower.contains('ella')) return 'assets/images/destinations/Ella.jpg';
    if (lower.contains('sigiriya')) return 'assets/images/destinations/sigiriya.jpg';
    if (lower.contains('mirissa')) return 'assets/images/destinations/Mirissa.jpg';
    if (lower.contains('galle')) return 'assets/images/destinations/Galle.jpg';
    if (lower.contains('yala')) return 'assets/images/destinations/Yala.jpg';
    if (lower.contains('horton')) return 'assets/images/destinations/horton_plains.jpg';
    if (lower.contains('nilaveli') || lower.contains('trincomalee')) return 'assets/images/destinations/nilaveli.png';
    if (lower.contains('anuradhapura')) return 'assets/images/destinations/Anuradhapura.jpg';
    if (lower.contains('riverston')) return 'assets/images/destinations/riverston.jpg';
    if (lower.contains('nuwara eliya')) return 'assets/images/destinations/horton_plains.jpg';
    if (lower.contains('arugam')) return 'assets/images/destinations/Sri_lanka_beauty.jpg';
    return dest.imageUrl;
  }

  static ({double temp, String condition}) getLiveWeatherTelemetry(Destination dest) {
    final lower = dest.name.toLowerCase();
    if (lower.contains('kandy')) return (temp: 25.0, condition: 'Mild Highland Breeze');
    if (lower.contains('ella')) return (temp: 22.3, condition: 'Misty Mountain Air');
    if (lower.contains('galle')) return (temp: 29.8, condition: 'Tropical Coastal Sun');
    if (lower.contains('sigiriya')) return (temp: 32.0, condition: 'Warm Cultural Triangle');
    if (lower.contains('mirissa')) return (temp: 29.5, condition: 'Coastal Ocean Breeze');
    if (lower.contains('yala')) return (temp: 33.0, condition: 'Dry Safari Sun');
    if (lower.contains('horton')) return (temp: 15.5, condition: 'Chilly Highland Mist');
    if (lower.contains('nilaveli') || lower.contains('trincomalee')) return (temp: 31.0, condition: 'Sunny Beach Waters');
    if (lower.contains('anuradhapura')) return (temp: 32.5, condition: 'Dry Ancient Plains');
    if (lower.contains('arugam')) return (temp: 30.5, condition: 'Warm Surf Breeze');
    if (lower.contains('nuwara eliya')) return (temp: 16.0, condition: 'Cool Alpine Mist');
    return (temp: dest.liveTemp, condition: dest.liveCondition);
  }

  Widget _buildSmartImage(String path, {BoxFit fit = BoxFit.cover, double? width, double? height}) {
    if (path.startsWith('assets/')) {
      return Image.asset(
        path,
        fit: fit,
        width: width,
        height: height,
        errorBuilder: (_, __, ___) => Container(color: NovaBrand.primary),
      );
    }
    return Image.network(
      path,
      fit: fit,
      width: width,
      height: height,
      errorBuilder: (_, __, ___) => Container(color: NovaBrand.primary),
    );
  }

  void _toggleFavorite(String id, String name) {
    setState(() {
      _favorites[id] = !(_favorites[id] ?? false);
    });
    final isFav = _favorites[id] == true;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isFav ? Icons.favorite : Icons.favorite_border,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 8),
            Text(
              isFav ? 'Added $name to Saved Destinations' : 'Removed $name from Saved',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
            ),
          ],
        ),
        backgroundColor: NovaBrand.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _openDestinationDetail(Destination dest) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DestinationDetailScreen(destination: dest),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: FutureBuilder<List<Destination>>(
        future: _destinationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: NovaBrand.primary));
          }

          final allDestinations = snapshot.data ?? _catalogDestinations;
          final filtered = allDestinations.where((d) {
            // Category filter matching website behavior
            bool matchesCat = true;
            if (_selectedCategory == 'Cultural') {
              matchesCat = d.category.toLowerCase().contains('cult') ||
                  d.name.toLowerCase().contains('kandy');
            } else if (_selectedCategory == 'Heritage') {
              matchesCat = d.category.toLowerCase().contains('herit') ||
                  d.name.toLowerCase().contains('sigiriya') ||
                  d.name.toLowerCase().contains('galle') ||
                  d.name.toLowerCase().contains('anuradhapura');
            } else if (_selectedCategory == 'Nature') {
              matchesCat = d.category.toLowerCase().contains('nature') ||
                  d.category.toLowerCase().contains('hill') ||
                  d.name.toLowerCase().contains('ella') ||
                  d.name.toLowerCase().contains('horton');
            } else if (_selectedCategory == 'Beach') {
              matchesCat = d.category.toLowerCase().contains('beach') ||
                  d.name.toLowerCase().contains('mirissa') ||
                  d.name.toLowerCase().contains('nilaveli') ||
                  d.name.toLowerCase().contains('arugam');
            } else if (_selectedCategory == 'Wildlife') {
              matchesCat = d.category.toLowerCase().contains('wild') ||
                  d.name.toLowerCase().contains('yala');
            } else if (_selectedCategory == 'Adventure') {
              matchesCat = d.category.toLowerCase().contains('advent') ||
                  d.name.toLowerCase().contains('ella') ||
                  d.name.toLowerCase().contains('arugam');
            } else if (_selectedCategory == 'Popular') {
              matchesCat = d.rating >= 4.88;
            }

            final query = _searchQuery.toLowerCase().trim();
            final matchesQuery = query.isEmpty ||
                d.name.toLowerCase().contains(query) ||
                d.location.toLowerCase().contains(query) ||
                d.province.toLowerCase().contains(query) ||
                d.description.toLowerCase().contains(query) ||
                d.category.toLowerCase().contains(query);

            return matchesCat && matchesQuery;
          }).toList();

          return CustomScrollView(
            slivers: [
              // 1. HEADER SECTION (MATCHING WEBSITE EXACTLY)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                  child: Column(
                    children: [
                      // Title
                      Text(
                        'Explore Destinations',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: NovaBrand.primary,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Subtitle
                      Text(
                        'Discover Sri Lanka’s UNESCO citadels, misty highlands, coastal surf bays, and wildlife reserves.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          color: NovaBrand.slateMuted,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Pill Search Bar
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0B3A53).withValues(alpha: 0.05),
                              blurRadius: 12,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val),
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w600,
                            color: NovaBrand.slateDark,
                          ),
                          decoration: InputDecoration(
                            hintText: 'Search destinations by name...',
                            hintStyle: GoogleFonts.inter(
                              fontSize: 13,
                              color: const Color(0xFF94A3B8),
                              fontWeight: FontWeight.w400,
                            ),
                            prefixIcon: const Padding(
                              padding: EdgeInsets.only(left: 16, right: 10),
                              child: Icon(Icons.search_rounded, color: NovaBrand.secondary, size: 21),
                            ),
                            prefixIconConstraints: const BoxConstraints(minWidth: 48, minHeight: 48),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close_rounded, size: 18, color: NovaBrand.slateMuted),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Category Pills (Website Style)
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
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? NovaBrand.primary : Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: isSelected ? NovaBrand.primary : const Color(0xFFE2E8F0),
                                    width: 1,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: NovaBrand.primary.withValues(alpha: 0.25),
                                            blurRadius: 8,
                                            offset: const Offset(0, 3),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Center(
                                  child: Text(
                                    cat,
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                      color: isSelected ? Colors.white : const Color(0xFF475569),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Section Title (TOP PICKS FOR TRAVELERS / Featured Destinations)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TOP PICKS FOR TRAVELERS',
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w900,
                                color: NovaBrand.secondary,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _searchQuery.isNotEmpty || _selectedCategory != 'All'
                                  ? 'All Destinations (${filtered.length})'
                                  : 'Featured Destinations',
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: NovaBrand.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),

              // 2. DESTINATION CARDS LIST (CLICKABLE WITH ALL DETAILS)
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
                            'Try selecting another category or clear your search query.',
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
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
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

  // Destination card styled identically to website
  Widget _buildDestinationCard(Destination dest) {
    final weather = getLiveWeatherTelemetry(dest);
    final imagePath = getBestImage(dest);
    final isFav = _favorites[dest.id] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
        boxShadow: NovaBrand.cardShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _openDestinationDetail(dest),
          splashColor: NovaBrand.secondary.withValues(alpha: 0.1),
          highlightColor: NovaBrand.primary.withValues(alpha: 0.05),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo Header with Badges
              Stack(
                children: [
                  SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: _buildSmartImage(
                      imagePath,
                      fit: BoxFit.cover,
                    ),
                  ),

                  // Deep Gradient Overlay
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.38),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.85),
                          ],
                          stops: const [0.0, 0.45, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Top-Left Live Weather Telemetry Pill
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF020617).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.22), width: 0.8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.35),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Glowing active beacon
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          const Icon(Icons.wb_sunny_rounded, color: NovaBrand.accentAmber, size: 13),
                          const SizedBox(width: 4),
                          Text(
                            '${weather.temp.toStringAsFixed(weather.temp.truncateToDouble() == weather.temp ? 0 : 1)}°C',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFFFDE68A),
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '·',
                            style: GoogleFonts.inter(fontSize: 11, color: Colors.white38),
                          ),
                          const SizedBox(width: 4),
                          ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 130),
                            child: Text(
                              weather.condition,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF99F6E4),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Top-Right Favorite Button
                  Positioned(
                    top: 12,
                    right: 12,
                    child: GestureDetector(
                      onTap: () => _toggleFavorite(dest.id, dest.name),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isFav
                              ? const Color(0xFFF43F5E)
                              : const Color(0xFF0F172A).withValues(alpha: 0.65),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isFav ? const Color(0xFFFDA4AF) : Colors.white30,
                            width: 0.8,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.3),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          size: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),

                  // Bottom Overlay Tags (Category & Budget)
                  Positioned(
                    bottom: 12,
                    left: 14,
                    right: 14,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Category Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF020617).withValues(alpha: 0.75),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFF14B8A6).withValues(alpha: 0.4),
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            dest.category.toUpperCase().replaceAll('_', ' '),
                            style: GoogleFonts.inter(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF5EEAD4),
                              letterSpacing: 0.6,
                            ),
                          ),
                        ),

                        // Budget Pill
                        if (dest.avgBudgetPerDay.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF064E3B).withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: const Color(0xFF10B981).withValues(alpha: 0.4),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              dest.avgBudgetPerDay,
                              style: GoogleFonts.inter(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF6EE7B7),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),

              // Card Details
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Destination Name
                    Text(
                      dest.name,
                      style: GoogleFonts.outfit(
                        fontSize: 19,
                        fontWeight: FontWeight.w900,
                        color: NovaBrand.primary,
                      ),
                    ),
                    const SizedBox(height: 3),

                    // Location Row
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 13, color: NovaBrand.tertiary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '${dest.province} · ${dest.location}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: NovaBrand.slateMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Short Description (2 Lines)
                    Text(
                      dest.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: NovaBrand.slateDark.withValues(alpha: 0.75),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Card Footer: Stay Days & "View Details"
                    Container(
                      padding: const EdgeInsets.only(top: 12),
                      decoration: const BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Color(0xFFF1F5F9), width: 1.2),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Stay duration
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 13, color: NovaBrand.slateMuted),
                              const SizedBox(width: 5),
                              Text(
                                '${dest.recommendedStayDays} Stay',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: NovaBrand.slateMuted,
                                ),
                              ),
                            ],
                          ),

                          // View Details Link
                          Row(
                            children: [
                              Text(
                                'View Details',
                                style: GoogleFonts.outfit(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w800,
                                  color: NovaBrand.secondary,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                size: 14,
                                color: NovaBrand.secondary,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
