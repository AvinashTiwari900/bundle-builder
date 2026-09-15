import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../authentication/presentation/auth_notifier.dart';
import '../../data/post_model.dart';
import '../posts_notifier.dart';
import 'media_lightbox.dart';
import 'video_post_player.dart';

class PostCard extends ConsumerStatefulWidget {
  final PostModel post;

  const PostCard({super.key, required this.post});

  @override
  ConsumerState<PostCard> createState() => _PostCardState();
}

class _PostCardState extends ConsumerState<PostCard> {
  bool _isExpanded = false;
  int _currentCarouselIndex = 0;
  int _repostCount = 0;
  bool _hasReposted = false;

  void _showCommentsBottomSheet(BuildContext context) {
    final commentController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardLight,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Consumer(
          builder: (context, ref, _) {
            final postState = ref.watch(postsNotifierProvider);
            final currentPost = postState.feedPosts.firstWhere(
              (p) => p.id == widget.post.id,
              orElse: () => widget.post,
            );
            final comments = currentPost.comments;
            final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;

            return SafeArea(
              child: Padding(
                padding: EdgeInsets.only(
                  left: 18,
                  right: 18,
                  top: 14,
                  bottom: keyboardHeight > 0 ? keyboardHeight + 10 : 18,
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Drag handle
                      Center(
                        child: Container(
                          width: 38,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.borderLight,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Comments (${comments.length})',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimaryLight,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondaryLight),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                      const Divider(color: AppColors.borderLight),

                      // Comments list
                      ConstrainedBox(
                        constraints: BoxConstraints(
                          maxHeight: keyboardHeight > 0
                              ? MediaQuery.of(context).size.height * 0.28
                              : MediaQuery.of(context).size.height * 0.45,
                        ),
                        child: comments.isEmpty
                            ? const Padding(
                                padding: EdgeInsets.symmetric(vertical: 20),
                                child: Center(
                                  child: Text(
                                    'No comments yet. Be the first to share an insight!',
                                    style: TextStyle(fontSize: 13, color: AppColors.textMutedDark),
                                  ),
                                ),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                itemCount: comments.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 10),
                                itemBuilder: (_, i) {
                                  final c = comments[i];
                                  final initial = c.authorName.isNotEmpty ? c.authorName[0].toUpperCase() : 'C';
                                  return Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: AppColors.elevatedLight,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppColors.borderLight),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            CircleAvatar(
                                              radius: 13,
                                              backgroundColor: const Color(0xFFEFF6FF),
                                              child: Text(
                                                initial,
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Text(
                                              c.authorName,
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                            ),
                                            const Spacer(),
                                            Text(
                                              _formatTimeAgo(c.createdAt),
                                              style: const TextStyle(fontSize: 10, color: AppColors.textMutedDark),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          c.content,
                                          style: const TextStyle(fontSize: 13, color: AppColors.textPrimaryLight),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ),
                      const SizedBox(height: 12),

                      // Input Bar
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: commentController,
                              decoration: InputDecoration(
                                hintText: 'Add a professional comment...',
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: AppColors.borderLight),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: AppColors.borderLight),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.send, color: AppColors.primary),
                            onPressed: () async {
                              final text = commentController.text.trim();
                              if (text.isNotEmpty) {
                                commentController.clear();
                                await ref.read(postsNotifierProvider.notifier).addComment(widget.post.id, text);
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _confirmDeletePost(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Post?'),
        content: const Text('This action cannot be undone. Are you sure you want to delete this post?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(postsNotifierProvider.notifier).deletePost(widget.post.id);
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

  void _showEditPostDialog(BuildContext context) {
    final titleController = TextEditingController(text: widget.post.title);
    final descController = TextEditingController(text: widget.post.description);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Edit Post', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.post.postType != 'Normal Post') ...[
                const Text('Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight)),
                const SizedBox(height: 6),
                TextField(
                  controller: titleController,
                  decoration: InputDecoration(
                    hintText: 'Post title...',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              const Text('Description', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight)),
              const SizedBox(height: 6),
              TextField(
                controller: descController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: 'What do you want to talk about?',
                  contentPadding: const EdgeInsets.all(12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              final newDesc = descController.text.trim();
              if (newDesc.isEmpty) return;
              Navigator.pop(ctx);
              await ref.read(postsNotifierProvider.notifier).updatePost(
                    postId: widget.post.id,
                    title: titleController.text.trim(),
                    description: newDesc,
                  );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Post updated successfully!')),
                );
              }
            },
            child: const Text('Save Changes', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildMediaImage(String rawUrl, {BoxFit fit = BoxFit.cover, double? height}) {
    if (!rawUrl.startsWith('http') && !rawUrl.startsWith('/uploads')) {
      final file = File(rawUrl);
      if (file.existsSync()) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.file(file, fit: fit, height: height, width: double.infinity),
        );
      }
    }
    final resolved = ApiEndpoints.resolveMediaUrl(rawUrl);
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        resolved,
        fit: fit,
        height: height,
        width: double.infinity,
        loadingBuilder: (context, child, progress) {
          if (progress == null) return child;
          return Container(
            height: height ?? 200,
            color: AppColors.elevatedLight,
            alignment: Alignment.center,
            child: const CircularProgressIndicator(strokeWidth: 2),
          );
        },
        errorBuilder: (_, __, ___) => Container(
          height: height ?? 200,
          color: AppColors.elevatedLight,
          alignment: Alignment.center,
          child: const Icon(Icons.broken_image_outlined, color: Colors.grey, size: 36),
        ),
      ),
    );
  }

  Widget _buildConnectionButton(BuildContext context, bool isSelf) {
    if (isSelf || widget.post.connectionStatus == 'self') return const SizedBox.shrink();

    final status = widget.post.connectionStatus;

    if (status == 'connected') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check, size: 13, color: AppColors.textSecondaryLight),
            SizedBox(width: 4),
            Text(
              'Connected',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight),
            ),
          ],
        ),
      );
    }

    if (status == 'pending_sent' || status == 'pending') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF6FF),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFBFDBFE)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.schedule, size: 13, color: AppColors.primary),
            SizedBox(width: 4),
            Text(
              'Requested',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
            ),
          ],
        ),
      );
    }

