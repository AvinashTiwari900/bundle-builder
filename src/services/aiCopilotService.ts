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
  route?: string
  actionLabel?: string
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
  { label: '🌐 Create Portfolio', query: 'How do I create my portfolio?' },
  { label: '📊 Improve ATS Score', query: 'How do I improve my ATS score?' },
  { label: '💼 Apply for Jobs', query: 'How do I find and apply for jobs?' },
  { label: '🎥 Meetings & Records', query: 'How do I start or schedule a meeting?' },
  { label: '🔴 Record & Transcripts', query: 'How do I record a meeting and export transcripts?' },
  { label: '🎙️ Practice Interview', query: 'How do I prepare for an interview in Interview Studio?' },
  { label: '📞 AI Voice Screening', query: 'How do I take the AI Voice Screening call?' },
  { label: '⚡ Auto Apply Engine', query: 'How do I use Auto Apply and configure alerts?' },
  { label: '🛡️ KYC Documents & OTP', query: 'How do I upload KYC documents with OTP?' },
  { label: '📁 Add Project Showcase', query: 'How do I add a project or case study?' },
  { label: '📋 Application Stages (11)', query: 'How do I track my applications through the 11 stages?' },
  { label: '📰 Community Posts', query: 'How do I add a post to the community feed?' },
  { label: '🔒 Privacy Shield', query: 'How does Contact Privacy Shield hide my details?' },
  { label: '⭐ Company Hiring Ratings', query: 'Explain company hiring ratings and hiring periods' }
]

