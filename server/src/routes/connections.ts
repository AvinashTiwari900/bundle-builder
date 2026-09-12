import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

function maskEmail(email?: string | null): string | undefined {
  if (!email) return undefined
  const [user, domain] = email.split('@')
  if (!domain || user.length < 2) return email
  return `${user[0]}${'*'.repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}@${domain}`
}

function maskPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 6) return phone
  return `${phone.slice(0, phone.length - digits.length + 4)}****${digits.slice(-2)}`
}

async function getConnectionStatus(viewerId: string, targetId: string): Promise<{
  status: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'self'
  connectionId?: string
  connectedSince?: string
}> {
  if (viewerId === targetId) return { status: 'self' }
  const conn = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, recipientId: targetId },
        { requesterId: targetId, recipientId: viewerId }
      ]
    }
  })
  if (!conn) return { status: 'none' }
  if (conn.status === 'accepted') return { status: 'connected', connectionId: conn.id, connectedSince: conn.updatedAt.toISOString() }
  if (conn.status === 'pending') {
    return { status: conn.requesterId === viewerId ? 'pending_sent' : 'pending_received', connectionId: conn.id }
  }
  return { status: 'none' }
}

async function toConnectionUser(viewerId: string, profile: any, opts: { includeContact?: boolean } = {}) {
  const statusInfo = await getConnectionStatus(viewerId, profile.userId)
  const privacy = profile.settings?.privacy || {}
  const isConnected = statusInfo.status === 'connected' || statusInfo.status === 'self'
  const showEmail = opts.includeContact && (statusInfo.status === 'self' || (isConnected && privacy.showEmailToConnections !== false))
  const showPhone = opts.includeContact && (statusInfo.status === 'self' || (isConnected && privacy.showPhoneToConnections !== false))

  return {
    userId: profile.userId,
    name: profile.name,
    headline: profile.headline || '',
    location: profile.location || '',
    profilePhoto: profile.profilePhoto,
    skills: profile.skills || [],
    totalExperienceYears: profile.experienceYears,
    currentRole: profile.role,
    bio: profile.bio,
    email: showEmail ? profile.user?.email : maskEmail(profile.user?.email),
    phone: showPhone ? profile.phone : maskPhone(profile.phone),
    education: profile.education,
    experience: profile.experience,
    githubUrl: profile.socials?.github,
    linkedinUrl: profile.socials?.linkedin,
    portfolioUrl: profile.socials?.portfolioUrl,
    connectionStatus: statusInfo.status,
    connectionId: statusInfo.connectionId,
    connectedSince: statusInfo.connectedSince
  }
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const accepted = await prisma.connection.findMany({
      where: { status: 'accepted', OR: [{ requesterId: viewerId }, { recipientId: viewerId }] }
    })
    const otherIds = accepted.map((c) => (c.requesterId === viewerId ? c.recipientId : c.requesterId))
    const profiles = await prisma.candidateProfile.findMany({
      where: { userId: { in: otherIds } },
      include: { user: { select: { email: true } } }
    })
    const connections = await Promise.all(profiles.map((p) => toConnectionUser(viewerId, p, { includeContact: true })))
    return res.json({ success: true, connections })
  })
)

router.get(
  '/requests',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const incomingConns = await prisma.connection.findMany({ where: { recipientId: viewerId, status: 'pending' } })
    const sentConns = await prisma.connection.findMany({ where: { requesterId: viewerId, status: 'pending' } })

    const incoming = await Promise.all(
      incomingConns.map(async (c) => {
        const profile = await prisma.candidateProfile.findUnique({ where: { userId: c.requesterId }, include: { user: { select: { email: true } } } })
        return { requestId: c.id, createdAt: c.createdAt, requester: profile ? await toConnectionUser(viewerId, profile) : null }
      })
    )
    const sent = await Promise.all(
      sentConns.map(async (c) => {
        const profile = await prisma.candidateProfile.findUnique({ where: { userId: c.recipientId }, include: { user: { select: { email: true } } } })
        return { requestId: c.id, createdAt: c.createdAt, recipient: profile ? await toConnectionUser(viewerId, profile) : null }
      })
    )

    return res.json({ success: true, incoming: incoming.filter((i) => i.requester), sent: sent.filter((s) => s.recipient) })
  })
)

