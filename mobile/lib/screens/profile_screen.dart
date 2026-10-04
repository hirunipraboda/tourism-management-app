import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../theme/app_theme.dart';
import 'bookings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NovaBrand.slateLight,
      appBar: AppBar(
        title: Text(
          'My Profile & Account',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: NovaBrand.primary),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: NovaBrand.cardBorder),
                boxShadow: NovaBrand.softShadow,
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: NovaBrand.primary, width: 2),
                    ),
                    child: const CircleAvatar(
                      radius: 30,
                      backgroundImage: NetworkImage(
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Sarah Lin',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: NovaBrand.primary,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.verified, size: 16, color: NovaBrand.tertiary),
                          ],
                        ),
                        Text(
                          'sarah.lin@example.com',
                          style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: NovaBrand.tertiary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'NOVA PLATINUM EXPLORER',
                            style: GoogleFonts.inter(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: NovaBrand.secondary,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick Stats
            Row(
              children: [
                Expanded(child: _buildStatTile('4', 'Trips Taken', Icons.flight_takeoff, NovaBrand.primary)),
                const SizedBox(width: 10),
                Expanded(child: _buildStatTile('12', 'Places Saved', Icons.bookmark_border, NovaBrand.tertiary)),
                const SizedBox(width: 10),
                Expanded(child: _buildStatTile('2', 'Active Tours', Icons.luggage_outlined, NovaBrand.accentAmber)),
              ],
            ),
            const SizedBox(height: 20),

            // Navigation Options
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: NovaBrand.cardBorder),
                boxShadow: NovaBrand.softShadow,
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    context,
                    icon: Icons.confirmation_number_outlined,
                    color: NovaBrand.secondary,
                    title: 'My Bookings & Tickets',
                    subtitle: 'Confirmed reservations and travel vouchers',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BookingsScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1, color: NovaBrand.cardBorderSoft),
                  _buildMenuItem(
                    context,
                    icon: Icons.credit_card_outlined,
                    color: NovaBrand.primary,
                    title: 'Payment Receipts',
                    subtitle: 'Secure checkout and invoice history',
                    onTap: () {},
                  ),
                  const Divider(height: 1, color: NovaBrand.cardBorderSoft),
                  _buildMenuItem(
                    context,
                    icon: Icons.settings_outlined,
                    color: NovaBrand.slateDark,
                    title: 'Preferences & Currency',
                    subtitle: 'USD (\$) · English · Notifications ON',
                    onTap: () {},
                  ),
                  const Divider(height: 1, color: NovaBrand.cardBorderSoft),
                  _buildMenuItem(
                    context,
                    icon: Icons.help_outline,
                    color: NovaBrand.tertiary,
                    title: 'Travel Support & FAQ',
                    subtitle: 'Emergency contacts and live travel desk',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Sign out button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: NovaBrand.primary,
                      content: Text('Signed out successfully', style: GoogleFonts.inter()),
                    ),
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: NovaBrand.cardBorder),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(
                  'Sign Out',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFBE123C),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatTile(String val, String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: NovaBrand.cardBorder),
        boxShadow: NovaBrand.softShadow,
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(val, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: NovaBrand.primary)),
          Text(label, style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: NovaBrand.slateDark),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.inter(fontSize: 11, color: NovaBrand.slateMuted),
      ),
      trailing: const Icon(Icons.chevron_right, size: 20, color: NovaBrand.slateMuted),
    );
  }
}
