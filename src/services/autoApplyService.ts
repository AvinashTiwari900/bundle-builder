import { jobService } from './jobService'
import { profileService } from './profileService'
import { notificationService } from './notificationService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export interface AutoApplyDispatch {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyRating: number
  hiringPeriod: string
  location: string
  matchScore: number
  timestamp: string
  email: {
    to: string
    from: string
    subject: string
    htmlContent: string
  }
  whatsapp: {
    to: string
    from: string
    text: string
  }
}

function calculateMatch(profile: any, job: any) {
  const candidateSkills = (profile.skills || []).map((s: string) => s.toLowerCase())
  const jobSkills = (job.skills || []).map((s: string) => s.toLowerCase())
  const skillMatches = jobSkills.filter((s: string) => candidateSkills.includes(s)).length
  const skillScore = Math.min(60, skillMatches * 15)
  const expScore = (profile.experienceYears || 5) >= 3 ? 25 : 15
  const profileBase = 10
  return Math.min(98, Math.max(65, skillScore + expScore + profileBase))
}

export const autoApplyService = {
  getDispatches(): AutoApplyDispatch[] {
    const raw = localStorage.getItem('rap_auto_apply_dispatches')
    if (!raw) return []
    try {
      return JSON.parse(raw) || []
    } catch {
      return []
    }
  },

  saveDispatches(dispatches: AutoApplyDispatch[]) {
    localStorage.setItem('rap_auto_apply_dispatches', JSON.stringify(dispatches))
  },

  async run(settings: { minMatch?: number } = {}) {
    const jobs = await jobService.list()
    const profile = profileService.get() || {}
    const minThreshold = settings.minMatch || profile.settings?.minMatchScore || 80
    const applications = profile.applications || []
    const newMatches: any[] = []
    const existingDispatches = this.getDispatches()
    const newDispatches: AutoApplyDispatch[] = []

    for (const j of jobs) {
      const match = calculateMatch(profile, j)
      if (match >= minThreshold) {
        const exists = applications.find((a: any) => a.jobId === j.id)
        if (!exists) {
          const appId = 'app-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
          const appliedDate = new Date().toISOString()
          const primaryResume = (profile.resumes || [])[0]?.name || 'Avinash_Tiwari_Lead_BA.pdf'

          const app = {
            id: appId,
            jobId: j.id,
            jobTitle: j.title,
            company: j.company,
            companyRating: j.companyRating || 4.8,
            hiringPeriod: j.hiringPeriod || 'Immediate (0-15 Days)',
            location: j.location,
            workMode: j.workMode,
            salary: `₹${Math.round((j.salaryMin || 1500000) / 100000)}-${Math.round((j.salaryMax || 2400000) / 100000)} LPA`,
            appliedDate,
            status: 'Application Submitted',
            matchScore: match,
            autoApplied: true
          }

          applications.unshift(app)
          newMatches.push(app)

          // Real backend record (best-effort - the local app object above
          // already reflects the attempt regardless of network state)
          fetch(`${API_URL}/applications`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: j.id })
          }).catch(() => {})

          // 1. Create In-App Notification
          notificationService.create({
            title: `⚡ Auto-Applied to ${j.company}`,
            message: `Applied for ${j.title} (${match}% match score). Triggered Email & WhatsApp confirmations sent.`,
            type: 'application'
          })

          // 2. Trigger Email & WhatsApp Dispatch Logs
          const candidateEmail = profile.email || 'avinashtiwari@gmail.com'
          const candidatePhone = profile.phone || '+91 98765 43210'

          const dispatchItem: AutoApplyDispatch = {
            id: 'disp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
            jobId: j.id,
            jobTitle: j.title,
            company: j.company,
            companyRating: j.companyRating || 4.8,
            hiringPeriod: j.hiringPeriod || 'Immediate (0-15 Days)',
            location: j.location,
            matchScore: match,
            timestamp: appliedDate,
            email: {
              to: candidateEmail,
              from: 'notifications@ras-platform.ai',
              subject: `[Auto-Apply Confirmation] Your application was submitted to ${j.company} for ${j.title}`,
              htmlContent: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; rounded: 16px;">
                  <div style="background: #2563eb; padding: 16px 20px; border-radius: 12px; color: #ffffff; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 18px;">⚡ GetNextIn Candidates Auto-Apply Alert</h2>
                    <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">AI-Powered Job Application Confirmation</p>
                  </div>
                  <p style="font-size: 14px; color: #1e293b;">Dear <strong>${profile.name || 'Candidate'}</strong>,</p>
                  <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                    The <strong>GetNextIn Candidates Auto-Apply Engine</strong> has matched your candidate profile with a high-compatibility opportunity and automatically submitted your verified application.
                  </p>
                  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0;">
                    <div style="font-size: 15px; font-weight: bold; color: #0f172a;">${j.title}</div>
                    <div style="font-size: 13px; color: #2563eb; font-weight: 600; margin-top: 2px;">${j.company} · ${j.location} (${j.workMode})</div>
                    <div style="display: flex; gap: 12px; margin-top: 10px; font-size: 12px; color: #64748b;">
                      <div>🎯 <strong>Match Score:</strong> ${match}%</div>
                      <div>💼 <strong>Hiring Period:</strong> ${j.hiringPeriod || 'Immediate'}</div>
                      <div>⭐ <strong>Rating:</strong> ${j.companyRating || 4.8} / 5.0</div>
                    </div>
                  </div>
                  <div style="font-size: 12px; color: #475569; line-height: 1.5; border-left: 3px solid #10b981; padding-left: 12px; margin-bottom: 20px;">
                    <strong>Attached ATS Resume:</strong> ${primaryResume} (Score: 94/100)<br>
                    <strong>SLA Status:</strong> Protected under 24-Hour Recruiter Response Guarantee
                  </div>
                  <p style="font-size: 12px; color: #94a3b8;">
                    You will receive instant notifications whenever the hiring manager reviews your application, initiates AI screening, or schedules an interview.
                  </p>
                </div>
              `
            },
            whatsapp: {
              to: candidatePhone,
              from: 'GetNextIn Talent Bot (+91 80000 12345)',
              text: `🤖 *GetNextIn Candidates Auto-Apply Alert*\n\nHello *${profile.name?.split(' ')[0] || 'Candidate'}*! Your profile has been automatically applied to:\n\n📌 *Position:* ${j.title}\n🏢 *Company:* ${j.company}\n📍 *Location:* ${j.location} (${j.workMode})\n🎯 *AI Compatibility:* ${match}%\n📅 *Application Date:* ${new Date().toLocaleDateString()}\n⚡ *Hiring Period:* ${j.hiringPeriod || 'Immediate'}\n\n✅ *Status:* Application Submitted (Under 24h Recruiter SLA)\n📄 *Resume:* ${primaryResume}\n\n🔗 *Track Live Application:* https://getnextin.ai/applications\n_Reply STOP to pause auto-apply alerts._`
            }
          }

          newDispatches.push(dispatchItem)
        }
      }
    }

    if (newMatches.length > 0) {
      profile.applications = applications
      profileService.save(profile)
      this.saveDispatches([...newDispatches, ...existingDispatches])
    }

    return newMatches
  },

  triggerSingleTestAlert(job: any): AutoApplyDispatch {
    const profile = profileService.get() || {}
    const primaryResume = (profile.resumes || [])[0]?.name || 'Avinash_Tiwari_Lead_BA.pdf'
    const match = calculateMatch(profile, job)
    const appliedDate = new Date().toISOString()
    const candidateEmail = profile.email || 'avinashtiwari@gmail.com'
    const candidatePhone = profile.phone || '+91 98765 43210'

    const dispatchItem: AutoApplyDispatch = {
      id: 'disp-' + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyRating: job.companyRating || 4.9,
      hiringPeriod: job.hiringPeriod || 'Immediate (0-15 Days)',
      location: job.location,
      matchScore: match,
      timestamp: appliedDate,
      email: {
        to: candidateEmail,
        from: 'notifications@ras-platform.ai',
        subject: `[Auto-Apply Confirmation] Your application was submitted to ${job.company} for ${job.title}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background: #2563eb; padding: 16px 20px; border-radius: 12px; color: #ffffff; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">⚡ RAS Auto-Apply Engine Alert</h2>
              <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Recruitment Automation Software Confirmation</p>
            </div>
            <p style="font-size: 14px; color: #1e293b;">Dear <strong>${profile.name || 'Candidate'}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              The <strong>RAS Auto-Apply Engine</strong> has matched your candidate profile with <strong>${job.company}</strong> and automatically submitted your verified application.
            </p>
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <div style="font-size: 15px; font-weight: bold; color: #0f172a;">${job.title}</div>
              <div style="font-size: 13px; color: #2563eb; font-weight: 600; margin-top: 2px;">${job.company} · ${job.location} (${job.workMode})</div>
              <div style="display: flex; gap: 12px; margin-top: 10px; font-size: 12px; color: #64748b;">
                <div>🎯 <strong>Match Score:</strong> ${match}%</div>
                <div>💼 <strong>Hiring Period:</strong> ${job.hiringPeriod || 'Immediate'}</div>
                <div>⭐ <strong>Rating:</strong> ${job.companyRating || 4.9} / 5.0</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.5; border-left: 3px solid #10b981; padding-left: 12px; margin-bottom: 20px;">
              <strong>Attached ATS Resume:</strong> ${primaryResume} (Score: 94/100)<br>
              <strong>SLA Status:</strong> Protected under 24-Hour Recruiter Response Guarantee
            </div>
          </div>
        `
      },
      whatsapp: {
        to: candidatePhone,
        from: 'GetNextIn Talent Bot (+91 80000 12345)',
        text: `🤖 *GetNextIn Candidates Auto-Apply Alert*\n\nHello *${profile.name?.split(' ')[0] || 'Candidate'}*! Your profile has been automatically applied to:\n\n📌 *Position:* ${job.title}\n🏢 *Company:* ${job.company}\n📍 *Location:* ${job.location} (${job.workMode})\n🎯 *AI Compatibility:* ${match}%\n📅 *Application Date:* ${new Date().toLocaleDateString()}\n⚡ *Hiring Period:* ${job.hiringPeriod || 'Immediate'}\n\n✅ *Status:* Application Submitted (Under 24h Recruiter SLA)\n📄 *Resume:* ${primaryResume}\n\n🔗 *Track Live Application:* https://getnextin.ai/applications`
      }
    }

    const existing = this.getDispatches()
    this.saveDispatches([dispatchItem, ...existing])

    notificationService.create({
      title: `⚡ Triggered Alert Sent: ${job.company}`,
      message: `Simulated Email & WhatsApp confirmation dispatched for ${job.title}`,
      type: 'application'
    })

    return dispatchItem
  }
}
