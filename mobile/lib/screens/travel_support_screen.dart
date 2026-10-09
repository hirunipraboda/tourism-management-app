import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../theme/app_theme.dart';

class TravelSupportScreen extends StatefulWidget {
  const TravelSupportScreen({super.key});

  @override
  State<TravelSupportScreen> createState() => _TravelSupportScreenState();
}

class _TravelSupportScreenState extends State<TravelSupportScreen> {
  final TextEditingController _search = TextEditingController();
  String _query = '';

  static const _contacts = [
    ['Police Emergency', '119', Icons.local_police_outlined],
    ['Ambulance / Suwa Seriya', '1990', Icons.medical_services_outlined],
    ['Fire & Rescue', '110', Icons.local_fire_department_outlined],
    ['Tourist Police (24h)', '+94 11 242 1052', Icons.shield_outlined],
    ['Sri Lanka Tourism Hotline', '1912', Icons.support_agent],
  ];

  static const _faqs = [
    ['How do I change or cancel a booking?',
        'Open Profile > My Bookings & Tickets, select the booking and contact the travel desk with your confirmation code. Free cancellation is available up to 48 hours before the start date for most packages.'],
    ['Where can I find my receipts?',
        'Go to Profile > Payment Receipts. Chatbot plan purchases and tour package payments are listed there, and you can open any receipt for full details.'],
    ['How does the AI Trip Planner work?',
        'Four agents (Destination Research, Route Optimization, Validation and the Orchestrator) build a day-by-day itinerary from your destination, dates, budget and interests. You can save it to My Trips.'],
    ['Which currencies are supported?',
        'You can display prices in USD, LKR, EUR, GBP, INR and AUD from Preferences & Currency. Payments are charged in USD.'],
    ['Is a private guide included in tour packages?',
        'Most packages include a licensed guide and private AC transport. Details are shown on the booking card under Guide and Transport.'],
    ['What should I do if I lose my passport?',
        'Report it to the nearest police station, then contact your embassy in Colombo. Tell our travel desk so we can adjust hotel and transport bookings.'],
  ];

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(backgroundColor: NovaBrand.primary, content: Text(msg, style: GoogleFonts.inter())),
    );
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final faqs = _faqs.where((f) => q.isEmpty || f[0].toLowerCase().contains(q) || f[1].toLowerCase().contains(q)).toList();

    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: AppBar(
        title: Text('Travel Support & FAQ',
            style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Emergency banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFBE123C), Color(0xFFE11D48)]),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Row(
              children: [
                const Icon(Icons.emergency, color: Colors.white, size: 30),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('In an emergency, call 119',
                          style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white)),
                      Text('Police, ambulance and fire services are available 24/7.',
                          style: GoogleFonts.inter(fontSize: 11, color: Colors.white70)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _card('Emergency Contacts', [
            ..._contacts.map((c) => ListTile(
                  leading: Icon(c[2] as IconData, color: NovaBrand.secondary),
                  title: Text(c[0] as String, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
                  subtitle: Text(c[1] as String, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: NovaBrand.primary)),
                  trailing: IconButton(
                    icon: const Icon(Icons.copy, size: 18, color: NovaBrand.slateMuted),
                    onPressed: () async {
                      await Clipboard.setData(ClipboardData(text: c[1] as String));
                      _snack('${c[0]} number copied');
                    },
                  ),
                )),
          ]),
          const SizedBox(height: 16),
          _card('Live Travel Desk', [
            ListTile(
              leading: const Icon(Icons.headset_mic_outlined, color: NovaBrand.tertiary),
              title: Text('TourLink Travel Desk', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700)),
              subtitle: Text('Daily 06:00 – 22:00 (Sri Lanka time)', style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _snack('Calling +94 11 700 0000…'),
                      icon: const Icon(Icons.call, size: 16),
                      label: const Text('Call'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showMessageSheet(),
                      icon: const Icon(Icons.chat_bubble_outline, size: 16),
                      label: const Text('Message'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _snack('Opening support@tourlink.lk…'),
                      icon: const Icon(Icons.email_outlined, size: 16),
                      label: const Text('Email'),
                    ),
                  ),
                ],
              ),
            ),
          ]),
          const SizedBox(height: 16),
          TextField(
            controller: _search,
            onChanged: (v) => setState(() => _query = v),
            decoration: InputDecoration(
              hintText: 'Search frequently asked questions',
              hintStyle: GoogleFonts.inter(fontSize: 13),
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 12),
          _card('Frequently Asked Questions', [
            if (faqs.isEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text('No matching questions. Try the travel desk above.',
                    style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted)),
              ),
            ...faqs.map((f) => Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    tilePadding: const EdgeInsets.symmetric(horizontal: 18),
                    childrenPadding: const EdgeInsets.fromLTRB(18, 0, 18, 14),
                    expandedCrossAxisAlignment: CrossAxisAlignment.start,
                    title: Text(f[0], style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: NovaBrand.slateDark)),
                    children: [Text(f[1], style: GoogleFonts.inter(fontSize: 12, height: 1.5, color: NovaBrand.slateMuted))],
                  ),
                )),
          ]),
        ],
      ),
    );
  }

  void _showMessageSheet() {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Message the Travel Desk', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'How can we help with your trip?',
                filled: true,
                fillColor: NovaBrand.slateLight,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (ctrl.text.trim().isEmpty) return;
                  Navigator.pop(ctx);
                  _snack('Message sent. We will reply within 15 minutes.');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: NovaBrand.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text('Send', style: GoogleFonts.outfit(fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card(String title, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 4),
            child: Text(title, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
          ),
          ...children,
        ],
      ),
    );
  }
}
