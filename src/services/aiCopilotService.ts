import { profileService } from './profileService'
import { jobService } from './jobService'
import { resumeAnalysisService } from './resumeAnalysisService'
import { portfolioService } from './portfolioService'
import { postService } from './postService'
import { meetingService } from './meetingService'

export interface WorkflowStep {
  step: number
  title: string
  description: string
  route: string
  actionLabel: string
}

export interface CopilotCard {
  type: 'navigation' | 'workflow' | 'job_list' | 'interview_list' | 'ats_analysis' | 'confirmation'
  title?: string
  data?: any
  actionUrl?: string
  actionLabel?: string
  confirmationAction?: {
    actionType: 'apply_job' | 'schedule_interview' | 'enable_auto_apply' | 'submit_documents'
    payload: any
    prompt: string
  }
}

export interface CopilotResponse {
  text: string
  card?: CopilotCard
  quickActions?: { label: string; query: string }[]
  suggestedRoute?: string
}

export const AI_QUICK_ACTIONS = [
  { label: '📰 Community Posts', query: 'Show community posts and how to add a post' },
  { label: '🎥 Meetings & Recordings', query: 'Show me my interview meetings and recorded talks' },
  { label: '🔒 Contact Privacy Shield', query: 'How does the platform hide my contact info from companies?' },
  { label: '⭐ Company Hiring Ratings', query: 'Explain company hiring ratings and hiring periods' },
  { label: '⚡ Auto-Apply Alerts', query: 'How do triggered email and WhatsApp alerts work?' },
  { label: '🌐 Create Portfolio', query: 'How do I create my portfolio?' },
  { label: '💼 Suitable Jobs', query: 'Show me jobs suitable for my profile' },
  { label: '📄 My Applications (11 Stages)', query: 'Show me my 11 application stages and status' },
  { label: '🎙️ Practice Interview', query: 'How do I prepare for an interview?' },
  { label: '📊 ATS Resume Score', query: 'Help me improve my resume ATS score' },
  { label: '🛡️ KYC Documents & OTP', query: 'Where can I upload my documents with OTP?' }
]

