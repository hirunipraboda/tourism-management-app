import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/payment_receipt_models.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../widgets/nova_guide_floating_bot.dart';
import '../widgets/nova_guide_modal.dart';
import '../widgets/travel_bot_avatar.dart';
import 'guide_management_screen.dart';

class ToursScreen extends StatefulWidget {
  const ToursScreen({super.key});

  @override
  State<ToursScreen> createState() => _ToursScreenState();
}

class _ToursScreenState extends State<ToursScreen> {
  late Future<List<TourPackage>> _toursFuture;
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _packagesKey = GlobalKey();

  String _selectedDestination = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _destinations = [
    'All',
    'Kandy',
    'Ella',
    'Sigiriya',
    'Galle',
    'Nuwara Eliya',
    'Yala',
    'Mirissa',
    'Colombo',
  ];

  // Complete Sri Lanka travel packages catalog matching the website dataset
  static final List<TourPackage> _catalogPackages = [
    TourPackage(
      id: 'pkg-sri-lanka-highlights',
      name: 'Sri Lanka Highlights',
      destinations: 'Colombo · Kandy · Ella · Galle',
      durationDays: 7,
      durationNights: 6,
      price: 480,
      currency: 'USD',
      groupSize: '2–8 travelers',
      travelStyle: 'Culture · Nature · Coastal',
      coverImage: 'assets/images/destinations/sigiriya.jpg',
      inclusions: 'Accommodation, Private AC Vehicle, Cultural Guide, All Permits, Daily Breakfast',
      transportType: 'Private Luxury SUV with Chauffeur',
      rating: 4.95,
      itineraries: [
        {
          'day': 1,
          'title': 'Arrival & Colombo Coastal Walk',
          'morning': 'Airport arrival & private hotel transfer',
          'afternoon': 'Colombo Fort colonial architecture walk',
          'evening': 'Galle Face Green seaside sunset & street food'
        },
        {
          'day': 2,
          'title': 'Culture & Sacred Kandy Temple',
          'morning': 'Scenic drive to Kandy via Kadugannawa Pass',
          'afternoon': 'Temple of the Sacred Tooth Relic tour',
          'evening': 'Kandyan cultural drumming & dance show'
        },
        {
          'day': 3,
          'title': 'Royal Botanical Gardens & Tea Estate',
          'morning': 'Peradeniya Royal Botanical Gardens stroll',
          'afternoon': 'Giragama Tea Factory plucking & tasting flight',
          'evening': 'Lakeside dinner overlooking Kandy Lake'
        },
        {
          'day': 4,
          'title': 'Highland Train & Nine Arch Bridge',
          'morning': 'Kandy to Ella scenic blue observation train',
          'afternoon': 'Nine Arch Bridge colonial viaduct photography',
          'evening': 'Relaxed mountain dining at Cafe Chill'
        },
        {
          'day': 5,
          'title': 'Southern Coast & Galle Fort Ramparts',
          'morning': 'Scenic descent to Southern Coast',
          'afternoon': 'Galle Dutch Fort cobblestone ramparts tour',
          'evening': 'White lighthouse cliff sunset & artisan shopping'
        },
        {
          'day': 6,
          'title': 'Mirissa Palm Cove & Ocean Breeze',
          'morning': 'Coconut Tree Hill palm cove photography',
          'afternoon': 'Oceanfront fresh seafood lunch on Mirissa beach',
          'evening': 'Beachside campfire & evening relaxation'
        },
        {
          'day': 7,
          'title': 'Final Morning & Departure',
          'morning': 'Breakfast & Ceylon spices market stop',
          'afternoon': 'Express highway transfer to Colombo Airport',
          'evening': 'Departure flight with unforgettable memories'
        },
      ],
    ),
    TourPackage(
      id: 'pkg-hill-country-escape',
      name: 'Hill Country Escape',
      destinations: 'Kandy · Nuwara Eliya · Ella',
      durationDays: 4,
      durationNights: 3,
      price: 260,
      currency: 'USD',
      groupSize: '2–4 travelers',
      travelStyle: 'Nature · Hiking · Relaxation',
      coverImage: 'assets/images/destinations/Ella.jpg',
      inclusions: 'Boutique Tea Bungalow Stay, Observation Train Tickets, Tea Tasting, Guided Trek',
      transportType: 'Private SUV / Mountain Van',
      rating: 4.92,
      itineraries: [
        {
          'day': 1,
          'title': 'Kandy to Nuwara Eliya Highlands',
          'morning': 'Scenic drive through Ramboda Waterfalls',
          'afternoon': 'Pedro Tea Estate tour & tasting',
          'evening': 'Cozy fireplace dinner in Little England'
        },
        {
          'day': 2,
          'title': 'Observation Train to Ella',
          'morning': 'Board classic blue train to Ella',
          'afternoon': 'Nine Arch Bridge photography',
          'evening': 'Charming Ella mountain town dinner'
        },
        {
          'day': 3,
          'title': 'Little Adam’s Peak & Ravana Falls',
          'morning': 'Sunrise trek up Little Adam’s Peak',
          'afternoon': 'Ravana Falls natural pool dip',
          'evening': 'Highland bungalow sunset cocktails'
        },
        {
          'day': 4,
          'title': 'Highland Departure',
          'morning': 'Breakfast overlooking tea valleys',
          'afternoon': 'Return transfer to Colombo / Airport',
          'evening': 'Departure'
        },
      ],
    ),
    TourPackage(
      id: 'pkg-southern-coast-journey',
      name: 'Southern Coast Journey',
      destinations: 'Galle · Mirissa · Unawatuna',
      durationDays: 5,
      durationNights: 4,
      price: 310,
      currency: 'USD',
      groupSize: '2–6 travelers',
      travelStyle: 'Beach · Heritage · Wildlife',
      coverImage: 'assets/images/destinations/Galle.jpg',
      inclusions: 'Beachfront Resort Stay, Galle Fort Tour, Mirissa Catamaran Charter, Daily Breakfast',
      transportType: 'Private AC Chauffeur Sedan',
      rating: 4.88,
      itineraries: [
        {
          'day': 1,
          'title': 'Arrival in Galle Dutch Fort',
          'morning': 'Express transfer to Galle Fort',
          'afternoon': 'Check in boutique colonial hotel',
          'evening': 'Ramparts sunset stroll'
        },
        {
          'day': 2,
          'title': 'Heritage & Artisan Dining',
          'morning': 'Guided cobblestone fort history walk',
          'afternoon': 'Artisanal gem & gelato tasting',
          'evening': 'Seafood dinner inside ancient ramparts'
        },
        {
          'day': 3,
          'title': 'Mirissa Blue Whale Safari',
          'morning': 'Early catamaran ocean charter',
          'afternoon': 'Coconut Tree Hill photography',
          'evening': 'Sunset beach lounge'
        },
        {
          'day': 4,
          'title': 'Unawatuna Jungle Beach',
          'morning': 'Jungle beach secluded cove swim',
          'afternoon': 'Japanese Peace Pagoda view',
          'evening': 'Beachfront barbecue dinner'
        },
        {
          'day': 5,
          'title': 'Coastal Farewell',
          'morning': 'Morning ocean dip & breakfast',
          'afternoon': 'Express highway return transfer',
          'evening': 'Departure'
        },
      ],
    ),
    TourPackage(
      id: 'pkg-wild-safari-adventure',
      name: 'Wild Safari Adventure',
      destinations: 'Yala · Udawalawe · Bundala',
      durationDays: 4,
      durationNights: 3,
      price: 350,
      currency: 'USD',
      groupSize: '2–6 travelers',
      travelStyle: 'Wildlife · Safari · Conservation',
      coverImage: 'assets/images/destinations/Yala.jpg',
      inclusions: 'Luxury Tented Camp, 4x4 Custom Safari Jeeps, Park Tracker & Guide, All Permits',
      transportType: 'Custom 4x4 Open-Roof Safari Jeep',
      rating: 4.94,
      itineraries: [
        {
          'day': 1,
          'title': 'Udawalawe Elephant Sanctuary',
          'morning': 'Transfer to Udawalawe National Park',
          'afternoon': 'Elephant Transit Home feeding & afternoon game drive',
          'evening': 'Campfire dinner under the stars'
        },
        {
          'day': 2,
          'title': 'Yala Leopard Tracking Safari',
          'morning': 'Dawn safari drive in Block 1 for Sri Lankan leopard',
          'afternoon': 'Rest at luxury jungle safari lodge',
          'evening': 'Dusk safari for sloth bears and wild elephants'
        },
        {
          'day': 3,
          'title': 'Bundala Wetlands & Migratory Birds',
          'morning': 'Wetland lagoon birdwatching tour',
          'afternoon': 'Kirinda ancient coastal shrine visit',
          'evening': 'Bush dinner with barbecue'
        },
        {
          'day': 4,
          'title': 'Return Journey',
          'morning': 'Final morning game drive',
          'afternoon': 'Transfer to Colombo / Southern coast',
          'evening': 'Departure'
        },
      ],
    ),
    TourPackage(
      id: 'pkg-ancient-kingdoms',
      name: 'Ancient Kingdoms Odyssey',
      destinations: 'Sigiriya · Anuradhapura · Polonnaruwa',
      durationDays: 5,
      durationNights: 4,
      price: 380,
      currency: 'USD',
      groupSize: '2–8 travelers',
      travelStyle: 'UNESCO Heritage · History · Archaeology',
      coverImage: 'assets/images/destinations/Anuradhapura.jpg',
      inclusions: 'Heritage Hotel Stays, UNESCO Entry Passes, Historian Guide, Bicycle Rentals',
      transportType: 'Private AC Mini-Coach / Van',
      rating: 4.90,
      itineraries: [
        {
          'day': 1,
          'title': 'Sigiriya Lion Rock Citadel',
          'morning': 'Transfer to Cultural Triangle',
          'afternoon': 'Climb Sigiriya 5th-century sky fortress',
          'evening': 'Sunset view of Pidurangala Rock'
        },
        {
          'day': 2,
          'title': 'Polonnaruwa Medieval Capital',
          'morning': 'Cycling tour through Royal Palace ruins',
          'afternoon': 'Gal Vihara colossal rock Buddha statues',
          'evening': 'Parakrama Samudra reservoir breeze'
        },
        {
          'day': 3,
          'title': 'Sacred City of Anuradhapura',
          'morning': 'Pilgrimage to Jaya Sri Maha Bodhi tree',
          'afternoon': 'Ruwanwelisaya and Jetavanaramaya white stupas',
          'evening': 'Twin Ponds (Kuttam Pokuna) monastic visit'
        },
        {
          'day': 4,
          'title': 'Dambulla Golden Cave Temple',
          'morning': 'Cave monastery with 150+ gilded Buddha statues',
          'afternoon': 'Traditional bullock cart village lunch',
          'evening': 'Ayurvedic herbal massage'
        },
        {
          'day': 5,
          'title': 'Return Transfer',
          'morning': 'Breakfast & spice garden exploration',
          'afternoon': 'Transfer to airport / next destination',
          'evening': 'Departure'
        },
      ],
    ),
    TourPackage(
      id: 'pkg-kandy-cultural-escape',
      name: 'Kandy Cultural Escape',
      destinations: 'Kandy · Peradeniya · Pinnawala',
      durationDays: 3,
      durationNights: 2,
      price: 190,
      currency: 'USD',
      groupSize: '2–6 travelers',
      travelStyle: 'Culture · Royal History',
      coverImage: 'assets/images/destinations/Kandy.jpg',
      inclusions: 'Hilltop Resort Stay, Temple Tickets, Cultural Show Passes, Chauffeur Guide',
      transportType: 'Private AC Chauffeur Vehicle',
      rating: 4.86,
      itineraries: [
        {
          'day': 1,
          'title': 'Kandy Arrival & Royal Lake',
          'morning': 'Scenic drive through tropical hills',
          'afternoon': 'Kandy Lake promenade and British Garrison cemetery',
          'evening': 'Kandyan Fire Dance Performance'
        },
        {
          'day': 2,
          'title': 'Temple of the Tooth & Peradeniya',
          'morning': 'Morning puja at Sri Dalada Maligawa',
          'afternoon': 'Royal Botanical Gardens Orchid House',
          'evening': 'Panoramic viewpoint at Bahirawakanda Buddha'
        },
        {
          'day': 3,
          'title': 'Pinnawala & Return',
          'morning': 'Pinnawala Elephant river bathing',
          'afternoon': 'Ceylon tea tasting flight & return transfer',
          'evening': 'Departure'
        },
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _toursFuture = _loadPackages();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<List<TourPackage>> _loadPackages() async {
    try {
      final liveTours = await ApiService.getTourPackages();
      if (liveTours.isNotEmpty) {
        final existingNames = liveTours.map((t) => t.name.toLowerCase()).toSet();
        final nonDup = _catalogPackages.where((p) => !existingNames.contains(p.name.toLowerCase())).toList();
        return [...liveTours, ...nonDup];
      }
    } catch (_) {}
    return _catalogPackages;
  }

  void _scrollToPackages() {
    final context = _packagesKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 700),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  void _openGuideChat() {
    NovaGuideModal.show(context);
  }

  String _resolvePackageImage(TourPackage pkg) {
    if (pkg.coverImage.startsWith('assets/')) return pkg.coverImage;
    final lower = ('${pkg.name} ${pkg.destinations}').toLowerCase();
    if (lower.contains('yala') || lower.contains('safari') || lower.contains('wild')) {
      return 'assets/images/destinations/Yala.jpg';
    } else if (lower.contains('galle') || lower.contains('mirissa') || lower.contains('beach') || lower.contains('ocean') || lower.contains('coast')) {
      return 'assets/images/destinations/Galle.jpg';
    } else if (lower.contains('kandy')) {
      return 'assets/images/destinations/Kandy.jpg';
    } else if (lower.contains('ella') || lower.contains('mountain') || lower.contains('train')) {
      return 'assets/images/destinations/Ella.jpg';
    } else if (lower.contains('sigiriya') || lower.contains('rock')) {
      return 'assets/images/destinations/sigiriya.jpg';
    } else if (lower.contains('anuradhapura') || lower.contains('kingdom') || lower.contains('temple')) {
      return 'assets/images/destinations/Anuradhapura.jpg';
    }
    return pkg.coverImage;
  }

  Widget _buildSmartImage(String path, {double? width, double? height, BoxFit fit = BoxFit.cover}) {
    if (path.startsWith('assets/')) {
      return Image.asset(
        path,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => _buildFallbackImage(width, height),
      );
    }
    return Image.network(
      path,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, __, ___) => Image.asset(
        'assets/images/destinations/sigiriya.jpg',
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => _buildFallbackImage(width, height),
      ),
    );
  }

  Widget _buildFallbackImage(double? w, double? h) {
    return Container(
      width: w,
      height: h,
      color: const Color(0xFF0B3A53),
      child: const Center(
        child: Icon(Icons.landscape_rounded, color: Colors.white30, size: 36),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          // Main Scrollable Tour & Guide Content
          FutureBuilder<List<TourPackage>>(
            future: _toursFuture,
            builder: (context, snapshot) {
              final allPackages = snapshot.data ?? _catalogPackages;

              final filteredPackages = allPackages.where((pkg) {
                final matchesDest = _selectedDestination == 'All' ||
                    pkg.destinations.toLowerCase().contains(_selectedDestination.toLowerCase()) ||
                    pkg.name.toLowerCase().contains(_selectedDestination.toLowerCase());

                final query = _searchQuery.toLowerCase().trim();
                final matchesQuery = query.isEmpty ||
                    pkg.name.toLowerCase().contains(query) ||
                    pkg.destinations.toLowerCase().contains(query) ||
                    pkg.travelStyle.toLowerCase().contains(query);

                return matchesDest && matchesQuery;
              }).toList();

              return SingleChildScrollView(
                controller: _scrollController,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 1. HERO SECTION (MATCHING WEBSITE EXACTLY)
                    _buildHeroSection(),

                    // 2. MEET NOVA GUIDE SECTION
                    _buildMeetNovaGuideSection(),

                    // 3. AI GUIDE CAPABILITIES SECTION
                    _buildCapabilitiesSection(),

                    // 4. AI GUIDE PRICING PLANS SECTION
                    _buildPricingPlansSection(),

                    // 5. TRAVEL PACKAGES SECTION (TARGET FOR CTA)
                    Container(key: _packagesKey, child: _buildPackagesSection(filteredPackages)),

                    // 6. TRANSPORT PARTNER (PICKME) SECTION
                    _buildTransportPartnerSection(),

                    // Padding for bottom floating elements
                    const SizedBox(height: 90),
                  ],
                ),
              );
            },
          ),

          // 7. FLOATING BOT WIDGET (SAME AS IN TOUR & GUIDE WEBSITE)
          Positioned(
            right: 16,
            bottom: 20,
            child: SafeArea(
              child: NovaGuideFloatingBot(
                onTap: _openGuideChat,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 1. HERO SECTION
  // ==========================================
  Widget _buildHeroSection() {
    return Stack(
      children: [
        // Background Panorama Image
        SizedBox(
          height: 380,
          width: double.infinity,
          child: _buildSmartImage(
            'assets/images/destinations/Sri_lanka_beauty.jpg',
            fit: BoxFit.cover,
          ),
        ),

        // Deep Gradient Scrim Overlay for contrast
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  const Color(0xFF020617).withValues(alpha: 0.65),
                  const Color(0xFF0B3A53).withValues(alpha: 0.45),
                  const Color(0xFF020617).withValues(alpha: 0.85),
                ],
              ),
            ),
          ),
        ),

        // Hero Content
        Positioned.fill(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Headline with Teal/Cyan Gradient
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: GoogleFonts.outfit(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.15,
                      letterSpacing: -0.5,
                      shadows: const [
                        Shadow(color: Colors.black87, blurRadius: 16, offset: Offset(0, 4)),
                      ],
                    ),
                    children: const [
                      TextSpan(text: 'Travel Better. '),
                      TextSpan(
                        text: 'Explore Smarter.',
                        style: TextStyle(
                          color: Color(0xFF2DD4BF),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Subtitle
                Text(
                  'Discover carefully planned travel packages and get instant help from your personal NOVA AI Guide.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 13.5,
                    color: const Color(0xFFF1F5F9),
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                    shadows: const [
                      Shadow(color: Colors.black87, blurRadius: 10, offset: Offset(0, 2)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // CTA Buttons
                Column(
                  children: [
                    // Primary Teal CTA
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _scrollToPackages,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF14B8A6),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 6,
                          shadowColor: const Color(0xFF14B8A6).withValues(alpha: 0.5),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Explore Travel Packages',
                              style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward_rounded, size: 16),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Secondary Dark CTA: Talk to NOVA Guide
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _openGuideChat,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A).withValues(alpha: 0.65),
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white38, width: 1.2),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.explore_outlined, size: 17, color: Color(0xFF5EEAD4)),
                            const SizedBox(width: 8),
                            Text(
                              'Talk to NOVA Guide',
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Tertiary CTA: Licensed Guides & Availability Dispatch
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const GuideManagementScreen()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF146C86),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.badge_outlined, size: 17, color: Color(0xFF5EEAD4)),
                            const SizedBox(width: 8),
                            Text(
                              'Licensed Guides & Availability',
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.arrow_forward_rounded, size: 15, color: Colors.white70),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ==========================================
  // 2. MEET NOVA GUIDE SECTION
  // ==========================================
  Widget _buildMeetNovaGuideSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0B3A53),
              Color(0xFF146C86),
              Color(0xFF0B3A53),
            ],
          ),
          borderRadius: BorderRadius.circular(26),
          border: Border.all(
            color: const Color(0xFF14B8A6).withValues(alpha: 0.35),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0B3A53).withValues(alpha: 0.25),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        padding: const EdgeInsets.all(22),
        child: Column(
          children: [
            // Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 4.5),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white24),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.explore, size: 13, color: Color(0xFF5EEAD4)),
                  const SizedBox(width: 6),
                  Text(
                    'AI TRAVEL COMPANION',
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF5EEAD4),
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Title
            Text(
              'Meet NOVA Guide',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),

            // Description
            Text(
              'Your journey, guided by NOVA. Discover hidden gems, understand what you see, and get instant answers wherever your adventure takes you.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.5,
                color: const Color(0xFFE2E8F0),
                height: 1.45,
              ),
            ),
            const SizedBox(height: 18),

            // Cute Bot Character Graphic
            GestureDetector(
              onTap: _openGuideChat,
              child: Column(
                children: [
                  const TravelBotAvatar(size: 110, showOnlineBadge: true),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFF14B8A6),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF14B8A6).withValues(alpha: 0.45),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Chat with NOVA Guide 💬',
                          style: GoogleFonts.outfit(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
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
    );
  }

  // ==========================================
  // 3. CAPABILITIES SECTION
  // ==========================================
  Widget _buildCapabilitiesSection() {
    final capabilities = [
      {
        'icon': Icons.camera_alt_rounded,
        'title': 'Understand What You See',
        'desc': 'Upload photos of temples, stupas, Ceylon tea varieties, or colonial architecture for historical analysis.',
      },
      {
        'icon': Icons.chat_bubble_outline_rounded,
        'title': 'Ask Anything',
        'desc': 'Inquire about cultural etiquette, entry tickets, seasonal weather windows, and train observation reservations.',
      },
      {
        'icon': Icons.explore_outlined,
        'title': 'Discover Experiences',
        'desc': 'Locate hidden mountain waterfalls, secluded surf points, spice gardens, and authentic artisan markets.',
      },
      {
        'icon': Icons.calendar_today_rounded,
        'title': 'Build Your Day',
        'desc': 'Generate custom hourly itineraries tailored to your pace, travel style, and morning departure times.',
      },
      {
        'icon': Icons.attach_money_rounded,
        'title': 'Travel Within Budget',
        'desc': 'Smart price guidance for private AC vehicles, boutique stays, safari park trackers, and dining.',
      },
      {
        'icon': Icons.public_rounded,
        'title': 'Learn Local Culture',
        'desc': 'Learn ancient Sri Lankan kingdoms, Kandyan drumming traditions, and authentic culinary secrets.',
      },
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Column(
        children: [
          Text(
            'INTRODUCING',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF14B8A6),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Your Travel Companion, Wherever You Go',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 21,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF0B3A53),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'From identifying ancient citadels to recommending street food, NOVA Guide is ready 24/7.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),

          // 2-Column Grid of Capabilities
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: capabilities.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.88,
            ),
            itemBuilder: (context, index) {
              final c = capabilities[index];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B3A53),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(c['icon'] as IconData, size: 20, color: const Color(0xFF14B8A6)),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      c['title'] as String,
                      style: GoogleFonts.outfit(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      c['desc'] as String,
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        color: const Color(0xFF64748B),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 4. PRICING PLANS SECTION
  // ==========================================
  Widget _buildPricingPlansSection() {
    final plans = [
      {
        'id': 'free',
        'name': 'FREE',
        'price': '\$0',
        'period': 'Forever Free',
        'isPopular': false,
        'features': ['10 AI questions/mo', '3 image uploads/mo', 'Basic destination info', 'Standard recommendations'],
      },
      {
        'id': 'guide',
        'name': 'AI GUIDE',
        'price': '\$4.99',
        'period': '/ week',
        'isPopular': false,
        'features': ['50 AI questions', '10 image analyses', 'Food recognition', 'Landmark tips', 'Itinerary ideas'],
      },
      {
        'id': 'explorer',
        'name': 'AI EXPLORER',
        'price': '\$9.99',
        'period': '/ week',
        'isPopular': true,
        'features': ['150 AI questions', '40 image analyses', 'Personalized itineraries', 'Budget planning', 'Transportation guidance'],
      },
      {
        'id': 'traveler',
        'name': 'AI TRAVELER',
        'price': '\$19.99',
        'period': '/ month',
        'isPopular': false,
        'features': ['500 AI questions', '150 image analyses', 'Advanced itineraries', 'Multi-destination planning', 'Saved chats'],
      },
      {
        'id': 'wanderer',
        'name': 'AI WANDERER',
        'price': '\$34.99',
        'period': '/ month',
        'isPopular': false,
        'features': ['Unlimited AI chats', '500 image analyses', 'Priority responses', 'VIP trip planning', 'Offline cache'],
      },
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Column(
        children: [
          Text(
            'FLEXIBLE PLANS',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF14B8A6),
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Choose Your NOVA Guide Plan',
            style: GoogleFonts.outfit(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF0B3A53),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Get more from your personal AI travel companion.',
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),

          // Horizontal scroll of pricing cards
          SizedBox(
            height: 270,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: plans.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final p = plans[index];
                final isPop = p['isPopular'] == true;

                return Container(
                  width: 200,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isPop ? const Color(0xFF0B3A53) : Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: isPop ? const Color(0xFF14B8A6) : const Color(0xFFE2E8F0),
                      width: isPop ? 2.0 : 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isPop
                            ? const Color(0xFF14B8A6).withValues(alpha: 0.25)
                            : Colors.black.withValues(alpha: 0.04),
                        blurRadius: isPop ? 14 : 6,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (isPop)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              margin: const EdgeInsets.only(bottom: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF14B8A6),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'MOST POPULAR',
                                style: GoogleFonts.inter(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          Text(
                            p['name'] as String,
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: isPop ? Colors.white : const Color(0xFF0B3A53),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                p['price'] as String,
                                style: GoogleFonts.outfit(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900,
                                  color: isPop ? const Color(0xFF5EEAD4) : const Color(0xFF0B3A53),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                p['period'] as String,
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: isPop ? Colors.white60 : const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ...(p['features'] as List<String>).take(3).map(
                                (f) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.check_circle_rounded,
                                        size: 13,
                                        color: isPop ? const Color(0xFF2DD4BF) : const Color(0xFF14B8A6),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          f,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.inter(
                                            fontSize: 10,
                                            color: isPop ? Colors.white70 : const Color(0xFF475569),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                        ],
                      ),

                      // Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Selected ${p['name']} plan!'),
                                backgroundColor: const Color(0xFF0B3A53),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isPop ? const Color(0xFF14B8A6) : const Color(0xFFF1F5F9),
                            foregroundColor: isPop ? Colors.white : const Color(0xFF0B3A53),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            isPop ? 'Choose Explorer' : 'Select Plan',
                            style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // 5. TRAVEL PACKAGES SECTION
  // ==========================================
  Widget _buildPackagesSection(List<TourPackage> packages) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Travel Packages',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                    Text(
                      'Ready-made journeys with certified guides & private transport',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(fontSize: 11.5, color: const Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B3A53).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  '${packages.length} Packages',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF0B3A53)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Search Bar
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: GoogleFonts.inter(fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search packages by name or destination...',
                hintStyle: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF14B8A6)),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Destination Filter Chips
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _destinations.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final d = _destinations[index];
                final isSelected = _selectedDestination == d;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDestination = d),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF0B3A53) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF0B3A53) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        d,
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
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

          // Package Cards List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: packages.length,
            itemBuilder: (context, index) {
              final pkg = packages[index];
              return _buildPackageCard(pkg);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(TourPackage pkg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _openPackageDetailsModal(pkg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo Header with Duration Pill
              Stack(
                children: [
                  SizedBox(
                    height: 180,
                    width: double.infinity,
                    child: _buildSmartImage(_resolvePackageImage(pkg), fit: BoxFit.cover),
                  ),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.3),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.8),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Duration Pill (top-left)
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white30, width: 0.8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.schedule, size: 12, color: Color(0xFF5EEAD4)),
                          const SizedBox(width: 4),
                          Text(
                            '${pkg.durationDays} Days / ${pkg.durationNights} Nights',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Rating Pill (top-right)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white30, width: 0.8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 14, color: Color(0xFFFBBF24)),
                          const SizedBox(width: 3),
                          Text(
                            pkg.rating.toStringAsFixed(1),
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Destination Pills on bottom of image
                  Positioned(
                    bottom: 10,
                    left: 12,
                    right: 12,
                    child: Text(
                      pkg.destinations.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF5EEAD4),
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ),

              // Card Body
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      pkg.name,
                      style: GoogleFonts.outfit(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      pkg.inclusions,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF64748B),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Footer Row: Price & View Details Link
                    Container(
                      padding: const EdgeInsets.only(top: 12),
                      decoration: const BoxDecoration(
                        border: Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.2)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'FROM',
                                style: GoogleFonts.inter(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF94A3B8),
                                ),
                              ),
                              Text(
                                '\$${pkg.price.toInt()}',
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF0B3A53),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                'View Package',
                                style: GoogleFonts.outfit(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF14B8A6),
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.arrow_forward_rounded, size: 14, color: Color(0xFF14B8A6)),
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

  // ==========================================
  // PACKAGE DETAILS MODAL / SHEET
  // ==========================================
  void _openPackageDetailsModal(TourPackage pkg) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.88,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          builder: (_, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  // Drag Handle
                  Container(
                    width: 38,
                    height: 4,
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),

                  // Content
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      children: [
                        // Cover Image
                        ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: SizedBox(
                            height: 200,
                            width: double.infinity,
                            child: _buildSmartImage(_resolvePackageImage(pkg), fit: BoxFit.cover),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Title & Rating
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                pkg.name,
                                style: GoogleFonts.outfit(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF0B3A53),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF3C7),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.star_rounded, size: 16, color: Color(0xFFD97706)),
                                  const SizedBox(width: 4),
                                  Text(
                                    pkg.rating.toStringAsFixed(1),
                                    style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pkg.destinations,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF14B8A6),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Info Pills Grid
                        Row(
                          children: [
                            Expanded(
                              child: _buildModalPill(Icons.schedule, 'Duration', '${pkg.durationDays}D / ${pkg.durationNights}N'),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildModalPill(Icons.group, 'Group Size', pkg.groupSize),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildModalPill(Icons.directions_car, 'Transport', 'Private AC'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),

                        // Licensed Tour Guide Profile
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: const Color(0xFF0B3A53),
                                child: Text(
                                  'KP',
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF5EEAD4),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Kasun Perera',
                                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
                                    ),
                                    Text(
                                      'Certified National Tour Guide · 8+ Years Exp.',
                                      style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B)),
                                    ),
                                    Text(
                                      'Languages: English, Sinhala, German',
                                      style: GoogleFonts.inter(fontSize: 10.5, color: const Color(0xFF14B8A6), fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),

                        // Day-by-Day Itinerary
                        Text(
                          'Day-by-Day Itinerary',
                          style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                        ),
                        const SizedBox(height: 10),

                        ...pkg.itineraries.map((it) {
                          final day = it['day'] ?? 1;
                          final title = it['title'] ?? 'Tour Exploration';
                          final morning = it['morning'] ?? '';
                          final afternoon = it['afternoon'] ?? '';
                          final evening = it['evening'] ?? '';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0B3A53),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        'Day $day',
                                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        title,
                                        style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
                                      ),
                                    ),
                                  ],
                                ),
                                if (morning.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text('• Morning: $morning', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF475569))),
                                ],
                                if (afternoon.isNotEmpty)
                                  Text('• Afternoon: $afternoon', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF475569))),
                                if (evening.isNotEmpty)
                                  Text('• Evening: $evening', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF475569))),
                              ],
                            ),
                          );
                        }),
                        const SizedBox(height: 20),

