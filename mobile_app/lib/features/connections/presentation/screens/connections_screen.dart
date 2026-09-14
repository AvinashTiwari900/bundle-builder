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

  const CandidateContact({
    required this.id,
    required this.name,
    required this.role,
    required this.collegeOrCompany,
    this.isConnected = false,
    this.isPending = false,
    required this.email,
    required this.phone,
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
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final connected = _allCandidates.where((c) => c.isConnected).toList();
    final pending = _allCandidates.where((c) => c.isPending).toList();
    final discover = _allCandidates.where((c) => !c.isConnected && !c.isPending).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Candidate Network'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primaryLight,
          unselectedLabelColor: AppColors.textSecondaryDark,
          tabs: [
            Tab(text: 'Connected (${connected.length})'),
            Tab(text: 'Pending (${pending.length})'),
            Tab(text: 'Discover (${discover.length})'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildList(connected, isConnectedTab: true),
            _buildList(pending, isPendingTab: true),
            _buildList(discover, isDiscoverTab: true),
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
        child: Text(
          'No contacts in this list',
          style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, idx) {
        final item = list[idx];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderDark),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primary.withOpacity(0.2),
                child: Text(
                  item.name[0],
                  style: const TextStyle(
                    color: AppColors.primaryLight,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.role,
                      style: const TextStyle(fontSize: 12, color: AppColors.primaryLight),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.collegeOrCompany,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                    ),
                  ],
                ),
              ),
              if (isConnectedTab)
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline, color: AppColors.primaryLight),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Starting chat with ${item.name}')),
                    );
                  },
                )
              else if (isPendingTab)
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Accepted connection with ${item.name}')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    minimumSize: const Size(60, 36),
                  ),
                  child: const Text('Accept', style: TextStyle(fontSize: 12)),
                )
              else if (isDiscoverTab)
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Connection request sent to ${item.name}')),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    minimumSize: const Size(70, 36),
                  ),
                  child: const Text('Connect', style: TextStyle(fontSize: 12)),
                ),
            ],
          ),
        );
      },
    );
  }
}
