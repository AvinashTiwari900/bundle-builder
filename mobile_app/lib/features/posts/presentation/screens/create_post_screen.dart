import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../authentication/presentation/auth_notifier.dart';
import '../../data/post_model.dart';
import '../../data/post_repository.dart';
import '../posts_notifier.dart';
import '../widgets/post_card.dart';

class CreatePostScreen extends ConsumerStatefulWidget {
  final List<XFile>? initialImages;
  final XFile? initialVideo;

  const CreatePostScreen({
    super.key,
    this.initialImages,
    this.initialVideo,
  });

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _tagController = TextEditingController();
  final _linkLabelController = TextEditingController();
  final _linkUrlController = TextEditingController();

  String _selectedPostType = 'Normal Post';
  String _selectedVisibility = 'public'; // public, connections, private

  final List<String> _postTypes = [
    'Normal Post',
    'Project Showcase',
    'Case Study',
    'Achievement',
    'Career Update',
    'Technical / Knowledge Sharing',
  ];

  final List<String> _tags = [];
  final List<PostLinkModel> _links = [];
  final List<XFile> _selectedMedia = [];
  bool _isVideo = false;

  bool _showLinksInput = false;
  bool _showTagInput = false;
  bool _isPreviewMode = false;
  bool _isPublishing = false;
  double _uploadProgress = 0.0;
  String _uploadStatusMessage = '';

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    if (widget.initialImages != null && widget.initialImages!.isNotEmpty) {
      _selectedMedia.addAll(widget.initialImages!);
      _isVideo = false;
    } else if (widget.initialVideo != null) {
      _selectedMedia.add(widget.initialVideo!);
      _isVideo = true;
    }

