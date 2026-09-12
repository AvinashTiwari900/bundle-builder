import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const createSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  outcomes: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  link: z.string().optional(),
  githubUrl: z.string().optional()
})

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const projects = await prisma.project.findMany({
      where: { candidateId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(projects)
  })
)

router.post(
  '/',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid project data' })

    const project = await prisma.project.create({
      data: { ...parsed.data, candidateId: req.user!.id }
    })
    return res.status(201).json(project)
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project || project.candidateId !== req.user!.id) {
      return res.status(404).json({ error: 'Project not found' })
    }
    await prisma.project.delete({ where: { id: project.id } })
    return res.status(204).send()
  })
)

export default router
