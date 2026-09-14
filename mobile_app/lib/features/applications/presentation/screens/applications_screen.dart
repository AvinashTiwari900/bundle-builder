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
  final int stageIndex; // 0 to 10
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

class _ApplicationsScreenState extends State<ApplicationsScreen> {
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
      stageIndex: 8,
      nextStepNotice: 'Offer letter dispatched to your email.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('My Applications'),
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          itemCount: _applications.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, idx) {
            final app = _applications[idx];
            return GestureDetector(
              onTap: () => context.push('/applications/${app.id}', extra: app),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            app.jobTitle,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                        ),
                        StatusBadge(status: app.currentStage),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      app.company,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 11-Stage Visual Progress Bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (app.stageIndex + 1) / 11,
                        backgroundColor: AppColors.cardDark,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                        minHeight: 6,
                      ),
                    ),
                    const SizedBox(height: 10),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Stage ${app.stageIndex + 1} of 11: ${app.currentStage}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryLight,
                          ),
                        ),
                        Text(
                          'Applied: ${app.appliedDate}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                        ),
                      ],
                    ),

                    if (app.nextStepNotice != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, size: 14, color: AppColors.primaryLight),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                app.nextStepNotice!,
                                style: const TextStyle(fontSize: 11, color: AppColors.textPrimaryDark),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
