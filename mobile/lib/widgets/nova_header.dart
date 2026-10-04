import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import '../theme/app_theme.dart';
import '../screens/bookings_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/reviews_screen.dart';

class NovaHeader extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onNotificationTap;

  const NovaHeader({super.key, this.onNotificationTap});

  @override
  Size get preferredSize => const Size.fromHeight(68);

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Notifications',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: NovaBrand.primary,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: NovaBrand.tertiary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '3 New',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: NovaBrand.secondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildNotificationItem(
                icon: Icons.wb_sunny_outlined,
                color: NovaBrand.accentAmber,
                title: 'Highlands Weather Alert',
                desc: 'Sunny and 23°C in Ella today — perfect conditions for Nine Arch Bridge trek.',
                time: '10m ago',
              ),
              const Divider(height: 20, color: NovaBrand.cardBorderSoft),
              _buildNotificationItem(
                icon: Icons.confirmation_number_outlined,
                color: NovaBrand.tertiary,
                title: 'Tour Booking Confirmed',
                desc: 'Your booking for Cultural Triangle & Hill Country Odyssey is confirmed.',
                time: '2h ago',
              ),
              const Divider(height: 20, color: NovaBrand.cardBorderSoft),
              _buildNotificationItem(
                icon: Icons.auto_awesome,
                color: NovaBrand.primary,
                title: 'AI Smart Tip',
                desc: 'Sigiriya Rock Fortress is best visited before 09:00 AM to beat midday heat.',
                time: '1d ago',
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationItem({
    required IconData icon,
    required Color color,
    required String title,
    required String desc,
    required String time,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: NovaBrand.slateDark,
                    ),
                  ),
                  Text(
                    time,
                    style: GoogleFonts.inter(fontSize: 10, color: NovaBrand.slateMuted),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: GoogleFonts.inter(fontSize: 12, color: NovaBrand.slateMuted, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: NovaBrand.cardBorder.withOpacity(0.8), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo / Brand
              GestureDetector(
                onTap: () {},
                child: Row(
                  children: [
                    Image.asset(
                      'assets/images/header-logo.png',
                      height: 38,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              gradient: NovaBrand.heroGradient,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.explore, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'NOVA',
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w900,
                                  color: NovaBrand.primary,
                                  fontSize: 18,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              Text(
                                'Your Island Journey',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: NovaBrand.tertiary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Action Buttons
              Row(
                children: [
                  // Reviews & Recs Button
                  IconButton(
                    icon: const Icon(Icons.star_rounded, color: NovaBrand.accentAmber, size: 22),
                    tooltip: 'Reviews & Recommendations',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ReviewsScreen()),
                      );
                    },
                  ),

                  // Bookings / Trips
                  IconButton(
                    icon: const Icon(Icons.confirmation_number_outlined, color: NovaBrand.secondary, size: 21),
                    tooltip: 'My Trips & Bookings',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BookingsScreen()),
                      );
                    },
                  ),

                  // Notifications Bell
                  IconButton(
                    icon: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        const Icon(Icons.notifications_none_rounded, color: NovaBrand.slateDark, size: 22),
                        Positioned(
                          right: -1,
                          top: -1,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: NovaBrand.accentAmber,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                    onPressed: () => _showNotificationsSheet(context),
                  ),

                  const SizedBox(width: 4),

                  // Profile Avatar
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ProfileScreen()),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: NovaBrand.primary, width: 2),
                      ),
                      child: const CircleAvatar(
                        radius: 15,
                        backgroundColor: NovaBrand.primary,
                        child: Text(
                          'JD',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
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
}
