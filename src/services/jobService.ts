import { jobs as fallbackJobs } from '../mock/jobs'
import { profileService } from './profileService'
import { notificationService } from './notificationService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

function filterJobsLocally(all: any[], q: string, filters: any = {}) {
  const term = (q || '').trim().toLowerCase()
  let res = all.filter((j: any) => {
    if (!term) return true
    return [j.title, j.company, j.location || '', j.description || '', j.hiringPeriod || '', ...(j.skills || [])]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })

  if (filters.location && filters.location !== 'all') {
    res = res.filter((j: any) => j.location.toLowerCase() === filters.location.toLowerCase())
  }
  if (filters.skills && filters.skills.length) {
    res = res.filter((j: any) =>
      filters.skills.every((s: string) => (j.skills || []).map((x: string) => x.toLowerCase()).includes(s.toLowerCase()))
    )
  }
  if (filters.workMode && filters.workMode !== 'all') {
    res = res.filter((j: any) => j.workMode.toLowerCase() === filters.workMode.toLowerCase())
  }
  if (filters.hiringPeriod && filters.hiringPeriod !== 'all') {
    res = res.filter((j: any) => j.hiringPeriod?.toLowerCase()?.includes(filters.hiringPeriod.toLowerCase()))
  }
  if (filters.minRating) {
    res = res.filter((j: any) => (j.companyRating || 0) >= Number(filters.minRating))
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

  if (filters.sort === 'latest') {
    res = res.sort((a: any, b: any) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
  } else if (filters.sort === 'rating_desc') {
    res = res.sort((a: any, b: any) => (b.companyRating || 0) - (a.companyRating || 0))
  } else if (filters.sort === 'salary_desc') {
    res = res.sort((a: any, b: any) => (b.salaryMax || 0) - (a.salaryMax || 0))
  } else if (filters.sort === 'salary_asc') {
    res = res.sort((a: any, b: any) => (a.salaryMin || 0) - (b.salaryMin || 0))
  }
  return res
}

function cachedOrFallbackJobs(): any[] {
  const raw = localStorage.getItem('ras_jobs')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      // Re-sync if cached data predates fields the UI now expects
      if (!parsed.length || !parsed[0].companyRating || !parsed[0].hiringPeriod) {
        localStorage.setItem('ras_jobs', JSON.stringify(fallbackJobs))
        return fallbackJobs
      }
      return parsed
    } catch {
      /* fall through to fallback */
    }
  }
  return fallbackJobs
}

export const jobService = {
  async list() {
    try {
      const res = await apiFetch('/jobs')
      if (res.ok) {
        const jobs = await res.json()
        localStorage.setItem('ras_jobs', JSON.stringify(jobs))
        return jobs
      }
    } catch {
      /* backend unreachable - fall back to cached/mock jobs below */
    }
    return cachedOrFallbackJobs()
  },

  async get(id: string) {
    try {
      const res = await apiFetch(`/jobs/${id}`)
      if (res.ok) return await res.json()
      if (res.status === 404) return null
    } catch {
      /* backend unreachable - fall back below */
    }
    const all = cachedOrFallbackJobs()
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
      saved = [...saved, id]
      isNowSaved = true
    }
    profile.savedJobs = saved
    profileService.save(profile)

    apiFetch('/candidates/me', { method: 'PUT', body: JSON.stringify({ savedJobs: saved }) }).catch(() => {})

    return isNowSaved
  },

  async applyToJob(jobId: string, customNotes?: string) {
    try {
      const res = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, notes: customNotes })
      })

      if (res.status === 409) {
        return { success: false, message: 'Already applied for this position' }
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, message: err.error || 'Unable to submit application' }
      }

      const application = await res.json()

      // Mirror into the local profile cache so Dashboard/Applications keep working unchanged
      const profile = profileService.get() || { applications: [] }
      profile.applications = [application, ...(profile.applications || []).filter((a: any) => a.id !== application.id)]
      profileService.save(profile)

      notificationService.create({
        title: 'Application Submitted! 🚀',
        message: `Your application for ${application.jobTitle} at ${application.company} was submitted successfully. Track status on your pipeline.`,
        type: 'application'
      })

      return {
        success: true,
        application,
        message: `Your application for ${application.jobTitle} at ${application.company} was submitted successfully.`
      }
    } catch {
      return { success: false, message: 'Unable to reach the server. Please check your connection and try again.' }
    }
  },

  // Refreshes the local applications cache from the backend (source of truth).
  async listMyApplications() {
    try {
      const res = await apiFetch('/applications/me')
      if (res.ok) {
        const applications = await res.json()
        const profile = profileService.get() || {}
        profile.applications = applications
        profileService.save(profile)
        return applications
      }
    } catch {
      /* backend unreachable - fall back to whatever's cached locally */
    }
    return profileService.get()?.applications || []
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    try {
      const res = await apiFetch(`/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      if (res.ok) return await res.json()
    } catch {
      /* best-effort - caller already updates the local cache regardless */
    }
    return null
  },

  async search(q: string, filters: any = {}) {
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (filters.location && filters.location !== 'all') params.set('location', filters.location)
      if (filters.skills?.length) params.set('skills', filters.skills.join(','))
      if (filters.workMode && filters.workMode !== 'all') params.set('workMode', filters.workMode)
      if (filters.hiringPeriod && filters.hiringPeriod !== 'all') params.set('hiringPeriod', filters.hiringPeriod)
      if (filters.minRating) params.set('minRating', String(filters.minRating))
      if (filters.employmentType && filters.employmentType !== 'all') params.set('employmentType', filters.employmentType)
      if (filters.experienceMin) params.set('experienceMin', String(filters.experienceMin))
      if (filters.salaryMin) params.set('salaryMin', String(filters.salaryMin))
      if (filters.sort) params.set('sort', filters.sort)

      const res = await apiFetch(`/jobs?${params.toString()}`)
      if (res.ok) return await res.json()
    } catch {
      /* backend unreachable - fall back to local filtering below */
    }
    return filterJobsLocally(cachedOrFallbackJobs(), q, filters)
  }
}
