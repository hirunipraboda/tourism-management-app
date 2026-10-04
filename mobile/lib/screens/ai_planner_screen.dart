import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/ai_trip_planner_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AiPlannerScreen extends StatefulWidget {
  const AiPlannerScreen({super.key});

  @override
  State<AiPlannerScreen> createState() => _AiPlannerScreenState();
}

class _AiPlannerScreenState extends State<AiPlannerScreen> with TickerProviderStateMixin {
  // Wizard Step State: 1..7 (wizard), 8 (AI Loading Animation), 9 (Generated Itinerary Result)
  int _step = 1;

  // Form Inputs
  final TextEditingController _tripNameController = TextEditingController();
  String _destination = 'Sri Lanka';
  List<String> _selectedDestinations = [];
  bool _letAiRecommend = false;
  final List<String> _customDestinations = [];
  final TextEditingController _customDestInputController = TextEditingController();

  DateTime? _startDate;
  DateTime? _endDate;
  int _travelersCount = 2;

  String _currency = 'USD';
  double _budgetAmount = 600.0;
  String _budgetCategory = 'Moderate';

  final List<String> _selectedTravelStyles = [];
  final List<String> _selectedActivities = [];
  final TextEditingController _specialReqController = TextEditingController();

  String _accommodationPref = '';
  String _transportPref = 'Public Transport (Scenic Trains & Express Buses)';
  bool _aiDecidesStaycation = true;
  final Map<String, AccommodationItem> _selectedStaycations = {};
  final Map<String, bool> _bookedStaycations = {};

  // AI Loading Step Animation
  int _aiStepIndex = 0;
  String _aiStatusText = 'Understanding your travel preferences...';

  // Generated Plan State
  TripPlan? _generatedPlan;
  bool _isEditingTitle = false;
  final TextEditingController _titleEditController = TextEditingController();
  bool _isSaving = false;
  bool _saveSuccess = false;
  int? _regeneratingDayIndex;

  static const List<String> _destinationOptions = [
    'Kandy', 'Ella', 'Galle', 'Sigiriya', 'Yala', 'Nuwara Eliya', 'Mirissa', 'Anuradhapura', 'Trincomalee'
  ];

  static const List<({String label, String icon})> _travelStyleOptions = [
    (label: 'Adventure', icon: '🧗'),
    (label: 'Relaxation', icon: '🧘'),
    (label: 'Cultural', icon: '🏛️'),
    (label: 'Nature', icon: '🌿'),
    (label: 'Beach', icon: '🏖️'),
    (label: 'Wildlife', icon: '🐆'),
    (label: 'Photography', icon: '📸'),
    (label: 'Food', icon: '🍛'),
    (label: 'Shopping', icon: '🛍️'),
    (label: 'Family', icon: '👨‍👩‍👧‍👦'),
    (label: 'Romantic', icon: '💖'),
    (label: 'Backpacking', icon: '🎒'),
    (label: 'Luxury', icon: '✨'),
  ];

  static const List<String> _activityOptions = [
    'Hiking', 'Beaches', 'Historical sites', 'Temples', 'Wildlife safaris',
    'Water activities', 'Museums', 'Local food', 'Photography', 'Nightlife', 'Shopping'
  ];

  @override
  void initState() {
    super.initState();
    // Default dates 7 days in future
    final now = DateTime.now();
    _startDate = now.add(const Duration(days: 7));
    _endDate = now.add(const Duration(days: 12));
  }

  @override
  void dispose() {
    _tripNameController.dispose();
    _customDestInputController.dispose();
    _specialReqController.dispose();
    _titleEditController.dispose();
    super.dispose();
  }

  int get _calculatedDurationDays {
    if (_startDate == null || _endDate == null) return 0;
    final diff = _endDate!.difference(_startDate!).inDays;
    return diff > 0 ? diff : 0;
  }

