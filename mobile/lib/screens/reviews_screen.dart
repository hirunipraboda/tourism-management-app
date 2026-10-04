import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/review_recommendation_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

enum ActiveSubTab { reviews, myReviews, recommendations }

class ReviewsScreen extends StatefulWidget {
  final ActiveSubTab initialTab;

  const ReviewsScreen({
    super.key,
    this.initialTab = ActiveSubTab.recommendations,
  });

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  late ActiveSubTab _currentTab;

  // Recommendations state
  RecommendationFilterState _recFilters = const RecommendationFilterState(
    interests: ['All'],
    maxBudget: 100,
    maxDistance: 150,
    minRating: 0,
    activityType: 'All',
  );
  List<RecommendationItem> _recommendations = [];
  bool _isLoadingRecs = true;
  bool _isUpdatingRecs = false;
  final Set<String> _wishlistIds = {};

  // Reviews state
  List<ReviewDetailItem> _allReviews = [];
  bool _isLoadingReviews = true;
  String _reviewSearchQuery = '';
  String _selectedTargetType = 'All';
  dynamic _selectedRatingFilter = 'All';
  String _sortBy = 'newest';

  // Photo Lightbox modal
  String? _activeLightboxPhoto;

  @override
  void initState() {
    super.initState();
    _currentTab = widget.initialTab;
    _loadRecommendations();
    _loadReviews();
  }

  Future<void> _loadRecommendations() async {
    setState(() => _isLoadingRecs = true);
    final recs = await ApiService.getRecommendations(_recFilters);
    if (mounted) {
      setState(() {
        _recommendations = recs;
        _isLoadingRecs = false;
      });
    }
  }

  Future<void> _loadReviews() async {
    setState(() => _isLoadingReviews = true);
    final revs = await ApiService.getDetailedReviews(
      searchQuery: _reviewSearchQuery,
      targetType: _selectedTargetType,
      ratingFilter: _selectedRatingFilter,
      sortBy: _sortBy,
    );
    if (mounted) {
      setState(() {
        _allReviews = revs;
        _isLoadingReviews = false;
      });
    }
  }

  Future<void> _updateRecommendations() async {
    setState(() => _isUpdatingRecs = true);
    await Future.delayed(const Duration(milliseconds: 350));
    final recs = await ApiService.getRecommendations(_recFilters);
    if (mounted) {
      setState(() {
        _recommendations = recs;
        _isUpdatingRecs = false;
      });
      _showToast('Smart recommendations updated!');
    }
  }

