import { User, CandidateProfile, Job, Application, Meeting, Post, KYCDocument } from '../models/types'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

// In-Memory Database Store for Instant Local Out-of-the-Box Execution
class Database {
  users: User[] = []
  profiles: CandidateProfile[] = []
  jobs: Job[] = []
  applications: Application[] = []
  meetings: Meeting[] = []
  posts: Post[] = []
  documents: KYCDocument[] = []

  constructor() {
    this.seed()
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('Candidate@123', 10)
    const userId = 'usr-candidate-default-01'

    // 1. Default User
    const defaultUser: User = {
      id: userId,
      email: 'avinash.tiwari@example.com',
      name: 'Avinash Tiwari',
      passwordHash,
      role: 'candidate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.users.push(defaultUser)

    // 2. Candidate Profile
    const defaultProfile: CandidateProfile = {
      id: 'prof-default-01',
      userId,
      name: 'Avinash Tiwari',
      email: 'avinash.tiwari@example.com',
      phone: '+91 98765 43210',
      headline: 'Lead Business Analyst & Analytics Engineer',
      bio: 'Lead Business Analyst with 6+ years driving enterprise digital transformation, automated pipeline architectures, and analytics engines across Fintech, SaaS, and Supply Chain ecosystems.',
      location: 'Bengaluru, India',
      totalExperienceYears: 6.5,
      currentSalaryLPA: 22,
      expectedSalaryLPA: 28,
      noticePeriodDays: 15,
      skills: ['Business Analysis', 'SQL', 'Power BI', 'Python', 'ETL Pipelines', 'Data Warehousing', 'Requirements Engineering', 'Agile / Scrum'],
      tools: ['Snowflake', 'Jira', 'Figma', 'Tableau', 'dbt', 'Git'],
      languages: ['English (Fluent)', 'Hindi (Native)'],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      atsScore: 92,
      contactPrivacyMask: true,
      githubUrl: 'https://github.com/AvinashTiwari900',
      linkedinUrl: 'https://linkedin.com/in/avinash-tiwari-ba',
      portfolioUrl: 'https://avinash-tiwari.dev',
      applicationsCount: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.profiles.push(defaultProfile)

    // 3. Verified Jobs Seed
    const jobList: Job[] = [
      {
        id: 'job-101',
        title: 'Lead Business Analyst — Core Banking',
        company: 'Razorpay Financial Technologies',
        companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
        location: 'Bengaluru, India (Hybrid)',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salaryMin: 2400000,
        salaryMax: 3200000,
        experienceMin: 5,
        experienceMax: 9,
        hiringRating: 4.9,
        hiringPeriod: 'Immediate',
        description: 'Lead business requirements, partner with payment gateway squads, and design reconciliation telemetry.',
        responsibilities: ['Author FRDs and BRDs for cross-border payment settlements', 'Conduct gap analysis on payment gateway latency', 'Coordinate with engineering and risk panels'],
        requirements: ['5+ years in Fintech / Banking domain', 'Advanced SQL & Data Analytics', 'Strong stakeholder leadership'],
        skillsRequired: ['Business Analysis', 'SQL', 'Fintech', 'Payment Gateways', 'Jira'],
        applicantsCount: 42,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'job-102',
        title: 'Senior Product Analyst — Growth & Monoliths',
        company: 'Swiggy Consumer Tech',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
        location: 'Remote (Pan India)',
        workType: 'Remote',
        jobType: 'Full-time',
        salaryMin: 2200000,
        salaryMax: 2800000,
        experienceMin: 4,
        experienceMax: 7,
        hiringRating: 4.8,
        hiringPeriod: '15 Days',
        description: 'Build predictive customer lifetime value models and design experiments for rapid merchant conversions.',
        responsibilities: ['A/B testing execution on checkout funnel', 'Build self-serve Tableau & Power BI metrics', 'Partner with growth product managers'],
        requirements: ['4+ years in Product Analytics / B2C', 'Expertise in SQL, Python, and Tableau', 'Demonstrated user conversion gains'],
        skillsRequired: ['Product Analytics', 'SQL', 'Python', 'A/B Testing', 'Power BI'],
        applicantsCount: 68,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'job-103',
        title: 'Enterprise Analytics Specialist',
        company: 'CRED Scaled Architecture',
        companyLogo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80',
        location: 'Bengaluru, India',
        workType: 'On-site',
        jobType: 'Full-time',
        salaryMin: 2600000,
        salaryMax: 3500000,
        experienceMin: 6,
        experienceMax: 10,
        hiringRating: 4.95,
        hiringPeriod: 'Immediate',
        description: 'Drive data warehouse architecture, financial reporting automation, and fraud detection algorithms.',
        responsibilities: ['Design star-schema architectures on Snowflake', 'Automate board-level KPI reporting', 'Lead business logic verification across data engineering squads'],
        requirements: ['6+ years in Enterprise Analytics / High-Scale Systems', 'Snowflake, dbt, SQL, and Python proficiency', 'Strong understanding of credit ecosystems'],
        skillsRequired: ['Snowflake', 'SQL', 'Data Warehousing', 'dbt', 'Python'],
        applicantsCount: 51,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ]
    this.jobs.push(...jobList)

    // 4. Applications (11-Stage Pipeline)
    const appList: Application[] = [
      {
        id: 'app-01',
        jobId: 'job-101',
        candidateId: userId,
        jobTitle: 'Lead Business Analyst — Core Banking',
        company: 'Razorpay Financial Technologies',
        currentStage: 'Interview Scheduled',
        appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        slaExpiresAt: new Date(Date.now() + 86400000 * 1).toISOString(),
        interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        recruiterNotes: 'Candidate passed AI Voice Screening with 94% communication score. Technical panel scheduled.',
        stageHistory: [
          { stage: 'Application Submitted', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { stage: 'Resume Screening', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'ATS match verified: 92/100' },
          { stage: 'AI Screening', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'AI screening passed' },
          { stage: 'Shortlisted', timestamp: new Date(Date.now() - 43200000).toISOString(), note: 'Hiring manager approved' },
          { stage: 'Interview Scheduled', timestamp: new Date().toISOString(), note: 'Meeting invite sent' }
        ]
      },
      {
        id: 'app-02',
        jobId: 'job-102',
        candidateId: userId,
        jobTitle: 'Senior Product Analyst — Growth & Monoliths',
        company: 'Swiggy Consumer Tech',
        currentStage: 'Under Review',
        appliedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        slaExpiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        recruiterNotes: 'Technical case study review completed by lead data scientist.',
        stageHistory: [
          { stage: 'Application Submitted', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
          { stage: 'Resume Screening', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
          { stage: 'AI Screening', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
          { stage: 'Shortlisted', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { stage: 'Interview Scheduled', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
          { stage: 'Interview Completed', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          { stage: 'Under Review', timestamp: new Date().toISOString() }
        ]
      }
    ]
    this.applications.push(...appList)

    // 5. Meetings & Recordings
    const meetingList: Meeting[] = [
      {
        id: 'meet-01',
        code: 'RZP774',
        title: 'Lead BA Round 1 Technical Architecture Sync',
        meetingType: 'interview',
        hostId: 'recruiter-rzp-01',
        hostName: 'Neha Sharma (Razorpay Panel)',
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        durationSeconds: 2700,
        isLive: false,
        transcripts: [
          { speaker: 'Neha Sharma', text: 'Hello Avinash, thank you for joining. Today we want to examine how you design reconciliation telemetry.', timestamp: '00:15' },
          { speaker: 'Avinash Tiwari', text: 'Thank you Neha. In my previous role, we engineered a star-schema warehouse with automated delta verification.', timestamp: '00:45' }
        ],
        notes: [
          { timestamp: '01:10', note: 'Strong explanation of star-schema and ETL latency reduction.' }
        ],
        summary: 'Candidate demonstrated deep understanding of payment gateway architectures and reconciliation telemetry.',
        createdAt: new Date().toISOString()
      }
    ]
    this.meetings.push(...meetingList)

    // 6. Community Posts (with bookmarked posts)
    const postList: Post[] = [
      {
        id: 'post-01',
        authorId: userId,
        authorName: 'Avinash Tiwari',
        authorRole: 'Lead Business Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        authorType: 'candidate',
        category: 'Case Study',
        title: 'Architecting a Real-Time Reconciliation Engine for Payment Gateways',
        description: 'Here is how we reduced end-of-day payment reconciliation time from 4 hours to under 6 minutes across ₹800 Cr monthly GMV using star-schema architectures on Snowflake and dbt.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        links: [
          { title: 'GitHub Repository', url: 'https://github.com/AvinashTiwari900/payment-recon-engine', iconType: 'github' },
          { title: 'Live Architecture Diagram', url: 'https://avinash-tiwari.dev/projects/payment-recon', iconType: 'portfolio' }
        ],
        tags: ['#SQL', '#Snowflake', '#Fintech', '#DataEngineering', '#BusinessAnalysis'],
        likes: 38,
        likedByUserIds: [userId],
        savedByUserIds: [userId], // Bookmarked
        comments: [
          {
            id: 'c-01',
            authorId: 'usr-guest-02',
            authorName: 'Rohan Mehta',
            authorRole: 'Engineering Manager @ CRED',
            content: 'Impressive breakdown! What was the latency impact on audit logs?',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'post-02',
        authorId: 'comp-rzp-01',
        authorName: 'Razorpay Talent Operations',
        authorRole: 'Verified Hiring Partner',
        authorType: 'company',
        companyRating: 4.9,
        category: 'Hiring Announcement',
        title: 'Hiring 5x Lead Business Analysts & Analytics Engineers (Immediate / 15-Day SLA)',
        description: 'Razorpay Core Banking squad is expanding! We are hiring Lead BAs with strong SQL, Fintech, and payment reconciliation experience. Guaranteed 24-hour recruiter response SLA.',
        links: [
          { title: 'View Verified Opening', url: '/jobs/job-101', iconType: 'job' }
        ],
        tags: ['#Hiring', '#Fintech', '#Razorpay', '#BusinessAnalyst', '#Bengaluru'],
        likes: 84,
        likedByUserIds: [],
        savedByUserIds: [userId], // Bookmarked
        comments: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
    this.posts.push(...postList)

    // 7. Documents & KYC
    const docList: KYCDocument[] = [
      {
        id: 'doc-01',
        candidateId: userId,
        documentType: 'Aadhaar Card',
        documentNumberMasked: 'XXXX-XXXX-4829',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample_aadhaar.pdf',
        verifiedStatus: 'Verified',
        otpVerified: true,
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'doc-02',
        candidateId: userId,
        documentType: 'PAN Card',
        documentNumberMasked: 'ABCDE****F',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample_pan.pdf',
        verifiedStatus: 'Verified',
        otpVerified: true,
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ]
    this.documents.push(...docList)
  }
}

export const db = new Database()