  void _triggerToast(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _toggleDestination(String dest) {
    setState(() {
      _letAiRecommend = false;
      if (_selectedDestinations.contains(dest)) {
        _selectedDestinations.remove(dest);
      } else {
        _selectedDestinations.add(dest);
      }
    });
  }

  void _addCustomDestination() {
    final text = _customDestInputController.text.trim();
    if (text.isEmpty) return;

    final parts = text.split(',').map((p) => p.trim()).where((p) => p.isNotEmpty);
    setState(() {
      _letAiRecommend = false;
      for (final p in parts) {
        final formatted = p[0].toUpperCase() + p.substring(1);
        if (!_selectedDestinations.contains(formatted)) {
          _selectedDestinations.add(formatted);
        }
        if (!_customDestinations.contains(formatted)) {
          _customDestinations.add(formatted);
        }
      }
      _customDestInputController.clear();
    });
    _triggerToast('Added custom place(s) to your journey!');
  }

  void _removeCustomDestination(String dest) {
    setState(() {
      _customDestinations.remove(dest);
      _selectedDestinations.remove(dest);
    });
    _triggerToast('Removed "$dest"');
  }

  void _toggleTravelStyle(String style) {
    setState(() {
      if (_selectedTravelStyles.contains(style)) {
        _selectedTravelStyles.remove(style);
      } else {
        _selectedTravelStyles.add(style);
      }
    });
  }

  void _toggleActivity(String act) {
    setState(() {
      if (_selectedActivities.contains(act)) {
        _selectedActivities.remove(act);
      } else {
        _selectedActivities.add(act);
      }
    });
  }

  Future<void> _pickDate(bool isStart) async {
    final initial = isStart
        ? (_startDate ?? DateTime.now())
        : (_endDate ?? (_startDate?.add(const Duration(days: 3)) ?? DateTime.now()));

    final first = isStart ? DateTime.now() : (_startDate ?? DateTime.now());
    final last = DateTime.now().add(const Duration(days: 365 * 2));

    final picked = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(first) ? first : initial,
      firstDate: first,
      lastDate: last,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0D9488),
              onPrimary: Colors.white,
              onSurface: Color(0xFF0F172A),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate != null && _endDate!.isBefore(_startDate!)) {
            _endDate = _startDate!.add(const Duration(days: 5));
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  // Enforces strict budget ceilings on activities & totals
  TripPlan _enforceBudgetStick(TripPlan plan, double targetBudget) {
    final bAmt = targetBudget > 0 ? targetBudget : (plan.budget.total > 0 ? plan.budget.total : 600.0);
    final totalActs = plan.days.fold(0.0, (sum, d) => sum + d.activities.fold(0.0, (s, a) => s + a.estimatedCost));
    final maxActBudget = (bAmt * 0.20).roundToDouble();
    final finalActs = totalActs > maxActBudget ? maxActBudget : totalActs;
    final remainingPool = (bAmt - finalActs).clamp(0.0, bAmt);

    final accomm = (remainingPool * 0.45).roundToDouble();
    final food = (remainingPool * 0.30).roundToDouble();
    final trans = (remainingPool * 0.20).roundToDouble();
    double other = (remainingPool * 0.05).roundToDouble();

    double total = accomm + food + trans + other + finalActs;
    if (total > bAmt) {
      other = (other - (total - bAmt)).clamp(0.0, other);
      total = accomm + food + trans + other + finalActs;
    }
    final remaining = (bAmt - total).clamp(0.0, bAmt);

    plan.budget.accommodation = accomm;
    plan.budget.food = food;
    plan.budget.transportation = trans;
    plan.budget.other = other;
    plan.budget.activities = finalActs;
    plan.budget.total = total;
    plan.budget.remaining = remaining;
    plan.budget.currency = _currency;

    return plan;
  }

  Future<void> _handleGenerateTrip() async {
    if (_startDate != null && _endDate != null && _endDate!.isBefore(_startDate!)) {
      _triggerToast('End date cannot be earlier than start date!');
      return;
    }

    setState(() {
      _step = 8;
      _aiStepIndex = 0;
      _aiStatusText = 'Understanding your travel preferences...';
    });

    final loadingSteps = [
      'Understanding your travel preferences...',
      'Finding suitable destinations...',
      'Building your route...',
      'Planning daily activities...',
      'Optimizing your itinerary...',
      'Validating your trip...',
    ];

    // Animate orchestrator steps
    for (int i = 0; i < loadingSteps.length; i++) {
      await Future.delayed(const Duration(milliseconds: 650));
      if (!mounted) return;
      setState(() {
        _aiStepIndex = i;
        _aiStatusText = loadingSteps[i];
      });
    }

    final req = TripPlanningRequest(
      tripName: _tripNameController.text.trim().isNotEmpty ? _tripNameController.text.trim() : null,
      destination: _destination,
      destinations: _selectedDestinations.isNotEmpty ? _selectedDestinations : ['Sigiriya', 'Kandy', 'Ella'],
      startDate: _startDate?.toIso8601String().split('T').first,
      endDate: _endDate?.toIso8601String().split('T').first,
      travelers: _travelersCount,
      adults: _travelersCount,
      children: 0,
      budget: TripBudgetInput(
        amount: _budgetAmount,
        currency: _currency,
        category: _budgetCategory,
      ),
      travelStyle: _selectedTravelStyles.isNotEmpty ? _selectedTravelStyles : ['Cultural', 'Nature'],
      activities: _selectedActivities.isNotEmpty ? _selectedActivities : ['Hiking', 'Temples'],
      accommodationPreference: _accommodationPref.isNotEmpty ? _accommodationPref : '3 Star',
      transportPreference: _transportPref,
      specialRequirements: _specialReqController.text.trim(),
    );

    try {
      final plan = await ApiService.generateFullTripPlan(req);
      if (!mounted) return;

      if (_tripNameController.text.trim().isNotEmpty) {
        plan.title = _tripNameController.text.trim();
      }
      _titleEditController.text = plan.title;

      final budgeted = _enforceBudgetStick(plan, _budgetAmount);

      setState(() {
        _generatedPlan = budgeted;
        _step = 9;
      });

      _triggerToast('AI Trip Plan generated successfully!');
      ApiService.saveFullTripPlan(budgeted, req);
    } catch (e) {
      if (!mounted) return;
      setState(() => _step = 7);
      _triggerToast('Failed to generate plan. Please try again.');
    }
  }

  Future<void> _handleSaveTrip() async {
    if (_generatedPlan == null) return;
    setState(() => _isSaving = true);

    final req = TripPlanningRequest(
      tripName: _generatedPlan!.title,
      destinations: _generatedPlan!.destinations,
      travelers: _generatedPlan!.travelers,
      budget: TripBudgetInput(amount: _budgetAmount, currency: _currency),
    );

    final ok = await ApiService.saveFullTripPlan(_generatedPlan!, req);
    if (!mounted) return;
    setState(() {
      _isSaving = false;
      _saveSuccess = ok;
    });

    _triggerToast(ok ? 'Trip saved to your My Trips collection!' : 'Saved offline successfully!');
  }

  Future<void> _handleRegenerateDay(int dayIndex) async {
    if (_generatedPlan == null) return;
    setState(() => _regeneratingDayIndex = dayIndex);

    final target = _generatedPlan!.days[dayIndex];
    final req = TripPlanningRequest(
      destination: _destination,
      destinations: _selectedDestinations,
      startDate: _startDate?.toIso8601String().split('T').first,
      endDate: _endDate?.toIso8601String().split('T').first,
      travelers: _travelersCount,
      budget: TripBudgetInput(amount: _budgetAmount, currency: _currency),
      travelStyle: _selectedTravelStyles,
      activities: _selectedActivities,
    );

    final newDay = await ApiService.regenerateDay(target.day, target.location, req);
    if (!mounted) return;

    setState(() {
      _generatedPlan!.days[dayIndex] = newDay;
      _enforceBudgetStick(_generatedPlan!, _budgetAmount);
      _regeneratingDayIndex = null;
    });
    _triggerToast('Day ${target.day} recalculated with fresh recommendations!');
  }

  Future<void> _handleReplaceActivity(int dayIndex, int actIndex) async {
    if (_generatedPlan == null) return;
    final act = _generatedPlan!.days[dayIndex].activities[actIndex];
    final alt = await ApiService.regenerateActivity(act.id, act.title, _generatedPlan!.days[dayIndex].location);

    if (!mounted) return;
    setState(() {
      _generatedPlan!.days[dayIndex].activities[actIndex] = alt;
      _enforceBudgetStick(_generatedPlan!, _budgetAmount);
    });
    _triggerToast('Alternative activity selected!');
  }

  void _handleDeleteActivity(int dayIndex, int actIndex) {
    if (_generatedPlan == null) return;
    setState(() {
      _generatedPlan!.days[dayIndex].activities.removeAt(actIndex);
      _enforceBudgetStick(_generatedPlan!, _budgetAmount);
    });
    _triggerToast('Activity removed');
  }

  void _showEditActivityDialog(int dayIndex, int actIndex) {
    final act = _generatedPlan!.days[dayIndex].activities[actIndex];
    final titleCtrl = TextEditingController(text: act.title);
    final timeCtrl = TextEditingController(text: act.time);
    final costCtrl = TextEditingController(text: act.estimatedCost.toStringAsFixed(0));

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('Edit Activity', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Activity Title', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: timeCtrl,
                  decoration: const InputDecoration(labelText: 'Time (e.g. 10:00 AM)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: costCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: 'Estimated Cost ($_currency)', border: const OutlineInputBorder()),
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
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                final newCost = double.tryParse(costCtrl.text.trim()) ?? act.estimatedCost;
                setState(() {
                  act.title = titleCtrl.text.trim();
                  act.time = timeCtrl.text.trim();
                  act.estimatedCost = newCost;
                  _enforceBudgetStick(_generatedPlan!, _budgetAmount);
                });
                Navigator.pop(ctx);
                _triggerToast('Activity updated!');
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  void _showAddActivityDialog(int dayIndex) {
    final titleCtrl = TextEditingController();
    final timeCtrl = TextEditingController(text: '02:00 PM');
    final costCtrl = TextEditingController(text: '15');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('Add Custom Activity', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Activity Name', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: timeCtrl,
                  decoration: const InputDecoration(labelText: 'Time (e.g. 02:00 PM)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: costCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(labelText: 'Estimated Cost ($_currency)', border: const OutlineInputBorder()),
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
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                if (titleCtrl.text.trim().isEmpty) return;
                final cost = double.tryParse(costCtrl.text.trim()) ?? 15.0;
                final newAct = ItineraryActivityItem(
                  id: 'act-new-${DateTime.now().millisecondsSinceEpoch}',
                  time: timeCtrl.text.trim(),
                  title: titleCtrl.text.trim(),
                  location: _generatedPlan!.days[dayIndex].location,
                  durationMinutes: 90,
                  estimatedCost: cost,
                  description: 'Custom activity added by traveler.',
                  type: 'Activity',
                );

                setState(() {
                  _generatedPlan!.days[dayIndex].activities.add(newAct);
                  _enforceBudgetStick(_generatedPlan!, _budgetAmount);
                });
                Navigator.pop(ctx);
                _triggerToast('New activity added to schedule!');
              },
              child: const Text('Add Activity'),
            ),
          ],
        );
      },
    );
  }

