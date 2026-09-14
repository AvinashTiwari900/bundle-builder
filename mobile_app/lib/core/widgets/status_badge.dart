import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (bgColor, textColor) = _getStatusColors(status.toLowerCase());

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  (Color, Color) _getStatusColors(String normalized) {
    if (normalized.contains('select') ||
        normalized.contains('offer') ||
        normalized.contains('verified') ||
        normalized.contains('hired')) {
      return (AppColors.success.withOpacity(0.15), AppColors.success);
    } else if (normalized.contains('interview') || normalized.contains('scheduled')) {
      return (AppColors.primary.withOpacity(0.15), AppColors.primaryLight);
    } else if (normalized.contains('shortlist') || normalized.contains('review')) {
      return (AppColors.accent.withOpacity(0.15), const Color(0xFF818CF8));
    } else if (normalized.contains('reject') || normalized.contains('failed')) {
      return (AppColors.error.withOpacity(0.15), AppColors.error);
    } else if (normalized.contains('pending') ||
        normalized.contains('hold') ||
        normalized.contains('screening')) {
      return (AppColors.warning.withOpacity(0.15), AppColors.warning);
    }

    return (AppColors.borderDark, AppColors.textSecondaryDark);
  }
}
