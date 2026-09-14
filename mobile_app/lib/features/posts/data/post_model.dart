class PostLinkModel {
  final String label;
  final String url;

  const PostLinkModel({
    required this.label,
    required this.url,
  });

  factory PostLinkModel.fromJson(Map<String, dynamic> json) {
    return PostLinkModel(
      label: json['label'] as String? ?? 'Link',
      url: json['url'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        'url': url,
      };
}

class PostMediaModel {
  final String id;
  final String type; // 'image' or 'video'
  final String url;
  final String? name;
  final int? size;

  const PostMediaModel({
    required this.id,
    required this.type,
    required this.url,
    this.name,
    this.size,
  });

  factory PostMediaModel.fromJson(Map<String, dynamic> json) {
    return PostMediaModel(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'image',
      url: json['url'] as String? ?? '',
      name: json['name'] as String?,
      size: json['size'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'url': url,
        if (name != null) 'name': name,
        if (size != null) 'size': size,
      };
}

class PostCommentModel {
  final String id;
  final String authorId;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final String content;
  final DateTime createdAt;

  const PostCommentModel({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    required this.content,
    required this.createdAt,
  });

  factory PostCommentModel.fromJson(Map<String, dynamic> json) {
    return PostCommentModel(
      id: json['id'] as String? ?? '',
      authorId: json['authorId'] as String? ?? '',
      authorName: json['authorName'] as String? ?? 'Candidate',
      authorRole: json['authorRole'] as String? ?? '',
      authorAvatar: json['authorAvatar'] as String?,
      content: json['content'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'authorId': authorId,
        'authorName': authorName,
        'authorRole': authorRole,
        if (authorAvatar != null) 'authorAvatar': authorAvatar,
        'content': content,
        'createdAt': createdAt.toIso8601String(),
      };
}

class PostModel {
  final String id;
  final String authorId;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final String postType;
  final String title;
  final String description;
  final List<String> hashtags;
  final List<PostLinkModel> links;
  final List<PostMediaModel> media;
  final String visibility; // 'public', 'connections', 'private'
  final int likes;
  final bool hasLiked;
  final bool isBookmarked;
  final int commentsCount;
  final List<PostCommentModel> comments;
  final String connectionStatus; // 'self', 'none', 'pending_sent', 'pending_received', 'connected'
  final String? connectionId;
  final int viewsCount;
  final DateTime createdAt;

  const PostModel({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    this.postType = 'Normal Post',
    required this.title,
    required this.description,
    this.hashtags = const [],
    this.links = const [],
    this.media = const [],
    this.visibility = 'public',
    this.likes = 0,
    this.hasLiked = false,
    this.isBookmarked = false,
    this.commentsCount = 0,
    this.comments = const [],
    this.connectionStatus = 'none',
    this.connectionId,
    this.viewsCount = 0,
    required this.createdAt,
  });

  PostModel copyWith({
    String? id,
    String? authorId,
    String? authorName,
    String? authorRole,
    String? authorAvatar,
    String? postType,
    String? title,
    String? description,
    List<String>? hashtags,
    List<PostLinkModel>? links,
    List<PostMediaModel>? media,
    String? visibility,
    int? likes,
    bool? hasLiked,
    bool? isBookmarked,
    int? commentsCount,
    List<PostCommentModel>? comments,
    String? connectionStatus,
    String? connectionId,
    int? viewsCount,
    DateTime? createdAt,
  }) {
    return PostModel(
      id: id ?? this.id,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      authorRole: authorRole ?? this.authorRole,
      authorAvatar: authorAvatar ?? this.authorAvatar,
      postType: postType ?? this.postType,
      title: title ?? this.title,
      description: description ?? this.description,
      hashtags: hashtags ?? this.hashtags,
      links: links ?? this.links,
      media: media ?? this.media,
      visibility: visibility ?? this.visibility,
      likes: likes ?? this.likes,
      hasLiked: hasLiked ?? this.hasLiked,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      commentsCount: commentsCount ?? this.commentsCount,
      comments: comments ?? this.comments,
      connectionStatus: connectionStatus ?? this.connectionStatus,
      connectionId: connectionId ?? this.connectionId,
      viewsCount: viewsCount ?? this.viewsCount,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final commentsList = (json['comments'] as List<dynamic>?)
            ?.map((c) => PostCommentModel.fromJson(c as Map<String, dynamic>))
            .toList() ??
        [];

    return PostModel(
      id: json['id'] as String? ?? '',
      authorId: json['authorId'] as String? ?? '',
      authorName: json['authorName'] as String? ?? 'Candidate',
      authorRole: json['authorRole'] as String? ?? '',
      authorAvatar: json['authorAvatar'] as String?,
      postType: json['postType'] as String? ?? 'Normal Post',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      hashtags: (json['hashtags'] as List<dynamic>?)
              ?.map((t) => t.toString())
              .toList() ??
          [],
      links: (json['links'] as List<dynamic>?)
              ?.map((l) => PostLinkModel.fromJson(l as Map<String, dynamic>))
              .toList() ??
          [],
      media: (json['media'] as List<dynamic>?)
              ?.map((m) => PostMediaModel.fromJson(m as Map<String, dynamic>))
              .toList() ??
          [],
      visibility: json['visibility'] as String? ?? 'public',
      likes: (json['likes'] as int?) ?? (json['likedByUserIds'] as List<dynamic>?)?.length ?? 0,
      hasLiked: json['hasLiked'] as bool? ?? false,
      isBookmarked: json['isBookmarked'] as bool? ?? false,
      commentsCount: commentsList.isNotEmpty ? commentsList.length : ((json['commentsCount'] as int?) ?? 0),
      comments: commentsList,
      connectionStatus: json['connectionStatus'] as String? ?? 'none',
      connectionId: json['connectionId'] as String?,
      viewsCount: json['viewsCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'authorId': authorId,
        'authorName': authorName,
        'authorRole': authorRole,
        if (authorAvatar != null) 'authorAvatar': authorAvatar,
        'postType': postType,
        'title': title,
        'description': description,
        'hashtags': hashtags,
        'links': links.map((l) => l.toJson()).toList(),
        'media': media.map((m) => m.toJson()).toList(),
        'visibility': visibility,
        'likes': likes,
        'hasLiked': hasLiked,
        'isBookmarked': isBookmarked,
        'comments': comments.map((c) => c.toJson()).toList(),
        'connectionStatus': connectionStatus,
        if (connectionId != null) 'connectionId': connectionId,
        'viewsCount': viewsCount,
        'createdAt': createdAt.toIso8601String(),
      };
}
