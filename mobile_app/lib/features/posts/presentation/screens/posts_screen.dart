import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class PostModel {
  final String id;
  final String authorName;
  final String authorHeadline;
  final String timeAgo;
  final String content;
  final List<String> tags;
  final String? linkUrl;
  final String? linkTitle;
  int likesCount;
  int commentsCount;
  bool isLiked;
  bool isSaved;

  PostModel({
    required this.id,
    required this.authorName,
    required this.authorHeadline,
    required this.timeAgo,
    required this.content,
    this.tags = const [],
    this.linkUrl,
    this.linkTitle,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.isLiked = false,
    this.isSaved = false,
  });
}

class PostsScreen extends StatefulWidget {
  const PostsScreen({super.key});

  @override
  State<PostsScreen> createState() => _PostsScreenState();
}

class _PostsScreenState extends State<PostsScreen> {
  final List<PostModel> _posts = [
    PostModel(
      id: 'post-1',
      authorName: 'Rahul Verma',
      authorHeadline: 'SDE-2 at Microsoft • Flutter & Systems',
      timeAgo: '2h ago',
      content:
          'Just launched our open-source Flutter state benchmark repository! Evaluated Riverpod vs Bloc across 10,000 active stream events. Riverpod demonstrated 35% lower widget rebuild overhead.',
      tags: ['#Flutter', '#MobileDev', '#OpenSource', '#Dart'],
      linkUrl: 'https://github.com/rahul/flutter-benchmarks',
      linkTitle: 'GitHub - rahul/flutter-benchmarks',
      likesCount: 42,
      commentsCount: 9,
      isLiked: true,
    ),
    PostModel(
      id: 'post-2',
      authorName: 'Nexus Tech Global',
      authorHeadline: 'Enterprise Recruitment Partner',
      timeAgo: '5h ago',
      content:
          'We are actively hiring 5 Lead Mobile Engineers experienced in Flutter and real-time streaming architectures. Competitive equity & remote work. Check out the job board in the GetNextIn app!',
      tags: ['#Hiring', '#FlutterJobs', '#RemoteWork'],
      likesCount: 88,
      commentsCount: 23,
    ),
  ];

  void _showCommentsSheet(PostModel post) {
    final commentController = TextEditingController();
    final comments = ['Great analysis! Riverpod 2.0 with code gen is incredible.', 'Awesome work.'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Comments (${comments.length})',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const SizedBox(height: 14),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: comments.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) => Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        comments[i],
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimaryDark),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: commentController,
                          style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 13),
                          decoration: const InputDecoration(
                            hintText: 'Add a helpful comment...',
                            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton(
                        icon: const Icon(Icons.send, color: AppColors.primaryLight),
                        onPressed: () {
                          if (commentController.text.trim().isNotEmpty) {
                            setModalState(() {
                              comments.add(commentController.text.trim());
                              commentController.clear();
                              setState(() => post.commentsCount++);
                            });
                          }
                        },
                      ),
                    ],
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
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Community Feed'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined),
            onPressed: () => context.push('/connections'),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          itemCount: _posts.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, idx) {
            final post = _posts[idx];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Author Info
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary.withOpacity(0.2),
                        child: Text(
                          post.authorName.isNotEmpty ? post.authorName[0] : 'U',
                          style: const TextStyle(
                            color: AppColors.primaryLight,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              post.authorName,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimaryDark,
                              ),
                            ),
                            Text(
                              post.authorHeadline,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondaryDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        post.timeAgo,
                        style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Post content
                  Text(
                    post.content,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimaryDark,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Tags
                  if (post.tags.isNotEmpty) ...[
                    Wrap(
                      spacing: 6,
                      children: post.tags.map((tag) {
                        return Text(
                          tag,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryLight,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 10),
                  ],

                  // Embedded Link Preview
                  if (post.linkUrl != null) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderDark),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.link, size: 16, color: AppColors.primaryLight),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              post.linkTitle ?? post.linkUrl!,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryLight,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],

                  const Divider(color: AppColors.borderDark),

                  // Action Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _actionButton(
                        icon: post.isLiked ? Icons.favorite : Icons.favorite_border,
                        color: post.isLiked ? AppColors.error : AppColors.textSecondaryDark,
                        label: '${post.likesCount}',
                        onTap: () {
                          setState(() {
                            post.isLiked = !post.isLiked;
                            post.likesCount += post.isLiked ? 1 : -1;
                          });
                        },
                      ),
                      _actionButton(
                        icon: Icons.chat_bubble_outline,
                        color: AppColors.textSecondaryDark,
                        label: '${post.commentsCount}',
                        onTap: () => _showCommentsSheet(post),
                      ),
                      _actionButton(
                        icon: post.isSaved ? Icons.bookmark : Icons.bookmark_border,
                        color: post.isSaved ? AppColors.primaryLight : AppColors.textSecondaryDark,
                        label: 'Save',
                        onTap: () {
                          setState(() => post.isSaved = !post.isSaved);
                        },
                      ),
                      _actionButton(
                        icon: Icons.share_outlined,
                        color: AppColors.textSecondaryDark,
                        label: 'Share',
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Post link copied')),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => context.push('/create-post'),
        child: const Icon(Icons.edit, color: Colors.white),
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, color: color)),
        ],
      ),
    );
  }
}
