import { seedData } from '../mock/seed'
import { API_BASE_URL } from '../config/api.config'

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: number
  endYear: number
  grade?: string
}

export interface ExperienceEntry {
  id: string
  company: string
  position: string
  location?: string
  workType?: 'Remote' | 'Hybrid' | 'On-site'
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  skillsUsed?: string[]
}

export interface ProjectEntry {
  id: string
  title: string
  description: string
  role?: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  imageUrl?: string
}

export const profileService = {
  get() {
    const raw = localStorage.getItem('rap_profile')
    if (!raw) {
      seedData()
      const after = localStorage.getItem('rap_profile')
      return after ? JSON.parse(after) : null
    }
    try {
      const parsed = JSON.parse(raw)
      if (parsed) {
        parsed.socials = parsed.socials || {}

        // Normalize experience years to always be non-negative
        if (parsed.totalExperienceYears !== undefined && parsed.totalExperienceYears !== null) {
          parsed.totalExperienceYears = Math.max(0, Math.min(50, Number(parsed.totalExperienceYears) || 0))
          parsed.experienceYears = parsed.totalExperienceYears
        } else if (parsed.experienceYears !== undefined && parsed.experienceYears !== null) {
          parsed.experienceYears = Math.max(0, Math.min(50, Number(parsed.experienceYears) || 0))
          parsed.totalExperienceYears = parsed.experienceYears
        } else {
          parsed.totalExperienceYears = 0
          parsed.experienceYears = 0
        }

        // Normalize social URLs so they are never lost between formats
        parsed.githubUrl = parsed.githubUrl !== undefined ? parsed.githubUrl : (parsed.socials.github || '')
        parsed.linkedinUrl = parsed.linkedinUrl !== undefined ? parsed.linkedinUrl : (parsed.socials.linkedin || '')
        parsed.portfolioUrl = parsed.portfolioUrl !== undefined ? parsed.portfolioUrl : (parsed.socials.portfolioUrl || '')
        parsed.socials = {
          github: parsed.githubUrl,
          linkedin: parsed.linkedinUrl,
          portfolioUrl: parsed.portfolioUrl
        }

        // Ensure arrays exist
        parsed.education = parsed.education || [
          {
            id: 'edu-01',
            institution: 'Birla Institute of Technology and Science (BITS), Pilani',
            degree: 'Master of Technology (M.Tech)',
            fieldOfStudy: 'Data Analytics & Software Engineering',
            startYear: 2018,
            endYear: 2020,
            grade: '9.2 CGPA'
          },
          {
            id: 'edu-02',
            institution: 'Gujarat Technological University (GTU)',
            degree: 'Bachelor of Engineering (B.E.)',
            fieldOfStudy: 'Computer Science and Information Technology',
            startYear: 2014,
            endYear: 2018,
            grade: '8.8 CGPA'
          }
        ]
        parsed.experience = parsed.experience || [
          {
            id: 'exp-01',
            company: 'Northstar Analytics Corp',
            position: 'Lead Business Analyst & Analytics Engineer',
            location: 'Bengaluru, India',
            workType: 'Hybrid',
            startDate: '2021-08',
            endDate: '',
            isCurrent: true,
            description: 'Leading data transformation initiatives, automated reconciliation engines, and executive dashboard strategies across cross-functional engineering teams.',
            skillsUsed: ['SQL', 'Snowflake', 'Python', 'dbt', 'Power BI']
          },
          {
            id: 'exp-02',
            company: 'FinApex Solutions Ltd',
            position: 'Senior Systems & Data Analyst',
            location: 'Mumbai, India',
            workType: 'On-site',
            startDate: '2019-06',
            endDate: '2021-07',
            isCurrent: false,
            description: 'Engineered automated ETL pipelines for payment reconciliation, slashing batch exception investigation time by 75%.',
            skillsUsed: ['PostgreSQL', 'Python', 'JIRA', 'Agile']
          }
        ]
        parsed.projects = parsed.projects || [
          {
            id: 'proj-01',
            title: 'Real-Time Payment Reconciliation Engine',
            description: 'Distributed microservice pipeline synchronizing 10M+ daily payment gateway transactions with zero reconciliation slippage.',
            role: 'Lead Architect & Business Analyst',
            technologies: ['Snowflake', 'dbt', 'SQL', 'Python', 'Power BI'],
            liveUrl: 'https://avinash-tiwari.dev/projects/payment-recon',
            githubUrl: 'https://github.com/AvinashTiwari900/payment-recon-engine'
          },
          {
            id: 'proj-02',
            title: 'Omnichannel B2B Fulfillment Dashboard',
            description: 'Interactive executive analytics suite tracking multi-warehouse inventory turnover and freight SLA adherence.',
            role: 'Product Analytics Lead',
            technologies: ['Tableau', 'PostgreSQL', 'Python'],
            liveUrl: 'https://avinash-tiwari.dev/projects/fulfillment-dashboard',
            githubUrl: 'https://github.com/AvinashTiwari900/b2b-fulfillment-analytics'
          }
        ]
      }
      return parsed
    } catch {
      seedData(true)
      return JSON.parse(localStorage.getItem('rap_profile')!)
    }
  },

  save(profile: any) {
    if (profile) {
      if (profile.totalExperienceYears !== undefined && profile.totalExperienceYears !== null) {
        profile.totalExperienceYears = Math.max(0, Math.min(50, Number(profile.totalExperienceYears) || 0))
        profile.experienceYears = profile.totalExperienceYears
      } else if (profile.experienceYears !== undefined && profile.experienceYears !== null) {
        profile.experienceYears = Math.max(0, Math.min(50, Number(profile.experienceYears) || 0))
        profile.totalExperienceYears = profile.experienceYears
      }

      profile.githubUrl = profile.githubUrl !== undefined ? profile.githubUrl : (profile.socials?.github || '')
      profile.linkedinUrl = profile.linkedinUrl !== undefined ? profile.linkedinUrl : (profile.socials?.linkedin || '')
      profile.portfolioUrl = profile.portfolioUrl !== undefined ? profile.portfolioUrl : (profile.socials?.portfolioUrl || '')
      profile.socials = {
        github: profile.githubUrl,
        linkedin: profile.linkedinUrl,
        portfolioUrl: profile.portfolioUrl
      }
    }
    localStorage.setItem('rap_profile', JSON.stringify(profile))
    
    // Asynchronously synchronize with backend API
    try {
      fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch(() => {})
    } catch (e) {}

    return profile
  },

  update(partial: any) {
    const current = this.get() || {}
    const updated = { ...current, ...partial }
    this.save(updated)
    return updated
  }
}
