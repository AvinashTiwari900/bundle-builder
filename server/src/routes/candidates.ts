import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  college: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  isStudent: z.boolean().optional(),
  experienceYears: z.number().optional(),
  targetSalary: z.string().optional(),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
  socials: z.record(z.any()).optional(),
  savedJobs: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  certifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional()
})

router.put(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile data', details: parsed.error.flatten() })
    }

    const updated = await prisma.candidateProfile.update({
      where: { userId: req.user!.id },
      data: parsed.data as any
    })

    return res.json(updated)
  })
)

export default router
