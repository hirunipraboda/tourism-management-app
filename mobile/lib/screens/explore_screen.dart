import 'dart:async';
import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'destination_detail_screen.dart';
import 'destinations_screen.dart';

class ExploreScreen extends StatefulWidget {
  final Function(int)? onNavigateTab;

  const ExploreScreen({super.key, this.onNavigateTab});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  late Future<List<Destination>> _destinationsFuture;
  late Future<Map<String, dynamic>> _statsFuture;
  late PageController _heroPageController;
  int _currentHeroIndex = 0;
  Timer? _heroTimer;

  // 1. Hero / Featured Destinations (matching website SRI_LANKA_HERO_DESTINATIONS exactly)
  final List<Map<String, dynamic>> _heroItems = [
    {
      'id': 'hero-galle',
      'name': 'Galle Fort',
      'subtitle': 'Seaside Colonial Citadel & Ramparts',
      'location': 'Galle, Southern Province',
      'category': 'HERITAGE CITADEL',
      'rating': 4.85,
      'imageUrl': 'assets/images/destinations/Galle.jpg',
      'description': 'Wander 16th-century oceanfront ramparts, cobblestone alleys, Dutch colonial mansions, and vibrant artisan cafes overlooking the lighthouse.',
    },
    {
      'id': 'hero-sigiriya',
      'name': 'Sigiriya (Lion Rock)',
      'subtitle': 'Ancient Rock Citadel & Royal Water Gardens',
      'location': 'Matale, Central Province',
      'category': 'ANCIENT MONUMENTS',
      'rating': 4.9,
      'imageUrl': 'assets/images/destinations/sigiriya.jpg',
      'description': 'Ascend the 5th-century Lion Rock fortress to discover ancient frescoes, royal water gardens, and 360° jungle canopy panoramas.',
    },
    {
      'id': 'hero-ella',
      'name': 'Ella & Nine Arch Bridge',
      'subtitle': 'Highland Landscapes & Scenic Rail Trails',
      'location': 'Badulla District, Highlands',
      'category': 'TEA HIGHLANDS',
      'rating': 4.8,
      'imageUrl': 'assets/images/destinations/Ella.jpg',
      'description': 'Ride iconic blue mountain trains through misty tea estates, trek to Little Adam’s Peak, and marvel at the Nine Arch Bridge.',
    },
    {
      'id': 'hero-mirissa',
      'name': 'Mirissa Coast',
      'subtitle': 'Golden Palm Bays & Ocean Safaris',
      'location': 'Matara, Southern Province',
      'category': 'SOUTHERN COAST',
      'rating': 4.9,
      'imageUrl': 'assets/images/destinations/Mirissa.jpg',
      'description': 'Unwind on palm-fringed golden beaches, surf azure Indian Ocean swells, and embark on world-renowned blue whale watching safaris.',
    },
    {
      'id': 'hero-yala',
      'name': 'Yala National Park',
      'subtitle': 'Leopard Sanctuaries & Untamed Wilderness',
      'location': 'Hambantota, Southern Coast',
      'category': 'WILDLIFE SAFARI',
      'rating': 4.92,
      'imageUrl': 'assets/images/destinations/Yala.jpg',
      'description': 'Embark on open-top 4x4 safaris to track wild leopards, Asian elephants, sloth bears, and crocodiles across coastal savannahs.',
    },
    {
      'id': 'hero-kandy',
      'name': 'Kandy',
      'subtitle': 'Sacred Temple & Lakeside Culture',
      'location': 'Central Highlands',
      'category': 'CULTURAL CAPITAL',
      'rating': 4.88,
      'imageUrl': 'assets/images/destinations/Kandy.jpg',
      'description': 'Immerse in Sri Lanka’s cultural heart, home to the sacred Temple of the Tooth Relic, mist-shrouded hills, and serene central lake.',
    },
  ];

