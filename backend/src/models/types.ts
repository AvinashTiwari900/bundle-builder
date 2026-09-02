export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: 'candidate' | 'recruiter' | 'admin'
  createdAt: string
  updatedAt: string
}

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

export interface UserPrivacySettings {
  profileVisibility: 'public' | 'connections_only' | 'private'
  showEmailToConnections: boolean
  showPhoneToConnections: boolean
  allowConnectionRequests: boolean
  contactPrivacyMask: boolean
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
  currentRole?: string
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
  privacySettings?: UserPrivacySettings
  education?: EducationEntry[]
  experience?: ExperienceEntry[]
  projects?: ProjectEntry[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  applicationsCount: number
  connectionsCount?: number
  createdAt: string
  updatedAt: string
}

export interface Connection {
  id: string
  requesterId: string
  recipientId: string
  status: 'pending' | 'accepted' | 'declined'
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

export interface InterviewMonitoringIncident {
  id: string
  type: 'gaze_diverted' | 'face_turned_away' | 'multiple_faces' | 'no_face_detected' | 'tab_switched' | 'technical_issue'
  title: string
  reason: string
  timestamp: string
  durationSeconds: number
  confidenceScore: number
  strikeNumber: number | 'DISQUALIFIED'
  severity: 'warning' | 'critical' | 'termination'
}

export interface InterviewSessionRecord {
  id: string
  candidateId: string
  interviewType: 'Technical' | 'Behavioral' | 'HR' | 'Mixed' | 'System Design'
  totalQuestions: number
  completedQuestions: number
  overallScore: number
  status: 'in_progress' | 'completed' | 'terminated_violations' | 'terminated_tab_switch'
  terminationReason?: string
  answers: {
    questionId: string
    prompt: string
    category: string
    answeredText: string
    durationSeconds: number
    aiScore?: number
    aiFeedback?: string
  }[]
  incidents: InterviewMonitoringIncident[]
  startedAt: string
  completedAt?: string
}

export interface MeetingChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  createdAt?: string
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
  chats?: MeetingChatMessage[]
  notes: {
    timestamp: string
    note: string
  }[]
  summary?: string
  createdAt: string
}

export type PostType =
  | 'Normal Post'
  | 'Project Showcase'
  | 'Case Study'
  | 'Achievement'
  | 'Career Update'
  | 'Technical / Knowledge Sharing'
  | 'Experience Sharing'

export type PostVisibility = 'public' | 'connections' | 'private'

export interface PostLink {
  title?: string
  label?: string
  url: string
  iconType?: string
}

export interface PostMediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  name?: string
  size?: number
}

export interface PostComment {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  authorType?: 'candidate' | 'recruiter' | 'company'
  category?: string
  postType?: PostType
  title: string
  description: string
  imageUrl?: string
  hashtags?: string[]
  tags?: string[]
  links?: PostLink[]
  media?: PostMediaItem[]
  visibility?: PostVisibility
  likes: number
  likedByUserIds: string[]
  savedByUserIds: string[]
  comments: PostComment[]
  companyRating?: number
  viewsCount?: number
  createdAt: string
  updatedAt?: string
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
