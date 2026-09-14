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
                            color: AppColors.textPrimaryDark,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondaryDark),
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
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  c.authorName,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppColors.textPrimaryDark,
                                                  ),
                                                ),
                                                if (c.authorRole.isNotEmpty)
                                                  Text(
                                                    c.authorRole,
                                                    style: const TextStyle(
                                                      fontSize: 10,
                                                      color: AppColors.textSecondaryDark,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        c.content,
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          color: AppColors.textPrimaryDark,
                                          height: 1.35,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),
                    const SizedBox(height: 12),

                    // Comment Input Box
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: commentController,
                            decoration: InputDecoration(
                              hintText: 'Add an insightful comment...',
                              hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMutedDark),
                              filled: true,
                              fillColor: AppColors.elevatedLight,
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
                const Text('Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark)),
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
              const Text('Description', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark)),
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
        return Image.file(file, fit: fit, height: height, width: double.infinity);
      }
    }
    final resolved = ApiEndpoints.resolveMediaUrl(rawUrl);
    return Image.network(
      resolved,
      fit: fit,
      height: height,
      width: double.infinity,
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Container(
          height: height ?? 180,
          color: AppColors.elevatedLight,
          alignment: Alignment.center,
          child: const CircularProgressIndicator(strokeWidth: 2),
        );
      },
      errorBuilder: (_, __, ___) => Container(
        height: height ?? 180,
        color: Colors.grey[200],
        alignment: Alignment.center,
        child: const Icon(Icons.broken_image_outlined, color: Colors.grey, size: 36),
      ),
    );
  }

  Widget _buildConnectionButton(BuildContext context, bool isSelf) {
    if (isSelf || widget.post.connectionStatus == 'self') return const SizedBox.shrink();

    final status = widget.post.connectionStatus;

    if (status == 'connected') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check, size: 12, color: AppColors.textSecondaryDark),
            SizedBox(width: 4),
            Text(
              'Connected',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark),
            ),
          ],
        ),
      );
    }

    if (status == 'pending_sent') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF6FF),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.schedule, size: 12, color: AppColors.primary),
            SizedBox(width: 4),
            Text(
              'Pending',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.success,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.person_add, size: 12, color: Colors.white),
              SizedBox(width: 4),
              Text(
                'Accept',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
        ),
      );
    }

    // Default: 'none' -> Show + Connect button
    return GestureDetector(
      onTap: () {
        ref.read(postsNotifierProvider.notifier).sendConnection(widget.post.authorId, widget.post.id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Connection request sent!')),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.primary),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.add, size: 13, color: AppColors.primary),
            SizedBox(width: 3),
            Text(
              'Connect',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
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

    // Check if description is long enough to warrant "...more"
    final isLongText = post.description.length > 150 || post.description.contains('\n\n');

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.cardLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Author Details Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Profile Avatar (Tap to open profile)
                GestureDetector(
                  onTap: () => context.push('/profile'),
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: const Color(0xFFEFF6FF),
                    backgroundImage: (post.authorAvatar != null && post.authorAvatar!.isNotEmpty)
                        ? NetworkImage(ApiEndpoints.resolveMediaUrl(post.authorAvatar!))
                        : null,
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
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimaryDark,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                post.visibility == 'public' ? 'Public' : 'Connections',
                                style: const TextStyle(fontSize: 9.5, color: AppColors.textMutedDark, fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          post.authorRole.isNotEmpty ? post.authorRole : 'Candidate Community',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          _formatTimeAgo(post.createdAt),
                          style: const TextStyle(fontSize: 10, color: AppColors.textMutedDark),
                        ),
                      ],
                    ),
                  ),
                ),

                // + Connect / Status Action Button
                _buildConnectionButton(context, isSelf),
                const SizedBox(width: 4),

                // 3-dot Overflow Menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 18, color: AppColors.textSecondaryDark),
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

          // Title (if present or Showcase/Case Study)
          if (post.title.isNotEmpty && post.postType != 'Normal Post')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
              child: Text(
                post.title,
                style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              ),
            ),

          // 2. Description with "...more" preview expansion
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  post.description,
                  style: const TextStyle(
                    fontSize: 13.5,
                    height: 1.45,
                    color: AppColors.textPrimaryDark,
                  ),
                  maxLines: _isExpanded || !isLongText ? null : 3,
                  overflow: _isExpanded || !isLongText ? TextOverflow.visible : TextOverflow.ellipsis,
                ),
                if (isLongText)
                  GestureDetector(
                    onTap: () => setState(() => _isExpanded = !_isExpanded),
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        _isExpanded ? 'Show less' : '...more',
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Hashtags
          if (post.hashtags.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                children: post.hashtags.map((tag) {
                  return Text(
                    tag,
                    style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w500),
                  );
                }).toList(),
              ),
            ),

          // 3. Images and Videos Display
          if (hasImages) ...[
            const SizedBox(height: 8),
            if (images.length == 1)
              GestureDetector(
                onTap: () => MediaLightbox.show(
                  context,
                  imageUrl: ApiEndpoints.resolveMediaUrl(images.first.url),
                  title: post.title,
                ),
                child: Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxHeight: 320),
                  child: _buildMediaImage(images.first.url),
                ),
              )
            else ...[
              // Multi-image Carousel
              SizedBox(
                height: 260,
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
                      child: _buildMediaImage(images[i].url, height: 260),
                    );
                  },
                ),
              ),
              // Dots indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(images.length, (idx) {
                  final active = idx == _currentCarouselIndex;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3, vertical: 6),
                    width: active ? 16 : 6,
                    height: 5,
                    decoration: BoxDecoration(
                      color: active ? AppColors.primary : AppColors.borderLight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
            ],
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

          // Embedded Links preview
          if (post.links.isNotEmpty) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: post.links.map((link) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.link, size: 16, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            link.label.isNotEmpty ? link.label : link.url,
                            style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const Icon(Icons.open_in_new, size: 14, color: AppColors.textMutedDark),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],

          const SizedBox(height: 10),

          // 4. Engagement Counts (Reactions & Comments)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.thumb_up, size: 10, color: Colors.white),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${post.likes}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => _showCommentsBottomSheet(context),
                  child: Text(
                    '${post.commentsCount} comments',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.borderLight),

          // 5. Action Buttons (Like, Comment, Share)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // Like
                _actionItem(
                  icon: post.hasLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                  color: post.hasLiked ? AppColors.primary : AppColors.textSecondaryDark,
                  label: 'Like',
                  onTap: () {
                    ref.read(postsNotifierProvider.notifier).toggleLike(post.id);
                  },
                ),
                // Comment
                _actionItem(
                  icon: Icons.chat_bubble_outline,
                  color: AppColors.textSecondaryDark,
                  label: 'Comment',
                  onTap: () => _showCommentsBottomSheet(context),
                ),
                // Bookmark / Save
                _actionItem(
                  icon: post.isBookmarked ? Icons.bookmark : Icons.bookmark_outline,
                  color: post.isBookmarked ? AppColors.primary : AppColors.textSecondaryDark,
                  label: post.isBookmarked ? 'Saved' : 'Save',
                  onTap: () {
                    ref.read(postsNotifierProvider.notifier).toggleBookmark(post.id);
                  },
                ),
                // Share
                _actionItem(
                  icon: Icons.share_outlined,
                  color: AppColors.textSecondaryDark,
                  label: 'Share',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Post link copied: https://getnextin.ai/posts/${post.id}')),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionItem({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
