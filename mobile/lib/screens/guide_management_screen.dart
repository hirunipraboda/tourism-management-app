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

class DriverAvailableDate {
  final int id;
  final String date;
  final String startTime;
  final String endTime;
  final String vehicleType;
  final String note;

  DriverAvailableDate({
    required this.id,
    required this.date,
    this.startTime = '08:00 AM',
    this.endTime = '06:00 PM',
    this.vehicleType = 'Toyota KDH Luxury Van',
    this.note = 'Full Day Tour & Transport Ready',
  });
}

class DriverBlockedDate {
  final int id;
  final String startDate;
  final String endDate;
  final String reason;

  DriverBlockedDate({
    required this.id,
    required this.startDate,
    required this.endDate,
    required this.reason,
  });
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

  // Availability Management State (Driver / Guide)
  int _availabilityMode = 0; // 0: Available Dates, 1: Unavailable (Blocked) Dates
  final List<DriverAvailableDate> _driverAvailableDates = [
    DriverAvailableDate(
      id: 1,
      date: '2026-10-14',
      startTime: '08:00 AM',
      endTime: '06:00 PM',
      vehicleType: 'Toyota KDH Luxury Van',
      note: 'Kandy & Cultural Triangle Day Tour Available',
    ),
    DriverAvailableDate(
      id: 2,
      date: '2026-10-15',
      startTime: '07:30 AM',
      endTime: '07:00 PM',
      vehicleType: 'Sedan (Air-conditioned)',
      note: 'Sigiriya & Dambulla Excursion Ready',
    ),
    DriverAvailableDate(
      id: 3,
      date: '2026-10-18',
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      vehicleType: 'Toyota KDH Luxury Van',
      note: 'Tea Plantations & Nuwara Eliya Scenic Drive',
    ),
    DriverAvailableDate(
      id: 4,
      date: '2026-10-20',
      startTime: '09:00 AM',
      endTime: '06:30 PM',
      vehicleType: 'SUV 4WD',
      note: 'Galle Fort Heritage & Southern Coast Tour',
    ),
  ];

  final List<DriverBlockedDate> _driverBlockedDates = [
    DriverBlockedDate(
      id: 1,
      startDate: '2026-10-25',
      endDate: '2026-10-27',
      reason: 'Temple Poya Festival Family Holiday',
    ),
    DriverBlockedDate(
      id: 2,
      startDate: '2026-11-04',
      endDate: '2026-11-05',
      reason: 'Vehicle Routine Maintenance & SLTDA Re-certification',
    ),
  ];

  // Weekly Working Schedule State (Editable by Driver/Guide)
  String _weekdayHours = '08:00 AM - 06:00 PM';
  String _saturdayHours = '08:30 AM - 05:30 PM';
  String _sundayHours = '09:00 AM - 04:00 PM';
  bool _weekdayActive = true;
  bool _saturdayActive = true;
  bool _sundayActive = true;

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

