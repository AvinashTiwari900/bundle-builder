import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../authentication/presentation/auth_notifier.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _pushEnabled = true;
  bool _emailAlerts = true;
  bool _maskContact = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Account & Settings'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Privacy & Visibility',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      activeColor: AppColors.primary,
                      title: const Text('Mask Contact Details',
                          style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 14)),
                      subtitle: const Text('Hide email and phone from non-connections',
                          style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      value: _maskContact,
                      onChanged: (v) => setState(() => _maskContact = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'Notification Preferences',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      activeColor: AppColors.primary,
                      title: const Text('Push Notifications',
                          style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 14)),
                      subtitle: const Text('Interview alerts and auto-apply updates',
                          style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      value: _pushEnabled,
                      onChanged: (v) => setState(() => _pushEnabled = v),
                    ),
                    const Divider(color: AppColors.borderDark),
                    SwitchListTile(
                      activeColor: AppColors.primary,
                      title: const Text('Email Job Digests',
                          style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 14)),
                      subtitle: const Text('Weekly tailored job recommendations',
                          style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 12)),
                      value: _emailAlerts,
                      onChanged: (v) => setState(() => _emailAlerts = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              Consumer(
                builder: (context, ref, _) {
                  return CustomButton(
                    text: 'Sign Out of GetNextIn',
                    variant: ButtonVariant.danger,
                    icon: Icons.logout,
                    onPressed: () async {
                      await ref.read(authNotifierProvider.notifier).logout();
                      if (context.mounted) {
                        context.go('/login');
                      }
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
