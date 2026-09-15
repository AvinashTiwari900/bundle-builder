import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/api/api_endpoints.dart';
import '../core/constants/app_colors.dart';
import '../features/authentication/presentation/auth_notifier.dart';

class AppHeader extends ConsumerWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;
    final initial = (user?.name != null && user!.name.isNotEmpty)
        ? user.name.substring(0, 1).toUpperCase()
        : 'C';
    final avatarUrl = user?.avatarUrl ?? user?.profilePhoto;
    final resolvedAvatar = (avatarUrl != null && avatarUrl.isNotEmpty)
        ? ApiEndpoints.resolveMediaUrl(avatarUrl)
        : null;

    return Container(
      color: AppColors.backgroundLight,
      child: SafeArea(
        bottom: false,
        child: Container(
          height: 60,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: const BoxDecoration(
            color: AppColors.backgroundLight,
            border: Border(
              bottom: BorderSide(color: AppColors.borderLight, width: 1),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 1. GetNextIn Application Logo Asset (Replaces placeholder "G")
              GestureDetector(
                onTap: () {
                  // If on home, scroll to top or open drawer
                  try {
                    Scaffold.of(context).openDrawer();
                  } catch (_) {}
                },
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.asset(
                    'assets/logo.png',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // 2. Compact Pill Search Field
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/search'),
                  child: Container(
                    height: 38,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.searchBackground,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.search,
                          size: 18,
                          color: AppColors.textSecondaryLight,
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Search people, posts, jobs...',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textMutedLight,
                              fontWeight: FontWeight.w400,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // 3. Notification Icon with Unread Count Badge
              GestureDetector(
                onTap: () => context.push('/notifications'),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.cardLight,
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Icon(
                        Icons.notifications_none_rounded,
                        size: 20,
                        color: AppColors.textPrimaryLight,
                      ),
                    ),
                    Positioned(
                      top: -2,
                      right: -2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.backgroundLight, width: 1.5),
                        ),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        child: const Text(
                          '3',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // 4. Candidate Profile Avatar with Dropdown Indicator (Opens Drawer)
              Builder(
                builder: (ctx) => GestureDetector(
                  onTap: () => Scaffold.of(ctx).openDrawer(),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFEFF6FF),
                          border: Border.all(color: AppColors.borderLight, width: 1.2),
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
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 2),
                      const Icon(
                        Icons.keyboard_arrow_down_rounded,
                        size: 16,
                        color: AppColors.textSecondaryLight,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
