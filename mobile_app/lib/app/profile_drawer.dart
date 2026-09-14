import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/app_colors.dart';
import '../features/authentication/presentation/auth_notifier.dart';

class ProfileDrawer extends ConsumerWidget {
  const ProfileDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;
    final isSubscribed = user?.isSubscribed ?? false;

    final initial = (user?.name != null && user!.name.isNotEmpty)
        ? user.name.substring(0, 1).toUpperCase()
        : 'C';

    String currentPath = '';
    try {
      currentPath = GoRouterState.of(context).matchedLocation;
    } catch (_) {}

    return Drawer(
      backgroundColor: AppColors.surfaceLight,
      surfaceTintColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(0)),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Profile Details & Subscription Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.borderLight, width: 1),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Candidate Profile Photo
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.elevatedLight,
                          border: Border.all(color: AppColors.borderLight, width: 2),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initial,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimaryLight,
                          ),
                        ),
                      ),

                      // Subscription Badge (Rendered ONLY when candidate has active purchased subscription)
                      if (isSubscribed)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFD97706).withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.workspace_premium, size: 14, color: Colors.white),
                              const SizedBox(width: 4),
                              Text(
                                user?.subscriptionPlan?.toUpperCase() ?? 'PRO',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Candidate Full Name
                  Text(
                    user?.name ?? 'Candidate',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const SizedBox(height: 2),

                  // Role / Headline
                  Text(
                    user?.currentRole ?? user?.professionalStatus ?? 'Software Development Engineer',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondaryDark,
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Items in Exact Order
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  // 1. Dashboard
                  _drawerItem(
                    context: context,
                    icon: Icons.dashboard_outlined,
                    activeIcon: Icons.dashboard,
                    title: 'Dashboard',
                    isSelected: currentPath == '/dashboard',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/dashboard');
                    },
                  ),

                  // 2. Meetings
                  _drawerItem(
                    context: context,
                    icon: Icons.video_camera_front_outlined,
                    activeIcon: Icons.video_camera_front,
                    title: 'Meetings',
                    isSelected: currentPath == '/meetings',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/meetings');
                    },
                  ),

                  // 3. Projects
                  _drawerItem(
                    context: context,
                    icon: Icons.folder_outlined,
                    activeIcon: Icons.folder,
                    title: 'Projects',
                    isSelected: currentPath == '/projects',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/projects');
                    },
                  ),

                  // 4. Auto Apply
                  _drawerItem(
                    context: context,
                    icon: Icons.bolt_outlined,
                    activeIcon: Icons.bolt,
                    title: 'Auto Apply',
                    isSelected: currentPath == '/auto-apply',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/auto-apply');
                    },
                  ),

                  // 5. Premium
                  _drawerItem(
                    context: context,
                    icon: Icons.workspace_premium_outlined,
                    activeIcon: Icons.workspace_premium,
                    title: 'Premium',
                    isSelected: currentPath == '/premium',
                    trailing: isSubscribed
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Active',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFD97706),
                              ),
                            ),
                          )
                        : Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.elevatedLight,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Upgrade',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimaryLight,
                              ),
                            ),
                          ),
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/premium');
                    },
                  ),

                  // 6. Settings
                  _drawerItem(
                    context: context,
                    icon: Icons.settings_outlined,
                    activeIcon: Icons.settings,
                    title: 'Settings',
                    isSelected: currentPath == '/settings',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/settings');
                    },
                  ),
                ],
              ),
            ),

            // Footer / Branding
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Image.asset('assets/icon.png', fit: BoxFit.contain),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'GetnextIn Candidates',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      Text(
                        'v1.0.0 • Verified Portal',
                        style: TextStyle(fontSize: 10, color: AppColors.textMutedDark),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem({
    required BuildContext context,
    required IconData icon,
    IconData? activeIcon,
    required String title,
    required bool isSelected,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.elevatedLight : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Material(
        color: Colors.transparent,
        child: ListTile(
          leading: Icon(
            isSelected ? (activeIcon ?? icon) : icon,
            color: isSelected ? const Color(0xFF000000) : AppColors.textSecondaryLight,
            size: 22,
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? const Color(0xFF000000) : AppColors.textPrimaryDark,
            ),
          ),
          trailing: trailing,
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          onTap: onTap,
        ),
      ),
    );
  }
}