  void _showStaycationBookingReceipt(AccommodationItem stay) {
    final code = 'SRI-${stay.destination.substring(0, 3).toUpperCase()}-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}';
    setState(() {
      _bookedStaycations[stay.id] = true;
    });

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              const Icon(Icons.verified, color: Color(0xFF10B981), size: 24),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Reservation Confirmed!',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 18, color: const Color(0xFF0F172A)),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.confirmation_number_outlined, color: Color(0xFF15803D), size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Booking Code: $code',
                      style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12.5, color: const Color(0xFF166534)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text(stay.name, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16)),
              Text('📍 ${stay.destination} · ${stay.type}', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600])),
              const SizedBox(height: 8),
              Text('Package: ${stay.packageName}', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF0D9488))),
              Text('Rate: \$${stay.pricePerNight.toStringAsFixed(0)} / night', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Text('Instant confirmation details have been synced to your Nova trips wallet.', style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[700])),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Great, Done'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section (shown during Steps 1..7)
              if (_step <= 7) _buildStepHeader(),

              const SizedBox(height: 18),

              // Steps Switcher
              if (_step == 1) _buildStep1Destination(),
              if (_step == 2) _buildStep2DatesAndTravelers(),
              if (_step == 3) _buildStep3Budget(),
              if (_step == 4) _buildStep4TravelStyle(),
              if (_step == 5) _buildStep5Activities(),
              if (_step == 6) _buildStep6StaycationsAndTransport(),
              if (_step == 7) _buildStep7Review(),
              if (_step == 8) _buildStep8AiLoading(),
              if (_step == 9 && _generatedPlan != null) _buildStep9Result(),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP HEADER & PROGRESS BAR
  // =========================================================================
  Widget _buildStepHeader() {
    final progress = (_step / 7.0).clamp(0.0, 1.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AI AGENT JOURNEY PLANNER',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF0D9488),
                      letterSpacing: 0.9,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Design Your Sri Lanka Adventure',
                    style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFCCFBF1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF99F6E4)),
              ),
              child: Text(
                'Step $_step of 7',
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF0F766E),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Progress Track
        Container(
          width: double.infinity,
          height: 8,
          decoration: BoxDecoration(
            color: const Color(0xFFE2E8F0),
            borderRadius: BorderRadius.circular(8),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return Stack(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 350),
                    curve: Curves.easeOutCubic,
                    width: constraints.maxWidth * progress,
                    height: 8,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D9488),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 1: DESTINATION & TRIP NAME
  // =========================================================================
  Widget _buildStep1Destination() {
    return _buildCardWrapper(
      icon: Icons.place_outlined,
      title: 'Where do you want to explore?',
      subtitle: 'Select primary country and specific Sri Lankan destinations.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Name Your Trip Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFF0FDFA), Color(0xFFF8FAFC)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF99F6E4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Name Your Trip',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFCCFBF1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF99F6E4)),
                      ),
                      child: Text(
                        'Optional · Custom Name',
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _tripNameController,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                  decoration: InputDecoration(
                    hintText: 'e.g. My Ceylon Adventure, Tropical Honeymoon...',
                    hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400], fontWeight: FontWeight.normal),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.8)),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Give your journey a personalized name of your choice, or leave it blank and NOVA will automatically generate one for you.',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500], height: 1.35),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Target Island Country
          Text(
            'Target Island Country',
            style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF334155)),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sri Lanka (Pearl of the Indian Ocean)',
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                ),
                const Icon(Icons.arrow_drop_down, color: Color(0xFF64748B)),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Choose Specific Destinations
          Text(
            'Choose Specific Destinations (Select multiple or AI Recommend)',
            style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF334155)),
          ),
          const SizedBox(height: 10),

          // Grid of options
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              // Let AI Recommend button
              InkWell(
                onTap: () {
                  setState(() {
                    _letAiRecommend = !_letAiRecommend;
                    if (_letAiRecommend) _selectedDestinations.clear();
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: _letAiRecommend ? const Color(0xFFF0FDFA) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _letAiRecommend ? const Color(0xFF0D9488) : Colors.grey[300]!,
                      width: _letAiRecommend ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('✨ ', style: TextStyle(fontSize: 14)),
                      Text(
                        'Let AI Recommend',
                        style: GoogleFonts.inter(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: _letAiRecommend ? const Color(0xFF0F766E) : const Color(0xFF334155),
                        ),
                      ),
                      if (_letAiRecommend) ...[
                        const SizedBox(width: 6),
                        const Icon(Icons.check, size: 16, color: Color(0xFF0D9488)),
                      ],
                    ],
                  ),
                ),
              ),

              // Destination Buttons
              ..._destinationOptions.map((dest) {
                final isSelected = _selectedDestinations.contains(dest);
                return InkWell(
                  onTap: () => _toggleDestination(dest),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF0D9488) : Colors.grey[300]!,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          dest,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF334155),
                          ),
                        ),
                        if (isSelected) ...[
                          const SizedBox(width: 6),
                          const Icon(Icons.check, size: 16, color: Color(0xFF0D9488)),
                        ],
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
          const SizedBox(height: 18),

          // Custom Destination Type Section
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(6)),
                            child: const Icon(Icons.add, size: 14, color: Color(0xFF0F766E)),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              "Can't find your destination? Type custom place",
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_customDestinations.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(10)),
                        child: Text(
                          '${_customDestinations.length} custom',
                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Write any specific town, beach, or park (e.g. Jaffna, Bentota, Arugam Bay, Tangalle).',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _customDestInputController,
                        style: GoogleFonts.inter(fontSize: 12.5),
                        onSubmitted: (_) => _addCustomDestination(),
                        decoration: InputDecoration(
                          hintText: 'Enter place name (e.g. Jaffna)...',
                          hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
                          filled: true,
                          fillColor: Colors.white,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey[300]!)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _addCustomDestination,
                      child: const Text('Add Place', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),

                if (_customDestinations.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _customDestinations.map((place) {
                      return Chip(
                        label: Text('📍 $place', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E))),
                        backgroundColor: const Color(0xFFF0FDFA),
                        side: const BorderSide(color: Color(0xFF99F6E4)),
                        deleteIcon: const Icon(Icons.close, size: 14, color: Color(0xFF0F766E)),
                        onDeleted: () => _removeCustomDestination(place),
                        visualDensity: VisualDensity.compact,
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),
          _buildNextButton('Next: Dates & Travelers', () => setState(() => _step = 2)),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 2: DATES & TRAVELERS
  // =========================================================================
  Widget _buildStep2DatesAndTravelers() {
    return _buildCardWrapper(
      icon: Icons.calendar_today_outlined,
      title: 'When are you traveling & with whom?',
      subtitle: 'Select dates and headcount for automatic duration calculation.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Start Date', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    InkWell(
                      onTap: () => _pickDate(true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.date_range, size: 18, color: Color(0xFF0D9488)),
                            const SizedBox(width: 8),
                            Text(
                              _startDate != null ? '${_startDate!.day}/${_startDate!.month}/${_startDate!.year}' : 'Select',
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('End Date', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    InkWell(
                      onTap: () => _pickDate(false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.date_range, size: 18, color: Color(0xFF0D9488)),
                            const SizedBox(width: 8),
                            Text(
                              _endDate != null ? '${_endDate!.day}/${_endDate!.month}/${_endDate!.year}' : 'Select',
                              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Duration Card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF99F6E4)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded, color: Color(0xFF0F766E), size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Calculated Duration:',
                      style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B)),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF99F6E4)),
                  ),
                  child: Text(
                    _calculatedDurationDays > 0
                        ? '$_calculatedDurationDays Days / ${(_calculatedDurationDays - 1).clamp(1, 99)} Nights'
                        : 'Select dates',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF0F766E)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Number of Travelers
          Text('Number of Travelers', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  color: const Color(0xFF0D9488),
                  onPressed: () {
                    if (_travelersCount > 1) {
                      setState(() => _travelersCount--);
                    }
                  },
                ),
                SizedBox(
                  width: 32,
                  child: Text(
                    '$_travelersCount',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  color: const Color(0xFF0D9488),
                  onPressed: () {
                    setState(() => _travelersCount++);
                  },
                ),
                const SizedBox(width: 8),
                Text('Traveler(s) Total', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600])),
              ],
            ),
          ),

          const SizedBox(height: 24),
          _buildNavRow(
            onBack: () => setState(() => _step = 1),
            onNext: () => setState(() => _step = 3),
            nextLabel: 'Next: Budget',
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 3: BUDGET
  // =========================================================================
  Widget _buildStep3Budget() {
    return _buildCardWrapper(
      icon: Icons.attach_money_outlined,
      title: 'What is your trip budget?',
      subtitle: 'Specify currency, maximum total budget, and comfort category.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Currency', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _currency,
                          isExpanded: true,
                          items: const [
                            DropdownMenuItem(value: 'USD', child: Text('USD (\$)')),
                            DropdownMenuItem(value: 'EUR', child: Text('EUR (€)')),
                            DropdownMenuItem(value: 'LKR', child: Text('LKR (Rs)')),
                          ],
                          onChanged: (v) {
                            if (v != null) setState(() => _currency = v);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Maximum Budget ($_currency)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    TextField(
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(text: _budgetAmount.toStringAsFixed(0))
                        ..selection = TextSelection.collapsed(offset: _budgetAmount.toStringAsFixed(0).length),
                      onChanged: (v) {
                        final parsed = double.tryParse(v);
                        if (parsed != null) _budgetAmount = parsed;
                      },
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Comfort category
          Text('Comfort & Experience Category', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildCategoryCard('Budget', 'Hostels & Local Food'),
              const SizedBox(width: 8),
              _buildCategoryCard('Moderate', '3-Star & Transfers'),
              const SizedBox(width: 8),
              _buildCategoryCard('Luxury', '5-Star Resorts'),
            ],
          ),

          const SizedBox(height: 24),
          _buildNavRow(
            onBack: () => setState(() => _step = 2),
            onNext: () => setState(() => _step = 4),
            nextLabel: 'Next: Travel Style',
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(String cat, String sub) {
    final isSel = _budgetCategory == cat;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _budgetCategory = cat),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: isSel ? const Color(0xFFF0FDFA) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSel ? const Color(0xFF0D9488) : Colors.grey[300]!,
              width: isSel ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Text(
                cat,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isSel ? const Color(0xFF0F766E) : const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                sub,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // STEP 4: TRAVEL STYLE
  // =========================================================================
  Widget _buildStep4TravelStyle() {
    return _buildCardWrapper(
      icon: Icons.explore_outlined,
      title: 'What is your travel style?',
      subtitle: 'Select one or multiple styles to tailor the journey pace and theme.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _travelStyleOptions.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 2.8,
            ),
            itemBuilder: (context, idx) {
              final opt = _travelStyleOptions[idx];
              final isSel = _selectedTravelStyles.contains(opt.label);

              return InkWell(
                onTap: () => _toggleTravelStyle(opt.label),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: isSel ? const Color(0xFFF0FDFA) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSel ? const Color(0xFF0D9488) : Colors.grey[300]!,
                      width: isSel ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(opt.icon, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          opt.label,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                            color: isSel ? const Color(0xFF0F766E) : const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      if (isSel) const Icon(Icons.check, size: 16, color: Color(0xFF0D9488)),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          _buildNavRow(
            onBack: () => setState(() => _step = 3),
            onNext: () => setState(() => _step = 5),
            nextLabel: 'Next: Activities',
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 5: ACTIVITIES & NOTES
  // =========================================================================
  Widget _buildStep5Activities() {
    return _buildCardWrapper(
      icon: Icons.auto_awesome_outlined,
      title: 'Preferred activities & special requests',
      subtitle: 'Tell us what you love to do and any specific requirements.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Preferred Activities', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _activityOptions.map((act) {
              final isSel = _selectedActivities.contains(act);
              return FilterChip(
                label: Text(act),
                selected: isSel,
                onSelected: (_) => _toggleActivity(act),
                selectedColor: const Color(0xFF0D9488),
                backgroundColor: const Color(0xFFF8FAFC),
                labelStyle: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                  color: isSel ? Colors.white : const Color(0xFF334155),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: isSel ? const Color(0xFF0D9488) : Colors.grey[300]!),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          Text("Anything else you'd like us to know?", style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          TextField(
            controller: _specialReqController,
            maxLines: 3,
            style: GoogleFonts.inter(fontSize: 12.5),
            decoration: InputDecoration(
              hintText: 'e.g. Vegetarian food preference, traveling with elderly parents, interest in photography sunrise spots...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.all(12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
            ),
          ),

          const SizedBox(height: 24),
          _buildNavRow(
            onBack: () => setState(() => _step = 4),
            onNext: () => setState(() => _step = 6),
            nextLabel: 'Next: Stay & Transport',
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 6: STAYCATIONS & TRANSPORT
  // =========================================================================
  Widget _buildStep6StaycationsAndTransport() {
    final activeDests = _selectedDestinations.isNotEmpty ? _selectedDestinations : ['Sigiriya', 'Kandy', 'Ella'];

    // Filter accommodations for active destinations
    final relevantStays = kAccommodationsCatalog.where((acc) {
      return activeDests.any((d) => acc.destination.toLowerCase() == d.toLowerCase());
    }).toList();

    return _buildCardWrapper(
      icon: Icons.apartment_outlined,
      title: 'Destination Staycations & Transport',
      subtitle: 'Select best available luxury hotels, boutique villas, and private cabanas according to packages & prices, plus your mobility preference.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // AI Toggle
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF99F6E4)),
            ),
            child: Row(
              children: [
                const Icon(Icons.auto_awesome, color: Color(0xFF0F766E), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Let AI Curate Best Hotels & Cabanas',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E)),
                      ),
                      Text(
                        'Auto-selects top rated accommodations matched strictly to your budget.',
                        style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _aiDecidesStaycation,
                  activeColor: const Color(0xFF0D9488),
                  onChanged: (val) {
                    setState(() {
                      _aiDecidesStaycation = val;
                      if (val) _selectedStaycations.clear();
                    });
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Accommodations List
          if (!_aiDecidesStaycation && relevantStays.isNotEmpty) ...[
            Text('Featured Staycation Packages in Your Route', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: relevantStays.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, idx) {
                final stay = relevantStays[idx];
                final isSelected = _selectedStaycations[stay.destination]?.id == stay.id;

                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF0D9488) : Colors.grey[300]!,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.asset(
                          stay.image,
                          width: 65,
                          height: 65,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 65,
                            height: 65,
                            color: Colors.grey[200],
                            child: const Icon(Icons.hotel, color: Colors.grey),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(stay.name, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold)),
                            Text('📍 ${stay.destination} · ${stay.type}', style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
                            const SizedBox(height: 2),
                            Text(stay.packageName, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w600, color: const Color(0xFF0D9488))),
                            Text('\$${stay.pricePerNight.toStringAsFixed(0)} / night', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Icon(isSelected ? Icons.check_circle : Icons.add_circle_outline, color: const Color(0xFF0D9488)),
                        onPressed: () {
                          setState(() {
                            if (isSelected) {
                              _selectedStaycations.remove(stay.destination);
                            } else {
                              _selectedStaycations[stay.destination] = stay;
                            }
                          });
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],

          // Transportation Preference
          Text('Transportation Preference', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _transportPref,
                isExpanded: true,
                items: const [
                  DropdownMenuItem(
                    value: 'Public Transport (Scenic Trains & Express Buses)',
                    child: Text('Public Transport (Scenic Trains & Express Buses)', style: TextStyle(fontSize: 12.5)),
                  ),
                  DropdownMenuItem(
                    value: 'Private Licensed Chauffeur / Dedicated Car',
                    child: Text('Private Licensed Chauffeur / Dedicated Car', style: TextStyle(fontSize: 12.5)),
                  ),
                  DropdownMenuItem(
                    value: 'Self-Arranged Local Transit & Taxis',
                    child: Text('Self-Arranged Local Transit & Taxis', style: TextStyle(fontSize: 12.5)),
                  ),
                ],
                onChanged: (v) {
                  if (v != null) setState(() => _transportPref = v);
                },
              ),
            ),
          ),

          const SizedBox(height: 24),
          _buildNavRow(
            onBack: () => setState(() => _step = 5),
            onNext: () => setState(() => _step = 7),
            nextLabel: 'Next: Final Review',
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 7: REVIEW YOUR TRIP PARAMETERS
  // =========================================================================
  Widget _buildStep7Review() {
    final activeDests = _selectedDestinations.isNotEmpty ? _selectedDestinations : ['Sigiriya', 'Kandy', 'Ella'];

    return _buildCardWrapper(
      icon: Icons.check_circle_outline,
      title: 'Review Your Trip Parameters',
      subtitle: 'Verify your specifications before triggering the AI Trip Planner Agent.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Trip name inline quick edit
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF99F6E4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('TRIP NAME', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF0F766E))),
                const SizedBox(height: 4),
                TextField(
                  controller: _tripNameController,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    hintText: 'e.g. My Ceylon Adventure (or leave blank for AI title)',
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 4),
                    border: InputBorder.none,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Summary Grid
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryRow('DESTINATION', _destination),
                const Divider(height: 16),
                _buildSummaryRow(
                  'DURATION',
                  _calculatedDurationDays > 0 ? '$_calculatedDurationDays Days' : 'Flexible / AI Optimized',
                ),
                const Divider(height: 16),
                _buildSummaryRow('TRAVELERS', '$_travelersCount Traveler(s)'),
                const Divider(height: 16),
                _buildSummaryRow(
                  'BUDGET',
                  '\$$_budgetAmount $_currency (${_budgetCategory.isNotEmpty ? _budgetCategory : 'Moderate'})',
                  valueColor: const Color(0xFF0D9488),
                ),
                const Divider(height: 16),
                _buildSummaryRow('SELECTED CITIES', activeDests.join(', ')),
                const Divider(height: 16),
                _buildSummaryRow(
                  'TRAVEL STYLES',
                  _selectedTravelStyles.isNotEmpty ? _selectedTravelStyles.join(', ') : 'All travel styles',
                ),
                const Divider(height: 16),
                _buildSummaryRow(
                  'STAYCATIONS',
                  _aiDecidesStaycation ? 'AI Curated Best Hotels & Cabanas' : '${_selectedStaycations.length} Selected Stays',
                ),
                const Divider(height: 16),
                _buildSummaryRow('TRANSPORT', _transportPref),
              ],
            ),
          ),

          const SizedBox(height: 24),
          Row(
            children: [
              OutlinedButton(
                onPressed: () => setState(() => _step = 6),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  side: BorderSide(color: Colors.grey[300]!),
                ),
                child: Text('Back', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: const Color(0xFF334155))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _handleGenerateTrip,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 3,
                  ),
                  icon: const Icon(Icons.auto_awesome, size: 18),
                  label: Text('Generate My AI Trip Plan', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: Colors.grey[500])),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: valueColor ?? const Color(0xFF0F172A),
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================================
  // STEP 8: AI GENERATION ANIMATION
  // =========================================================================
  Widget _buildStep8AiLoading() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        children: [
          SizedBox(
            width: 72,
            height: 72,
            child: Stack(
              alignment: Alignment.center,
              children: [
                const SizedBox(
                  width: 72,
                  height: 72,
                  child: CircularProgressIndicator(
                    strokeWidth: 3.5,
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0D9488)),
                    backgroundColor: Color(0xFFCCFBF1),
                  ),
                ),
                const Icon(Icons.auto_awesome, color: Color(0xFF0D9488), size: 30),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'AI Planner Orchestrator Active',
            style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
          ),
          const SizedBox(height: 6),
          Text(
            _aiStatusText,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488)),
          ),
          const SizedBox(height: 24),

          // Orchestration checklist
          Column(
            children: [
              _buildLoadingCheckItem(0, 'Understanding travel preferences'),
              _buildLoadingCheckItem(1, 'Finding suitable destinations'),
              _buildLoadingCheckItem(2, 'Building optimized travel route'),
              _buildLoadingCheckItem(3, 'Scheduling daily activities & timings'),
              _buildLoadingCheckItem(4, 'Evaluating budget & travel pacing'),
              _buildLoadingCheckItem(5, 'Validating final itinerary plan'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCheckItem(int index, String label) {
    final isDone = _aiStepIndex >= index;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isDone ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 16,
            color: isDone ? const Color(0xFF0D9488) : Colors.grey[300],
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: isDone ? FontWeight.bold : FontWeight.normal,
              color: isDone ? const Color(0xFF0F766E) : Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // STEP 9: GENERATED ITINERARY RESULT VIEW
  // =========================================================================
  Widget _buildStep9Result() {
    final plan = _generatedPlan!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Bar & Quality match card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.grey[200]!),
            boxShadow: NovaBrand.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 8,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFBBF7D0)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_user_outlined, size: 14, color: Color(0xFF16A34A)),
                        const SizedBox(width: 4),
                        Text(
                          'Quality Verified: ${plan.aiScore.toStringAsFixed(0)}% Match',
                          style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w800, color: const Color(0xFF15803D)),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => setState(() => _step = 1),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          visualDensity: VisualDensity.compact,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.refresh, size: 14),
                        label: Text('Plan Another', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 6),
                      ElevatedButton.icon(
                        onPressed: _isSaving ? null : _handleSaveTrip,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0D9488),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          visualDensity: VisualDensity.compact,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: Icon(_saveSuccess ? Icons.check : Icons.bookmark_border, size: 14),
                        label: Text(_isSaving ? 'Saving...' : _saveSuccess ? 'Saved' : 'Save Trip', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Title inline edit
              if (_isEditingTitle)
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _titleEditController,
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
                        decoration: const InputDecoration(isDense: true, contentPadding: EdgeInsets.symmetric(vertical: 4)),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.check, color: Color(0xFF0D9488)),
                      onPressed: () {
                        setState(() {
                          plan.title = _titleEditController.text.trim();
                          _isEditingTitle = false;
                        });
                        _triggerToast('Title updated!');
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.grey),
                      onPressed: () => setState(() => _isEditingTitle = false),
                    ),
                  ],
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        plan.title,
                        style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 18, color: Colors.grey),
                      onPressed: () => setState(() => _isEditingTitle = true),
                    ),
                  ],
                ),

              const SizedBox(height: 4),
              Text(
                plan.description,
                style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600], height: 1.4),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Travel Advisories if any
        if (plan.warnings.isNotEmpty) ...[
          ...plan.warnings.map((w) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(w.title, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF92400E))),
                        Text(w.message, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFB45309))),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],

        // Selected Staycations Section
        _buildStaycationsSection(),
        const SizedBox(height: 16),

        // Day by Day Schedule
        Text(
          'Day-by-Day Schedule (${plan.days.length} Days)',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
        ),
        const SizedBox(height: 10),

        ...plan.days.asMap().entries.map((entry) {
          final dIdx = entry.key;
          final day = entry.value;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[200]!),
              boxShadow: NovaBrand.softShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Day Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFCCFBF1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'DAY ${day.day} — ${day.date}',
                        style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w800, color: const Color(0xFF0F766E)),
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          'Est. \$${day.estimatedCost.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488)),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: _regeneratingDayIndex == dIdx ? null : () => _handleRegenerateDay(dIdx),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(6)),
                            child: Icon(Icons.refresh, size: 16, color: _regeneratingDayIndex == dIdx ? Colors.teal : Colors.grey[700]),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(day.title, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold)),
                Text('📍 Location: ${day.location}', style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[500])),
                const Divider(height: 16),

                // Activities list
                ...day.activities.asMap().entries.map((actEntry) {
                  final aIdx = actEntry.key;
                  final act = actEntry.value;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(6)),
                              child: Text(act.time, style: GoogleFonts.robotoMono(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 6),
                            Text('(${act.durationMinutes} mins)', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[500])),
                            const Spacer(),
                            Text('\$${act.estimatedCost.toStringAsFixed(0)}', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 6),
                            // Actions
                            InkWell(
                              onTap: () => _handleReplaceActivity(dIdx, aIdx),
                              child: const Icon(Icons.swap_horiz, size: 16, color: Color(0xFF0D9488)),
                            ),
                            const SizedBox(width: 6),
                            InkWell(
                              onTap: () => _showEditActivityDialog(dIdx, aIdx),
                              child: const Icon(Icons.edit_outlined, size: 15, color: Colors.grey),
                            ),
                            const SizedBox(width: 6),
                            InkWell(
                              onTap: () => _handleDeleteActivity(dIdx, aIdx),
                              child: const Icon(Icons.delete_outline, size: 15, color: Colors.redAccent),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(act.title, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                        Text(act.description, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
                        if (act.travelTimeToNext != null && act.travelTimeToNext!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text('🚗 ${act.travelTimeToNext}', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[500])),
                          ),
                      ],
                    ),
                  );
                }),

                // Add activity button
                InkWell(
                  onTap: () => _showAddActivityDialog(dIdx),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                    ),
                    child: Center(
                      child: Text(
                        '+ Add Activity to Day ${day.day}',
                        style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),

        const SizedBox(height: 10),

        // Budget Breakdown Card
        _buildBudgetBreakdownCard(plan),
      ],
    );
  }

  Widget _buildStaycationsSection() {
    final plan = _generatedPlan!;
    final dests = plan.destinations.isNotEmpty ? plan.destinations : ['Sigiriya', 'Kandy', 'Ella'];

    final displayStays = <AccommodationItem>[];
    for (final d in dests) {
      if (_selectedStaycations[d] != null) {
        displayStays.add(_selectedStaycations[d]!);
      } else {
        final match = kAccommodationsCatalog.where((a) => a.destination.toLowerCase() == d.toLowerCase()).firstOrNull;
        if (match != null && !displayStays.any((s) => s.id == match.id)) {
          displayStays.add(match);
        }
      }
    }

    if (displayStays.isEmpty) {
      displayStays.addAll(kAccommodationsCatalog.take(3));
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Selected Staycations & Lodgings',
                style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              Text(
                '${_bookedStaycations.length} of ${displayStays.length} Booked',
                style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 195,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: displayStays.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, idx) {
                final stay = displayStays[idx];
                final isBooked = _bookedStaycations[stay.id] == true;

                return Container(
                  width: 210,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isBooked ? const Color(0xFF10B981) : Colors.grey[200]!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                        child: Stack(
                          children: [
                            Image.asset(
                              stay.image,
                              height: 90,
                              width: 210,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(height: 90, color: Colors.grey[300]),
                            ),
                            Positioned(
                              top: 6,
                              left: 6,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: Colors.black.withOpacity(0.7), borderRadius: BorderRadius.circular(6)),
                                child: Text(stay.type, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
                              ),
                            ),
                            if (isBooked)
                              Positioned(
                                top: 6,
                                right: 6,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(6)),
                                  child: const Text('Booked', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
                                ),
                              ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(stay.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('📍 ${stay.destination}', style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500])),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('\$${stay.pricePerNight.toStringAsFixed(0)}/nt', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                                InkWell(
                                  onTap: () => _showStaycationBookingReceipt(stay),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: isBooked ? const Color(0xFF10B981) : const Color(0xFF0D9488),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      isBooked ? 'Receipt' : 'Book',
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
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
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetBreakdownCard(TripPlan plan) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
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
                  const Icon(Icons.account_balance_wallet_outlined, color: Color(0xFF0D9488), size: 20),
                  const SizedBox(width: 8),
                  Text('Budget Breakdown', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: Text('Budget Guaranteed', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF15803D))),
              ),
            ],
          ),
          const SizedBox(height: 14),

          _buildBudgetRow('Accommodation', '\$${plan.budget.accommodation.toStringAsFixed(0)}'),
          _buildBudgetRow('Transportation', '\$${plan.budget.transportation.toStringAsFixed(0)}'),
          _buildBudgetRow('Activities', '\$${plan.budget.activities.toStringAsFixed(0)}'),
          _buildBudgetRow('Food & Dining', '\$${plan.budget.food.toStringAsFixed(0)}'),
          _buildBudgetRow('Sundry / Other', '\$${plan.budget.other.toStringAsFixed(0)}'),
          const Divider(height: 18),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Estimated Cost', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
              Text(
                '\$${plan.budget.total.toStringAsFixed(0)} ${plan.budget.currency}',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0D9488)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Allocated Budget Remaining:', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF0F766E))),
                Text('\$${plan.budget.remaining.toStringAsFixed(0)} ${plan.budget.currency}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w900, color: const Color(0xFF0F766E))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBudgetRow(String label, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600])),
          Text(amount, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
        ],
      ),
    );
  }

  // =========================================================================
  // HELPER WIDGETS
  // =========================================================================
  Widget _buildCardWrapper({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF99F6E4)),
                ),
                child: Icon(icon, color: const Color(0xFF0D9488), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                    const SizedBox(height: 2),
                    Text(subtitle, style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[600])),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          child,
        ],
      ),
    );
  }

  Widget _buildNextButton(String label, VoidCallback onNext) {
    return Align(
      alignment: Alignment.centerRight,
      child: ElevatedButton.icon(
        onPressed: onNext,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0D9488),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 2,
        ),
        label: Text(label, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
        icon: const Icon(Icons.arrow_forward, size: 16),
      ),
    );
  }

  Widget _buildNavRow({
    required VoidCallback onBack,
    required VoidCallback onNext,
    required String nextLabel,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        OutlinedButton(
          onPressed: onBack,
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            side: BorderSide(color: Colors.grey[300]!),
          ),
          child: Text('Back', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: const Color(0xFF334155))),
        ),
        ElevatedButton.icon(
          onPressed: onNext,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0D9488),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 2,
          ),
          label: Text(nextLabel, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
          icon: const Icon(Icons.arrow_forward, size: 16),
        ),
      ],
    );
  }
}
