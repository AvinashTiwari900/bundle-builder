import { profileService } from './profileService'
import { notificationService } from './notificationService'

// ============================================================================
// Types & Centralized Application Data Model
// ============================================================================

export type ApplicationStage =
  | 'Applied'
  | 'Application Submitted'
  | 'Resume Screening'
  | 'AI Screening'
  | 'Shortlisted'
  | 'Interview'
  | 'Interview Scheduled'
  | 'Technical Round'
  | 'Interview in Progress'
  | 'Interview Completed'
  | 'HR Round'
  | 'Under Review'
  | 'Selected'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'On Hold'

export interface ApplicationTimelineEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  status: ApplicationStage
  type?: 'stage_change' | 'interview' | 'screening' | 'document' | 'communication' | 'system'
  icon?: string
}

export interface ApplicationCommunication {
  id: string
  channel: 'email' | 'whatsapp' | 'in_app'
  title: string
  date: string
  status: 'Delivered' | 'Read' | 'Sent' | 'Scheduled'
  recipient?: string
  content?: string
}

export interface ApplicationDocument {
  id: string
  name: string
  type: string
  fileUrl: string
  size?: string
  uploadedAt: string
  isVerified?: boolean
}

export interface ApplicationNextAction {
  type: 'interview' | 'action_required' | 'waiting' | 'offer' | 'feedback' | 'none'
  title: string
  description?: string
  date?: string
  time?: string
  actionLabel?: string
  actionUrl?: string
  secondaryActionLabel?: string
  secondaryActionUrl?: string
}

export interface ApplicationInterview {
  id?: string
  type: 'AI Interview' | 'Technical Round' | 'HR Round' | 'System Design' | 'Executive Round'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending'
  date?: string
  time?: string
  durationMinutes?: number
  mode?: 'In-Platform AI' | 'WebRTC Live Meeting' | 'Phone Call'
  meetingUrl?: string
  instructions?: string
  interviewerName?: string
  interviewerRole?: string
}

export interface ApplicationSLA {
  enabled: boolean
  deadline: string // ISO string
  hoursLimit: number
}

export interface ApplicationMatchBreakdown {
  overall: number
  skills: number
  experience: number
  location: number
  education: number
  strengths: string[]
  gaps: string[]
}

export interface CandidateApplication {
  id: string
  jobId: string
  company: string
  companyLogo?: string
  companyRating?: number
  jobTitle: string
  location: string
  workMode: 'Remote' | 'Hybrid' | 'Onsite' | 'On-site'
  salary: string
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship'

  matchScore: number
  matchBreakdown: ApplicationMatchBreakdown

  applicationSource: 'manual' | 'auto_apply'
  status: ApplicationStage

  appliedAt: string // ISO timestamp
  lastUpdated: string // ISO timestamp
  notes?: string
  jobDescription?: string
  requiredSkills: string[]
  resumeUsed?: string
  resumeUrl?: string

  nextAction?: ApplicationNextAction
  interview?: ApplicationInterview
  timeline: ApplicationTimelineEvent[]
  communications: ApplicationCommunication[]
  documents: ApplicationDocument[]
  sla?: ApplicationSLA
  rejectionReason?: string
  withdrawalReason?: string
  offerDetails?: {
    offeredSalary: string
    joiningDate: string
    deadline: string
    letterUrl?: string
  }
}

export interface ApplicationKPIs {
  total: number
  active: number
  shortlisted: number
  interviews: number
  offers: number
  awaitingResponse: number
  rejected: number
  withdrawn: number
}

// ============================================================================
// Initial Mock Seed Data
// ============================================================================

