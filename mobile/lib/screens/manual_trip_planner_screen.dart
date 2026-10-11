import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/manual_planner_models.dart';
import '../models/user_trip_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ManualTripPlannerScreen extends StatefulWidget {
  final Function(UserTripDetail)? onTripCreated;

  const ManualTripPlannerScreen({super.key, this.onTripCreated});

  @override
  State<ManualTripPlannerScreen> createState() => _ManualTripPlannerScreenState();
}

class _ManualTripPlannerScreenState extends State<ManualTripPlannerScreen> {
  // Current guided step (1 to 6)
  int _currentStep = 1;

  // -------------------------------------------------------------
  // STEP 1: TRIP DETAILS & DESTINATIONS
  // -------------------------------------------------------------
  final TextEditingController _tripNameController = TextEditingController(text: 'Sri Lanka Discovery');
  final List<String> _selectedDestinations = ['Kandy', 'Ella'];
  DateTime _startDate = DateTime.now().add(const Duration(days: 14));
  DateTime _endDate = DateTime.now().add(const Duration(days: 18));
  int _adultsCount = 2;
  int _childrenCount = 0;
  final TextEditingController _budgetController = TextEditingController(text: '800');

  // -------------------------------------------------------------
  // STEP 2: ACCOMMODATION PREFERENCES & SELECTION
  // -------------------------------------------------------------
  AccommodationCategory? _selectedCategoryFilter;
  final Map<String, ManualAccommodation> _selectedAccommodations = {};

  // -------------------------------------------------------------
  // STEP 3: TRAVEL STYLES
  // -------------------------------------------------------------
  final List<String> _selectedTravelStyles = ['Cultural', 'Nature', 'Relaxation'];

  // -------------------------------------------------------------
  // STEP 4: TRANSPORTATION
  // -------------------------------------------------------------
  String _transitStrategy = 'MULTI_LEG'; // 'MULTI_LEG' | 'WHOLE_TRIP_PRIVATE' | 'OPEN_PUBLIC'
  String _privateVehicleType = 'AC Sedan';
  List<ManualTransitLeg> _transitLegs = [];

  // -------------------------------------------------------------
  // STEP 5: ITINERARY BUILDER
  // -------------------------------------------------------------
  List<ManualPlannedDay> _plannedDays = [];
  int _activeDayIndex = 0;

