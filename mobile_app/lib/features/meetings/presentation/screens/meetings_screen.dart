import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';

class MeetingsScreen extends StatefulWidget {
  const MeetingsScreen({super.key});

  @override
  State<MeetingsScreen> createState() => _MeetingsScreenState();
}

class _MeetingsScreenState extends State<MeetingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _roomCodeController = TextEditingController();

  final List<Map<String, dynamic>> _upcomingMeetings = [
    {
      'id': 'm-1',
      'title': 'Technical Round 1 with Lead Architect',
      'company': 'Fintech Nexus Ltd',
      'date': 'Tomorrow, 2:00 PM - 3:00 PM',
      'code': 'NEXUS-TECH-409',
      'interviewer': 'Priya Sundaram',
    },
  ];

  final List<Map<String, dynamic>> _completedMeetings = [
    {
      'id': 'm-2',
      'title': 'Initial Talent Screening & Career Alignment',
      'company': 'CloudScale AI',
      'date': 'Sep 08, 2026',
      'summary':
          'Discussed mobile architecture scale, previous production experience with Flutter, and compensation expectations.',
      'transcriptAvailable': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _roomCodeController.dispose();
    super.dispose();
  }

  void _showJoinRoomDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surfaceDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Join Video Meeting',
              style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 16)),
          content: TextField(
            controller: _roomCodeController,
            style: const TextStyle(color: AppColors.textPrimaryDark),
            decoration: const InputDecoration(
              hintText: 'Enter 6-digit or custom Room Code',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
            ),
            ElevatedButton(
              onPressed: () {
                final code = _roomCodeController.text.trim();
                if (code.isNotEmpty) {
                  Navigator.pop(context);
                  context.push('/meeting-room', extra: {'code': code});
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Join Room'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Meetings & Interview Rooms'),
        actions: [
          IconButton(
            icon: const Icon(Icons.video_call),
            onPressed: _showJoinRoomDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primaryLight,
          unselectedLabelColor: AppColors.textSecondaryDark,
          tabs: const [
            Tab(text: 'Upcoming (1)'),
            Tab(text: 'Past Records (1)'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // Upcoming Meetings List
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _upcomingMeetings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, idx) {
                final m = _upcomingMeetings[idx];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceDark,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m['title'] as String,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${m['company']} • Interviewer: ${m['interviewer']}',
                        style: const TextStyle(fontSize: 13, color: AppColors.primaryLight),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.schedule, size: 14, color: AppColors.textMutedDark),
                          const SizedBox(width: 6),
                          Text(m['date'] as String,
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              text: 'Join Video Room',
                              icon: Icons.videocam,
                              onPressed: () {
                                context.push('/meeting-room', extra: {'code': m['code']});
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            // Past Meeting Transcripts & Summaries
            ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _completedMeetings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, idx) {
                final m = _completedMeetings[idx];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceDark,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        m['title'] as String,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${m['company']} • ${m['date']}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'AI Generated Meeting Summary:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryLight,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        m['summary'] as String,
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryDark, height: 1.4),
                      ),
                      const SizedBox(height: 14),
                      OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Downloading full session transcript...')),
                          );
                        },
                        icon: const Icon(Icons.description_outlined, size: 16),
                        label: const Text('View Transcript & Key Action Items'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