const DEFAULT_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'APP-1001',
    jobId: 'job-1',
    company: 'Northstar Analytics',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.9,
    jobTitle: 'Senior Business Analyst',
    location: 'Hyderabad, India',
    workMode: 'Hybrid',
    salary: '₹20–26 LPA',
    employmentType: 'Full-time',
    matchScore: 94,
    matchBreakdown: {
      overall: 94,
      skills: 96,
      experience: 92,
      location: 100,
      education: 100,
      strengths: ['Advanced SQL Modeling', 'Power BI Dashboards', 'BRD & FRD Authoring', 'Agile / Scrum', 'Data Reconciliation'],
      gaps: ['Snowflake Streams (Minor)']
    },
    applicationSource: 'manual',
    status: 'Interview Scheduled',
    appliedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    requiredSkills: ['SQL', 'Power BI', 'Business Analysis', 'ETL Validation', 'Agile'],
    jobDescription:
      'We are looking for a Senior Business Analyst to partner with executive leadership, lead sprint grooming, build telemetry dashboards, and bridge product strategy with data engineering teams.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'interview',
      title: 'Technical Round with Panel',
      description: 'Scheduled with Karthik Iyer (Director of Analytics) on Thursday at 3:00 PM IST.',
      date: 'Thursday, 03 Sep 2026',
      time: '3:00 PM IST',
      actionLabel: 'Join Live Meeting',
      actionUrl: '/meetings',
      secondaryActionLabel: 'Prepare in Studio',
      secondaryActionUrl: '/interview-practice/setup?type=Technical'
    },
    interview: {
      id: 'meet-101',
      type: 'Technical Round',
      status: 'scheduled',
      date: 'Thursday, 03 Sep 2026',
      time: '3:00 PM IST',
      durationMinutes: 45,
      mode: 'WebRTC Live Meeting',
      meetingUrl: '/meetings',
      interviewerName: 'Karthik Iyer',
      interviewerRole: 'Director of Analytics Engineering',
      instructions: 'Please ensure camera and mic are tested beforehand. Be prepared to discuss past ETL telemetry optimizations and SQL queries.'
    },
    timeline: [
      {
        id: 'tl-1',
        title: 'Technical Interview Scheduled',
        description: 'Recruiter panel scheduled a 45-minute live technical discussion.',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'Interview Scheduled',
        type: 'interview'
      },
      {
        id: 'tl-2',
        title: 'Candidate Shortlisted',
        description: 'Hiring manager reviewed screening scorecard and shortlisted profile.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'Shortlisted',
        type: 'stage_change'
      },
      {
        id: 'tl-3',
        title: 'AI Screening Completed',
        description: 'Candidate scored 91/100 in initial domain assessment.',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        status: 'AI Screening',
        type: 'screening'
      },
      {
        id: 'tl-4',
        title: 'Application Submitted',
        description: 'Application successfully received with primary resume version v3.',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-1',
        channel: 'email',
        title: 'Interview Invitation — Senior Business Analyst',
        date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Hi Avinash, your technical interview with Northstar Analytics has been scheduled for Thursday at 3:00 PM IST.'
      },
      {
        id: 'comm-2',
        channel: 'whatsapp',
        title: 'Round Confirmation Reminder',
        date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: '+91 98765 43210',
        content: 'Northstar Analytics: Interview scheduled on RAS for Thu 3:00 PM. Link: https://ras.ai/meet/meet-101'
      },
      {
        id: 'comm-3',
        channel: 'email',
        title: 'Application Received Confirmation',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Thank you for applying to Northstar Analytics. 24h recruiter response SLA active.'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Primary Resume',
        size: '245 KB',
        fileUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
        uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      },
      {
        id: 'doc-2',
        name: 'Cover_Letter_Northstar.pdf',
        type: 'Cover Letter',
        size: '120 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      },
      {
        id: 'doc-3',
        name: 'NIT_Degree_Certificate.pdf',
        type: 'Education Proof',
        size: '512 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      },
      {
        id: 'doc-4',
        name: 'OTP_KYC_Verification_Badge',
        type: 'Identity Verification',
        size: '18 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ],
    sla: {
      enabled: true,
      hoursLimit: 24,
      deadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'APP-1002',
    jobId: 'job-3',
    company: 'Lattice Labs',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.7,
    jobTitle: 'Product Data Analyst',
    location: 'Bengaluru, India',
    workMode: 'Remote',
    salary: '₹22–28 LPA',
    employmentType: 'Full-time',
    matchScore: 91,
    matchBreakdown: {
      overall: 91,
      skills: 94,
      experience: 90,
      location: 100,
      education: 95,
      strengths: ['Product Funnel Analytics', 'SQL & Python', 'Cohort Retention', 'A/B Experimentation'],
      gaps: ['Mixpanel Custom Integrations']
    },
    applicationSource: 'auto_apply',
    status: 'AI Screening',
    appliedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Cohort Analytics', 'A/B Testing'],
    jobDescription:
      'Lattice Labs is searching for a Product Data Analyst to evaluate user journey drop-offs, optimize retention metrics, and partner directly with growth product managers.',
    resumeUsed: 'Avinash_Product_Analyst_Resume.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Product_Analyst_Resume.pdf',
    nextAction: {
      type: 'interview',
      title: 'AI Voice & Tech Screening Pending',
      description: 'Complete 15-min autonomous voice screening with Sarah (RAS AI Talent Partner).',
      date: 'Available On-Demand',
      time: 'Anytime',
      actionLabel: 'Launch AI Voice Screening',
      actionUrl: '/voice-screening',
      secondaryActionLabel: 'Practice Session',
      secondaryActionUrl: '/interview-practice'
    },
    interview: {
      id: 'ai-screen-102',
      type: 'AI Interview',
      status: 'scheduled',
      durationMinutes: 15,
      mode: 'In-Platform AI',
      instructions: 'Sarah will ask 5 questions regarding notice period, CTC expectations, and SQL/A-B testing scenario handling.'
    },
    timeline: [
      {
        id: 'tl-11',
        title: 'AI Screening Round Unlocked',
        description: 'Auto-Apply engine matched 91% compatibility and initiated AI screening.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        status: 'AI Screening',
        type: 'screening'
      },
      {
        id: 'tl-12',
        title: 'Auto-Applied via RAS Engine',
        description: 'Triggered 1-Click auto-apply with WhatsApp and Email dispatches.',
        timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-11',
        channel: 'whatsapp',
        title: '🤖 RAS Auto-Apply Dispatch Confirmation',
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: '+91 98765 43210',
        content: 'Lattice Labs: Auto-applied for Product Data Analyst with 91% match.'
      },
      {
        id: 'comm-12',
        channel: 'email',
        title: '⚡ Auto-Apply Confirmation — Lattice Labs',
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Your profile has been auto-submitted to Lattice Labs. 24h recruiter response SLA active.'
      }
    ],
    documents: [
      {
        id: 'doc-11',
        name: 'Avinash_Product_Analyst_Resume.pdf',
        type: 'Resume v2',
        size: '210 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ],
    sla: {
      enabled: true,
      hoursLimit: 24,
      deadline: new Date(Date.now() + 11 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'APP-1003',
    jobId: 'job-2',
    company: 'Astra Digital',
    companyLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.8,
    jobTitle: 'Lead Business Analyst',
    location: 'Pune, India',
    workMode: 'Onsite',
    salary: '₹24–30 LPA',
    employmentType: 'Full-time',
    matchScore: 92,
    matchBreakdown: {
      overall: 92,
      skills: 95,
      experience: 90,
      location: 90,
      education: 100,
      strengths: ['FinTech Ledger Reconciliation', 'Executive Storytelling', 'Snowflake DW', 'Jira Agile Delivery'],
      gaps: ['Banking ISO20022 Protocols']
    },
    applicationSource: 'manual',
    status: 'Shortlisted',
    appliedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    requiredSkills: ['Business Analysis', 'Snowflake', 'SQL', 'FinTech', 'Agile'],
    jobDescription:
      'Lead our enterprise digital banking transition team. Drive requirements gathering across core payments, settlement engines, and merchant reconciliation.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'waiting',
      title: 'Panel Review in Progress',
      description: 'You are shortlisted. The recruiting team is coordinating interview panel calendar slots.',
      actionLabel: 'View Application Details'
    },
    timeline: [
      {
        id: 'tl-21',
        title: 'Profile Shortlisted by Hiring Manager',
        description: 'Candidate profile passed technical review with 92% match rating.',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        status: 'Shortlisted',
        type: 'stage_change'
      },
      {
        id: 'tl-22',
        title: 'Resume Screening Passed',
        description: 'ATS parsed 11 skills matching FinTech BA requirements.',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        status: 'Resume Screening',
        type: 'stage_change'
      },
      {
        id: 'tl-23',
        title: 'Application Submitted',
        description: 'Candidate applied directly via RAS portal.',
        timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-21',
        channel: 'email',
        title: 'Profile Shortlisted — Astra Digital',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Congratulations Avinash, you have been shortlisted for Lead Business Analyst at Astra Digital.'
      }
    ],
    documents: [
      {
        id: 'doc-21',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ],
    sla: {
      enabled: true,
      hoursLimit: 24,
      deadline: new Date(Date.now() + 16 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'APP-1004',
    jobId: 'job-8',
    company: 'InnoWorks Global',
    companyLogo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.6,
    jobTitle: 'Principal Data Strategist',
    location: 'Chennai, India',
    workMode: 'Onsite',
    salary: '₹28–35 LPA',
    employmentType: 'Full-time',
    matchScore: 96,
    matchBreakdown: {
      overall: 96,
      skills: 98,
      experience: 95,
      location: 95,
      education: 100,
      strengths: ['Data Architecture Roadmap', 'Executive C-Level Pitching', 'Cross-Functional Leadership', 'Enterprise Analytics'],
      gaps: []
    },
    applicationSource: 'manual',
    status: 'Offer',
    appliedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    requiredSkills: ['Data Strategy', 'Snowflake', 'Executive Stakeholder', 'Python', 'BI Governance'],
    jobDescription:
      'Drive data governance, analytics democratization, and modern cloud telemetry adoption across global business units.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'offer',
      title: '🎉 Formal Offer Letter Released',
      description: 'Offered ₹32.5 LPA fixed + ₹3.5 LPA performance bonus. Please review and respond before deadline.',
      date: 'Joining: 01 Oct 2026',
      time: 'Offer Valid until 10 Sep',
      actionLabel: 'Review & Sign Offer Letter',
      secondaryActionLabel: 'Upload KYC Documents',
      secondaryActionUrl: '/documents'
    },
    offerDetails: {
      offeredSalary: '₹32.5 LPA Base + ₹3.5 LPA Variable',
      joiningDate: '01 October 2026',
      deadline: '10 September 2026',
      letterUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Offer_Letter_InnoWorks.pdf'
    },
    timeline: [
      {
        id: 'tl-31',
        title: 'Formal Offer Letter Issued',
        description: 'HR team released official compensation package of ₹36 LPA CTC.',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'Offer',
        type: 'stage_change'
      },
      {
        id: 'tl-32',
        title: 'Candidate Selected',
        description: 'Hiring committee unanimously recommended offer rollout.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        status: 'Selected',
        type: 'stage_change'
      },
      {
        id: 'tl-33',
        title: 'Executive Final Round Completed',
        description: 'Discussion with VP of Engineering completed with Outstanding rating.',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        status: 'Interview Completed',
        type: 'interview'
      },
      {
        id: 'tl-34',
        title: 'Technical Round 1 Cleared',
        description: 'Score: 96/100 on system architecture and telemetry optimization.',
        timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        status: 'Interview Completed',
        type: 'interview'
      }
    ],
    communications: [
      {
        id: 'comm-31',
        channel: 'email',
        title: '🎉 Formal Offer Letter — InnoWorks Global',
        date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Dear Avinash, we are thrilled to offer you the role of Principal Data Strategist.'
      },
      {
        id: 'comm-32',
        channel: 'whatsapp',
        title: 'Offer Letter Dispatched',
        date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: '+91 98765 43210',
        content: 'InnoWorks: Your offer letter is ready for review on the RAS Candidate Portal.'
      }
    ],
    documents: [
      {
        id: 'doc-31',
        name: 'Offer_Letter_InnoWorks.pdf',
        type: 'Offer Letter',
        size: '420 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        isVerified: true
      },
      {
        id: 'doc-32',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ]
  },
  {
    id: 'APP-1005',
    jobId: 'job-7',
    company: 'DataVista Systems',
    companyLogo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.9,
    jobTitle: 'Analytics Project Manager',
    location: 'Bengaluru, India',
    workMode: 'Hybrid',
    salary: '₹26–32 LPA',
    employmentType: 'Full-time',
    matchScore: 95,
    matchBreakdown: {
      overall: 95,
      skills: 96,
      experience: 94,
      location: 100,
      education: 98,
      strengths: ['Agile Project Delivery', 'Data Governance', 'Cross-Functional Leadership', 'Sprint Velocity Optimization'],
      gaps: ['Scrum Master Certification Renewal']
    },
    applicationSource: 'manual',
    status: 'HR Round',
    appliedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    requiredSkills: ['Project Management', 'Agile', 'SQL', 'Data Analytics', 'Jira'],
    jobDescription:
      'Manage complex multi-tier data pipeline implementations, coordinate sprint backlogs, and ensure SLA compliance for high-value enterprise accounts.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'interview',
      title: 'HR Cultural & Compensation Alignment Round',
      description: 'Scheduled with Meenakshi Sundaram (Head of Talent) tomorrow at 11:30 AM IST.',
      date: 'Tomorrow, 11:30 AM IST',
      time: '11:30 AM IST',
      actionLabel: 'Join Meeting',
      actionUrl: '/meetings'
    },
    interview: {
      id: 'meet-105',
      type: 'HR Round',
      status: 'scheduled',
      date: 'Tomorrow',
      time: '11:30 AM IST',
      durationMinutes: 30,
      mode: 'WebRTC Live Meeting',
      meetingUrl: '/meetings',
      interviewerName: 'Meenakshi Sundaram',
      interviewerRole: 'Head of Talent Acquisition',
      instructions: 'Discussion on compensation structure, notice period buyout feasibility, and team leadership fit.'
    },
    timeline: [
      {
        id: 'tl-41',
        title: 'HR Round Scheduled',
        description: 'Advanced to final cultural & compensation alignment.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        status: 'HR Round',
        type: 'interview'
      },
      {
        id: 'tl-42',
        title: 'Technical Round 2 Completed',
        description: 'Feedback: Excellent grasp on Agile burn-down charts and SQL telemetry.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        status: 'Interview Completed',
        type: 'interview'
      }
    ],
    communications: [
      {
        id: 'comm-41',
        channel: 'email',
        title: 'HR Alignment Round Details — DataVista',
        date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Your HR discussion has been scheduled for tomorrow at 11:30 AM IST.'
      }
    ],
    documents: [
      {
        id: 'doc-41',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ],
    sla: {
      enabled: true,
      hoursLimit: 24,
      deadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'APP-1006',
    jobId: 'job-5',
    company: 'Zenith Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.8,
    jobTitle: 'BI & Analytics Specialist',
    location: 'Mumbai, India',
    workMode: 'Hybrid',
    salary: '₹22–26 LPA',
    employmentType: 'Full-time',
    matchScore: 89,
    matchBreakdown: {
      overall: 89,
      skills: 92,
      experience: 88,
      location: 85,
      education: 95,
      strengths: ['Power BI DAX', 'Data Warehousing', 'Executive Reporting'],
      gaps: ['MicroStrategy Legacy Migrations']
    },
    applicationSource: 'auto_apply',
    status: 'Application Submitted',
    appliedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    requiredSkills: ['Power BI', 'SQL', 'DAX', 'Data Modeling', 'Tableau'],
    jobDescription:
      'Develop robust semantic models, configure row-level security in Power BI Service, and streamline financial telemetry reporting.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'waiting',
      title: 'Under Recruiter Review',
      description: '24-hour response SLA active. Recruiter is reviewing your application.',
      actionLabel: 'View Job Details'
    },
    timeline: [
      {
        id: 'tl-51',
        title: 'Auto-Applied via RAS Engine',
        description: 'Auto-Apply submitted profile with 89% match score.',
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-51',
        channel: 'email',
        title: '⚡ Auto-Apply Confirmation — Zenith Solutions',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Zenith Solutions application submitted under 24h recruiter response SLA.'
      }
    ],
    documents: [
      {
        id: 'doc-51',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ],
    sla: {
      enabled: true,
      hoursLimit: 24,
      deadline: new Date(Date.now() + 5 * 3600 * 1000).toISOString()
    }
  },
  {
    id: 'APP-1007',
    jobId: 'job-9',
    company: 'AlgoEdge AI',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.9,
    jobTitle: 'Senior Data Analyst',
    location: 'Gurugram, India',
    workMode: 'Remote',
    salary: '₹20–25 LPA',
    employmentType: 'Full-time',
    matchScore: 87,
    matchBreakdown: {
      overall: 87,
      skills: 90,
      experience: 85,
      location: 90,
      education: 90,
      strengths: ['SQL Query Optimization', 'Predictive Modeling', 'Tableau', 'Python'],
      gaps: ['LangChain Integrations']
    },
    applicationSource: 'manual',
    status: 'Under Review',
    appliedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Statistical Analysis', 'ETL'],
    jobDescription:
      'Extract actionable signals from large-scale NLP telemetry datasets, build predictive growth dashboards, and consult cross-functional engineering pods.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'waiting',
      title: 'Final Panel Consensus',
      description: 'Hiring committee is conducting final background evaluation.',
      actionLabel: 'View Dossier'
    },
    timeline: [
      {
        id: 'tl-61',
        title: 'Under Final Review',
        description: 'All interview rounds cleared; panel is finalizing decision.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        status: 'Under Review',
        type: 'stage_change'
      },
      {
        id: 'tl-62',
        title: 'Technical Round Completed',
        description: 'Scored 88% in live problem solving session.',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        status: 'Interview Completed',
        type: 'interview'
      }
    ],
    communications: [
      {
        id: 'comm-61',
        channel: 'email',
        title: 'Application Status Update — AlgoEdge AI',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Your file is with the compensation & hiring committee.'
      }
    ],
    documents: [
      {
        id: 'doc-61',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ]
  },
  {
    id: 'APP-1008',
    jobId: 'job-4',
    company: 'ByteCraft Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.6,
    jobTitle: 'Full Stack Software Engineer',
    location: 'Noida, India',
    workMode: 'Hybrid',
    salary: '₹18–24 LPA',
    employmentType: 'Full-time',
    matchScore: 68,
    matchBreakdown: {
      overall: 68,
      skills: 65,
      experience: 70,
      location: 90,
      education: 90,
      strengths: ['JavaScript', 'System Architecture', 'API Design'],
      gaps: ['Kubernetes Cluster Admin', 'Deep Golang Backend Microservices']
    },
    applicationSource: 'manual',
    status: 'Rejected',
    appliedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
    requiredSkills: ['Golang', 'Kubernetes', 'React', 'TypeScript', 'gRPC'],
    jobDescription:
      'Build distributed backend microservices and high-throughput streaming systems using Golang, Kafka, and Kubernetes.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    rejectionReason: 'Position required 4+ years of core Golang microservices and Kubernetes cluster architecture.',
    nextAction: {
      type: 'feedback',
      title: 'Application Not Selected',
      description: 'Skill gap identified in Go/Kubernetes infrastructure. Explore business analyst and data roles matching your profile.',
      actionLabel: 'Find Similar Jobs',
      actionUrl: '/jobs'
    },
    timeline: [
      {
        id: 'tl-71',
        title: 'Application Not Moving Forward',
        description: 'Position requires deeper Golang systems infrastructure experience.',
        timestamp: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
        status: 'Rejected',
        type: 'stage_change'
      },
      {
        id: 'tl-72',
        title: 'Application Submitted',
        description: 'Applied via standard portal.',
        timestamp: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-71',
        channel: 'email',
        title: 'ByteCraft Technologies — Application Update',
        date: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Thank you for your interest in ByteCraft. We have decided to move forward with candidates possessing deeper Golang infrastructure backgrounds.'
      }
    ],
    documents: [
      {
        id: 'doc-71',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ]
  },
  {
    id: 'APP-1009',
    jobId: 'job-6',
    company: 'Nexus Scale Global',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80',
    companyRating: 4.7,
    jobTitle: 'Junior Data Engineer',
    location: 'Remote',
    workMode: 'Remote',
    salary: '₹14–18 LPA',
    employmentType: 'Full-time',
    matchScore: 82,
    matchBreakdown: {
      overall: 82,
      skills: 85,
      experience: 80,
      location: 100,
      education: 90,
      strengths: ['SQL', 'Python Data Processing', 'ETL Pipelines'],
      gaps: ['Spark Streaming at Scale']
    },
    applicationSource: 'manual',
    status: 'Withdrawn',
    appliedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    withdrawalReason: 'Accepted higher-level Principal Data Strategist offer from InnoWorks Global.',
    requiredSkills: ['Python', 'SQL', 'Spark', 'Airflow', 'Data Modeling'],
    jobDescription: 'Build ETL pipelines and maintain data warehouse schema tables.',
    resumeUsed: 'Avinash_Tiwari_Lead_BA_2026.pdf',
    resumeUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf',
    nextAction: {
      type: 'none',
      title: 'Application Withdrawn',
      description: 'You voluntarily withdrew this application.'
    },
    timeline: [
      {
        id: 'tl-81',
        title: 'Application Withdrawn by Candidate',
        description: 'Candidate marked application as withdrawn (Reason: Accepted another offer).',
        timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        status: 'Withdrawn',
        type: 'stage_change'
      },
      {
        id: 'tl-82',
        title: 'Application Submitted',
        description: 'Applied directly.',
        timestamp: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        status: 'Application Submitted',
        type: 'stage_change'
      }
    ],
    communications: [
      {
        id: 'comm-81',
        channel: 'email',
        title: 'Application Withdrawal Confirmation',
        date: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        status: 'Delivered',
        recipient: 'avinashtiwari@gmail.com',
        content: 'Your withdrawal request for Junior Data Engineer has been recorded.'
      }
    ],
    documents: [
      {
        id: 'doc-81',
        name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
        type: 'Resume',
        size: '245 KB',
        fileUrl: '#',
        uploadedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        isVerified: true
      }
    ]
  }
]

const STORAGE_KEY = 'rap_candidate_applications_v2'

// ============================================================================
// Application Service Implementation
// ============================================================================

export const applicationService = {
  /**
   * Get all candidate applications, seamlessly hydrating with existing profile apps
   */
  getAll(): CandidateApplication[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }

      // If storage key is empty, seed defaults and sync with profile
      const seeded = DEFAULT_APPLICATIONS
      this.saveAll(seeded)
      return seeded
    } catch {
      return DEFAULT_APPLICATIONS
    }
  },

  /**
   * Persist applications to local storage and sync with rap_profile
   */
  saveAll(applications: CandidateApplication[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))

      // Keep rap_profile in sync so existing sidebar/profile components remain accurate
      const profile = profileService.get() || {}
      profile.applications = applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        company: app.company,
        companyRating: app.companyRating,
        location: app.location,
        workMode: app.workMode,
        salary: app.salary,
        appliedDate: app.appliedAt,
        status: app.status,
        matchScore: app.matchScore,
        autoApplied: app.applicationSource === 'auto_apply'
      }))
      profileService.save(profile)
    } catch (e) {
      console.warn('Failed to save applications:', e)
    }
  },

  /**
   * Fetch single application by ID
   */
  getById(id: string): CandidateApplication | null {
    const all = this.getAll()
    return all.find((a) => a.id === id || a.jobId === id) || null
  },

  /**
   * Calculate real-time KPI counts across applications
   */
  getKPIs(): ApplicationKPIs {
    const apps = this.getAll()
    const total = apps.length
    
    // Non-terminal stages count as active
    const terminalStages: ApplicationStage[] = ['Rejected', 'Withdrawn']
    const active = apps.filter((a) => !terminalStages.includes(a.status)).length

    const shortlisted = apps.filter((a) => a.status === 'Shortlisted').length
    
    const interviewStages: ApplicationStage[] = [
      'Interview',
      'Interview Scheduled',
      'Interview in Progress',
      'Interview Completed',
      'Technical Round',
      'HR Round'
    ]
    const interviews = apps.filter((a) => interviewStages.includes(a.status)).length

    const offerStages: ApplicationStage[] = ['Selected', 'Offer']
    const offers = apps.filter((a) => offerStages.includes(a.status)).length

    const awaitingStages: ApplicationStage[] = [
      'Applied',
      'Application Submitted',
      'Resume Screening',
      'Under Review',
      'On Hold'
    ]
    const awaitingResponse = apps.filter((a) => awaitingStages.includes(a.status)).length
    const rejected = apps.filter((a) => a.status === 'Rejected').length
    const withdrawn = apps.filter((a) => a.status === 'Withdrawn').length

    return {
      total,
      active,
      shortlisted,
      interviews,
      offers,
      awaitingResponse,
      rejected,
      withdrawn
    }
  },

  /**
   * Update application status and append to timeline
   */
  updateStatus(id: string, newStatus: ApplicationStage, note?: string): CandidateApplication | null {
    const apps = this.getAll()
    const index = apps.findIndex((a) => a.id === id)
    if (index === -1) return null

    const app = apps[index]
    const updatedTimelineEvent: ApplicationTimelineEvent = {
      id: 'tl-' + Date.now(),
      title: `Status Updated to ${newStatus}`,
      description: note || `Application progressed to "${newStatus}".`,
      timestamp: new Date().toISOString(),
      status: newStatus,
      type: 'stage_change'
    }

    const updatedApp: CandidateApplication = {
      ...app,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      timeline: [updatedTimelineEvent, ...(app.timeline || [])]
    }

    apps[index] = updatedApp
    this.saveAll(apps)

    notificationService.create({
      title: '🎯 Application Status Update',
      message: `${app.company} updated status for "${app.jobTitle}" to ${newStatus}.`,
      type: 'application'
    })

    return updatedApp
  },

  /**
   * Withdraw application with reason
   */
  withdraw(id: string, reason: string, note?: string): CandidateApplication | null {
    const apps = this.getAll()
    const index = apps.findIndex((a) => a.id === id)
    if (index === -1) return null

    const app = apps[index]
    const withdrawEvent: ApplicationTimelineEvent = {
      id: 'tl-' + Date.now(),
      title: 'Application Withdrawn by Candidate',
      description: `Reason: ${reason}${note ? ` (${note})` : ''}`,
      timestamp: new Date().toISOString(),
      status: 'Withdrawn',
      type: 'stage_change'
    }

    const commEvent: ApplicationCommunication = {
      id: 'comm-' + Date.now(),
      channel: 'in_app',
      title: 'Withdrawal Confirmation',
      date: new Date().toISOString(),
      status: 'Delivered',
      content: `Your application for ${app.jobTitle} at ${app.company} was withdrawn.`
    }

    const updatedApp: CandidateApplication = {
      ...app,
      status: 'Withdrawn',
      withdrawalReason: `${reason}${note ? ` — ${note}` : ''}`,
      lastUpdated: new Date().toISOString(),
      nextAction: {
        type: 'none',
        title: 'Application Withdrawn',
        description: 'You voluntarily withdrew this application.'
      },
      timeline: [withdrawEvent, ...(app.timeline || [])],
      communications: [commEvent, ...(app.communications || [])]
    }

    apps[index] = updatedApp
    this.saveAll(apps)

    notificationService.create({
      title: 'Application Withdrawn',
      message: `You have withdrawn your application for ${app.jobTitle} at ${app.company}.`,
      type: 'application'
    })

    return updatedApp
  },

  /**
   * Create or submit new application (e.g. from 1-Click apply or Auto-Apply)
   */
  createApplication(newApp: Partial<CandidateApplication>): CandidateApplication {
    const apps = this.getAll()
    const id = newApp.id || `APP-${Date.now().toString().slice(-4)}`
    const now = new Date().toISOString()

    const fullApp: CandidateApplication = {
      id,
      jobId: newApp.jobId || 'job-' + Date.now(),
      company: newApp.company || 'Enterprise Partner',
      companyLogo: newApp.companyLogo,
      companyRating: newApp.companyRating || 4.8,
      jobTitle: newApp.jobTitle || 'Business Analyst',
      location: newApp.location || 'Remote',
      workMode: newApp.workMode || 'Hybrid',
      salary: newApp.salary || '₹20–25 LPA',
      employmentType: newApp.employmentType || 'Full-time',
      matchScore: newApp.matchScore || 90,
      matchBreakdown: newApp.matchBreakdown || {
        overall: newApp.matchScore || 90,
        skills: 92,
        experience: 88,
        location: 100,
        education: 100,
        strengths: ['SQL', 'Business Analysis', 'Power BI'],
        gaps: []
      },
      applicationSource: newApp.applicationSource || 'manual',
      status: newApp.status || 'Application Submitted',
      appliedAt: now,
      lastUpdated: now,
      notes: newApp.notes,
      jobDescription: newApp.jobDescription,
      requiredSkills: newApp.requiredSkills || ['SQL', 'Power BI', 'Agile'],
      resumeUsed: newApp.resumeUsed || 'Avinash_Tiwari_Lead_BA_2026.pdf',
      resumeUrl: newApp.resumeUrl,
      nextAction: newApp.nextAction || {
        type: 'waiting',
        title: 'Application Submitted',
        description: '24-hour recruiter response SLA active. Recruiter is reviewing your credentials.'
      },
      timeline: [
        {
          id: 'tl-' + Date.now(),
          title: 'Application Submitted',
          description: `Applied via ${newApp.applicationSource === 'auto_apply' ? 'RAS Auto-Apply Engine' : 'Direct Portal Application'}.`,
          timestamp: now,
          status: 'Application Submitted',
          type: 'stage_change'
        }
      ],
      communications: [
        {
          id: 'comm-' + Date.now(),
          channel: 'email',
          title: 'Application Received Confirmation',
          date: now,
          status: 'Delivered',
          content: `Thank you for applying to ${newApp.company || 'Company'}. 24h recruiter response SLA active.`
        }
      ],
      documents: [
        {
          id: 'doc-' + Date.now(),
          name: newApp.resumeUsed || 'Avinash_Tiwari_Lead_BA_2026.pdf',
          type: 'Resume',
          size: '245 KB',
          fileUrl: '#',
          uploadedAt: now,
          isVerified: true
        }
      ],
      sla: {
        enabled: true,
        hoursLimit: 24,
        deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      }
    }

    apps.unshift(fullApp)
    this.saveAll(apps)
    return fullApp
  }
}
