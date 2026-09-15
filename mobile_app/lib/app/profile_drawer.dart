import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/api/api_endpoints.dart';
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
    final avatarUrl = user?.avatarUrl ?? user?.profilePhoto;
    final resolvedAvatar = (avatarUrl != null && avatarUrl.isNotEmpty)
        ? ApiEndpoints.resolveMediaUrl(avatarUrl)
        : null;

    String currentPath = '';
    try {
      currentPath = GoRouterState.of(context).matchedLocation;
    } catch (_) {}

    return Drawer(
      backgroundColor: AppColors.cardLight,
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
                color: AppColors.backgroundLight,
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
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).pop();
                          context.push('/profile');
                        },
                        child: Container(
                          width: 58,
                          height: 58,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFEFF6FF),
                            border: Border.all(color: AppColors.borderLight, width: 1.5),
                            image: resolvedAvatar != null
                                ? DecorationImage(
                                    image: NetworkImage(resolvedAvatar),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: resolvedAvatar == null
                              ? Text(
                                  initial,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                )
                              : null,
                        ),
                      ),

                      // Subscription Badge
                      if (isSubscribed)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.25),
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
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/profile');
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                user?.name ?? 'Candidate',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimaryLight,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(
                              Icons.verified,
                              size: 16,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.currentRole ?? user?.professionalStatus ?? 'Software Development Engineer',
                          style: const TextStyle(
                            fontSize: 12.5,
                            color: AppColors.textSecondaryLight,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Items
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

                  // 2. My Applications
                  _drawerItem(
                    context: context,
                    icon: Icons.assignment_outlined,
                    activeIcon: Icons.assignment,
                    title: 'My Applications',
                    isSelected: currentPath == '/applications',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/applications');
                    },
                  ),

                  // 3. Documents & Resume (Vault)
                  _drawerItem(
                    context: context,
                    icon: Icons.folder_shared_outlined,
                    activeIcon: Icons.folder_shared,
                    title: 'Documents & Resume',
                    isSelected: currentPath == '/documents',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/documents');
                    },
                  ),

                  // 4. Meetings
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

                  // 5. Projects
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

                  // 6. Case Studies
                  _drawerItem(
                    context: context,
                    icon: Icons.article_outlined,
                    activeIcon: Icons.article,
                    title: 'Case Studies',
                    isSelected: currentPath == '/case-studies',
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/case-studies');
                    },
                  ),

                  // 7. Auto Apply
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

                  // 8. Premium
                  _drawerItem(
                    context: context,
                    icon: Icons.workspace_premium_outlined,
                    activeIcon: Icons.workspace_premium,
                    title: 'GetNextIn Pro',
                    isSelected: currentPath == '/premium',
                    trailing: isSubscribed
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Active',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          )
                        : Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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

                  // 9. Settings
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
                      color: Colors.black,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Image.asset('assets/logo.png', fit: BoxFit.cover),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'GetNextIn',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryLight,
                        ),
                      ),
                      Text(
                        'v1.0.0 • Verified Candidate Portal',
                        style: TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
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
            color: isSelected ? AppColors.navActive : AppColors.textSecondaryLight,
            size: 21,
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? AppColors.navActive : AppColors.textPrimaryLight,
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
