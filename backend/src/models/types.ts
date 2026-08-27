export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: 'candidate' | 'recruiter' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface CandidateProfile {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  headline: string
  bio: string
  location: string
  totalExperienceYears: number
  currentSalaryLPA: number
  expectedSalaryLPA: number
  noticePeriodDays: number
  skills: string[]
  tools: string[]
  languages: string[]
  profilePhoto: string
  resumeUrl?: string
  atsScore: number
  contactPrivacyMask: boolean
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  applicationsCount: number
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  workType: 'Remote' | 'Hybrid' | 'On-site'
  jobType: 'Full-time' | 'Contract' | 'Part-time'
  salaryMin: number
  salaryMax: number
  experienceMin: number
  experienceMax: number
  hiringRating: number
  hiringPeriod: 'Immediate' | '15 Days' | '30 Days' | '45+ Days'
  description: string
  responsibilities: string[]
  requirements: string[]
  skillsRequired: string[]
  applicantsCount: number
  createdAt: string
}

export type ApplicationStage =
  | 'Application Submitted'
  | 'Resume Screening'
  | 'AI Screening'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interview in Progress'
  | 'Interview Completed'
  | 'Under Review'
  | 'Selected / Offer'
  | 'Rejected'
  | 'On Hold'

export interface Application {
  id: string
  jobId: string
  candidateId: string
  jobTitle: string
  company: string
  currentStage: ApplicationStage
  appliedAt: string
  updatedAt: string
  slaExpiresAt: string
  recruiterNotes?: string
  interviewDate?: string
  stageHistory: {
    stage: ApplicationStage
    timestamp: string
    note?: string
  }[]
}

export interface Meeting {
  id: string
  code: string
  title: string
  meetingType: 'instant' | 'scheduled' | 'interview' | 'screening'
  hostId: string
  hostName: string
  scheduledAt?: string
  durationSeconds: number
  isLive: boolean
  recordingUrl?: string
  transcripts: {
    speaker: string
    text: string
    timestamp: string
  }[]
  notes: {
    timestamp: string
    note: string
  }[]
  summary?: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  authorType: 'candidate' | 'company'
  companyRating?: number
  category: 'Case Study' | 'Interview Experience' | 'Hiring Announcement' | 'Technical Article' | 'General'
  title: string
  description: string
  imageUrl?: string
  links: {
    title: string
    url: string
    iconType: 'github' | 'job' | 'portfolio' | 'link'
  }[]
  tags: string[]
  likes: number
  likedByUserIds: string[]
  savedByUserIds: string[]
  comments: {
    id: string
    authorId: string
    authorName: string
    authorRole: string
    authorAvatar?: string
    content: string
    createdAt: string
  }[]
  createdAt: string
}

export interface KYCDocument {
  id: string
  candidateId: string
  documentType: 'Aadhaar Card' | 'PAN Card' | 'Degree Certificate' | 'Experience Letter' | 'Salary Slips'
  documentNumberMasked: string
  fileUrl: string
  verifiedStatus: 'Verified' | 'Pending Verification' | 'Rejected'
  otpVerified: boolean
  discrepancyNote?: string
  uploadedAt: string
}
