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
    JobModel(
      id: 'job-4',
      title: 'Mobile Architect',
      company: 'Nexus Mobility Global',
      location: 'Pune, Maharashtra',
      workMode: 'Hybrid',
      salary: '₹28 - 36 LPA',
      experience: '6-8 Years',
      skills: ['Architecture', 'Flutter', 'Android', 'iOS', 'Clean Code'],
      description:
          'Design enterprise design systems, reactive store pipelines, and platform channels.',
      eligibility: 'Extensive track record leading production mobile teams.',
      matchScore: 91,
      matchExplanation:
          'Deep match with architecture leadership, Flutter design systems, and cross-platform performance.',
      isSaved: true,
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
      backgroundColor: AppColors.cardLight,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(22),
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
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryLight,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textSecondaryLight),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Work Mode',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryLight,
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
                        selectedColor: AppColors.navActive,
                        backgroundColor: AppColors.elevatedLight,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.5,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: const BorderSide(color: AppColors.borderLight),
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
                      child: const Text('Apply Filters', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            // Top Section
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
              decoration: const BoxDecoration(
                color: AppColors.cardLight,
                border: Border(
                  bottom: BorderSide(color: AppColors.borderLight, width: 1),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Jobs',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryLight,
                          letterSpacing: -0.3,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.tune_rounded, color: AppColors.textPrimaryLight, size: 22),
                        onPressed: _showFilterBottomSheet,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Search Field
                  Container(
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.searchBackground,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: 'Search roles, companies, skills...',
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMutedDark),
                        prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textSecondaryLight),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  setState(() {});
                                },
                                child: const Icon(Icons.close, size: 16, color: AppColors.textSecondaryLight),
                              )
                            : null,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimaryLight),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Pill Tabs
                  TabBar(
                    controller: _tabController,
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
                    tabs: [
                      Tab(text: 'All Jobs (${allFiltered.length})'),
                      Tab(text: 'Saved (${savedFiltered.length})'),
                    ],
                  ),
                ],
              ),
            ),

            // Job Lists
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
              isSavedTab ? Icons.bookmark_border_rounded : Icons.search_off_rounded,
              size: 48,
              color: AppColors.textMutedDark,
            ),
            const SizedBox(height: 12),
            Text(
              isSavedTab ? 'No Saved Jobs' : 'No matching jobs found',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isSavedTab
                  ? 'Bookmark jobs to easily access and apply later'
                  : 'Try adjusting your search terms or filters',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: jobs.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, idx) {
        final job = jobs[idx];
        return GestureDetector(
          onTap: () => context.push('/jobs/${job.id}', extra: job),
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
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Company Icon, Title & Company, Save Action
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        job.company.isNotEmpty ? job.company[0].toUpperCase() : 'C',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimaryLight,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            job.company,
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondaryLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        job.isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                        color: job.isSaved ? AppColors.primary : AppColors.textSecondaryLight,
                        size: 22,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(job.isSaved ? 'Job removed from saved' : 'Job saved to bookmarks')),
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Metadata Chips: Location, WorkMode, Salary, Experience
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _metaChip(Icons.location_on_outlined, job.location),
                    _metaChip(Icons.work_outline, job.workMode),
                    _metaChip(Icons.payments_outlined, job.salary),
                    _metaChip(Icons.schedule_outlined, job.experience),
                  ],
                ),
                const SizedBox(height: 12),

                // Required Skills
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: job.skills.take(4).map((s) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.elevatedLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        s,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimaryLight,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: AppColors.borderLight),
                const SizedBox(height: 10),

                // Bottom Row: AI Match badge + Apply CTA
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    MatchScoreChip(score: job.matchScore),
                    const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'View Details',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.primary),
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
  }

  Widget _metaChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.textSecondaryLight),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