  void _showAddAvailableDateDialog() {
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    String startTime = '08:00 AM';
    String endTime = '06:00 PM';
    String selectedVehicle = 'Toyota KDH Luxury Van';
    final noteCtrl = TextEditingController(text: 'Full Day Islandwide Tour & Transfer Ready');

    final vehicleOptions = [
      'Toyota KDH Luxury Van',
      'Sedan Car (Air-conditioned)',
      'SUV 4WD',
      'Toyota Coaster Minicoach',
      'Licensed Guide Only (No Vehicle)',
    ];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _AppPalette.emerald50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.event_available_rounded, color: _AppPalette.emerald700, size: 22),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Add Available Date',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy, fontSize: 18),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Select Date', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 180)),
                    );
                    if (picked != null) {
                      setDialogState(() => selectedDate = picked);
                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: _AppPalette.slate300),
                      borderRadius: BorderRadius.circular(12),
                      color: _AppPalette.slate50,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          selectedDate.toIso8601String().split('T')[0],
                          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, color: _AppPalette.slate800),
                        ),
                        const Icon(Icons.calendar_today_rounded, size: 18, color: _AppPalette.tealDark),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                Text('Working Hours', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(border: Border.all(color: _AppPalette.slate300), borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Start', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                            Text(startTime, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.primaryNavy)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(border: Border.all(color: _AppPalette.slate300), borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('End', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                            Text(endTime, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.primaryNavy)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: [
                    ActionChip(
                      label: const Text('Full Day (8am-6pm)', style: TextStyle(fontSize: 10)),
                      backgroundColor: _AppPalette.emerald50,
                      onPressed: () => setDialogState(() {
                        startTime = '08:00 AM';
                        endTime = '06:00 PM';
                      }),
                    ),
                    ActionChip(
                      label: const Text('Morning (8am-1pm)', style: TextStyle(fontSize: 10)),
                      backgroundColor: _AppPalette.slate100,
                      onPressed: () => setDialogState(() {
                        startTime = '08:00 AM';
                        endTime = '01:00 PM';
                      }),
                    ),
                    ActionChip(
                      label: const Text('Afternoon (1pm-7pm)', style: TextStyle(fontSize: 10)),
                      backgroundColor: _AppPalette.slate100,
                      onPressed: () => setDialogState(() {
                        startTime = '01:00 PM';
                        endTime = '07:00 PM';
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                Text('Assigned Vehicle / Transport', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: selectedVehicle,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: vehicleOptions.map((v) => DropdownMenuItem(value: v, child: Text(v, style: const TextStyle(fontSize: 12)))).toList(),
                  onChanged: (v) {
                    if (v != null) setDialogState(() => selectedVehicle = v);
                  },
                ),
                const SizedBox(height: 14),

                Text('Tour / Route Notes', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                TextField(
                  controller: noteCtrl,
                  style: const TextStyle(fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'e.g., Kandy & Sigiriya day tour or airport pickup',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
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
                final dateStr = selectedDate.toIso8601String().split('T')[0];
                final newId = DateTime.now().millisecondsSinceEpoch;
                Navigator.pop(ctx);

                setState(() {
                  _driverAvailableDates.insert(
                    0,
                    DriverAvailableDate(
                      id: newId,
                      date: dateStr,
                      startTime: startTime,
                      endTime: endTime,
                      vehicleType: selectedVehicle,
                      note: noteCtrl.text.trim().isNotEmpty ? noteCtrl.text.trim() : 'Available for hire',
                    ),
                  );
                });

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Available date ($dateStr) added successfully!'),
                    backgroundColor: _AppPalette.emerald700,
                  ),
                );

                if (_guideProfile != null) {
                  await ApiService.addGuideAvailabilitySlot(
                    guideId: _guideProfile!.id,
                    availableDate: dateStr,
                    startTime: startTime,
                    endTime: endTime,
                  );
                }
              },
              child: const Text('Add Available Date'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddBlockedDateDialog() {
    DateTime startDate = DateTime.now().add(const Duration(days: 7));
    DateTime endDate = DateTime.now().add(const Duration(days: 9));
    final reasonCtrl = TextEditingController(text: 'Vehicle Routine Maintenance');

    final reasonSuggestions = [
      'Vehicle Maintenance',
      'Personal Leave / Holiday',
      'Family Event',
      'Poya Festival / Public Holiday',
      'Rest Day / Off-Duty',
    ];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _AppPalette.rose50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.block_rounded, color: _AppPalette.rose500, size: 22),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Block Unavailable Dates',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy, fontSize: 18),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Date Range', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: startDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 180)),
                          );
                          if (picked != null) {
                            setDialogState(() {
                              startDate = picked;
                              if (endDate.isBefore(startDate)) endDate = startDate;
                            });
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          decoration: BoxDecoration(border: Border.all(color: _AppPalette.slate300), borderRadius: BorderRadius.circular(12), color: _AppPalette.slate50),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('From', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                              Text(startDate.toIso8601String().split('T')[0], style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate800)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: endDate.isBefore(startDate) ? startDate : endDate,
                            firstDate: startDate,
                            lastDate: DateTime.now().add(const Duration(days: 180)),
                          );
                          if (picked != null) {
                            setDialogState(() => endDate = picked);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          decoration: BoxDecoration(border: Border.all(color: _AppPalette.slate300), borderRadius: BorderRadius.circular(12), color: _AppPalette.slate50),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('To', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                              Text(endDate.toIso8601String().split('T')[0], style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate800)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                Text('Reason for Unavailability', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                const SizedBox(height: 6),
                TextField(
                  controller: reasonCtrl,
                  style: const TextStyle(fontSize: 12),
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: reasonSuggestions.map((r) => ActionChip(
                    label: Text(r, style: const TextStyle(fontSize: 10)),
                    backgroundColor: _AppPalette.slate100,
                    onPressed: () => setDialogState(() => reasonCtrl.text = r),
                  )).toList(),
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
              style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.rose500, foregroundColor: Colors.white),
              onPressed: () async {
                final sStr = startDate.toIso8601String().split('T')[0];
                final eStr = endDate.toIso8601String().split('T')[0];
                final newId = DateTime.now().millisecondsSinceEpoch;
                Navigator.pop(ctx);

                setState(() {
                  _driverBlockedDates.insert(
                    0,
                    DriverBlockedDate(
                      id: newId,
                      startDate: sStr,
                      endDate: eStr,
                      reason: reasonCtrl.text.trim().isNotEmpty ? reasonCtrl.text.trim() : 'Unavailable / Personal Leave',
                    ),
                  );
                });

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Dates ($sStr to $eStr) marked as unavailable.'),
                    backgroundColor: _AppPalette.rose700,
                  ),
                );

                await ApiService.addGuideBlockedDate(
                  startDate: sStr,
                  endDate: eStr,
                  reason: reasonCtrl.text.trim(),
                );
              },
              child: const Text('Block Dates'),
            ),
          ],
        ),
      ),
    );
  }

  void _removeAvailableDate(DriverAvailableDate item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Remove Available Date?', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
        content: Text('Are you sure you want to remove ${item.date} from your available schedule?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.rose500, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() {
                _driverAvailableDates.removeWhere((d) => d.id == item.id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Removed ${item.date} from available schedule.'), backgroundColor: _AppPalette.slate700),
              );
              if (_guideProfile != null) {
                await ApiService.removeGuideAvailabilitySlot(_guideProfile!.id, item.id);
              }
            },
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  void _removeBlockedDate(DriverBlockedDate item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Unblock Dates?', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
        content: Text('Restore availability for ${item.startDate} to ${item.endDate}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.tealDark, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() {
                _driverBlockedDates.removeWhere((b) => b.id == item.id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Unblocked ${item.startDate} to ${item.endDate}. Now available for bookings.'), backgroundColor: _AppPalette.emerald700),
              );
              await ApiService.removeGuideBlockedDate(item.id);
            },
            child: const Text('Unblock'),
          ),
        ],
      ),
    );
  }

  Future<void> _syncWeeklyWorkingHours() async {
    String to24h(String timeStr) {
      try {
        final parts = timeStr.trim().split(' ');
        if (parts.isEmpty) return '08:00';
        final hm = parts[0].split(':');
        int hour = int.parse(hm[0]);
        final min = hm.length > 1 ? hm[1] : '00';
        if (parts.length > 1) {
          final ampm = parts[1].toUpperCase();
          if (ampm == 'PM' && hour < 12) hour += 12;
          if (ampm == 'AM' && hour == 12) hour = 0;
        }
        return '${hour.toString().padLeft(2, '0')}:$min';
      } catch (_) {
        return '08:00';
      }
    }

    final List<Map<String, dynamic>> hoursList = [];
    if (_weekdayActive) {
      final range = _weekdayHours.split('-');
      final s = range.isNotEmpty ? to24h(range[0]) : '08:00';
      final e = range.length > 1 ? to24h(range[1]) : '18:00';
      for (int dow = 1; dow <= 5; dow++) {
        hoursList.add({'dayOfWeek': dow, 'startTime': s, 'endTime': e});
      }
    }
    if (_saturdayActive) {
      final range = _saturdayHours.split('-');
      final s = range.isNotEmpty ? to24h(range[0]) : '08:30';
      final e = range.length > 1 ? to24h(range[1]) : '17:30';
      hoursList.add({'dayOfWeek': 6, 'startTime': s, 'endTime': e});
    }
    if (_sundayActive) {
      final range = _sundayHours.split('-');
      final s = range.isNotEmpty ? to24h(range[0]) : '09:00';
      final e = range.length > 1 ? to24h(range[1]) : '16:00';
      hoursList.add({'dayOfWeek': 0, 'startTime': s, 'endTime': e});
    }

    await ApiService.setGuideWorkingHours(hoursList);
  }

  void _showEditDayScheduleDialog({
    required String dayLabel,
    required String currentHours,
    required bool isActive,
    required Function(String newHours, bool newActive) onSave,
  }) {
    bool active = isActive;
    final parts = currentHours.split('-');
    final startCtrl = TextEditingController(text: parts.isNotEmpty ? parts[0].trim() : '08:00 AM');
    final endCtrl = TextEditingController(text: parts.length > 1 ? parts[1].trim() : '06:00 PM');

    final presets = [
      {'label': '8:00 AM - 5:00 PM', 'start': '08:00 AM', 'end': '05:00 PM'},
      {'label': '8:00 AM - 6:00 PM', 'start': '08:00 AM', 'end': '06:00 PM'},
      {'label': '8:30 AM - 5:30 PM', 'start': '08:30 AM', 'end': '05:30 PM'},
      {'label': '9:00 AM - 4:00 PM', 'start': '09:00 AM', 'end': '04:00 PM'},
      {'label': '7:00 AM - 7:00 PM (Full Day)', 'start': '07:00 AM', 'end': '07:00 PM'},
      {'label': '8:00 AM - 1:00 PM (Morning)', 'start': '08:00 AM', 'end': '01:00 PM'},
    ];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          contentPadding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: _AppPalette.tealDark.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.access_time_filled_rounded, color: _AppPalette.tealDark, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Edit Operating Hours', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, color: _AppPalette.primaryNavy)),
                    Text(dayLabel, style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500)),
                  ],
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Active Switch
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: active ? _AppPalette.emerald50 : _AppPalette.slate100,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: active ? _AppPalette.emerald200 : _AppPalette.slate200),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            active ? Icons.check_circle_rounded : Icons.block_rounded,
                            size: 16,
                            color: active ? _AppPalette.emerald700 : _AppPalette.slate500,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            active ? 'Available for Tours' : 'Off-Duty (Day Off)',
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              color: active ? _AppPalette.emerald700 : _AppPalette.slate600,
                            ),
                          ),
                        ],
                      ),
                      Switch.adaptive(
                        value: active,
                        activeColor: _AppPalette.tealDark,
                        onChanged: (val) => setDialogState(() => active = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                if (active) ...[
                  Text('Operating Hours Window', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: startCtrl,
                          decoration: InputDecoration(
                            labelText: 'Start Time',
                            labelStyle: GoogleFonts.inter(fontSize: 11),
                            prefixIcon: const Icon(Icons.wb_sunny_outlined, size: 16, color: _AppPalette.tealDark),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: endCtrl,
                          decoration: InputDecoration(
                            labelText: 'End Time',
                            labelStyle: GoogleFonts.inter(fontSize: 11),
                            prefixIcon: const Icon(Icons.nights_stay_outlined, size: 16, color: _AppPalette.tealDark),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Text('Quick Presets', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _AppPalette.slate500)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: presets.map((p) => InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () {
                        setDialogState(() {
                          startCtrl.text = p['start']!;
                          endCtrl.text = p['end']!;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: _AppPalette.slate100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _AppPalette.slate300),
                        ),
                        child: Text(
                          p['label']!,
                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: _AppPalette.slate700),
                        ),
                      ),
                    )).toList(),
                  ),
                ] else ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      'Driver will be marked as unavailable on $dayLabel. Tourists cannot book tours on these days unless custom dates are added.',
                      style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500, height: 1.4),
                    ),
                  ),
                ],
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
              onPressed: () {
                final s = startCtrl.text.trim();
                final e = endCtrl.text.trim();
                final formatted = active ? '$s - $e' : 'Off-duty / Closed';
                Navigator.pop(ctx);
                onSave(formatted, active);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('$dayLabel schedule updated: $formatted'),
                    backgroundColor: _AppPalette.tealDark,
                  ),
                );
              },
              child: const Text('Save Hours'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditWeeklyScheduleDialog() {
    bool wActive = _weekdayActive;
    bool satActive = _saturdayActive;
    bool sunActive = _sundayActive;

    final wParts = _weekdayHours.split('-');
    final satParts = _saturdayHours.split('-');
    final sunParts = _sundayHours.split('-');

    final wStartCtrl = TextEditingController(text: wParts.isNotEmpty ? wParts[0].trim() : '08:00 AM');
    final wEndCtrl = TextEditingController(text: wParts.length > 1 ? wParts[1].trim() : '06:00 PM');

    final satStartCtrl = TextEditingController(text: satParts.isNotEmpty ? satParts[0].trim() : '08:30 AM');
    final satEndCtrl = TextEditingController(text: satParts.length > 1 ? satParts[1].trim() : '05:30 PM');

    final sunStartCtrl = TextEditingController(text: sunParts.isNotEmpty ? sunParts[0].trim() : '09:00 AM');
    final sunEndCtrl = TextEditingController(text: sunParts.length > 1 ? sunParts[1].trim() : '04:00 PM');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          contentPadding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: _AppPalette.tealDark.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.edit_calendar_rounded, color: _AppPalette.tealDark, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Edit Weekly Operating Hours', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, color: _AppPalette.primaryNavy)),
                    Text('Configure standard weekly availability for driver bookings', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate500)),
                  ],
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Quick Full Schedule Presets
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                          side: const BorderSide(color: _AppPalette.tealDark),
                        ),
                        onPressed: () {
                          setDialogState(() {
                            wActive = true;
                            satActive = true;
                            sunActive = false;
                            wStartCtrl.text = '08:00 AM';
                            wEndCtrl.text = '06:00 PM';
                            satStartCtrl.text = '08:30 AM';
                            satEndCtrl.text = '05:30 PM';
                          });
                        },
                        child: Text('Mon-Sat (Sun Off)', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                          side: const BorderSide(color: _AppPalette.tealDark),
                        ),
                        onPressed: () {
                          setDialogState(() {
                            wActive = true;
                            satActive = true;
                            sunActive = true;
                            wStartCtrl.text = '08:00 AM';
                            wEndCtrl.text = '06:00 PM';
                            satStartCtrl.text = '08:00 AM';
                            satEndCtrl.text = '06:00 PM';
                            sunStartCtrl.text = '09:00 AM';
                            sunEndCtrl.text = '04:00 PM';
                          });
                        },
                        child: Text('All 7 Days Active', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Monday - Friday
                _buildDayConfigBlock(
                  dayTitle: 'Monday - Friday',
                  isActive: wActive,
                  onToggle: (v) => setDialogState(() => wActive = v),
                  startCtrl: wStartCtrl,
                  endCtrl: wEndCtrl,
                ),
                const SizedBox(height: 12),

                // Saturday
                _buildDayConfigBlock(
                  dayTitle: 'Saturday',
                  isActive: satActive,
                  onToggle: (v) => setDialogState(() => satActive = v),
                  startCtrl: satStartCtrl,
                  endCtrl: satEndCtrl,
                ),
                const SizedBox(height: 12),

                // Sunday
                _buildDayConfigBlock(
                  dayTitle: 'Sunday',
                  isActive: sunActive,
                  onToggle: (v) => setDialogState(() => sunActive = v),
                  startCtrl: sunStartCtrl,
                  endCtrl: sunEndCtrl,
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
              style: ElevatedButton.styleFrom(backgroundColor: _AppPalette.primaryNavy, foregroundColor: Colors.white),
              onPressed: () {
                Navigator.pop(ctx);
                setState(() {
                  _weekdayActive = wActive;
                  _weekdayHours = wActive ? '${wStartCtrl.text.trim()} - ${wEndCtrl.text.trim()}' : 'Off-duty / Closed';
                  _saturdayActive = satActive;
                  _saturdayHours = satActive ? '${satStartCtrl.text.trim()} - ${satEndCtrl.text.trim()}' : 'Off-duty / Closed';
                  _sundayActive = sunActive;
                  _sundayHours = sunActive ? '${sunStartCtrl.text.trim()} - ${sunEndCtrl.text.trim()}' : 'Off-duty / Closed';
                });
                _syncWeeklyWorkingHours();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Weekly operating schedule saved successfully.'),
                    backgroundColor: _AppPalette.tealDark,
                  ),
                );
              },
              child: const Text('Save All Hours'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDayConfigBlock({
    required String dayTitle,
    required bool isActive,
    required Function(bool) onToggle,
    required TextEditingController startCtrl,
    required TextEditingController endCtrl,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isActive ? Colors.white : _AppPalette.slate50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isActive ? _AppPalette.slate300 : _AppPalette.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(dayTitle, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12, color: _AppPalette.slate800)),
              Switch.adaptive(
                value: isActive,
                activeColor: _AppPalette.tealDark,
                onChanged: onToggle,
              ),
            ],
          ),
          if (isActive) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: startCtrl,
                    style: const TextStyle(fontSize: 11),
                    decoration: InputDecoration(
                      labelText: 'Start',
                      labelStyle: const TextStyle(fontSize: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6),
                  child: Text('-', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                Expanded(
                  child: TextField(
                    controller: endCtrl,
                    style: const TextStyle(fontSize: 11),
                    decoration: InputDecoration(
                      labelText: 'End',
                      labelStyle: const TextStyle(fontSize: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Text('Marked as Day Off', style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400, fontStyle: FontStyle.italic)),
          ],
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
      destinationIds: guide.coveredDestinations,
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
        // Top Header and Action Buttons
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _AppPalette.slate200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
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
                          'Driver Availability & Calendar',
                          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Manage your working days and off-duty periods',
                          style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _AppPalette.tealDark,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      onPressed: _showAddAvailableDateDialog,
                      icon: const Icon(Icons.add_circle_outline_rounded, size: 16),
                      label: Text(
                        'Add Available Date',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _AppPalette.rose500,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      onPressed: _showAddBlockedDateDialog,
                      icon: const Icon(Icons.block_rounded, size: 16),
                      label: Text(
                        'Block Dates',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Segmented Switcher for Available vs Blocked
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: _AppPalette.slate100,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _AppPalette.slate200),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _availabilityMode = 0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _availabilityMode == 0 ? _AppPalette.primaryNavy : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: _availabilityMode == 0
                          ? [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4, offset: const Offset(0, 2))]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.event_available_rounded,
                          size: 16,
                          color: _availabilityMode == 0 ? _AppPalette.emeraldAccent : _AppPalette.slate500,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Available Dates (${_driverAvailableDates.length})',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _availabilityMode == 0 ? Colors.white : _AppPalette.slate600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _availabilityMode = 1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _availabilityMode == 1 ? _AppPalette.primaryNavy : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: _availabilityMode == 1
                          ? [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4, offset: const Offset(0, 2))]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.event_busy_rounded,
                          size: 16,
                          color: _availabilityMode == 1 ? _AppPalette.rose500 : _AppPalette.slate500,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Blocked Dates (${_driverBlockedDates.length})',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _availabilityMode == 1 ? Colors.white : _AppPalette.slate600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // List based on mode
        if (_availabilityMode == 0) ...[
          if (_driverAvailableDates.isEmpty)
            _buildEmptyDatesState(
              icon: Icons.event_available_rounded,
              title: 'No Available Dates Configured',
              subtitle: 'Add specific dates and vehicle slots when you are ready to accept driver and tour guide bookings.',
              buttonLabel: 'Add Available Date',
              buttonColor: _AppPalette.tealDark,
              onPressed: _showAddAvailableDateDialog,
            )
          else
            ..._driverAvailableDates.map((item) => _buildDriverAvailableCard(item)).toList(),
        ] else ...[
          if (_driverBlockedDates.isEmpty)
            _buildEmptyDatesState(
              icon: Icons.check_circle_outline_rounded,
              title: 'No Blocked Dates',
              subtitle: 'You are currently open for bookings on all standard working days. Block off dates whenever taking personal leave.',
              buttonLabel: 'Block Specific Dates',
              buttonColor: _AppPalette.rose500,
              onPressed: _showAddBlockedDateDialog,
            )
          else
            ..._driverBlockedDates.map((item) => _buildDriverBlockedCard(item)).toList(),
        ],

        const SizedBox(height: 16),

        // Working schedule card (Editable by Driver)
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _AppPalette.slate200),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.access_time_filled_rounded, size: 16, color: _AppPalette.primaryNavy),
                      const SizedBox(width: 6),
                      Text(
                        'Standard Weekly Operating Hours',
                        style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.slate800),
                      ),
                    ],
                  ),
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: _showEditWeeklyScheduleDialog,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _AppPalette.tealDark.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: _AppPalette.tealDark.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.edit_outlined, size: 13, color: _AppPalette.tealDark),
                          const SizedBox(width: 4),
                          Text(
                            'Edit',
                            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.tealDark),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _scheduleRow(
                'Monday - Friday',
                _weekdayActive ? _weekdayHours : 'Off-duty / Closed',
                _weekdayActive,
                () => _showEditDayScheduleDialog(
                  dayLabel: 'Monday - Friday',
                  currentHours: _weekdayHours,
                  isActive: _weekdayActive,
                  onSave: (newHours, active) {
                    setState(() {
                      _weekdayHours = newHours;
                      _weekdayActive = active;
                    });
                    _syncWeeklyWorkingHours();
                  },
                ),
              ),
              const Divider(height: 12, thickness: 0.7, color: _AppPalette.slate100),
              _scheduleRow(
                'Saturday',
                _saturdayActive ? _saturdayHours : 'Off-duty / Closed',
                _saturdayActive,
                () => _showEditDayScheduleDialog(
                  dayLabel: 'Saturday',
                  currentHours: _saturdayHours,
                  isActive: _saturdayActive,
                  onSave: (newHours, active) {
                    setState(() {
                      _saturdayHours = newHours;
                      _saturdayActive = active;
                    });
                    _syncWeeklyWorkingHours();
                  },
                ),
              ),
              const Divider(height: 12, thickness: 0.7, color: _AppPalette.slate100),
              _scheduleRow(
                'Sunday',
                _sundayActive ? _sundayHours : 'Off-duty / Closed',
                _sundayActive,
                () => _showEditDayScheduleDialog(
                  dayLabel: 'Sunday',
                  currentHours: _sundayHours,
                  isActive: _sundayActive,
                  onSave: (newHours, active) {
                    setState(() {
                      _sundayHours = newHours;
                      _sundayActive = active;
                    });
                    _syncWeeklyWorkingHours();
                  },
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.touch_app_outlined, size: 12, color: _AppPalette.slate400),
                  const SizedBox(width: 4),
                  Text(
                    'Tap any day or "Edit" to adjust recurring work hours',
                    style: GoogleFonts.inter(fontSize: 10, color: _AppPalette.slate400, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyDatesState({
    required IconData icon,
    required String title,
    required String subtitle,
    required String buttonLabel,
    required Color buttonColor,
    required VoidCallback onPressed,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _AppPalette.slate200),
      ),
      child: Column(
        children: [
          Icon(icon, size: 40, color: _AppPalette.slate300),
          const SizedBox(height: 10),
          Text(title, style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 15, color: _AppPalette.slate700)),
          const SizedBox(height: 4),
          Text(subtitle, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate400, height: 1.4)),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: buttonColor, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            onPressed: onPressed,
            icon: const Icon(Icons.add, size: 16),
            label: Text(buttonLabel, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _buildDriverAvailableCard(DriverAvailableDate item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _AppPalette.emerald200.withOpacity(0.8), width: 1.2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: _AppPalette.emerald50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _AppPalette.emerald200),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_rounded, size: 12, color: _AppPalette.emerald700),
                    const SizedBox(width: 4),
                    Text(
                      'AVAILABLE',
                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: _AppPalette.emerald700),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.calendar_month_rounded, size: 15, color: _AppPalette.tealDark),
                  const SizedBox(width: 4),
                  Text(
                    item.date,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14, color: _AppPalette.primaryNavy),
                  ),
                  const SizedBox(width: 4),
                  InkWell(
                    borderRadius: BorderRadius.circular(8),
                    onTap: () => _removeAvailableDate(item),
                    child: const Padding(
                      padding: EdgeInsets.all(6),
                      child: Icon(Icons.delete_outline_rounded, size: 20, color: _AppPalette.rose500),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Text(
                '${item.startTime} - ${item.endTime}',
                style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12, color: _AppPalette.slate700),
              ),
              const SizedBox(width: 14),
              const Icon(Icons.directions_car_rounded, size: 14, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  item.vehicleType,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 12, color: _AppPalette.tealDark),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          if (item.note.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.notes_rounded, size: 13, color: _AppPalette.slate400),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    item.note,
                    style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500, fontStyle: FontStyle.italic),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDriverBlockedCard(DriverBlockedDate item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: _AppPalette.rose500.withOpacity(0.3), width: 1.2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: _AppPalette.rose50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _AppPalette.rose500.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.block_rounded, size: 12, color: _AppPalette.rose700),
                    const SizedBox(width: 4),
                    Text(
                      'UNAVAILABLE / OFF-DUTY',
                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: _AppPalette.rose700),
                    ),
                  ],
                ),
              ),
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => _removeBlockedDate(item),
                child: const Padding(
                  padding: EdgeInsets.all(6),
                  child: Icon(Icons.delete_outline_rounded, size: 20, color: _AppPalette.rose500),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.event_busy_rounded, size: 15, color: _AppPalette.rose500),
              const SizedBox(width: 6),
              Text(
                '${item.startDate} to ${item.endDate}',
                style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13, color: _AppPalette.slate800),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, size: 13, color: _AppPalette.slate400),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  item.reason,
                  style: GoogleFonts.inter(fontSize: 11, color: _AppPalette.slate500),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _scheduleRow(String day, String hours, bool isActive, VoidCallback onEdit) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onEdit,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  isActive ? Icons.check_circle_outline_rounded : Icons.pause_circle_outline_rounded,
                  size: 14,
                  color: isActive ? _AppPalette.tealDark : _AppPalette.slate400,
                ),
                const SizedBox(width: 8),
                Text(
                  day,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isActive ? _AppPalette.slate700 : _AppPalette.slate400,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Text(
                  hours,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: isActive ? _AppPalette.tealDark : _AppPalette.rose500,
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(Icons.mode_edit_outline_outlined, size: 12, color: _AppPalette.slate400),
              ],
            ),
          ],
        ),
      ),
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
