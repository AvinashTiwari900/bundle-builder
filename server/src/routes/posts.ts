import { Router } from 'express'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'
import { env } from '../lib/env'

const router = Router()

const uploadDir = path.join(__dirname, '../../uploads/posts')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `post-media-${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const allowedVideoMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']

  if (allowedImageMimes.includes(file.mimetype) || allowedVideoMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Unsupported file format (${file.mimetype}). Supported formats: JPG, PNG, WEBP, GIF, MP4, MOV, AVI, WEBM, MKV.`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max
  }
})

async function isConnected(userA: string, userB: string): Promise<boolean> {
  if (userA === userB) return true
  const conn = await prisma.connection.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: userA, recipientId: userB },
        { requesterId: userB, recipientId: userA }
      ]
    }
  })
  return !!conn
}

async function getConnectionMap(viewerId: string) {
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: viewerId }, { recipientId: viewerId }]
    }
  })
  const connMap = new Map<string, { status: 'connected' | 'pending_sent' | 'pending_received'; connectionId: string }>()
  for (const c of connections) {
    const otherId = c.requesterId === viewerId ? c.recipientId : c.requesterId
    if (c.status === 'accepted') {
      connMap.set(otherId, { status: 'connected', connectionId: c.id })
    } else if (c.status === 'pending') {
      connMap.set(otherId, {
        status: c.requesterId === viewerId ? 'pending_sent' : 'pending_received',
        connectionId: c.id
      })
    }
  }
  return connMap
}

function toResponse(
  post: any,
  viewerId: string,
  connMap?: Map<string, { status: 'connected' | 'pending_sent' | 'pending_received'; connectionId: string }>
) {
  let connectionStatus: 'self' | 'connected' | 'pending_sent' | 'pending_received' | 'none' = 'none'
  let connectionId: string | undefined = undefined

  if (post.authorId === viewerId) {
    connectionStatus = 'self'
  } else if (connMap && connMap.has(post.authorId)) {
    const info = connMap.get(post.authorId)!
    connectionStatus = info.status
    connectionId = info.connectionId
  }

  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.author?.candidateProfile?.name || post.authorName,
    authorRole: post.author?.candidateProfile?.headline || '',
    authorAvatar: post.author?.candidateProfile?.profilePhoto,
    connectionStatus,
    connectionId,
    postType: post.postType,
    title: post.title,
    description: post.description,
    hashtags: post.hashtags,
    links: (post.links || []).map((l: any) => ({ label: l.label, url: l.url })),
    media: (post.media || []).map((m: any) => ({ id: m.id, type: m.type, url: m.url, name: m.name, size: m.size })),
    visibility: post.visibility,
    likes: post.likedByUserIds.length,
    likedByUserIds: post.likedByUserIds,
    hasLiked: post.likedByUserIds.includes(viewerId),
    isBookmarked: post.savedByUserIds.includes(viewerId),
    savedByUserIds: post.savedByUserIds,
    viewsCount: post.viewsCount,
    comments: (post.comments || []).map((c: any) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.author?.candidateProfile?.name || '',
      authorRole: c.author?.candidateProfile?.headline || '',
      authorAvatar: c.author?.candidateProfile?.profilePhoto,
      content: c.content,
      createdAt: c.createdAt
    })),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }
}

const postInclude = {
  author: { include: { candidateProfile: true } },
  comments: { include: { author: { include: { candidateProfile: true } } }, orderBy: { createdAt: 'asc' as const } },
  links: { orderBy: { order: 'asc' as const } },
  media: { orderBy: { order: 'asc' as const } }
}

router.post(
  '/upload',
  requireAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File exceeds size limit (100MB for video, 20MB for photo)' })
        }
        return res.status(400).json({ error: err.message })
      } else if (err) {
        return res.status(400).json({ error: err.message })
      }
      next()
    })
  },
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' })
    }

    const isVideo = req.file.mimetype.startsWith('video/')
    const isImage = req.file.mimetype.startsWith('image/')

    if (isImage && req.file.size > 20 * 1024 * 1024) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (_) {}
      return res.status(400).json({ error: 'Images must be 20MB or smaller' })
    }

    const host = req.get('host') || `localhost:${env.port}`
    const fileUrl = `${req.protocol}://${host}/uploads/posts/${req.file.filename}`

    return res.json({
      url: fileUrl,
      type: isVideo ? 'video' : 'image',
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    })
  })
)

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const { postType, hashtag, authorId, myPostsOnly, savedOnly, search } = req.query as Record<string, string | undefined>

    const where: any = {}
    if (postType) where.postType = postType
    if (hashtag) where.hashtags = { has: hashtag }
    if (authorId) where.authorId = authorId
    if (myPostsOnly === 'true') where.authorId = viewerId
    if (savedOnly === 'true') where.savedByUserIds = { has: viewerId }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const posts = await prisma.post.findMany({ where, include: postInclude, orderBy: { createdAt: 'desc' } })
    const connMap = await getConnectionMap(viewerId)

    const visible: any[] = []
    for (const p of posts) {
      if (p.authorId === viewerId) {
        visible.push(p)
        continue
      }
      if (p.visibility === 'private') continue
      if (p.visibility === 'connections' && connMap.get(p.authorId)?.status !== 'connected') continue
      visible.push(p)
    }

    return res.json(visible.map((p) => toResponse(p, viewerId, connMap)))
  })
)

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: postInclude })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    if (post.authorId !== viewerId) {
      if (post.visibility === 'private') return res.status(403).json({ error: 'Forbidden' })
      if (post.visibility === 'connections' && !(await isConnected(viewerId, post.authorId))) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      await prisma.post.update({ where: { id: post.id }, data: { viewsCount: { increment: 1 } } })
      post.viewsCount += 1
    }

    const connMap = await getConnectionMap(viewerId)
    return res.json(toResponse(post, viewerId, connMap))
  })
)

