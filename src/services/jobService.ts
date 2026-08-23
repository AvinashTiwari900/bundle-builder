import { jobs as fallbackJobs } from '../mock/jobs'
import { profileService } from './profileService'
import { notificationService } from './notificationService'

export const jobService = {
  async list() {
    const raw = localStorage.getItem('rap_jobs')
    if (!raw) {
      localStorage.setItem('rap_jobs', JSON.stringify(fallbackJobs))
      return fallbackJobs
    }
    try {
      const parsed = JSON.parse(raw)
      return parsed.length ? parsed : fallbackJobs
    } catch {
      return fallbackJobs
    }
  },

  async get(id: string) {
    const all = await this.list()
    return all.find((j: any) => j.id === id) || null
  },

  async isSaved(id: string) {
    const profile = profileService.get()
    const saved = profile?.savedJobs || []
    return saved.includes(id)
  },

  async toggleSave(id: string) {
    const profile = profileService.get() || { savedJobs: [] }
    let saved = profile.savedJobs || []
    let isNowSaved = false
    if (saved.includes(id)) {
      saved = saved.filter((jId: string) => jId !== id)
      isNowSaved = false
    } else {
      saved.push(id)
      isNowSaved = true
    }
    profile.savedJobs = saved
    profileService.save(profile)
    return isNowSaved
  },

  async applyToJob(jobId: string, customNotes?: string) {
    const profile = profileService.get() || { applications: [] }
    const applications = profile.applications || []
    const exists = applications.find((a: any) => a.jobId === jobId)
    if (exists) {
      return { success: false, message: 'Already applied for this position' }
    }

    const job = await this.get(jobId)
    if (!job) {
      return { success: false, message: 'Job not found' }
    }

    const newApp = {
      id: 'app-' + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      workMode: job.workMode,
      salary: `₹${Math.round((job.salaryMin || 1500000) / 100000)}-${Math.round((job.salaryMax || 2400000) / 100000)} LPA`,
      appliedDate: new Date().toISOString(),
      status: 'Applied',
      matchScore: Math.floor(Math.random() * 12) + 84,
      notes: customNotes || ''
    }

    profile.applications = [newApp, ...applications]
    profileService.save(profile)

    notificationService.create({
      title: 'Application Submitted! 🚀',
      message: `Your application for ${job.title} at ${job.company} was submitted successfully.`,
      type: 'application'
    })

    return { success: true, application: newApp }
  },

  async search(q: string, filters: any = {}) {
    const all = await this.list()
    const term = (q || '').trim().toLowerCase()
    let res = all.filter((j: any) => {
      if (!term) return true
      return [
        j.title,
        j.company,
        j.location || '',
        j.description || '',
        ...(j.skills || [])
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    if (filters.location && filters.location !== 'all') {
      res = res.filter((j: any) => j.location.toLowerCase() === filters.location.toLowerCase())
    }
    if (filters.skills && filters.skills.length) {
      res = res.filter((j: any) =>
        filters.skills.every((s: string) =>
          (j.skills || []).map((x: string) => x.toLowerCase()).includes(s.toLowerCase())
        )
      )
    }
    if (filters.workMode && filters.workMode !== 'all') {
      res = res.filter((j: any) => j.workMode.toLowerCase() === filters.workMode.toLowerCase())
    }
    if (filters.employmentType && filters.employmentType !== 'all') {
      res = res.filter((j: any) => j.employmentType.toLowerCase() === filters.employmentType.toLowerCase())
    }
    if (filters.experienceMin) {
      res = res.filter((j: any) => {
        const m = String(j.experience || '').match(/(\d+)/)
        if (!m) return true
        return Number(m[0]) >= Number(filters.experienceMin)
      })
    }
    if (filters.salaryMin) {
      res = res.filter((j: any) => Number(j.salaryMax || 0) >= Number(filters.salaryMin))
    }

    // Sorting
    if (filters.sort === 'latest') {
      res = res.sort((a: any, b: any) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    } else if (filters.sort === 'salary_desc') {
      res = res.sort((a: any, b: any) => (b.salaryMax || 0) - (a.salaryMax || 0))
    } else if (filters.sort === 'salary_asc') {
      res = res.sort((a: any, b: any) => (a.salaryMin || 0) - (b.salaryMin || 0))
    }
    return res
  }
}
