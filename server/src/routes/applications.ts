import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

// Same heuristic as the frontend's autoApplyService.calculateMatch, so
// scores stay consistent whether a candidate applies manually or via auto-apply.
function calculateMatchScore(candidateSkills: string[], candidateExperienceYears: number, job: { skills: string[]; experience: string | null }) {
  const skillMatch = (job.skills || []).filter((s) => candidateSkills.includes(s)).length
  const minExperience = Number((job.experience || '0').match(/(\d+)/)?.[0] || 0)
  const experienceBonus = candidateExperienceYears >= minExperience ? 10 : 0
  return Math.min(100, 40 + skillMatch * 15 + experienceBonus)
}

function formatSalary(salaryMin: number | null, salaryMax: number | null) {
  const min = Math.round((salaryMin || 1500000) / 100000)
  const max = Math.round((salaryMax || 2400000) / 100000)
  return `₹${min}-${max} LPA`
}

function toResponse(app: any, job: any) {
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: job.title,
    company: job.company,
    companyRating: job.companyRating,
    hiringPeriod: job.hiringPeriod,
    location: job.location,
    workMode: job.workMode,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    appliedDate: app.appliedDate,
    status: app.status,
    matchScore: app.matchScore,
    notes: app.notes,
    interviewDate: app.interviewDate
  }
}

const createSchema = z.object({
  jobId: z.string(),
  notes: z.string().optional()
})

router.post(
  '/',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid application data' })
    }

    const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } })
    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const existing = await prisma.application.findUnique({
      where: { candidateId_jobId: { candidateId: req.user!.id, jobId: job.id } }
    })
    if (existing) {
      return res.status(409).json({ error: 'Already applied for this position' })
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user!.id } })
    const matchScore = calculateMatchScore(profile?.skills || [], profile?.experienceYears || 0, job)

    const application = await prisma.application.create({
      data: {
        candidateId: req.user!.id,
        jobId: job.id,
        recruiterId: job.ownerId,
        status: 'Applied',
        matchScore,
        notes: parsed.data.notes
      }
    })

    return res.status(201).json(toResponse(application, job))
  })
)

router.get(
  '/me',
  requireAuth,
  requireRole('candidate'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const applications = await prisma.application.findMany({
      where: { candidateId: req.user!.id },
      include: { job: true },
      orderBy: { appliedDate: 'desc' }
    })
    return res.json(applications.map((a) => toResponse(a, a.job)))
  })
)

const updateSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
  interviewDate: z.string().datetime().optional()
})

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update data' })
    }

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true }
    })
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const isOwningCandidate = req.user!.role === 'candidate' && application.candidateId === req.user!.id
    const isOwningRecruiter = req.user!.role === 'recruiter' && application.recruiterId === req.user!.id
    if (!isOwningCandidate && !isOwningRecruiter) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes,
        interviewDate: parsed.data.interviewDate ? new Date(parsed.data.interviewDate) : undefined
      }
    })

    return res.json(toResponse(updated, application.job))
  })
)

export default router
