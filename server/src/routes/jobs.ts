import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { q, location, workMode, employmentType, skills, experienceMin, salaryMin, hiringPeriod, minRating, sort } =
      req.query as Record<string, string | undefined>

    const where: any = { status: 'open' }

    if (q) {
      const term = q.trim()
      if (term) {
        where.OR = [
          { title: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { skills: { has: term } }
        ]
      }
    }
    if (location && location !== 'all') {
      where.location = { equals: location, mode: 'insensitive' }
    }
    if (workMode && workMode !== 'all') {
      where.workMode = { equals: workMode, mode: 'insensitive' }
    }
    if (employmentType && employmentType !== 'all') {
      where.employmentType = { equals: employmentType, mode: 'insensitive' }
    }
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
      if (skillList.length) where.skills = { hasEvery: skillList }
    }
    if (salaryMin) {
      where.salaryMax = { gte: Number(salaryMin) }
    }
    if (hiringPeriod && hiringPeriod !== 'all') {
      where.hiringPeriod = { contains: hiringPeriod, mode: 'insensitive' }
    }
    if (minRating) {
      where.companyRating = { gte: Number(minRating) }
    }

    let orderBy: any = { postedDate: 'desc' }
    if (sort === 'salary_desc') orderBy = { salaryMax: 'desc' }
    if (sort === 'salary_asc') orderBy = { salaryMin: 'asc' }
    if (sort === 'rating_desc') orderBy = { companyRating: 'desc' }

    let jobs = await prisma.job.findMany({ where, orderBy })

    // experienceMin filters against a free-text "N yrs" field - easiest done in JS
    if (experienceMin) {
      const min = Number(experienceMin)
      jobs = jobs.filter((j) => {
        const m = (j.experience || '').match(/(\d+)/)
        return !m || Number(m[0]) >= min
      })
    }

    return res.json(jobs)
  })
)

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } })
    if (!job) return res.status(404).json({ error: 'Job not found' })
    return res.json(job)
  })
)

export default router
