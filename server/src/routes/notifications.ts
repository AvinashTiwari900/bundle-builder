import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const createSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.string().optional()
})

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: { candidateId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(notifications)
  })
)

router.post(
  '/',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid notification data' })

    const notification = await prisma.notification.create({
      data: { ...parsed.data, candidateId: req.user!.id }
    })
    return res.status(201).json(notification)
  })
)

router.patch(
  '/:id/read',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notification || notification.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } })
    return res.json(updated)
  })
)

router.patch(
  '/read-all',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({ where: { candidateId: req.user!.id }, data: { read: true } })
    return res.status(204).send()
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notification || notification.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    await prisma.notification.delete({ where: { id: notification.id } })
    return res.status(204).send()
  })
)

export default router
