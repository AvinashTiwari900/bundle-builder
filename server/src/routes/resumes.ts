import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const createSchema = z.object({
  name: z.string(),
  size: z.number().optional(),
  isPrimary: z.boolean().optional(),
  atsScore: z.number().optional(),
  cloudinaryUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional()
})

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const resumes = await prisma.resume.findMany({
      where: { candidateId: req.user!.id },
      orderBy: { uploadedAt: 'desc' }
    })
    return res.json(resumes)
  })
)

router.post(
  '/',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid resume data' })

    if (parsed.data.isPrimary) {
      await prisma.resume.updateMany({ where: { candidateId: req.user!.id }, data: { isPrimary: false } })
    }

    const resume = await prisma.resume.create({
      data: { ...parsed.data, candidateId: req.user!.id }
    })
    return res.status(201).json(resume)
  })
)

router.put(
  '/:id/primary',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const resume = await prisma.resume.findUnique({ where: { id: req.params.id } })
    if (!resume || resume.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Resume not found' })
    }
    await prisma.resume.updateMany({ where: { candidateId: req.user!.id }, data: { isPrimary: false } })
    const updated = await prisma.resume.update({ where: { id: resume.id }, data: { isPrimary: true } })
    return res.json(updated)
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const resume = await prisma.resume.findUnique({ where: { id: req.params.id } })
    if (!resume || resume.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Resume not found' })
    }
    await prisma.resume.delete({ where: { id: resume.id } })
    return res.status(204).send()
  })
)

export default router
