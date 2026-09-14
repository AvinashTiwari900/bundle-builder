import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

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
            color: AppColors.elevatedLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: TextField(
            controller: _searchController,
            autofocus: true,
            onChanged: (val) => setState(() => _query = val.trim()),
            decoration: InputDecoration(
              hintText: 'Search people, posts, jobs...',
              prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondaryLight),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
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
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondaryLight,
          indicatorColor: AppColors.primary,
          indicatorWeight: 2.5,
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
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimaryDark,
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
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: const Color(0xFFEFF6FF),
            child: Text(
              (person['name'] as String).substring(0, 1),
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  person['name'] as String,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  person['headline'] as String,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${person['college']} • ${person['mutual']} mutual connections',
                  style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          OutlinedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Connection request sent to ${person['name']}')),
              );
            },
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(80, 32),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              side: const BorderSide(color: AppColors.primary),
            ),
            child: const Text('Connect', style: TextStyle(fontSize: 12, color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard(Map<String, dynamic> post) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: const Color(0xFFF1F5F9),
                child: Text(
                  (post['author'] as String).substring(0, 1),
                  style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  post['author'] as String,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
              Text(
                post['time'] as String,
                style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            post['title'] as String,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimaryDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            post['snippet'] as String,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard(Map<String, dynamic> job) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  job['title'] as String,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  job['company'] as String,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                ),
                const SizedBox(height: 4),
                Text(
                  '${job['location']} • ${job['salary']}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => context.push('/jobs/${job['id']}'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(70, 32),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              backgroundColor: AppColors.primary,
            ),
            child: const Text('View', style: TextStyle(fontSize: 12, color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.search_off, size: 48, color: AppColors.textMutedDark),
          const SizedBox(height: 12),
          const Text(
            'No matching results found',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
          ),
          const SizedBox(height: 4),
          Text(
            _query.isEmpty
                ? 'Type keywords to search across people, posts, and jobs'
                : 'Try different terms or search across All tabs',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
