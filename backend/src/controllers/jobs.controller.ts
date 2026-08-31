import { Request, Response } from 'express'
import { db } from '../config/db'

export class JobsController {
  static async listJobs(req: Request, res: Response) {
    const { q, location, workType, minSalary, hiringPeriod, minRating } = req.query
    let results = [...db.jobs]

    // 1. Keyword search (Title, Company, Skills)
    if (q && typeof q === 'string') {
      const term = q.toLowerCase().trim()
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term) ||
          j.skillsRequired.some((s) => s.toLowerCase().includes(term))
      )
    }

    // 2. Location-Based Search (City, State, Country, e.g. Ahmedabad, Mumbai, Bengaluru, Delhi, Pune, Gujarat, Maharashtra, India)
    if (location && typeof location === 'string' && location !== 'All' && location.trim()) {
      const locTerm = location.toLowerCase().trim()
      results = results.filter((j) => {
        const jLoc = j.location.toLowerCase()
        return jLoc.includes(locTerm) || (locTerm === 'remote' && j.workType === 'Remote')
      })

      // Prioritize exact/strong location matches
      results.sort((a, b) => {
        const aExact = a.location.toLowerCase().startsWith(locTerm) ? 1 : 0
        const bExact = b.location.toLowerCase().startsWith(locTerm) ? 1 : 0
        return bExact - aExact
      })
    }

    // 3. Work Mode / Job Site Type Filter (Remote, Hybrid, On-site)
    if (workType && typeof workType === 'string' && workType !== 'All' && workType.trim()) {
      const normalizedWorkType = workType.toLowerCase().replace(/[-_]/g, '')
      results = results.filter((j) => {
        const jWorkType = j.workType.toLowerCase().replace(/[-_]/g, '')
        return jWorkType === normalizedWorkType
      })
    }

    // 4. Minimum Salary Filter
    if (minSalary) {
      results = results.filter((j) => j.salaryMax >= Number(minSalary))
    }

    // 5. Hiring Period Filter
    if (hiringPeriod && typeof hiringPeriod === 'string' && hiringPeriod !== 'All' && hiringPeriod !== 'All Periods') {
      results = results.filter((j) => j.hiringPeriod.toLowerCase().includes(hiringPeriod.toLowerCase()) || hiringPeriod.toLowerCase().includes(j.hiringPeriod.toLowerCase()))
    }

    // 6. Minimum Rating Filter
    if (minRating) {
      results = results.filter((j) => j.hiringRating >= Number(minRating))
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      jobs: results
    })
  }

  static async getJobById(req: Request, res: Response) {
    const { id } = req.params
    const job = db.jobs.find((j) => j.id === id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' })
    }

    return res.status(200).json({
      success: true,
      job
    })
  }
}
