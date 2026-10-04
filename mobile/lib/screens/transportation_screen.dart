import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/travel_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TransportationScreen extends StatefulWidget {
  const TransportationScreen({super.key});

  @override
  State<TransportationScreen> createState() => _TransportationScreenState();
}

class _TransportationScreenState extends State<TransportationScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<TransportPartnerItem> _partners = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadTransport();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTransport() async {
    setState(() => _isLoading = true);
    final partners = await ApiService.getTransportPartners();
    if (mounted) {
      setState(() {
        _partners = partners;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: AppBar(
        title: Text(
          'Island Transportation',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: NovaBrand.primary),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: NovaBrand.primary,
          unselectedLabelColor: NovaBrand.slateMuted,
          indicatorColor: NovaBrand.tertiary,
          indicatorWeight: 3,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Partners & Cabs'),
            Tab(text: 'Scenic Trains'),
            Tab(text: 'Express Buses'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. Partners & PickMe
          _buildPartnersTab(),

          // 2. Trains
          _buildTrainsTab(),

          // 3. Buses
          _buildBusesTab(),
        ],
      ),
    );
  }

  Widget _buildPartnersTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Promo Banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: NovaBrand.tealGradient,
            borderRadius: BorderRadius.circular(24),
            boxShadow: NovaBrand.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'EXCLUSIVE PROMO',
                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                  const Icon(Icons.local_taxi_rounded, color: Colors.white, size: 24),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                '10% OFF Rides with PickMe',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
              ),
              const SizedBox(height: 6),
              Text(
                'Use promo code TRAVELLINK10 on your PickMe app across Colombo, Kandy, Galle, and Mirissa.',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withValues(alpha: 0.9), height: 1.4),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('TRAVELLINK10', style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 14, color: NovaBrand.primary)),
                    const SizedBox(width: 8),
                    const Icon(Icons.copy, size: 16, color: NovaBrand.primary),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Text(
          'Official Mobility Partners',
          style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: NovaBrand.primary),
        ),
        const SizedBox(height: 12),

        if (_isLoading)
          const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
        else if (_partners.isEmpty)
          _buildPartnerCard(
            name: 'PickMe Sri Lanka',
            description: 'Sri Lanka’s premier ride-hailing app for cars, vans, and tuk-tuks with fixed upfront pricing.',
            discount: '10% Discount Available',
            appUrl: 'https://pickme.lk',
          )
        else
          ..._partners.map((p) => _buildPartnerCard(
                name: p.name,
                description: p.description,
                discount: p.discountDescription,
                appUrl: p.websiteUrl,
              )),
      ],
    );
  }

  Widget _buildPartnerCard({required String name, required String description, required String discount, required String appUrl}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: NovaBrand.cardBorder),
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
                  color: NovaBrand.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.car_rental, color: NovaBrand.primary, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
                    Text(discount, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.tertiary, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(description, style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted, height: 1.4)),
        ],
      ),
    );
  }

  Widget _buildTrainsTab() {
    final trains = [
      {
        'route': 'Main Line: Kandy → Ella',
        'desc': 'World-famous scenic mountain journey past tea estates, waterfalls, and mist-veiled viaducts.',
        'duration': '6h 30m',
        'classes': 'Observation Saloon, 1st & 2nd Class AC',
        'fare': '\$12 – \$20 USD',
        'highlight': 'Nine Arch Bridge Crossing',
      },
      {
        'route': 'Coastal Line: Colombo Fort → Galle',
        'desc': 'Breathtaking ocean-side tracks running mere meters from crashing Indian Ocean surf.',
        'duration': '2h 15m',
        'classes': 'Rajarata Rejini / AC Intercity',
        'fare': '\$4 – \$10 USD',
        'highlight': 'Sunset coastal run',
      },
      {
        'route': 'Northern Line: Colombo → Anuradhapura',
        'desc': 'Direct express train to the ancient sacred kingdom and royal archaeological gardens.',
        'duration': '3h 45m',
        'classes': 'Yal Devi / Uttara Devi Express',
        'fare': '\$6 – \$15 USD',
        'highlight': 'Fast cultural link',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: trains.length,
      itemBuilder: (ctx, i) {
        final t = trains[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: NovaBrand.cardBorder),
            boxShadow: NovaBrand.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      t['route']!,
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.primary),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: NovaBrand.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(t['duration']!, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: NovaBrand.primary)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(t['desc']!, style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted, height: 1.4)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(t['classes']!, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.secondary, fontWeight: FontWeight.w600)),
                  Text(t['fare']!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: NovaBrand.accentAmber)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBusesTab() {
    final buses = [
      {
        'route': 'EX-01: Colombo (Makumbura) ⇄ Galle',
        'highway': 'Southern Expressway (E01)',
        'frequency': 'Every 20 minutes',
        'time': '1h 15m',
        'fare': 'LKR 950 (~ \$3.20)',
      },
      {
        'route': 'EX-02: Colombo (Pettah) ⇄ Kandy',
        'highway': 'Central Expressway (E04)',
        'frequency': 'Every 30 minutes',
        'time': '2h 45m',
        'fare': 'LKR 1,100 (~ \$3.60)',
      },
      {
        'route': 'EX-03: BIA Airport Express ⇄ Colombo Fort',
        'highway': 'Colombo-Katunayake Expressway (E03)',
        'frequency': 'Every 30 minutes (24/7)',
        'time': '35 minutes',
        'fare': 'LKR 550 (~ \$1.80)',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: buses.length,
      itemBuilder: (ctx, i) {
        final b = buses[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: NovaBrand.cardBorder),
            boxShadow: NovaBrand.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(b['route']!, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
              const SizedBox(height: 4),
              Text(b['highway']!, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.tertiary, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 14, color: NovaBrand.slateMuted),
                      const SizedBox(width: 4),
                      Text(b['frequency']!, style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
                    ],
                  ),
                  Text(b['fare']!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: NovaBrand.primary)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
