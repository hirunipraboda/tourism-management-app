import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/guide_models.dart';
import '../services/api_service.dart';

class _AppPalette {
  static const slate50 = Color(0xFFF8FAFC);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate200 = Color(0xFFE2E8F0);
  static const slate300 = Color(0xFFCBD5E1);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate600 = Color(0xFF475569);
  static const slate700 = Color(0xFF334155);
  static const emerald50 = Color(0xFFECFDF5);
  static const emerald200 = Color(0xFFA7F3D0);
  static const emerald700 = Color(0xFF047857);
  static const amber50 = Color(0xFFFFFBEB);
  static const amber200 = Color(0xFFFDE68A);
  static const amber800 = Color(0xFF92400E);
  static const rose500 = Color(0xFFF43F5E);
  static const primaryNavy = Color(0xFF0B3A53);
  static const tealAccent = Color(0xFF14B8A6);
  static const tealDark = Color(0xFF0D9488);
}

class GuideManagementScreen extends StatefulWidget {
  final int initialTabIndex;

  const GuideManagementScreen({super.key, this.initialTabIndex = 0});

  @override
  State<GuideManagementScreen> createState() => _GuideManagementScreenState();
}

class _GuideManagementScreenState extends State<GuideManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<GuideModel> _guides = [];
  List<GuideAvailabilitySlot> _slots = [];
  bool _isLoading = true;

  String _searchQuery = '';
  String _selectedSpecialty = 'All';
  String _selectedGuideFilter = 'All';
  String _dateFilter = '';

  final List<String> _specialties = [
    'All',
    'Cultural Heritage',
    'Mountain Hiking',
    'Galle Fort',
    'Ancient Kingdoms',
    'Wildlife Safari',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTabIndex);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final guides = await ApiService.getGuides();
      List<GuideAvailabilitySlot> allSlots = [];
      for (final g in guides) {
        final gSlots = await ApiService.getGuideAvailability(g.id);
        allSlots.addAll(gSlots);
      }
      if (mounted) {
        setState(() {
          _guides = guides;
          _slots = allSlots.isNotEmpty ? allSlots : kInitialMockAvailabilitySlots;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _guides = kInitialMockGuides;
          _slots = kInitialMockAvailabilitySlots;
          _isLoading = false;
        });
      }
    }
  }

  void _showAddGuideDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final expCtrl = TextEditingController(text: '3');
    final langCtrl = TextEditingController(text: 'English, Sinhala');
    final specCtrl = TextEditingController(text: 'Cultural Heritage');
    final bioCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _AppPalette.tealAccent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.person_add_rounded, color: _AppPalette.tealDark, size: 22),
            ),
            const SizedBox(width: 12),
            Text(
              'Register New Guide',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDialogField('Full Name *', nameCtrl, Icons.person_outline),
              const SizedBox(height: 10),
              _buildDialogField('Email Address *', emailCtrl, Icons.email_outlined),
              const SizedBox(height: 10),
              _buildDialogField('Phone Number', phoneCtrl, Icons.phone_outlined),
              const SizedBox(height: 10),
              _buildDialogField('Years Experience', expCtrl, Icons.badge_outlined, isNumber: true),
              const SizedBox(height: 10),
              _buildDialogField('Languages (comma separated)', langCtrl, Icons.translate_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Specialties (comma separated)', specCtrl, Icons.star_border_rounded),
              const SizedBox(height: 10),
              _buildDialogField('Bio / Experience Details', bioCtrl, Icons.info_outline, maxLines: 3),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: _AppPalette.slate600)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: _AppPalette.primaryNavy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty || emailCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              final res = await ApiService.createGuide(
                name: nameCtrl.text.trim(),
                email: emailCtrl.text.trim(),
                phone: phoneCtrl.text.trim(),
                bio: bioCtrl.text.trim(),
                yearsExperience: int.tryParse(expCtrl.text.trim()) ?? 3,
                languages: langCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
                specialties: specCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
              );
              if (res['success'] == true && res['guide'] != null) {
                setState(() => _guides.insert(0, res['guide'] as GuideModel));
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Guide registered successfully!'), backgroundColor: _AppPalette.tealDark),
                  );
                }
              }
            },
            child: Text('Register', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _showAddSlotDialog([int? preselectedGuideId]) {
    final guideId = preselectedGuideId ?? (_guides.isNotEmpty ? _guides.first.id : 1);
    int chosenGuide = guideId;
    final dateCtrl = TextEditingController(text: DateTime.now().add(const Duration(days: 1)).toIso8601String().split('T').first);
    final startCtrl = TextEditingController(text: '09:00:00');
    final endCtrl = TextEditingController(text: '17:00:00');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _AppPalette.tealDark.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.calendar_month_rounded, color: _AppPalette.tealDark, size: 22),
              ),
              const SizedBox(width: 12),
              Text(
                'Add Availability Slot',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  value: chosenGuide,
                  decoration: InputDecoration(
                    labelText: 'Select Guide',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  items: _guides.map((g) => DropdownMenuItem(value: g.id, child: Text(g.name))).toList(),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => chosenGuide = val);
                  },
                ),
                const SizedBox(height: 12),
                _buildDialogField('Date (YYYY-MM-DD)', dateCtrl, Icons.calendar_today_rounded),
                const SizedBox(height: 12),
                _buildDialogField('Start Time (HH:mm:ss)', startCtrl, Icons.access_time_rounded),
                const SizedBox(height: 12),
                _buildDialogField('End Time (HH:mm:ss)', endCtrl, Icons.more_time_rounded),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: _AppPalette.slate600)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _AppPalette.tealDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final slot = await ApiService.createGuideAvailability(
                  guideId: chosenGuide,
                  availableDate: dateCtrl.text.trim(),
                  startTime: startCtrl.text.trim(),
                  endTime: endCtrl.text.trim(),
                );
                if (slot != null) {
                  setState(() => _slots.insert(0, slot));
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Availability slot added!'), backgroundColor: _AppPalette.tealDark),
                    );
                  }
                }
              },
              child: Text('Save Slot', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDialogField(String label, TextEditingController ctrl, IconData icon, {bool isNumber = false, int maxLines = 1}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      maxLines: maxLines,
      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: _AppPalette.tealAccent),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }

  void _showGuideDetails(GuideModel guide) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 48,
                  height: 4,
                  decoration: BoxDecoration(color: _AppPalette.slate300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundImage: guide.avatarUrl.isNotEmpty ? NetworkImage(guide.avatarUrl) : null,
                    backgroundColor: _AppPalette.tealAccent.withValues(alpha: 0.2),
                    child: guide.avatarUrl.isEmpty ? Text(guide.name.substring(0, 1), style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)) : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(guide.name, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: _AppPalette.primaryNavy)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                            const SizedBox(width: 4),
                            Text('${guide.rating.toStringAsFixed(1)} Rating', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _AppPalette.slate700)),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: guide.verificationStatus == 'Verified' ? _AppPalette.emerald50 : _AppPalette.amber50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: guide.verificationStatus == 'Verified' ? _AppPalette.emerald200 : _AppPalette.amber200),
                              ),
                              child: Text(
                                guide.verificationStatus,
                                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: guide.verificationStatus == 'Verified' ? _AppPalette.emerald700 : _AppPalette.amber800),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(guide.email, style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate500)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text('About & Experience', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
              const SizedBox(height: 8),
              Text(guide.bio.isNotEmpty ? guide.bio : 'Certified national tour guide with accredited tourism ministry credentials.', style: GoogleFonts.inter(fontSize: 13, color: _AppPalette.slate600, height: 1.5)),
              const SizedBox(height: 16),
              Text('Languages Spoken', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: guide.languages.map((l) => Chip(
                  label: Text(l, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.primaryNavy)),
                  backgroundColor: _AppPalette.slate100,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                )).toList(),
              ),
              const SizedBox(height: 16),
              Text('Specialties & Focus', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: guide.specialties.map((s) => Chip(
                  label: Text(s, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
                  backgroundColor: _AppPalette.tealAccent.withValues(alpha: 0.1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                )).toList(),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: _AppPalette.tealAccent),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showAddSlotDialog(guide.id);
                      },
                      icon: const Icon(Icons.add_circle_outline, color: _AppPalette.tealDark),
                      label: Text('Add Slot', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        backgroundColor: _AppPalette.primaryNavy,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _tabController.animateTo(1);
                        setState(() => _selectedGuideFilter = guide.name);
                      },
                      icon: const Icon(Icons.calendar_month_outlined),
                      label: Text('View Slots', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _AppPalette.slate50,
      appBar: AppBar(
        backgroundColor: _AppPalette.primaryNavy,
        elevation: 0,
        title: Text(
          'Licensed Guides & Availability',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: _AppPalette.tealAccent,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          labelStyle: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800),
          tabs: const [
            Tab(icon: Icon(Icons.badge_outlined, size: 20), text: 'Tour Guides'),
            Tab(icon: Icon(Icons.event_available_rounded, size: 20), text: 'Availability Slots'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: _AppPalette.tealDark,
        foregroundColor: Colors.white,
        elevation: 4,
        onPressed: () {
          if (_tabController.index == 0) {
            _showAddGuideDialog();
          } else {
            _showAddSlotDialog();
          }
        },
        icon: const Icon(Icons.add_rounded),
        label: Text(
          _tabController.index == 0 ? 'Register Guide' : 'Add Slot',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _AppPalette.tealAccent))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildGuidesTab(),
                _buildAvailabilityTab(),
              ],
            ),
    );
  }

  Widget _buildGuidesTab() {
    final filtered = _guides.where((g) {
      final matchesSearch = _searchQuery.isEmpty ||
          g.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          g.specialties.any((s) => s.toLowerCase().contains(_searchQuery.toLowerCase())) ||
          g.languages.any((l) => l.toLowerCase().contains(_searchQuery.toLowerCase()));
      final matchesSpec = _selectedSpecialty == 'All' || g.specialties.any((s) => s.toLowerCase().contains(_selectedSpecialty.toLowerCase()));
      return matchesSearch && matchesSpec;
    }).toList();

    return RefreshIndicator(
      onRefresh: _loadData,
      color: _AppPalette.tealAccent,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: 'Search guide by name, language, specialty...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate400),
              prefixIcon: const Icon(Icons.search_rounded, color: _AppPalette.tealAccent),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: _AppPalette.slate200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: _AppPalette.slate200)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
          const SizedBox(height: 12),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _specialties.map((spec) {
                final isSelected = _selectedSpecialty == spec;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(spec),
                    selected: isSelected,
                    onSelected: (val) => setState(() => _selectedSpecialty = spec),
                    selectedColor: _AppPalette.tealAccent.withValues(alpha: 0.2),
                    checkmarkColor: _AppPalette.tealDark,
                    labelStyle: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? _AppPalette.tealDark : _AppPalette.slate600,
                    ),
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSelected ? _AppPalette.tealAccent : _AppPalette.slate200)),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          ...filtered.map((guide) => _buildGuideCard(guide)),

          if (filtered.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 60),
              child: Center(
                child: Text('No guides match your criteria.', style: GoogleFonts.inter(fontSize: 13, color: _AppPalette.slate400)),
              ),
            ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildGuideCard(GuideModel guide) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _AppPalette.slate200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundImage: guide.avatarUrl.isNotEmpty ? NetworkImage(guide.avatarUrl) : null,
                backgroundColor: _AppPalette.tealAccent.withValues(alpha: 0.15),
                child: guide.avatarUrl.isEmpty ? Text(guide.name.substring(0, 1), style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: _AppPalette.tealDark)) : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            guide.name,
                            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: _AppPalette.primaryNavy),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (guide.verificationStatus == 'Verified')
                          const Icon(Icons.verified_rounded, color: _AppPalette.tealDark, size: 16),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, color: Colors.amber, size: 15),
                        const SizedBox(width: 3),
                        Text('${guide.rating.toStringAsFixed(1)} · ${guide.yearsExperience} yrs exp', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: _AppPalette.slate600)),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: guide.status == 'Available' ? _AppPalette.emerald50 : _AppPalette.amber50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  guide.status,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: guide.status == 'Available' ? _AppPalette.emerald700 : _AppPalette.amber800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            guide.bio.isNotEmpty ? guide.bio : 'Expert guide delivering memorable Sri Lanka cultural and scenic adventures.',
            style: GoogleFonts.inter(fontSize: 12, color: _AppPalette.slate600, height: 1.4),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: guide.specialties.map((s) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _AppPalette.tealAccent.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(s, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: _AppPalette.tealDark)),
            )).toList(),
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: _AppPalette.slate100),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () => _showGuideDetails(guide),
                icon: const Icon(Icons.visibility_outlined, size: 16, color: _AppPalette.primaryNavy),
                label: Text('View Details', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 18, color: _AppPalette.slate500),
                    onPressed: () {
                      final nameCtrl = TextEditingController(text: guide.name);
                      final emailCtrl = TextEditingController(text: guide.email);
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: Text('Edit ${guide.name}', style: GoogleFonts.outfit(fontWeight: FontWeight.w800)),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _buildDialogField('Name', nameCtrl, Icons.person),
                              const SizedBox(height: 8),
                              _buildDialogField('Email', emailCtrl, Icons.email),
                            ],
                          ),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                            ElevatedButton(
                              onPressed: () async {
                                Navigator.pop(ctx);
                                await ApiService.updateGuide(guide.id, name: nameCtrl.text.trim(), email: emailCtrl.text.trim());
                                setState(() {
                                  final idx = _guides.indexWhere((g) => g.id == guide.id);
                                  if (idx != -1) _guides[idx] = _guides[idx].copyWith(name: nameCtrl.text.trim(), email: emailCtrl.text.trim());
                                });
                              },
                              child: const Text('Save'),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18, color: _AppPalette.rose500),
                    onPressed: () async {
                      await ApiService.deleteGuide(guide.id);
                      setState(() => _guides.removeWhere((g) => g.id == guide.id));
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

  Widget _buildAvailabilityTab() {
    final filteredSlots = _slots.where((s) {
      final matchesGuide = _selectedGuideFilter == 'All' || s.guideName.toLowerCase().contains(_selectedGuideFilter.toLowerCase());
      final matchesDate = _dateFilter.isEmpty || s.availableDate == _dateFilter;
      return matchesGuide && matchesDate;
    }).toList();

    return RefreshIndicator(
      onRefresh: _loadData,
      color: _AppPalette.tealAccent,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedGuideFilter,
                  decoration: InputDecoration(
                    labelText: 'Guide Filter',
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _AppPalette.slate200)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: [
                    const DropdownMenuItem(value: 'All', child: Text('All Guides')),
                    ..._guides.map((g) => DropdownMenuItem(value: g.name, child: Text(g.name))),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedGuideFilter = val);
                  },
                ),
              ),
              const SizedBox(width: 10),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: _AppPalette.slate200)),
                ),
                icon: const Icon(Icons.date_range_rounded, color: _AppPalette.tealDark),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2025),
                    lastDate: DateTime(2028),
                  );
                  if (picked != null) {
                    setState(() => _dateFilter = picked.toIso8601String().split('T').first);
                  }
                },
              ),
              if (_dateFilter.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.clear, color: _AppPalette.rose500, size: 20),
                  onPressed: () => setState(() => _dateFilter = ''),
                ),
            ],
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _AppPalette.primaryNavy.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: _AppPalette.primaryNavy.withValues(alpha: 0.1)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${filteredSlots.length} Slots Available',
                  style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy),
                ),
                Text(
                  'Active Dispatch Window',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _AppPalette.slate500),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          ...filteredSlots.map((slot) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: _AppPalette.slate200),
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _AppPalette.tealAccent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.schedule_rounded, color: _AppPalette.tealDark, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(slot.guideName.isNotEmpty ? slot.guideName : 'Guide #${slot.guideId}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: _AppPalette.primaryNavy)),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 12, color: _AppPalette.slate500),
                          const SizedBox(width: 4),
                          Text(slot.availableDate, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _AppPalette.slate600)),
                          const SizedBox(width: 10),
                          const Icon(Icons.access_time_rounded, size: 12, color: _AppPalette.slate500),
                          const SizedBox(width: 4),
                          Text('${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _AppPalette.slate600)),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: _AppPalette.rose500, size: 20),
                  onPressed: () async {
                    await ApiService.deleteGuideAvailability(slot.guideId, slot.availabilityId);
                    setState(() => _slots.removeWhere((s) => s.availabilityId == slot.availabilityId));
                  },
                ),
              ],
            ),
          )),

          if (filteredSlots.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 60),
              child: Center(
                child: Text('No availability slots for chosen filters.', style: GoogleFonts.inter(fontSize: 13, color: _AppPalette.slate400)),
              ),
            ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
