import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const createSchema = z.object({
  name: z.string(),
  type: z.string(),
  status: z.string().optional(),
  aiConfidence: z.number().optional(),
  extractedName: z.string().optional(),
  extractedIdNumber: z.string().optional(),
  cloudinaryUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional()
})

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const documents = await prisma.document.findMany({
      where: { candidateId: req.user!.id },
      orderBy: { uploadedAt: 'desc' }
    })
    return res.json(documents)
  })
)

router.post(
  '/',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid document data' })

    const document = await prisma.document.create({
      data: { ...parsed.data, candidateId: req.user!.id }
    })
    return res.status(201).json(document)
  })
)

const updateSchema = z.object({
  status: z.string().optional()
})

router.patch(
  '/:id',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid update data' })

    const document = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!document || document.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Document not found' })
    }
    const updated = await prisma.document.update({ where: { id: document.id }, data: parsed.data })
    return res.json(updated)
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!document || document.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Document not found' })
    }
    await prisma.document.delete({ where: { id: document.id } })
    return res.status(204).send()
  })
)

export default router