  // 2. Interest Categories ("Find What Moves You")
  final List<Map<String, dynamic>> _interestCategories = [
    {
      'icon': '🌿',
      'name': 'Nature',
      'tagline': 'Wild & untamed',
      'filter': 'Nature',
      'color': const Color(0xFF059669),
      'bgColor': const Color(0xFFECFDF5),
    },
    {
      'icon': '🏛️',
      'name': 'Culture',
      'tagline': 'Stories, heritage & traditions',
      'filter': 'Culture',
      'color': const Color(0xFFD97706),
      'bgColor': const Color(0xFFFFFBEB),
    },
    {
      'icon': '🏄',
      'name': 'Adventure',
      'tagline': 'Thrills beyond the ordinary',
      'filter': 'Adventure',
      'color': const Color(0xFF0284C7),
      'bgColor': const Color(0xFFF0F9FF),
    },
    {
      'icon': '🏖️',
      'name': 'Beach',
      'tagline': 'Sun, surf & shores',
      'filter': 'Beach',
      'color': const Color(0xFF0D9488),
      'bgColor': const Color(0xFFF0FDFA),
    },
    {
      'icon': '🍛',
      'name': 'Food',
      'tagline': 'Flavors & street spices',
      'filter': 'Food',
      'color': const Color(0xFFEA580C),
      'bgColor': const Color(0xFFFFF7ED),
    },
    {
      'icon': '🧘',
      'name': 'Wellness',
      'tagline': 'Ayurveda & tranquility',
      'filter': 'Wellness',
      'color': const Color(0xFF7C3AED),
      'bgColor': const Color(0xFFF5F3FF),
    },
  ];

  // 3. Places Worth Discovering Curated Items (matching website assets)
  final List<Map<String, dynamic>> _placesWorthDiscovering = [
    {
      'name': 'Horton Plains',
      'location': 'Central Highlands, Sri Lanka',
      'description': 'Misty cloud forests, rolling highland moors, and the dramatic sheer precipice of World’s End drop.',
      'imageUrl': 'assets/images/destinations/horton_plains.jpg',
      'category': 'Highlands',
      'rating': 4.9,
    },
    {
      'name': 'Nilaveli',
      'location': 'Trincomalee, Sri Lanka',
      'description': 'Pristine white sand bays, turquoise waters, and shallow coral reef snorkeling around Pigeon Island.',
      'imageUrl': 'assets/images/destinations/nilaveli.png',
      'category': 'Beach',
      'rating': 4.85,
    },
    {
      'name': 'Anuradhapura',
      'location': 'North Central Province, Sri Lanka',
      'description': 'Ancient sacred stupas, monastic ruins, and the venerated Jaya Sri Maha Bodhi tree.',
      'imageUrl': 'assets/images/destinations/Anuradhapura.jpg',
      'category': 'Heritage',
      'rating': 4.85,
    },
  ];

  // 5. Why travel with NOVA Feature Cards
  final List<Map<String, dynamic>> _whyNovaFeatures = [
    {
      'icon': Icons.lightbulb_outline_rounded,
      'title': 'AI-Powered Planning',
      'description': 'Creates personalized itineraries quickly.',
      'accent': const Color(0xFF0284C7),
      'bg': const Color(0xFFF0F9FF),
    },
    {
      'icon': Icons.tune_rounded,
      'title': 'Highly Personalized',
      'description': 'Recommendations based on the user\'s travel style.',
      'accent': const Color(0xFF0D9488),
      'bg': const Color(0xFFF0FDFA),
    },
    {
      'icon': Icons.alt_route_rounded,
      'title': 'Smart Routing',
      'description': 'Optimizes travel time and routes.',
      'accent': const Color(0xFF1E40AF),
      'bg': const Color(0xFFEFF6FF),
    },
    {
      'icon': Icons.airplane_ticket_outlined,
      'title': 'Seamless Booking',
      'description': 'Supports booking/reservation functionality.',
      'accent': const Color(0xFFF59E0B),
      'bg': const Color(0xFFFFFBEB),
    },
  ];

