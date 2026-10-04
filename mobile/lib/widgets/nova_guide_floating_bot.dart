import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'travel_bot_avatar.dart';

/// Floating Bot Widget matching the Tour & Guide page in the website:
/// Dark pill with "Ask NOVA Guide" + waving robot illustration with active green status dot.
class NovaGuideFloatingBot extends StatefulWidget {
  final VoidCallback onTap;

  const NovaGuideFloatingBot({
    super.key,
    required this.onTap,
  });

  @override
  State<NovaGuideFloatingBot> createState() => _NovaGuideFloatingBotState();
}

class _NovaGuideFloatingBotState extends State<NovaGuideFloatingBot>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      behavior: HitTestBehavior.opaque,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Dark Pill: "Ask NOVA Guide"
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8.5),
            decoration: BoxDecoration(
              color: const Color(0xFF0B3A53),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: const Color(0xFF14B8A6).withValues(alpha: 0.6),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.smart_toy_outlined,
                  size: 15,
                  color: Color(0xFF5EEAD4),
                ),
                const SizedBox(width: 7),
                Text(
                  'Ask NOVA Guide',
                  style: GoogleFonts.outfit(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Waving Bot Illustration with Online Status Beacon
          ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0B3A53).withValues(alpha: 0.4),
                    blurRadius: 14,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const TravelBotAvatar(
                size: 58,
                showOnlineBadge: true,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
