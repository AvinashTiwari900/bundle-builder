import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'

export class AIController {
  static async chat(req: AuthenticatedRequest, res: Response) {
    const { query } = req.body
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)
    const apps = db.applications.filter((a) => a.candidateId === userId)

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query string is required.' })
    }

    const q = query.toLowerCase().trim()

    // 1. Interview Studio: Next Question & Finish Interview Guidance
    if (/next question|advance question|finish interview|complete interview|interview studio|how.*interview/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### 🎙️ Interview Studio Question Flow & Controls\n\nDuring an active interview in **Interview Studio**:\n\n1. **Single Question Focus** — Only the active question is displayed. Future questions remain concealed until you advance.\n2. **Advance with Next Question** — After answering, click the **Next Question →** button to save your response transcript and move to the next prompt.\n3. **Finish Interview** — On the final question, the button transforms into **Finish Interview**. Clicking it concludes the session and renders your complete Performance Diagnostics breakdown.\n\n💡 Pro Tip: Speak clearly into your microphone—your live speech buffer is evaluated for structured reasoning and domain competencies.`,
        card: {
          type: 'navigation',
          title: 'Enter Interview Studio',
          actionUrl: '/interview/practice',
          actionLabel: 'Launch Studio'
        },
        quickActions: [
          { label: 'Start Interview Practice', query: 'Take me to interview studio' },
          { label: 'Explain Monitoring Rules', query: 'What is interview monitoring?' }
        ]
      })
    }

    // 2. Interview Anti-Cheating & Monitoring Rules
    if (/monitoring|anti-cheating|suspicious|strike|warning|proctoring|tab switch|look away/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### 🛡️ Interview Studio Balanced Monitoring & Integrity Rules\n\nInterview Studio uses balanced computer vision and window tracking to verify assessment integrity:\n\n• **Normal Movements Are Safe** — Brief glances, looking down to think, normal head tilting, and adjusting posture are **never penalized**.\n• **Suspicious Behavior Detection** — Sustained attention deviation (>4.0s) or extended camera occlusion (>5.0s) triggers progressive warnings.\n• **Tab Switch Monitoring** — Navigating away from the active interview window registers a window blur event.\n• **Progressive 3-Strike Ladder**:\n  1. **Warning 1 of 2** (Reminder to stay focused on screen)\n  2. **Final Warning** (Second notice)\n  3. **Interview Ended** (Session terminates only after 3 confirmed incidents)\n\n💡 Continuous distraction (e.g. looking away for 15s) is debounced as 1 single incident, not 3.`,
        card: {
          type: 'navigation',
          title: 'Review Interview Guidelines',
          actionUrl: '/interview/practice',
          actionLabel: 'View Guidelines'
        },
        quickActions: [
          { label: 'Practice Interview Room', query: 'How to move to next question' },
          { label: 'Voice Screening', query: 'Take me to voice screening' }
        ]
      })
    }

    // 3. Location & Work Mode Job Search
    if (/location|city|remote|hybrid|on-site|onsite|ahmedabad|mumbai|bengaluru|pune|delhi|work mode/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### 📍 Location & Work Mode Job Search\n\nYou can discover verified roles tailored to your exact geographical preferences:\n\n1. **Location Search** — Type any City (e.g. *Ahmedabad*, *Mumbai*, *Bengaluru*, *Pune*), State (*Gujarat*, *Maharashtra*), or Country (*India*) into the Location field.\n2. **Work Mode Filter** — Select from **🌐 Remote**, **🔄 Hybrid**, or **🏢 On-site** to narrow down job site requirements.\n3. **Combined Filtering** — Combine location and work mode with Title, Skills, and Verified Company Response SLAs for high-precision matching.`,
        card: {
          type: 'navigation',
          title: 'Explore Jobs with Location Filters',
          actionUrl: '/jobs',
          actionLabel: 'Search Jobs'
        },
        quickActions: [
          { label: 'Browse Remote Jobs', query: 'Show me remote jobs' },
          { label: 'Browse Hybrid Roles', query: 'Show hybrid jobs' },
          { label: 'Jobs in Ahmedabad', query: 'Show jobs in Ahmedabad' }
        ]
      })
    }

    // 4. Professional Networking & Connect System
    if (/connect|network|friend|colleague|request|connection|discover people|profile/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### 🤝 Professional Networking & Connect Hub\n\nBuild your professional circle across the Gettin candidate and hiring community:\n\n1. **Send Connection Request** — Click **Connect** on any user's profile card or post header to send an invitation.\n2. **Manage Requests** — Review Incoming Requests to **Accept** or **Decline**, and track pending Sent Requests in the **Connections Hub**.\n3. **Browse Connected Profiles** — View your connections' verified Experience, Education, Projects, Portfolios, and Community Posts.\n4. **Privacy Controls** — Manage profile visibility (Public, Connections Only, or Private) in Profile Settings.`,
        card: {
          type: 'navigation',
          title: 'Open Connections & Network Hub',
          actionUrl: '/connections',
          actionLabel: 'Manage Connections'
        },
        quickActions: [
          { label: 'My Connections', query: 'Show my connections' },
          { label: 'Discover People', query: 'Discover professionals to connect' },
          { label: 'Community Feed', query: 'Show community posts' }
        ]
      })
    }

    // 5. Profile Editing & Career History
    if (/edit profile|update profile|change profile|education|experience|salary|skills/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### ✏️ Candidate Profile & Career History Management\n\nKeep your candidate credentials up to date for AI matching and recruiter evaluations:\n\n1. **Basics & Headline** — Update your name, title, bio, location, and target salary expectations.\n2. **Work Experience** — Add company history, titles, work modes, and quantifiable accomplishments.\n3. **Education & Certifications** — List academic degrees, institutions, and graduation years.\n4. **Projects & Stack** — Link live projects, GitHub repos, and core technical skills.\n5. **Instant Persistence** — Click **Save Profile** to sync directly with your cloud database record.`,
        card: {
          type: 'navigation',
          title: 'Edit Career Profile',
          actionUrl: '/profile',
          actionLabel: 'Open Profile Editor'
        },
        quickActions: [
          { label: 'Edit Profile Now', query: 'Take me to profile' },
          { label: 'Privacy Settings', query: 'How to manage privacy settings' }
        ]
      })
    }

    // 6. Saved Posts Navigation & Query
    if (/saved|bookmark/i.test(q)) {
      const savedCount = db.posts.filter((p) => p.savedByUserIds.includes(userId)).length
      return res.status(200).json({
        success: true,
        text: `### 📌 Saved Posts & Bookmarks\n\nYou currently have **${savedCount} saved post${savedCount === 1 ? '' : 's'}** in your collection.\n\n• You can review bookmarked architecture teardowns and hiring updates anytime\n• Use the quick action below to jump directly to your saved feed.`,
        card: {
          type: 'navigation',
          title: `Saved Posts (${savedCount})`,
          actionUrl: '/posts?view=saved',
          actionLabel: 'View Saved Posts'
        },
        quickActions: [
          { label: 'Explore Community Feed', query: 'Show me community posts' },
          { label: 'Saved Posts Hub', query: 'Show my saved posts' }
        ]
      })
    }

    // 7. Candidate Portfolio Workflow
    if (/portfolio|project|showcase/i.test(q)) {
      return res.status(200).json({
        success: true,
        text: `### 🌟 Candidate Portfolio & Project Showcase\n\nYour portfolio is the primary showcase hiring managers review before scheduling interviews.\n\n1. **Step 1 — Project Case Studies** (Add real-world metrics & live links)\n2. **Step 2 — Technical Stack Badges** (Highlight SQL, Snowflake, Python)\n3. **Step 3 — Privacy Shield Check** (Toggle contact masking)\n\n💡 Pro Tip: Candidates with at least 2 linked case studies receive 3.4x more recruiter interview requests!`,
        card: {
          type: 'navigation',
          title: 'Candidate Portfolio & Showcase',
          actionUrl: '/portfolio',
          actionLabel: 'Open Portfolio'
        },
        quickActions: [
          { label: 'Add Project to Portfolio', query: 'Take me to my portfolio' },
          { label: 'Toggle Privacy Shield', query: 'How does privacy shield work?' }
        ]
      })
    }

    // 8. Application Pipeline Status
    if (/application|status|pipeline|track/i.test(q)) {
      const scheduled = apps.filter((a) => a.currentStage.toLowerCase().includes('interview'))
      return res.status(200).json({
        success: true,
        text: `### 📊 Live Application Pipeline\n\nYou have **${apps.length} active application${apps.length === 1 ? '' : 's'}** currently in progress.\n\n• **${scheduled.length} interview${scheduled.length === 1 ? '' : 's'}** scheduled with verified partners\n• 24-Hour Recruiter Response SLA is active across all applications.`,
        card: {
          type: 'navigation',
          title: 'Track 11-Stage Applications',
          actionUrl: '/applications',
          actionLabel: 'View Applications'
        },
        quickActions: [
          { label: 'Track Applications', query: 'Show my applications' },
          { label: 'Browse New Jobs', query: 'Show recommended jobs' }
        ]
      })
    }

    // Default Fallback
    return res.status(200).json({
      success: true,
      text: `### ⚡ Gettin AI Career Copilot\n\nI can assist you across the entire Gettin platform:\n\n• **Interview Studio**: Next Question guidance & anti-cheating monitoring rules\n• **Job Search**: Location-based search (Ahmedabad, Mumbai, Bengaluru) & Remote/Hybrid/On-site filters\n• **Professional Network**: Send connect requests, view connected profiles & portfolios\n• **Profile & Privacy**: Edit career history, experience, and manage visibility settings\n• **Applications & KYC**: 11-stage tracking and automated Digilocker verification`,
      quickActions: [
        { label: 'Interview Studio Guide', query: 'How to move to next question' },
        { label: 'Search Remote Jobs', query: 'Show remote jobs' },
        { label: 'My Connections', query: 'How to connect with people' },
        { label: 'Edit Profile', query: 'How to edit my profile' }
      ]
    })
  }

  static async atsDiagnostics(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)

    return res.status(200).json({
      success: true,
      atsScore: profile?.atsScore || 92,
      matchedKeywords: ['SQL', 'Business Analysis', 'ETL Pipelines', 'Power BI', 'Snowflake', 'Python'],
      missingKeywords: ['dbt Core', 'Kafka Streaming', 'AWS Redshift'],
      recommendations: [
        'Add quantifiable GMV and latency reduction metrics to your payment reconciliation case study.',
        'Ensure contact privacy shield is enabled for public sharing.'
      ]
    })
  }
}
