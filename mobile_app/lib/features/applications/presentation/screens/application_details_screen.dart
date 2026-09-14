import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/status_badge.dart';
import 'applications_screen.dart';

class ApplicationDetailsScreen extends StatelessWidget {
  final String applicationId;
  final ApplicationItem? item;

  const ApplicationDetailsScreen({
    super.key,
    required this.applicationId,
    this.item,
  });

  static const List<String> pipelineStages = [
    'Applied',
    'Resume Screening',
    'AI Screening',
    'Shortlisted',
    'Interview Scheduled',
    'Interview Completed',
    'Under Review',
    'Pending Employer Response',
    'Selected',
    'Rejected',
    'On Hold',
  ];

  @override
  Widget build(BuildContext context) {
    final app = item ??
        const ApplicationItem(
          id: 'app-1',
          jobTitle: 'Senior Flutter Developer',
          company: 'Fintech Nexus Ltd',
          appliedDate: 'Sep 10, 2026',
          currentStage: 'Interview Scheduled',
          stageIndex: 4,
          nextStepNotice: 'Technical Simulation via Studio on Sep 14, 2:00 PM',
        );

    final currentIndex = app.stageIndex;

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Application Timeline'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
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
                              fontSize: 18,
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
                      style: const TextStyle(fontSize: 14, color: AppColors.primaryLight),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined,
                            size: 14, color: AppColors.textMutedDark),
                        const SizedBox(width: 6),
                        Text(
                          'Applied on ${app.appliedDate}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Visual 11-Stage Pipeline
              const Text(
                '11-Stage Recruitment Pipeline',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 16),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: pipelineStages.length,
                  itemBuilder: (context, idx) {
                    final stageName = pipelineStages[idx];
                    final isPassed = idx < currentIndex;
                    final isCurrent = idx == currentIndex;

                    Color dotColor = AppColors.borderDark;
                    if (isPassed) dotColor = AppColors.success;
                    if (isCurrent) dotColor = AppColors.primaryLight;

                    return IntrinsicHeight(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left Indicator & Connecting line
                          Column(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isPassed
                                      ? AppColors.success
                                      : isCurrent
                                          ? AppColors.primary
                                          : AppColors.cardDark,
                                  border: Border.all(color: dotColor, width: 2),
                                ),
                                child: Center(
                                  child: isPassed
                                      ? const Icon(Icons.check, size: 13, color: Colors.white)
                                      : isCurrent
                                          ? Container(
                                              width: 8,
                                              height: 8,
                                              decoration: const BoxDecoration(
                                                color: Colors.white,
                                                shape: BoxShape.circle,
                                              ),
                                            )
                                          : null,
                                ),
                              ),
                              if (idx < pipelineStages.length - 1)
                                Expanded(
                                  child: Container(
                                    width: 2,
                                    color: isPassed ? AppColors.success : AppColors.borderDark,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 14),

                          // Right content
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    stageName,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: isCurrent
                                          ? FontWeight.bold
                                          : isPassed
                                              ? FontWeight.w600
                                              : FontWeight.normal,
                                      color: isCurrent
                                          ? AppColors.primaryLight
                                          : isPassed
                                              ? AppColors.textPrimaryDark
                                              : AppColors.textMutedDark,
                                    ),
                                  ),
                                  if (isCurrent && app.nextStepNotice != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      app.nextStepNotice!,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSecondaryDark,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Action Buttons
              if (app.currentStage.contains('Interview')) ...[
                CustomButton(
                  text: 'Join Recruiter Meeting',
                  icon: Icons.video_camera_front,
                  onPressed: () => context.push('/meetings'),
                ),
                const SizedBox(height: 12),
              ],

              CustomButton(
                text: 'View Job Details',
                variant: ButtonVariant.outline,
                icon: Icons.work_outline,
                onPressed: () => context.push('/jobs/${app.id}'),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
