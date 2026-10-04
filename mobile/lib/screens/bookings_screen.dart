import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../theme/app_theme.dart';

class BookingsScreen extends StatelessWidget {
  const BookingsScreen({super.key});

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
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          final b = bookings[index];
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
