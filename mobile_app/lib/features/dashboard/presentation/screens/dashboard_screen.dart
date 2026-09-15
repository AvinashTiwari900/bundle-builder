import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/match_score_chip.dart';
import '../../../authentication/presentation/auth_notifier.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Candidate Dashboard', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Greeting Card
              Container(
                padding: const EdgeInsets.all(16),
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
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.black,
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Image.asset('assets/logo.png', fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hi, ${user?.name ?? "Candidate"} 👋',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimaryLight,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Welcome to your candidate cockpit',
                            style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Profile Strength Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Profile Strength',
                          style: TextStyle(
                            fontSize: 15.5,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            '85% Complete',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: 0.85,
                        backgroundColor: Colors.white.withValues(alpha: 0.25),
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                        minHeight: 6,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Add 1 more project to reach 100%',
                          style: TextStyle(fontSize: 12, color: Colors.white70),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/projects'),
                          child: const Text(
                            'Add Project →',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // KPI Grid (2x2)
              Row(
                children: [
                  Expanded(
                    child: _kpiCard(
                      title: 'Active Applications',
                      value: '12',
                      subtitle: '3 in interview stage',
                      icon: Icons.assignment_outlined,
                      color: AppColors.primary,
                      onTap: () => context.push('/applications'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _kpiCard(
                      title: 'Shortlisted',
                      value: '4',
                      subtitle: '+2 this week',
                      icon: Icons.check_circle_outline,
                      color: AppColors.success,
                      onTap: () => context.push('/applications'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _kpiCard(
                      title: 'Interviews Scheduled',
                      value: '2',
                      subtitle: 'Next: Tomorrow 2 PM',
                      icon: Icons.video_camera_front_outlined,
                      color: AppColors.accent,
                      onTap: () => context.push('/meetings'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _kpiCard(
                      title: 'Auto Applied',
                      value: '28',
                      subtitle: 'Daily limit: 10',
                      icon: Icons.bolt,
                      color: AppColors.warning,
                      onTap: () => context.push('/auto-apply'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Quick Actions
              const Text(
                'Quick Actions',
                style: TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 84,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _moduleShortcut(
                      icon: Icons.bolt_rounded,
                      label: 'Auto Apply',
                      onTap: () => context.push('/auto-apply'),
                    ),
                    _moduleShortcut(
                      icon: Icons.folder_outlined,
                      label: 'Projects',
                      onTap: () => context.push('/projects'),
                    ),
                    _moduleShortcut(
                      icon: Icons.article_outlined,
                      label: 'Case Studies',
                      onTap: () => context.push('/case-studies'),
                    ),
                    _moduleShortcut(
                      icon: Icons.video_camera_front_outlined,
                      label: 'Meetings',
                      onTap: () => context.push('/meetings'),
                    ),
                    _moduleShortcut(
                      icon: Icons.description_outlined,
                      label: 'Documents',
                      onTap: () => context.push('/documents'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Recommended Jobs Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recommended For You',
                    style: TextStyle(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimaryLight,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.go('/jobs'),
                    child: const Text(
                      'View All',
                      style: TextStyle(
                        fontSize: 12.5,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              _jobRecommendationCard(
                title: 'Senior Flutter Developer',
                company: 'Fintech Nexus Ltd',
                location: 'Bengaluru (Hybrid)',
                salary: '₹18 - 24 LPA',
                matchScore: 94,
                tags: ['Flutter', 'Riverpod', 'Dio'],
                onTap: () => context.push('/jobs/job-1'),
              ),
              const SizedBox(height: 10),

              _jobRecommendationCard(
                title: 'Full Stack App Developer',
                company: 'CloudScale AI',
                location: 'Remote',
                salary: '₹15 - 20 LPA',
                matchScore: 88,
                tags: ['Flutter', 'Node.js', 'PostgreSQL'],
                onTap: () => context.push('/jobs/job-2'),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _kpiCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondaryLight,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(icon, size: 18, color: color),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 10.5,
                color: AppColors.textMutedDark,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _moduleShortcut({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 84,
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.cardLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.015),
              blurRadius: 6,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimaryLight,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _jobRecommendationCard({
    required String title,
    required String company,
    required String location,
    required String salary,
    required int matchScore,
    required List<String> tags,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimaryLight,
                    ),
                  ),
                ),
                MatchScoreChip(score: matchScore),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              '$company • $location',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  salary,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.success,
                  ),
                ),
                Wrap(
                  spacing: 4,
                  children: tags.map((t) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.elevatedLight,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(t, style: const TextStyle(fontSize: 10.5, color: AppColors.textPrimaryLight)),
                    );
                  }).toList(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
