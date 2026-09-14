import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary & Accents
  static const Color primary = Color(0xFF2563EB); // Electric Blue
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color accent = Color(0xFF4F46E5); // Indigo

  // Backgrounds - Natural Warm-White Theme (Ivory / Teeth White)
  // Main background, header, bottom navigation, and side menu: #FAF9F6
  static const Color backgroundDark = Color(0xFFFAF9F6);
  static const Color backgroundLight = Color(0xFFFAF9F6);
  static const Color surfaceDark = Color(0xFFFAF9F6);
  static const Color surfaceLight = Color(0xFFFAF9F6);

  // Post cards, forms, and dialogs: #FFFEFB
  static const Color cardDark = Color(0xFFFFFEFB);
  static const Color cardLight = Color(0xFFFFFEFB);

  // Search fields and subtle highlighted surfaces: #F2F0EB
  static const Color elevatedDark = Color(0xFFF2F0EB);
  static const Color elevatedLight = Color(0xFFF2F0EB);
  static const Color searchBackground = Color(0xFFF2F0EB);
  static const Color warmGreyHighlight = Color(0xFFF2F0EB);

  // Borders & Dividers: #E5E2DC
  static const Color borderDark = Color(0xFFE5E2DC);
  static const Color borderLight = Color(0xFFE5E2DC);
  static const Color divider = Color(0xFFE5E2DC);

  // Status & Feedback
  static const Color success = Color(0xFF10B981); // Emerald
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color error = Color(0xFFEF4444);   // Rose
  static const Color info = Color(0xFF06B6D4);    // Cyan

  // Text Colors
  // Primary text: #171717
  static const Color textPrimaryDark = Color(0xFF171717);
  static const Color textPrimaryLight = Color(0xFF171717);

  // Secondary text and inactive navigation: #686660
  static const Color textSecondaryDark = Color(0xFF686660);
  static const Color textSecondaryLight = Color(0xFF686660);
  static const Color textMutedDark = Color(0xFF686660);
  static const Color textMutedLight = Color(0xFF686660);

  // Navigation Active: #000000 (Black) & Inactive: #686660
  static const Color navActive = Color(0xFF000000);
  static const Color navInactive = Color(0xFF686660);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFFFAF9F6), Color(0xFFFFFEFB)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
