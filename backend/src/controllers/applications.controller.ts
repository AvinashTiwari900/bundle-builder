import { Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Application, ApplicationStage } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export class ApplicationsController {
  static async getMyApplications(req: AuthenticatedRequest, res: Response) {
    const candidateId = req.user?.userId || 'usr-candidate-default-01'
    const apps = db.applications.filter((a) => a.candidateId === candidateId)

    return res.status(200).json({
      success: true,
      count: apps.length,
      applications: apps
    })
  }

  static async apply(req: AuthenticatedRequest, res: Response) {
    const candidateId = req.user?.userId || 'usr-candidate-default-01'
    const { jobId } = req.body

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required.' })
    }

    const job = db.jobs.find((j) => j.id === jobId)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    const existing = db.applications.find((a) => a.candidateId === candidateId && a.jobId === jobId)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this position.',
        application: existing
      })
    }

    const newApp: Application = {
      id: `app-${uuidv4().slice(0, 8)}`,
      jobId,
      candidateId,
      jobTitle: job.title,
      company: job.company,
      currentStage: 'Application Submitted',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaExpiresAt: new Date(Date.now() + 86400000 * 1).toISOString(), // 24-Hour SLA
      recruiterNotes: 'Application received via 1-Click Fast Apply.',
      stageHistory: [
        {
          stage: 'Application Submitted',
          timestamp: new Date().toISOString(),
          note: 'Application initiated by candidate.'
        }
      ]
    }

    db.applications.unshift(newApp)
    job.applicantsCount += 1

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! 24-hour recruiter SLA timer activated.',
      application: newApp
    })
  }

  static async updateStage(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const { stage, note } = req.body

    const validStages: ApplicationStage[] = [
      'Application Submitted',
      'Resume Screening',
      'AI Screening',
      'Shortlisted',
      'Interview Scheduled',
      'Interview in Progress',
      'Interview Completed',
      'Under Review',
      'Selected / Offer',
      'Rejected',
      'On Hold'
    ]

    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage. Must be one of: ${validStages.join(', ')}` })
    }

    const app = db.applications.find((a) => a.id === id)
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' })
    }

    app.currentStage = stage
    app.updatedAt = new Date().toISOString()
    app.stageHistory.push({
      stage,
      timestamp: new Date().toISOString(),
      note: note || undefined
    })

    return res.status(200).json({
      success: true,
      message: `Application moved to stage: ${stage}`,
      application: app
    })
  }
}
