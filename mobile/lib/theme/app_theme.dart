import 'package:flutter/material.dart';

/// Centralised NOVA brand colour palette and shared style tokens.
/// Used across all screens for visual consistency.
class NovaBrand {
  NovaBrand._();

  // ── Primary Palette ────────────────────────────────────────────────────────
  static const Color primary = Color(0xFF0EA5E9);       // Sky-500
  static const Color secondary = Color(0xFF10B981);     // Emerald-500
  static const Color tertiary = Color(0xFF8B5CF6);      // Violet-500
  static const Color accentAmber = Color(0xFFFB923C);   // Orange-400

  // ── Neutral / Slate Scale ─────────────────────────────────────────────────
  static const Color slateDark = Color(0xFF0F172A);     // Slate-900
  static const Color slateMuted = Color(0xFF64748B);    // Slate-500
  static const Color slateLight = Color(0xFFF1F5F9);   // Slate-100

  // ── Card / Border Tokens ──────────────────────────────────────────────────
  static const Color cardBorder = Color(0xFFE2E8F0);    // Slate-200
  static const Color cardBorderSoft = Color(0xFFF1F5F9); // Slate-100

  // ── Gradients ─────────────────────────────────────────────────────────────
  static const LinearGradient tealGradient = LinearGradient(
    colors: [Color(0xFF0EA5E9), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient violetGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF0EA5E9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Shared Shadows ────────────────────────────────────────────────────────
  static final List<BoxShadow> softShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];
}
