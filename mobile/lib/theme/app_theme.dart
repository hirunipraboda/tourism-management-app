import 'package:flutter/material.dart';
import 'package:nova_mobile/theme/app_fonts.dart';

class NovaBrand {
  // Website Exact Colors
  static const Color primary = Color(0xFF0B3A53);       // Deep Midnight Navy
  static const Color secondary = Color(0xFF146C86);     // Ocean Teal
  static const Color tertiary = Color(0xFF16A6A1);      // Electric Vivid Teal
  static const Color accentAmber = Color(0xFFF59E0B);   // Warm Sunset Gold
  static const Color slateDark = Color(0xFF0F172A);     // Slate 900
  static const Color slateMuted = Color(0xFF64748B);    // Slate 500
  static const Color slateLight = Color(0xFFF8FAFC);    // Background Slate
  static const Color cardBorder = Color(0xFFE2E8F0);    // Border Slate 200
  static const Color cardBorderSoft = Color(0xFFF1F5F9);// Border Slate 100
  static const Color surfaceWhite = Colors.white;

  // Gradients matching website
  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0B3A53), Color(0xFF146C86)],
  );

  static const LinearGradient tealGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF16A6A1), Color(0xFF146C86)],
  );

  static const LinearGradient cardOverlayGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Colors.transparent,
      Color(0x33000000),
      Color(0xD90B3A53),
    ],
    stops: [0.3, 0.65, 1.0],
  );

  // Soft shadows matching website
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: const Color(0xFF0B3A53).withOpacity(0.06),
      blurRadius: 18,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get softShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.04),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: NovaBrand.slateLight,
      colorScheme: ColorScheme.light(
        primary: NovaBrand.primary,
        secondary: NovaBrand.secondary,
        tertiary: NovaBrand.tertiary,
        surface: NovaBrand.surfaceWhite,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: NovaBrand.slateDark,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black12,
        iconTheme: const IconThemeData(color: NovaBrand.primary),
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: NovaBrand.primary,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(fontWeight: FontWeight.w900, color: NovaBrand.primary),
        displayMedium: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: NovaBrand.primary),
        titleLarge: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: NovaBrand.primary),
        titleMedium: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: NovaBrand.slateDark),
        titleSmall: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: NovaBrand.slateDark),
        bodyLarge: GoogleFonts.inter(fontWeight: FontWeight.w500, color: NovaBrand.slateDark),
        bodyMedium: GoogleFonts.inter(fontWeight: FontWeight.w400, color: NovaBrand.slateMuted),
        bodySmall: GoogleFonts.inter(fontWeight: FontWeight.w500, color: NovaBrand.slateMuted),
        labelLarge: GoogleFonts.inter(fontWeight: FontWeight.w700, color: Colors.white),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: NovaBrand.cardBorder, width: 1),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: NovaBrand.primary,
        unselectedItemColor: NovaBrand.slateMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
