import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Renders the waving NOVA Travel Bot.
/// Attempts to render `assets/images/Bot-wave.svg` and provides a polished
/// vector fallback matching the web robot avatar.
class TravelBotAvatar extends StatelessWidget {
  final double size;
  final bool showOnlineBadge;
  final VoidCallback? onTap;

  const TravelBotAvatar({
    super.key,
    this.size = 54,
    this.showOnlineBadge = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget botImage = SvgPicture.asset(
      'assets/images/Bot-wave.svg',
      width: size,
      height: size,
      fit: BoxFit.contain,
      placeholderBuilder: (_) => _buildVectorFallback(size),
    );

    Widget content = Stack(
      clipBehavior: Clip.none,
      children: [
        botImage,
        if (showOnlineBadge)
          Positioned(
            top: 2,
            right: 2,
            child: Container(
              width: size * 0.22,
              height: size * 0.22,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF0F172A), width: 1.8),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.6),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
          ),
      ],
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: content,
      );
    }
    return content;
  }

  Widget _buildVectorFallback(double s) {
    return Container(
      width: s,
      height: s,
      decoration: BoxDecoration(
        color: const Color(0xFF0B3A53),
        borderRadius: BorderRadius.circular(s * 0.3),
        border: Border.all(color: const Color(0xFF14B8A6), width: 1.5),
      ),
      child: Center(
        child: Icon(
          Icons.smart_toy_rounded,
          size: s * 0.6,
          color: const Color(0xFF5EEAD4),
        ),
      ),
    );
  }
}
