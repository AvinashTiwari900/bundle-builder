import { Request, Response } from 'express'
import { db } from '../config/db'

export class JobsController {
  static async listJobs(req: Request, res: Response) {
    const { q, minSalary, workType, hiringPeriod, minRating } = req.query
    let results = [...db.jobs]

    if (q && typeof q === 'string') {
      const term = q.toLowerCase()
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term) ||
          j.skillsRequired.some((s) => s.toLowerCase().includes(term))
      )
    }

    if (minSalary) {
      results = results.filter((j) => j.salaryMax >= Number(minSalary))
    }

    if (workType && typeof workType === 'string' && workType !== 'All') {
      results = results.filter((j) => j.workType.toLowerCase() === workType.toLowerCase())
    }

    if (hiringPeriod && typeof hiringPeriod === 'string' && hiringPeriod !== 'All') {
      results = results.filter((j) => j.hiringPeriod.toLowerCase() === hiringPeriod.toLowerCase())
    }

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
