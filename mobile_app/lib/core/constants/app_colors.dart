import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary & Accents
  static const Color primary = Color(0xFF2563EB); // Electric Blue
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color accent = Color(0xFF4F46E5); // Indigo

  // Backgrounds - Natural Warm-White Theme (Ivory / Clean Off-White)
  static const Color background = Color(0xFFFAF9F6);
  static const Color backgroundDark = Color(0xFFFAF9F6);
  static const Color backgroundLight = Color(0xFFFAF9F6);
  static const Color surfaceDark = Color(0xFFFAF9F6);
  static const Color surfaceLight = Color(0xFFFAF9F6);

  // Pure White Cards & Modals over the creamy background
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);

  // Search fields and elevated pill surfaces
  static const Color elevatedDark = Color(0xFFF3F2EE);
  static const Color elevatedLight = Color(0xFFF3F2EE);
  static const Color searchBackground = Color(0xFFF1EFEA);
  static const Color warmGreyHighlight = Color(0xFFF1EFEA);

  // Hashtag & Chip Badges
  static const Color chipBackground = Color(0xFFF1EFEA);
  static const Color hashtagBg = Color(0xFFEFF6FF);
  static const Color hashtagText = Color(0xFF2563EB);

  // Borders & Dividers: Ultra subtle
  static const Color borderDark = Color(0xFFE8E5DF);
  static const Color borderLight = Color(0xFFE8E5DF);
  static const Color divider = Color(0xFFE8E5DF);

  // Status & Feedback
  static const Color success = Color(0xFF10B981); // Emerald (High Match, Selected, Verified)
  static const Color warning = Color(0xFFF59E0B); // Amber (AI Screening, Pending)
  static const Color error = Color(0xFFEF4444);   // Red (Destructive, Errors, Sign Out)
  static const Color info = Color(0xFF06B6D4);    // Cyan

  // Text Colors
  static const Color textPrimary = Color(0xFF111827); // Dark Charcoal
  static const Color textPrimaryDark = Color(0xFF111827);
  static const Color textPrimaryLight = Color(0xFF111827);

  static const Color textSecondary = Color(0xFF686660);
  static const Color textSecondaryDark = Color(0xFF686660);
  static const Color textSecondaryLight = Color(0xFF686660);
  static const Color textMutedDark = Color(0xFF8C8A84);
  static const Color textMutedLight = Color(0xFF8C8A84);

  // Navigation Active: #111827 (Black/Dark Charcoal) & Inactive: #686660
  static const Color navActive = Color(0xFF111827);
  static const Color navInactive = Color(0xFF686660);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient proHeroGradient = LinearGradient(
    colors: [Color(0xFF1E3A8A), Color(0xFF4338CA), Color(0xFF6D28D9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFFFAF9F6), Color(0xFFFFFFFF)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
