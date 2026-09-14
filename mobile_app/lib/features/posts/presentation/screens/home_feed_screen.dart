import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../posts_notifier.dart';
import '../widgets/post_card.dart';

class HomeFeedScreen extends ConsumerStatefulWidget {
  const HomeFeedScreen({super.key});

  @override
  ConsumerState<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends ConsumerState<HomeFeedScreen> with AutomaticKeepAliveClientMixin {
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Case Study',
    'Project Showcase',
    'Technical / Knowledge Sharing',
    'Career Update',
    'Achievement',
  ];

  @override
  bool get wantKeepAlive => true; // Preserves scroll position when navigating between bottom tabs

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final postsState = ref.watch(postsNotifierProvider);
    final posts = postsState.feedPosts.where((p) {
      if (_selectedCategory == 'All') return true;
      return p.postType == _selectedCategory;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true);
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Filter Pills Sliver
            SliverToBoxAdapter(
              child: Container(
                height: 48,
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final cat = _categories[i];
                    final isSelected = _selectedCategory == cat;
                    return GestureDetector(
                      onTap: () {
                        setState(() => _selectedCategory = cat);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF000000) : AppColors.cardLight,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF000000) : AppColors.borderLight,
                          ),
                        ),
                        child: Text(
                          cat,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textSecondaryLight,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Loading state
            if (postsState.isLoading && posts.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            // Error State
            else if (postsState.errorMessage != null && posts.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off_outlined, size: 48, color: AppColors.textMutedDark),
                        const SizedBox(height: 12),
                        const Text(
                          'Unable to load feed posts',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          postsState.errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Retry', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            // Empty State
            else if (posts.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.article_outlined, size: 52, color: AppColors.textMutedDark),
                      const SizedBox(height: 12),
                      const Text(
                        'No posts found in this category',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Try switching filters or pull down to refresh.',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                      ),
                    ],
                  ),
                ),
              )
            // Feed Post List
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final post = posts[index];
                      return PostCard(post: post);
                    },
                    childCount: posts.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
