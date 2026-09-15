import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/status_badge.dart';

class ApplicationItem {
  final String id;
  final String jobTitle;
  final String company;
  final String appliedDate;
  final String currentStage;
  final int stageIndex; // 0 to 7
  final String? nextStepNotice;

  const ApplicationItem({
    required this.id,
    required this.jobTitle,
    required this.company,
    required this.appliedDate,
    required this.currentStage,
    required this.stageIndex,
    this.nextStepNotice,
  });
}

class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<ApplicationItem> _applications = const [
    ApplicationItem(
      id: 'app-1',
      jobTitle: 'Senior Flutter Developer',
      company: 'Fintech Nexus Ltd',
      appliedDate: 'Sep 10, 2026',
      currentStage: 'Interview Scheduled',
      stageIndex: 4,
      nextStepNotice: 'Technical Simulation via Studio on Sep 14, 2:00 PM',
    ),
    ApplicationItem(
      id: 'app-2',
      jobTitle: 'Full Stack App Developer',
      company: 'CloudScale AI',
      appliedDate: 'Sep 06, 2026',
      currentStage: 'AI Screening',
      stageIndex: 2,
      nextStepNotice: 'AI Resume & Assessment parsing in progress',
    ),
    ApplicationItem(
      id: 'app-3',
      jobTitle: 'Frontend & Mobile Engineer',
      company: 'Swasthya Health Tech',
      appliedDate: 'Aug 28, 2026',
      currentStage: 'Shortlisted',
      stageIndex: 3,
      nextStepNotice: 'Recruiter review completed. Interview slot being prepared.',
    ),
    ApplicationItem(
      id: 'app-4',
      jobTitle: 'Mobile Architect',
      company: 'Nexus Mobility Global',
      appliedDate: 'Aug 15, 2026',
      currentStage: 'Selected',
      stageIndex: 7,
      nextStepNotice: 'Offer letter dispatched to your email.',
    ),
  ];

  final List<String> _tabs = ['All', 'Applied', 'Shortlisted', 'Interview', 'Selected'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<ApplicationItem> _getFilteredApplications(String tab) {
    if (tab == 'All') return _applications;
    if (tab == 'Applied') return _applications.where((a) => a.stageIndex <= 1).toList();
    if (tab == 'Shortlisted') return _applications.where((a) => a.currentStage.toLowerCase().contains('shortlist')).toList();
    if (tab == 'Interview') return _applications.where((a) => a.currentStage.toLowerCase().contains('interview')).toList();
    if (tab == 'Selected') return _applications.where((a) => a.currentStage.toLowerCase().contains('select')).toList();
    return _applications;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('My Applications', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Tabs Bar
            Container(
              height: 42,
              margin: const EdgeInsets.only(bottom: 8),
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                indicatorSize: TabBarIndicatorSize.tab,
                indicator: BoxDecoration(
                  color: AppColors.navActive,
                  borderRadius: BorderRadius.circular(20),
                ),
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondaryLight,
                labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12.5),
                dividerColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                tabAlignment: TabAlignment.start,
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: _tabs.map((tab) {
                  final list = _getFilteredApplications(tab);
                  if (list.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: const BoxDecoration(
                                color: Color(0xFFEFF6FF),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.assignment_outlined, size: 28, color: AppColors.primary),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'No $tab Applications',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimaryLight),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Applications in this category will appear here automatically.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, idx) {
                      final app = list[idx];
                      final progress = (app.stageIndex + 1) / 8.0;

                      return GestureDetector(
                        onTap: () => context.push('/applications/${app.id}', extra: app),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.cardLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.borderLight),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.015),
                                blurRadius: 8,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          app.jobTitle,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimaryLight,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          app.company,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w500,
                                            color: AppColors.textSecondaryLight,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  StatusBadge(status: app.currentStage),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // Progress bar
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Stage: ${app.currentStage}',
                                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.primary),
                                      ),
                                      Text(
                                        'Step ${app.stageIndex + 1} of 8',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: progress,
                                      backgroundColor: AppColors.elevatedLight,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        app.currentStage.toLowerCase().contains('select')
                                            ? AppColors.success
                                            : AppColors.primary,
                                      ),
                                      minHeight: 5,
                                    ),
                                  ),
                                ],
                              ),

                              if (app.nextStepNotice != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                                  decoration: BoxDecoration(
                                    color: AppColors.elevatedLight,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.info_outline, size: 14, color: AppColors.primary),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          app.nextStepNotice!,
                                          style: const TextStyle(fontSize: 11.5, color: AppColors.textPrimaryLight),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Applied on ${app.appliedDate}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                                  ),
                                  const Row(
                                    children: [
                                      Text(
                                        'Timeline',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
                                      ),
                                      SizedBox(width: 4),
                                      Icon(Icons.chevron_right, size: 16, color: AppColors.primary),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
