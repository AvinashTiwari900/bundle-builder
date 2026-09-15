import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class CandidateContact {
  final String id;
  final String name;
  final String role;
  final String collegeOrCompany;
  final bool isConnected;
  final bool isPending;
  final String email;
  final String phone;
  final String? avatarUrl;

  const CandidateContact({
    required this.id,
    required this.name,
    required this.role,
    required this.collegeOrCompany,
    this.isConnected = false,
    this.isPending = false,
    required this.email,
    required this.phone,
    this.avatarUrl,
  });
}

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<CandidateContact> _allCandidates = [
    const CandidateContact(
      id: 'c-1',
      name: 'Pooja Nair',
      role: 'Full Stack Engineer',
      collegeOrCompany: 'IIT Bombay',
      isConnected: true,
      email: 'pooja.nair@example.com',
      phone: '+91 9876543201',
    ),
    const CandidateContact(
      id: 'c-2',
      name: 'Arjun Das',
      role: 'DevOps & Cloud Engineer',
      collegeOrCompany: 'BITS Pilani',
      isConnected: true,
      email: 'arjun.das@example.com',
      phone: '+91 9876543202',
    ),
    const CandidateContact(
      id: 'c-3',
      name: 'Sneha Kulkarni',
      role: 'Machine Learning Specialist',
      collegeOrCompany: 'NIT Surathkal',
      isPending: true,
      email: 'sneha.k@example.com',
      phone: '+91 9876543203',
    ),
    const CandidateContact(
      id: 'c-4',
      name: 'Vikram Mehta',
      role: 'Mobile Developer (Flutter)',
      collegeOrCompany: 'DTU Delhi',
      isConnected: false,
      email: 'vikram.mehta@example.com',
      phone: '+91 9876543204',
    ),
    const CandidateContact(
      id: 'c-5',
      name: 'Ananya Sharma',
      role: 'Backend Architect (Node.js)',
      collegeOrCompany: 'IIIT Hyderabad',
      isConnected: false,
      email: 'ananya.s@example.com',
      phone: '+91 9876543205',
    ),
    const CandidateContact(
      id: 'c-6',
      name: 'Rohan Gupta',
      role: 'Product Designer (UI/UX)',
      collegeOrCompany: 'NID Ahmedabad',
      isConnected: true,
      email: 'rohan.g@example.com',
      phone: '+91 9876543206',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _allCandidates.where((c) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return c.name.toLowerCase().contains(q) ||
          c.role.toLowerCase().contains(q) ||
          c.collegeOrCompany.toLowerCase().contains(q);
    }).toList();

    final connected = filtered.where((c) => c.isConnected).toList();
    final pending = filtered.where((c) => c.isPending).toList();
    final discover = filtered.where((c) => !c.isConnected && !c.isPending).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            // Screen Header: My Connections + Compact Search
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
                  const Text(
                    'My Connections',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimaryLight,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Compact Search Field
                  Container(
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.searchBackground,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val.trim()),
                      decoration: InputDecoration(
                        hintText: 'Search connections...',
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMutedDark),
                        prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textSecondaryLight),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
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

                  // Custom Pill Tabs
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
                      Tab(text: 'Connected (${connected.length})'),
                      Tab(text: 'Pending (${pending.length})'),
                      Tab(text: 'Discover (${discover.length})'),
                    ],
                  ),
                ],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildList(connected, isConnectedTab: true),
                  _buildList(pending, isPendingTab: true),
                  _buildList(discover, isDiscoverTab: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(
    List<CandidateContact> list, {
    bool isConnectedTab = false,
    bool isPendingTab = false,
    bool isDiscoverTab = false,
  }) {
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
                child: const Icon(Icons.people_outline, size: 28, color: AppColors.primary),
              ),
              const SizedBox(height: 12),
              const Text(
                'No connections found',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.textPrimaryLight),
              ),
              const SizedBox(height: 4),
              const Text(
                'Grow your network to discover job referrals and share engineering milestones.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, idx) {
        final item = list[idx];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
              // Avatar
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
                  item.name[0],
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            item.name,
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
                      item.role,
                      style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w500),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 1),
                    Text(
                      item.collegeOrCompany,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Actions
              if (isConnectedTab) ...[
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Opening chat with ${item.name}')),
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline_rounded, size: 14, color: AppColors.primary),
                  label: const Text('Message', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEFF6FF),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: const Size(60, 34),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                      side: const BorderSide(color: Color(0xFFBFDBFE)),
                    ),
                  ),
                ),
              ] else if (isPendingTab) ...[
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Accepted connection with ${item.name}')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.success,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        minimumSize: const Size(56, 32),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Accept', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                    const SizedBox(width: 4),
                    IconButton(
                      icon: const Icon(Icons.close, size: 16, color: AppColors.textSecondaryLight),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Ignored request from ${item.name}')),
                        );
                      },
                    ),
                  ],
                ),
              ] else if (isDiscoverTab) ...[
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Connection request sent to ${item.name}')),
                    );
                  },
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 13, color: Colors.white),
                  label: const Text('Connect', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    minimumSize: const Size(60, 34),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
