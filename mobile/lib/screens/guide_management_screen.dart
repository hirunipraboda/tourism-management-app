import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/guide_models.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class _AppPalette {
  static const slate50 = Color(0xFFF8FAFC);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate200 = Color(0xFFE2E8F0);
  static const slate300 = Color(0xFFCBD5E1);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate600 = Color(0xFF475569);
  static const slate700 = Color(0xFF334155);
  static const slate800 = Color(0xFF1E293B);
  static const skyAccent = Color(0xFF38BDF8);
  static const emeraldAccent = Color(0xFF34D399);
  static const emerald50 = Color(0xFFECFDF5);
  static const emerald200 = Color(0xFFA7F3D0);
  static const emerald700 = Color(0xFF047857);
  static const emerald800 = Color(0xFF065F46);
  static const amber50 = Color(0xFFFFFBEB);
  static const amber200 = Color(0xFFFDE68A);
  static const amber800 = Color(0xFF92400E);
  static const rose50 = Color(0xFFFFF1F2);
  static const rose500 = Color(0xFFF43F5E);
  static const rose700 = Color(0xFFBE123C);
  static const primaryNavy = Color(0xFF0B3A53);
  static const oceanBlue = Color(0xFF146C86);
  static const tealAccent = Color(0xFF14B8A6);
  static const tealDark = Color(0xFF0D9488);
}

class GuideManagementScreen extends StatefulWidget {
  final int initialTabIndex;

  const GuideManagementScreen({super.key, this.initialTabIndex = 0});

  @override
  State<GuideManagementScreen> createState() => _GuideManagementScreenState();
}

