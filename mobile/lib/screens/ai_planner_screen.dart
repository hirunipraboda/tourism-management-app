import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AiPlannerScreen extends StatefulWidget {
  const AiPlannerScreen({super.key});

  @override
  State<AiPlannerScreen> createState() => _AiPlannerScreenState();
}

class _AiPlannerScreenState extends State<AiPlannerScreen> {
  final _destinationsController = TextEditingController(text: 'Sigiriya, Kandy, Ella, Galle');
  double _durationDays = 5;
  String _selectedStyle = 'Cultural & Scenic';
  String _selectedBudgetTier = 'Moderate';
  int _travelers = 2;
  bool _isLoading = false;
  TripPlanResult? _planResult;

  final List<String> _styles = [
    'Cultural & Scenic',
    'Highland & Rail',
    'Beach & Coastal',
    'Wildlife Safari',
    'Adventure & Trek',
  ];

  final List<Map<String, dynamic>> _budgetTiers = [
    {'tier': 'Budget', 'range': '\$40 - \$70 / day', 'approx': 350.0},
    {'tier': 'Moderate', 'range': '\$70 - \$140 / day', 'approx': 750.0},
    {'tier': 'Luxury', 'range': '\$150+ / day', 'approx': 1400.0},
  ];

  void _generatePlan() async {
    setState(() {
      _isLoading = true;
    });

    final destinations = _destinationsController.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();

    double budgetNum = 750.0;
    final match = _budgetTiers.firstWhere(
      (b) => b['tier'] == _selectedBudgetTier,
      orElse: () => _budgetTiers[1],
    );
    budgetNum = match['approx'] as double;

    final result = await ApiService.generateAITripPlan(
      destinations: destinations.isNotEmpty ? destinations : ['Sigiriya', 'Ella', 'Mirissa'],
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      budget: budgetNum,
      travelers: _travelers,
    );

    setState(() {
      _isLoading = false;
      _planResult = result;
    });
  }

  @override
  void dispose() {
    _destinationsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: NovaBrand.tealGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI Trip Architect',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: NovaBrand.primary,
                        ),
                      ),
                      Text(
                        'Instant personalized itinerary with cost breakdowns',
                        style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Architect Configuration Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: NovaBrand.cardBorder),
                boxShadow: NovaBrand.softShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Destinations input
                  Text(
                    'Target Destinations or Regions',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _destinationsController,
                    style: GoogleFonts.inter(fontSize: 13),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: NovaBrand.slateLight,
                      prefixIcon: const Icon(Icons.pin_drop_outlined, color: NovaBrand.tertiary, size: 20),
                      hintText: 'e.g. Sigiriya, Kandy, Ella, Galle',
                      hintStyle: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: NovaBrand.cardBorder)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Duration Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Journey Duration',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: NovaBrand.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_durationDays.toInt()} Days',
                          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  Slider(
                    value: _durationDays,
                    min: 1,
                    max: 14,
                    divisions: 13,
                    activeColor: NovaBrand.tertiary,
                    inactiveColor: NovaBrand.cardBorder,
                    onChanged: (val) => setState(() => _durationDays = val),
                  ),
                  const SizedBox(height: 10),

                  // Travel Style Chips
                  Text(
                    'Travel Style & Vibe',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _styles.map((s) {
                      final isSelected = _selectedStyle == s;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedStyle = s),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? NovaBrand.primary : NovaBrand.slateLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: isSelected ? NovaBrand.primary : NovaBrand.cardBorder),
                          ),
                          child: Text(
                            s,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? Colors.white : NovaBrand.slateDark,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Budget Tier & Travelers
                  Row(
                    children: [
                      // Budget Tier Selector
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Budget Tier',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: NovaBrand.slateLight,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: NovaBrand.cardBorder),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedBudgetTier,
                                  isExpanded: true,
                                  icon: const Icon(Icons.arrow_drop_down, color: NovaBrand.secondary),
                                  style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateDark, fontWeight: FontWeight.w600),
                                  items: _budgetTiers.map((b) {
                                    return DropdownMenuItem<String>(
                                      value: b['tier'] as String,
                                      child: Text('${b['tier']} (${b['range']})', overflow: TextOverflow.ellipsis),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _selectedBudgetTier = val);
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Travelers Counter
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Travelers',
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: NovaBrand.slateLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: NovaBrand.cardBorder),
                            ),
                            child: Row(
                              children: [
                                IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: _travelers > 1 ? () => setState(() => _travelers--) : null,
                                  icon: const Icon(Icons.remove, size: 18, color: NovaBrand.secondary),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  child: Text(
                                    '$_travelers',
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                ),
                                IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: () => setState(() => _travelers++),
                                  icon: const Icon(Icons.add, size: 18, color: NovaBrand.secondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Generate Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _generatePlan,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NovaBrand.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isLoading
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Synthesizing AI Itinerary...',
                                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ],
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.auto_awesome, size: 18, color: NovaBrand.accentAmber),
                                const SizedBox(width: 8),
                                Text(
                                  'Generate Smart Itinerary',
                                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Generated Itinerary Results Section
            if (_planResult != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Generated Itinerary',
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: NovaBrand.primary,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: NovaBrand.tertiary.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.verified, size: 13, color: NovaBrand.secondary),
                        const SizedBox(width: 4),
                        Text(
                          '${_planResult!.aiScore.toInt()}% AI Score',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: NovaBrand.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Overview Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: NovaBrand.heroGradient,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _planResult!.title,
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${_planResult!.duration} Days Journey · ${_planResult!.destinations.join(" · ")}',
                          style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('Est. Budget', style: GoogleFonts.inter(fontSize: 10, color: Colors.white70)),
                        Text(
                          '\$${_planResult!.totalBudget.toInt()}',
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: NovaBrand.accentAmber,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Day by Day Cards
              ..._planResult!.days.map((day) => _buildDayCard(day)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDayCard(ItineraryDay day) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: NovaBrand.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'DAY ${day.day}',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Text(
                  '\$${day.estimatedCost.toInt()} est.',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: NovaBrand.secondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              day.title,
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: NovaBrand.slateDark,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 13, color: NovaBrand.tertiary),
                const SizedBox(width: 4),
                Text(
                  day.location,
                  style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              day.description,
              style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
