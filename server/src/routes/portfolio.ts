import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const upsertSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  experienceYears: z.number().optional(),
  avatar: z.string().optional(),
  intro: z.string().optional(),
  about: z.string().optional(),
  skills: z.array(z.string()).optional(),
  featuredProjects: z.array(z.any()).optional(),
  socials: z.record(z.any()).optional()
})

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId: req.user!.id } })
    return res.json(portfolio)
  })
)

router.put(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = upsertSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid portfolio data' })

    const portfolio = await prisma.portfolio.upsert({
      where: { userId: req.user!.id },
      create: { ...parsed.data, userId: req.user!.id },
      update: parsed.data
    })
    return res.json(portfolio)
  })
)

// Public read - no auth required, deliberately looser than every other
// route here since this is meant to be a shareable public profile page.
router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const portfolio = await prisma.portfolio.findUnique({ where: { userId: req.params.userId } })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })
    return res.json(portfolio)
  })
)

export default router
