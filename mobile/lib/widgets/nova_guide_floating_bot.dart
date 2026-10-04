import 'package:flutter/material.dart';
import 'travel_bot_avatar.dart';

/// Floating Bot Widget matching the Tour & Guide page:
/// Waving robot illustration with active green status dot and pulse animation.
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
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0B3A53).withValues(alpha: 0.35),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
              BoxShadow(
                color: const Color(0xFF14B8A6).withValues(alpha: 0.25),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const TravelBotAvatar(
            size: 62,
            showOnlineBadge: true,
          ),
        ),
      ),
    );
  }
}
