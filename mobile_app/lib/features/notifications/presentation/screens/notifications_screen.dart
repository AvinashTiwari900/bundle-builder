import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color iconColor;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: 'n-1',
      title: 'Interview Scheduled',
      message: 'Fintech Nexus Ltd has scheduled Technical Simulation for tomorrow at 2:00 PM.',
      time: '15m ago',
      icon: Icons.video_camera_front,
      iconColor: AppColors.primaryLight,
    ),
    NotificationItem(
      id: 'n-2',
      title: 'Auto-Apply Successful',
      message: 'GetnextIn AI submitted your application for Senior Mobile Engineer at CloudScale AI.',
      time: '2h ago',
      icon: Icons.bolt,
      iconColor: AppColors.warning,
    ),
    NotificationItem(
      id: 'n-3',
      title: 'Application Shortlisted',
      message: 'Your application for Frontend & Mobile Engineer at Swasthya Health Tech was shortlisted.',
      time: '1d ago',
      icon: Icons.check_circle_outline,
      iconColor: AppColors.success,
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
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: const Text('Mark all read', style: TextStyle(color: AppColors.primaryLight)),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _notifications.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, idx) {
            final n = _notifications[idx];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: n.isRead ? AppColors.surfaceDark : AppColors.cardDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: n.isRead ? AppColors.borderDark : AppColors.primary.withOpacity(0.4),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: n.iconColor.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(n.icon, size: 20, color: n.iconColor),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              n.title,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimaryDark,
                              ),
                            ),
                            Text(
                              n.time,
                              style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          n.message,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondaryDark,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
