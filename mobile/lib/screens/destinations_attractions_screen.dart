import 'package:flutter/material.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';

// ──────────────────────────────────────────────────────────────────────────────
// Destinations & Attractions Screen
// Responsibility: Destination & Attraction Management Component
// Features: Search, Filter by category, Sort, Accessibility filter,
//           Attraction details (hours, fee, duration, accessibility, availability)
// ──────────────────────────────────────────────────────────────────────────────

class DestinationsAttractionsScreen extends StatefulWidget {
  const DestinationsAttractionsScreen({super.key});

  @override
  State<DestinationsAttractionsScreen> createState() =>
      _DestinationsAttractionsScreenState();
}

class _DestinationsAttractionsScreenState
    extends State<DestinationsAttractionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Search & filter state
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _selectedSort = 'Name';
  bool _accessibleOnly = false;

  // Data
  List<Attraction> _allAttractions = [];
  List<Attraction> _filtered = [];
  bool _isLoading = true;

  static const List<String> _categories = [
    'All', 'Cultural', 'Scenic', 'Adventure', 'Religious', 'Historical',
  ];

  static const List<String> _sortOptions = [
    'Name', 'Entry Fee ↑', 'Entry Fee ↓', 'Duration ↑', 'Duration ↓',
  ];

  static const _teal = Color(0xFF0D9488);
  static const _darkTeal = Color(0xFF0F766E);
  static const _bg = Color(0xFFF0FDFA);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAttractions();
    _searchController.addListener(_applyFilters);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAttractions() async {
    setState(() => _isLoading = true);
    final data = await ApiService.searchAttractions(
      query: _searchController.text,
      category: _selectedCategory,
      sortBy: _selectedSort,
      accessibleOnly: _accessibleOnly,
    );
    setState(() {
      _allAttractions = data;
      _applyFiltersToList(data);
      _isLoading = false;
    });
  }

  void _applyFilters() {
    _applyFiltersToList(_allAttractions);
  }

  void _applyFiltersToList(List<Attraction> source) {
    final q = _searchController.text.toLowerCase();
    var result = source.where((a) {
      final matchQuery = q.isEmpty ||
          a.name.toLowerCase().contains(q) ||
          a.category.toLowerCase().contains(q) ||
          a.location.toLowerCase().contains(q) ||
          a.description.toLowerCase().contains(q);
      final matchCategory =
          _selectedCategory == 'All' || a.category == _selectedCategory;
      final matchAccessible = !_accessibleOnly || a.isAccessible;
      return matchQuery && matchCategory && matchAccessible;
    }).toList();

    // Sort
    switch (_selectedSort) {
      case 'Entry Fee ↑':
        result.sort((a, b) => a.entryFee.compareTo(b.entryFee));
        break;
      case 'Entry Fee ↓':
        result.sort((a, b) => b.entryFee.compareTo(a.entryFee));
        break;
      case 'Duration ↑':
        result.sort(
            (a, b) => a.visitDurationMinutes.compareTo(b.visitDurationMinutes));
        break;
      case 'Duration ↓':
        result.sort(
            (a, b) => b.visitDurationMinutes.compareTo(a.visitDurationMinutes));
        break;
      default:
        result.sort((a, b) => a.name.compareTo(b.name));
    }

    setState(() => _filtered = result);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [_teal, _darkTeal],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.place, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'Destinations & Attractions',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
                fontSize: 16,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: _teal,
          labelColor: _teal,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(icon: Icon(Icons.explore), text: 'Attractions'),
            Tab(icon: Icon(Icons.info_outline), text: 'About'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAttractionsTab(),
          _buildAboutTab(),
        ],
      ),
    );
  }

  // ── Attractions Tab ──────────────────────────────────────────────────────────
  Widget _buildAttractionsTab() {
    return Column(
      children: [
        _buildSearchAndFilters(),
        _buildResultsSummary(),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: _teal),
                )
              : _filtered.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      color: _teal,
                      onRefresh: _loadAttractions,
                      child: ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                        itemCount: _filtered.length,
                        itemBuilder: (ctx, i) =>
                            _AttractionCard(attraction: _filtered[i]),
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        children: [
          // Search Bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search attractions, categories, locations...',
              hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
              prefixIcon: const Icon(Icons.search, color: _teal),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        _applyFilters();
                      },
                    )
                  : null,
              filled: true,
              fillColor: _bg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
            ),
          ),
          const SizedBox(height: 10),
          // Category Chips
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (ctx, i) {
                final cat = _categories[i];
                final selected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedCategory = cat);
                    _applyFilters();
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: selected ? _teal : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected ? _teal : Colors.grey.shade300,
                      ),
                    ),
                    child: Text(
                      cat,
                      style: TextStyle(
                        color: selected ? Colors.white : Colors.grey.shade700,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          // Sort & Accessibility Row
          Row(
            children: [
              const Icon(Icons.sort, size: 18, color: Colors.grey),
              const SizedBox(width: 6),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedSort,
                    isDense: true,
                    style: const TextStyle(
                        color: Color(0xFF0F172A),
                        fontSize: 13,
                        fontWeight: FontWeight.w500),
                    items: _sortOptions
                        .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedSort = val);
                        _applyFilters();
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Row(
                children: [
                  const Icon(Icons.accessible, size: 18, color: _teal),
                  const SizedBox(width: 4),
                  const Text('Accessible',
                      style: TextStyle(fontSize: 13, color: Colors.black87)),
                  Switch(
                    value: _accessibleOnly,
                    activeThumbColor: _teal,
                    onChanged: (val) {
                      setState(() => _accessibleOnly = val);
                      _applyFilters();
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResultsSummary() {
    return Container(
      color: _bg,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(
            '${_filtered.length} attraction${_filtered.length != 1 ? 's' : ''} found',
            style: const TextStyle(
                fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w500),
          ),
          const Spacer(),
          if (_selectedCategory != 'All' || _accessibleOnly)
            GestureDetector(
              onTap: () {
                setState(() {
                  _selectedCategory = 'All';
                  _accessibleOnly = false;
                  _searchController.clear();
                  _selectedSort = 'Name';
                });
                _applyFilters();
              },
              child: const Text(
                'Clear filters',
                style: TextStyle(
                    color: _teal, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            'No attractions found',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade600),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filters',
            style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
          ),
        ],
      ),
    );
  }

  // ── About Tab ───────────────────────────────────────────────────────────────
  Widget _buildAboutTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [_teal, _darkTeal],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Icon(Icons.auto_awesome, color: Colors.white, size: 28),
                SizedBox(height: 12),
                Text(
                  'Destination & Attraction Management',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  'AI-powered attraction curation matching your preferences, budget, and accessibility needs.',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Features',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _featureRow(Icons.search, 'Smart Search',
              'Search by name, category, or location across all destinations'),
          _featureRow(Icons.filter_list, 'Advanced Filtering',
              'Filter by category, entry fee, duration, and accessibility'),
          _featureRow(Icons.sort, 'Flexible Sorting',
              'Sort by name, entry fee (low-high), or visit duration'),
          _featureRow(Icons.accessible_forward, 'Accessibility Info',
              'Filter attractions by wheelchair and mobility accessibility'),
          _featureRow(Icons.schedule, 'Opening Hours',
              'View opening times and estimated visit durations'),
          _featureRow(Icons.attach_money, 'Entry Fees',
              'Transparent pricing for every attraction'),
          _featureRow(Icons.check_circle_outline, 'Availability',
              'Real-time attraction availability status'),
          _featureRow(Icons.psychology, 'AI Curation',
              'LangGraph AI agent matches attractions to your preferences and budget via the ASP.NET Core API'),
        ],
      ),
    );
  }

  Widget _featureRow(IconData icon, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _teal.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: _teal, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 2),
                Text(desc,
                    style:
                        const TextStyle(color: Colors.black54, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Attraction Card Widget
// ──────────────────────────────────────────────────────────────────────────────

class _AttractionCard extends StatelessWidget {
  final Attraction attraction;

  const _AttractionCard({required this.attraction});

  static const _teal = Color(0xFF0D9488);
  static const _amber = Color(0xFFF59E0B);

  Color get _categoryColor {
    switch (attraction.category) {
      case 'Cultural':
        return const Color(0xFF7C3AED);
      case 'Scenic':
        return const Color(0xFF0D9488);
      case 'Adventure':
        return const Color(0xFFEA580C);
      case 'Religious':
        return const Color(0xFFDB2777);
      case 'Historical':
        return const Color(0xFF854D0E);
      default:
        return Colors.blueGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showDetail(context),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  Image.network(
                    attraction.imageUrl.isNotEmpty
                        ? '${attraction.imageUrl}?w=600&auto=format&fit=crop'
                        : '',
                    height: 155,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 155,
                      color: Colors.teal.shade50,
                      child: const Center(
                          child: Icon(Icons.landscape,
                              size: 48, color: _teal)),
                    ),
                  ),
                  // Availability badge
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: attraction.isAvailable
                            ? Colors.green.shade600
                            : Colors.red.shade600,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        attraction.isAvailable ? 'Open' : 'Closed',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  // Category badge
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: _categoryColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        attraction.category,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    attraction.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          size: 13, color: Colors.grey),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          attraction.location,
                          style: const TextStyle(
                              fontSize: 12, color: Colors.grey),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    attraction.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13, color: Colors.black54, height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  // Info chips row
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _InfoChip(
                        icon: Icons.attach_money,
                        label: attraction.entryFee == 0
                            ? 'Free Entry'
                            : '\$${attraction.entryFee.toStringAsFixed(0)}',
                        color: attraction.entryFee == 0
                            ? Colors.green
                            : _amber,
                      ),
                      _InfoChip(
                        icon: Icons.schedule,
                        label:
                            '${(attraction.visitDurationMinutes / 60).toStringAsFixed(1)}h visit',
                        color: _teal,
                      ),
                      _InfoChip(
                        icon: Icons.access_time,
                        label: attraction.openingHours,
                        color: Colors.blueGrey,
                      ),
                      if (attraction.isAccessible)
                        const _InfoChip(
                          icon: Icons.accessible,
                          label: 'Accessible',
                          color: Color(0xFF7C3AED),
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

  void _showDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AttractionDetailSheet(attraction: attraction),
    );
  }
}

// ── Info Chip ──────────────────────────────────────────────────────────────
class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoChip(
      {required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  color: color,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Attraction Detail Bottom Sheet
// ──────────────────────────────────────────────────────────────────────────────

class _AttractionDetailSheet extends StatelessWidget {
  final Attraction attraction;
  static const _teal = Color(0xFF0D9488);

  const _AttractionDetailSheet({required this.attraction});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: controller,
            padding: EdgeInsets.zero,
            children: [
              // Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Hero Image
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    attraction.imageUrl.isNotEmpty
                        ? '${attraction.imageUrl}?w=800&auto=format&fit=crop'
                        : '',
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 200,
                      color: Colors.teal.shade50,
                      child:
                          const Center(child: Icon(Icons.landscape, size: 64, color: _teal)),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name + Availability
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            attraction.name,
                            style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: attraction.isAvailable
                                ? Colors.green.shade50
                                : Colors.red.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: attraction.isAvailable
                                  ? Colors.green.shade400
                                  : Colors.red.shade400,
                            ),
                          ),
                          child: Text(
                            attraction.isAvailable
                                ? '✓ Available'
                                : '✗ Unavailable',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: attraction.isAvailable
                                    ? Colors.green.shade700
                                    : Colors.red.shade700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on,
                            size: 15, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            attraction.location,
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Description
                    Text(
                      attraction.description,
                      style: const TextStyle(
                          fontSize: 14, color: Colors.black87, height: 1.6),
                    ),
                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 12),
                    // Detail Grid
                    const Text('Attraction Details',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF0F172A))),
                    const SizedBox(height: 12),
                    _DetailRow(
                        icon: Icons.category,
                        label: 'Category',
                        value: attraction.category),
                    _DetailRow(
                        icon: Icons.access_time,
                        label: 'Opening Hours',
                        value: attraction.openingHours),
                    _DetailRow(
                        icon: Icons.attach_money,
                        label: 'Entry Fee',
                        value: attraction.entryFee == 0
                            ? 'Free Entry'
                            : '\$${attraction.entryFee.toStringAsFixed(2)} USD'),
                    _DetailRow(
                        icon: Icons.schedule,
                        label: 'Estimated Visit',
                        value:
                            '${attraction.visitDurationMinutes} minutes (${(attraction.visitDurationMinutes / 60).toStringAsFixed(1)} hours)'),
                    _DetailRow(
                        icon: Icons.accessible,
                        label: 'Accessibility',
                        value: attraction.isAccessible
                            ? 'Wheelchair & mobility accessible'
                            : 'Limited accessibility — may not be suitable for all visitors'),
                    _DetailRow(
                        icon: Icons.event_available,
                        label: 'Availability',
                        value: attraction.isAvailable
                            ? 'Currently open and available'
                            : 'Currently unavailable'),
                    if (attraction.latitude != null &&
                        attraction.longitude != null)
                      _DetailRow(
                          icon: Icons.my_location,
                          label: 'Coordinates',
                          value:
                              '${attraction.latitude!.toStringAsFixed(4)}°N, ${attraction.longitude!.toStringAsFixed(4)}°E'),
                    const SizedBox(height: 24),
                    // Close button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _teal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Close',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 15)),
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
  }
}

// ── Detail Row ──────────────────────────────────────────────────────────────
class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  static const _teal = Color(0xFF0D9488);

  const _DetailRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: _teal.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: _teal),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 11,
                        color: Colors.grey,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(value,
                    style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                        fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
