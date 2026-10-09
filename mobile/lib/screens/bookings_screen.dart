import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../models/user_trip_models.dart';
import '../models/guide_models.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class _HotelStay {
  final UserTripDetail trip;
  final TripBookingDetail booking;
  _HotelStay(this.trip, this.booking);
}

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<_HotelStay> _hotelStays = [];
  List<GuideBookingModel> _guideBookings = [];
  bool _loadingHotels = true;
  bool _loadingGuideBookings = true;

  @override
  void initState() {
    super.initState();
    _loadHotels();
    _loadGuideBookings();
  }

  Future<void> _loadGuideBookings() async {
    try {
      final list = await ApiService.getCustomerGuideBookings();
      if (mounted) {
        setState(() {
          _guideBookings = list;
          _loadingGuideBookings = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingGuideBookings = false);
    }
  }

  Future<void> _loadHotels() async {
    List<UserTripDetail> trips;
    try {
      trips = await ApiService.getEnrichedUserTrips();
    } catch (_) {
      trips = List.from(kMockTripsData);
    }
    final stays = <_HotelStay>[];
    for (final t in trips) {
      for (final b in t.bookingsList) {
        if (b.type == 'Hotel') stays.add(_HotelStay(t, b));
      }
    }
    if (!mounted) return;
    setState(() {
      _hotelStays = stays;
      _loadingHotels = false;
    });
  }

  Widget _buildGuideBookingsSection() {
    final header = Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        'Tour Guide Bookings',
        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.primary),
      ),
    );

    if (_loadingGuideBookings) {
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        header,
        const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Center(child: CircularProgressIndicator())),
      ]);
    }

    if (_guideBookings.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          header,
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 20),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: NovaBrand.cardBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.badge_outlined, color: NovaBrand.secondary, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'No private tour guides booked yet. Browse our licensed guides for personalized trips.',
                    style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        header,
        ..._guideBookings.map(_buildGuideBookingCard),
        const SizedBox(height: 10),
      ],
    );
  }

  Widget _buildGuideBookingCard(GuideBookingModel b) {
    final isConfirmed = b.status.toLowerCase() == 'confirmed' || b.status.toLowerCase() == 'completed';
    final statusColor = isConfirmed ? const Color(0xFF059669) : NovaBrand.accentAmber;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: NovaBrand.cardBorder),
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
                decoration: BoxDecoration(
                  color: NovaBrand.slateLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: NovaBrand.cardBorderSoft),
                ),
                child: Text(
                  '#${b.id}',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: NovaBrand.primary, fontSize: 11),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  b.status.toUpperCase(),
                  style: GoogleFonts.inter(color: statusColor, fontWeight: FontWeight.w800, fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.badge_rounded, size: 18, color: NovaBrand.secondary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  b.guideName,
                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.slateDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: NovaBrand.slateLight, borderRadius: BorderRadius.circular(14)),
            child: Column(
              children: [
                _hotelRow(Icons.calendar_today, '${b.startDate} to ${b.endDate} (${b.startTime} - ${b.endTime})'),
                const SizedBox(height: 4),
                _hotelRow(Icons.people_alt_outlined, '${b.travelers} Guests · ${b.billableDays} Billable Day(s)'),
                if (b.pickupLocation != null && b.pickupLocation!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  _hotelRow(Icons.location_on_outlined, 'Pickup: ${b.pickupLocation}'),
                ],
              ],
            ),
          ),
          const Divider(height: 20, color: NovaBrand.cardBorderSoft),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Paid', style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted, fontWeight: FontWeight.w600)),
              Text(
                '\$${b.totalAmount.toStringAsFixed(2)}',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: NovaBrand.primary, fontSize: 18),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHotelSection() {
    Widget header = Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        'Hotel Bookings',
        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.primary),
      ),
    );
    if (_loadingHotels) {
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        header,
        const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Center(child: CircularProgressIndicator())),
      ]);
    }
    if (_hotelStays.isEmpty) {
      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        header,
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: NovaBrand.cardBorder),
          ),
          child: Text('No hotels booked for your planned trips yet.',
              style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted)),
        ),
      ]);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [header, ..._hotelStays.map(_buildHotelCard)],
    );
  }

  Widget _buildHotelCard(_HotelStay s) {
    final b = s.booking;
    final confirmed = b.status.toLowerCase() == 'confirmed';
    final statusColor = confirmed ? const Color(0xFF059669) : NovaBrand.accentAmber;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: NovaBrand.cardBorder),
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
                decoration: BoxDecoration(
                  color: NovaBrand.slateLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: NovaBrand.cardBorderSoft),
                ),
                child: Text(b.confirmationCode,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: NovaBrand.primary, fontSize: 11)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(b.status.toUpperCase(),
                    style: GoogleFonts.inter(color: statusColor, fontWeight: FontWeight.w800, fontSize: 10)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.hotel, size: 18, color: NovaBrand.secondary),
              const SizedBox(width: 8),
              Expanded(
                child: Text(b.provider,
                    style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(b.details, style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: NovaBrand.slateLight, borderRadius: BorderRadius.circular(14)),
            child: Column(
              children: [
                _hotelRow(Icons.luggage_outlined, 'Trip: ${s.trip.name}'),
                const SizedBox(height: 4),
                _hotelRow(Icons.calendar_today, b.dates),
                if (b.rooms != null) ...[
                  const SizedBox(height: 4),
                  _hotelRow(Icons.bed, '${b.rooms} room${b.rooms == 1 ? '' : 's'}${b.nights != null ? ' · ${b.nights} nights' : ''}'),
                ],
                if (b.packageName != null) ...[
                  const SizedBox(height: 4),
                  _hotelRow(Icons.card_giftcard, b.packageName!),
                ],
              ],
            ),
          ),
          if (b.includedFacilities.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: b.includedFacilities
                  .map((f) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: NovaBrand.tertiary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(f,
                            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: NovaBrand.secondary)),
                      ))
                  .toList(),
            ),
          ],
          const Divider(height: 24, color: NovaBrand.cardBorderSoft),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total', style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted)),
              Text(b.amount,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: NovaBrand.primary, fontSize: 18)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _hotelRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: NovaBrand.tertiary),
        const SizedBox(width: 6),
        Expanded(
          child: Text(text,
              style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateDark, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> bookings = [
      {
        'ref': 'TL-BK-84920',
        'title': 'Cultural Triangle & Hill Country Odyssey',
        'dates': 'Oct 15, 2026 – Oct 20, 2026',
        'travelers': '2 Adults',
        'total': '\$680.00',
        'status': 'CONFIRMED',
        'guide': 'Dinesh Jayasuriya (Licensed)',
        'transport': 'Private AC Hybrid Van',
        'imageUrl': 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=400&q=80',
      },
      {
        'ref': 'TL-BK-63211',
        'title': 'Southern Coastline & Marine Whale Safari',
        'dates': 'Nov 02, 2026 – Nov 06, 2026',
        'travelers': '2 Adults · 1 Child',
        'total': '\$890.00',
        'status': 'CONFIRMED',
        'guide': 'Kasun Perera (Licensed)',
        'transport': 'Private AC Vehicle',
        'imageUrl': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80',
      },
    ];

    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: AppBar(
        title: Text(
          'My Trips & Bookings',
          style: GoogleFonts.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NovaBrand.primary,
          ),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: bookings.length + 2,
        itemBuilder: (context, index) {
          if (index == 0) return _buildGuideBookingsSection();
          if (index == 1) return _buildHotelSection();
          final b = bookings[index - 2];
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: NovaBrand.cardBorder),
              boxShadow: NovaBrand.softShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with Ref & Status
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: NovaBrand.slateLight,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: NovaBrand.cardBorderSoft),
                            ),
                            child: Text(
                              b['ref'],
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                color: NovaBrand.primary,
                                fontSize: 11,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle, size: 12, color: Color(0xFF10B981)),
                                const SizedBox(width: 4),
                                Text(
                                  b['status'],
                                  style: GoogleFonts.inter(
                                    color: const Color(0xFF059669),
                                    fontWeight: FontWeight.w800,
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        b['title'],
                        style: GoogleFonts.outfit(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: NovaBrand.slateDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${b['dates']} • ${b['travelers']}',
                        style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                      ),
                      const SizedBox(height: 12),

                      // Guide and transport details
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: NovaBrand.slateLight,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.person_pin, size: 14, color: NovaBrand.secondary),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Guide: ${b['guide']}',
                                    style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateDark, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.directions_car, size: 14, color: NovaBrand.tertiary),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Transport: ${b['transport']}',
                                    style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateDark, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 24, color: NovaBrand.cardBorderSoft),

                      // Footer Total and Receipt
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Total Paid (Full)', style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted)),
                              Text(
                                b['total'],
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w900,
                                  color: NovaBrand.primary,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                          OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: NovaBrand.primary,
                                  content: Text('Voucher & booking pass downloaded.', style: GoogleFonts.inter()),
                                ),
                              );
                            },
                            icon: const Icon(Icons.download, size: 14, color: NovaBrand.secondary),
                            label: Text(
                              'Voucher',
                              style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: NovaBrand.secondary),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: NovaBrand.cardBorder),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
    );
  }
}
