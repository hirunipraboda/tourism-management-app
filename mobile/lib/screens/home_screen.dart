import 'package:flutter/material.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import 'destination_detail_screen.dart';
import 'bookings_screen.dart';
import 'guide_management_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<Destination>> _destinationsFuture;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Heritage',
    'Nature',
    'Cultural',
    'Beach',
    'Wildlife',
  ];

  @override
  void initState() {
    super.initState();
    _destinationsFuture = ApiService.getDestinations();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: const Color(0xFF0D9488),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.explore, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'NOVA Tourism',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 18),
                ),
                Text(
                  'Your Sri Lanka Island Journey',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.confirmation_number_outlined, color: Color(0xFF0D9488)),
            tooltip: 'My Bookings',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const BookingsScreen()),
              );
            },
          ),
        ],
      ),
      body: FutureBuilder<List<Destination>>(
        future: _destinationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
          }

          final allDestinations = snapshot.data ?? [];
          final filtered = allDestinations.where((d) {
            final matchesCat = _selectedCategory == 'All' ||
                d.category.toLowerCase() == _selectedCategory.toLowerCase();
            final matchesQuery = _searchQuery.isEmpty ||
                d.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                d.location.toLowerCase().contains(_searchQuery.toLowerCase());
            return matchesCat && matchesQuery;
          }).toList();

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search destinations, sights, provinces...',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF0D9488)),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Category Chips
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = _selectedCategory == cat;
                      return ChoiceChip(
                        label: Text(
                          cat,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? Colors.white : const Color(0xFF475569),
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: const Color(0xFF0D9488),
                        backgroundColor: Colors.white,
                        side: BorderSide(
                          color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0),
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        onSelected: (_) => setState(() => _selectedCategory = cat),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // Tour Guide Spotlight Banner for Tourists
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0B3A53), Color(0xFF146C86)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0B3A53).withOpacity(0.18),
                        blurRadius: 14,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: const Icon(Icons.person_pin_circle_rounded, color: Color(0xFF14B8A6), size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF14B8A6).withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    '100% SLTDA LICENSED',
                                    style: TextStyle(color: Color(0xFF5EEAD4), fontSize: 9, fontWeight: FontWeight.w900),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            const Text(
                              'Hire a Licensed Tour Guide',
                              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            const Text(
                              'Direct booking with verified Sri Lanka guides',
                              style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const GuideManagementScreen(initialTabIndex: 0)),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF14B8A6),
                          foregroundColor: const Color(0xFF0F172A),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Browse', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Destinations Count Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Available Destinations (${filtered.length})',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const Text(
                      'Live Weather & Telemetry',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0D9488)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Destination Cards List
                if (filtered.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(32),
                    margin: const EdgeInsets.only(top: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: const [
                        Icon(Icons.search_off, size: 48, color: Color(0xFF94A3B8)),
                        SizedBox(height: 8),
                        Text('No destinations found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        SizedBox(height: 4),
                        Text('Try adjusting your search query or filter category.', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                      ],
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final dest = filtered[index];
                      return _buildDestinationCard(dest);
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDestinationCard(Destination dest) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DestinationDetailScreen(destination: dest),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Header with Live Weather Badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  child: SizedBox(
                    height: 180,
                    width: double.infinity,
                    child: Image.network(
                      dest.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: const Color(0xFF0F766E),
                        child: const Icon(Icons.image, color: Colors.white54, size: 40),
                      ),
                    ),
                  ),
                ),
                // Top Left: Live Real-Time Weather Badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Row(
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
                        const SizedBox(width: 5),
                        const Icon(Icons.wb_sunny, color: Colors.amber, size: 12),
                        const SizedBox(width: 4),
                        Text(
                          '${dest.liveTemp}°C',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '· ${dest.liveCondition}',
                          style: const TextStyle(
                            color: Color(0xFF99F6E4),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Top Right: Rating
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.75),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 3),
                        Text(
                          '${dest.rating}',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                // Bottom Category Tag
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D9488),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      dest.category.toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                  ),
                ),
              ],
            ),

            // Card Body Content
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Budget Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          dest.name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Text(
                          dest.avgBudgetPerDay,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: Color(0xFF0D9488)),
                      const SizedBox(width: 4),
                      Text(
                        '${dest.province} · ${dest.location}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    dest.description,
                    style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Travel Planning Row (Best Time & Stay Days)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_month, size: 14, color: Color(0xFF0D9488)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  dest.bestTimeToVisit,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(width: 1, height: 20, color: const Color(0xFFE2E8F0)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Row(
                            children: [
                              const Icon(Icons.schedule, size: 14, color: Color(0xFF0D9488)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  dest.recommendedStayDays,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Entry Fees Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Local: ${dest.entryFeeLocal}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF059669)),
                      ),
                      Text(
                        'Foreign: ${dest.entryFeeForeign}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0891B2)),
                      ),
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
}