export const aiCopilotService = {
  async processQuery(userInput: string): Promise<CopilotResponse> {
    const q = userInput.toLowerCase().trim()
    const profile = profileService.get() || {}
    const candidateName = profile.name?.split(' ')[0] || 'Candidate'

    // ==========================================
    // 1. Posts & Community Feed Queries
    // ==========================================
    if (
      q.includes('post') ||
      q.includes('feed') ||
      q.includes('add post') ||
      q.includes('community post') ||
      q.includes('how to post')
    ) {
      return {
        text: `📰 **RAS Posts & Community Feed Hub**:\n\n` +
          `• **Discover Feeds**: View company hiring announcements, candidate project showcases, interview experiences (STAR method), and career insights.\n` +
          `• **Add Post**: Click **"Add Post"** to publish your updates. You can attach:\n` +
          `  - **Rich Descriptions**: Problem statements, results, or hiring requirements.\n` +
          `  - **Verified Links**: GitHub repository, live web demo, public portfolio, or 1-Click job application.\n` +
          `  - **Tags**: e.g., \`#hiring\`, \`#powerbi\`, \`#sql\`, \`#interview-experience\`.\n` +
          `  - **Author Switch**: Post as a Candidate or as a Company team.\n\n` +
          `Navigating you to the **Posts** module!`,
        suggestedRoute: '/posts',
        card: {
          type: 'navigation',
          title: 'Posts & Community Feed',
          actionUrl: '/posts',
          actionLabel: 'Open Posts Feed'
        },
        quickActions: [
          { label: 'Publish a Case Study', query: 'take me to my portfolio' },
          { label: 'Explore Company Jobs', query: 'take me to jobs' }
        ]
      }
    }

    // ==========================================
    // 2. In-Platform Meetings & Recordings Hub
    // ==========================================
    if (
      q.includes('meeting') ||
      q.includes('record') ||
      q.includes('transcript') ||
      q.includes('talk') ||
      q.includes('watch interview')
    ) {
      const meetings = meetingService.getMeetings()
      return {
        text: `🎥 **In-Platform Meeting & Recorded Talks Hub**:\n\n` +
          `• **Direct In-Platform Interviews**: Candidates join live video/audio meetings directly on RAS without third-party software.\n` +
          `• **Secure Cloud Recording**: All interview talks are recorded in real-time (\`🔴 REC Active\`) with proctoring integrity analytics.\n` +
          `• **Searchable Transcripts**: Complete verbatim dialog logs with speaker badges (AI Recruiter vs Candidate vs Hiring Manager) and competency scorecards.\n` +
          `• **Currently Indexed**: **${meetings.length} meeting sessions** available in your library.`,
        suggestedRoute: '/meetings',
        card: {
          type: 'navigation',
          title: 'Meetings & Recorded Talks Library',
          actionUrl: '/meetings',
          actionLabel: 'Open Meetings & Transcripts'
        },
        quickActions: [
          { label: 'Join Live Room', query: 'take me to interview' },
          { label: 'Check Upcoming Rounds', query: 'show me my upcoming interviews' }
        ]
      }
    }

    // ==========================================
    // 3. Contact Privacy Shield & Masking
    // ==========================================
    if (
      q.includes('privacy') ||
      q.includes('mask') ||
      q.includes('hide email') ||
      q.includes('hide phone') ||
      q.includes('hide contact') ||
      q.includes('direct contact')
    ) {
      return {
        text: `🔒 **Candidate Contact Privacy Shield Active**:\n\n` +
          `• **Direct Contact Masked**: Your direct personal email and phone number are masked (e.g. \`a*****i@gmail.com\`, \`+91 98****4321\`) from company panels to prevent unsolicited external phone calls or poaching.\n` +
          `• **In-Platform Communication**: Panel members and employers can view your full portfolio, verified case studies, and skills, and can initiate live meetings and messaging directly inside the RAS Candidate Portal.\n` +
          `• **Privacy Toggle**: You can toggle this shield ON/OFF anytime in your **Portfolio** and **Profile Settings**.`,
        suggestedRoute: '/portfolio',
        card: {
          type: 'navigation',
          title: 'Portfolio Privacy Shield',
          actionUrl: '/portfolio',
          actionLabel: 'View Privacy Settings'
        }
      }
    }

    // ==========================================
    // 4. Company Hiring Rating & Hiring Periods
    // ==========================================
    if (
      q.includes('rating') ||
      q.includes('hiring period') ||
      q.includes('response rate') ||
      q.includes('company rating')
    ) {
      return {
        text: `⭐ **Company Hiring Ratings & Hiring Periods Explained**:\n\n` +
          `• **Company Hiring Rating (e.g. 4.9 ★)**: Calculated automatically based on recruiter response velocity, feedback SLA adherence (<24h), and candidate interview satisfaction.\n` +
          `• **Response Badges**: Highlights *"99% Response Rate"*, *"Fast Responder (<12h)"*, and *"Same-Day Reply"*.\n` +
          `• **Hiring Periods**: Clearly informs you of joiner expectations such as:\n` +
          `  - ⚡ *Immediate (0-15 Days)*\n` +
          `  - 📅 *Active · Next 15 Days*\n` +
          `  - ⏱️ *30 Days Notice Accepted*\n` +
          `  - 🎯 *Cohort Joining (Q3)*\n\n` +
          `You can filter by both Hiring Period and minimum Rating in the **Jobs Explorer**!`,
        suggestedRoute: '/jobs',
        card: {
          type: 'navigation',
          title: 'Jobs with Company Ratings',
          actionUrl: '/jobs',
          actionLabel: 'Explore Rated Jobs'
        }
      }
    }

    // ==========================================
    // 5. Triggered Email & WhatsApp Dispatches
    // ==========================================
    if (
      q.includes('whatsapp') ||
      q.includes('email alert') ||
      q.includes('triggered') ||
      q.includes('auto-apply alert') ||
      q.includes('notification')
    ) {
      return {
        text: `📬 **Triggered Email & WhatsApp Notifications Protocol**:\n\n` +
          `Whenever the **Auto-Apply Engine** matches and submits an application for your profile:\n` +
          `1. **HTML Email Confirmation**: Dispatches an instant email with company name, job role, applied date, 24h recruiter response SLA, and ATS match breakdown.\n` +
          `2. **WhatsApp Mobile Alert**: Delivers a green-bubble text alert with one-tap link to track live application progress on your phone.\n\n` +
          `You can test or view the audit log in the **Auto Apply Engine** tab.`,
        suggestedRoute: '/auto-apply',
        card: {
          type: 'navigation',
          title: 'Auto-Apply Alerts & Dispatch Log',
          actionUrl: '/auto-apply',
          actionLabel: 'Open Auto-Apply Dispatches'
        }
      }
    }

    // ==========================================
    // 6. Direct Platform Navigation Queries
    // ==========================================

    // Take me to Portfolio
    if (
      q.includes('take me to my portfolio') ||
      q.includes('go to portfolio') ||
      q.includes('open portfolio') ||
      q.includes('open my portfolio') ||
      q === 'portfolio'
    ) {
      return {
        text: `Sure, ${candidateName}! Taking you directly to your **Public Portfolio & Panel Showcase**. Here you can preview your recruiter view, verify privacy masking, and highlight verified case studies.`,
        suggestedRoute: '/portfolio',
        card: {
          type: 'navigation',
          title: 'Public Candidate Portfolio',
          actionUrl: '/portfolio',
          actionLabel: 'Go to Portfolio Page'
        },
        quickActions: [
          { label: 'Edit Case Studies', query: 'How can I upload my project?' },
          { label: 'Privacy Shield', query: 'How does the platform hide my contact info from companies?' }
        ]
      }
    }

    // Take me to Applications (11 Stages)
    if (
      q.includes('show my applications') ||
      q.includes('take me to applications') ||
      q.includes('open applications') ||
      q.includes('view applications') ||
      q.includes('11 stages') ||
      q.includes('stages')
    ) {
      const apps = profile.applications || []
      return {
        text: `📊 **11-Stage Application Pipeline Overview**:\n\n` +
          `You have **${apps.length} active applications** across stages:\n` +
          `1. Application Submitted · 2. Resume Screening · 3. AI Screening · 4. Shortlisted · 5. Interview Scheduled · 6. Interview in Progress · 7. Interview Completed · 8. Under Review · 9. Selected · 10. Rejected · 11. On Hold.\n\n` +
          `Navigating you to your Kanban board with 24-hour recruiter SLA timers!`,
        suggestedRoute: '/applications',
        card: {
          type: 'navigation',
          title: '11-Stage Applications Pipeline',
          actionUrl: '/applications',
          actionLabel: 'Open Applications Kanban'
        }
      }
    }

    // Take me to Jobs
    if (
      q.includes('take me to jobs') ||
      q.includes('explore jobs') ||
      q.includes('open jobs') ||
      q.includes('job search') ||
      q.includes('find jobs')
    ) {
      return {
        text: `Taking you to the **Jobs Explorer** with 50+ live positions, employer response ratings, and hiring period filters.`,
        suggestedRoute: '/jobs',
        card: {
          type: 'navigation',
          title: 'Job Explorer & Recommendations',
          actionUrl: '/jobs',
          actionLabel: 'Explore All Jobs'
        }
      }
    }

    // Take me to Interview Studio / Practice
    if (
      q.includes('take me to interview') ||
      q.includes('open interview studio') ||
      q.includes('mock interview') ||
      q.includes('practice interview')
    ) {
      return {
        text: `Opening the **AI Interview Studio**. Practice behavioral, technical, and scenario rounds with real-time speech recognition, voice synthesis, and proctoring analytics.`,
        suggestedRoute: '/interview-practice',
        card: {
          type: 'navigation',
          title: 'AI Mock Interview Studio',
          actionUrl: '/interview-practice',
          actionLabel: 'Launch Interview Studio'
        }
      }
    }

    // Take me to Voice Screening
    if (
      q.includes('voice screening') ||
      q.includes('voice call') ||
      q.includes('call sarah') ||
      q.includes('ai call')
    ) {
      return {
        text: `Opening the **AI Voice HR Screening Simulator** with Sarah (RAS AI Talent Partner).`,
        suggestedRoute: '/voice-screening',
        card: {
          type: 'navigation',
          title: 'AI Voice HR Screening Simulator',
          actionUrl: '/voice-screening',
          actionLabel: 'Start Voice Screening Call'
        }
      }
    }

    // Take me to Documents / KYC
    if (
      q.includes('upload my documents') ||
      q.includes('where can i upload my documents') ||
      q.includes('kyc') ||
      q.includes('open documents') ||
      q.includes('otp')
    ) {
      return {
        text: `You can upload and verify your Aadhaar, PAN, degree certificates, experience letters, and salary slips in the **KYC Documents Hub** backed by Cloudinary and OTP identity authorization.`,
        suggestedRoute: '/documents',
        card: {
          type: 'navigation',
          title: 'Multi-Document KYC Hub',
          actionUrl: '/documents',
          actionLabel: 'Open KYC Documents Hub'
        }
      }
    }

    // Take me to Projects
    if (
      q.includes('upload my project') ||
      q.includes('how can i upload my project') ||
      q.includes('open projects') ||
      q.includes('case studies')
    ) {
      return {
        text: `You can showcase quantifiable case studies, architecture links, and trigger AI Quality Reviews in the **Projects Hub**.`,
        suggestedRoute: '/projects',
        card: {
          type: 'navigation',
          title: 'Candidate Projects & Case Studies',
          actionUrl: '/projects',
          actionLabel: 'Open Projects Showcase'
        }
      }
    }

    // Take me to Resume / ATS
    if (
      q.includes('ats') ||
      q.includes('resume') ||
      q.includes('scanner') ||
      q.includes('improve my resume')
    ) {
      const ats = resumeAnalysisService.analyze(profile)
      return {
        text: `📄 **ATS Resume Diagnostics for ${profile.name || 'Candidate'}**:\n\n` +
          `• **Overall ATS Match Score**: **${ats.score}/100** (Top Tier Candidate Pool)\n` +
          `• **Key Matched Skills**: SQL, Power BI, Python, Business Analysis, Agile\n` +
          `• **Primary Recommendation**: ${ats.recommendations[0] || 'Include quantifiable metrics and cloud warehousing tools'}.\n\n` +
          `Would you like to scan new resumes or review tailored keyword gaps?`,
        suggestedRoute: '/resume',
        card: {
          type: 'ats_analysis',
          title: `ATS Score: ${ats.score}/100`,
          data: ats,
          actionUrl: '/resume',
          actionLabel: 'Open Full ATS Resume Scanner'
        }
      }
    }

    // Take me to Auto Apply
    if (
      q.includes('automatically applied') ||
      q.includes('auto-apply') ||
      q.includes('auto apply')
    ) {
      return {
        text: `Your **1-Click Auto-Apply Engine** is active with triggered Email & WhatsApp dispatches on every submission under 24-hour recruiter SLA tracking.`,
        suggestedRoute: '/auto-apply',
        card: {
          type: 'navigation',
          title: 'Auto-Apply Automation Engine',
          actionUrl: '/auto-apply',
          actionLabel: 'Manage Auto-Apply Settings'
        }
      }
    }

    // Default Intelligent Assistant Response
    return {
      text: `Hello ${candidateName}! I am your RAS AI Copilot & Platform Navigation Assistant. I can help you with:\n\n` +
        `• **Community Feeds**: *"Take me to posts"*, *"How do I add a post?"*\n` +
        `• **Meetings & Recordings**: *"Show my interview recordings and transcripts"*\n` +
        `• **Privacy & Security**: *"How does the platform hide my contact info from employers?"*\n` +
        `• **Hiring Ratings**: *"Show jobs with high company response ratings"*\n` +
        `• **Application Tracking**: *"Show my 11 application stages"*\n` +
        `• **Interview & Voice Drills**: *"Start practice interview"*, *"AI voice call"*\n` +
        `• **KYC & OTP Verification**: *"Upload documents with OTP"*\n\n` +
        `What would you like to explore?`,
      quickActions: AI_QUICK_ACTIONS.slice(0, 6)
    }
  },

  // Execute confirmed sensitive action
  async executeConfirmedAction(actionType: string, payload: any): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
    if (actionType === 'apply_job') {
      const res = await jobService.applyToJob(payload.jobId)
      return {
        success: res.success,
        message: res.success
          ? `Application to ${payload.company} for "${payload.jobTitle}" submitted successfully! 🚀`
          : res.message,
        redirectUrl: '/applications'
      }
    }

    if (actionType === 'enable_auto_apply') {
      const p = profileService.get() || {}
      p.settings = { ...(p.settings || {}), autoApply: true }
      profileService.save(p)
      return {
        success: true,
        message: '1-Click Auto-Apply Engine enabled with 80% minimum match score!',
        redirectUrl: '/auto-apply'
      }
    }

    return { success: true, message: 'Action executed successfully!' }
  }
}