  void _showToast(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: NovaBrand.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: NovaBrand.tertiary, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // =========================================================================
  // HELPER: Destination Image Display (Assets & Network)
  // =========================================================================
  Widget _buildSafeImage(String url, {double? width, double? height, BoxFit fit = BoxFit.cover}) {
    if (url.startsWith('assets/')) {
      return Image.asset(
        url,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) => Container(
          width: width,
          height: height,
          color: const Color(0xFF0B3A53),
          child: const Center(
            child: Icon(Icons.landscape_rounded, color: Colors.white54, size: 36),
          ),
        ),
      );
    }
    return Image.network(
      url,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => Container(
        width: width,
        height: height,
        color: const Color(0xFF0B3A53),
        child: const Center(
          child: Icon(Icons.landscape_rounded, color: Colors.white54, size: 36),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          SafeArea(
            child: RefreshIndicator(
              color: NovaBrand.primary,
              onRefresh: () async {
                await _loadRecommendations();
                await _loadReviews();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeaderSection(),
                    _buildSubTabBar(),
                    const SizedBox(height: 12),
                    if (_currentTab == ActiveSubTab.recommendations)
                      _buildRecommendationsTab()
                    else if (_currentTab == ActiveSubTab.reviews)
                      _buildReviewsTab()
                    else
                      _buildMyReviewsTab(),
                  ],
                ),
              ),
            ),
          ),

          // Lightbox preview overlay
          if (_activeLightboxPhoto != null)
            Positioned.fill(
              child: GestureDetector(
                onTap: () => setState(() => _activeLightboxPhoto = null),
                child: Container(
                  color: Colors.black.withValues(alpha: 0.90),
                  child: Stack(
                    children: [
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: _buildSafeImage(_activeLightboxPhoto!, fit: BoxFit.contain),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 48,
                        right: 20,
                        child: IconButton(
                          icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
                          onPressed: () => setState(() => _activeLightboxPhoto = null),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // =========================================================================
  // 1. PAGE HEADER (Matches Website Exact Copy & Typography)
  // =========================================================================
  Widget _buildHeaderSection() {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reviews & Recommendations',
            style: GoogleFonts.outfit(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF0B3A53),
              letterSpacing: -0.5,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Discover what other travelers think and find places recommended for you.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(0xFF64748B),
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 2. SUB-NAVIGATION PILL BAR (★ Reviews | 👤 My Reviews | ⚡ Recommendations)
  // =========================================================================
  Widget _buildSubTabBar() {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Expanded(
              child: _buildSubTabPill(
                title: 'Reviews',
                icon: Icons.star_rounded,
                iconColor: _currentTab == ActiveSubTab.reviews ? Colors.white : const Color(0xFF64748B),
                tab: ActiveSubTab.reviews,
              ),
            ),
            Expanded(
              child: _buildSubTabPill(
                title: 'My Reviews',
                icon: Icons.person_rounded,
                iconColor: _currentTab == ActiveSubTab.myReviews ? Colors.white : const Color(0xFF64748B),
                tab: ActiveSubTab.myReviews,
              ),
            ),
            Expanded(
              child: _buildSubTabPill(
                title: 'Recommendations',
                icon: Icons.bolt_rounded,
                iconColor: _currentTab == ActiveSubTab.recommendations ? const Color(0xFFFBBF24) : const Color(0xFFF59E0B),
                tab: ActiveSubTab.recommendations,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubTabPill({
    required String title,
    required IconData icon,
    required Color iconColor,
    required ActiveSubTab tab,
  }) {
    final isSelected = _currentTab == tab;
    return GestureDetector(
      onTap: () => setState(() => _currentTab = tab),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0B3A53) : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0B3A53).withValues(alpha: 0.20),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: iconColor),
            const SizedBox(width: 4),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? Colors.white : const Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // 3. TAB 3: RECOMMENDATIONS VIEW (Matches User Screenshot Exact Design)
  // =========================================================================
  Widget _buildRecommendationsTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDiscoveryEngineCard(),
          const SizedBox(height: 24),
          _buildDestinationMatchesHeader(),
          const SizedBox(height: 16),
          if (_isLoadingRecs)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: CircularProgressIndicator(color: Color(0xFF0B3A53)),
              ),
            )
          else if (_recommendations.isEmpty)
            _buildEmptyRecommendations()
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _recommendations.length,
              separatorBuilder: (_, __) => const SizedBox(height: 18),
              itemBuilder: (context, index) {
                final rec = _recommendations[index];
                return _buildRecommendationCard(rec);
              },
            ),
        ],
      ),
    );
  }

  // Discovery Engine Filter Card
  Widget _buildDiscoveryEngineCard() {
    const interestList = [
      'Culture',
      'History',
      'Nature',
      'Adventure',
      'Food',
      'Wildlife',
      'Beaches',
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B3A53).withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row with Title & Update Button
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.tune_rounded, size: 13, color: Color(0xFF146C86)),
                        const SizedBox(width: 5),
                        Flexible(
                          child: Text(
                            'Personalized Discovery Engine',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF146C86),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Refine Smart Recommendations',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _isUpdatingRecs ? null : _updateRecommendations,
                icon: _isUpdatingRecs
                    ? const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.refresh_rounded, size: 14),
                label: Text(
                  'Update',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 16),

          // 1. TOURIST INTERESTS & THEMES
          Text(
            'TOURIST INTERESTS & THEMES',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF475569),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _buildInterestChip(
                label: 'All Interests',
                isSelected: _recFilters.interests.contains('All'),
                onTap: () {
                  setState(() {
                    _recFilters = _recFilters.copyWith(interests: ['All']);
                  });
                },
              ),
              ...interestList.map((interest) {
                final isSelected = _recFilters.interests.contains(interest);
                return _buildInterestChip(
                  label: interest,
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      var updated = List<String>.from(_recFilters.interests);
                      if (isSelected) {
                        updated.remove(interest);
                        if (updated.isEmpty) updated = ['All'];
                      } else {
                        updated.remove('All');
                        updated.add(interest);
                      }
                      _recFilters = _recFilters.copyWith(interests: updated);
                    });
                  },
                );
              }),
            ],
          ),
          const SizedBox(height: 18),

          // 2. MAX DAILY BUDGET SLIDER
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'MAX DAILY BUDGET',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF475569),
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                '\$${_recFilters.maxBudget.toInt()} / day',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0B3A53),
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: const Color(0xFF0B3A53),
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: const Color(0xFF0B3A53),
              overlayColor: const Color(0xFF0B3A53).withValues(alpha: 0.12),
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
            ),
            child: Slider(
              value: _recFilters.maxBudget.clamp(20.0, 150.0),
              min: 20,
              max: 150,
              divisions: 26,
              onChanged: (val) {
                setState(() {
                  _recFilters = _recFilters.copyWith(maxBudget: val);
                });
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('\$20 (Budget)', style: GoogleFonts.inter(fontSize: 9, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                Text('\$80 (Comfort)', style: GoogleFonts.inter(fontSize: 9, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                Text('\$150+ (Luxury)', style: GoogleFonts.inter(fontSize: 9, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // 3. TRAVEL DISTANCE SLIDER
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'TRAVEL DISTANCE',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF475569),
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                'Up to ${_recFilters.maxDistance.toInt()} km',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0B3A53),
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: const Color(0xFF0B3A53),
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: const Color(0xFF0B3A53),
              overlayColor: const Color(0xFF0B3A53).withValues(alpha: 0.12),
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
            ),
            child: Slider(
              value: _recFilters.maxDistance.clamp(20.0, 200.0),
              min: 20,
              max: 200,
              divisions: 18,
              onChanged: (val) {
                setState(() {
                  _recFilters = _recFilters.copyWith(maxDistance: val);
                });
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Nearby (20 km)', style: GoogleFonts.inter(fontSize: 9, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                Text('Island-wide (200 km)', style: GoogleFonts.inter(fontSize: 9, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 14),

          // 4. Minimum Rating & Activity Type
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Minimum Rating:',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF475569)),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [0.0, 4.5, 4.8].map((rVal) {
                          final isSel = _recFilters.minRating == rVal;
                          final label = rVal == 0 ? 'Any Rating' : '$rVal★ & above';
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: _buildSmallFilterChip(
                              label: label,
                              isSelected: isSel,
                              onTap: () => setState(() => _recFilters = _recFilters.copyWith(minRating: rVal)),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text(
                    'Activity Type:',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF475569)),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          {'key': 'All', 'label': 'All Types'},
                          {'key': 'attraction', 'label': 'Sightseeing / Attractions'},
                          {'key': 'tour', 'label': 'Guided Tours'},
                        ].map((type) {
                          final isSel = _recFilters.activityType.toLowerCase() == type['key']!.toLowerCase();
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: _buildSmallFilterChip(
                              label: type['label']!,
                              isSelected: isSel,
                              onTap: () => setState(() => _recFilters = _recFilters.copyWith(activityType: type['key']!)),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInterestChip({required String label, required bool isSelected, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0B3A53) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF0B3A53) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildSmallFilterChip({required String label, required bool isSelected, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0B3A53) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF0B3A53) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  // Header above cards
  Widget _buildDestinationMatchesHeader() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Personalized Destination Matches',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0B3A53),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Calculated from historical reviews, category preferences, and budget affinities',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Text(
            'Showing ${_recommendations.length} top matches',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0B3A53),
            ),
          ),
        ),
      ],
    );
  }

  // Recommendation Card
  Widget _buildRecommendationCard(RecommendationItem rec) {
    final isSaved = _wishlistIds.contains(rec.id);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B3A53).withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Media Header
          Stack(
            children: [
              SizedBox(
                height: 180,
                width: double.infinity,
                child: _buildSafeImage(rec.image),
              ),
              // Dark gradient overlay
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.35),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.75),
                      ],
                    ),
                  ),
                ),
              ),
              // Category & Suitability Badges
              Positioned(
                top: 12,
                left: 12,
                right: 12,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.92),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(
                        rec.category,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF0B3A53),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B3A53),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        '${rec.suitabilityScore}% Suitable',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Location Label
              Positioned(
                bottom: 12,
                left: 12,
                child: Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      rec.location,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              // Wishlist Heart Button
              Positioned(
                bottom: 8,
                right: 12,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSaved) {
                        _wishlistIds.remove(rec.id);
                        _showToast('Removed from wishlist');
                      } else {
                        _wishlistIds.add(rec.id);
                        _showToast('Saved "${rec.name}" to wishlist! ❤️');
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: isSaved ? const Color(0xFFF43F5E) : Colors.white.withValues(alpha: 0.85),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      size: 16,
                      color: isSaved ? Colors.white : const Color(0xFF334155),
                    ),
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
                // Star Rating & Price
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 16, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 4),
                        Text(
                          rec.rating.toStringAsFixed(1),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${rec.reviewCount} reviews)',
                          style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        rec.price,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF0B3A53),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Name
                Text(
                  rec.name,
                  style: GoogleFonts.outfit(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF0F172A),
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 10),

                // Explanation Box
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SUITABILITY: ${rec.suitabilityScore}%',
                        style: GoogleFonts.inter(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF0B3A53),
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '"${rec.explanation}"',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: const Color(0xFF475569),
                          fontWeight: FontWeight.w500,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Factor breakdown bars (mini)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Interest Match: ${rec.interestMatch}%',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0B3A53),
                      ),
                    ),
                    Text(
                      'Rating Match: ${rec.ratingMatch}%',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFD97706),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Action Buttons: View Details & Add to Trip
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _showAttractionDetailsModal(rec),
                        icon: const Icon(Icons.visibility_outlined, size: 14),
                        label: Text(
                          'View Details',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF0B3A53),
                          backgroundColor: const Color(0xFFF1F5F9),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _showToast('Added "${rec.name}" to your trip itinerary!'),
                        icon: const Icon(Icons.add_rounded, size: 16),
                        label: Text(
                          'Add to Trip',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0B3A53),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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

  Widget _buildEmptyRecommendations() {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.explore_off_rounded, size: 48, color: Color(0xFF94A3B8)),
          const SizedBox(height: 12),
          Text(
            'No matching recommendations found',
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
          ),
          const SizedBox(height: 6),
          Text(
            'Try widening your budget, distance, or interest filters.',
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _recFilters = const RecommendationFilterState(
                  interests: ['All'],
                  maxBudget: 100,
                  maxDistance: 150,
                  minRating: 0,
                  activityType: 'All',
                );
              });
              _updateRecommendations();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0B3A53),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text('Reset All Filters'),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 4. ATTRACTION DETAILS MODAL
  // =========================================================================
  void _showAttractionDetailsModal(RecommendationItem rec) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  ListView(
                    controller: scrollController,
                    padding: const EdgeInsets.only(bottom: 90),
                    children: [
                      // Header Photo
                      Stack(
                        children: [
                          SizedBox(
                            height: 220,
                            width: double.infinity,
                            child: _buildSafeImage(rec.image),
                          ),
                          Positioned.fill(
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.black.withValues(alpha: 0.4),
                                    Colors.transparent,
                                    Colors.black.withValues(alpha: 0.8),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            top: 14,
                            right: 14,
                            child: CircleAvatar(
                              backgroundColor: Colors.black.withValues(alpha: 0.5),
                              child: IconButton(
                                icon: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                                onPressed: () => Navigator.pop(ctx),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 14,
                            left: 16,
                            right: 16,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.9),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        rec.category.toUpperCase(),
                                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0B3A53),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                                      ),
                                      child: Text(
                                        '${rec.suitabilityScore}% Match For You',
                                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  rec.name,
                                  style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_rounded, size: 14, color: Colors.white70),
                                    const SizedBox(width: 4),
                                    Text(rec.location, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
                                    const SizedBox(width: 10),
                                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                                    const SizedBox(width: 2),
                                    Text('${rec.rating} (${rec.reviewCount})', style: GoogleFonts.inter(fontSize: 12, color: Colors.white)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // Content Body
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // 4 Specs Grid (2x2 layout for mobile)
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(child: _buildSpecItem('OPENING', rec.openingHours ?? 'Open Daily')),
                                      const SizedBox(width: 12),
                                      Expanded(child: _buildSpecItem('BEST TIME', rec.bestTimeToVisit ?? 'Year-round')),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  const Divider(color: Color(0xFFE2E8F0), height: 1),
                                  const SizedBox(height: 10),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(child: _buildSpecItem('DURATION', rec.duration ?? '2-4 Hours')),
                                      const SizedBox(width: 12),
                                      Expanded(child: _buildSpecItem('PRICING / FEE', rec.price)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Description
                            Text(
                              'About this Sight & Tour',
                              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              rec.description != null && rec.description!.isNotEmpty
                                  ? rec.description!
                                  : 'Discover one of Sri Lanka’s most spectacular highlights. Experience authentic local heritage, panoramic landscape views, and unforgettable cultural stories with certified local guidance.',
                              style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF475569), height: 1.5),
                            ),
                            const SizedBox(height: 20),

                            // Suitability Match Breakdown
                            Text(
                              'Personalized Suitability Breakdown',
                              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                            ),
                            const SizedBox(height: 10),
                            _buildScoreBar('Tourist Interest Affinity', rec.interestMatch, const Color(0xFF146C86)),
                            _buildScoreBar('Community Rating Alignment', rec.ratingMatch, const Color(0xFFF59E0B)),
                            _buildScoreBar('Budget Tier Match', rec.budgetMatch, const Color(0xFF10B981)),
                            _buildScoreBar('Location Proximity', rec.locationMatch, const Color(0xFF6366F1)),
                            _buildScoreBar('Popularity Weight', rec.popularityScore, const Color(0xFFEC4899)),
                            const SizedBox(height: 20),

                            // Reviews for this sight
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Traveler Reviews',
                                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                                ),
                                TextButton.icon(
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    _showWriteReviewModal(targetName: rec.name, targetType: rec.targetType);
                                  },
                                  icon: const Icon(Icons.edit_note_rounded, size: 16),
                                  label: const Text('Write a Review'),
                                  style: TextButton.styleFrom(foregroundColor: const Color(0xFF0B3A53)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            _buildAttractionMiniReviews(rec.name),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Bottom Sticky Bar
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 10,
                            offset: const Offset(0, -2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('ESTIMATED PRICE', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w700)),
                              Text(rec.price, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
                            ],
                          ),
                          const Spacer(),
                          OutlinedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              _showToast('Added "${rec.name}" to your trip itinerary!');
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF0B3A53),
                              side: const BorderSide(color: Color(0xFF0B3A53)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            ),
                            child: const Text('+ Add to Trip'),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              _showToast('Booking initiated for ${rec.name}!');
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0B3A53),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                            ),
                            child: const Text('Book Now'),
                          ),
                        ],
                      ),
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

  Widget _buildSpecItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700, color: const Color(0xFF94A3B8))),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildScoreBar(String label, int score, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF475569))),
              Text('$score%', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w900, color: color)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: score / 100.0,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttractionMiniReviews(String targetName) {
    final matches = _allReviews.where((r) =>
        r.targetName.toLowerCase().contains(targetName.toLowerCase()) ||
        targetName.toLowerCase().contains(r.targetName.toLowerCase())).toList();

    if (matches.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(
          'Be the first traveler to write a review for this attraction!',
          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
        ),
      );
    }

    return Column(
      children: matches.take(2).map((rev) {
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundColor: const Color(0xFF0B3A53),
                        backgroundImage: rev.touristAvatar.startsWith('http') ? NetworkImage(rev.touristAvatar) : null,
                        child: !rev.touristAvatar.startsWith('http')
                            ? Text(
                                rev.touristName.isNotEmpty ? rev.touristName[0].toUpperCase() : 'T',
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                              )
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Text(rev.touristName, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A))),
                      const SizedBox(width: 6),
                      Text('• ${rev.date}', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8))),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                      Text('${rev.rating.toInt()}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w900, color: const Color(0xFFD97706))),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(rev.title, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53))),
              const SizedBox(height: 2),
              Text(rev.comment, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF475569)), maxLines: 2, overflow: TextOverflow.ellipsis),
            ],
          ),
        );
      }).toList(),
    );
  }

  // =========================================================================
  // 5. TAB 1: ALL REVIEWS TAB (Search, Filter, Cards & Lightbox)
  // =========================================================================
  Widget _buildReviewsTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildReviewsSearchFilterBar(),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Traveler Community Feedback (${_allReviews.length})',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
              ),
              ElevatedButton.icon(
                onPressed: () => _showWriteReviewModal(),
                icon: const Icon(Icons.add_rounded, size: 16),
                label: const Text('Write a Review'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  textStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (_isLoadingReviews)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: CircularProgressIndicator(color: Color(0xFF0B3A53)),
              ),
            )
          else if (_allReviews.isEmpty)
            _buildEmptyReviews()
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _allReviews.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final rev = _allReviews[index];
                return _buildReviewCard(rev);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildReviewsSearchFilterBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          // Search Input
          TextField(
            onChanged: (val) {
              _reviewSearchQuery = val;
              _loadReviews();
            },
            decoration: InputDecoration(
              hintText: 'Search reviews, sights, cities...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
              prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF146C86), size: 20),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Target Type Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                {'key': 'All', 'label': 'All Types'},
                {'key': 'attraction', 'label': 'Attractions'},
                {'key': 'tour', 'label': 'Tours'},
                {'key': 'destination', 'label': 'Destinations'},
              ].map((t) {
                final isSel = _selectedTargetType.toLowerCase() == t['key']!.toLowerCase();
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: _buildSmallFilterChip(
                    label: t['label']!,
                    isSelected: isSel,
                    onTap: () {
                      setState(() => _selectedTargetType = t['key']!);
                      _loadReviews();
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          // Rating Row & Sort
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: ['All', 5.0, 4.0, 'Low'].map((r) {
                    final isSel = _selectedRatingFilter == r;
                    final label = r == 'All'
                        ? 'All Ratings'
                        : (r == 'Low' ? '≤ 2★' : '${(r as num).toInt()}★');
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: _buildSmallFilterChip(
                        label: label,
                        isSelected: isSel,
                        onTap: () {
                          setState(() => _selectedRatingFilter = r);
                          _loadReviews();
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              DropdownButton<String>(
                value: _sortBy,
                underline: const SizedBox(),
                icon: const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF0B3A53)),
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF0B3A53)),
                items: const [
                  DropdownMenuItem(value: 'newest', child: Text('Newest')),
                  DropdownMenuItem(value: 'highest', child: Text('Highest')),
                  DropdownMenuItem(value: 'helpful', child: Text('Helpful')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _sortBy = val);
                    _loadReviews();
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(ReviewDetailItem rev, {bool showMyReviewActions = false}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0B3A53).withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Avatar, Name, Type, Rating
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFF0B3A53),
                backgroundImage: rev.touristAvatar.startsWith('http') ? NetworkImage(rev.touristAvatar) : null,
                child: !rev.touristAvatar.startsWith('http')
                    ? Text(
                        rev.touristName.isNotEmpty ? rev.touristName[0].toUpperCase() : 'T',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            rev.touristName,
                            style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (rev.isCurrentTourist) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFF16A6A1).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'You',
                              style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: const Color(0xFF146C86)),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      '${rev.touristCountry} • ${rev.travelerType} • ${rev.date}',
                      style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              // Stars
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                    const SizedBox(width: 3),
                    Text(
                      rev.rating.toStringAsFixed(1),
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w900, color: const Color(0xFFD97706)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Target Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.location_on_rounded, size: 12, color: Color(0xFF16A6A1)),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    rev.targetName,
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Title & Body
          Text(
            rev.title,
            style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
          ),
          const SizedBox(height: 4),
          Text(
            '"${rev.comment}"',
            style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF475569), height: 1.45),
          ),
          const SizedBox(height: 10),

          // Photos Row (if any)
          if (rev.photos.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: SizedBox(
                height: 70,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: rev.photos.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, pIdx) {
                    final photo = rev.photos[pIdx];
                    return GestureDetector(
                      onTap: () => setState(() => _activeLightboxPhoto = photo),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: _buildSafeImage(photo, width: 70, height: 70),
                      ),
                    );
                  },
                ),
              ),
            ),

          // Tags
          if (rev.tags.isNotEmpty)
            Wrap(
              spacing: 6,
              children: rev.tags.map((t) {
                return Text(
                  '#$t',
                  style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                );
              }).toList(),
            ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 8),

          // Bottom Action Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Helpful Button
              GestureDetector(
                onTap: () async {
                  final newStatus = await ApiService.toggleReviewHelpful(rev.id);
                  setState(() {
                    rev.isHelpfulByUser = newStatus;
                    rev.helpfulCount += newStatus ? 1 : -1;
                  });
                  _showToast(newStatus ? 'Marked review as helpful! 👍' : 'Removed helpful vote');
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: rev.isHelpfulByUser ? const Color(0xFF16A6A1) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.thumb_up_alt_rounded,
                        size: 13,
                        color: rev.isHelpfulByUser ? Colors.white : const Color(0xFF475569),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Helpful 👍 ${rev.helpfulCount}',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: rev.isHelpfulByUser ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Edit / Delete for My Reviews
              if (showMyReviewActions || rev.isCurrentTourist)
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit_rounded, size: 18, color: Color(0xFF0B3A53)),
                      onPressed: () => _showWriteReviewModal(editingReview: rev),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Color(0xFFEF4444)),
                      onPressed: () => _confirmDeleteReview(rev.id),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyReviews() {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.rate_review_outlined, size: 48, color: Color(0xFF94A3B8)),
          const SizedBox(height: 12),
          Text(
            'No matching reviews found',
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
          ),
          const SizedBox(height: 6),
          Text('Try searching with different terms or filters.', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
        ],
      ),
    );
  }

  // =========================================================================
  // 6. TAB 2: MY REVIEWS TAB
  // =========================================================================
  Widget _buildMyReviewsTab() {
    final myRevs = _allReviews.where((r) => r.isCurrentTourist).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Gradient Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0B3A53), Color(0xFF146C86)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0B3A53).withValues(alpha: 0.15),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Tourist Feedback Portal',
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF16A6A1)),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _showWriteReviewModal(),
                      icon: const Icon(Icons.add_rounded, size: 14),
                      label: const Text('Write a Review'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF16A6A1),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        textStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'My Travel Reviews (${myRevs.length})',
                  style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  'Manage your submitted ratings, track verification statuses, and update your journey stories anytime.',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.white70, height: 1.4),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, size: 13, color: Color(0xFF34D399)),
                          const SizedBox(width: 4),
                          Text('${myRevs.length} Published', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          if (myRevs.isEmpty)
            Container(
              padding: const EdgeInsets.all(40),
              alignment: Alignment.center,
              child: Column(
                children: [
                  const Icon(Icons.person_pin_outlined, size: 48, color: Color(0xFF94A3B8)),
                  const SizedBox(height: 12),
                  Text(
                    'You haven’t submitted any reviews yet',
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
                  ),
                  const SizedBox(height: 6),
                  Text('Share your experiences to help fellow Sri Lanka travelers!', style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B))),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => _showWriteReviewModal(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0B3A53),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Write Your First Review'),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: myRevs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final rev = myRevs[index];
                return _buildReviewCard(rev, showMyReviewActions: true);
              },
            ),
        ],
      ),
    );
  }

  void _confirmDeleteReview(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete this Review?', style: GoogleFonts.outfit(fontWeight: FontWeight.w800)),
        content: Text(
          'This action will permanently remove your review from the public ratings list.',
          style: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF475569)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ApiService.deleteDetailedReview(id);
              _loadReviews();
              _showToast('Review removed from your profile');
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 7. WRITE / EDIT REVIEW BOTTOM SHEET MODAL
  // =========================================================================
  void _showWriteReviewModal({
    ReviewDetailItem? editingReview,
    String? targetName,
    String? targetType,
  }) {
    final titleController = TextEditingController(text: editingReview?.title ?? '');
    final commentController = TextEditingController(text: editingReview?.comment ?? '');
    final touristNameController = TextEditingController(text: editingReview?.touristName ?? 'Sarah Jenkins');
    final touristCountryController = TextEditingController(text: editingReview?.touristCountry ?? 'United Kingdom');
    double rating = editingReview?.rating ?? 5.0;
    String selectedTravelerType = editingReview?.travelerType ?? 'Solo';
    String selectedTargetName = editingReview?.targetName ?? targetName ?? 'Temple of the Tooth';
    String selectedTargetType = editingReview?.targetType ?? targetType ?? 'attraction';

    const presetDestinations = [
      'Temple of the Tooth',
      'Sigiriya Rock Fortress',
      'Nine Arches Bridge',
      'Ella Highlands',
      'Galle Dutch Fort',
      'Mirissa Blue Whale Ocean Expedition',
      'Yala National Park Safari',
      'Horton Plains National Park',
      'Nilaveli Beach & Pigeon Island',
      'Halpewatte Tea Factory Estate',
    ];

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
                      editingReview != null ? 'Edit Your Review' : 'Write a Review',
                      style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
                    ),
                    Text(
                      'Share your Sri Lankan journey experience with fellow travelers',
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 16),

                    // Attraction Dropdown
                    Text('Select Attraction / Tour', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF334155))),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: presetDestinations.contains(selectedTargetName) ? selectedTargetName : presetDestinations.first,
                      isExpanded: true,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      ),
                      items: presetDestinations.map((d) => DropdownMenuItem(value: d, child: Text(d, style: GoogleFonts.inter(fontSize: 13)))).toList(),
                      onChanged: (v) {
                        if (v != null) {
                          setModalState(() => selectedTargetName = v);
                        }
                      },
                    ),
                    const SizedBox(height: 14),

                    // 5-Star Interactive Rating
                    Text('Your Rating', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF334155))),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final starNum = index + 1;
                        return IconButton(
                          icon: Icon(
                            starNum <= rating ? Icons.star_rounded : Icons.star_border_rounded,
                            color: const Color(0xFFF59E0B),
                            size: 34,
                          ),
                          onPressed: () => setModalState(() => rating = starNum.toDouble()),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),

                    // Review Headline / Title
                    Text('Review Headline', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF334155))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: titleController,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'e.g., Unforgettable sunrise over Sigiriya Fortress',
                        hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Feedback / Comment Body
                    Text('Detailed Experience', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF334155))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: commentController,
                      maxLines: 3,
                      style: GoogleFonts.inter(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Share tips on guides, transportation, photography spots, and pacing...',
                        hintStyle: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Traveler Type
                    Text('Traveler Type', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF334155))),
                    const SizedBox(height: 6),
                    Row(
                      children: ['Solo', 'Couple', 'Family', 'Friends'].map((type) {
                        final isSel = selectedTravelerType == type;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setModalState(() => selectedTravelerType = type),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSel ? const Color(0xFF0B3A53) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                type,
                                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: isSel ? Colors.white : const Color(0xFF475569)),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    // Submit CTA Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          final title = titleController.text.trim();
                          final comment = commentController.text.trim();
                          if (title.isEmpty || comment.isEmpty) {
                            _showToast('Please complete both headline and comment');
                            return;
                          }
                          Navigator.pop(ctx);

                          final updatedRev = ReviewDetailItem(
                            id: editingReview?.id ?? 'rev-${DateTime.now().millisecondsSinceEpoch}',
                            touristName: touristNameController.text.trim(),
                            touristAvatar: editingReview?.touristAvatar ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
                            touristCountry: touristCountryController.text.trim(),
                            travelerType: selectedTravelerType,
                            targetType: selectedTargetType,
                            targetId: 'target-${selectedTargetName.toLowerCase().replaceAll(' ', '-')}',
                            targetName: selectedTargetName,
                            rating: rating,
                            title: title,
                            comment: comment,
                            date: editingReview?.date ?? DateTime.now().toIso8601String().split('T')[0],
                            helpfulCount: editingReview?.helpfulCount ?? 0,
                            isHelpfulByUser: editingReview?.isHelpfulByUser ?? false,
                            status: 'Published',
                            photos: editingReview?.photos ?? ['assets/images/destinations/sigiriya.jpg'],
                            tags: ['Verified Travel', 'Community Feedback'],
                            isCurrentTourist: true,
                          );

                          await ApiService.submitDetailedReview(updatedRev);
                          _loadReviews();
                          _showToast(editingReview != null ? 'Review updated successfully!' : 'Review published and synced with web!');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0B3A53),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Text(
                          editingReview != null ? 'Save Changes' : 'Submit Review',
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
}