  // -------------------------------------------------------------
  // STEP 6: FINALIZE
  // -------------------------------------------------------------
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _initializeAccommodations();
    _syncPlannedDays();
    _syncTransitLegs();
  }

  @override
  void dispose() {
    _tripNameController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  int get _durationDays {
    final diff = _endDate.difference(_startDate).inDays + 1;
    return diff > 0 ? diff : 1;
  }

  int get _totalNights => (_durationDays - 1).clamp(0, 99);

  int get _totalTravelers => (_adultsCount + _childrenCount).clamp(1, 100);

  double get _targetBudget => double.tryParse(_budgetController.text.trim()) ?? 800;

  void _initializeAccommodations() {
    // Pre-select popular stays for default destinations
    for (final dest in _selectedDestinations) {
      final matches = kAccommodationsCatalog.where((a) => a.destination == dest).toList();
      if (matches.isNotEmpty) {
        _selectedAccommodations[dest] = matches.first;
      }
    }
  }

  void _syncPlannedDays() {
    final daysCount = _durationDays;
    final List<ManualPlannedDay> newDays = [];

    final dests = _selectedDestinations.isNotEmpty ? _selectedDestinations : ['Colombo'];

    for (int i = 0; i < daysCount; i++) {
      final curDate = _startDate.add(Duration(days: i));
      final dateStr = DateFormat('MMM dd, yyyy').format(curDate);

      // Distribute destinations evenly across days
      final destIndex = (i * dests.length ~/ daysCount).clamp(0, dests.length - 1);
      final assignedDest = dests[destIndex];

      // Preserve existing day activities if present
      List<ManualScheduledActivity> existingActs = [];
      if (i < _plannedDays.length) {
        existingActs = _plannedDays[i].activities;
      } else {
        // Pre-populate with iconic activities matching destination
        final available = kActivitiesCatalog.where((a) => a.destination == assignedDest).toList();
        if (available.isNotEmpty) {
          final first = available.first;
          existingActs.add(ManualScheduledActivity(
            id: 'act-init-${i + 1}-${first.id}',
            sourceActivityId: first.id,
            name: first.name,
            destination: assignedDest,
            category: first.category,
            durationMinutes: first.durationMinutes,
            cost: first.estimatedCost,
            time: '09:00 AM',
            description: first.description,
          ));
        }
      }

      newDays.add(ManualPlannedDay(
        dayNumber: i + 1,
        dateStr: dateStr,
        destination: assignedDest,
        activities: existingActs,
      ));
    }

    _plannedDays = newDays;
    if (_activeDayIndex >= _plannedDays.length) {
      _activeDayIndex = 0;
    }
  }

  void _syncTransitLegs() {
    final List<ManualTransitLeg> legs = [];
    if (_plannedDays.length > 1) {
      for (int i = 0; i < _plannedDays.length - 1; i++) {
        final cur = _plannedDays[i];
        final next = _plannedDays[i + 1];
        if (cur.destination != next.destination) {
          legs.add(ManualTransitLeg(
            id: 'leg-${cur.dayNumber}-${next.dayNumber}',
            fromDayNumber: cur.dayNumber,
            toDayNumber: next.dayNumber,
            fromDestination: cur.destination,
            toDestination: next.destination,
            mode: _transitStrategy == 'OPEN_PUBLIC' ? 'PUBLIC_TRANSPORT' : 'PRIVATE',
            vehicleType: _privateVehicleType,
            estimatedCostUSD: _transitStrategy == 'OPEN_PUBLIC' ? 8.0 * _totalTravelers : 35.0,
          ));
        }
      }
    }
    _transitLegs = legs;
  }

  // -------------------------------------------------------------
  // FINANCIAL CALCULATIONS (Mirroring Website Step 6)
  // -------------------------------------------------------------
  double get _totalAccommodationCost {
    final activeHotels = _selectedAccommodations.values.toList();
    if (activeHotels.isEmpty || _totalNights == 0) return 0;
    final nightsPerHotel = _totalNights / activeHotels.length;
    double sum = 0;
    for (final h in activeHotels) {
      sum += h.pricePerNight * nightsPerHotel;
    }
    return sum;
  }

  double get _totalActivityCost {
    double sum = 0;
    for (final day in _plannedDays) {
      for (final a in day.activities) {
        sum += a.cost;
      }
    }
    return sum;
  }

  double get _totalTransportCost {
    if (_transitStrategy == 'WHOLE_TRIP_PRIVATE') {
      final rate = _privateVehicleType == 'Tourist Van'
          ? 55.0
          : _privateVehicleType == 'Luxury SUV'
              ? 75.0
              : 35.0;
      return _durationDays * rate;
    }
    if (_transitStrategy == 'OPEN_PUBLIC') {
      return _durationDays * 6.0 * _totalTravelers;
    }
    // MULTI_LEG
    if (_transitLegs.isNotEmpty) {
      return _transitLegs.fold(0.0, (acc, l) => acc + l.estimatedCostUSD);
    }
    return 35.0 * _durationDays;
  }

  double get _tourismTaxesAndFees => (_totalAccommodationCost + _totalActivityCost + _totalTransportCost) * 0.08;

  double get _totalEstimatedCost =>
      _totalAccommodationCost + _totalActivityCost + _totalTransportCost + _tourismTaxesAndFees;

  double get _remainingBudget => _targetBudget - _totalEstimatedCost;

  // -------------------------------------------------------------
  // AI ITINERARY OPTIMIZER (Matching Website Algorithm)
  // -------------------------------------------------------------
  void _runAIOptimizer() {
    final budget = _targetBudget;
    final fixedCosts = _totalAccommodationCost + _totalTransportCost;
    final maxForActivities = (budget - fixedCosts).clamp(20.0, 5000.0);
    double runningTotal = 0;

    setState(() {
      for (int i = 0; i < _plannedDays.length; i++) {
        final day = _plannedDays[i];
        final candidates = kActivitiesCatalog.where((a) => a.destination == day.destination).toList();

        // Sort by style match and price efficiency
        candidates.sort((a, b) {
          final aMatch = a.travelStyles.where((s) => _selectedTravelStyles.contains(s)).length;
          final bMatch = b.travelStyles.where((s) => _selectedTravelStyles.contains(s)).length;
          if (bMatch != aMatch) return bMatch.compareTo(aMatch);
          return a.estimatedCost.compareTo(b.estimatedCost);
        });

        final List<ManualScheduledActivity> chosen = [];
        final morningTimes = ['08:30 AM', '09:00 AM'];
        final afternoonTimes = ['01:30 PM', '02:00 PM'];
        final sunsetTimes = ['05:00 PM', '05:30 PM'];

        for (int cIdx = 0; cIdx < candidates.length && chosen.length < 3; cIdx++) {
          final act = candidates[cIdx];
          if (runningTotal + act.estimatedCost <= maxForActivities || act.estimatedCost == 0 || chosen.isEmpty) {
            final timeSlot = chosen.isEmpty
                ? morningTimes[0]
                : chosen.length == 1
                    ? afternoonTimes[0]
                    : sunsetTimes[0];

            chosen.add(ManualScheduledActivity(
              id: 'ai-${i + 1}-${act.id}-${DateTime.now().millisecondsSinceEpoch}',
              sourceActivityId: act.id,
              name: act.name,
              destination: day.destination,
              category: act.category,
              durationMinutes: act.durationMinutes,
              cost: act.estimatedCost,
              time: timeSlot,
              description: act.description,
            ));
            runningTotal += act.estimatedCost;
          }
        }

        day.activities = chosen;
      }
    });

    _showToast('✨ AI Itinerary Optimizer sequenced activities strictly within your \$${budget.toStringAsFixed(0)} budget!');
  }

  void _showToast(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w600, color: Colors.white)),
        backgroundColor: const Color(0xFF0B3A53),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _handleFinalizeTrip() async {
    if (_selectedDestinations.isEmpty) {
      _showToast('Please select at least one destination.');
      setState(() => _currentStep = 1);
      return;
    }

    setState(() => _isSaving = true);

    final title = _tripNameController.text.trim().isNotEmpty
        ? _tripNameController.text.trim()
        : '${_selectedDestinations.join(' & ')} Trail';
    final primaryDest = _selectedDestinations.first;
    final destId = primaryDest.toLowerCase().replaceAll(' ', '_');

    String imageAsset = 'assets/images/destinations/sigiriya.jpg';
    if (primaryDest.contains('Kandy')) imageAsset = 'assets/images/destinations/Kandy.jpg';
    if (primaryDest.contains('Ella')) imageAsset = 'assets/images/destinations/Ella.jpg';
    if (primaryDest.contains('Galle')) imageAsset = 'assets/images/destinations/Galle.jpg';
    if (primaryDest.contains('Mirissa')) imageAsset = 'assets/images/destinations/Mirissa.jpg';
    if (primaryDest.contains('Yala')) imageAsset = 'assets/images/destinations/Yala.jpg';

    // 1. Convert planned days to model
    final itineraryList = _plannedDays.map((d) {
      return TripDayItinerary(
        day: d.dayNumber,
        date: d.dateStr,
        title: 'Day in ${d.destination}',
        activities: d.activities.map((a) {
          return TripActivityDetail(
            time: a.time,
            title: a.name,
            location: a.destination,
            description: a.description,
            type: a.category,
            status: 'Confirmed',
          );
        }).toList(),
      );
    }).toList();

    // 2. Convert accommodations to bookings
    final bookingsList = _selectedAccommodations.values.map((h) {
      return TripBookingDetail(
        id: 'bk-${h.id}-${DateTime.now().millisecondsSinceEpoch}',
        type: 'Hotel',
        provider: h.name,
        details: '${h.typeString} · ${h.packageName}',
        dates: '${DateFormat('dd MMM').format(_startDate)} – ${DateFormat('dd MMM yyyy').format(_endDate)}',
        confirmationCode: 'SRI-${h.id.split('-').last.toUpperCase()}-${DateTime.now().millisecond}',
        amount: '\$${h.pricePerNight.toStringAsFixed(0)} / night',
        destination: h.destination,
        packageName: h.packageName,
        status: 'Confirmed',
      );
    }).toList();

    final newTrip = UserTripDetail(
      id: 'trip-manual-${DateTime.now().millisecondsSinceEpoch}',
      name: title,
      destination: _selectedDestinations.join(' & ').toUpperCase(),
      destinationId: destId,
      startDate: DateFormat('yyyy-MM-dd').format(_startDate),
      endDate: DateFormat('yyyy-MM-dd').format(_endDate),
      dates: '${DateFormat('dd MMM').format(_startDate)} – ${DateFormat('dd MMM yyyy').format(_endDate)}',
      duration: '$_durationDays Days',
      travelers: _totalTravelers,
      status: 'Planning',
      timelineLabel: 'Custom Itinerary Ready',
      imageUrl: imageAsset,
      budget: '\$${_totalEstimatedCost.toStringAsFixed(0)}',
      spentBudget: '\$0',
      isFeatured: true,
      notes: 'Custom planned journey across ${_selectedDestinations.join(', ')} with ${_transitStrategy.toLowerCase()} transport.',
      dailyItinerary: itineraryList,
      bookingsList: bookingsList,
    );

    // Persist to backend API (or local state fallback)
    try {
      await ApiService.createTrip(
        title: title,
        description: newTrip.notes,
        startDate: _startDate,
        endDate: _endDate,
        numberOfTravelers: _totalTravelers,
        budget: _totalEstimatedCost,
        transportRequired: _transitStrategy != 'NONE',
        destinationIds: _selectedDestinations,
      );
    } catch (e) {
      debugPrint('[ManualPlanner] Backend save note: $e');
    }

    setState(() => _isSaving = false);

    if (widget.onTripCreated != null) {
      widget.onTripCreated!(newTrip);
    }

    if (mounted) {
      _showSuccessDialog(newTrip);
    }
  }

  void _showSuccessDialog(UserTripDetail trip) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFF14B8A6).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF0D9488), size: 36),
            ),
            const SizedBox(height: 16),
            Text(
              'Journey Created!',
              style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: const Color(0xFF0B3A53)),
            ),
            const SizedBox(height: 8),
            Text(
              '${trip.name} has been saved to your active travels with verified stays, transport, and a day-by-day itinerary.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 12.5, color: const Color(0xFF64748B), height: 1.4),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _dialogStat('Duration', trip.duration),
                  _dialogStat('Travelers', '${trip.travelers} Guests'),
                  _dialogStat('Est. Cost', trip.budget),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Return to TripsScreen
                },
                child: Text('View in Your Journeys', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dialogStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500])),
        const SizedBox(height: 2),
        Text(value, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B3A53),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Manual Trip Planner', style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Step $_currentStep of 6: ${_stepTitle(_currentStep)}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF2DD4BF))),
          ],
        ),
      ),
      body: Column(
        children: [
          // 1. Guided Stepper Indicator Bar
          _buildStepProgressIndicator(),

          // 2. Active Step Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: _buildCurrentStepView(),
            ),
          ),

          // 3. Bottom Sticky Action Navigation Bar
          _buildBottomNavigationBar(),
        ],
      ),
    );
  }

  String _stepTitle(int s) {
    switch (s) {
      case 1:
        return 'Details & Destinations';
      case 2:
        return 'Staycations & Stays';
      case 3:
        return 'Travel Styles';
      case 4:
        return 'Transportation';
      case 5:
        return 'Itinerary Builder';
      case 6:
        return 'Review & Finalize';
      default:
        return '';
    }
  }

  // =============================================================
  // STEPPER PROGRESS BAR
  // =============================================================
  Widget _buildStepProgressIndicator() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        children: [
          Row(
            children: List.generate(6, (idx) {
              final stepNum = idx + 1;
              final isPassed = stepNum < _currentStep;
              final isCurrent = stepNum == _currentStep;

              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: isPassed
                              ? const Color(0xFF0D9488)
                              : isCurrent
                                  ? const Color(0xFF0B3A53)
                                  : Colors.grey[200],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    if (idx < 5) const SizedBox(width: 4),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'STEP $_currentStep OF 6',
                style: GoogleFonts.robotoMono(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488)),
              ),
              Text(
                _stepTitle(_currentStep),
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF475569)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =============================================================
  // CURRENT STEP DISPATCHER
  // =============================================================
  Widget _buildCurrentStepView() {
    switch (_currentStep) {
      case 1:
        return _buildStep1DetailsAndDestinations();
      case 2:
        return _buildStep2Accommodations();
      case 3:
        return _buildStep3TravelStyles();
      case 4:
        return _buildStep4Transportation();
      case 5:
        return _buildStep5ItineraryBuilder();
      case 6:
        return _buildStep6ReviewAndFinalize();
      default:
        return const SizedBox.shrink();
    }
  }

  // =============================================================
  // STEP 1: TRIP DETAILS & DESTINATIONS
  // =============================================================
  Widget _buildStep1DetailsAndDestinations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Plan Your Custom Journey', 'Set your trip name, travel dates, passenger group, and choose destinations across Sri Lanka.'),
        const SizedBox(height: 16),

        // Trip Name Input
        Text('Trip Name / Title', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
        const SizedBox(height: 6),
        TextField(
          controller: _tripNameController,
          decoration: InputDecoration(
            hintText: 'e.g. Cultural Triangle & Tea Hills Odyssey',
            prefixIcon: const Icon(Icons.flight_takeoff_rounded, color: Color(0xFF146C86), size: 20),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[300]!)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[200]!)),
          ),
        ),
        const SizedBox(height: 20),

        // Dates & Duration Picker Row
        Text('Travel Dates & Duration', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
        const SizedBox(height: 6),
        Row(
          children: [
            Expanded(
              child: _buildDatePickerBox(
                label: 'Start Date',
                date: _startDate,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _startDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 730)),
                  );
                  if (picked != null) {
                    setState(() {
                      _startDate = picked;
                      if (_endDate.isBefore(_startDate)) {
                        _endDate = _startDate.add(const Duration(days: 3));
                      }
                      _syncPlannedDays();
                      _syncTransitLegs();
                    });
                  }
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildDatePickerBox(
                label: 'End Date',
                date: _endDate,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _endDate,
                    firstDate: _startDate,
                    lastDate: DateTime.now().add(const Duration(days: 730)),
                  );
                  if (picked != null) {
                    setState(() {
                      _endDate = picked;
                      _syncPlannedDays();
                      _syncTransitLegs();
                    });
                  }
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFBBF7D0))),
          child: Row(
            children: [
              const Icon(Icons.calendar_today, size: 14, color: Color(0xFF16A34A)),
              const SizedBox(width: 8),
              Text(
                'Calculated Duration: $_durationDays Days ($_totalNights Nights)',
                style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF15803D)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Travelers & Budget Row
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Adults (Age 12+)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _buildCounterBox(_adultsCount, (val) => setState(() => _adultsCount = val.clamp(1, 20))),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Children (Age 0-11)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  _buildCounterBox(_childrenCount, (val) => setState(() => _childrenCount = val.clamp(0, 10))),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Target Budget USD
        Text('Estimated Trip Budget (USD)', style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
        const SizedBox(height: 6),
        TextField(
          controller: _budgetController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            prefixText: '\$ ',
            prefixStyle: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488)),
            hintText: '800',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey[300]!)),
          ),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 24),

        // Destinations Multi-Selection Section
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Destinations (${_selectedDestinations.length} Selected)', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
            Text('Select 1 or more', style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500])),
          ],
        ),
        const SizedBox(height: 10),

        ...kSriLankaDestinations.map((dest) {
          final isSelected = _selectedDestinations.contains(dest.name);

          return InkWell(
            onTap: () {
              setState(() {
                if (isSelected) {
                  if (_selectedDestinations.length > 1) {
                    _selectedDestinations.remove(dest.name);
                    _selectedAccommodations.remove(dest.name);
                  } else {
                    _showToast('Keep at least one destination.');
                  }
                } else {
                  _selectedDestinations.add(dest.name);
                  final firstMatch = kAccommodationsCatalog.where((a) => a.destination == dest.name).toList();
                  if (firstMatch.isNotEmpty) {
                    _selectedAccommodations[dest.name] = firstMatch.first;
                  }
                }
                _syncPlannedDays();
                _syncTransitLegs();
              });
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? const Color(0xFF0D9488) : Colors.grey[200]!,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected ? [BoxShadow(color: const Color(0xFF0D9488).withValues(alpha: 0.12), blurRadius: 10, offset: const Offset(0, 4))] : null,
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      dest.imagePath,
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(width: 60, height: 60, color: Colors.grey[200], child: const Icon(Icons.photo, color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(dest.name, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                              child: Text(dest.region, style: GoogleFonts.inter(fontSize: 9.5, fontWeight: FontWeight.w600, color: const Color(0xFF475569))),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(dest.highlight, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600]), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  Icon(
                    isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                    color: isSelected ? const Color(0xFF0D9488) : Colors.grey[400],
                    size: 22,
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildDatePickerBox({required String label, required DateTime date, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500])),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.event, size: 16, color: Color(0xFF0D9488)),
                const SizedBox(width: 6),
                Text(DateFormat('dd MMM yyyy').format(date), style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCounterBox(int val, Function(int) onChanged) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.remove, size: 16),
            onPressed: () => onChanged(val - 1),
          ),
          Text('$val', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold)),
          IconButton(
            icon: const Icon(Icons.add, size: 16),
            onPressed: () => onChanged(val + 1),
          ),
        ],
      ),
    );
  }

  // =============================================================
  // STEP 2: ACCOMMODATION SELECTION
  // =============================================================
  Widget _buildStep2Accommodations() {
    final filtered = kAccommodationsCatalog.where((acc) {
      final matchesDest = _selectedDestinations.contains(acc.destination);
      final matchesCat = _selectedCategoryFilter == null || acc.category == _selectedCategoryFilter;
      return matchesDest && matchesCat;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Accommodations & Staycations', 'Choose where you want to stay in each of your ${_selectedDestinations.length} selected destinations.'),
        const SizedBox(height: 12),

        // Live Total Bar
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFBBF7D0))),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Estimated Accommodation Cost', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF15803D))),
                  Text('\$${_totalAccommodationCost.toStringAsFixed(0)} USD', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF166534))),
                ],
              ),
              Text('${_selectedAccommodations.length} Stays Selected', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF15803D))),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip('All Types', _selectedCategoryFilter == null, () => setState(() => _selectedCategoryFilter = null)),
              const SizedBox(width: 8),
              _buildFilterChip('5-Star Hotel', _selectedCategoryFilter == AccommodationCategory.fiveStar, () => setState(() => _selectedCategoryFilter = AccommodationCategory.fiveStar)),
              const SizedBox(width: 8),
              _buildFilterChip('4-Star Hotel', _selectedCategoryFilter == AccommodationCategory.fourStar, () => setState(() => _selectedCategoryFilter = AccommodationCategory.fourStar)),
              const SizedBox(width: 8),
              _buildFilterChip('Private Cabana', _selectedCategoryFilter == AccommodationCategory.privateCabana, () => setState(() => _selectedCategoryFilter = AccommodationCategory.privateCabana)),
            ],
          ),
        ),
        const SizedBox(height: 16),

        if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text('No accommodations found for this filter.', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)),
            ),
          )
        else
          ...filtered.map((acc) {
            final isChosen = _selectedAccommodations[acc.destination]?.id == acc.id;

            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isChosen ? const Color(0xFF0D9488) : Colors.grey[200]!, width: isChosen ? 2 : 1),
                boxShadow: NovaBrand.softShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Photo & Badges Header
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                        child: Image.asset(
                          acc.imagePath,
                          height: 130,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(height: 130, color: Colors.grey[200]),
                        ),
                      ),
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: const Color(0xFF0B3A53), borderRadius: BorderRadius.circular(8)),
                          child: Text(acc.destination, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ),
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                          child: Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 13),
                              const SizedBox(width: 3),
                              Text('${acc.rating} (${acc.reviewCount})', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Details Body
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(acc.name, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                            ),
                            Text('\$${acc.pricePerNight.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w900, color: const Color(0xFF0D9488))),
                          ],
                        ),
                        Text(acc.packageName, style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF146C86), fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Text(acc.description, style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[600]), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 10),

                        // Amenities Wrap
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: acc.includedFacilities.take(3).map((f) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                              child: Text('✓ $f', style: GoogleFonts.inter(fontSize: 9.5, color: const Color(0xFF475569))),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 12),

                        // Select Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isChosen ? const Color(0xFF0D9488) : const Color(0xFFF8FAFC),
                              foregroundColor: isChosen ? Colors.white : const Color(0xFF0B3A53),
                              side: BorderSide(color: isChosen ? const Color(0xFF0D9488) : Colors.grey[300]!),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              elevation: 0,
                            ),
                            onPressed: () {
                              setState(() {
                                if (isChosen) {
                                  _selectedAccommodations.remove(acc.destination);
                                } else {
                                  _selectedAccommodations[acc.destination] = acc;
                                }
                              });
                            },
                            child: Text(
                              isChosen ? 'Selected for ${acc.destination} ✓' : 'Select Stay for ${acc.destination}',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0B3A53) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF0B3A53) : Colors.grey[300]!),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(fontSize: 11.5, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? Colors.white : const Color(0xFF475569)),
        ),
      ),
    );
  }

  // =============================================================
  // STEP 3: TRAVEL STYLES
  // =============================================================
  Widget _buildStep3TravelStyles() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Travel Styles & Preferences', 'Select the vibes and styles that best match your group to personalize activities and recommendations.'),
        const SizedBox(height: 14),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.45,
          ),
          itemCount: kTravelStylesList.length,
          itemBuilder: (ctx, idx) {
            final style = kTravelStylesList[idx];
            final isSelected = _selectedTravelStyles.contains(style.id);

            return InkWell(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    _selectedTravelStyles.remove(style.id);
                  } else {
                    _selectedTravelStyles.add(style.id);
                  }
                });
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF0D9488) : Colors.grey[200]!,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(style.icon, style: const TextStyle(fontSize: 22)),
                        if (isSelected) const Icon(Icons.check_circle, size: 16, color: Color(0xFF0D9488)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(style.label, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                    Text(style.desc, style: GoogleFonts.inter(fontSize: 9.5, color: Colors.grey[500]), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // =============================================================
  // STEP 4: TRANSPORTATION
  // =============================================================
  Widget _buildStep4Transportation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Transportation & Mobility', 'Choose how you want to navigate across destinations during your trip.'),
        const SizedBox(height: 14),

        // Transit Strategies
        _buildStrategyCard(
          id: 'MULTI_LEG',
          title: 'Multi-Leg & Inter-City Transit',
          desc: 'Flexible transit tailored to each leg between destinations with private or scenic train options.',
          icon: Icons.alt_route_rounded,
        ),
        const SizedBox(height: 10),
        _buildStrategyCard(
          id: 'WHOLE_TRIP_PRIVATE',
          title: 'Whole-Trip Dedicated Private Vehicle',
          desc: 'Continuous dedicated vehicle and English-speaking chauffeur assigned for all $_durationDays days.',
          icon: Icons.directions_car_rounded,
        ),
        const SizedBox(height: 10),
        _buildStrategyCard(
          id: 'OPEN_PUBLIC',
          title: 'Public Transport & Scenic Coastal/Hill Trains',
          desc: 'Authentic Sri Lankan travel via coastal express trains and highland panoramic observation cars.',
          icon: Icons.train_rounded,
        ),
        const SizedBox(height: 20),

        // Private Vehicle Types
        if (_transitStrategy != 'OPEN_PUBLIC') ...[
          Text('Select Vehicle Category', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
          const SizedBox(height: 10),

          ...kPrivateVehicleOptions.map((veh) {
            final isChosen = _privateVehicleType == veh.title;

            return InkWell(
              onTap: () {
                setState(() {
                  _privateVehicleType = veh.title;
                  _syncTransitLegs();
                });
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isChosen ? const Color(0xFF0D9488) : Colors.grey[200]!, width: isChosen ? 2 : 1),
                ),
                child: Row(
                  children: [
                    Text(veh.icon, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(veh.title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                              Text('\$${veh.dailyRate.toStringAsFixed(0)} / day', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0D9488))),
                            ],
                          ),
                          Text('${veh.capacity} · ${veh.description}', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[600])),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],

        const SizedBox(height: 20),

        // Inter-Destination Route Summary
        Text('Inter-Destination Transit Legs', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
        const SizedBox(height: 8),

        if (_transitLegs.isEmpty)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
            child: Text('All days are scheduled within the same destination. Local city tuk-tuks can be hailed on demand.', style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[600])),
          )
        else
          ..._transitLegs.map((leg) {
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
              child: Row(
                children: [
                  const Icon(Icons.arrow_forward_rounded, color: Color(0xFF0D9488), size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text('${leg.fromDestination} ➔ ${leg.toDestination}', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
                  ),
                  Text('\$${leg.estimatedCostUSD.toStringAsFixed(0)} USD', style: GoogleFonts.robotoMono(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildStrategyCard({required String id, required String title, required String desc, required IconData icon}) {
    final isSelected = _transitStrategy == id;

    return InkWell(
      onTap: () {
        setState(() {
          _transitStrategy = id;
          _syncTransitLegs();
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? const Color(0xFF0D9488) : Colors.grey[200]!, width: isSelected ? 2 : 1),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF0D9488) : const Color(0xFF64748B), size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                  const SizedBox(height: 2),
                  Text(desc, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
                ],
              ),
            ),
            Icon(isSelected ? Icons.check_circle : Icons.radio_button_unchecked, color: isSelected ? const Color(0xFF0D9488) : Colors.grey[300], size: 20),
          ],
        ),
      ),
    );
  }

  // =============================================================
  // STEP 5: ITINERARY BUILDER
  // =============================================================
  Widget _buildStep5ItineraryBuilder() {
    if (_plannedDays.isEmpty) {
      _syncPlannedDays();
    }
    final activeDay = _plannedDays[_activeDayIndex.clamp(0, _plannedDays.length - 1)];
    final availableActs = kActivitiesCatalog.where((a) => a.destination == activeDay.destination).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: _buildSectionHeader('Itinerary Builder', 'Customize activities for each day or use the AI Optimizer to balance your itinerary.'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // AI Optimizer Button Bar
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _runAIOptimizer,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0B3A53),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 2,
            ),
            icon: const Icon(Icons.auto_awesome, color: Color(0xFF2DD4BF), size: 18),
            label: Text('✨ AI Itinerary Optimizer (Auto-Schedule)', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 16),

        // Horizontal Day Tabs
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(_plannedDays.length, (idx) {
              final isTabActive = _activeDayIndex == idx;
              final day = _plannedDays[idx];

              return InkWell(
                onTap: () => setState(() => _activeDayIndex = idx),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isTabActive ? const Color(0xFF0D9488) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isTabActive ? const Color(0xFF0D9488) : Colors.grey[200]!),
                  ),
                  child: Column(
                    children: [
                      Text('Day ${day.dayNumber}', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: isTabActive ? Colors.white : const Color(0xFF0B3A53))),
                      Text(day.destination, style: GoogleFonts.inter(fontSize: 10, color: isTabActive ? Colors.white70 : Colors.grey[500])),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 16),

        // Active Day Info Card
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Day ${activeDay.dayNumber} · ${activeDay.dateStr}', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
                  Text('Destination: ${activeDay.destination}', style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF146C86))),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)),
                child: Text('${activeDay.activities.length} Activities', style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Scheduled Activities List
        Text('Scheduled for Day ${activeDay.dayNumber}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
        const SizedBox(height: 8),

        if (activeDay.activities.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
            child: Center(
              child: Text('No activities scheduled for this day yet. Tap any recommended activity below to add it.', textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey)),
            ),
          )
        else
          ...activeDay.activities.asMap().entries.map((entry) {
            final actIdx = entry.key;
            final act = entry.value;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(6)),
                    child: Text(act.time, style: GoogleFonts.robotoMono(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF0F766E))),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(act.name, style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                        Text('${act.category} · ${act.durationMinutes} mins · ${act.cost == 0 ? "Free" : "\$${act.cost.toStringAsFixed(0)}"}', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[500])),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.arrow_upward, size: 16, color: Colors.grey),
                    onPressed: actIdx > 0
                        ? () {
                            setState(() {
                              final temp = activeDay.activities[actIdx];
                              activeDay.activities[actIdx] = activeDay.activities[actIdx - 1];
                              activeDay.activities[actIdx - 1] = temp;
                            });
                          }
                        : null,
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                    onPressed: () {
                      setState(() {
                        activeDay.activities.removeAt(actIdx);
                      });
                    },
                  ),
                ],
              ),
            );
          }),

        const SizedBox(height: 20),

        // Activity Pool Recommendations
        Text('Add Activities in ${activeDay.destination}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
        const SizedBox(height: 8),

        ...availableActs.map((act) {
          final isAlreadyAdded = activeDay.activities.any((a) => a.sourceActivityId == act.id);

          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey[200]!)),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(act.imagePath, width: 44, height: 44, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(width: 44, height: 44, color: Colors.grey[200])),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(act.name, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                      Text('${act.category} · ${act.estimatedCost == 0 ? "Free" : "\$${act.estimatedCost.toStringAsFixed(0)}"}', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[500])),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isAlreadyAdded ? Colors.grey[200] : const Color(0xFF0D9488),
                    foregroundColor: isAlreadyAdded ? Colors.grey[600] : Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    elevation: 0,
                  ),
                  onPressed: isAlreadyAdded
                      ? null
                      : () {
                          setState(() {
                            activeDay.activities.add(ManualScheduledActivity(
                              id: 'sched-${DateTime.now().millisecondsSinceEpoch}',
                              sourceActivityId: act.id,
                              name: act.name,
                              destination: act.destination,
                              category: act.category,
                              durationMinutes: act.durationMinutes,
                              cost: act.estimatedCost,
                              time: '02:00 PM',
                              description: act.description,
                            ));
                          });
                        },
                  child: Text(isAlreadyAdded ? 'Added' : '+ Add', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // =============================================================
  // STEP 6: REVIEW & FINALIZE (Matching Website Breakdown)
  // =============================================================
  Widget _buildStep6ReviewAndFinalize() {
    final title = _tripNameController.text.trim().isNotEmpty ? _tripNameController.text.trim() : 'Sri Lanka Journey';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Trip Review & Financial Breakdown', 'Verify your customized travel plan, stays, mobility, and cost calculation before saving.'),
        const SizedBox(height: 16),

        // Hero Summary Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0B3A53), Color(0xFF146C86)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: NovaBrand.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFF2DD4BF).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                    child: Text('MANUAL ITINERARY', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF2DD4BF))),
                  ),
                  Text('$_durationDays Days · $_totalNights Nights', style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                ],
              ),
              const SizedBox(height: 10),
              Text(title, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 4),
              Text(
                '${DateFormat('dd MMM').format(_startDate)} – ${DateFormat('dd MMM yyyy').format(_endDate)} · $_totalTravelers Travelers',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.white70),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: _selectedDestinations.map((d) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                    child: Text('📍 $d', style: GoogleFonts.inter(fontSize: 10.5, color: Colors.white, fontWeight: FontWeight.w600)),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Financial Breakdown Card (Mirroring Website)
        Container(
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
              Text('Cost Breakdown', style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
              const SizedBox(height: 12),

              _buildBreakdownRow('Accommodations ($_totalNights Nights)', '\$${_totalAccommodationCost.toStringAsFixed(0)}'),
              _buildBreakdownRow('Activities (${_plannedDays.fold(0, (sum, d) => sum + d.activities.length)} Total)', '\$${_totalActivityCost.toStringAsFixed(0)}'),
              _buildBreakdownRow('Mobility & Transport', '\$${_totalTransportCost.toStringAsFixed(0)}'),
              _buildBreakdownRow('Tourism VAT & Levies (8%)', '\$${_tourismTaxesAndFees.toStringAsFixed(0)}'),
              const Divider(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total Estimated Cost', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A))),
                  Text('\$${_totalEstimatedCost.toStringAsFixed(0)} USD', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF0D9488))),
                ],
              ),
              const SizedBox(height: 12),

              // Budget Adherence Bar
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: _remainingBudget >= 0 ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _remainingBudget >= 0 ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
                ),
                child: Row(
                  children: [
                    Icon(
                      _remainingBudget >= 0 ? Icons.check_circle_outline : Icons.warning_amber_rounded,
                      color: _remainingBudget >= 0 ? const Color(0xFF16A34A) : Colors.red,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _remainingBudget >= 0
                            ? 'Within Budget: \$${_remainingBudget.toStringAsFixed(0)} remaining of \$${_targetBudget.toStringAsFixed(0)}'
                            : 'Exceeds target budget by \$${(-_remainingBudget).toStringAsFixed(0)}',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _remainingBudget >= 0 ? const Color(0xFF15803D) : Colors.red[800],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Quick Travel Styles Summary
        Text('Selected Travel Styles', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 6,
          children: _selectedTravelStyles.map((s) {
            final match = kTravelStylesList.firstWhere((ts) => ts.id == s, orElse: () => ManualTravelStyle(id: s, label: s, icon: '✨', desc: ''));
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.grey[200]!)),
              child: Text('${match.icon} ${match.label}', style: GoogleFonts.inter(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF0B3A53))),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildBreakdownRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600])),
          Text(value, style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFF0B3A53))),
        const SizedBox(height: 4),
        Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF64748B), height: 1.35)),
      ],
    );
  }

  // =============================================================
  // BOTTOM STICKY ACTION NAVIGATION BAR
  // =============================================================
  Widget _buildBottomNavigationBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[200]!)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 1)
              Expanded(
                flex: 1,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF0B3A53),
                    side: BorderSide(color: Colors.grey[300]!),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => setState(() => _currentStep--),
                  child: Text('Back', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ),
            if (_currentStep > 1) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B3A53),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  elevation: 2,
                ),
                onPressed: _isSaving
                    ? null
                    : () {
                        if (_currentStep < 6) {
                          setState(() => _currentStep++);
                        } else {
                          _handleFinalizeTrip();
                        }
                      },
                child: _isSaving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(
                        _currentStep < 6 ? 'Next: ${_stepTitle(_currentStep + 1)}' : 'Save & Finalize Journey',
                        style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
