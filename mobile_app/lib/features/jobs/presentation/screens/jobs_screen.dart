import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/match_score_chip.dart';
import '../../models/job_model.dart';

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});

  @override
  ConsumerState<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends ConsumerState<JobsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _selectedWorkMode = 'All';

  final List<JobModel> _mockJobs = const [
    JobModel(
      id: 'job-1',
      title: 'Senior Mobile Engineer (Flutter)',
      company: 'Fintech Nexus Ltd',
      location: 'Bengaluru, Karnataka',
      workMode: 'Hybrid',
      salary: '₹18 - 24 LPA',
      experience: '3-5 Years',
      skills: ['Flutter', 'Dart', 'Riverpod', 'Dio', 'CI/CD'],
      description:
          'Join our core mobile platform team scaling fintech solutions to over 5 million daily active users.',
      eligibility: 'B.Tech / MCA with 3+ years in Flutter mobile production.',
      matchScore: 94,
      matchExplanation:
          'Your profile has 94% alignment: Flutter, Riverpod, Dart, and financial architecture.',
      isSaved: true,
    ),
    JobModel(
      id: 'job-2',
      title: 'Full Stack App Developer',
      company: 'CloudScale AI',
      location: 'Remote',
      workMode: 'Remote',
      salary: '₹15 - 20 LPA',
      experience: '2-4 Years',
      skills: ['Flutter', 'Node.js', 'PostgreSQL', 'Docker'],
      description:
          'Build next-generation enterprise productivity applications with real-time sync and generative AI.',
      eligibility: 'Experience with Flutter and Node.js REST / GraphQL backends.',
      matchScore: 88,
      matchExplanation:
          'High match in cross-platform mobile architecture and PostgreSQL backend integrations.',
    ),
    JobModel(
      id: 'job-3',
      title: 'Frontend & Mobile Engineer',
      company: 'Swasthya Health Tech',
      location: 'Hyderabad, Telangana',
      workMode: 'On-site',
      salary: '₹12 - 16 LPA',
      experience: '1-3 Years',
      skills: ['Flutter', 'React', 'TypeScript', 'WebRTC'],
      description:
          'Develop telehealth patient interfaces and secure video consulting rooms.',
      eligibility: 'Passionate about digital healthcare and real-time streaming.',
      matchScore: 82,
      matchExplanation:
          'Great match on UI component fidelity and video stream integrations.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Filter Jobs',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textSecondaryDark),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Work Mode',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: ['All', 'Remote', 'Hybrid', 'On-site'].map((mode) {
                      final isSelected = _selectedWorkMode == mode;
                      return ChoiceChip(
                        label: Text(mode),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        backgroundColor: AppColors.cardDark,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textSecondaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() => _selectedWorkMode = mode);
                            setState(() => _selectedWorkMode = mode);
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Apply Filters', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.toLowerCase();
    final allFiltered = _mockJobs.where((j) {
      final matchesQuery = query.isEmpty ||
          j.title.toLowerCase().contains(query) ||
          j.company.toLowerCase().contains(query) ||
          j.skills.any((s) => s.toLowerCase().contains(query));
      final matchesMode =
          _selectedWorkMode == 'All' || j.workMode == _selectedWorkMode;
      return matchesQuery && matchesMode;
    }).toList();

    final savedFiltered = allFiltered.where((j) => j.isSaved).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Job Openings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: _showFilterBottomSheet,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primaryLight,
          unselectedLabelColor: AppColors.textSecondaryDark,
          tabs: const [
            Tab(text: 'All Jobs'),
            Tab(text: 'Saved Jobs'),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Input
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: TextFormField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search roles, companies, skills...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.textMutedDark),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                ),
              ),
            ),

            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildJobList(allFiltered),
                  _buildJobList(savedFiltered, isSavedTab: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobList(List<JobModel> jobs, {bool isSavedTab = false}) {
    if (jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSavedTab ? Icons.bookmark_border : Icons.search_off,
              size: 48,
              color: AppColors.textMutedDark,
            ),
            const SizedBox(height: 12),
            Text(
              isSavedTab ? 'No Saved Jobs' : 'No matching jobs found',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimaryDark,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isSavedTab
                  ? 'Bookmark jobs to easily access and apply later'
                  : 'Try adjusting your search terms or filters',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: jobs.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, idx) {
        final job = jobs[idx];
        return GestureDetector(
          onTap: () => context.push('/jobs/${job.id}', extra: job),
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
                        job.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                    ),
                    MatchScoreChip(score: job.matchScore),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  job.company,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondaryDark,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        job.workMode,
                        style: const TextStyle(fontSize: 11, color: AppColors.primaryLight),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMutedDark),
                    const SizedBox(width: 4),
                    Text(
                      job.location,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                    ),
                    const Spacer(),
                    Text(
                      job.salary,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  children: job.skills.take(4).map((skill) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        skill,
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