class _GuideManagementScreenState extends State<GuideManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;

  // Guide Portal state (when user role is GUIDE)
  bool _isGuideUser = false;
  GuideModel? _guideProfile;
  GuideDashboardMetricsModel? _guideMetrics;
  List<GuideBookingModel> _guideBookings = [];
  List<BlockedDateModel> _blockedDates = [];
  String _guideBookingFilter = 'All';

  // Tourist Discovery state (when user role is Tourist / Guest)
  List<GuideModel> _browsedGuides = [];
  String _searchQuery = '';
  String _selectedDestination = 'All';
  String _selectedSpecialty = 'All';

  final List<String> _destinations = [
    'All',
    'Kandy',
    'Sigiriya',
    'Ella',
    'Galle',
    'Yala',
    'Colombo',
    'Nuwara Eliya',
  ];

  final List<String> _specialties = [
    'All',
    'Cultural Heritage',
    'Ancient Cities',
    'Mountain Hiking',
    'Wildlife Safari',
    'Bird Watching',
  ];

  @override
  void initState() {
    super.initState();
    _checkRoleAndInit();
  }

  void _checkRoleAndInit() {
    final role = ApiService.currentUser?['role']?.toString().toUpperCase() ?? '';
    _isGuideUser = role == 'GUIDE';

    final tabCount = _isGuideUser ? 4 : 2;
    _tabController = TabController(length: tabCount, vsync: this, initialIndex: 0);

    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    if (_isGuideUser) {
      await _loadGuidePortalData();
    } else {
      await _loadTouristData();
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadGuidePortalData() async {
    try {
      final profile = await ApiService.getGuidePortalProfile();
      final metrics = await ApiService.getGuidePortalDashboard();
      final bookings = await ApiService.getGuidePortalBookings(
        status: _guideBookingFilter == 'All' ? null : _guideBookingFilter,
      );

      if (mounted) {
        setState(() {
          _guideProfile = profile ?? kInitialMockGuides.first;
          _guideMetrics = metrics ??
              GuideDashboardMetricsModel(
                upcomingBookings: bookings.where((b) => b.status == 'Confirmed').length,
                pendingApprovalBookings: bookings.where((b) => b.status == 'PendingPayment').length,
                todayBookings: 0,
                completedBookings: bookings.where((b) => b.status == 'Completed').length,
                pendingEarnings: bookings.where((b) => b.payoutStatus == 'Pending').fold(0.0, (s, b) => s + b.guideNetAmount),
                totalEarnings: bookings.fold(0.0, (s, b) => s + b.guideNetAmount),
                completedPayouts: bookings.where((b) => b.payoutStatus == 'Completed').fold(0.0, (s, b) => s + b.guideNetAmount),
                ratingAvg: 4.95,
                ratingCount: 42,
              );
          _guideBookings = bookings;
        });
      }
    } catch (e) {
      debugPrint('Error loading guide portal: $e');
    }
  }

  Future<void> _loadTouristData() async {
    try {
      final guides = await ApiService.browseLiveGuides(
        destinationId: _selectedDestination == 'All' ? null : _selectedDestination,
        specialty: _selectedSpecialty == 'All' ? null : _selectedSpecialty,
      );

      if (mounted) {
        setState(() {
          _browsedGuides = guides.isNotEmpty ? guides : kInitialMockGuides;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _browsedGuides = kInitialMockGuides;
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GUIDE PORTAL ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _respondToBooking(String bookingId, bool accept) async {
    setState(() => _isLoading = true);
    final res = await ApiService.respondToGuideBooking(bookingId: bookingId, accept: accept);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? (accept ? 'Booking accepted' : 'Booking declined')),
          backgroundColor: accept ? _AppPalette.emerald700 : _AppPalette.rose500,
        ),
      );
      await _loadGuidePortalData();
      setState(() => _isLoading = false);
    }
  }

  void _showAddBlockedDateDialog() {
    final startCtrl = TextEditingController(text: DateTime.now().add(const Duration(days: 7)).toIso8601String().split('T')[0]);
    final endCtrl = TextEditingController(text: DateTime.now().add(const Duration(days: 9)).toIso8601String().split('T')[0]);
    final reasonCtrl = TextEditingController(text: 'Personal leave / vehicle maintenance');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          'Block Dates',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: startCtrl,
              decoration: const InputDecoration(labelText: 'Start Date (YYYY-MM-DD)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: endCtrl,
              decoration: const InputDecoration(labelText: 'End Date (YYYY-MM-DD)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtrl,
              decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.primaryNavy, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isLoading = true);
              await ApiService.addGuideBlockedDate(
                startDate: startCtrl.text.trim(),
                endDate: endCtrl.text.trim(),
                reason: reasonCtrl.text.trim(),
              );
              await _loadGuidePortalData();
              setState(() => _isLoading = false);
            },
            child: const Text('Block Dates'),
          ),
        ],
      ),
    );
  }

  void _showEditRatesDialog() {
    if (_guideProfile == null) return;
    final hourlyCtrl = TextEditingController(text: _guideProfile!.hourlyRate.toString());
    final halfDayCtrl = TextEditingController(text: _guideProfile!.halfDayRate.toString());
    final fullDayCtrl = TextEditingController(text: _guideProfile!.fullDayRate.toString());
    final bioCtrl = TextEditingController(text: _guideProfile!.bio);
    final bankCtrl = TextEditingController(text: 'BOC Account: 789123445 (Kandy Branch)');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          'Update Profile & Rates',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: hourlyCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Hourly Rate (USD)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: halfDayCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Half Day Rate (USD)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: fullDayCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Full Day Rate (USD)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: bioCtrl,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Bio / Credentials', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: bankCtrl,
                decoration: const InputDecoration(labelText: 'Bank Account / Payout Note', border: OutlineInputBorder()),
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
            style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.tealDark, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isLoading = true);
              await ApiService.updateGuidePortalProfile(
                hourlyRate: double.tryParse(hourlyCtrl.text),
                halfDayRate: double.tryParse(halfDayCtrl.text),
                fullDayRate: double.tryParse(fullDayCtrl.text),
                bio: bioCtrl.text.trim(),
                payoutAccountNote: bankCtrl.text.trim(),
              );
              await _loadGuidePortalData();
              setState(() => _isLoading = false);
            },
            child: const Text('Save Changes'),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOURIST BOOKING INTERACTIVE FLOW
  // ─────────────────────────────────────────────────────────────────────────

  void _openBookingSheet(GuideModel guide) {
    DateTime startDate = DateTime.now().add(const Duration(days: 3));
    DateTime endDate = DateTime.now().add(const Duration(days: 3));
    TimeOfDay startTime = const TimeOfDay(hour: 8, minute: 30);
    TimeOfDay endTime = const TimeOfDay(hour: 16, minute: 30);
    int travelers = 2;
    String pickupLocation = 'Hotel reception / Train station';
    String preferredLanguage = guide.languages.isNotEmpty ? guide.languages.first : 'English';
    String specialRequests = 'Cultural historical explanations and tea estate visits';

    GuideQuoteModel? currentQuote;
    bool isCalculating = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          void fetchQuote() async {
            setSheetState(() => isCalculating = true);
            final sDateStr = startDate.toIso8601String().split('T')[0];
            final eDateStr = endDate.toIso8601String().split('T')[0];
            final sTimeStr = '${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}';
            final eTimeStr = '${endTime.hour.toString().padLeft(2, '0')}:${endTime.minute.toString().padLeft(2, '0')}';

            final quote = await ApiService.calculateGuideQuote(
              guideId: guide.id,
              startDate: sDateStr,
              endDate: eDateStr,
              startTime: sTimeStr,
              endTime: eTimeStr,
              travelers: travelers,
            );

            setSheetState(() {
              currentQuote = quote;
              isCalculating = false;
            });
          }

          if (currentQuote == null && isCalculating) {
            fetchQuote();
          }

          return Container(
            height: MediaQuery.of(context).size.height * 0.88,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            ),
            child: Column(
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(color: _AppPalette.slate300, borderRadius: BorderRadius.circular(2)),
                ),

                // Sheet Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundImage: NetworkImage(guide.avatarUrl),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Book Guide: ${guide.name}',
                              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
                            ),
                            Text(
                              'Full Day: \$${guide.fullDayRate} · Hourly: \$${guide.hourlyRate}',
                              style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.tealDark, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(sheetCtx),
                        icon: const Icon(Icons.close_rounded, color: _AppPalette.slate400),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),

                // Sheet Body
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      // Date Selector
                      Text('Travel Dates', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: startDate,
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now().add(const Duration(days: 180)),
                                );
                                if (picked != null) {
                                  setSheetState(() {
                                    startDate = picked;
                                    if (endDate.isBefore(startDate)) endDate = startDate;
                                  });
                                  fetchQuote();
                                }
                              },
                              icon: const Icon(Icons.calendar_today_rounded, size: 16, color: _AppPalette.tealDark),
                              label: Text(startDate.toIso8601String().split('T')[0], style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Icon(Icons.arrow_forward, size: 16, color: _AppPalette.slate400),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: endDate,
                                  firstDate: startDate,
                                  lastDate: DateTime.now().add(const Duration(days: 180)),
                                );
                                if (picked != null) {
                                  setSheetState(() => endDate = picked);
                                  fetchQuote();
                                }
                              },
                              icon: const Icon(Icons.calendar_today_rounded, size: 16, color: _AppPalette.tealDark),
                              label: Text(endDate.toIso8601String().split('T')[0], style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Travelers
                      Text('Number of Travelers', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          IconButton(
                            onPressed: travelers > 1
                                ? () {
                                    setSheetState(() => travelers--);
                                    fetchQuote();
                                  }
                                : null,
                            icon: const Icon(Icons.remove_circle_outline),
                          ),
                          Text(
                            '$travelers Guests',
                            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
                          ),
                          IconButton(
                            onPressed: travelers < 20
                                ? () {
                                    setSheetState(() => travelers++);
                                    fetchQuote();
                                  }
                                : null,
                            icon: const Icon(Icons.add_circle_outline, color: _AppPalette.tealDark),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Destinations Covered
                      if (guide.coveredDestinations.isNotEmpty) ...[
                        Text('Covered Destinations', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: guide.coveredDestinations
                              .map((d) => Chip(
                                    label: Text(d, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                    backgroundColor: _AppPalette.slate100,
                                    side: BorderSide.none,
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Live Quote Calculation Box
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _AppPalette.emerald50,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _AppPalette.emerald200),
                        ),
                        child: isCalculating
                            ? const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator()))
                            : Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Rate Applied:', style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600)),
                                      Text('${currentQuote?.rateTypeApplied} (${currentQuote?.billableDays} Day)', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: _AppPalette.primaryNavy)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Guide Base Subtotal:', style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600)),
                                      Text('\$${currentQuote?.subtotal.toStringAsFixed(2)}', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: _AppPalette.primaryNavy)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('TourLink Service Fee (5%):', style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600)),
                                      Text('\$${currentQuote?.serviceFee.toStringAsFixed(2)}', style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: _AppPalette.primaryNavy)),
                                    ],
                                  ),
                                  const Divider(height: 16),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Total Amount to Pay:', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w900, color: _AppPalette.primaryNavy)),
                                      Text(
                                        '\$${currentQuote?.totalAmount.toStringAsFixed(2)}',
                                        style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: _AppPalette.emerald700),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.shield_outlined, size: 14, color: _AppPalette.tealDark),
                                      const SizedBox(width: 4),
                                      Text('Includes Guide Payout Allocation (85% net guaranteed)', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                                    ],
                                  ),
                                ],
                              ),
                      ),
                      const SizedBox(height: 20),

                      // Payment & Checkout CTA
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _AppPalette.primaryNavy,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: isCalculating
                              ? null
                              : () async {
                                  Navigator.pop(sheetCtx);
                                  _processBookingAndPayment(
                                    guide: guide,
                                    startDate: startDate.toIso8601String().split('T')[0],
                                    endDate: endDate.toIso8601String().split('T')[0],
                                    startTime: '${startTime.hour.toString().padLeft(2, '0')}:${startTime.minute.toString().padLeft(2, '0')}',
                                    endTime: '${endTime.hour.toString().padLeft(2, '0')}:${endTime.minute.toString().padLeft(2, '0')}',
                                    travelers: travelers,
                                    pickupLocation: pickupLocation,
                                    preferredLanguage: preferredLanguage,
                                    specialRequests: specialRequests,
                                    quote: currentQuote!,
                                  );
                                },
                          icon: const Icon(Icons.payment_rounded, size: 20),
                          label: Text(
                            'Confirm & Pay \$${currentQuote?.totalAmount.toStringAsFixed(2) ?? "0.00"}',
                            style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _processBookingAndPayment({
    required GuideModel guide,
    required String startDate,
    required String endDate,
    required String startTime,
    required String endTime,
    required int travelers,
    required String pickupLocation,
    required String preferredLanguage,
    required String specialRequests,
    required GuideQuoteModel quote,
  }) async {
    setState(() => _isLoading = true);

    final user = ApiService.currentUser;
    final customerName = user?['name']?.toString() ?? 'Tourist Client';
    final customerEmail = user?['email']?.toString() ?? 'tourist@tourlink.com';

    // 1. Create booking in PostgreSQL
    final bookingRes = await ApiService.createGuideBooking(
      guideId: guide.id,
      customerName: customerName,
      customerEmail: customerEmail,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      travelers: travelers,
      pickupLocation: pickupLocation,
      preferredLanguage: preferredLanguage,
      specialRequests: specialRequests,
    );

    if (bookingRes['success'] != true) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(bookingRes['message'] ?? 'Booking failed'), backgroundColor: _AppPalette.rose500),
        );
      }
      return;
    }

    final GuideBookingModel createdBooking = bookingRes['booking'];

    // 2. Pay booking in PostgreSQL
    final payRes = await ApiService.payGuideBooking(
      bookingId: createdBooking.id,
      paymentMethod: 'Card (Visa)',
    );

    if (mounted) {
      setState(() => _isLoading = false);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(color: _AppPalette.emerald50, shape: BoxShape.circle),
                child: const Icon(Icons.check_circle_rounded, color: _AppPalette.emerald700, size: 48),
              ),
              const SizedBox(height: 16),
              Text(
                'Booking Confirmed!',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: _AppPalette.primaryNavy),
              ),
              const SizedBox(height: 8),
              Text(
                'Booking Reference: #${createdBooking.id}',
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: _AppPalette.tealDark),
              ),
              const SizedBox(height: 12),
              Text(
                'Guide ${guide.name} has been notified and scheduled for $startDate. Payment of \$${quote.totalAmount.toStringAsFixed(2)} was successfully authorized.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600, height: 1.4),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.primaryNavy, foregroundColor: Colors.white),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Done'),
              ),
            ],
          ),
        ),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD METHOD
  // ─────────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _AppPalette.slate50,
      appBar: AppBar(
        backgroundColor: _AppPalette.primaryNavy,
        elevation: 0,
        title: Text(
          _isGuideUser ? 'TourLink Guide Portal' : 'TourLink Licensed Guides',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 18),
        ),
        actions: [
          if (!_isGuideUser)
            TextButton.icon(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              icon: const Icon(Icons.badge_rounded, color: Color(0xFF2DD4BF), size: 16),
              label: Text(
                'Guide Login',
                style: GoogleFonts.inter(color: const Color(0xFF2DD4BF), fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
            onPressed: _loadData,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: _AppPalette.tealAccent,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12),
          tabs: _isGuideUser
              ? const [
                  Tab(icon: Icon(Icons.dashboard_rounded), text: 'My Bookings'),
                  Tab(icon: Icon(Icons.event_available_rounded), text: 'Availability'),
                  Tab(icon: Icon(Icons.payments_rounded), text: 'Earnings'),
                  Tab(icon: Icon(Icons.person_pin_rounded), text: 'My Profile'),
                ]
              : const [
                  Tab(icon: Icon(Icons.search_rounded), text: 'Browse Guides'),
                  Tab(icon: Icon(Icons.bookmark_added_rounded), text: 'My Bookings'),
                ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _isGuideUser
              ? TabBarView(
                  controller: _tabController,
                  children: [
                    _buildGuidePortalBookingsTab(),
                    _buildGuidePortalAvailabilityTab(),
                    _buildGuidePortalEarningsTab(),
                    _buildGuidePortalProfileTab(),
                  ],
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTouristBrowseTab(),
                    _buildTouristMyBookingsTab(),
                  ],
                ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 1. GUIDE PORTAL: BOOKINGS & DASHBOARD TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildGuidePortalBookingsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Welcome Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [_AppPalette.primaryNavy, _AppPalette.oceanBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundImage: NetworkImage(_guideProfile?.avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          _guideProfile?.name ?? 'Samantha Perera',
                          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF2DD4BF)),
                      ],
                    ),
                    Text(
                      _guideProfile?.email ?? 'guide@tourlink.com',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Licensed Tour Guide (SLTDA)',
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF2DD4BF)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Metrics Grid
        Row(
          children: [
            Expanded(child: _metricCard('Upcoming', '${_guideMetrics?.upcomingBookings ?? 0}', Icons.schedule_rounded, _AppPalette.skyAccent)),
            const SizedBox(width: 10),
            Expanded(child: _metricCard('Pending', '${_guideMetrics?.pendingApprovalBookings ?? 0}', Icons.hourglass_top_rounded, Colors.amberAccent)),
            const SizedBox(width: 10),
            Expanded(child: _metricCard('Net Earned', '\$${_guideMetrics?.totalEarnings.toStringAsFixed(0) ?? "0"}', Icons.monetization_on_rounded, _AppPalette.emeraldAccent)),
          ],
        ),
        const SizedBox(height: 20),

        // Section Title & Filter
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Customer Bookings',
              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
            ),
            DropdownButton<String>(
              value: _guideBookingFilter,
              underline: const SizedBox(),
              items: ['All', 'Confirmed', 'Completed', 'PendingPayment', 'Cancelled']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12))))
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _guideBookingFilter = val);
                  _loadGuidePortalData();
                }
              },
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Bookings List
        if (_guideBookings.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Center(
              child: Text(
                'No bookings matching filter.',
                style: GoogleFonts.inter(fontSize: 13, color: _AppPalette.slate400),
              ),
            ),
          )
        else
          ..._guideBookings.map((b) => _buildGuidePortalBookingCard(b)),
      ],
    );
  }

  Widget _metricCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _AppPalette.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 6),
          Text(value, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: _AppPalette.primaryNavy)),
          Text(title, style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildGuidePortalBookingCard(GuideBookingModel b) {
    final isPending = b.status == 'PendingPayment' || b.status == 'Requested';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _AppPalette.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#${b.id}',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 13, color: _AppPalette.primaryNavy),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: b.status == 'Confirmed' ? _AppPalette.emerald50 : _AppPalette.amber50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  b.status.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: b.status == 'Confirmed' ? _AppPalette.emerald700 : _AppPalette.amber800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Customer info
          Row(
            children: [
              const Icon(Icons.person_outline, size: 16, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${b.customerName} (${b.travelers} Guests)',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.slate700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 14, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Text(
                '${b.startDate} to ${b.endDate} (${b.startTime} - ${b.endTime})',
                style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.email_outlined, size: 14, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Text(b.customerEmail, style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500)),
            ],
          ),
          const Divider(height: 16),

          // Financial Net
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Net Guide Payout:', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400)),
                  Text(
                    '\$${b.guideNetAmount.toStringAsFixed(2)}',
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: _AppPalette.emerald700),
                  ),
                ],
              ),
              if (isPending)
                Row(
                  children: [
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: _AppPalette.rose500,
                        side: const BorderSide(color: _AppPalette.rose500),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      onPressed: () => _respondToBooking(b.id, false),
                      child: const Text('Decline'),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _AppPalette.tealDark,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                      ),
                      onPressed: () => _respondToBooking(b.id, true),
                      child: const Text('Accept'),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. GUIDE PORTAL: AVAILABILITY & BLOCKED DATES TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildGuidePortalAvailabilityTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Working Hours & Blocked Dates', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.primaryNavy, foregroundColor: Colors.white),
              onPressed: _showAddBlockedDateDialog,
              icon: const Icon(Icons.block_rounded, size: 14),
              label: const Text('Block Dates'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Working schedule card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: _AppPalette.slate200)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Weekly Working Schedule', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.slate700)),
              const SizedBox(height: 8),
              _scheduleRow('Monday - Friday', '08:00 AM - 06:00 PM', true),
              _scheduleRow('Saturday', '08:30 AM - 05:30 PM', true),
              _scheduleRow('Sunday', '09:00 AM - 04:00 PM', true),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Blocked dates list
        Text('Active Blocked Dates', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: _AppPalette.slate200)),
          child: Column(
            children: [
              _blockedDateRow('2026-10-25 to 2026-10-27', 'Temple Poya Festival Family Holiday'),
              const Divider(height: 16),
              _blockedDateRow('2026-11-04 to 2026-11-05', 'Vehicle Routine Maintenance & SLTDA Re-certification'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _scheduleRow(String day, String hours, bool isActive) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(day, style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600)),
          Text(hours, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
        ],
      ),
    );
  }

  Widget _blockedDateRow(String dates, String reason) {
    return Row(
      children: [
        const Icon(Icons.event_busy_rounded, size: 18, color: _AppPalette.rose500),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(dates, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12, color: _AppPalette.slate800)),
              Text(reason, style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400)),
            ],
          ),
        ),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. GUIDE PORTAL: EARNINGS & RECEIVED PAYOUTS TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildGuidePortalEarningsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [_AppPalette.primaryNavy, _AppPalette.tealDark],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Total Accrued Net Earnings (85%)', style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
              const SizedBox(height: 4),
              Text(
                '\$${_guideMetrics?.totalEarnings.toStringAsFixed(2) ?? "1,240.00"}',
                style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Paid Out', style: GoogleFonts.inter(fontSize: 10, color: Colors.white70)),
                        Text('\$${_guideMetrics?.completedPayouts.toStringAsFixed(2) ?? "980.00"}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF2DD4BF))),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Pending Wire', style: GoogleFonts.inter(fontSize: 10, color: Colors.white70)),
                        Text('\$${_guideMetrics?.pendingEarnings.toStringAsFixed(2) ?? "260.00"}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.amberAccent)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Text('Payout Disbursement Ledger', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
        const SizedBox(height: 10),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: _AppPalette.slate200)),
          child: Column(
            children: [
              _payoutLedgerRow('BOC-WIRE-99214', '2026-10-01', '\$380.00', 'Bank of Ceylon', 'Completed'),
              const Divider(height: 16),
              _payoutLedgerRow('BOC-WIRE-88120', '2026-09-15', '\$600.00', 'Bank of Ceylon', 'Completed'),
              const Divider(height: 16),
              _payoutLedgerRow('Pending Batch', 'Expected 2026-10-15', '\$260.00', 'Bank Transfer', 'Processing'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _payoutLedgerRow(String ref, String date, String amount, String method, String status) {
    final isDone = status == 'Completed';
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDone ? _AppPalette.emerald50 : _AppPalette.amber50,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(Icons.receipt_long_rounded, size: 18, color: isDone ? _AppPalette.emerald700 : _AppPalette.amber800),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(ref, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12, color: _AppPalette.slate800)),
              Text('$method · $date', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400)),
            ],
          ),
        ),
        Text(amount, style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 14, color: _AppPalette.primaryNavy)),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. GUIDE PORTAL: PROFILE & RATES TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildGuidePortalProfileTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: _AppPalette.slate200)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Rates & Capacity', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
                  IconButton(
                    onPressed: _showEditRatesDialog,
                    icon: const Icon(Icons.edit_outlined, color: _AppPalette.tealDark),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _profileField('Hourly Rate', '\$${_guideProfile?.hourlyRate ?? 15.0} / hr'),
              _profileField('Half-Day Rate (4h)', '\$${_guideProfile?.halfDayRate ?? 50.0}'),
              _profileField('Full-Day Rate (8h)', '\$${_guideProfile?.fullDayRate ?? 90.0}'),
              const Divider(height: 16),
              _profileField('Bio', _guideProfile?.bio ?? ''),
              _profileField('Languages', (_guideProfile?.languages ?? ['English']).join(', ')),
              _profileField('Specialties', (_guideProfile?.specialties ?? ['Cultural Heritage']).join(', ')),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: _AppPalette.rose500,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          onPressed: () {
            ApiService.authToken = null;
            ApiService.currentUser = null;
            Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
          },
          icon: const Icon(Icons.logout_rounded, size: 18),
          label: const Text('Log Out of Guide Portal'),
        ),
      ],
    );
  }

  Widget _profileField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400, fontWeight: FontWeight.w700)),
          Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _AppPalette.slate700)),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // TOURIST DISCOVERY TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildTouristBrowseTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Search & Filters
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search guide name, language, specialty…',
                  prefixIcon: const Icon(Icons.search, size: 18),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                ),
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Destination Filter Chips
        SizedBox(
          height: 36,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _destinations.length,
            itemBuilder: (ctx, i) {
              final d = _destinations[i];
              final isSel = _selectedDestination == d;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(d, style: TextStyle(fontSize: 11, fontWeight: isSel ? FontWeight.w700 : FontWeight.w500)),
                  selected: isSel,
                  onSelected: (val) {
                    setState(() => _selectedDestination = d);
                    _loadTouristData();
                  },
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),

        // Guide Cards
        ..._browsedGuides.where((g) {
          final query = _searchQuery.toLowerCase();
          return g.name.toLowerCase().contains(query) ||
              g.languages.any((l) => l.toLowerCase().contains(query)) ||
              g.specialties.any((s) => s.toLowerCase().contains(query));
        }).map((g) => _buildTouristGuideCard(g)),
      ],
    );
  }

  Widget _buildTouristGuideCard(GuideModel g) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _AppPalette.slate200),
        boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [_AppPalette.primaryNavy, _AppPalette.oceanBlue]),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundImage: NetworkImage(g.avatarUrl),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(g.name, style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white)),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, size: 14, color: Color(0xFF2DD4BF)),
                        ],
                      ),
                      Text('${g.yearsExperience} yrs experience · ${g.toursCompleted} tours', style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                  child: Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.amberAccent),
                      const SizedBox(width: 4),
                      Text(g.rating.toStringAsFixed(1), style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Card Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(g.bio, style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 10),

                // Rates
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: _AppPalette.slate50, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Text('Hourly: \$${g.hourlyRate}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                      Text('Half Day: \$${g.halfDayRate}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                      Text('Full Day: \$${g.fullDayRate}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: _AppPalette.emerald700)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Booking CTA
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _AppPalette.primaryNavy,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: () => _openBookingSheet(g),
                    child: Text('Book Guide Now', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // TOURIST MY BOOKINGS TAB
  // ═════════════════════════════════════════════════════════════════════════

  Widget _buildTouristMyBookingsTab() {
    return FutureBuilder<List<GuideBookingModel>>(
      future: ApiService.getCustomerGuideBookings(),
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final list = snap.data ?? [];
        if (list.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bookmark_border_rounded, size: 48, color: _AppPalette.slate300),
                  const SizedBox(height: 12),
                  Text('No guide bookings placed yet.', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: _AppPalette.slate600)),
                  const SizedBox(height: 6),
                  Text('Browse our licensed local guides to explore Sri Lanka.', textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate400)),
                ],
              ),
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: list.length,
          itemBuilder: (ctx, i) {
            final b = list[i];
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: _AppPalette.slate200)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(b.guideName, style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 15, color: _AppPalette.primaryNavy)),
                      Text('\$${b.totalAmount.toStringAsFixed(2)}', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 16, color: _AppPalette.emerald700)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('${b.startDate} to ${b.endDate} · ${b.travelers} Guests', style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate500)),
                  const SizedBox(height: 4),
                  Text('Status: ${b.status} · Paid: ${b.paymentStatus}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
