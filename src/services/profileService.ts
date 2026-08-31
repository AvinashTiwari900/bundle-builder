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
            company: 'FinScale Technologies',
            position: 'Lead Business Analyst',
            location: 'Bengaluru, India',
            workType: 'Hybrid',
            startDate: '2022-04-01',
            isCurrent: true,
            description: 'Spearheaded automated reconciliation pipelines across ₹800 Cr monthly GMV, cutting end-of-day discrepancy resolution from 4 hours to 6 minutes.',
            skillsUsed: ['Snowflake', 'SQL', 'dbt', 'Power BI', 'Agile']
          },
          {
            id: 'exp-02',
            company: 'Cognizant Technology Solutions',
            position: 'Senior Systems Analyst',
            location: 'Pune, India',
            workType: 'On-site',
            startDate: '2019-06-01',
            endDate: '2022-03-31',
            isCurrent: false,
            description: 'Authored technical specification documents and oversaw 14 sprints for cloud payment gateway integration.',
            skillsUsed: ['Business Analysis', 'Jira', 'SQL', 'UML Modeling']
          }
        ]
        parsed.projects = parsed.projects || [
          {
            id: 'proj-01',
            title: 'Automated Payment Reconciliation Engine',
            description: 'A cloud-native telemetry pipeline delivering real-time anomaly detection and ledger settlement on Snowflake and dbt.',
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