router.post(
  '/request',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = z.object({ targetUserId: z.string() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'targetUserId is required' })
    const { targetUserId } = parsed.data
    const viewerId = req.user!.id

    if (targetUserId === viewerId) return res.status(400).json({ error: 'Cannot connect with yourself' })

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, recipientId: targetUserId },
          { requesterId: targetUserId, recipientId: viewerId }
        ]
      }
    })
    if (existing) {
      if (existing.status === 'accepted') return res.json({ success: true, message: 'Already connected', status: 'connected' })
      if (existing.status === 'pending') {
        return res.json({
          success: true,
          message: 'Request already pending',
          status: existing.requesterId === viewerId ? 'pending_sent' : 'pending_received'
        })
      }
    }

    await prisma.connection.upsert({
      where: { requesterId_recipientId: { requesterId: viewerId, recipientId: targetUserId } },
      create: { requesterId: viewerId, recipientId: targetUserId, status: 'pending' },
      update: { status: 'pending' }
    })

    return res.status(201).json({ success: true, message: 'Connection request sent', status: 'pending_sent' })
  })
)

async function findConnectionByIdOrUser(id: string, viewerId: string, role: 'recipient' | 'requester' | 'either') {
  return prisma.connection.findFirst({
    where: {
      OR: [
        { id },
        role === 'recipient'
          ? { requesterId: id, recipientId: viewerId }
          : role === 'requester'
          ? { recipientId: id, requesterId: viewerId }
          : { OR: [{ requesterId: id, recipientId: viewerId }, { recipientId: id, requesterId: viewerId }] }
      ]
    }
  })
}

router.patch(
  '/:id/accept',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const conn = await findConnectionByIdOrUser(req.params.id, req.user!.id, 'recipient')
    if (!conn || conn.recipientId !== req.user!.id) return res.status(404).json({ error: 'Request not found' })

    await prisma.connection.update({ where: { id: conn.id }, data: { status: 'accepted' } })
    return res.json({ success: true, message: 'Connection request accepted' })
  })
)

router.patch(
  '/:id/decline',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const conn = await findConnectionByIdOrUser(req.params.id, req.user!.id, 'recipient')
    if (!conn || conn.recipientId !== req.user!.id) return res.status(404).json({ error: 'Request not found' })

    await prisma.connection.update({ where: { id: conn.id }, data: { status: 'declined' } })
    return res.json({ success: true, message: 'Connection request declined' })
  })
)

router.delete(
  '/:id/cancel',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const conn = await findConnectionByIdOrUser(req.params.id, req.user!.id, 'requester')
    if (!conn || conn.requesterId !== req.user!.id) return res.status(404).json({ error: 'Request not found' })

    await prisma.connection.delete({ where: { id: conn.id } })
    return res.json({ success: true, message: 'Connection request cancelled' })
  })
)

router.delete(
  '/:id/remove',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const conn = await findConnectionByIdOrUser(req.params.id, req.user!.id, 'either')
    if (!conn) return res.status(404).json({ error: 'Connection not found' })

    await prisma.connection.delete({ where: { id: conn.id } })
    return res.json({ success: true, message: 'Connection removed' })
  })
)

router.get(
  '/discover',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const { q, skill, location } = req.query as Record<string, string | undefined>

    const where: any = { userId: { not: viewerId } }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } }
      ]
    }
    if (skill) where.skills = { has: skill }
    if (location) where.location = { contains: location, mode: 'insensitive' }

    const profiles = await prisma.candidateProfile.findMany({ where, take: 50 })
    const people = await Promise.all(profiles.map((p) => toConnectionUser(viewerId, p)))
    return res.json({ success: true, people })
  })
)

router.get(
  '/user/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const viewerId = req.user!.id
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.params.id },
      include: { user: { select: { email: true } } }
    })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const connUser = await toConnectionUser(viewerId, profile, { includeContact: true })
    const posts = await prisma.post.findMany({ where: { authorId: profile.userId, visibility: 'public' }, orderBy: { createdAt: 'desc' }, take: 10 })

    return res.json({ success: true, profile: { ...connUser, postsCount: posts.length, posts } })
  })
)

export default router
