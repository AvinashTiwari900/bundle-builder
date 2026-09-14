import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/post_model.dart';
import '../data/post_repository.dart';

class PostsState {
  final List<PostModel> feedPosts;
  final List<PostModel> myPosts;
  final bool isLoading;
  final String? errorMessage;

  const PostsState({
    this.feedPosts = const [],
    this.myPosts = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  PostsState copyWith({
    List<PostModel>? feedPosts,
    List<PostModel>? myPosts,
    bool? isLoading,
    String? errorMessage,
  }) {
    return PostsState(
      feedPosts: feedPosts ?? this.feedPosts,
      myPosts: myPosts ?? this.myPosts,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class PostsNotifier extends StateNotifier<PostsState> {
  final PostRepository _repository;

  PostsNotifier(this._repository) : super(const PostsState()) {
    loadFeed();
    loadMyPosts();
  }

  Future<void> loadFeed({
    bool refresh = false,
    String? search,
    String? postType,
    String? hashtag,
  }) async {
    if (state.feedPosts.isEmpty || refresh) {
      state = state.copyWith(isLoading: true, errorMessage: null);
    }

    try {
      final posts = await _repository.fetchFeedPosts(
        search: search,
        postType: postType,
        hashtag: hashtag,
      );
      state = state.copyWith(feedPosts: posts, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<void> loadMyPosts() async {
    try {
      final posts = await _repository.fetchMyPosts();
      state = state.copyWith(myPosts: posts);
    } catch (_) {}
  }

  Future<void> toggleLike(String postId) async {
    // Optimistic UI update
    final updated = state.feedPosts.map((p) {
      if (p.id == postId) {
        final newHasLiked = !p.hasLiked;
        final newLikes = newHasLiked ? p.likes + 1 : (p.likes > 0 ? p.likes - 1 : 0);
        return p.copyWith(hasLiked: newHasLiked, likes: newLikes);
      }
      return p;
    }).toList();

    state = state.copyWith(feedPosts: updated);
    await _repository.toggleLike(postId);
  }

  Future<void> toggleBookmark(String postId) async {
    final updated = state.feedPosts.map((p) {
      if (p.id == postId) {
        return p.copyWith(isBookmarked: !p.isBookmarked);
      }
      return p;
    }).toList();

    state = state.copyWith(feedPosts: updated);
    await _repository.toggleBookmark(postId);
  }

  Future<void> addComment(String postId, String content) async {
    final newComment = await _repository.addComment(postId, content);
    if (newComment != null) {
      final updated = state.feedPosts.map((p) {
        if (p.id == postId) {
          return p.copyWith(
            comments: [...p.comments, newComment],
            commentsCount: p.commentsCount + 1,
          );
        }
        return p;
      }).toList();

      state = state.copyWith(feedPosts: updated);
    }
  }

  Future<bool> deletePost(String postId) async {
    final success = await _repository.deletePost(postId);
    if (success) {
      state = state.copyWith(
        feedPosts: state.feedPosts.where((p) => p.id != postId).toList(),
        myPosts: state.myPosts.where((p) => p.id != postId).toList(),
      );
    }
    return success;
  }

  Future<void> sendConnection(String targetUserId, String postId) async {
    final newStatus = await _repository.sendConnectionRequest(targetUserId);
    final updated = state.feedPosts.map((p) {
      if (p.authorId == targetUserId || p.id == postId) {
        return p.copyWith(connectionStatus: newStatus);
      }
      return p;
    }).toList();

    state = state.copyWith(feedPosts: updated);
  }

  Future<void> acceptConnection(String connectionId, String postId) async {
    final ok = await _repository.acceptConnection(connectionId);
    if (ok) {
      final updated = state.feedPosts.map((p) {
        if (p.connectionId == connectionId || p.id == postId) {
          return p.copyWith(connectionStatus: 'connected');
        }
        return p;
      }).toList();

      state = state.copyWith(feedPosts: updated);
    }
  }

  Future<PostModel> createPost({
    required String title,
    required String description,
    String postType = 'Normal Post',
    List<String> hashtags = const [],
    List<PostLinkModel> links = const [],
    List<PostMediaModel> media = const [],
    String visibility = 'public',
  }) async {
    final newPost = await _repository.createPost(
      title: title,
      description: description,
      postType: postType,
      hashtags: hashtags,
      links: links,
      media: media,
      visibility: visibility,
    );

    state = state.copyWith(
      feedPosts: [newPost, ...state.feedPosts],
      myPosts: [newPost, ...state.myPosts],
    );

    return newPost;
  }

  Future<void> updatePost({
    required String postId,
    String? title,
    required String description,
    String? postType,
    List<String>? hashtags,
    List<PostLinkModel>? links,
    List<PostMediaModel>? media,
    String? visibility,
  }) async {
    final updated = await _repository.updatePost(
      postId: postId,
      title: title,
      description: description,
      postType: postType,
      hashtags: hashtags,
      links: links,
      media: media,
      visibility: visibility,
    );

    if (updated != null) {
      state = state.copyWith(
        feedPosts: state.feedPosts.map((p) => p.id == postId ? updated : p).toList(),
        myPosts: state.myPosts.map((p) => p.id == postId ? updated : p).toList(),
      );
    }
  }
}

final postsNotifierProvider = StateNotifierProvider<PostsNotifier, PostsState>((ref) {
  return PostsNotifier(ref.watch(postRepositoryProvider));
});