  @override
  void initState() {
    super.initState();
    _destinationsFuture = ApiService.getDestinations();
    _statsFuture = ApiService.getPublicStats();
    _heroPageController = PageController(initialPage: 0);

    // Auto-scroll hero carousel gently
    _heroTimer = Timer.periodic(const Duration(seconds: 6), (timer) {
      if (_heroPageController.hasClients) {
        final next = (_currentHeroIndex + 1) % _heroItems.length;
        _heroPageController.animateToPage(
          next,
          duration: const Duration(milliseconds: 650),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _heroTimer?.cancel();
    _heroPageController.dispose();
    super.dispose();
  }

  void _navigateToCatalog([String? category]) {
    if (widget.onNavigateTab != null && category == null) {
      widget.onNavigateTab!(1); // Go to Destinations tab
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => DestinationsScreen(initialCategory: category),
        ),
      );
    }
  }

  void _openDestinationByName(String name, String location, String description, String imageUrl) {
    _destinationsFuture.then((list) {
      final match = list.firstWhere(
        (d) => d.name.toLowerCase().contains(name.toLowerCase().split(' ').first),
        orElse: () => Destination(
          id: name.toLowerCase().replaceAll(' ', '-'),
          name: name,
          slug: name.toLowerCase().replaceAll(' ', '-'),
          location: location,
          category: 'Explore',
          imageUrl: imageUrl,
          description: description,
          rating: 4.85,
          entryFee: 0.0,
          recommendedStayDays: '2 - 3 Days',
          bestTimeToVisit: 'Year-Round',
          liveTemp: 27.0,
        ),
      );
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: match)),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Slogan strip
            _buildBrandStrip(),

            // 1. HERO / FEATURED DESTINATION
            _buildHeroSection(),

            const SizedBox(height: 28),

            // 2. "FIND WHAT MOVES YOU" — INTEREST CATEGORIES
            _buildInterestCategoriesSection(),

            const SizedBox(height: 32),

            // 3. "PLACES WORTH DISCOVERING"
            _buildPlacesWorthDiscoveringSection(),

            const SizedBox(height: 32),

            // 4. TRAVEL STATISTICS (LIVE FROM DATABASE)
            _buildTravelStatisticsSection(),

            const SizedBox(height: 32),

            // 5. "WHY TRAVEL WITH NOVA?"
            _buildWhyNovaSection(),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Top Slogan Strip
  // ---------------------------------------------------------------------------
  Widget _buildBrandStrip() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: NovaBrand.primary,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: NovaBrand.tertiary,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'AI TECH',
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            'SMART JOURNEYS. LASTING MEMORIES.',
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.white.withValues(alpha: 0.95),
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: HERO / FEATURED DESTINATION
  // ---------------------------------------------------------------------------
  Widget _buildHeroSection() {
    return SizedBox(
      height: 440,
      child: Stack(
        children: [
          PageView.builder(
            controller: _heroPageController,
            onPageChanged: (idx) => setState(() => _currentHeroIndex = idx),
            itemCount: _heroItems.length,
            itemBuilder: (context, index) {
              final item = _heroItems[index];
              return _buildHeroSlide(item);
            },
          ),

          // Indicators & Slide counter
          Positioned(
            bottom: 16,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Dots
                Row(
                  children: List.generate(_heroItems.length, (idx) {
                    final isActive = idx == _currentHeroIndex;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(right: 6),
                      width: isActive ? 22 : 7,
                      height: 5,
                      decoration: BoxDecoration(
                        color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    );
                  }),
                ),

                // Slide count
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.55),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 0.8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    '${_currentHeroIndex + 1} / ${_heroItems.length}',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
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

  Widget _buildSmartImage(String path, {BoxFit fit = BoxFit.cover, double? width, double? height}) {
    if (path.startsWith('assets/')) {
      return Image.asset(
        path,
        fit: fit,
        width: width,
        height: height,
        errorBuilder: (context, error, stackTrace) {
          debugPrint('[ExploreScreen] Asset image load failed for $path: $error');
          return Container(color: NovaBrand.primary);
        },
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

  Widget _buildHeroSlide(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.black.withValues(alpha: 0.08), width: 1),
        boxShadow: NovaBrand.heroFloatingShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Large featured destination image
          _buildSmartImage(
            item['imageUrl'],
            fit: BoxFit.cover,
          ),

          // Deep gradient overlay for text readability
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.15),
                  Colors.black.withValues(alpha: 0.4),
                  Colors.black.withValues(alpha: 0.9),
                ],
                stops: const [0.0, 0.45, 1.0],
              ),
            ),
          ),

          // Top badges: Category & Rating
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5.5),
                  decoration: BoxDecoration(
                    color: NovaBrand.tertiary,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Text(
                    item['category'],
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.6,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 0.8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        '${item['rating']}',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Slide Details + Both Buttons
          Positioned(
            bottom: 34,
            left: 18,
            right: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Location
                Row(
                  children: [
                    const Icon(Icons.location_on, color: NovaBrand.tertiary, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      item['location'],
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),

                // Destination Name
                Text(
                  item['name'],
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 6),

                // Short description
                Text(
                  item['description'],
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    color: Colors.white.withValues(alpha: 0.8),
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 14),

                // Both Action Buttons: Explore & View All Places
                Row(
                  children: [
                    // Explore button
                    Expanded(
                      flex: 5,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          _openDestinationByName(
                            item['name'],
                            item['location'],
                            item['description'],
                            item['imageUrl'],
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NovaBrand.tertiary,
                          foregroundColor: Colors.white,
                          elevation: 4,
                          shadowColor: NovaBrand.tertiary.withValues(alpha: 0.5),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Icons.explore_outlined, size: 16),
                        label: Text(
                          'Explore',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // View All Places button
                    Expanded(
                      flex: 6,
                      child: OutlinedButton.icon(
                        onPressed: () => _navigateToCatalog(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white, width: 1.2),
                          backgroundColor: Colors.white.withValues(alpha: 0.16),
                          elevation: 2,
                          shadowColor: Colors.black.withValues(alpha: 0.25),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Icons.grid_view_rounded, size: 15),
                        label: Text(
                          'View All Places',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: “FIND WHAT MOVES YOU” — INTEREST CATEGORIES
  // ---------------------------------------------------------------------------
  Widget _buildInterestCategoriesSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Find What Moves You',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: NovaBrand.primary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Filter by your favorite travel vibes & passions',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: NovaBrand.slateMuted,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => _navigateToCatalog(),
                child: Text(
                  'See all',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: NovaBrand.secondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Horizontally scrollable category cards
          SizedBox(
            height: 124,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(2, 4, 2, 8),
              scrollDirection: Axis.horizontal,
              itemCount: _interestCategories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final cat = _interestCategories[index];
                return GestureDetector(
                  onTap: () => _navigateToCatalog(cat['filter']),
                  child: Container(
                    width: 160,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                      boxShadow: NovaBrand.floatingShadow,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: cat['bgColor'],
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: (cat['color'] as Color).withValues(alpha: 0.25),
                                  width: 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: (cat['color'] as Color).withValues(alpha: 0.18),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(cat['icon'], style: const TextStyle(fontSize: 18)),
                              ),
                            ),
                            Icon(Icons.arrow_forward, size: 14, color: cat['color']),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              cat['name'],
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: NovaBrand.primary,
                              ),
                            ),
                            Text(
                              cat['tagline'],
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                color: NovaBrand.slateMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION 3: “PLACES WORTH DISCOVERING”
  // ---------------------------------------------------------------------------
  Widget _buildPlacesWorthDiscoveringSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Places Worth Discovering',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: NovaBrand.primary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Unmissable gems across Sri Lanka',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: NovaBrand.slateMuted,
                    ),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: () => _navigateToCatalog(),
                icon: const Icon(Icons.menu_book_rounded, size: 15, color: NovaBrand.secondary),
                label: Text(
                  'View Catalog',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: NovaBrand.secondary,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Horizontal Swipe Cards for Horton Plains, Nilaveli, Anuradhapura + Catalog CTA
        SizedBox(
          height: 304,
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            scrollDirection: Axis.horizontal,
            itemCount: _placesWorthDiscovering.length + 1,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              if (index < _placesWorthDiscovering.length) {
                final place = _placesWorthDiscovering[index];
                return _buildDiscoveringCard(place);
              } else {
                // Trailing "View Catalog" card
                return _buildViewCatalogCard();
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDiscoveringCard(Map<String, dynamic> place) {
    return GestureDetector(
      onTap: () {
        _openDestinationByName(
          place['name'],
          place['location'],
          place['description'],
          place['imageUrl'],
        );
      },
      child: Container(
        width: 250,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
          boxShadow: NovaBrand.floatingShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Destination image
            Stack(
              children: [
                SizedBox(
                  height: 145,
                  width: double.infinity,
                  child: _buildSmartImage(
                    place['imageUrl'],
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 0.8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 12),
                        const SizedBox(width: 3),
                        Text(
                          '${place['rating']}',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Card details
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Destination name
                  Text(
                    place['name'],
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: NovaBrand.primary,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // Country / location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 12, color: NovaBrand.tertiary),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          place['location'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: NovaBrand.slateMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Short description
                  Text(
                    place['description'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: NovaBrand.slateDark.withValues(alpha: 0.75),
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // → arrow
                  Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: NovaBrand.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Explore',
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: NovaBrand.primary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_forward_rounded, size: 13, color: NovaBrand.primary),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildViewCatalogCard() {
    return GestureDetector(
      onTap: () => _navigateToCatalog(),
      child: Container(
        width: 170,
        decoration: BoxDecoration(
          gradient: NovaBrand.heroGradient,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white.withValues(alpha: 0.22), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0B3A53).withValues(alpha: 0.28),
              blurRadius: 22,
              spreadRadius: -1,
              offset: const Offset(0, 10),
            ),
            BoxShadow(
              color: NovaBrand.tertiary.withValues(alpha: 0.22),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.explore_rounded, color: Colors.white, size: 26),
            ),
            const SizedBox(height: 14),
            Text(
              'Explore More',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Browse complete island destinations catalog',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 11,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: NovaBrand.tertiary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'View Catalog',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_forward, size: 12, color: Colors.white),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: TRAVEL STATISTICS (LIVE FROM DATABASE)
  // ---------------------------------------------------------------------------
  Widget _buildTravelStatisticsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: FutureBuilder<Map<String, dynamic>>(
        future: _statsFuture,
        builder: (context, snapshot) {
          final stats = snapshot.data ?? {
            'totalUsers': 28,
            'totalTrips': 8,
            'satisfactionRate': 99.4,
          };

          final totalUsers = stats['totalUsers'] ?? 28;
          final totalTrips = stats['totalTrips'] ?? 8;
          final satisfactionRate = stats['satisfactionRate'] ?? 99.4;

          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF0B3A53),
                  Color(0xFF146C86),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withValues(alpha: 0.18), width: 1.2),
              boxShadow: NovaBrand.heroFloatingShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Live Platform Impact',
                      style: GoogleFonts.outfit(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: NovaBrand.tertiary.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: NovaBrand.tertiary.withValues(alpha: 0.6)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF4ADE80),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'Live Database',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // 3-Card horizontal layout
                Row(
                  children: [
                    Expanded(
                      child: _buildStatTile(
                        value: '$totalUsers+',
                        label: 'Active Global\nUsers',
                        icon: Icons.people_outline_rounded,
                        accent: const Color(0xFF38BDF8),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildStatTile(
                        value: '$totalTrips+',
                        label: 'Trips\nPlanned',
                        icon: Icons.map_outlined,
                        accent: const Color(0xFF34D399),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildStatTile(
                        value: '$satisfactionRate%',
                        label: 'Traveler\nSatisfaction',
                        icon: Icons.star_rounded,
                        accent: const Color(0xFFFBBF24),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatTile({
    required String value,
    required String label,
    required IconData icon,
    required Color accent,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.22), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: accent, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: Colors.white70,
              fontWeight: FontWeight.w500,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: “WHY TRAVEL WITH NOVA?”
  // ---------------------------------------------------------------------------
  Widget _buildWhyNovaSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Why travel with NOVA?',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: NovaBrand.primary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Next-generation smart travel architecture for Sri Lanka',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: NovaBrand.slateMuted,
            ),
          ),
          const SizedBox(height: 14),

          // Vertical list of 4 cards
          Column(
            children: List.generate(_whyNovaFeatures.length, (index) {
              final feature = _whyNovaFeatures[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                  boxShadow: NovaBrand.floatingShadow,
                ),
                child: Row(
                  children: [
                    // Icon container with accent tint
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: feature['bg'],
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: (feature['accent'] as Color).withValues(alpha: 0.22),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: (feature['accent'] as Color).withValues(alpha: 0.14),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        feature['icon'],
                        color: feature['accent'],
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),

                    // Title & Description
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            feature['title'],
                            style: GoogleFonts.outfit(
                              fontSize: 15.5,
                              fontWeight: FontWeight.w800,
                              color: NovaBrand.primary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            feature['description'],
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              color: NovaBrand.slateMuted,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(
                      Icons.check_circle_outline_rounded,
                      color: feature['accent'],
                      size: 20,
                    ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
