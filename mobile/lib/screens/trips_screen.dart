import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<UserTrip> _trips = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final trips = await ApiService.getTrips();
      if (mounted) {
        setState(() {
          _trips = trips;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load trips. Make sure you are signed in.';
          _isLoading = false;
        });
      }
    }
  }

  void _showCreateTripModal() async {
    final destinations = await ApiService.getDestinations();

    if (!mounted) return;

    final titleController = TextEditingController();
    DateTime startDate = DateTime.now().add(const Duration(days: 7));
    DateTime endDate = DateTime.now().add(const Duration(days: 12));
    int travelers = 2;
    double budget = 1200;
    bool transport = true;
    final List<String> selectedDestIds = [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final days = endDate.difference(startDate).inDays;

            return Padding(
              padding: EdgeInsets.only(
                top: 24,
                left: 20,
                right: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Plan New Journey',
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: NovaBrand.primary,
                              ),
                            ),
                            Text(
                              'Direct database sync with NOVA web platform',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: NovaBrand.slateMuted,
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: NovaBrand.slateMuted),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Title
                    Text('Trip Name', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: titleController,
                      style: GoogleFonts.inter(fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'e.g. Ella & Yala Scenic Expedition',
                        filled: true,
                        fillColor: NovaBrand.slateLight,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: NovaBrand.cardBorder),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Destination picker
                    Text('Choose Destinations', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                    const SizedBox(height: 8),
                    destinations.isEmpty
                        ? Text('Loading destinations...', style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted))
                        : Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: destinations.map((d) {
                              final isSelected = selectedDestIds.contains(d.id);
                              return FilterChip(
                                label: Text(d.name),
                                selected: isSelected,
                                onSelected: (val) {
                                  setModalState(() {
                                    if (val) {
                                      selectedDestIds.add(d.id);
                                    } else {
                                      selectedDestIds.remove(d.id);
                                    }
                                  });
                                },
                                selectedColor: NovaBrand.primary,
                                checkmarkColor: Colors.white,
                                labelStyle: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected ? Colors.white : NovaBrand.slateDark,
                                ),
                              );
                            }).toList(),
                          ),
                    const SizedBox(height: 16),

                    // Dates & Travelers
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Travel Dates', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                decoration: BoxDecoration(
                                  color: NovaBrand.slateLight,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: NovaBrand.cardBorder),
                                ),
                                child: Text(
                                  '${DateFormat('MMM d').format(startDate)} – ${DateFormat('MMM d').format(endDate)} ($days d)',
                                  style: GoogleFonts.inter(fontSize: 13, color: NovaBrand.primary, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Travelers', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: NovaBrand.secondary),
                                  onPressed: travelers > 1 ? () => setModalState(() => travelers--) : null,
                                ),
                                Text('$travelers', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline, color: NovaBrand.secondary),
                                  onPressed: travelers < 12 ? () => setModalState(() => travelers++) : null,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Budget Slider
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Estimated Budget', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
                        Text('\$${budget.toInt()} USD', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: NovaBrand.primary)),
                      ],
                    ),
                    Slider(
                      value: budget,
                      min: 300,
                      max: 5000,
                      divisions: 47,
                      activeColor: NovaBrand.primary,
                      onChanged: (val) => setModalState(() => budget = val),
                    ),

                    // Transport Toggle
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text('Include Private Chauffeur & AC Vehicle', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                      subtitle: Text('Seamless point-to-point transfers between sights', style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                      value: transport,
                      activeColor: NovaBrand.tertiary,
                      onChanged: (val) => setModalState(() => transport = val),
                    ),
                    const SizedBox(height: 20),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NovaBrand.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: () async {
                          if (titleController.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter a trip name')),
                            );
                            return;
                          }

                          Navigator.pop(ctx);
                          final res = await ApiService.createTrip(
                            title: titleController.text.trim(),
                            startDate: startDate,
                            endDate: endDate,
                            numberOfTravelers: travelers,
                            budget: budget,
                            transportRequired: transport,
                            destinationIds: selectedDestIds,
                          );

                          if (res['success'] == true) {
                            _loadTrips();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Journey created and synced with web database!'),
                                  backgroundColor: Colors.teal,
                                ),
                              );
                            }
                          } else {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(res['message'] ?? 'Failed to save trip')),
                              );
                            }
                          }
                        },
                        child: Text(
                          'Save & Sync Journey',
                          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
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

  void _handleDeleteTrip(String tripId, String title) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete Trip?', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete "$title"? This removes it from your web account too.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await ApiService.deleteTrip(tripId);
              if (success) {
                _loadTrips();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Trip deleted from database.')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      body: RefreshIndicator(
        onRefresh: _loadTrips,
        color: NovaBrand.primary,
        child: CustomScrollView(
          slivers: [
            // Header Banner
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                decoration: const BoxDecoration(
                  gradient: NovaBrand.heroGradient,
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
                ),
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
                              'My Travel Itineraries',
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Synchronized with your NOVA web account',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: _showCreateTripModal,
                          icon: const Icon(Icons.add, size: 16, color: NovaBrand.primary),
                          label: Text('Plan Trip', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13, color: NovaBrand.primary)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Content
            if (_isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: NovaBrand.primary),
                      SizedBox(height: 12),
                      Text('Syncing trips with backend...', style: TextStyle(color: NovaBrand.slateMuted)),
                    ],
                  ),
                ),
              )
            else if (_trips.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: NovaBrand.primary.withValues(alpha: 0.08),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.flight_takeoff_rounded, size: 54, color: NovaBrand.primary),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'No Trips Found',
                          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: NovaBrand.primary),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Create your first custom itinerary or generate one with the AI Architect. Any trip created here appears on your web portal.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 13, color: NovaBrand.slateMuted, height: 1.4),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _showCreateTripModal,
                          icon: const Icon(Icons.add, color: Colors.white),
                          label: const Text('Start Planning', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: NovaBrand.primary,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(20),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final trip = _trips[index];
                      final duration = trip.endDate.difference(trip.startDate).inDays;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: NovaBrand.cardBorder),
                          boxShadow: NovaBrand.softShadow,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(18),
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
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF10B981).withValues(alpha: 0.12),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Text(
                                            '${trip.status} · ${trip.aiScore.toInt()}% AI SCORE',
                                            style: GoogleFonts.inter(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w800,
                                              color: const Color(0xFF059669),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          trip.title,
                                          style: GoogleFonts.outfit(
                                            fontSize: 17,
                                            fontWeight: FontWeight.w800,
                                            color: NovaBrand.slateDark,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  PopupMenuButton<String>(
                                    onSelected: (val) {
                                      if (val == 'delete') {
                                        _handleDeleteTrip(trip.id, trip.title);
                                      }
                                    },
                                    itemBuilder: (ctx) => [
                                      const PopupMenuItem(
                                        value: 'delete',
                                        child: Row(
                                          children: [
                                            Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                                            SizedBox(width: 8),
                                            Text('Delete Trip', style: TextStyle(color: Colors.redAccent)),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // Metadata strip
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: NovaBrand.slateLight,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    _buildTripMetaItem(Icons.calendar_today_outlined, '$duration Days', 'Duration'),
                                    _buildTripMetaItem(Icons.group_outlined, '${trip.numberOfTravelers}', 'Travelers'),
                                    _buildTripMetaItem(Icons.attach_money, '\$${trip.budget.toInt()}', 'Budget'),
                                    _buildTripMetaItem(
                                      trip.transportRequired ? Icons.directions_car : Icons.public,
                                      trip.transportRequired ? 'Chauffeur' : 'Public',
                                      'Transport',
                                    ),
                                  ],
                                ),
                              ),

                              if (trip.destinationNames.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: trip.destinationNames.map((d) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: NovaBrand.primary.withValues(alpha: 0.08),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        d,
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: NovaBrand.primary,
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                    childCount: _trips.length,
                  ),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateTripModal,
        backgroundColor: NovaBrand.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Plan New Trip', style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }

  Widget _buildTripMetaItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, size: 16, color: NovaBrand.secondary),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.slateDark)),
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted)),
      ],
    );
  }
}
