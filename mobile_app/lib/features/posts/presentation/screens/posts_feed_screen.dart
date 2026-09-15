import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../authentication/presentation/auth_notifier.dart';
import '../../data/post_model.dart';
import '../posts_notifier.dart';
import '../widgets/post_card.dart';

class PostsFeedScreen extends ConsumerStatefulWidget {
  final bool isPersonalFeed;
  const PostsFeedScreen({super.key, this.isPersonalFeed = false});

  @override
  ConsumerState<PostsFeedScreen> createState() => _PostsFeedScreenState();
}

class _PostsFeedScreenState extends ConsumerState<PostsFeedScreen> with AutomaticKeepAliveClientMixin {
  String _selectedCategory = 'All';
  final ImagePicker _picker = ImagePicker();

  final List<String> _categories = [
    'All',
    'Case Study',
    'Project Showcase',
    'Technical',
    'Design',
  ];

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    // Ensure both feed and candidate's own posts are loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(postsNotifierProvider.notifier).loadFeed();
      ref.read(postsNotifierProvider.notifier).loadMyPosts();
    });
  }

  Future<void> _openCreateWithMedia({required bool isVideo}) async {
    try {
      if (isVideo) {
        final video = await _picker.pickVideo(source: ImageSource.gallery);
        if (video != null && mounted) {
          context.push('/create-post', extra: {'initialVideo': video});
        }
      } else {
        final images = await _picker.pickMultiImage();
        if (images.isNotEmpty && mounted) {
          context.push('/create-post', extra: {'initialImages': images});
        }
      }
    } catch (e) {
      if (mounted) {
        context.push('/create-post');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final postsState = ref.watch(postsNotifierProvider);
    final authState = ref.watch(authNotifierProvider);
    final currentUser = authState.asData?.value;
    final currentUserId = currentUser?.id;

    // Filter candidate's own posts vs platform-wide community posts
    List<PostModel> postsToFilter;

    if (widget.isPersonalFeed) {
      // STRICT personal filtering: ONLY posts published by the authenticated candidate
      final personalPostsMap = <String, PostModel>{};
      final candidateName = currentUser?.name;
      for (final p in [...postsState.myPosts, ...postsState.feedPosts]) {
        final matchesId = (currentUserId != null && currentUserId.isNotEmpty && p.authorId == currentUserId);
        final matchesStatus = p.connectionStatus == 'self' || p.authorId == 'candidate-self';
        final matchesName = (candidateName != null && candidateName.isNotEmpty && p.authorName == candidateName);
        if (matchesId || matchesStatus || matchesName) {
          personalPostsMap[p.id] = p;
        }
      }
      postsToFilter = personalPostsMap.values.toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } else {
      // Home tab: Platform-wide community feed respecting privacy and connections
      postsToFilter = postsState.feedPosts;
    }

    final filteredPosts = postsToFilter.where((p) {
      if (_selectedCategory == 'All') return true;
      if (_selectedCategory == 'Technical') {
        return p.postType.contains('Technical') || p.postType.contains('Knowledge');
      }
      return p.postType.toLowerCase().contains(_selectedCategory.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.cardLight,
        onRefresh: () async {
          if (widget.isPersonalFeed) {
            await ref.read(postsNotifierProvider.notifier).loadMyPosts();
            await ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true);
          } else {
            final filterType = _selectedCategory == 'All'
                ? null
                : (_selectedCategory == 'Technical' ? 'Technical / Knowledge Sharing' : _selectedCategory);
            await ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true, postType: filterType);
          }
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // 1. Share Something Composer Card
            SliverToBoxAdapter(
              child: _buildShareComposer(context, currentUser),
            ),

            // 2. Personal Tab Subheader or Metrics
            if (widget.isPersonalFeed && postsToFilter.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 2, 16, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'My Published Posts (${postsToFilter.length})',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimaryLight,
                        ),
                      ),
                      const Text(
                        'Visible on your profile',
                        style: TextStyle(fontSize: 11.5, color: AppColors.textSecondaryLight),
                      ),
                    ],
                  ),
                ),
              ),

            // 3. Filter Chips Row (Reference Design: All, Case Study, Project Showcase, Technical, Design >)
            SliverToBoxAdapter(
              child: _buildFilterChips(),
            ),

            // 4. Main Feed Content
            if (postsState.isLoading && filteredPosts.isEmpty)
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildSkeletonCard(),
                    childCount: 3,
                  ),
                ),
              )
            else if (postsState.errorMessage != null && filteredPosts.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _buildErrorState(postsState.errorMessage!),
              )
            else if (filteredPosts.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final post = filteredPosts[index];
                      return PostCard(post: post);
                    },
                    childCount: filteredPosts.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // "Share your thoughts, project, or update..." Composer Card matching Reference
  Widget _buildShareComposer(BuildContext context, dynamic user) {
    final name = user?.name as String? ?? 'Candidate';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'C';
    final String? avatarUrl = user?.avatarUrl ?? user?.profilePhoto;
    final resolvedAvatar = (avatarUrl != null && avatarUrl.isNotEmpty)
        ? ApiEndpoints.resolveMediaUrl(avatarUrl)
        : null;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 10),
      padding: const EdgeInsets.all(14),
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
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 19,
                backgroundColor: const Color(0xFFEFF6FF),
                backgroundImage: resolvedAvatar != null
                    ? NetworkImage(resolvedAvatar)
                    : null,
                child: resolvedAvatar == null
                    ? Text(
                        initial,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: () => context.push('/create-post'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.searchBackground,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: const Text(
                      'Share your thoughts, project, or update...',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMutedDark,
                        fontWeight: FontWeight.w400,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.borderLight),
          const SizedBox(height: 8),

          // 4 Quick action buttons: Photo, Video, Case Study, Create Post
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _composerAction(
                  icon: Icons.image_outlined,
                  color: const Color(0xFF2563EB),
                  label: 'Photo',
                  onTap: () => _openCreateWithMedia(isVideo: false),
                ),
                const SizedBox(width: 4),
                _composerAction(
                  icon: Icons.smart_display_outlined,
                  color: const Color(0xFF059669),
                  label: 'Video',
                  onTap: () => _openCreateWithMedia(isVideo: true),
                ),
                const SizedBox(width: 4),
                _composerAction(
                  icon: Icons.article_outlined,
                  color: const Color(0xFF7C3AED),
                  label: 'Case Study',
                  onTap: () => context.push('/create-post'),
                ),
                const SizedBox(width: 4),
                _composerAction(
                  icon: Icons.code_rounded,
                  color: const Color(0xFFEA580C),
                  label: 'Create Post',
                  onTap: () => context.push('/create-post'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _composerAction({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Filter Chips Row (Reference Design: Dark active pill, white inactive pill + arrow)
  Widget _buildFilterChips() {
    return Container(
      height: 40,
      margin: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(
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
                    final filterType = cat == 'All'
                        ? null
                        : (cat == 'Technical' ? 'Technical / Knowledge Sharing' : cat);
                    ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true, postType: filterType);
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 160),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF111827) : AppColors.cardLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF111827) : AppColors.borderLight,
                        width: 1,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: 14),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.cardLight,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: const Icon(
              Icons.chevron_right,
              size: 16,
              color: AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  // Skeleton Card while Loading
  Widget _buildSkeletonCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 120,
                    height: 12,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: 180,
                    height: 10,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            height: 12,
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            width: 240,
            height: 12,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            height: 140,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ],
      ),
    );
  }

  // Empty State
  Widget _buildEmptyState() {
    if (widget.isPersonalFeed) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: const BoxDecoration(
                  color: Color(0xFFEFF6FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.post_add_rounded, size: 34, color: AppColors.primary),
              ),
              const SizedBox(height: 16),
              const Text(
                'You haven\'t posted anything yet.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimaryLight),
              ),
              const SizedBox(height: 8),
              const Text(
                'Share your project showcases, case studies, or career achievements to highlight your expertise to recruiters.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, height: 1.4),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => context.push('/create-post'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.add, color: Colors.white, size: 18),
                label: const Text(
                  'Share Your First Update',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 68,
              height: 68,
              decoration: const BoxDecoration(
                color: Color(0xFFEFF6FF),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.feed_outlined, size: 34, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              _selectedCategory == 'All'
                  ? 'No posts in feed yet'
                  : 'No $_selectedCategory posts yet',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimaryLight),
            ),
            const SizedBox(height: 6),
            const Text(
              'Be the first to share a project breakthrough, technical case study, or career update on GetNextIn.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondaryLight, height: 1.4),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => context.push('/create-post'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.add, color: Colors.white, size: 18),
              label: const Text(
                'Share Your First Update',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Error State with Retry
  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: Color(0xFFFEF2F2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wifi_off_rounded, size: 32, color: AppColors.error),
            ),
            const SizedBox(height: 16),
            const Text(
              'Unable to load feed',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimaryLight),
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => ref.read(postsNotifierProvider.notifier).loadFeed(refresh: true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.refresh, color: Colors.white, size: 18),
              label: const Text('Retry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
