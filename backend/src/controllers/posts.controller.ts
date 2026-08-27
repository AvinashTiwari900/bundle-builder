import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Post } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export class PostsController {
  static async listPosts(req: AuthenticatedRequest, res: Response) {
    const { category, tag, authorType, savedOnly } = req.query
    const userId = req.user?.userId || 'usr-candidate-default-01'

    let posts = [...db.posts]

    if (savedOnly === 'true') {
      posts = posts.filter((p) => p.savedByUserIds.includes(userId))
    }

    if (category && typeof category === 'string' && category !== 'All') {
      posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    }

    if (authorType && typeof authorType === 'string' && authorType !== 'All') {
      posts = posts.filter((p) => p.authorType.toLowerCase() === authorType.toLowerCase())
    }

    if (tag && typeof tag === 'string') {
      posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    }

    return res.status(200).json({
      success: true,
      count: posts.length,
      savedCount: db.posts.filter((p) => p.savedByUserIds.includes(userId)).length,
      posts
    })
  }

  static async getSavedPosts(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const savedPosts = db.posts.filter((p) => p.savedByUserIds.includes(userId))

    return res.status(200).json({
      success: true,
      count: savedPosts.length,
      posts: savedPosts
    })
  }

  static async createPost(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)
    const { title, description, category, imageUrl, links, tags } = req.body

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' })
    }

    const newPost: Post = {
      id: `post-${uuidv4().slice(0, 8)}`,
      authorId: userId,
      authorName: profile?.name || 'Avinash Tiwari',
      authorRole: profile?.headline || 'Lead Business Analyst',
      authorAvatar: profile?.profilePhoto,
      authorType: 'candidate',
      category: category || 'General',
      title,
      description,
      imageUrl,
      links: Array.isArray(links) ? links : [],
      tags: Array.isArray(tags) ? tags : [],
      likes: 0,
      likedByUserIds: [],
      savedByUserIds: [],
      comments: [],
      createdAt: new Date().toISOString()
    }

    db.posts.unshift(newPost)

    return res.status(201).json({
      success: true,
      message: 'Post shared to Gettin Community Feed!',
      post: newPost
    })
  }

  static async toggleLike(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const userId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const hasLiked = post.likedByUserIds.includes(userId)
    if (hasLiked) {
      post.likedByUserIds = post.likedByUserIds.filter((uid) => uid !== userId)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      post.likedByUserIds.push(userId)
      post.likes += 1
    }

    return res.status(200).json({
      success: true,
      likes: post.likes,
      isLiked: !hasLiked
    })
  }

  static async toggleBookmark(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const userId = req.user?.userId || 'usr-candidate-default-01'

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const isSaved = post.savedByUserIds.includes(userId)
    if (isSaved) {
      post.savedByUserIds = post.savedByUserIds.filter((uid) => uid !== userId)
    } else {
      post.savedByUserIds.push(userId)
    }

    const totalSaved = db.posts.filter((p) => p.savedByUserIds.includes(userId)).length

    return res.status(200).json({
      success: true,
      message: !isSaved ? 'Post saved to your bookmarks!' : 'Post removed from saved bookmarks.',
      isSaved: !isSaved,
      totalSaved
    })
  }

  static async addComment(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' })
    }

    const post = db.posts.find((p) => p.id === id)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const newComment = {
      id: `c-${uuidv4().slice(0, 6)}`,
      authorId: userId,
      authorName: profile?.name || 'Avinash Tiwari',
      authorRole: profile?.headline || 'Candidate',
      authorAvatar: profile?.profilePhoto,
      content,
      createdAt: new Date().toISOString()
    }

    post.comments.push(newComment)

    return res.status(201).json({
      success: true,
      message: 'Comment posted.',
      comment: newComment
    })
  }
}
