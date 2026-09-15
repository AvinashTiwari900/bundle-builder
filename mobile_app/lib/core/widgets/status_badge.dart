import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (bgColor, textColor) = _getStatusColors(status.toLowerCase());

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 10.5,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  (Color, Color) _getStatusColors(String normalized) {
    if (normalized.contains('select') ||
        normalized.contains('offer') ||
        normalized.contains('verified') ||
        normalized.contains('hired')) {
      return (AppColors.success.withValues(alpha: 0.15), AppColors.success);
    } else if (normalized.contains('interview') || normalized.contains('scheduled')) {
      return (AppColors.primary.withValues(alpha: 0.15), AppColors.primary);
    } else if (normalized.contains('shortlist')) {
      return (const Color(0xFFEFF6FF), AppColors.primary);
    } else if (normalized.contains('reject') || normalized.contains('failed')) {
      return (AppColors.error.withValues(alpha: 0.12), AppColors.error);
    } else if (normalized.contains('pending') ||
        normalized.contains('hold') ||
        normalized.contains('screening')) {
      return (AppColors.warning.withValues(alpha: 0.15), const Color(0xFFD97706));
    }

    return (AppColors.elevatedLight, AppColors.textSecondaryLight);
  }
}