    _descController.addListener(() => setState(() {}));
    _titleController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _tagController.dispose();
    _linkLabelController.dispose();
    _linkUrlController.dispose();
    super.dispose();
  }

  bool get _canPublish {
    final hasText = _descController.text.trim().isNotEmpty;
    final hasMedia = _selectedMedia.isNotEmpty;
    return (hasText || hasMedia) && !_isPublishing;
  }

  // 1. Pick Multiple Images from Gallery with format & size validation
  Future<void> _pickMultiImages() async {
    try {
      final images = await _picker.pickMultiImage(imageQuality: 85);
      if (images.isNotEmpty) {
        final List<XFile> valid = [];
        for (final img in images) {
          final ext = img.name.split('.').last.toLowerCase();
          if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext)) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Skipping ${img.name}: unsupported format. Use JPG, PNG, WEBP or GIF.')),
              );
            }
            continue;
          }
          final length = await img.length();
          if (length > 20 * 1024 * 1024) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Skipping ${img.name}: file exceeds 20MB limit.')),
              );
            }
            continue;
          }
          valid.add(img);
        }

        if (valid.isNotEmpty) {
          setState(() {
            if (_isVideo) {
              _selectedMedia.clear(); // Switch from video to images
              _isVideo = false;
            }
            _selectedMedia.addAll(valid);
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting photos: $e')),
        );
      }
    }
  }

  // 2. Pick Video from Gallery with format & size validation
  Future<void> _pickVideo() async {
    try {
      final video = await _picker.pickVideo(source: ImageSource.gallery);
      if (video != null) {
        final ext = video.name.split('.').last.toLowerCase();
        if (!['mp4', 'mov', 'avi', 'webm', 'mkv'].contains(ext)) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Unsupported video format. Please select MP4, MOV, AVI, WEBM, or MKV.')),
            );
          }
          return;
        }

        final length = await video.length();
        if (length > 100 * 1024 * 1024) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Video exceeds 100MB limit. Please choose a smaller video file.')),
            );
          }
          return;
        }

        setState(() {
          _selectedMedia.clear(); // 1 video per post
          _selectedMedia.add(video);
          _isVideo = true;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting video: $e')),
        );
      }
    }
  }

  // 3. Capture Photo from Camera with Permission Check
  Future<void> _captureFromCamera() async {
    try {
      final status = await Permission.camera.request();
      if (status.isPermanentlyDenied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Camera permission is disabled. Please enable it in App Settings.'),
              action: SnackBarAction(label: 'Settings', onPressed: openAppSettings),
            ),
          );
        }
        return;
      }

      if (status.isDenied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Camera permission was denied.')),
          );
        }
        return;
      }

      final image = await _picker.pickImage(source: ImageSource.camera, imageQuality: 85);
      if (image != null) {
        setState(() {
          if (_isVideo) {
            _selectedMedia.clear();
            _isVideo = false;
          }
          _selectedMedia.add(image);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error accessing camera: $e')),
        );
      }
    }
  }

  void _addLink() {
    final label = _linkLabelController.text.trim();
    final url = _linkUrlController.text.trim();
    if (url.isNotEmpty) {
      setState(() {
        _links.add(PostLinkModel(
          label: label.isNotEmpty ? label : url,
          url: url.startsWith('http') ? url : 'https://$url',
        ));
        _linkLabelController.clear();
        _linkUrlController.clear();
        _showLinksInput = false;
      });
    }
  }

  void _addTag() {
    final tag = _tagController.text.trim();
    if (tag.isNotEmpty) {
      final clean = tag.startsWith('#') ? tag : '#$tag';
      if (!_tags.contains(clean)) {
        setState(() {
          _tags.add(clean);
          _tagController.clear();
          _showTagInput = false;
        });
      }
    }
  }

  // 4. Real media file uploads and post publishing
  Future<void> _publishPost() async {
    final desc = _descController.text.trim();
    if (desc.isEmpty && _selectedMedia.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter post text or attach a photo/video.')),
      );
      return;
    }

    setState(() {
      _isPublishing = true;
      _uploadProgress = 0.05;
      _uploadStatusMessage = _selectedMedia.isNotEmpty ? 'Uploading media (0/${_selectedMedia.length})...' : 'Publishing post...';
    });

    final List<PostMediaModel> uploadedMedia = [];
    final totalFiles = _selectedMedia.length;

    // Upload files sequentially with progress tracking
    for (int i = 0; i < totalFiles; i++) {
      final file = _selectedMedia[i];
      setState(() {
        _uploadStatusMessage = 'Uploading ${file.name} (${i + 1}/$totalFiles)...';
      });

      try {
        final mediaModel = await ref.read(postRepositoryProvider).uploadMedia(
          file,
          onProgress: (sent, total) {
            if (mounted && total > 0) {
              final fileProgress = sent / total;
              final overall = (i + fileProgress) / totalFiles;
              setState(() => _uploadProgress = (overall * 0.85) + 0.05);
            }
          },
        );
        uploadedMedia.add(mediaModel);
      } catch (e) {
        if (mounted) {
          setState(() {
            _isPublishing = false;
            _uploadProgress = 0.0;
            _uploadStatusMessage = '';
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to upload ${file.name}: $e'),
              backgroundColor: AppColors.error,
              action: SnackBarAction(
                label: 'Retry',
                textColor: Colors.white,
                onPressed: _publishPost,
              ),
            ),
          );
        }
        return; // Preserve draft content so user doesn't lose text/media
      }
    }

    if (mounted) {
      setState(() {
        _uploadProgress = 0.95;
        _uploadStatusMessage = 'Finalizing post on GetnextIn...';
      });
    }

    try {
      await ref.read(postsNotifierProvider.notifier).createPost(
            title: _titleController.text.trim(),
            description: desc,
            postType: _selectedPostType,
            hashtags: _tags,
            links: _links,
            media: uploadedMedia,
            visibility: _selectedVisibility,
          );

      if (mounted) {
        setState(() {
          _isPublishing = false;
          _uploadProgress = 1.0;
        });
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Post published successfully to your profile & feed!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isPublishing = false;
          _uploadProgress = 0.0;
          _uploadStatusMessage = '';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to publish post: $e'),
            backgroundColor: AppColors.error,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: _publishPost,
            ),
          ),
        );
      }
    }
  }

  PostModel _generatePreviewModel(String authorName, String role) {
    return PostModel(
      id: 'preview',
      authorId: 'self',
      authorName: authorName,
      authorRole: role,
      postType: _selectedPostType,
      title: _titleController.text.trim(),
      description: _descController.text.trim().isNotEmpty
          ? _descController.text.trim()
          : 'Preview of your post description will appear here...',
      hashtags: _tags,
      links: _links,
      media: _selectedMedia.map((file) {
        return PostMediaModel(
          id: 'med-preview-${file.name}',
          type: _isVideo ? 'video' : 'image',
          url: file.path,
          name: file.name,
        );
      }).toList(),
      visibility: _selectedVisibility,
      createdAt: DateTime.now(),
      connectionStatus: 'self',
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;
    final authorName = user?.name ?? 'Candidate';
    final role = user?.currentRole ?? 'Software Engineer';
    final initial = authorName.isNotEmpty ? authorName[0].toUpperCase() : 'C';

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('Create Post'),
        actions: [
          // Preview Mode Toggle Button
          IconButton(
            icon: Icon(
              _isPreviewMode ? Icons.edit_note : Icons.visibility_outlined,
              color: AppColors.primary,
            ),
            tooltip: _isPreviewMode ? 'Back to Editor' : 'Preview Post',
            onPressed: () => setState(() => _isPreviewMode = !_isPreviewMode),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: TextButton(
              onPressed: _canPublish ? _publishPost : null,
              style: TextButton.styleFrom(
                backgroundColor: _canPublish ? AppColors.primary : AppColors.borderLight,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: _isPublishing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : Text(
                      'Publish',
                      style: TextStyle(
                        color: _canPublish ? Colors.white : AppColors.textMutedDark,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Upload Progress Bar
            if (_isPublishing) ...[
              LinearProgressIndicator(
                value: _uploadProgress,
                backgroundColor: AppColors.borderLight,
                color: AppColors.primary,
                minHeight: 4,
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                color: const Color(0xFFEFF6FF),
                child: Text(
                  _uploadStatusMessage,
                  style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600),
                ),
              ),
            ],

            Expanded(
              child: _isPreviewMode
                  ? SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.info_outline, size: 16, color: AppColors.primary),
                                SizedBox(width: 8),
                                Text(
                                  'Post Preview Mode (as seen by community)',
                                  style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          PostCard(post: _generatePreviewModel(authorName, role)),
                        ],
                      ),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Candidate Author Header
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundColor: const Color(0xFFEFF6FF),
                                child: Text(
                                  initial,
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      authorName,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.textPrimaryDark,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    // Visibility Selector Chip
                                    GestureDetector(
                                      onTap: () => _showVisibilitySheet(context),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.elevatedLight,
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: AppColors.borderLight),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              _selectedVisibility == 'public'
                                                  ? Icons.public
                                                  : (_selectedVisibility == 'connections' ? Icons.people : Icons.lock),
                                              size: 12,
                                              color: AppColors.textSecondaryDark,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              _selectedVisibility == 'public'
                                                  ? 'Public'
                                                  : (_selectedVisibility == 'connections' ? 'Connections Only' : 'Private'),
                                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                                            ),
                                            const SizedBox(width: 2),
                                            const Icon(Icons.arrow_drop_down, size: 14, color: AppColors.textSecondaryDark),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Post Type Selector Dropdown
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceLight,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedPostType,
                                isExpanded: true,
                                icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.primary),
                                items: _postTypes.map((type) {
                                  return DropdownMenuItem(
                                    value: type,
                                    child: Text(
                                      type,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                    ),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedPostType = val);
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Optional Title field (for Case Study, Showcase, etc.)
                          if (_selectedPostType != 'Normal Post') ...[
                            TextField(
                              controller: _titleController,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimaryDark),
                              decoration: InputDecoration(
                                hintText: 'Enter title (e.g. Scalable Cache Architecture)...',
                                hintStyle: const TextStyle(fontSize: 14, color: AppColors.textMutedDark),
                                filled: true,
                                fillColor: AppColors.surfaceLight,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
                            const SizedBox(height: 14),
                          ],

                          // Description input
                          TextField(
                            controller: _descController,
                            maxLines: null,
                            minLines: 6,
                            style: const TextStyle(fontSize: 14.5, height: 1.45, color: AppColors.textPrimaryDark),
                            decoration: const InputDecoration(
                              hintText: 'Share a project breakthrough, engineering case study, or career update...',
                              hintStyle: TextStyle(fontSize: 14, color: AppColors.textMutedDark),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),

                          // Attached Media Previews
                          if (_selectedMedia.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Text(
                              _isVideo ? 'Attached Video (1)' : 'Attached Photos (${_selectedMedia.length})',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryDark),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: _selectedMedia.map((file) {
                                return Stack(
                                  children: [
                                    Container(
                                      width: 100,
                                      height: 100,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: AppColors.borderLight),
                                        image: !_isVideo
                                            ? DecorationImage(
                                                image: FileImage(File(file.path)),
                                                fit: BoxFit.cover,
                                              )
                                            : null,
                                        color: Colors.black87,
                                      ),
                                      alignment: Alignment.center,
                                      child: _isVideo
                                          ? const Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Icon(Icons.videocam, color: Colors.white, size: 36),
                                                SizedBox(height: 4),
                                                Text(
                                                  'Video',
                                                  style: TextStyle(color: Colors.white70, fontSize: 10),
                                                ),
                                              ],
                                            )
                                          : null,
                                    ),
                                    Positioned(
                                      top: 4,
                                      right: 4,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() => _selectedMedia.remove(file));
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(
                                            color: Colors.black87,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.close, size: 12, color: Colors.white),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              }).toList(),
                            ),
                          ],

                          // Tags list & Input
                          if (_tags.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: _tags.map((tag) {
                                return Chip(
                                  label: Text(tag, style: const TextStyle(fontSize: 11, color: AppColors.primary)),
                                  backgroundColor: const Color(0xFFEFF6FF),
                                  deleteIcon: const Icon(Icons.close, size: 14, color: AppColors.primary),
                                  onDeleted: () => setState(() => _tags.remove(tag)),
                                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  visualDensity: VisualDensity.compact,
                                );
                              }).toList(),
                            ),
                          ],

                          if (_showTagInput) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _tagController,
                                    decoration: const InputDecoration(
                                      hintText: 'e.g. Flutter, Dart, SystemDesign',
                                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    ),
                                    onSubmitted: (_) => _addTag(),
                                  ),
                                ),
                                TextButton(onPressed: _addTag, child: const Text('Add Tag')),
                              ],
                            ),
                          ],

                          // Links list & Input
                          if (_links.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            ..._links.map((l) => Container(
                                  margin: const EdgeInsets.only(bottom: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.elevatedLight,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.borderLight),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.link, size: 16, color: AppColors.primary),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          '${l.label} (${l.url})',
                                          style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      IconButton(
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                        icon: const Icon(Icons.close, size: 16, color: AppColors.textMutedDark),
                                        onPressed: () => setState(() => _links.remove(l)),
                                      ),
                                    ],
                                  ),
                                )),
                          ],

                          if (_showLinksInput) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.elevatedLight,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.borderLight),
                              ),
                              child: Column(
                                children: [
                                  TextField(
                                    controller: _linkLabelController,
                                    decoration: const InputDecoration(hintText: 'Link Label (e.g. GitHub Repo)'),
                                  ),
                                  const SizedBox(height: 8),
                                  TextField(
                                    controller: _linkUrlController,
                                    decoration: const InputDecoration(hintText: 'https://...'),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      TextButton(
                                        onPressed: () => setState(() => _showLinksInput = false),
                                        child: const Text('Cancel'),
                                      ),
                                      ElevatedButton(
                                        onPressed: _addLink,
                                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                                        child: const Text('Attach Link', style: TextStyle(color: Colors.white)),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
            ),

            // Bottom Toolbar for Attachments (Image, Camera, Video, Link, Tag)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: AppColors.surfaceLight,
                border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                    tooltip: 'Add Images (Gallery)',
                    onPressed: _pickMultiImages,
                  ),
                  IconButton(
                    icon: const Icon(Icons.camera_alt_outlined, color: Color(0xFF059669)),
                    tooltip: 'Take Photo (Camera)',
                    onPressed: _captureFromCamera,
                  ),
                  IconButton(
                    icon: const Icon(Icons.videocam_outlined, color: Color(0xFFD97706)),
                    tooltip: 'Add Video (Gallery)',
                    onPressed: _pickVideo,
                  ),
                  IconButton(
                    icon: const Icon(Icons.link, color: Color(0xFF2563EB)),
                    tooltip: 'Attach Link',
                    onPressed: () => setState(() => _showLinksInput = !_showLinksInput),
                  ),
                  IconButton(
                    icon: const Icon(Icons.tag, color: Color(0xFF7C3AED)),
                    tooltip: 'Add Hashtag',
                    onPressed: () => setState(() => _showTagInput = !_showTagInput),
                  ),
                  const Spacer(),
                  // Character count
                  Text(
                    '${_descController.text.length} chars',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVisibilitySheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceLight,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Who can view your post?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.public, color: AppColors.primary),
                title: const Text('Public'),
                subtitle: const Text('Anyone on or off GetnextIn'),
                trailing: _selectedVisibility == 'public' ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  setState(() => _selectedVisibility = 'public');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.people, color: AppColors.accent),
                title: const Text('Connections Only'),
                subtitle: const Text('Only candidate peers you are connected with'),
                trailing: _selectedVisibility == 'connections' ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  setState(() => _selectedVisibility = 'connections');
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.lock, color: AppColors.textSecondaryDark),
                title: const Text('Private (Only You)'),
                subtitle: const Text('Drafts and private portfolio notes'),
                trailing: _selectedVisibility == 'private' ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  setState(() => _selectedVisibility = 'private');
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