const createSchema = z.object({
  postType: z.string(),
  title: z.string(),
  description: z.string(),
  hashtags: z.array(z.string()).optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  media: z.array(z.any()).optional(),
  visibility: z.enum(['public', 'connections', 'private']).optional()
})

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid post data' })

    const post = await prisma.post.create({
      data: {
        authorId: req.user!.id,
        postType: parsed.data.postType,
        title: parsed.data.title,
        description: parsed.data.description,
        hashtags: parsed.data.hashtags || [],
        visibility: parsed.data.visibility || 'public',
        links: { create: (parsed.data.links || []).map((l, i) => ({ label: l.label, url: l.url, order: i })) },
        media: { create: (parsed.data.media || []).map((m: any, i: number) => ({ type: m.type, url: m.url, name: m.name, size: m.size, order: i })) }
      },
      include: postInclude
    })
    return res.status(201).json(toResponse(post, req.user!.id))
  })
)

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  media: z.array(z.any()).optional(),
  visibility: z.enum(['public', 'connections', 'private']).optional()
})

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid post data' })

    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' })

    const { links, media, ...scalarFields } = parsed.data

    const updated = await prisma.$transaction(async (tx) => {
      await tx.post.update({ where: { id: post.id }, data: scalarFields as any })

      // Whole-list replace, matching how the frontend editor always submits
      // the complete links/media arrays rather than incremental patches.
      if (links) {
        await tx.postLink.deleteMany({ where: { postId: post.id } })
        if (links.length) {
          await tx.postLink.createMany({ data: links.map((l, i) => ({ postId: post.id, label: l.label, url: l.url, order: i })) })
        }
      }
      if (media) {
        await tx.postMedia.deleteMany({ where: { postId: post.id } })
        if (media.length) {
          await tx.postMedia.createMany({
            data: media.map((m: any, i: number) => ({ postId: post.id, type: m.type, url: m.url, name: m.name, size: m.size, order: i }))
          })
        }
      }

      return tx.post.findUniqueOrThrow({ where: { id: post.id }, include: postInclude })
    })

    return res.json(toResponse(updated, req.user!.id))
  })
)

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })
    if (post.authorId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' })

    await prisma.post.delete({ where: { id: post.id } })
    return res.status(204).send()
  })
)

router.post(
  '/:id/like',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const isLiked = post.likedByUserIds.includes(viewerId)
    const likedByUserIds = isLiked
      ? post.likedByUserIds.filter((id) => id !== viewerId)
      : [...post.likedByUserIds, viewerId]

    await prisma.post.update({ where: { id: post.id }, data: { likedByUserIds } })
    return res.json({ success: true, likes: likedByUserIds.length, isLiked: !isLiked })
  })
)

router.post(
  '/:id/bookmark',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const isSaved = post.savedByUserIds.includes(viewerId)
    const savedByUserIds = isSaved
      ? post.savedByUserIds.filter((id) => id !== viewerId)
      : [...post.savedByUserIds, viewerId]

    await prisma.post.update({ where: { id: post.id }, data: { savedByUserIds } })
    return res.json({ success: true, isSaved: !isSaved, totalSaved: savedByUserIds.length })
  })
)

router.post(
  '/:id/comment',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const content = z.string().min(1).safeParse(req.body?.content)
    if (!content.success) return res.status(400).json({ error: 'Comment content is required' })

    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const comment = await prisma.postComment.create({
      data: { postId: post.id, authorId: req.user!.id, content: content.data },
      include: { author: { include: { candidateProfile: true } } }
    })

    return res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        authorId: comment.authorId,
        authorName: comment.author?.candidateProfile?.name || '',
        authorRole: comment.author?.candidateProfile?.headline || '',
        authorAvatar: comment.author?.candidateProfile?.profilePhoto,
        content: comment.content,
        createdAt: comment.createdAt
      }
    })
  })
)

router.delete(
  '/:id/comments/:commentId',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const comment = await prisma.postComment.findUnique({ where: { id: req.params.commentId } })
    if (!comment || comment.postId !== post.id) return res.status(404).json({ error: 'Comment not found' })

    if (comment.authorId !== req.user!.id && post.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await prisma.postComment.delete({ where: { id: comment.id } })
    return res.status(204).send()
  })
)

export default router