                        // Booking Actions
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('PRICE FROM', style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w800)),
                                  Text('\$${pkg.price.toInt()} USD', style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
                                ],
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pop(ctx);
                                _openBookingDialog(pkg);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0B3A53),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              child: Text(
                                'Book Package',
                                style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800),
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
          },
        );
      },
    );
  }

  Widget _buildModalPill(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: const Color(0xFF14B8A6)),
              const SizedBox(width: 4),
              Text(label, style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF64748B))),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
          ),
        ],
      ),
    );
  }

  void _openBookingDialog(TourPackage tour) {
    final nameController = TextEditingController(text: 'Traveler Guest');
    final emailController = TextEditingController(text: 'traveler@example.com');
    int participants = 2;

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
                    Text(
                      'Book ${tour.name}',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${tour.durationDays} Days / ${tour.durationNights} Nights · ${tour.destinations}',
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                    ),
                    const Divider(height: 24),

                    Text('Full Name', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text('Email Address', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: emailController,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 14),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Number of Travelers', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
                        Row(
                          children: [
                            IconButton(
                              onPressed: participants > 1 ? () => setModalState(() => participants--) : null,
                              icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF14B8A6)),
                            ),
                            Text('$participants', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                            IconButton(
                              onPressed: () => setModalState(() => participants++),
                              icon: const Icon(Icons.add_circle_outline, color: Color(0xFF14B8A6)),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Total Estimated Price', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF64748B))),
                              Text('All permits & private vehicle included', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF14B8A6), fontWeight: FontWeight.w600)),
                            ],
                          ),
                          Text(
                            '\$${total.toInt()}',
                            style: GoogleFonts.outfit(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0B3A53),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final now = DateTime.now().add(const Duration(days: 14));
                          final res = await ApiService.bookTour(
                            tourId: tour.id,
                            customerName: nameController.text.trim(),
                            customerEmail: emailController.text.trim(),
                            startDate: '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}',
                            participants: participants,
                            totalPrice: total,
                          );

                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                          }
                          final isSuccess = res['success'] == true;
                          if (isSuccess) {
                            final bookingData = res['booking'];
                            final ref = (bookingData is Map ? bookingData['id'] ?? bookingData['bookingReference'] : null)?.toString();
                            PaymentReceiptStore.add(PaymentReceipt(
                              orderId: ref ?? 'TL-BK-${DateTime.now().millisecondsSinceEpoch % 100000}',
                              type: ReceiptType.tourPackage,
                              title: tour.name,
                              description: 'Tour package · ${tour.durationDays} Days / ${tour.durationNights} Nights · ${tour.destinations}',
                              amount: total,
                              paidAt: DateTime.now(),
                              paymentMethod: 'Online Card Verified',
                              customerName: nameController.text.trim(),
                              customerEmail: emailController.text.trim(),
                              participants: participants,
                            ));
                          }
                          final msg = res['message'] ?? 'Booking processed successfully!';
                          if (!mounted) return;

                          messenger.showSnackBar(
                            SnackBar(
                              backgroundColor: isSuccess ? const Color(0xFF0B3A53) : const Color(0xFFBE123C),
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
                          backgroundColor: const Color(0xFF0B3A53),
                          foregroundColor: Colors.white,
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

  // ==========================================
  // 6. TRANSPORT PARTNER SECTION (PICKME)
  // ==========================================
  Widget _buildTransportPartnerSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0B3A53), Color(0xFF146C86), Color(0xFF0B3A53)],
          ),
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: const Color(0xFF14B8A6).withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.directions_car_rounded, size: 13, color: Color(0xFF5EEAD4)),
                  const SizedBox(width: 5),
                  Text(
                    'TRANSPORTATION PARTNER',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF5EEAD4),
                      letterSpacing: 0.7,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              "Need a Ride? We've Got You Covered.",
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Introducing PickMe, NOVA’s transportation partner. Get where you need to go with ease and enjoy an exclusive 10% discount on your rides.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: const Color(0xFFE2E8F0),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.confirmation_number_outlined, size: 14, color: Color(0xFF5EEAD4)),
                      const SizedBox(width: 6),
                      Text(
                        'PROMO: NOVA10',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF5EEAD4),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('PickMe code NOVA10 copied to clipboard! (10% OFF)'),
                        backgroundColor: const Color(0xFF0B3A53),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF14B8A6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text('Get Ride', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
