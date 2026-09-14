import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../../authentication/presentation/auth_notifier.dart';
import '../../../posts/presentation/posts_notifier.dart';
import '../../../posts/data/post_model.dart';

class ProfileDocItem {
  final String id;
  String title;
  String category;
  String status; // 'Verified', 'Under Review', 'Action Needed', 'Uploaded'
  String date;
  final bool isSensitive;

  ProfileDocItem({
    required this.id,
    required this.title,
    required this.category,
    required this.status,
    required this.date,
    this.isSensitive = false,
  });
}

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _maskContactDetails = true;
  bool _openToOpportunities = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(postsNotifierProvider.notifier).loadFeed();
      ref.read(postsNotifierProvider.notifier).loadMyPosts();
    });
  }

  final List<ProfileDocItem> _documents = [
    ProfileDocItem(
      id: 'doc-1',
      title: 'Current Professional Resume (PDF)',
      category: 'Resume & CV',
      status: 'Verified',
      date: 'Aug 24, 2026',
    ),
    ProfileDocItem(
      id: 'doc-2',
      title: 'B.Tech Degree Certificate & Transcripts',
      category: 'Education',
      status: 'Verified',
      date: 'Aug 24, 2026',
    ),
    ProfileDocItem(
      id: 'doc-3',
      title: 'Government Identity (Aadhaar / PAN)',
      category: 'KYC & Identity',
      status: 'Verified',
      date: 'Aug 24, 2026',
      isSensitive: true,
    ),
    ProfileDocItem(
      id: 'doc-4',
      title: 'Previous Employer Experience Letter',
      category: 'Work History',
      status: 'Under Review',
      date: 'Sep 02, 2026',
      isSensitive: true,
    ),
    ProfileDocItem(
      id: 'doc-5',
      title: 'Recent Salary Slips (Last 3 Months)',
      category: 'Compensation Proof',
      status: 'Action Needed',
      date: 'Pending Upload',
      isSensitive: true,
    ),
  ];

  void _showUploadDialog({ProfileDocItem? replacingItem}) {
    final titleController = TextEditingController(text: replacingItem?.title ?? '');
    String selectedCategory = replacingItem?.category ?? 'Resume & CV';
    String fileName = replacingItem != null ? 'replacement_${replacingItem.id}.pdf' : '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceLight,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        replacingItem != null ? 'Replace Document' : 'Upload Candidate Document',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('Document Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.elevatedLight,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedCategory,
                        isExpanded: true,
                        items: const [
                          DropdownMenuItem(value: 'Resume & CV', child: Text('Resume & CV')),
                          DropdownMenuItem(value: 'Education', child: Text('Education Certificate / Transcripts')),
                          DropdownMenuItem(value: 'KYC & Identity', child: Text('KYC & Government Identity')),
                          DropdownMenuItem(value: 'Work History', child: Text('Work History / Relieving Letter')),
                          DropdownMenuItem(value: 'Compensation Proof', child: Text('Compensation / Salary Slips')),
                          DropdownMenuItem(value: 'Certifications', child: Text('Technical Certifications')),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => selectedCategory = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('Document Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    decoration: InputDecoration(
                      hintText: 'e.g., Updated Flutter Resume (PDF)',
                      filled: true,
                      fillColor: AppColors.elevatedLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.borderLight)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // File Picker
                  GestureDetector(
                    onTap: () async {
                      try {
                        final result = await FilePicker.platform.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
                        );
                        if (result != null && result.files.isNotEmpty) {
                          final picked = result.files.first;
                          setModalState(() {
                            fileName = picked.name;
                            if (titleController.text.trim().isEmpty) {
                              titleController.text = picked.name.replaceAll(RegExp(r'\.[a-zA-Z0-9]+$'), '');
                            }
                          });
                        }
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('File selection error: $e')),
                        );
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFBFDBFE), style: BorderStyle.solid),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.file_upload_outlined, color: AppColors.primary, size: 22),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              fileName.isEmpty ? 'Tap to choose PDF or Image file' : fileName,
                              style: TextStyle(
                                fontSize: 13,
                                color: fileName.isEmpty ? AppColors.primary : AppColors.textPrimaryDark,
                                fontWeight: fileName.isEmpty ? FontWeight.w500 : FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: replacingItem != null ? 'Confirm & Replace' : 'Upload & Encrypt',
                    onPressed: () {
                      final title = titleController.text.trim();
                      if (title.isEmpty) return;

                      setState(() {
                        if (replacingItem != null) {
                          replacingItem.title = title;
                          replacingItem.category = selectedCategory;
                          replacingItem.date = 'Updated Today';
                          replacingItem.status = 'Under Review';
                        } else {
                          _documents.insert(
                            0,
                            ProfileDocItem(
                              id: 'doc-${DateTime.now().millisecondsSinceEpoch}',
                              title: title,
                              category: selectedCategory,
                              status: 'Under Review',
                              date: 'Sep 13, 2026',
                            ),
                          );
                        }
                      });

                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(replacingItem != null ? 'Document replaced successfully' : 'Document uploaded & encrypted')),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _viewDocument(ProfileDocItem doc) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.description, color: AppColors.primary, size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                doc.title,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _metaRow('Category', doc.category),
            const SizedBox(height: 6),
            _metaRow('Upload Date', doc.date),
            const SizedBox(height: 6),
            _metaRow('Verification', doc.status),
            const SizedBox(height: 6),
            _metaRow('Encryption', 'AES-256 (SHA-256 Vault Encrypted)'),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              height: 90,
              decoration: BoxDecoration(
                color: AppColors.elevatedLight,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderLight),
              ),
              alignment: Alignment.center,
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.picture_as_pdf, color: AppColors.error, size: 30),
                  SizedBox(height: 4),
                  Text('Document Verified & Secured', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryDark)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _downloadDocument(doc);
            },
            child: const Text('Download'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Close', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _downloadDocument(ProfileDocItem doc) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Downloading "${doc.title}"... Saved to local files')),
    );
  }

  void _deleteDocument(ProfileDocItem doc) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Document?'),
        content: Text('Are you sure you want to remove "${doc.title}" from your profile? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _documents.removeWhere((d) => d.id == doc.id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Removed "${doc.title}"')),
              );
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
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

  Widget _buildProfilePostCard(PostModel post) {
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: post.postType == 'Case Study'
                      ? const Color(0xFFFEF3C7)
                      : (post.postType == 'Project Showcase' ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  post.postType,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    color: post.postType == 'Case Study'
                        ? const Color(0xFFD97706)
                        : (post.postType == 'Project Showcase' ? AppColors.primary : AppColors.textSecondaryDark),
                  ),
                ),
              ),
              const Spacer(),
              Text(
                _formatTimeAgo(post.createdAt),
                style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
              ),
            ],
          ),
          if (post.title.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              post.title,
              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 4),
          Text(
            post.description,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark, height: 1.35),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.thumb_up_outlined, size: 13, color: AppColors.textMutedDark),
              const SizedBox(width: 4),
              Text('${post.likes}', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryDark)),
              const SizedBox(width: 14),
              const Icon(Icons.chat_bubble_outline, size: 13, color: AppColors.textMutedDark),
              const SizedBox(width: 4),
              Text('${post.commentsCount}', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryDark)),
              if (post.media.isNotEmpty) ...[
                const SizedBox(width: 14),
                const Icon(Icons.attach_file, size: 13, color: AppColors.textMutedDark),
                const SizedBox(width: 2),
                Text('${post.media.length}', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryDark)),
              ],
              const Spacer(),
              GestureDetector(
                onTap: () => context.go('/my-posts'),
                child: const Row(
                  children: [
                    Text('Manage', style: TextStyle(fontSize: 11.5, color: AppColors.primary, fontWeight: FontWeight.w600)),
                    Icon(Icons.chevron_right, size: 15, color: AppColors.primary),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metaRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark)),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;
    final initial = (user?.name != null && user!.name.isNotEmpty)
        ? user.name.substring(0, 1).toUpperCase()
        : 'C';

    final postsState = ref.watch(postsNotifierProvider);
    final currentUserId = user?.id;
    final candidatePostsMap = <String, PostModel>{};
    for (final p in [...postsState.myPosts, ...postsState.feedPosts]) {
      final isSelf = (currentUserId != null && currentUserId.isNotEmpty && p.authorId == currentUserId) ||
          p.connectionStatus == 'self' ||
          p.authorId == 'candidate-self' ||
          (user?.name != null && user!.name.isNotEmpty && p.authorName == user.name);
      if (isSelf) {
        candidatePostsMap[p.id] = p;
      }
    }
    final candidatePosts = candidatePostsMap.values.toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return ColoredBox(
      color: AppColors.backgroundLight,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Screen Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Candidate Profile',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.settings_outlined, color: AppColors.textPrimaryDark),
                    onPressed: () => context.push('/settings'),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Profile Header Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 38,
                          backgroundColor: const Color(0xFFEFF6FF),
                          child: Text(
                            initial,
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.check, size: 12, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      user?.name ?? 'Candidate Name',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.currentRole ?? 'Senior Flutter & Full Stack Developer',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.primaryLight,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.collegeName ?? 'Indian Institute of Technology (IIT) Bombay',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                    ),
                    const SizedBox(height: 16),

                    // Contact Badges (with masking support)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.elevatedLight,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.email_outlined, size: 14, color: AppColors.textSecondaryDark),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    _maskContactDetails ? _maskEmail(user?.email ?? 'candidate@gmail.com') : (user?.email ?? 'candidate@gmail.com'),
                                    style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(width: 1, height: 16, color: AppColors.borderLight),
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.phone_outlined, size: 14, color: AppColors.textSecondaryDark),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    _maskContactDetails ? _maskPhone(user?.phone ?? '+91 9876543210') : (user?.phone ?? '+91 9876543210'),
                                    style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // ==========================================
              // PROMINENT RESUME & QUICK UPLOAD CARD
              // ==========================================
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEFF6FF), Color(0xFFF8FAFC)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.picture_as_pdf, color: AppColors.primary, size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Primary Candidate Resume',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'resume_avinash_tiwari_2026.pdf • Verified & ATS Ready',
                                style: TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD1FAE5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Active',
                            style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              final resumeDoc = _documents.firstWhere(
                                (d) => d.category.contains('Resume'),
                                orElse: () => _documents.first,
                              );
                              _viewDocument(resumeDoc);
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              side: const BorderSide(color: AppColors.primary),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.visibility_outlined, size: 16, color: AppColors.primary),
                            label: const Text('View Resume', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _showUploadDialog(),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.upload_file, size: 16, color: Colors.white),
                            label: const Text('Upload Resume', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Privacy Controls Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Open to Recruiter Inquiries',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimaryDark),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Allow verified enterprise recruiters to view your full profile',
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Switch.adaptive(
                          activeColor: AppColors.primary,
                          value: _openToOpportunities,
                          onChanged: (val) => setState(() => _openToOpportunities = val),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(color: AppColors.borderLight),
                    ),
                    Row(
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Mask Contact Info from Strangers',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimaryDark),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Show email & phone only to confirmed connections or interviewers',
                                style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Switch.adaptive(
                          activeColor: AppColors.primary,
                          value: _maskContactDetails,
                          onChanged: (val) => setState(() => _maskContactDetails = val),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // ==========================================
              // CANDIDATE POSTS & SHOWCASE SECTION
              // ==========================================
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Published Posts & Showcase',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                        ),
                        Text(
                          'Case studies, projects & technical updates (${candidatePosts.length})',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () => context.push('/create-post'),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.primary),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add, size: 14, color: AppColors.primary),
                          SizedBox(width: 4),
                          Text('+ Post', style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (candidatePosts.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.post_add_outlined, size: 36, color: AppColors.textSecondaryDark),
                      const SizedBox(height: 8),
                      const Text(
                        'You haven’t posted anything yet. Share your first update.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Publish technical articles, case studies, or showcase recent projects on your profile.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 11.5, color: AppColors.textSecondaryDark),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () => context.push('/create-post'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.add, color: Colors.white, size: 16),
                        label: const Text('Create Post', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )
              else
                ...candidatePosts.take(3).map((post) => _buildProfilePostCard(post)),

              if (candidatePosts.length > 3)
                Padding(
                  padding: const EdgeInsets.only(top: 4, bottom: 8),
                  child: Center(
                    child: TextButton.icon(
                      onPressed: () => context.go('/my-posts'),
                      icon: const Icon(Icons.grid_view, size: 15, color: AppColors.primary),
                      label: Text(
                        'View all ${candidatePosts.length} posts in Posts tab',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 24),

              // ==========================================
              // 5. DOCUMENTS WITHIN PROFILE SECTION
              // ==========================================
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Candidate Documents',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                        ),
                        Text(
                          'Encrypted credentials & resumes (${_documents.length})',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      InkWell(
                        onTap: () => context.push('/documents'),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.elevatedLight,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.folder_open, size: 14, color: AppColors.textPrimaryDark),
                              SizedBox(width: 4),
                              Text('All Docs', style: TextStyle(fontSize: 12, color: AppColors.textPrimaryDark, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () => _showUploadDialog(),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.upload_file, size: 14, color: Colors.white),
                              SizedBox(width: 4),
                              Text('Upload', style: TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Document Cards
              ..._documents.map((doc) => Container(
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
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: doc.category.contains('Resume')
                                    ? const Color(0xFFEFF6FF)
                                    : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                doc.category.contains('Resume')
                                    ? Icons.picture_as_pdf_outlined
                                    : doc.category.contains('Identity')
                                        ? Icons.verified_user_outlined
                                        : Icons.description_outlined,
                                color: doc.category.contains('Resume')
                                    ? AppColors.primary
                                    : AppColors.textPrimaryDark,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    doc.title,
                                    style: const TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimaryDark,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${doc.category} • ${doc.date}',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                                  ),
                                ],
                              ),
                            ),
                            StatusBadge(
                              status: doc.status,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Divider(height: 1, color: AppColors.borderLight),
                        const SizedBox(height: 8),

                        // Action Buttons: View, Replace, Download, Delete
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton.icon(
                              onPressed: () => _viewDocument(doc),
                              icon: const Icon(Icons.visibility_outlined, size: 14),
                              label: const Text('View', style: TextStyle(fontSize: 11)),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                minimumSize: const Size(50, 28),
                              ),
                            ),
                            TextButton.icon(
                              onPressed: () => _showUploadDialog(replacingItem: doc),
                              icon: const Icon(Icons.sync, size: 14),
                              label: const Text('Replace', style: TextStyle(fontSize: 11)),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                minimumSize: const Size(60, 28),
                              ),
                            ),
                            TextButton.icon(
                              onPressed: () => _downloadDocument(doc),
                              icon: const Icon(Icons.download_outlined, size: 14),
                              label: const Text('Download', style: TextStyle(fontSize: 11)),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                minimumSize: const Size(60, 28),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                              onPressed: () => _deleteDocument(doc),
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 24),

              // Skills section
              const Text(
                'Core Technical Skills',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Flutter',
                  'Dart',
                  'React',
                  'TypeScript',
                  'Node.js',
                  'PostgreSQL',
                  'Docker',
                  'Git',
                  'REST APIs',
                  'System Design',
                ]
                    .map(
                      (skill) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Text(
                          skill,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimaryDark),
                        ),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 24),

              // Education Card
              const Text(
                'Education',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.school_outlined, color: AppColors.primaryLight, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.collegeName ?? 'Indian Institute of Technology (IIT) Bombay',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'B.Tech in Computer Science & Engineering',
                            style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            '2021 - 2025 • GPA 8.8 / 10',
                            style: TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Sign Out Button
              CustomButton(
                text: 'Sign Out',
                variant: ButtonVariant.outline,
                icon: Icons.logout,
                onPressed: () async {
                  await ref.read(authNotifierProvider.notifier).logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      );
    }

  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final name = parts[0];
    if (name.length <= 2) return email;
    return '${name.substring(0, 2)}••••@${parts[1]}';
  }

  String _maskPhone(String phone) {
    if (phone.length <= 4) return phone;
    return '${phone.substring(0, 4)}••••••${phone.substring(phone.length - 2)}';
  }
}
