import 'package:flutter/material.dart';

/// Centralized design tokens for the NOVA tourism app.
/// All screens should reference these constants instead of hard-coded colors.
class NovaBrand {
  NovaBrand._();

  // ── Primary palette ────────────────────────────────────────────────────────
  static const Color primary = Color(0xFF0D9488);   // teal-600
  static const Color primaryDark = Color(0xFF0F766E); // teal-700
  static const Color secondary = Color(0xFFF59E0B);  // amber-400
  static const Color accentAmber = Color(0xFFD97706); // amber-600

  // ── Neutral / slate ────────────────────────────────────────────────────────
  static const Color slateDark = Color(0xFF0F172A);  // slate-900
  static const Color slateBody = Color(0xFF1E293B);  // slate-800
  static const Color slateMuted = Color(0xFF64748B); // slate-500
  static const Color slateLight = Color(0xFFF1F5F9); // slate-100
  static const Color surface = Color(0xFFF8FAFC);    // slate-50

  // ── Card borders ───────────────────────────────────────────────────────────
  static const Color cardBorder = Color(0xFFE2E8F0);     // slate-200
  static const Color cardBorderSoft = Color(0xFFCBD5E1); // slate-300

  // ── Status colours ─────────────────────────────────────────────────────────
  static const Color success = Color(0xFF10B981); // emerald-500
  static const Color error = Color(0xFFEF4444);   // red-500
  static const Color warning = Color(0xFFF59E0B); // amber-400
  static const Color info = Color(0xFF3B82F6);    // blue-500

  // ── Gradients ──────────────────────────────────────────────────────────────
  static const LinearGradient heroGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient amberGradient = LinearGradient(
    colors: [secondary, accentAmber],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Shadows ────────────────────────────────────────────────────────────────
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.08),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get softShadow => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 6,
          offset: const Offset(0, 2),
        ),
      ];

  // ── Border radius ──────────────────────────────────────────────────────────
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
}
