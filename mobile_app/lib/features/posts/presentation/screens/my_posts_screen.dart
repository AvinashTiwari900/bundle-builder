import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../posts_notifier.dart';

class MyPostsScreen extends ConsumerStatefulWidget {
  const MyPostsScreen({super.key});

  @override
  ConsumerState<MyPostsScreen> createState() => _MyPostsScreenState();
}

class _MyPostsScreenState extends ConsumerState<MyPostsScreen> {
  void _confirmDeletePost(String postId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Post?'),
        content: const Text('This action cannot be undone. Are you sure you want to remove this post?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(postsNotifierProvider.notifier).deletePost(postId);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Post deleted successfully')),
              );
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final postsState = ref.watch(postsNotifierProvider);
    // Combine myPosts or user-authored posts
    final myPosts = postsState.myPosts.isNotEmpty
        ? postsState.myPosts
        : postsState.feedPosts.where((p) => p.connectionStatus == 'self' || p.authorId == 'candidate-self').toList();

    // Compute dynamic analytics
    final totalViews = myPosts.fold<int>(0, (sum, p) => sum + p.viewsCount);
    final totalLikes = myPosts.fold<int>(0, (sum, p) => sum + p.likes);

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await ref.read(postsNotifierProvider.notifier).loadMyPosts();
          await ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true);
        },
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          children: [
            // Header & Create Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'My Posts & Case Studies',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Manage your technical articles & updates (${myPosts.length})',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => context.push('/create-post'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  icon: const Icon(Icons.add, size: 16, color: Colors.white),
                  label: const Text(
                    'New Post',
                    style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),



            // Analytics Overview Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _metricItem('Published', '${myPosts.length}'),
                  Container(width: 1, height: 32, color: AppColors.borderLight),
                  _metricItem('Total Views', totalViews > 0 ? '$totalViews' : '0'),
                  Container(width: 1, height: 32, color: AppColors.borderLight),
                  _metricItem('Reactions', '$totalLikes'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Post Management List
            if (myPosts.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.post_add, size: 48, color: AppColors.textMutedDark),
                    const SizedBox(height: 12),
                    const Text('No posts published yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 6),
                    const Text(
                      'Share your first project, engineering case study, or certification.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                    ),
                    const SizedBox(height: 16),
                    CustomButton(text: 'Create First Post', onPressed: () => context.push('/create-post')),
                  ],
                ),
              )
            else
              ...List.generate(myPosts.length, (idx) {
                final post = myPosts[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              post.postType,
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ),
                          PopupMenuButton<String>(
                            icon: const Icon(Icons.more_horiz, size: 18, color: AppColors.textSecondaryDark),
                            onSelected: (val) {
                              if (val == 'delete') _confirmDeletePost(post.id);
                              if (val == 'share') {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Post link copied: https://getnextin.ai/posts/${post.id}')),
                                );
                              }
                            },
                            itemBuilder: (_) => [
                              const PopupMenuItem(value: 'share', child: Text('Share Link', style: TextStyle(fontSize: 13))),
                              const PopupMenuItem(
                                value: 'delete',
                                child: Text('Delete Post', style: TextStyle(fontSize: 13, color: AppColors.error)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (post.title.isNotEmpty) ...[
                        Text(
                          post.title,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                        ),
                        const SizedBox(height: 4),
                      ],
                      Text(
                        post.description,
                        style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondaryDark, height: 1.4),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Text(
                            '${post.createdAt.day}/${post.createdAt.month}/${post.createdAt.year}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.visibility_outlined, size: 14, color: AppColors.textMutedDark),
                          const SizedBox(width: 4),
                          Text('${post.viewsCount}', style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark)),
                          const SizedBox(width: 12),
                          const Icon(Icons.thumb_up_outlined, size: 14, color: AppColors.textMutedDark),
                          const SizedBox(width: 4),
                          Text('${post.likes}', style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark)),
                          const SizedBox(width: 12),
                          const Icon(Icons.chat_bubble_outline, size: 14, color: AppColors.textMutedDark),
                          const SizedBox(width: 4),
                          Text('${post.commentsCount}', style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark)),
                        ],
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _metricItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark)),
      ],
    );
  }
}
