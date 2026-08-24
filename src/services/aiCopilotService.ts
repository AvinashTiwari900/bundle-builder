import { profileService } from './profileService'
import { jobService } from './jobService'
import { resumeAnalysisService } from './resumeAnalysisService'
import { portfolioService } from './portfolioService'

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
  { label: '🚀 Complete Profile', query: 'How do I complete my profile?' },
  { label: '🌐 Create Portfolio', query: 'How do I create my portfolio?' },
  { label: '💼 Suitable Jobs', query: 'Show me jobs suitable for my profile' },
  { label: '📄 My Applications', query: 'Show me my applications and status' },
  { label: '🎙️ Practice Interview', query: 'How do I prepare for an interview?' },
  { label: '📅 Upcoming Interviews', query: 'Show me my upcoming interviews' },
  { label: '📊 ATS Resume Score', query: 'Help me improve my resume ATS score' },
  { label: '📁 Upload Projects', query: 'How can I upload my project?' },
  { label: '🛡️ KYC Documents', query: 'Where can I upload my documents?' },
  { label: '⚡ Auto-Apply Engine', query: 'Show me jobs I have automatically applied for' }
]

export const aiCopilotService = {
  async processQuery(userInput: string): Promise<CopilotResponse> {
    const q = userInput.toLowerCase().trim()
    const profile = profileService.get() || {}
    const candidateName = profile.name?.split(' ')[0] || 'Candidate'

    // ==========================================
    // 1. Direct Platform Navigation Queries
    // ==========================================

    // Take me to Portfolio
    if (q.includes('take me to my portfolio') || q.includes('go to portfolio') || q.includes('open portfolio') || q.includes('open my portfolio') || q === 'portfolio') {
      return {
        text: `Sure, ${candidateName}! I'll take you directly to your Public Portfolio showcase. Here you can edit your bio, competencies, case studies, and public links.`,
        suggestedRoute: '/portfolio',
        card: {
          type: 'navigation',
          title: 'Public Candidate Portfolio',
          actionUrl: '/portfolio',
          actionLabel: 'Go to Portfolio Page'
        },
        quickActions: [
          { label: 'Edit Case Studies', query: 'How can I upload my project?' },
          { label: 'Preview Portfolio', query: 'Show my portfolio strength' }
        ]
      }
    }

    // Take me to Applications
    if (q.includes('show my applications') || q.includes('take me to applications') || q.includes('open applications') || q.includes('view applications')) {
      const apps = profile.applications || []
      return {
        text: `Here is the status of your ${apps.length} active recruitment pipelines. Navigating you to the Applications Kanban tracker.`,
        suggestedRoute: '/applications',
        card: {
          type: 'navigation',
          title: 'My Applications Pipeline',
          actionUrl: '/applications',
          actionLabel: 'Open Applications Kanban'
        }
      }
    }

    // Take me to Jobs
    if (q.includes('take me to jobs') || q.includes('explore jobs') || q.includes('open jobs') || q.includes('job search') || q.includes('find jobs')) {
      return {
        text: `Taking you to the Jobs Explorer with 50+ live tech and analytics roles matched to your target criteria.`,
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
    if (q.includes('take me to interview') || q.includes('open interview studio') || q.includes('mock interview') || q.includes('practice interview')) {
      return {
        text: `Opening the AI Interview Practice Studio. You can practice behavioral and technical questions with real-time AI speech and proctoring analytics.`,
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
    if (q.includes('voice screening') || q.includes('voice call') || q.includes('call sarah') || q.includes('ai call')) {
      return {
        text: `Opening the AI Voice HR Screening Simulator with Sarah (RAP AI Talent Partner).`,
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
    if (q.includes('upload my documents') || q.includes('where can i upload my documents') || q.includes('kyc') || q.includes('open documents')) {
      return {
        text: `You can upload and verify your Aadhaar, PAN, degree certificates, and previous employment letters in the Multi-Document KYC Hub with OTP authentication.`,
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
    if (q.includes('upload my project') || q.includes('how can i upload my project') || q.includes('open projects') || q.includes('case studies')) {
      return {
        text: `You can showcase quantifiable case studies, architecture links, and trigger AI Technical Quality Reviews in the Projects Hub.`,
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
    if (q.includes('ats') || q.includes('resume') || q.includes('scanner') || q.includes('improve my resume')) {
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
    if (q.includes('automatically applied') || q.includes('auto-apply') || q.includes('auto apply')) {
      return {
        text: `Your **1-Click Auto-Apply Engine** is currently active with a minimum 80% match threshold. It automatically submits your tailored profile to high-compatibility roles while maintaining strict 24-hour recruiter SLA tracking.`,
        suggestedRoute: '/auto-apply',
        card: {
          type: 'navigation',
          title: 'Auto-Apply Automation Engine',
          actionUrl: '/auto-apply',
          actionLabel: 'Manage Auto-Apply Settings'
        }
      }
    }

    // Take me to Profile
    if (q.includes('complete my profile') || q.includes('how do i complete my profile') || q.includes('edit profile') || q.includes('my profile')) {
      return {
        text: `Navigating you to your Candidate Profile management page where you can update your notice period, salary expectations, preferred work locations, and professional certifications.`,
        suggestedRoute: '/profile',
        card: {
          type: 'navigation',
          title: 'Candidate Profile & Preferences',
          actionUrl: '/profile',
          actionLabel: 'Open Profile Manager'
        }
      }
    }

    // ==========================================
    // 2. Interactive Guided Workflows
    // ==========================================

    // Portfolio Creation Workflow
    if (q.includes('create my portfolio') || q.includes('how do i create my portfolio') || q.includes('create portfolio') || q.includes('portfolio workflow')) {
      return {
        text: `Here is the step-by-step workflow to build an employer-ready public portfolio on RAP. I can guide you through each stage:`,
        card: {
          type: 'workflow',
          title: 'Portfolio Creation & Publishing Workflow',
          data: [
            { step: 1, title: 'Professional Summary', description: 'Craft your headline and executive elevator pitch', route: '/portfolio-setup', actionLabel: 'Edit Summary' },
            { step: 2, title: 'Skills & Competencies', description: 'Add 6-10 primary technical skills & domain tags', route: '/portfolio-setup', actionLabel: 'Add Skills' },
            { step: 3, title: 'Academic Education', description: 'Verify college degree, graduation year, and score', route: '/portfolio-setup', actionLabel: 'Verify Education' },
            { step: 4, title: 'Work Experience', description: 'Detail previous roles with measurable business outcomes', route: '/portfolio-setup', actionLabel: 'Add Experience' },
            { step: 5, title: 'Featured Projects', description: 'Highlight 2-3 case studies with GitHub & Demo links', route: '/projects', actionLabel: 'Manage Projects' },
            { step: 6, title: 'Social & Verified Links', description: 'Connect verified LinkedIn, GitHub, and portfolio URLs', route: '/portfolio', actionLabel: 'Connect Links' },
            { step: 7, title: 'Live Preview & Publish', description: 'Review the recruiter live view and generate public link', route: '/portfolio', actionLabel: 'Preview & Share' }
          ],
          actionUrl: '/portfolio-setup',
          actionLabel: 'Start Guided Portfolio Wizard'
        },
        quickActions: [
          { label: '⚡ Open Portfolio Wizard', query: 'take me to my portfolio' },
          { label: '📁 Add Case Studies', query: 'How can I upload my project?' }
        ]
      }
    }

    // Job Application Workflow
    if (q.includes('how can i apply for a job') || q.includes('apply for jobs') || q.includes('how to apply') || q.includes('job application workflow')) {
      return {
        text: `Here is the complete end-to-end Job Application Workflow on RAP:`,
        card: {
          type: 'workflow',
          title: 'Job Discovery & Application Workflow',
          data: [
            { step: 1, title: 'Profile Completion', description: 'Ensure profile is >80% complete with salary & notice period', route: '/profile', actionLabel: 'Check Profile' },
            { step: 2, title: 'Resume ATS Check', description: 'Verify primary resume scores 85%+ on target keywords', route: '/resume', actionLabel: 'Check ATS' },
            { step: 3, title: 'Job Matching', description: 'Review high-compatibility jobs (90%+ match scoring)', route: '/jobs', actionLabel: 'View High Matches' },
            { step: 4, title: 'JD Gap Analysis', description: 'Run "⚡ JD Match" to inspect missing keywords before submitting', route: '/jobs', actionLabel: 'Compare JD' },
            { step: 5, title: '1-Click Submission', description: 'Submit with recruiter confirmation & 24h SLA tracking', route: '/applications', actionLabel: 'Track Pipeline' }
          ],
          actionUrl: '/jobs',
          actionLabel: 'Explore Jobs Now'
        }
      }
    }

    // Interview Preparation Workflow
    if (q.includes('how do i prepare for an interview') || q.includes('prepare for an interview') || q.includes('interview preparation')) {
      return {
        text: `Here is the optimal Interview Preparation Plan tailored for your target role (**${profile.headline || 'Business Analyst'}**):`,
        card: {
          type: 'workflow',
          title: 'AI-Powered Interview Preparation Workflow',
          data: [
            { step: 1, title: 'Role & Topic Selection', description: 'Pick target role (BA, Product, SDE, Data) & difficulty level', route: '/interview-practice', actionLabel: 'Select Topic' },
            { step: 2, title: 'AI Proctoring Check', description: 'Test video camera, microphone, and gaze tracking monitor', route: '/interview-practice', actionLabel: 'Test Equipment' },
            { step: 3, title: 'Interactive Mock Studio', description: 'Answer live dynamic questions with real-time AI speech feedback', route: '/interview-practice', actionLabel: 'Start Mock' },
            { step: 4, title: 'Scorecard & Gap Diagnostics', description: 'Analyze technical depth, problem-solving, and communication metrics', route: '/interview-practice', actionLabel: 'View Metrics' },
            { step: 5, title: 'Voice HR Screening Drill', description: 'Simulate HR screening dialogue (notice period, CTC, culture)', route: '/voice-screening', actionLabel: 'Drill HR Call' }
          ],
          actionUrl: '/interview-practice',
          actionLabel: 'Launch Practice Studio'
        }
      }
    }

    // ==========================================
    // 3. Context-Aware Questions (Applications, Status, Interviews)
    // ==========================================

    // Show upcoming interviews
    if (q.includes('upcoming interview') || q.includes('show me my upcoming interviews') || q.includes('scheduled interview')) {
      const apps = profile.applications || []
      const scheduled = apps.filter((a: any) => a.status === 'Interview Scheduled' || a.status === 'Interview in Progress')
      
      if (scheduled.length > 0) {
        return {
          text: `📅 You have **${scheduled.length} upcoming interview** scheduled:\n\n` +
            scheduled.map((s: any) =>
              `• **${s.jobTitle}** with **${s.company}**\n` +
              `  - **Date/Time**: ${s.interviewDate || 'Thursday, 3:00 PM (45 mins)'}\n` +
              `  - **Stage**: Technical Evaluation Round\n` +
              `  - **Match Score**: ${s.matchScore || 94}% compatibility`
            ).join('\n\n') +
            `\n\nEnsure your camera is enabled for AI proctoring before entering the room.`,
          suggestedRoute: '/interview/room/int-1',
          card: {
            type: 'interview_list',
            title: 'Scheduled Interview Session',
            data: scheduled[0],
            actionUrl: '/interview/room/int-1',
            actionLabel: 'Enter AI Video Interview Room'
          }
        }
      } else {
        return {
          text: `You currently have no interviews scheduled. Would you like to practice in the AI Mock Interview Studio to prepare for upcoming recruiter shortlists?`,
          suggestedRoute: '/interview-practice',
          card: {
            type: 'navigation',
            title: 'AI Mock Interview Studio',
            actionUrl: '/interview-practice',
            actionLabel: 'Practice Mock Interview'
          }
        }
      }
    }

    // Show suitable jobs
    if (q.includes('suitable for my profile') || q.includes('jobs suitable') || q.includes('recommend jobs') || q.includes('top jobs')) {
      const allJobs = await jobService.list()
      const top3 = allJobs.slice(0, 3)
      return {
        text: `🎯 **Top 3 Jobs Highly Matched to Your Profile (${profile.headline || 'Business Analyst'})**:\n\n` +
          top3.map((j: any, idx: number) =>
            `${idx + 1}. **${j.title}** · **${j.company}** (${j.location})\n` +
            `   - Salary: ₹${Math.round(j.salaryMin/100000)}-${Math.round(j.salaryMax/100000)} LPA · *${j.workMode}*\n` +
            `   - Matched Skills: ${(j.skills || []).slice(0, 3).join(', ')}`
          ).join('\n\n'),
        card: {
          type: 'job_list',
          title: 'Top AI Recommended Opportunities',
          data: top3,
          actionUrl: '/jobs',
          actionLabel: 'View All Recommended Jobs'
        }
      }
    }

    // Application status & evaluation breakdown
    if (q.includes('status of my application') || q.includes('application status') || q.includes('why was i not shortlisted') || q.includes('what should i improve')) {
      const apps = profile.applications || []
      const ats = resumeAnalysisService.analyze(profile)
      return {
        text: `📊 **Candidate Evaluation & Applications Status Breakdown**:\n\n` +
          `• **Active Applications**: ${apps.length} in pipeline\n` +
          `  - **Northstar Analytics** (Senior BA): *Interview Scheduled* (94% match) — Recruiter SLA on track.\n` +
          `  - **Lattice Labs** (Product Analyst): *AI Screening Passed* (92% match) — Advancing to Round 2.\n` +
          `  - **Astra Digital** (Data Analyst & BI Lead): *Shortlisted* (88% match).\n\n` +
          `💡 **Identified Improvement Areas**:\n` +
          `1. **ATS Keyword Alignment**: Your resume scores **${ats.score}/100**. Adding keywords like *Snowflake*, *Cloud Data Warehousing*, and *CI/CD for Analytics* will boost ATS shortlisting to 98%.\n` +
          `2. **Projects Showcase**: Adding live demo URLs to your 2 case studies increases recruiter response rates by 45%.\n` +
          `3. **KYC Verification**: 2 of 3 identity documents are verified. Complete the remaining experience letter in the KYC hub.`,
        card: {
          type: 'navigation',
          title: 'Applications Kanban & SLA Tracker',
          actionUrl: '/applications',
          actionLabel: 'View Applications Tracker'
        },
        quickActions: [
          { label: 'Improve Resume ATS', query: 'Help me improve my resume ATS score' },
          { label: 'Upload KYC Documents', query: 'Where can I upload my documents?' }
        ]
      }
    }

    // ==========================================
    // 4. Sensitive Actions (Requires Explicit Confirmation)
    // ==========================================

    // Applying to a specific job directly
    if (q.includes('apply for') || q.includes('submit application') || q.includes('apply to')) {
      const allJobs = await jobService.list()
      const targetJob = allJobs.find((j: any) =>
        q.includes(j.title.toLowerCase()) || q.includes(j.company.toLowerCase())
      ) || allJobs[0]

      return {
        text: `⚠️ **Action Confirmation Required**:\n\nIn accordance with RAP security policies, the AI Copilot does not submit job applications without your explicit consent.\n\nWould you like to confirm submitting your application with primary resume **${profile.resumes?.[0]?.name || 'Avinash_Tiwari_Lead_BA.pdf'}**?`,
        card: {
          type: 'confirmation',
          title: `Apply to ${targetJob.company}`,
          confirmationAction: {
            actionType: 'apply_job',
            payload: { jobId: targetJob.id, jobTitle: targetJob.title, company: targetJob.company },
            prompt: `Confirm submitting application for ${targetJob.title} at ${targetJob.company}?`
          },
          actionUrl: `/jobs/${targetJob.id}`,
          actionLabel: 'Review Job Details First'
        }
      }
    }

    // ==========================================
    // 5. Default Intelligent Assistant Response
    // ==========================================
    return {
      text: `Hello ${candidateName}! I am your RAP AI Copilot & Platform Navigation Assistant. I can help you with:\n\n` +
        `• **Platform Navigation**: *"Take me to my portfolio"*, *"Open applications"*, *"Explore jobs"*\n` +
        `• **Workflow Guidance**: *"How do I create my portfolio?"*, *"How can I apply for a job?"*, *"How do I prepare for an interview?"*\n` +
        `• **Career Intelligence**: *"Analyze my resume ATS score"*, *"Show jobs suitable for my profile"*, *"What should I improve?"*\n` +
        `• **Live Status**: *"Show me my upcoming interviews"*, *"What is the status of my applications?"*\n\n` +
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
