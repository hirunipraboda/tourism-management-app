import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/user_trip_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TripsScreen extends StatefulWidget {
  final Function(int)? onNavigateTab;

  const TripsScreen({super.key, this.onNavigateTab});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<UserTripDetail> _allTrips = [];
  bool _isLoading = true;
  String _activeTab = 'All'; // 'All' | 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed'
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();


  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTrips() async {
    setState(() => _isLoading = true);
    try {
      final trips = await ApiService.getEnrichedUserTrips();
      if (mounted) {
        setState(() {
          _allTrips = trips;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _allTrips = List.from(kMockTripsData);
          _isLoading = false;
        });
      }
    }
  }

  void _triggerToast(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Color(0xFF16A6A1), size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0B3A53),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  List<UserTripDetail> get _filteredTrips {
    List<UserTripDetail> list = _allTrips;

    if (_activeTab == 'Planning') {
      list = _allTrips.where((t) => t.status == 'Planning').toList();
    } else if (_activeTab == 'Upcoming') {
      list = _allTrips.where((t) => t.status == 'Upcoming' || t.status == 'Planning').toList();
    } else if (_activeTab != 'All') {
      list = _allTrips.where((t) => t.status == _activeTab).toList();
    }

    final q = _searchQuery.trim().toLowerCase();
    if (q.isEmpty) return list;

    return list.where((t) {
      if (t.name.toLowerCase().contains(q)) return true;
      if (t.destination.toLowerCase().contains(q)) return true;
      if (t.dates.toLowerCase().contains(q)) return true;
      if (t.status.toLowerCase().contains(q)) return true;
      if (t.interests.any((i) => i.toLowerCase().contains(q))) return true;
      if (t.bookingsList.any((b) => b.provider.toLowerCase().contains(q) || b.confirmationCode.toLowerCase().contains(q))) return true;
      if (t.dailyItinerary.any((d) => d.title.toLowerCase().contains(q) || d.activities.any((a) => a.title.toLowerCase().contains(q)))) return true;
      return false;
    }).toList();
  }

  UserTripDetail? get _featuredTrip {
    final ongoing = _allTrips.where((t) => t.status == 'Ongoing').toList();
    if (ongoing.isNotEmpty) {
      final featuredOngoing = ongoing.firstWhere((t) => t.isFeatured, orElse: () => ongoing.first);
      return featuredOngoing;
    }
    return _allTrips.isNotEmpty ? _allTrips.first : null;
  }

  int _countForTab(String tab) {
    if (tab == 'All') return _allTrips.length;
    if (tab == 'Planning') return _allTrips.where((t) => t.status == 'Planning').length;
    if (tab == 'Upcoming') return _allTrips.where((t) => t.status == 'Upcoming' || t.status == 'Planning').length;
    return _allTrips.where((t) => t.status == tab).length;
  }

  void _handleDeleteTrip(String tripId, String tripName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            const SizedBox(width: 8),
            Text('Delete Trip?', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: Text(
          'Are you sure you want to remove "$tripName"? This action cannot be undone.',
          style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[700]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.grey[600])),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _allTrips.removeWhere((t) => t.id == tripId);
              });
              ApiService.deleteTrip(tripId);
              _triggerToast('Trip removed successfully');
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showPlanNewTripDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Plan a New Journey',
                style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
              ),
              const SizedBox(height: 4),
              Text(
                'Choose how you want to design your Sri Lanka adventure.',
                style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[600]),
              ),
              const SizedBox(height: 20),

              // Option 1: AI Trip Planner
              InkWell(
                onTap: () {
                  Navigator.pop(ctx);
                  if (widget.onNavigateTab != null) {
                    widget.onNavigateTab!(4); // Switch to AI Trip Planner tab
                  }
                },
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B3A53),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF0B3A53).withValues(alpha: 0.25), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16A6A1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.auto_awesome, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'AI Journey Architect (Recommended)',
                              style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '7-step intelligent wizard with budgets, staycations & auto-scheduling',
                              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white70),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Option 2: Quick Custom Manual Trip
              InkWell(
                onTap: () {
                  Navigator.pop(ctx);
                  _showQuickCustomTripDialog();
                },
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.grey[200]!),
                    boxShadow: NovaBrand.softShadow,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.edit_calendar_outlined, color: Color(0xFF0B3A53), size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Manual Trip Planner',
                              style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Customize destination, dates, travelers and your own itinerary',
                              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showQuickCustomTripDialog() {
    final titleCtrl = TextEditingController(text: 'Kandy Heritage Trail');
    final destCtrl = TextEditingController(text: 'Kandy');
    int travelers = 2;
    double budget = 500;
    DateTime startDate = DateTime.now().add(const Duration(days: 10));
    DateTime endDate = DateTime.now().add(const Duration(days: 14));

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final days = endDate.difference(startDate).inDays;

          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Text(
              'New Custom Journey',
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 19, color: const Color(0xFF0B3A53)),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Trip Name', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      isDense: true,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text('Destination', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: destCtrl,
                    decoration: InputDecoration(
                      isDense: true,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text('Travelers ($travelers)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: travelers > 1 ? () => setDlgState(() => travelers--) : null,
                      ),
                      Text('$travelers', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () => setDlgState(() => travelers++),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Budget: \$${budget.toStringAsFixed(0)}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  Slider(
                    value: budget,
                    min: 100,
                    max: 2500,
                    divisions: 24,
                    activeColor: const Color(0xFF0D9488),
                    onChanged: (val) => setDlgState(() => budget = val),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final newTrip = UserTripDetail(
                    id: 'custom-${DateTime.now().millisecondsSinceEpoch}',
                    name: titleCtrl.text.trim().isNotEmpty ? titleCtrl.text.trim() : 'Sri Lanka Journey',
                    destination: destCtrl.text.trim().toUpperCase(),
                    destinationId: destCtrl.text.trim().toLowerCase(),
                    dates: '${DateFormat('dd MMM').format(startDate)} – ${DateFormat('dd MMM yyyy').format(endDate)}',
                    duration: '$days Days',
                    travelers: travelers,
                    status: 'Planning',
                    timelineLabel: 'In Planning',
                    imageUrl: 'assets/images/destinations/Kandy.jpg',
                    budget: '\$${budget.toStringAsFixed(0)}',
                  );

                  setState(() {
                    _allTrips.insert(0, newTrip);
                  });
                  Navigator.pop(ctx);
                  _triggerToast('Journey "${newTrip.name}" added to Your Trips!');
                },
                child: const Text('Save Journey', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: RefreshIndicator(
        onRefresh: _loadTrips,
        color: const Color(0xFF0D9488),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. PAGE HERO HEADER
              _buildPageHeroHeader(),

              // 2. TRIP STATUS NAVIGATION TABS
              _buildStatusTabs(),

              const SizedBox(height: 16),

              // 3. FEATURED PRIMARY JOURNEY CARD (Shown on All or Ongoing tabs)
              if ((_activeTab == 'All' || _activeTab == 'Ongoing') && _featuredTrip != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildFeaturedJourneyCard(_featuredTrip!),
                ),

              const SizedBox(height: 24),

              // 4. SEARCH & SECTION HEADER
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildSearchAndSectionHeader(),
              ),

              const SizedBox(height: 16),

              // 5. YOUR TRIPS LIST / GRID
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildTripsList(),
              ),

              const SizedBox(height: 32),

              // 6. AI TRIP PLANNING INTEGRATION BANNER
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildAiPlanningBanner(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // 1. PAGE HERO HEADER
  // =========================================================================
  Widget _buildPageHeroHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Journeys',
                      style: GoogleFonts.outfit(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0B3A53),
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Every trip has a story. Keep your itineraries, active travels, and memories organized in one seamless place.',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        color: const Color(0xFF475569),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Primary CTA Button: + PLAN A NEW TRIP
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showPlanNewTripDialog,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0B3A53),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 4,
                shadowColor: const Color(0xFF0B3A53).withValues(alpha: 0.35),
              ),
              icon: const Icon(Icons.add, size: 18, color: Colors.white),
              label: Text(
                'PLAN A NEW TRIP',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.0,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 2. STATUS TABS
  // =========================================================================
  Widget _buildStatusTabs() {
    const tabs = ['All', 'Upcoming', 'Planning', 'Ongoing', 'Completed'];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: tabs.map((tab) {
            final isActive = _activeTab == tab;
            final count = _countForTab(tab);

            return InkWell(
              onTap: () => setState(() => _activeTab = tab),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isActive ? const Color(0xFF0B3A53) : Colors.transparent,
                      width: 2.5,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      tab,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
                        color: isActive ? const Color(0xFF0B3A53) : const Color(0xFF64748B),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF0B3A53) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$count',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isActive ? Colors.white : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // =========================================================================
  // 3. FEATURED PRIMARY JOURNEY CARD
  // =========================================================================
  Widget _buildFeaturedJourneyCard(UserTripDetail trip) {
    final stayBookings = trip.bookingsList.where((b) => b.type == 'Hotel').toList();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: NovaBrand.softShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Destination Photo with Live Badge
          Stack(
            children: [
              SizedBox(
                height: 200,
                width: double.infinity,
                child: Image.asset(
                  trip.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: Colors.teal[50],
                    child: const Icon(Icons.landscape, size: 64, color: Colors.teal),
                  ),
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.3),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                    ),
                  ),
                ),
              ),
              // Top-left Animated Pill: PRIMARY JOURNEY · ONGOING
              Positioned(
                top: 14,
                left: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xE6020617),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0x6634D399)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 6),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF34D399),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'PRIMARY JOURNEY ${trip.status == 'Ongoing' ? '· ONGOING' : ''}',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF34D399),
                          letterSpacing: 0.6,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Card Content
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Destination & Status Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      trip.destination,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF146C86),
                        letterSpacing: 0.8,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF6EE7B7)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            trip.status,
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF047857),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                // Trip Title
                Text(
                  trip.name,
                  style: GoogleFonts.outfit(
                    fontSize: 21,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF0B3A53),
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 8),

                // Date, Duration, Travelers
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 12, color: Color(0xFF16A6A1)),
                        const SizedBox(width: 4),
                        Text(trip.dates, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Text('•', style: TextStyle(color: Colors.grey[400])),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.schedule, size: 12, color: Color(0xFF16A6A1)),
                        const SizedBox(width: 4),
                        Text(trip.duration, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Text('•', style: TextStyle(color: Colors.grey[400])),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.people_outline, size: 12, color: Color(0xFF16A6A1)),
                        const SizedBox(width: 4),
                        Text('${trip.travelers} Travelers', style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Budget Tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: Text(
                    'Budget: ${trip.budget}',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: const Color(0xFF334155)),
                  ),
                ),

                // Staycation Confirmed Receipt Banner inside card
                if (stayBookings.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.domain, color: Color(0xFF047857), size: 18),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Confirmed Staycation: ${stayBookings.first.provider}',
                                style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w800, color: const Color(0xFF1F2937)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                'Ref: ${stayBookings.first.confirmationCode} · ${stayBookings.first.amount}',
                                style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () => _showReceiptModal(stayBookings.first, trip.name),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.receipt_long, size: 12, color: Colors.white),
                                const SizedBox(width: 4),
                                Text('Receipt', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.white)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Ongoing Journey Live Status Section
                if (trip.status == 'Ongoing') ...[
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 14),

                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'ONGOING JOURNEY LIVE STATUS',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0B3A53),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF6EE7B7)),
                        ),
                        child: Text(
                          trip.timelineLabel ?? 'Happening Today',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF065F46),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Day Progress Mini-Cards
                  if (trip.dailyItinerary.isNotEmpty)
                    SizedBox(
                      height: 84,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: trip.dailyItinerary.length > 3 ? 3 : trip.dailyItinerary.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (ctx, idx) {
                          final day = trip.dailyItinerary[idx];
                          final isToday = day.status == 'Today' || idx == 0;

                          return Container(
                            width: 140,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isToday ? const Color(0xFFECFDF5) : Colors.grey[50],
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isToday ? const Color(0xFF10B981) : Colors.grey[200]!,
                                width: isToday ? 1.5 : 1.0,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Day ${day.day}', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[700])),
                                    if (isToday)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                        decoration: BoxDecoration(color: const Color(0xFF059669), borderRadius: BorderRadius.circular(6)),
                                        child: Text('ACTIVE', style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white)),
                                      ),
                                  ],
                                ),
                                Text(
                                  day.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                                ),
                                Text(
                                  day.activities.isNotEmpty ? day.activities.first.title : 'Excursions',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(fontSize: 9.5, color: Colors.grey[500]),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),

                  const SizedBox(height: 10),

                  // Live Context Indicators
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Row(
                            children: [
                              const Text('🏨 ', style: TextStyle(fontSize: 12)),
                              Expanded(
                                child: Text(
                                  'Mandara Resort Mirissa',
                                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Row(
                            children: [
                              const Text('⛅ ', style: TextStyle(fontSize: 12)),
                              Expanded(
                                child: Text(
                                  trip.weatherForecast.split('·').first.trim(),
                                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 16),

                // View Trip Button
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton.icon(
                    onPressed: () => _openTripDetailsModal(trip),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0B3A53),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 2,
                    ),
                    label: Text('View Trip', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    iconAlignment: IconAlignment.end,
                    icon: const Icon(Icons.arrow_forward, size: 14),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 4. SEARCH & SECTION HEADER
  // =========================================================================
  Widget _buildSearchAndSectionHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Trips',
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF0B3A53),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _searchQuery.trim().isNotEmpty
                      ? 'Showing ${_filteredTrips.length} matching journey${_filteredTrips.length == 1 ? '' : 's'}'
                      : 'Showing ${_filteredTrips.length} journeys',
                  style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[500]),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Search Input Bar
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey[300]!),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4, offset: const Offset(0, 2)),
            ],
          ),
          child: TextField(
            controller: _searchController,
            onChanged: (val) => setState(() => _searchQuery = val),
            style: GoogleFonts.inter(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Search trips, destinations, staycations...',
              hintStyle: GoogleFonts.inter(fontSize: 12.5, color: Colors.grey[400]),
              prefixIcon: const Icon(Icons.search, size: 18, color: Colors.grey),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // 5. TRIPS LIST
  // =========================================================================
  Widget _buildTripsList() {
    if (_isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(color: Color(0xFF0D9488)),
        ),
      );
    }

    if (_filteredTrips.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Center(
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A6A1).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.explore_outlined, size: 36, color: Color(0xFF16A6A1)),
              ),
              const SizedBox(height: 14),
              Text(
                _searchQuery.isNotEmpty ? 'No journeys found' : 'Your next story starts here.',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53)),
              ),
              const SizedBox(height: 6),
              Text(
                _searchQuery.isNotEmpty
                    ? 'We couldn\'t find any trips matching "$_searchQuery".'
                    : 'You haven\'t planned a journey in this category yet. Let NOVA help you turn an idea into an unforgettable trip.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600], height: 1.4),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                onPressed: _showPlanNewTripDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                child: Text('Plan a New Trip', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _filteredTrips.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (ctx, index) {
        final trip = _filteredTrips[index];
        return _buildTripCard(trip);
      },
    );
  }

  Widget _buildTripCard(UserTripDetail trip) {
    final stayBookings = trip.bookingsList.where((b) => b.type == 'Hotel').toList();

    return InkWell(
      onTap: () => _openTripDetailsModal(trip),
      borderRadius: BorderRadius.circular(22),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.grey[200]!),
          boxShadow: NovaBrand.softShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Banner with Status Tag
            Stack(
              children: [
                SizedBox(
                  height: 160,
                  width: double.infinity,
                  child: Image.asset(
                    trip.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: Colors.teal[50],
                      child: const Icon(Icons.landscape, size: 48, color: Colors.teal),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.6),
                        ],
                      ),
                    ),
                  ),
                ),
                // Status Chip on Top-Right
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusBgColor(trip.status),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _statusBorderColor(trip.status)),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 4),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (trip.status == 'Ongoing') ...[
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(color: Color(0xFF34D399), shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 5),
                        ],
                        Text(
                          trip.status,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: _statusTextColor(trip.status),
                          ),
                        ),
                      ],
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        trip.destination,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF146C86),
                          letterSpacing: 0.6,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Budget: ${trip.budget}',
                          style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  Text(
                    trip.name,
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0F172A),
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 6),

                  Text(
                    '${trip.dates} · ${trip.duration} · ${trip.travelers} Travelers',
                    style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[600], fontWeight: FontWeight.w600),
                  ),

                  // Timeline Badge
                  if (trip.timelineLabel != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: trip.status == 'Ongoing'
                            ? const Color(0xFFECFDF5)
                            : trip.status == 'Completed'
                                ? Colors.grey[100]
                                : const Color(0xFFF0F9FF),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: trip.status == 'Ongoing'
                              ? const Color(0xFFA7F3D0)
                              : trip.status == 'Completed'
                                  ? Colors.grey[300]!
                                  : const Color(0xFFBAE6FD),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.schedule, size: 12, color: trip.status == 'Ongoing' ? const Color(0xFF059669) : const Color(0xFF0B3A53)),
                          const SizedBox(width: 4),
                          Text(
                            trip.timelineLabel!,
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                              color: trip.status == 'Ongoing' ? const Color(0xFF065F46) : const Color(0xFF0B3A53),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Staycation Booked Receipt Bar
                  if (stayBookings.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.domain, size: 14, color: Color(0xFF059669)),
                              const SizedBox(width: 6),
                              Text(
                                '${stayBookings.length} Staycation Booked',
                                style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: const Color(0xFF065F46)),
                              ),
                            ],
                          ),
                          InkWell(
                            onTap: () => _showReceiptModal(stayBookings.first, trip.name),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFF10B981)),
                              ),
                              child: Text(
                                'View Receipt',
                                style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: const Color(0xFF059669)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Card Bottom Link
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey[100]!)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    trip.status == 'Completed' ? 'View Memory' : 'View Full Journey',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF0B3A53)),
                  ),
                  Row(
                    children: [
                      Text(
                        trip.status,
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF16A6A1)),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_forward, size: 14, color: Color(0xFF16A6A1)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _statusBgColor(String status) {
    switch (status) {
      case 'Ongoing':
        return const Color(0xE6064E3B);
      case 'Completed':
        return const Color(0xE60F172A);
      case 'Cancelled':
        return const Color(0xE6881337);
      default:
        return const Color(0xE60C4A6E);
    }
  }

  Color _statusBorderColor(String status) {
    switch (status) {
      case 'Ongoing':
        return const Color(0x6634D399);
      case 'Completed':
        return Colors.white24;
      case 'Cancelled':
        return const Color(0x66F43F5E);
      default:
        return const Color(0x6638BDF8);
    }
  }

  Color _statusTextColor(String status) {
    switch (status) {
      case 'Ongoing':
        return const Color(0xFF34D399);
      case 'Completed':
        return const Color(0xFFE2E8F0);
      case 'Cancelled':
        return const Color(0xFFFDA4AF);
      default:
        return const Color(0xFF7DD3FC);
    }
  }

  // =========================================================================
  // 6. AI TRIP PLANNING INTEGRATION BANNER
  // =========================================================================
  Widget _buildAiPlanningBanner() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF16A6A1).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.auto_awesome, color: Color(0xFF16A6A1), size: 28),
          ),
          const SizedBox(height: 12),
          Text(
            'Let NOVA shape the journey.',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
          ),
          const SizedBox(height: 6),
          Text(
            'Tell us where you\'re going, what you love, and how you want to travel. NOVA will help build a journey around you.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600], height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              if (widget.onNavigateTab != null) {
                widget.onNavigateTab!(4); // Switch to Tab 4 (AI Planner)
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0B3A53),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              elevation: 3,
            ),
            label: Text('Plan with NOVA', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
            iconAlignment: IconAlignment.end,
            icon: const Icon(Icons.arrow_forward, size: 14),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // 7. FULL TRIP DETAILS MODAL
  // =========================================================================
  void _openTripDetailsModal(UserTripDetail trip) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.92,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, scrollCtrl) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                children: [
                  // Sticky Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        InkWell(
                          onTap: () => Navigator.pop(ctx),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(16)),
                            child: Row(
                              children: [
                                const Icon(Icons.arrow_back, size: 14, color: Color(0xFF0B3A53)),
                                const SizedBox(width: 4),
                                Text('Back to Journeys', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
                              ],
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.share_outlined, size: 18),
                              onPressed: () => _triggerToast('Shared ${trip.name} itinerary link!'),
                            ),
                            IconButton(
                              icon: const Icon(Icons.picture_as_pdf_outlined, size: 18),
                              onPressed: () => _triggerToast('Exporting ${trip.name} PDF Summary...'),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, size: 20),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Scrollable Body
                  Expanded(
                    child: ListView(
                      controller: scrollCtrl,
                      padding: const EdgeInsets.all(16),
                      children: [
                        // Hero Header
                        Stack(
                          children: [
                            Container(
                              height: 180,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(20),
                                image: DecorationImage(image: AssetImage(trip.imageUrl), fit: BoxFit.cover),
                              ),
                            ),
                            Container(
                              height: 180,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(20),
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [Colors.black.withValues(alpha: 0.2), Colors.black.withValues(alpha: 0.85)],
                                ),
                              ),
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                                        child: Text(trip.destination, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(color: const Color(0xFF0D9488), borderRadius: BorderRadius.circular(10)),
                                        child: Text(trip.status, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                      ),
                                    ],
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(trip.name, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                                      const SizedBox(height: 4),
                                      Text('${trip.dates} · ${trip.duration} · ${trip.travelers} Travelers', style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Quick Stats Grid
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 2.2,
                          physics: const NeverScrollableScrollPhysics(),
                          children: [
                            _buildQuickStatCard('Total Budget', trip.budget, 'Spent: ${trip.spentBudget}'),
                            _buildQuickStatCard('Weather Forecast', trip.weatherForecast.split('·').first.trim(), trip.weatherForecast.contains('·') ? trip.weatherForecast.split('·')[1].trim() : 'Mild'),
                            _buildQuickStatCard('Travelers', '${trip.travelers} Travelers', trip.travelerNames.join(', ')),
                            _buildQuickStatCard('Interests', '${trip.interests.length} Categories', trip.interests.join(' · ')),
                          ],
                        ),

                        // Trip Notes / Preferences Banner
                        if (trip.notes.isNotEmpty) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDFA),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFF99F6E4)),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.info_outline, color: Color(0xFF0D9488), size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Trip Preferences & Transport', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E))),
                                      const SizedBox(height: 2),
                                      Text(trip.notes, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF134E4A))),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // NOVA AI Tip
                        if (trip.aiNotes != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFA7F3D0)),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.explore_outlined, color: Color(0xFF059669), size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('NOVA AI Travel Tip', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF065F46))),
                                      const SizedBox(height: 2),
                                      Text(trip.aiNotes!, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF047857))),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 20),

                        // Day by Day Itinerary
                        Text('Day-by-Day Itinerary', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
                        const SizedBox(height: 10),

                        if (trip.dailyItinerary.isNotEmpty)
                          ...trip.dailyItinerary.map((day) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(6),
                                            decoration: BoxDecoration(color: const Color(0xFF0B3A53), borderRadius: BorderRadius.circular(8)),
                                            child: Text('0${day.day}', style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(day.title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
                                        ],
                                      ),
                                      if (day.status != null)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: day.status == 'Today' ? const Color(0xFFECFDF5) : Colors.grey[200],
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(day.status!, style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: day.status == 'Today' ? Colors.green[800] : Colors.grey[700])),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),

                                  ...day.activities.map((act) {
                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: Colors.grey[200]!),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(6)),
                                                child: Text(act.time, style: GoogleFonts.robotoMono(fontSize: 10, fontWeight: FontWeight.bold)),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                                decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(6)),
                                                child: Text(act.type, style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: const Color(0xFF0284C7))),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(act.title, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                                          Text(act.description, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
                                          const SizedBox(height: 2),
                                          Text('📍 ${act.location}', style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF146C86), fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                    );
                                  }),
                                ],
                              ),
                            );
                          })
                        else
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(14)),
                            child: const Center(
                              child: Text('Itinerary details are being generated by NOVA AI.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            ),
                          ),

                        const SizedBox(height: 20),

                        // Confirmed Bookings & Transfers
                        if (trip.bookingsList.isNotEmpty) ...[
                          Text('Confirmed Bookings & Transfers', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
                          const SizedBox(height: 10),

                          ...trip.bookingsList.map((bk) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(6)),
                                        child: Text(bk.type, style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E))),
                                      ),
                                      Text('✓ ${bk.status}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green[700])),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(bk.provider, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                                  Text(bk.details, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Ref: ${bk.confirmationCode}', style: GoogleFonts.robotoMono(fontSize: 10.5, color: Colors.grey[500])),
                                      Text(bk.amount, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
                                    ],
                                  ),
                                  if (bk.type == 'Hotel') ...[
                                    const SizedBox(height: 8),
                                    SizedBox(
                                      width: double.infinity,
                                      child: OutlinedButton.icon(
                                        onPressed: () => _showReceiptModal(bk, trip.name),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(0xFF0D9488),
                                          side: const BorderSide(color: Color(0xFF99F6E4)),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        icon: const Icon(Icons.receipt_long, size: 14),
                                        label: const Text('View Official Confirmation Receipt', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            );
                          }),
                        ],

                        const SizedBox(height: 20),

                        // Action Buttons: Delete (if applicable)
                        if (trip.status == 'Planning' || trip.status == 'Upcoming')
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () {
                                Navigator.pop(ctx);
                                _handleDeleteTrip(trip.id, trip.name);
                              },
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.redAccent,
                                side: const BorderSide(color: Colors.redAccent),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              icon: const Icon(Icons.delete_outline, size: 16),
                              label: const Text('Delete Journey', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
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

  Widget _buildQuickStatCard(String label, String main, String sub) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.grey[400])),
          const SizedBox(height: 2),
          Text(main, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53)), maxLines: 1, overflow: TextOverflow.ellipsis),
          Text(sub, style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF146C86)), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  // =========================================================================
  // 8. STAYCATION CONFIRMATION RECEIPT MODAL
  // =========================================================================
  void _showReceiptModal(TripBookingDetail bk, String tripName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(20),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Text('✓ Verified Reservation', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF047857))),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              Text('Staycation Booking Receipt', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53))),
              Text('Trip: $tripName', style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    _buildReceiptRow('Booking Ref', bk.confirmationCode, isBold: true),
                    _buildReceiptRow('Staycation', bk.provider),
                    _buildReceiptRow('Package', bk.packageName ?? 'Signature Staycation Experience'),
                    _buildReceiptRow('Dates', bk.dates),
                    _buildReceiptRow('Guests', bk.guestName ?? 'Sanath Wickramasinghe'),
                    _buildReceiptRow('Payment', bk.paymentMethod ?? 'Online Card Verified'),
                    const Divider(height: 14),
                    _buildReceiptRow('Subtotal', bk.subtotal ?? '\$240'),
                    _buildReceiptRow('Taxes & Fees', bk.taxesAndService ?? '\$20'),
                    _buildReceiptRow('Total Paid', bk.amount, isBold: true, isHighlight: true),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _triggerToast('Receipt downloaded for ${bk.confirmationCode}');
                      },
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.download, size: 14),
                      label: const Text('PDF', style: TextStyle(fontSize: 11)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Done', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500])),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: isHighlight ? 13 : 11,
              fontWeight: isBold || isHighlight ? FontWeight.w900 : FontWeight.w600,
              color: isHighlight ? const Color(0xFF0D9488) : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