    if (status == 'pending_received') {
      return GestureDetector(
        onTap: () {
          if (widget.post.connectionId != null) {
            ref.read(postsNotifierProvider.notifier).acceptConnection(widget.post.connectionId!, widget.post.id);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Connection accepted! Added to My Connections.')),
            );
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.success,
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.person_add, size: 13, color: Colors.white),
              SizedBox(width: 4),
              Text(
                'Accept',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
        ),
      );
    }

    // Default: 'none' -> "+ Connect" button matching reference design
    return GestureDetector(
      onTap: () {
        ref.read(postsNotifierProvider.notifier).sendConnection(widget.post.authorId, widget.post.id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Connection request sent!')),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_add_alt_1_rounded, size: 15, color: Colors.white),
            SizedBox(width: 5),
            Text(
              'Connect',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes > 0 ? diff.inMinutes : 1}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final authState = ref.watch(authNotifierProvider);
    final currentUser = authState.asData?.value;
    final currentUserId = currentUser?.id;
    final isSelf = post.connectionStatus == 'self' ||
        post.authorId == 'candidate-self' ||
        (currentUserId != null && currentUserId.isNotEmpty && post.authorId == currentUserId) ||
        (currentUser?.name != null && currentUser!.name.isNotEmpty && post.authorName == currentUser.name);

    final initial = post.authorName.isNotEmpty ? post.authorName[0].toUpperCase() : 'C';
    final hasImages = post.media.any((m) => m.type == 'image');
    final images = post.media.where((m) => m.type == 'image').toList();
    final videos = post.media.where((m) => m.type == 'video').toList();

    // Long text check for "...more" expansion
    final isLongText = post.description.length > 140 || post.description.contains('\n\n');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.cardLight,
        borderRadius: BorderRadius.circular(18),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Author Details Header (Matches Reference)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 10, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Profile Avatar
                GestureDetector(
                  onTap: () => context.push('/profile'),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFEFF6FF),
                      border: Border.all(color: AppColors.borderLight, width: 1.2),
                      image: (post.authorAvatar != null && post.authorAvatar!.isNotEmpty)
                          ? DecorationImage(
                              image: NetworkImage(ApiEndpoints.resolveMediaUrl(post.authorAvatar!)),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    alignment: Alignment.center,
                    child: (post.authorAvatar == null || post.authorAvatar!.isEmpty)
                        ? Text(
                            initial,
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
                          )
                        : null,
                  ),
                ),
                const SizedBox(width: 10),

                // Name & Headline
                Expanded(
                  child: GestureDetector(
                    onTap: () => context.push('/profile'),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                post.authorName,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimaryLight,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 4),
                            // Verified Blue Badge as shown in reference
                            const Icon(
                              Icons.check_circle,
                              size: 15,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          post.authorRole.isNotEmpty ? post.authorRole : 'SDE-2 at Microsoft',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 1),
                        Row(
                          children: [
                            Text(
                              _formatTimeAgo(post.createdAt),
                              style: const TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
                            ),
                            const Text(
                              ' • ',
                              style: TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
                            ),
                            const Icon(
                              Icons.public,
                              size: 11,
                              color: AppColors.textMutedDark,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              post.visibility == 'public' ? 'Public' : 'Connections',
                              style: const TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // + Connect / Status Action Button
                _buildConnectionButton(context, isSelf),
                const SizedBox(width: 2),

                // 3-dot Overflow Menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 20, color: AppColors.textSecondaryLight),
                  onSelected: (val) {
                    if (val == 'delete') {
                      _confirmDeletePost(context);
                    } else if (val == 'edit') {
                      _showEditPostDialog(context);
                    } else if (val == 'save') {
                      ref.read(postsNotifierProvider.notifier).toggleBookmark(post.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(post.isBookmarked ? 'Post removed from saved' : 'Post saved to bookmarks')),
                      );
                    } else if (val == 'share') {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Post link copied: https://getnextin.ai/posts/${post.id}')),
                      );
                    } else if (val == 'report') {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Post reported for review')),
                      );
                    }
                  },
                  itemBuilder: (_) => [
                    if (isSelf) ...[
                      const PopupMenuItem(value: 'edit', child: Text('Edit Post', style: TextStyle(fontSize: 13))),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Delete Post', style: TextStyle(fontSize: 13, color: AppColors.error)),
                      ),
                    ] else ...[
                      PopupMenuItem(
                        value: 'save',
                        child: Text(post.isBookmarked ? 'Remove from Saved' : 'Save Post', style: const TextStyle(fontSize: 13)),
                      ),
                      const PopupMenuItem(value: 'share', child: Text('Share Link', style: TextStyle(fontSize: 13))),
                      const PopupMenuItem(value: 'report', child: Text('Report Post', style: TextStyle(fontSize: 13, color: AppColors.error))),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Title (Prominent bold heading as in reference image)
          if (post.title.isNotEmpty && post.postType != 'Normal Post')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
              child: Text(
                post.title,
                style: const TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryLight,
                  height: 1.35,
                ),
              ),
            ),

          // 2. Description with "See more" expansion
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  maxLines: _isExpanded || !isLongText ? null : 3,
                  overflow: _isExpanded || !isLongText ? TextOverflow.visible : TextOverflow.ellipsis,
                  text: TextSpan(
                    style: const TextStyle(
                      fontSize: 13.5,
                      height: 1.45,
                      color: AppColors.textPrimaryLight,
                    ),
                    children: [
                      TextSpan(
                        text: _isExpanded || !isLongText
                            ? post.description
                            : (post.description.length > 140
                                ? post.description.substring(0, 140)
                                : post.description),
                      ),
                      if (isLongText && !_isExpanded)
                        const TextSpan(
                          text: '... ',
                          style: TextStyle(color: AppColors.textSecondaryLight),
                        ),
                    ],
                  ),
                ),
                if (isLongText)
                  GestureDetector(
                    onTap: () => setState(() => _isExpanded = !_isExpanded),
                    child: Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        _isExpanded ? 'Show less' : 'See more',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Hashtags as soft light-blue pills (Matches Reference Image)
          if (post.hashtags.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                children: post.hashtags.map((tag) {
                  final displayTag = tag.startsWith('#') ? tag : '#$tag';
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.hashtagBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      displayTag,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.hashtagText,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

          // 3. Images and Videos Display
          if (hasImages) ...[
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: images.length == 1
                  ? GestureDetector(
                      onTap: () => MediaLightbox.show(
                        context,
                        imageUrl: ApiEndpoints.resolveMediaUrl(images.first.url),
                        title: post.title,
                      ),
                      child: Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxHeight: 280),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: _buildMediaImage(images.first.url),
                      ),
                    )
                  : Column(
                      children: [
                        SizedBox(
                          height: 240,
                          child: PageView.builder(
                            itemCount: images.length,
                            onPageChanged: (idx) => setState(() => _currentCarouselIndex = idx),
                            itemBuilder: (_, i) {
                              return GestureDetector(
                                onTap: () => MediaLightbox.show(
                                  context,
                                  imageUrl: ApiEndpoints.resolveMediaUrl(images[i].url),
                                  title: post.title,
                                ),
                                child: Container(
                                  margin: const EdgeInsets.only(right: 6),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.borderLight),
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: _buildMediaImage(images[i].url, height: 240),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(images.length, (idx) {
                            final active = idx == _currentCarouselIndex;
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              width: active ? 16 : 6,
                              height: 4,
                              decoration: BoxDecoration(
                                color: active ? AppColors.primary : AppColors.borderLight,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            );
                          }),
                        ),
                      ],
                    ),
            ),
          ],

          // Video player if video present
          if (videos.isNotEmpty) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: VideoPostPlayer(
                videoUrl: ApiEndpoints.resolveMediaUrl(videos.first.url),
                title: post.title.isNotEmpty ? post.title : 'Technical Video Demo',
              ),
            ),
          ],

          // 4. Project / External Link Preview Card
          if (post.links.isNotEmpty) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: post.links.map((link) {
                  final urlLower = link.url.toLowerCase();
                  final isGithub = urlLower.contains('github.com');
                  final isFigma = urlLower.contains('figma.com');
                  final isYoutube = urlLower.contains('youtube.com') || urlLower.contains('youtu.be');

                  IconData linkIcon = Icons.link_rounded;
                  if (isGithub) {
                    linkIcon = Icons.code_rounded;
                  } else if (isFigma) {
                    linkIcon = Icons.design_services_rounded;
                  } else if (isYoutube) {
                    linkIcon = Icons.play_arrow_rounded;
                  }

                  final title = link.label.isNotEmpty
                      ? link.label
                      : (isGithub ? 'GitHub Repository' : (isFigma ? 'Figma Design' : 'Project Link'));

                  final displayUrl = link.url
                      .replaceAll('https://', '')
                      .replaceAll('http://', '')
                      .replaceAll('www.', '');

                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.elevatedLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.black,
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            linkIcon,
                            size: 18,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimaryLight,
                                ),
                              ),
                              const SizedBox(height: 1),
                              Text(
                                displayUrl,
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textSecondaryLight,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.arrow_outward_rounded,
                          size: 18,
                          color: AppColors.textPrimaryLight,
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],

          const SizedBox(height: 8),
          const Divider(height: 1, color: AppColors.borderLight),

          // 5. Post Engagement Bar matching reference:
          // ♥ Like Count    💬 Comment Count    🔁 Repost Count    Save    Share
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            child: Row(
              children: [
                // 1. Like (Heart)
                _iconAction(
                  icon: post.hasLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  color: post.hasLiked ? AppColors.error : AppColors.textPrimaryLight,
                  count: '${post.likes}',
                  onTap: () => ref.read(postsNotifierProvider.notifier).toggleLike(post.id),
                ),
                const SizedBox(width: 10),

                // 2. Comment
                _iconAction(
                  icon: Icons.chat_bubble_outline_rounded,
                  color: AppColors.textPrimaryLight,
                  count: '${post.commentsCount}',
                  onTap: () => _showCommentsBottomSheet(context),
                ),
                const SizedBox(width: 10),

                // 3. Repost
                _iconAction(
                  icon: Icons.repeat_rounded,
                  color: _hasReposted ? AppColors.success : AppColors.textPrimaryLight,
                  count: '$_repostCount',
                  onTap: () {
                    setState(() {
                      _hasReposted = !_hasReposted;
                      _repostCount += _hasReposted ? 1 : -1;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(_hasReposted ? 'Post reposted to your network' : 'Repost removed')),
                    );
                  },
                ),

                const Spacer(),

                // 4. Bookmark / Save
                InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () => ref.read(postsNotifierProvider.notifier).toggleBookmark(post.id),
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      post.isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                      size: 20,
                      color: post.isBookmarked ? AppColors.primary : AppColors.textPrimaryLight,
                    ),
                  ),
                ),

                // 5. Share
                InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Post link copied: https://getnextin.ai/posts/${post.id}')),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: const Icon(
                      Icons.share_outlined,
                      size: 20,
                      color: AppColors.textPrimaryLight,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _iconAction({
    required IconData icon,
    required Color color,
    required String count,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 19, color: color),
            const SizedBox(width: 5),
            Text(
              count,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: color == AppColors.error ? AppColors.error : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