export const aiCopilotService = {
  async processQuery(userInput: string): Promise<CopilotResponse> {
    const q = userInput.toLowerCase().trim()
    const profile = profileService.get() || {}
    const candidateName = profile.name?.split(' ')[0] || 'Candidate'
    const ats = resumeAnalysisService.analyze(profile)
    const portfolio = portfolioService.get()
    const apps = profile.applications || []
    const meetings = meetingService.getMeetings()

    // =========================================================================
    // 1. PORTFOLIO WORKFLOWS
    // =========================================================================
    if (
      q.includes('create portfolio') ||
      q.includes('create my portfolio') ||
      q.includes('build portfolio') ||
      q.includes('publish portfolio') ||
      q.includes('setup portfolio') ||
      (q.includes('how') && q.includes('portfolio'))
    ) {
      return {
        text: `### How to Create & Publish Your Candidate Portfolio\n\n` +
          `Your public portfolio is your verified showcase presented to hiring panels and recruiters across the platform.\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Portfolio**\n` +
          `   Go to the left sidebar and click **Portfolio (Panel View)**.\n` +
          `2. **Step 2 — Click Edit or Setup**\n` +
          `   Click **"Edit Fields"** (or **"Launch Portfolio Setup Wizard"** if setting up for the first time).\n` +
          `3. **Step 3 — Enter Your Core Details**\n` +
          `   Add your professional headline, executive summary/intro, target salary, and core skills.\n` +
          `4. **Step 4 — Add Featured Projects & Social Links**\n` +
          `   Attach your case studies, GitHub profile (\`https://github.com/AvinashTiwari900\`), and LinkedIn URL.\n` +
          `5. **Step 5 — Configure Contact Privacy Shield**\n` +
          `   Toggle **Contact Privacy Shield ON** to protect your direct phone number and email from unsolicited calls.\n` +
          `6. **Step 6 — Save & Publish**\n` +
          `   Click **"Save Changes"**.\n\n` +
          `**What happens next?**\n` +
          `Your verified portfolio goes live immediately. You can click **"👁️ View as Recruiter/Panel"** to see exactly how employer panels view your profile.\n\n` +
          `💡 **Pro Tip**: Aim for at least 2 case studies with measurable outcomes (e.g. *"reduced query latency by 75%"*) to boost your portfolio strength score above 90%.`,
        suggestedRoute: '/portfolio',
        card: {
          type: 'navigation',
          title: 'Candidate Portfolio & Showcase',
          actionUrl: '/portfolio',
          actionLabel: 'Open Portfolio'
        },
        quickActions: [
          { label: 'Add Project to Portfolio', query: 'How do I add a project or case study?' },
          { label: 'Toggle Privacy Shield', query: 'How does Contact Privacy Shield hide my details?' }
        ]
      }
    }

    // Follow-up: What to put in projects section
    if (
      q.includes('what should i put in') ||
      q.includes('what to put in project') ||
      q.includes('project section') ||
      q.includes('case study tips')
    ) {
      return {
        text: `### What to Include in Your Projects & Case Studies\n\n` +
          `Hiring panels look for evidence-based business impact using the **STAR Method** (Situation, Task, Action, Result).\n\n` +
          `**Key Elements to Include:**\n` +
          `• **Project Title & Role**: e.g., *"Enterprise Revenue Analytics Engine — Lead Business Analyst"*\n` +
          `• **Problem Description**: Describe the business friction or challenge (e.g., *"Manual reporting took 4 days with inventory allocation mismatches"*).\n` +
          `• **Your Responsibilities & Actions**: Specific methodologies used (e.g., *"Authored FRD, architected star-schema data warehouse, designed ETL pipelines"*).\n` +
          `• **Quantifiable Outcomes**: Numbers that stand out (e.g., *"Cut reporting latency to 2 hours; saved ~₹18 Lakhs in errors"*).\n` +
          `• **Tech Stack & Repositories**: Tag technologies (\`SQL\`, \`Power BI\`, \`Python\`, \`Snowflake\`) and provide public GitHub / demo links.\n\n` +
          `**How to Add:**\n` +
          `Open **Projects** from the left sidebar → Click **"Add Project"** → Fill out the fields → Click **"Save Project"**.\n\n` +
          `💡 **Pro Tip**: Use our **"AI Quality Review"** button on any project to get automated suggestions for stronger metrics.`,
        suggestedRoute: '/projects',
        card: {
          type: 'navigation',
          title: 'Projects & Case Studies Hub',
          actionUrl: '/projects',
          actionLabel: 'Go to Projects'
        }
      }
    }

    // =========================================================================
    // 2. RESUME & ATS SCORE WORKFLOWS
    // =========================================================================
    if (
      q.includes('ats') ||
      q.includes('resume') ||
      q.includes('improve score') ||
      q.includes('low score') ||
      q.includes('scanner')
    ) {
      return {
        text: `### How to Improve Your Resume ATS Score\n\n` +
          `Your current ATS score is **${ats.score}/100** (${ats.score >= 85 ? 'Strong Match' : ats.score >= 70 ? 'Good Match' : 'Needs Optimization'}). The ATS engine evaluates keyword density, formatting simplicity, and alignment with target role descriptions.\n\n` +
          `**Steps to Improve:**\n` +
          `1. **Step 1 — Open Resume & ATS**\n` +
          `   Go to the left sidebar and click **Resume & ATS**.\n` +
          `2. **Step 2 — Upload Your Target Resume**\n` +
          `   Drag & drop your latest PDF/DOCX resume or select an existing uploaded file.\n` +
          `3. **Step 3 — Run ATS Diagnostic**\n` +
          `   Click **"Run ATS Diagnostics"** to inspect keyword match rates, section formatting, and parsing errors.\n` +
          `4. **Step 4 — Review Missing Keywords**\n` +
          `   Check the **Missing Keywords** checklist (e.g. *${ats.recommendations[0] || 'Cloud ETL, Data Modeling, Metric Dashboards'}*).\n` +
          `5. **Step 5 — Update & Re-scan**\n` +
          `   Incorporate the recommended skills into your experience bullet points and re-upload.\n\n` +
          `**What happens next?**\n` +
          `Your updated ATS score will reflect in job application match calculations and boost your ranking in the **Auto-Apply Engine**.\n\n` +
          `💡 **Pro Tip**: Avoid two-column tables, text boxes, and complex graphics in your resume PDF, as ATS parsers struggle to read them sequentially.`,
        suggestedRoute: '/resume',
        card: {
          type: 'ats_analysis',
          title: `ATS Score: ${ats.score}/100`,
          data: ats,
          actionUrl: '/resume',
          actionLabel: 'Open ATS Resume Scanner'
        },
        quickActions: [
          { label: 'Explore Matching Jobs', query: 'Show me jobs suitable for my profile' },
          { label: 'Configure Auto Apply', query: 'How do I use Auto Apply?' }
        ]
      }
    }

    // =========================================================================
    // 3. JOB SEARCH & APPLY WORKFLOWS
    // =========================================================================
    if (
      q.includes('apply for a job') ||
      q.includes('how do i apply') ||
      q.includes('find jobs') ||
      q.includes('search jobs') ||
      q.includes('suitable jobs') ||
      q.includes('which jobs')
    ) {
      return {
        text: `### How to Find & Apply for Jobs on Gettin Candidates\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Explore Jobs**\n` +
          `   Go to the left sidebar and click **Explore Jobs**.\n` +
          `2. **Step 2 — Filter by Your Preferences**\n` +
          `   Use filters at the top for **Role** (e.g. *Business Analyst*), **Location**, **Hiring Rating (4.5+ ★)**, and **Hiring Period** (*Immediate / 15 Days*).\n` +
          `3. **Step 3 — Inspect Job Details & SLA**\n` +
          `   Click on any job card to review the required competencies, recruiter response velocity, and salary package.\n` +
          `4. **Step 4 — Submit Your Application**\n` +
          `   Click **"1-Click Apply"** or **"Apply with Profile"**.\n` +
          `5. **Step 5 — Track Live Status**\n` +
          `   Head over to **Applications** to monitor your submission across the 11 recruitment stages.\n\n` +
          `**What happens next?**\n` +
          `The employer receives your verified credentials and resume. The employer's 24-hour response SLA timer activates, and you will receive instant notifications upon status progression.\n\n` +
          `💡 **Pro Tip**: Check the **Hiring Period** badge before applying to ensure your notice period aligns with the team's onboarding timeline.`,
        suggestedRoute: '/jobs',
        card: {
          type: 'navigation',
          title: 'Explore 50+ Verified Jobs',
          actionUrl: '/jobs',
          actionLabel: 'Open Job Explorer'
        },
        quickActions: [
          { label: 'Track Active Applications', query: 'How do I track my applications?' },
          { label: 'Check ATS Score First', query: 'How do I improve my ATS score?' }
        ]
      }
    }

    // =========================================================================
    // 4. MEETINGS & RECORDS MODULE (GENERAL-PURPOSE MEETING PLATFORM)
    // =========================================================================
    if (
      q.includes('instant meeting') ||
      q.includes('start a meeting') ||
      q.includes('schedule a meeting') ||
      q.includes('invite someone') ||
      q.includes('how do i start meeting')
    ) {
      return {
        text: `### How to Start or Schedule a Meeting\n\n` +
          `The **Meetings & Records** module is a general-purpose video conference platform built for team syncs, client reviews, project planning, and collaboration.\n\n` +
          `**Option A: Start an Instant Meeting**\n` +
          `1. Open **Meetings & Records** from the left sidebar.\n` +
          `2. Click **"Start Instant Meeting"**.\n` +
          `3. A **"Your Meeting is Ready"** screen will appear with a secure link (e.g. \`http://localhost:5173/meet/X7K92P\`).\n` +
          `4. Click **"Copy"** and share the link with your participants.\n` +
          `5. Click **"Start Meeting Now"** to enter the room.\n\n` +
          `**Option B: Schedule a Meeting in Advance**\n` +
          `1. Open **Meetings & Records** → Click **"Schedule Meeting"**.\n` +
          `2. Enter Meeting Title, Meeting Type, Date, Time, and optional Passcode/Waiting Room.\n` +
          `3. Click **"Schedule & Generate Link"**.\n` +
          `4. Copy the invite link or find it under **Upcoming Scheduled Meetings**.\n\n` +
          `**What happens next?**\n` +
          `Participants can open the link in any browser, calibrate their mic & camera on the **Pre-Join Screen**, and enter the call directly without mandatory account signup.\n\n` +
          `💡 **Pro Tip**: You can also join any existing meeting by clicking **"Join Meeting"** on the dashboard and typing the 6-character code.`,
        suggestedRoute: '/meetings',
        card: {
          type: 'navigation',
          title: 'Meetings & Records Hub',
          actionUrl: '/meetings',
          actionLabel: 'Open Meetings'
        },
        quickActions: [
          { label: 'How to Record a Meeting', query: 'How do I record a meeting?' },
          { label: 'How to Share Screen', query: 'How do I share my screen in a meeting?' }
        ]
      }
    }

    if (
      q.includes('record a meeting') ||
      q.includes('record meeting') ||
      q.includes('how to record') ||
      q.includes('recording') ||
      q.includes('where can i find my recordings') ||
      q.includes('transcript') ||
      q.includes('export transcript')
    ) {
      return {
        text: `### How to Record Meetings & Access Transcripts\n\n` +
          `Recording in the Meetings module is **strictly user-initiated** and never starts automatically.\n\n` +
          `**How to Record During a Meeting:**\n` +
          `1. Inside the meeting room, click the **"Record Meeting"** button on the bottom control bar.\n` +
          `2. A banner will notify all participants: *🔴 REC Active* with a live recording stopwatch.\n` +
          `3. If you share your screen during the recording, the screen share will also be captured.\n` +
          `4. When finished, click **"Stop Recording"**.\n\n` +
          `**How to Access & Review Recordings:**\n` +
          `1. Open **Meetings & Records** from the left sidebar.\n` +
          `2. In the **Meeting Records & Transcripts** list, select your recorded session.\n` +
          `3. Use the **HTML5 Video Player** with speed controls (\`1.0x - 2.0x\`) and Camera/Screen toggles.\n` +
          `4. Open the **Transcript** tab to view turn-by-turn spoken dialogue.\n` +
          `5. **Click any timestamp (e.g. \`[01:10]\`)** to jump video playback straight to that moment!\n` +
          `6. Click **"Export (.txt)"** to download the complete meeting record and minutes.\n` +
          `7. Open **"AI Meeting Assistant"** to view auto-generated executive summaries, decisions, and action items.\n\n` +
          `💡 **Pro Tip**: You can write timestamped notes in the **Meeting Notes** tab by clicking **"Pin Note"** at any point in the video playback.`,
        suggestedRoute: '/meetings',
        card: {
          type: 'navigation',
          title: 'Meeting Records & Transcripts',
          actionUrl: '/meetings',
          actionLabel: 'View Meeting Records'
        }
      }
    }

    if (
      q.includes('share screen') ||
      q.includes('screen sharing') ||
      q.includes('share my screen')
    ) {
      return {
        text: `### How to Share Your Screen During a Meeting\n\n` +
          `Screen sharing is fully functional and operates **completely independently** from meeting recording.\n\n` +
          `**Steps:**\n` +
          `1. In the meeting room, locate the bottom toolbar and click **"Share Screen"** (\`🖥️\`).\n` +
          `2. Your browser will prompt you to choose: **Entire Screen**, **Window**, or **Browser Tab**.\n` +
          `3. Select the target window and click **Share**.\n` +
          `4. The central meeting stage will switch to your shared screen, with participants docked neatly below.\n` +
          `5. A top banner will display: *"You are currently sharing your screen"*. Click **"Stop Sharing"** anytime to return to camera view.\n\n` +
          `**What happens next?**\n` +
          `All participants in the room will see your live screen in real time. If you decide to click **"Record Meeting"**, the shared screen will also be preserved in the final video recording.\n\n` +
          `💡 **Pro Tip**: Hosts can lock or allow screen sharing permissions for all guests via the **Participants** panel.`,
        suggestedRoute: '/meetings',
        card: {
          type: 'navigation',
          title: 'Live Meeting Room',
          actionUrl: '/meetings',
          actionLabel: 'Open Meetings'
        }
      }
    }

    // =========================================================================
    // 5. INTERVIEW STUDIO & PRACTICE DRILLS (RECRUITMENT SPECIFIC)
    // =========================================================================
    if (
      q.includes('interview studio') ||
      q.includes('prepare for an interview') ||
      q.includes('practice interview') ||
      q.includes('mock interview') ||
      q.includes('interview simulation')
    ) {
      return {
        text: `### How to Prepare & Practice in Interview Studio\n\n` +
          `The **Interview Studio** is dedicated to self-preparation and realistic mock interview simulations.\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Interview Studio**\n` +
          `   Go to the left sidebar and click **Interview Studio**.\n` +
          `2. **Step 2 — Select Your Practice Mode**\n` +
          `   Choose from **Technical & Data BA**, **Behavioral & STAR Method**, **System Design**, or **Full Simulation**.\n` +
          `3. **Step 3 — Configure Session Parameters**\n` +
          `   Select the number of questions (2 to 8) and per-question countdown timer (e.g. 60s, 90s, 120s).\n` +
          `4. **Step 4 — Launch AI Session**\n` +
          `   Click **"Launch AI Interview Session"**.\n` +
          `5. **Step 5 — Read Guidelines & Begin**\n` +
          `   Review the session rules. Click **"Show Question"** when you are ready to reveal the question and start speaking.\n` +
          `6. **Step 6 — Answer & Review Feedback**\n` +
          `   Speak your answer using live speech-to-text dictation. Receive instantaneous STAR-method feedback, tone analysis, and competency ratings.\n\n` +
          `**What happens next?**\n` +
          `Upon completion, a detailed scorecard is saved to your profile to track your readiness score over time.\n\n` +
          `💡 **Pro Tip**: Note that mock interview simulations include strict eye/tab monitoring rules to simulate real high-stakes assessments. This is completely separate from regular general meetings.`,
        suggestedRoute: '/interview-practice',
        card: {
          type: 'navigation',
          title: 'AI Mock Interview Studio',
          actionUrl: '/interview-practice',
          actionLabel: 'Launch Interview Studio'
        },
        quickActions: [
          { label: 'AI Voice Screening Drills', query: 'How do I take the AI Voice Screening call?' },
          { label: 'Check ATS Resume Score', query: 'How do I improve my ATS score?' }
        ]
      }
    }

    // =========================================================================
    // 6. AI VOICE SCREENING
    // =========================================================================
    if (
      q.includes('voice screening') ||
      q.includes('voice call') ||
      q.includes('sarah') ||
      q.includes('phone screening')
    ) {
      return {
        text: `### How to Complete AI Voice HR Screening\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open AI Voice Screening**\n` +
          `   Go to the left sidebar and click **AI Voice Screening**.\n` +
          `2. **Step 2 — Verify Audio & Mic**\n` +
          `   Make sure your speakers/headphones and microphone are connected.\n` +
          `3. **Step 3 — Start Screening Call**\n` +
          `   Click **"Start Screening Call"** to connect with Sarah, the Gettin AI Talent Partner.\n` +
          `4. **Step 4 — Answer Conversational Questions**\n` +
          `   Sarah will ask you standard preliminary questions regarding your background, salary expectations, notice period, and core tools.\n` +
          `5. **Step 5 — Speak or Type Responses**\n` +
          `   Click the microphone button to dictate your answer in real time.\n` +
          `6. **Step 6 — Complete & Submit**\n` +
          `   When the call ends, your communication rating and eligibility summary are automatically attached to your recruiter profile.\n\n` +
          `**What happens next?**\n` +
          `Candidates with high communication scores receive an instant recommendation badge for Round 1 Technical interviews.\n\n` +
          `💡 **Pro Tip**: Speak in a quiet environment and articulate key numbers (years of experience, notice duration in days).`,
        suggestedRoute: '/voice-screening',
        card: {
          type: 'navigation',
          title: 'AI Voice HR Screening Simulator',
          actionUrl: '/voice-screening',
          actionLabel: 'Start Voice Screening'
        }
      }
    }

    // =========================================================================
    // 7. AUTO-APPLY ENGINE
    // =========================================================================
    if (
      q.includes('auto apply') ||
      q.includes('auto-apply') ||
      q.includes('automatic application')
    ) {
      return {
        text: `### How to Use the Auto Apply Engine & Alerts\n\n` +
          `The **Auto Apply Engine** continuously scans verified openings and automatically submits tailored applications when a job matches your profile criteria.\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Auto Apply Engine**\n` +
          `   Go to the left sidebar and click **Auto Apply Engine**.\n` +
          `2. **Step 2 — Set Match Threshold**\n` +
          `   Adjust your minimum ATS match threshold (e.g. *80% or 85%*).\n` +
          `3. **Step 3 — Select Preferred Roles & Locations**\n` +
          `   Specify target titles (e.g. *Lead Business Analyst*, *Product Analyst*) and locations (*Remote*, *Bengaluru*, *Hybrid*).\n` +
          `4. **Step 4 — Enable Auto-Apply**\n` +
          `   Toggle the master switch to **Active**.\n` +
          `5. **Step 5 — Monitor Dispatches**\n` +
          `   View the live audit log showing all triggered email and WhatsApp notifications.\n\n` +
          `**What happens next?**\n` +
          `Whenever an eligible job drops, the engine submits your primary resume and triggers:\n` +
          `• **HTML Email Notification**: Confirmation with recruiter 24h SLA counter.\n` +
          `• **WhatsApp Mobile Alert**: One-tap progress tracking link.\n\n` +
          `💡 **Pro Tip**: Keep your **Resume & ATS score** above 85% so the Auto Apply engine can apply to tier-1 enterprise openings immediately.`,
        suggestedRoute: '/auto-apply',
        card: {
          type: 'navigation',
          title: 'Auto-Apply Automation Engine',
          actionUrl: '/auto-apply',
          actionLabel: 'Open Auto-Apply Engine'
        }
      }
    }

    // =========================================================================
    // 8. DOCUMENTS & KYC VERIFICATION
    // =========================================================================
    if (
      q.includes('kyc') ||
      q.includes('document') ||
      q.includes('upload aadhaar') ||
      q.includes('upload pan') ||
      q.includes('otp') ||
      q.includes('verify document')
    ) {
      return {
        text: `### How to Complete KYC & Document Verification\n\n` +
          `Verifying your identity documents unlocks the **"Verified Candidate"** badge that boosts employer shortlisting priority by 3.4x.\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Documents & KYC**\n` +
          `   Go to the left sidebar and click **Documents & KYC**.\n` +
          `2. **Step 2 — Select Document Category**\n` +
          `   Choose from: **Government ID** (Aadhaar/PAN), **Degree Certificate**, **Experience Letter**, or **Salary Slips**.\n` +
          `3. **Step 3 — Upload Secure File**\n` +
          `   Upload your PDF or image file (securely stored via Cloudinary encrypted storage).\n` +
          `4. **Step 4 — Authenticate with OTP**\n` +
          `   Enter the 6-digit simulation OTP (default: \`123456\`) to authorize identity verification.\n` +
          `5. **Step 5 — View Verified Status**\n` +
          `   Once verified, a green checkmark badge (\`Verified\`) will attach to your candidate profile.\n\n` +
          `**What happens next?**\n` +
          `Interview panels and hiring managers see your verified verification status directly on your portfolio and application cards.\n\n` +
          `💡 **Pro Tip**: Ensure uploaded documents are legible and show your full legal name matching your RAS profile.`,
        suggestedRoute: '/documents',
        card: {
          type: 'navigation',
          title: 'Multi-Document KYC Hub',
          actionUrl: '/documents',
          actionLabel: 'Open KYC Documents'
        }
      }
    }

    // =========================================================================
    // 9. APPLICATION TRACKING (11 STAGES)
    // =========================================================================
    if (
      q.includes('check my applications') ||
      q.includes('application status') ||
      q.includes('my applications') ||
      q.includes('11 stages') ||
      q.includes('track application')
    ) {
      return {
        text: `### How to Track Applications Across the 11 Stages\n\n` +
          `You currently have **${apps.length} active applications** in your pipeline.\n\n` +
          `**The 11 Recruitment Stages:**\n` +
          `1. **Application Submitted**: Received by the employer.\n` +
          `2. **Resume Screening**: Under initial ATS & HR screening.\n` +
          `3. **AI Screening**: Automated background and skill qualification.\n` +
          `4. **Shortlisted**: Selected by hiring manager for interview.\n` +
          `5. **Interview Scheduled**: Date and live meeting link confirmed.\n` +
          `6. **Interview in Progress**: Live meeting / assessment active.\n` +
          `7. **Interview Completed**: Panel reviewing performance.\n` +
          `8. **Under Review**: Final hiring committee evaluation.\n` +
          `9. **Selected / Offer**: Offer letter issued 🎉.\n` +
          `10. **Rejected**: Constructive skill feedback provided.\n` +
          `11. **On Hold**: Role queued for next quarterly cohort.\n\n` +
          `**Steps to View:**\n` +
          `Open **Applications** from the sidebar → Switch between **Kanban Board** and **List View** → Click any card to view recruiter notes and the 24-hour response SLA countdown timer.`,
        suggestedRoute: '/applications',
        card: {
          type: 'navigation',
          title: '11-Stage Applications Kanban',
          actionUrl: '/applications',
          actionLabel: 'Open Applications'
        }
      }
    }

    // =========================================================================
    // 10. POSTS & COMMUNITY FEED
    // =========================================================================
    if (
      q.includes('saved post') ||
      q.includes('bookmark') ||
      q.includes('save post') ||
      q.includes('my saved')
    ) {
      const savedCount = postService.getSavedPostsCount()
      return {
        text: `### How to View & Manage Saved Posts\n\n` +
          `You currently have **${savedCount} saved ${savedCount === 1 ? 'post' : 'posts'}** bookmarked.\n\n` +
          `**Steps to View Saved Posts:**\n` +
          `1. **Step 1 — Open Posts & Feed**\n` +
          `   Go to the left sidebar and click **Posts & Feed**.\n` +
          `2. **Step 2 — Click Saved Posts Tab**\n` +
          `   Click the **"📌 Saved Posts"** category tab in the filter bar (or click **"🔖 Saved Posts"** in the top banner).\n` +
          `3. **Step 3 — Review Bookmarked Insights**\n` +
          `   Browse your bookmarked company job drops, interview STAR guides, and technical discussions.\n` +
          `4. **Step 4 — Manage via Right Sidebar Widget**\n` +
          `   Use the **"My Saved Posts"** sidebar card to jump to any post in 1-click or unbookmark.\n\n` +
          `💡 **Pro Tip**: Click the bookmark icon 🔖 on any post card across the community feeds to save it for immediate reference.`,
        suggestedRoute: '/posts?view=saved',
        card: {
          type: 'navigation',
          title: `My Saved Posts (${savedCount})`,
          actionUrl: '/posts?view=saved',
          actionLabel: 'View Saved Posts'
        }
      }
    }

    if (
      q.includes('community') ||
      q.includes('post') ||
      q.includes('feed') ||
      q.includes('add post') ||
      q.includes('how to post')
    ) {
      return {
        text: `### How to Share & Discover Community Posts\n\n` +
          `**Steps:**\n` +
          `1. **Step 1 — Open Posts & Feed**\n` +
          `   Go to the left sidebar and click **Posts & Feed**.\n` +
          `2. **Step 2 — Click Add Post**\n` +
          `   Click the **"+ Add Post"** button in the top right.\n` +
          `3. **Step 3 — Write Your Content**\n` +
          `   Share an interview experience (STAR method), a technical case study, or a hiring announcement.\n` +
          `4. **Step 4 — Attach Verified Links & Tags**\n` +
          `   Attach GitHub repository links, live portfolio links, or hashtags (\`#hiring\`, \`#powerbi\`, \`#sql\`).\n` +
          `5. **Step 5 — Publish Post**\n` +
          `   Click **"Publish Post"**.\n\n` +
          `**What happens next?**\n` +
          `Your post appears in the public feed where recruiters, hiring managers, and fellow candidates can read, like, and interact with your work.`,
        suggestedRoute: '/posts',
        card: {
          type: 'navigation',
          title: 'Community Posts & Feed',
          actionUrl: '/posts',
          actionLabel: 'Open Posts & Feed'
        }
      }
    }

    // =========================================================================
    // 11. PRIVACY & SECURITY SHIELD
    // =========================================================================
    if (
      q.includes('privacy shield') ||
      q.includes('hide email') ||
      q.includes('hide phone') ||
      q.includes('hide contact') ||
      q.includes('mask')
    ) {
      return {
        text: `### How Contact Privacy Shield Protects You\n\n` +
          `**How it works:**\n` +
          `• **Direct Phone & Email Masking**: Your personal email and phone number are displayed in masked format (e.g. \`a*****i@gmail.com\`, \`+91 98****4321\`) to employer panels.\n` +
          `• **Prevents Unsolicited Calls**: Third-party recruiters cannot scrape your personal phone number or spam you externally.\n` +
          `• **Seamless In-App Communication**: Employers can still invite you to meetings, review your full portfolio, and message you directly inside the Gettin platform.\n\n` +
          `**How to Toggle:**\n` +
          `Go to **Portfolio** → Click **"🛡️ Privacy Mask ON / OFF"** at the top → Click **"Save Changes"**.`,
        suggestedRoute: '/portfolio',
        card: {
          type: 'navigation',
          title: 'Portfolio Privacy Settings',
          actionUrl: '/portfolio',
          actionLabel: 'View Privacy Shield'
        }
      }
    }

    // =========================================================================
    // 12. DIRECT NAVIGATION HANDLERS
    // =========================================================================
    if (q.includes('take me to') || q.includes('go to') || q.includes('open') || q.includes('navigate')) {
      if (q.includes('saved')) {
        return {
          text: `Opening your **Saved Posts & Bookmarks** in the community feed.`,
          suggestedRoute: '/posts?view=saved',
          card: { type: 'navigation', title: 'Saved Posts', actionUrl: '/posts?view=saved', actionLabel: 'Go to Saved Posts' }
        }
      }
      if (q.includes('portfolio')) {
        return {
          text: `Opening your **Candidate Portfolio & Panel Showcase**. You can edit your bio, projects, and verify your GitHub link here.`,
          suggestedRoute: '/portfolio',
          card: { type: 'navigation', title: 'Public Portfolio', actionUrl: '/portfolio', actionLabel: 'Go to Portfolio' }
        }
      }
      if (q.includes('job')) {
        return {
          text: `Taking you to **Explore Jobs** with 50+ live openings, company hiring ratings, and 1-Click apply.`,
          suggestedRoute: '/jobs',
          card: { type: 'navigation', title: 'Explore Jobs', actionUrl: '/jobs', actionLabel: 'Go to Jobs' }
        }
      }
      if (q.includes('application')) {
        return {
          text: `Taking you to your **11-Stage Application Pipeline** to track active interview invites and SLA timers.`,
          suggestedRoute: '/applications',
          card: { type: 'navigation', title: 'My Applications', actionUrl: '/applications', actionLabel: 'Go to Applications' }
        }
      }
      if (q.includes('meeting') || q.includes('record')) {
        return {
          text: `Taking you to **Meetings & Records**. You can start instant meetings, review recordings, and search transcripts here.`,
          suggestedRoute: '/meetings',
          card: { type: 'navigation', title: 'Meetings & Records', actionUrl: '/meetings', actionLabel: 'Go to Meetings' }
        }
      }
      if (q.includes('auto apply') || q.includes('auto-apply')) {
        return {
          text: `Taking you to the **Auto Apply Engine** to configure automatic applications and WhatsApp alerts.`,
          suggestedRoute: '/auto-apply',
          card: { type: 'navigation', title: 'Auto Apply Engine', actionUrl: '/auto-apply', actionLabel: 'Go to Auto Apply' }
        }
      }
      if (q.includes('voice screening') || q.includes('sarah')) {
        return {
          text: `Taking you to **AI Voice HR Screening** with Sarah.`,
          suggestedRoute: '/voice-screening',
          card: { type: 'navigation', title: 'AI Voice Screening', actionUrl: '/voice-screening', actionLabel: 'Go to Voice Screening' }
        }
      }
      if (q.includes('post') || q.includes('feed')) {
        return {
          text: `Taking you to **Posts & Feed** to view community updates and industry discussions.`,
          suggestedRoute: '/posts',
          card: { type: 'navigation', title: 'Posts & Feed', actionUrl: '/posts', actionLabel: 'Go to Posts' }
        }
      }
      if (q.includes('interview studio') || q.includes('practice')) {
        return {
          text: `Opening the **Interview Studio** for mock interview simulation and practice questions.`,
          suggestedRoute: '/interview-practice',
          card: { type: 'navigation', title: 'Interview Studio', actionUrl: '/interview-practice', actionLabel: 'Go to Interview Studio' }
        }
      }
      if (q.includes('resume') || q.includes('ats')) {
        return {
          text: `Opening **Resume & ATS Scanner** for real-time diagnostics and keyword matching.`,
          suggestedRoute: '/resume',
          card: { type: 'navigation', title: 'Resume & ATS', actionUrl: '/resume', actionLabel: 'Go to Resume & ATS' }
        }
      }
      if (q.includes('document') || q.includes('kyc')) {
        return {
          text: `Opening **Documents & KYC** for Aadhaar, PAN, and credential verification.`,
          suggestedRoute: '/documents',
          card: { type: 'navigation', title: 'Documents & KYC', actionUrl: '/documents', actionLabel: 'Go to Documents' }
        }
      }
      if (q.includes('project')) {
        return {
          text: `Opening **Projects Hub** to showcase technical case studies and repositories.`,
          suggestedRoute: '/projects',
          card: { type: 'navigation', title: 'Projects Showcase', actionUrl: '/projects', actionLabel: 'Go to Projects' }
        }
      }
      if (q.includes('setting')) {
        return {
          text: `Opening **Platform Settings** for theme appearance, notifications, and profile preferences.`,
          suggestedRoute: '/settings',
          card: { type: 'navigation', title: 'Settings', actionUrl: '/settings', actionLabel: 'Go to Settings' }
        }
      }
    }

    // =========================================================================
    // 13. DEFAULT INTELLIGENT STEP-BY-STEP PLATFORM GUIDE RESPONSE
    // =========================================================================
    return {
      text: `### Hello ${candidateName}! 👋 I am your Gettin AI Career Copilot\n\n` +
        `I am your step-by-step navigation guide and career assistant built directly into the Gettin Candidates platform. Ask me **what to do**, **where to go**, or **how to use any feature** on the platform:\n\n` +
        `**Popular Guides & Workflows:**\n` +
        `• **Portfolio**: *"How do I create and publish my portfolio?"*\n` +
        `• **Resume & ATS**: *"How do I improve my ATS score?"* *(Current Score: ${ats.score}/100)*\n` +
        `• **Meetings & Records**: *"How do I start an instant meeting or record with transcripts?"*\n` +
        `• **Job Search**: *"How do I apply for jobs matching my skills?"*\n` +
        `• **Interview Studio**: *"How do I prepare for technical interviews?"*\n` +
        `• **Auto Apply**: *"How do I configure 1-click auto-apply with WhatsApp alerts?"*\n` +
        `• **KYC Documents**: *"How do I upload and verify documents with OTP?"*\n\n` +
        `Select a quick action below or type your question!`,
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
          : (res.message || 'Failed to submit application'),
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
