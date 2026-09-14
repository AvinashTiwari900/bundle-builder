import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ras_candidate_mobile/core/constants/app_colors.dart';

void main() {
  test('AppColors brand colors are defined properly', () {
    expect(AppColors.primary, const Color(0xFF2563EB));
    expect(AppColors.backgroundDark, const Color(0xFFFFFFFF));
    expect(AppColors.backgroundLight, const Color(0xFFFFFFFF));
  });
}
