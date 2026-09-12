import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

const educationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  grade: z.string().optional()
})

const experienceEntrySchema = z.object({
  company: z.string(),
  position: z.string().optional(),
  location: z.string().optional(),
  workType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  skillsUsed: z.array(z.string()).optional()
})

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
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  socials: z.record(z.any()).optional(),
  savedJobs: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  certifications: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional()
})

const profileInclude = {
  education: { orderBy: { order: 'asc' as const } },
  experience: { orderBy: { order: 'asc' as const } }
}

function toResponse(profile: any) {
  return {
    ...profile,
    education: (profile.education || []).map((e: any) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startYear: e.startYear,
      endYear: e.endYear,
      grade: e.grade
    })),
    experience: (profile.experience || []).map((e: any) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      location: e.location,
      workType: e.workType,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      description: e.description,
      skillsUsed: e.skillsUsed
    }))
  }
}

router.put(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid profile data', details: parsed.error.flatten() })
    }

    const { education, experience, ...scalarFields } = parsed.data
    const candidateId = req.user!.id

    const updated = await prisma.$transaction(async (tx) => {
      await tx.candidateProfile.update({
        where: { userId: candidateId },
        data: scalarFields as any
      })

      // Each save replaces the whole list, matching how the frontend's
      // profile editor always submits the complete education/experience
      // arrays rather than incremental per-entry patches.
      if (education) {
        await tx.education.deleteMany({ where: { candidateId } })
        if (education.length) {
          await tx.education.createMany({
            data: education.map((e, i) => ({ ...e, candidateId, order: i }))
          })
        }
      }
      if (experience) {
        await tx.experience.deleteMany({ where: { candidateId } })
        if (experience.length) {
          await tx.experience.createMany({
            data: experience.map((e, i) => ({ ...e, candidateId, order: i }))
          })
        }
      }

      return tx.candidateProfile.findUniqueOrThrow({ where: { userId: candidateId }, include: profileInclude })
    })

    return res.json(toResponse(updated))
  })
)

export { profileInclude, toResponse as toProfileResponse }
export default router
