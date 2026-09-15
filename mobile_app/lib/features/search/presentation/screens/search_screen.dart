import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/match_score_chip.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  final List<Map<String, dynamic>> _people = [
    {
      'id': 'p1',
      'name': 'Pooja Sharma',
      'headline': 'Senior Frontend Engineer at Flipkart • React, TypeScript',
      'college': 'IIT Delhi',
      'mutual': 14,
      'isStudent': false,
    },
    {
      'id': 'p2',
      'name': 'Vikram Malhotra',
      'headline': 'Flutter Mobile Architect • Ex-Zomato',
      'college': 'BITS Pilani',
      'mutual': 8,
      'isStudent': false,
    },
    {
      'id': 'p3',
      'name': 'Ananya Roy',
      'headline': 'Final Year CS Undergrad & AI Researcher',
      'college': 'IIT Bombay',
      'mutual': 21,
      'isStudent': true,
    },
    {
      'id': 'p4',
      'name': 'Rohan Gupta',
      'headline': 'Backend & Distributed Systems Engineer at Swiggy',
      'college': 'NIT Trichy',
      'mutual': 5,
      'isStudent': false,
    },
  ];

  final List<Map<String, dynamic>> _posts = [
    {
      'id': 'post-1',
      'author': 'Rahul Verma',
      'headline': 'SDE-2 at Microsoft • Flutter & Systems',
      'time': '2h ago',
      'title': 'Flutter State Benchmark: Riverpod vs Bloc',
      'snippet': 'Evaluated Riverpod vs Bloc across 10,000 active stream events. 35% lower widget rebuild overhead.',
      'tags': ['#Flutter', '#MobileDev', '#OpenSource'],
    },
    {
      'id': 'post-2',
      'author': 'Nexus Tech Global',
      'headline': 'Enterprise Recruitment Partner',
      'time': '5h ago',
      'title': 'Hiring 5 Lead Mobile Engineers',
      'snippet': 'Actively looking for Lead Mobile Engineers in Flutter and real-time streaming architectures.',
      'tags': ['#Hiring', '#FlutterJobs', '#RemoteWork'],
    },
    {
      'id': 'post-3',
      'author': 'Priya Nair',
      'headline': 'Product Designer at Razorpay',
      'time': '1d ago',
      'title': 'Case Study: Fintech Onboarding Redesign',
      'snippet': 'How we improved KYC conversion by 42% using biometric passkeys and progressive disclosure.',
      'tags': ['#Fintech', '#DesignSystem', '#ProductGrowth'],
    },
  ];

  final List<Map<String, dynamic>> _jobs = [
    {
      'id': 'job-1',
      'title': 'Senior Mobile Engineer (Flutter)',
      'company': 'Fintech Nexus Ltd',
      'location': 'Bengaluru, Karnataka (Hybrid)',
      'salary': '₹18 - 24 LPA',
      'match': 94,
    },
    {
      'id': 'job-2',
      'title': 'Full Stack App Developer',
      'company': 'CloudScale AI',
      'location': 'Remote',
      'salary': '₹15 - 20 LPA',
      'match': 88,
    },
    {
      'id': 'job-3',
      'title': 'Frontend & Mobile Engineer',
      'company': 'Swasthya Health Tech',
      'location': 'Hyderabad, Telangana (On-site)',
      'salary': '₹12 - 16 LPA',
      'match': 82,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredPeople {
    if (_query.isEmpty) return _people;
    final q = _query.toLowerCase();
    return _people.where((p) {
      return (p['name'] as String).toLowerCase().contains(q) ||
          (p['headline'] as String).toLowerCase().contains(q) ||
          (p['college'] as String).toLowerCase().contains(q);
    }).toList();
  }

  List<Map<String, dynamic>> get _filteredPosts {
    if (_query.isEmpty) return _posts;
    final q = _query.toLowerCase();
    return _posts.where((p) {
      return (p['title'] as String).toLowerCase().contains(q) ||
          (p['snippet'] as String).toLowerCase().contains(q) ||
          (p['author'] as String).toLowerCase().contains(q) ||
          (p['tags'] as List<String>).any((t) => t.toLowerCase().contains(q));
    }).toList();
  }

  List<Map<String, dynamic>> get _filteredJobs {
    if (_query.isEmpty) return _jobs;
    final q = _query.toLowerCase();
    return _jobs.where((j) {
      return (j['title'] as String).toLowerCase().contains(q) ||
          (j['company'] as String).toLowerCase().contains(q) ||
          (j['location'] as String).toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final people = _filteredPeople;
    final posts = _filteredPosts;
    final jobs = _filteredJobs;
    final totalCount = people.length + posts.length + jobs.length;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        titleSpacing: 0,
        title: Container(
          height: 40,
          margin: const EdgeInsets.only(right: 16),
          decoration: BoxDecoration(
            color: AppColors.searchBackground,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: TextField(
            controller: _searchController,
            autofocus: true,
            onChanged: (val) => setState(() => _query = val.trim()),
            decoration: InputDecoration(
              hintText: 'Search people, posts, jobs...',
              hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMutedDark),
              prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textSecondaryLight),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 16, color: AppColors.textSecondaryLight),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _query = '');
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              fillColor: Colors.transparent,
            ),
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          padding: const EdgeInsets.symmetric(horizontal: 16),
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
            Tab(text: 'All ($totalCount)'),
            Tab(text: 'People (${people.length})'),
            Tab(text: 'Posts (${posts.length})'),
            Tab(text: 'Jobs (${jobs.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. All
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (people.isNotEmpty) ...[
                _sectionHeader('People (${people.length})', () => _tabController.animateTo(1)),
                ...people.take(2).map(_buildPersonCard),
                const SizedBox(height: 16),
              ],
              if (posts.isNotEmpty) ...[
                _sectionHeader('Posts (${posts.length})', () => _tabController.animateTo(2)),
                ...posts.take(2).map(_buildPostCard),
                const SizedBox(height: 16),
              ],
              if (jobs.isNotEmpty) ...[
                _sectionHeader('Jobs (${jobs.length})', () => _tabController.animateTo(3)),
                ...jobs.take(2).map(_buildJobCard),
              ],
              if (totalCount == 0) _buildEmptyState(),
            ],
          ),

          // 2. People
          people.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: people.length,
                  itemBuilder: (_, i) => _buildPersonCard(people[i]),
                ),

          // 3. Posts
          posts.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: posts.length,
                  itemBuilder: (_, i) => _buildPostCard(posts[i]),
                ),

          // 4. Jobs
          jobs.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: jobs.length,
                  itemBuilder: (_, i) => _buildJobCard(jobs[i]),
                ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, VoidCallback onSeeAll) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimaryLight,
            ),
          ),
          GestureDetector(
            onTap: onSeeAll,
            child: const Text(
              'See all',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonCard(Map<String, dynamic> person) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFEFF6FF),
              border: Border.all(color: AppColors.borderLight),
            ),
            alignment: Alignment.center,
            child: Text(
              (person['name'] as String).substring(0, 1),
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        person['name'] as String,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryLight,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.check_circle, size: 13, color: AppColors.primary),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  person['headline'] as String,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryLight),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${person['college']} • ${person['mutual']} mutuals',
                  style: const TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Connection request sent to ${person['name']}')),
              );
            },
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(68, 32),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: const Text('Connect', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard(Map<String, dynamic> post) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFEFF6FF),
                ),
                alignment: Alignment.center,
                child: Text(
                  (post['author'] as String).substring(0, 1),
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  post['author'] as String,
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                ),
              ),
              Text(
                post['time'] as String,
                style: const TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            post['title'] as String,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            post['snippet'] as String,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard(Map<String, dynamic> job) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
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
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Text(
              (job['company'] as String).substring(0, 1),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job['title'] as String,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${job['company']} • ${job['location']}',
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 2),
                Text(
                  job['salary'] as String,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.success),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          MatchScoreChip(score: job['match'] as int),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMutedDark),
            const SizedBox(height: 12),
            const Text(
              'No results found',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimaryLight),
            ),
            const SizedBox(height: 4),
            Text(
              _query.isEmpty ? 'Type in the search bar above to find people, posts, or jobs' : 'No matches found for "$_query"',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight),
            ),
          ],
        ),
      ),
    );
  }
}
