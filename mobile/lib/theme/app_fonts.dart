import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Typography helpers for the NOVA mobile app.
/// Screens can use these presets or call GoogleFonts directly.
class AppFonts {
  AppFonts._();

  static TextStyle heading({
    double fontSize = 24,
    FontWeight fontWeight = FontWeight.w900,
    Color? color,
  }) =>
      GoogleFonts.outfit(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
      );

  static TextStyle body({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w500,
    Color? color,
    double? height,
  }) =>
      GoogleFonts.inter(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        height: height,
      );

  static TextStyle label({
    double fontSize = 12,
    FontWeight fontWeight = FontWeight.w600,
    Color? color,
  }) =>
      GoogleFonts.inter(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
      );
}
