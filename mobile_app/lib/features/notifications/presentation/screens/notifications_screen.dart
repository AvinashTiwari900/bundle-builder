import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color iconColor;
  final String category; // 'Jobs', 'Connections', 'System'
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.iconColor,
    required this.category,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'All';
  final List<String> _filters = ['All', 'Jobs', 'Connections', 'System'];

  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: 'n-1',
      title: 'Interview Scheduled',
      message: 'Fintech Nexus Ltd has scheduled Technical Simulation for tomorrow at 2:00 PM.',
      time: '15m ago',
      icon: Icons.video_camera_front_rounded,
      iconColor: AppColors.primary,
      category: 'Jobs',
      isRead: false,
    ),
    NotificationItem(
      id: 'n-2',
      title: 'Auto-Apply Successful',
      message: 'GetNextIn AI submitted your application for Senior Mobile Engineer at CloudScale AI.',
      time: '2h ago',
      icon: Icons.bolt_rounded,
      iconColor: AppColors.warning,
      category: 'Jobs',
      isRead: false,
    ),
    NotificationItem(
      id: 'n-3',
      title: 'New Connection Request',
      message: 'Sneha Kulkarni (ML Specialist at NIT Surathkal) wants to connect with you.',
      time: '4h ago',
      icon: Icons.person_add_rounded,
      iconColor: const Color(0xFF7C3AED),
      category: 'Connections',
      isRead: false,
    ),
    NotificationItem(
      id: 'n-4',
      title: 'Application Shortlisted',
      message: 'Your application for Frontend & Mobile Engineer at Swasthya Health Tech was shortlisted.',
      time: '1d ago',
      icon: Icons.check_circle_rounded,
      iconColor: AppColors.success,
      category: 'Jobs',
      isRead: true,
    ),
    NotificationItem(
      id: 'n-5',
      title: 'Profile Viewed',
      message: 'A recruiter from Microsoft viewed your candidate profile and project portfolio.',
      time: '2d ago',
      icon: Icons.visibility_rounded,
      iconColor: const Color(0xFF0284C7),
      category: 'System',
      isRead: true,
    ),
    NotificationItem(
      id: 'n-6',
      title: 'Recruiter Message',
      message: 'Fintech Nexus Talent Partner sent you a direct message regarding interview logistics.',
      time: '3d ago',
      icon: Icons.chat_bubble_rounded,
      iconColor: AppColors.primary,
      category: 'Connections',
      isRead: true,
    ),
  ];

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      if (_selectedFilter == 'All') return true;
      return n.category == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: const Text('Mark all read', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Chips Bar
            Container(
              height: 38,
              margin: const EdgeInsets.only(bottom: 10),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: _filters.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final f = _filters[idx];
                  final isSelected = f == _selectedFilter;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedFilter = f),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 160),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.navActive : AppColors.cardLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppColors.navActive : AppColors.borderLight,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          f,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Notifications List
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.notifications_none_rounded, size: 48, color: AppColors.textMutedDark),
                            const SizedBox(height: 12),
                            Text(
                              'No $_selectedFilter notifications',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimaryLight),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'You will be notified when recruiters review your applications or send requests.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, idx) {
                        final n = filtered[idx];
                        return GestureDetector(
                          onTap: () => setState(() => n.isRead = true),
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppColors.cardLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.borderLight),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.01),
                                  blurRadius: 6,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: n.iconColor.withValues(alpha: 0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  alignment: Alignment.center,
                                  child: Icon(n.icon, size: 19, color: n.iconColor),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              n.title,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: n.isRead ? FontWeight.w600 : FontWeight.w700,
                                                color: AppColors.textPrimaryLight,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text(
                                                n.time,
                                                style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                                              ),
                                              if (!n.isRead) ...[
                                                const SizedBox(width: 6),
                                                Container(
                                                  width: 7,
                                                  height: 7,
                                                  decoration: const BoxDecoration(
                                                    color: AppColors.primary,
                                                    shape: BoxShape.circle,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        n.message,
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          color: AppColors.textSecondaryLight,
                                          height: 1.35,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
