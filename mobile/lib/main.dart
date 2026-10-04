import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';
import 'theme/app_theme.dart';
import 'widgets/nova_header.dart';
import 'screens/splash_screen.dart';
import 'screens/explore_screen.dart';
import 'screens/destinations_screen.dart';
import 'screens/trips_screen.dart';
import 'screens/tours_screen.dart';
import 'screens/ai_planner_screen.dart';
import 'screens/reviews_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;
  runApp(const NovaTouristApp());
}

class NovaTouristApp extends StatelessWidget {
  const NovaTouristApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NOVA - Sri Lanka Travel Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
    );
  }
}

/// Main shell. Tabs mirror the website navbar exactly:
/// Explore | Destinations | Trips | Tour & Guide | AI Trip Planner | Reviews & Recs
class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;

  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;
  int? _hoveredIndex;

  static const List<({IconData icon, String label})> _navItems = [
    (icon: Icons.explore_outlined, label: 'Explore'),
    (icon: Icons.location_on_outlined, label: 'Destinations'),
    (icon: Icons.luggage_outlined, label: 'Trips'),
    (icon: Icons.map_outlined, label: 'Tour & Guide'),
    (icon: Icons.auto_awesome_outlined, label: 'AI Trip Planner'),
    (icon: Icons.chat_bubble_outline_rounded, label: 'Reviews & Recs'),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  void _navigateToTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      ExploreScreen(onNavigateTab: _navigateToTab),
      const DestinationsScreen(),
      TripsScreen(onNavigateTab: _navigateToTab),
      const ToursScreen(),
      const AiPlannerScreen(),
      const ReviewsScreen(),
    ];

    return Scaffold(
      appBar: const NovaHeader(),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(
            color: NovaBrand.cardBorder.withValues(alpha: 0.8),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: List.generate(_navItems.length, (index) {
              final item = _navItems[index];
              final isSelected = _currentIndex == index;
              final isHovered = _hoveredIndex == index;

              return Expanded(
                child: Tooltip(
                  message: item.label,
                  preferBelow: false,
                  verticalOffset: 24,
                  textStyle: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    onEnter: (_) => setState(() => _hoveredIndex = index),
                    onExit: (_) => setState(() => _hoveredIndex = null),
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => _navigateToTab(index),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Interactive animated hover & active halo
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.easeOutCubic,
                            width: isHovered ? 46 : (isSelected ? 42 : 0),
                            height: isHovered ? 46 : (isSelected ? 42 : 0),
                            decoration: BoxDecoration(
                              color: isHovered
                                  ? const Color(0xFFDBEAFE)
                                  : (isSelected
                                      ? const Color(0xFFE0F2FE).withValues(alpha: 0.7)
                                      : Colors.transparent),
                              shape: BoxShape.circle,
                              boxShadow: isHovered
                                  ? [
                                      BoxShadow(
                                        color: const Color(0xFF1E3A8A).withValues(alpha: 0.18),
                                        blurRadius: 10,
                                        spreadRadius: 1,
                                      ),
                                    ]
                                  : null,
                            ),
                          ),
                          // Plain outlined icon with dark blue color and hover scaling
                          AnimatedScale(
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.easeOutBack,
                            scale: isHovered ? 1.25 : (isSelected ? 1.15 : 1.0),
                            child: Icon(
                              item.icon,
                              size: 25,
                              color: isHovered
                                  ? const Color(0xFF1D4ED8) // Vibrant dark blue on hover
                                  : (isSelected
                                      ? const Color(0xFF0B3A53) // Selected deep navy blue
                                      : const Color(0xFF1E3A8A)), // Dark outlined blue
                            ),
                          ),
                          // Active indicator pill at bottom
                          Positioned(
                            bottom: 6,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 220),
                              curve: Curves.easeOutCubic,
                              height: 3,
                              width: isSelected ? 18 : 0,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0B3A53),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
