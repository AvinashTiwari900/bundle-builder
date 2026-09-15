import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/app_colors.dart';
import 'app_header.dart';
import 'profile_drawer.dart';

class MainNavigationShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainNavigationShell({
    super.key,
    required this.navigationShell,
  });

  void _onTap(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    // Show AppHeader on Home (Tab 0) and Posts (Tab 2)
    final showHeader = navigationShell.currentIndex == 0 || navigationShell.currentIndex == 2;
    final currentIndex = navigationShell.currentIndex;

    final navItems = [
      _NavItemData(
        label: 'Home',
        activeIcon: Icons.home_rounded,
        inactiveIcon: Icons.home_outlined,
      ),
      _NavItemData(
        label: 'My Connections',
        activeIcon: Icons.people_rounded,
        inactiveIcon: Icons.people_outline_rounded,
      ),
      _NavItemData(
        label: 'Posts',
        activeIcon: Icons.add_box_rounded,
        inactiveIcon: Icons.add_box_outlined,
      ),
      _NavItemData(
        label: 'Jobs',
        activeIcon: Icons.work_rounded,
        inactiveIcon: Icons.work_outline_rounded,
      ),
      _NavItemData(
        label: 'Profile',
        activeIcon: Icons.person_rounded,
        inactiveIcon: Icons.person_outline_rounded,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: showHeader ? const AppHeader() : null,
      drawer: const ProfileDrawer(),
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.cardLight,
          border: Border(
            top: BorderSide(color: AppColors.borderLight, width: 1),
          ),
        ),
        child: SafeArea(
          top: false,
          child: Container(
            height: 60,
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(navItems.length, (index) {
                final item = navItems[index];
                final isSelected = index == currentIndex;

                return Expanded(
                  child: InkWell(
                    onTap: () => _onTap(index),
                    splashColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          isSelected ? item.activeIcon : item.inactiveIcon,
                          size: 22,
                          color: isSelected ? AppColors.navActive : AppColors.navInactive,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.navActive : AppColors.navInactive,
                            letterSpacing: -0.1,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        // Small black indicator line underneath selected item (Reference Design)
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          width: isSelected ? 20 : 0,
                          height: 2.5,
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.navActive : Colors.transparent,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItemData {
  final String label;
  final IconData activeIcon;
  final IconData inactiveIcon;

  _NavItemData({
    required this.label,
    required this.activeIcon,
    required this.inactiveIcon,
  });
}
