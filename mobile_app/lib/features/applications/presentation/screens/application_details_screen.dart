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

  static const List<String> standardStages = [
    'Applied',
    'Resume Screening',
    'AI Screening',
    'Shortlisted',
    'Interview Scheduled',
    'Interview Completed',
    'Under Review',
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
    final isFinalOutcome = app.currentStage.toLowerCase().contains('select') ||
        app.currentStage.toLowerCase().contains('reject') ||
        app.currentStage.toLowerCase().contains('hold');

    // Build timeline stages dynamically to avoid mutually exclusive linear sequences
    final List<String> activePipeline = List.from(standardStages);
    if (isFinalOutcome) {
      activePipeline.add(app.currentStage);
    } else {
      activePipeline.add('Final Decision / Outcome');
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Application Timeline', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Job Summary Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
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
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimaryLight,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                app.company,
                                style: const TextStyle(fontSize: 14, color: AppColors.primary, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        StatusBadge(status: app.currentStage),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1, color: AppColors.borderLight),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textSecondaryLight),
                        const SizedBox(width: 6),
                        Text(
                          'Applied on ${app.appliedDate}',
                          style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Recruitment Pipeline Card
              Container(
                padding: const EdgeInsets.all(18),
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
                    const Text(
                      'Recruitment Pipeline',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Live progression through the candidate evaluation process',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                    ),
                    const SizedBox(height: 20),

                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activePipeline.length,
                      itemBuilder: (context, idx) {
                        final stageName = activePipeline[idx];
                        final isPassed = idx < currentIndex;
                        final isCurrent = idx == currentIndex;
                        final isLast = idx == activePipeline.length - 1;

                        Color circleColor;
                        Widget circleChild;

                        if (isPassed) {
                          circleColor = AppColors.success;
                          circleChild = const Icon(Icons.check, size: 13, color: Colors.white);
                        } else if (isCurrent) {
                          circleColor = AppColors.primary;
                          circleChild = Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          );
                        } else {
                          circleColor = AppColors.borderLight;
                          circleChild = const SizedBox.shrink();
                        }

                        return IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Left Timeline Node & Connecting Line
                              Column(
                                children: [
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: circleColor,
                                      border: Border.all(
                                        color: isCurrent
                                            ? const Color(0xFFBFDBFE)
                                            : circleColor,
                                        width: isCurrent ? 3 : 1,
                                      ),
                                    ),
                                    alignment: Alignment.center,
                                    child: circleChild,
                                  ),
                                  if (!isLast)
                                    Expanded(
                                      child: Container(
                                        width: 2,
                                        margin: const EdgeInsets.symmetric(vertical: 2),
                                        color: isPassed ? AppColors.success : AppColors.borderLight,
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 14),

                              // Right Content
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 22),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        stageName,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isCurrent
                                              ? FontWeight.w700
                                              : (isPassed ? FontWeight.w600 : FontWeight.w500),
                                          color: isCurrent
                                              ? AppColors.primary
                                              : (isPassed
                                                  ? AppColors.textPrimaryLight
                                                  : AppColors.textSecondaryLight),
                                        ),
                                      ),
                                      if (isCurrent && app.nextStepNotice != null) ...[
                                        const SizedBox(height: 8),
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFEFF6FF),
                                            borderRadius: BorderRadius.circular(10),
                                            border: Border.all(color: const Color(0xFFBFDBFE)),
                                          ),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: [
                                                  const Icon(Icons.info_outline, size: 15, color: AppColors.primary),
                                                  const SizedBox(width: 6),
                                                  Expanded(
                                                    child: Text(
                                                      app.nextStepNotice!,
                                                      style: const TextStyle(
                                                        fontSize: 12.5,
                                                        color: AppColors.textPrimaryLight,
                                                        fontWeight: FontWeight.w500,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              if (app.currentStage.toLowerCase().contains('interview')) ...[
                                                const SizedBox(height: 10),
                                                SizedBox(
                                                  width: double.infinity,
                                                  height: 38,
                                                  child: ElevatedButton.icon(
                                                    onPressed: () => context.push('/meetings'),
                                                    icon: const Icon(Icons.video_call_rounded, size: 18, color: Colors.white),
                                                    label: const Text(
                                                      'Join Recruiter Meeting',
                                                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Colors.white),
                                                    ),
                                                    style: ElevatedButton.styleFrom(
                                                      backgroundColor: AppColors.primary,
                                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                      elevation: 0,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ],
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
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
