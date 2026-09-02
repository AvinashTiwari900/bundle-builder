import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Post, PostComment, PostType, PostVisibility } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export class PostsController {
  /**
   * Helper to check if two users are accepted connections
   */
  private static isConnected(userId1: string, userId2: string): boolean {
    if (userId1 === userId2) return true
    return db.connections.some(
      (c) =>
        c.status === 'accepted' &&
        ((c.requesterId === userId1 && c.recipientId === userId2) ||
          (c.requesterId === userId2 && c.recipientId === userId1))
    )
  }

  /**
   * List posts visible to current user based on privacy and connections
   */
  static async listPosts(req: AuthenticatedRequest, res: Response) {
    const { postType, hashtag, authorId, myPostsOnly, savedOnly, search, connectionsOnly } = req.query
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    let posts = [...db.posts]

    // 1. Enforce Privacy and Visibility Rules:
    // - 'public': visible to everyone
    // - 'connections': visible if author is current user OR accepted connection
    // - 'private': visible ONLY to the author
    posts = posts.filter((post) => {
      if (post.authorId === currentUserId) return true
      if (post.visibility === 'private') return false
      if (post.visibility === 'connections') {
        return PostsController.isConnected(currentUserId, post.authorId)
      }
      return true // public
    })

    // 2. Filter by Saved / Bookmarks
    if (savedOnly === 'true') {
      posts = posts.filter((p) => p.savedByUserIds.includes(currentUserId))
    }

    // 3. Filter by My Posts
    if (myPostsOnly === 'true') {
      posts = posts.filter((p) => p.authorId === currentUserId)
    }

    // 4. Filter by Connections Only
    if (connectionsOnly === 'true') {
      posts = posts.filter(
        (p) => p.authorId === currentUserId || PostsController.isConnected(currentUserId, p.authorId)
      )
    }

    // 5. Filter by Author ID
    if (authorId && typeof authorId === 'string') {
      posts = posts.filter((p) => p.authorId === authorId)
    }

    // 6. Filter by Post Type
    if (postType && typeof postType === 'string' && postType !== 'All') {
      posts = posts.filter((p) => (p.postType || p.category || '').toLowerCase() === postType.toLowerCase())
    }

    // 7. Filter by Hashtag
    if (hashtag && typeof hashtag === 'string') {
      const targetTag = hashtag.startsWith('#') ? hashtag.toLowerCase() : `#${hashtag.toLowerCase()}`
      posts = posts.filter((p) => (p.hashtags || p.tags || []).some((t) => t.toLowerCase() === targetTag))
    }

    // 8. Search query across title, description, hashtags, author name
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.toLowerCase().trim()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.authorName.toLowerCase().includes(term) ||
          (p.hashtags || p.tags || []).some((t) => t.toLowerCase().includes(term))
      )
    }

    // Sort newest first
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return res.status(200).json({
      success: true,
      count: posts.length,
      savedCount: db.posts.filter((p) => p.savedByUserIds.includes(currentUserId)).length,
      posts
    })
  }

  /**
   * Get single post by ID with privacy authorization check
   */
  static async getPostById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    // Privacy check
    if (post.authorId !== currentUserId) {
      if (post.visibility === 'private') {
        return res.status(403).json({ success: false, message: 'This post is private and not accessible.' })
      }
      if (post.visibility === 'connections' && !PostsController.isConnected(currentUserId, post.authorId)) {
        return res.status(403).json({ success: false, message: 'This post is only visible to accepted connections.' })
      }
    }

    // Increment views
    post.viewsCount = (post.viewsCount || 0) + 1

    return res.status(200).json({
      success: true,
      post
    })
  }

  /**
   * Create candidate post / case study / portfolio item
   */
  static async createPost(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === currentUserId)
    const { title, description, postType, hashtags, links, media, visibility } = req.body

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' })
    }

    const cleanLinks = Array.isArray(links)
      ? links
          .filter((l: any) => l && l.label && l.url)
          .map((l: any) => ({ label: l.label.trim(), url: l.url.trim() }))
      : []

    const cleanHashtags = Array.isArray(hashtags)
      ? hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t}`))
      : []

    const cleanMedia = Array.isArray(media) ? media : []

    const newPost: Post = {
      id: `post-${uuidv4().slice(0, 8)}`,
      authorId: currentUserId,
      authorName: profile?.name || 'Avinash Tiwari',
      authorRole: profile?.headline || 'Lead Business Analyst',
      authorAvatar: profile?.profilePhoto,
      postType: postType || 'Normal Post',
      title,
      description,
      hashtags: cleanHashtags,
      links: cleanLinks,
      media: cleanMedia,
      visibility: visibility || 'public',
      likes: 0,
      likedByUserIds: [],
      savedByUserIds: [],
      comments: [],
      viewsCount: 1,
      createdAt: new Date().toISOString()
    }

    db.posts.unshift(newPost)

    return res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      post: newPost
    })
  }

  /**
   * Update existing post (author only)
   */
  static async updatePost(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { title, description, postType, hashtags, links, media, visibility } = req.body

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    if (post.authorId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this post.' })
    }

    if (title) post.title = title
    if (description) post.description = description
    if (postType) post.postType = postType
    if (hashtags !== undefined) {
      post.hashtags = Array.isArray(hashtags)
        ? hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t}`))
        : []
    }
    if (links !== undefined) {
      post.links = Array.isArray(links)
        ? links.filter((l: any) => l && l.label && l.url).map((l: any) => ({ label: l.label.trim(), url: l.url.trim() }))
        : []
    }
    if (media !== undefined) {
      post.media = Array.isArray(media) ? media : []
    }
    if (visibility) post.visibility = visibility
    post.updatedAt = new Date().toISOString()

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      post
    })
  }

  /**
   * Delete post (author only)
   */
  static async deletePost(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const postIndex = db.posts.findIndex((p) => p.id === id)
    if (postIndex === -1) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const post = db.posts[postIndex]
    if (post.authorId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this post.' })
    }

    db.posts.splice(postIndex, 1)

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully.'
    })
  }

  /**
   * Toggle Like
   */
  static async toggleLike(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const hasLiked = post.likedByUserIds.includes(currentUserId)
    if (hasLiked) {
      post.likedByUserIds = post.likedByUserIds.filter((uid) => uid !== currentUserId)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      post.likedByUserIds.push(currentUserId)
      post.likes += 1
    }

    return res.status(200).json({
      success: true,
      likes: post.likes,
      isLiked: !hasLiked
    })
  }

  /**
   * Toggle Bookmark / Save
   */
  static async toggleBookmark(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const isSaved = post.savedByUserIds.includes(currentUserId)
    if (isSaved) {
      post.savedByUserIds = post.savedByUserIds.filter((uid) => uid !== currentUserId)
    } else {
      post.savedByUserIds.push(currentUserId)
    }

    const totalSaved = db.posts.filter((p) => p.savedByUserIds.includes(currentUserId)).length

    return res.status(200).json({
      success: true,
      message: !isSaved ? 'Post bookmarked to your saved collection.' : 'Post removed from saved collection.',
      isSaved: !isSaved,
      totalSaved
    })
  }

  /**
   * Add Comment
   */
  static async addComment(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === currentUserId)
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' })
    }

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const newComment: PostComment = {
      id: `c-${uuidv4().slice(0, 6)}`,
      authorId: currentUserId,
      authorName: profile?.name || 'Avinash Tiwari',
      authorRole: profile?.headline || 'Lead Business Analyst',
      authorAvatar: profile?.profilePhoto,
      content: content.trim(),
      createdAt: new Date().toISOString()
    }

    post.comments.push(newComment)

    return res.status(201).json({
      success: true,
      message: 'Comment posted.',
      comment: newComment
    })
  }

  /**
   * Delete Comment
   */
  static async deleteComment(req: AuthenticatedRequest, res: Response) {
    const { id, commentId } = req.params
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const commentIndex = post.comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found.' })
    }

    const comment = post.comments[commentIndex]
    // Only comment author or post author can delete
    if (comment.authorId !== currentUserId && post.authorId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Permission denied to delete this comment.' })
    }

    post.comments.splice(commentIndex, 1)

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    })
  }
}
