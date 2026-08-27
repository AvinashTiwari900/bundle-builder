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

    // 1. Saved Posts Navigation & Query
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

    // 2. Candidate Portfolio Workflow
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

    // 3. Application Pipeline Status
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
      text: `### ⚡ Gettin AI Career Copilot\n\nI can assist you across the entire Gettin platform:\n\n• **Job Discovery & 1-Click Apply**\n• **11-Stage Pipeline Tracking**\n• **Portfolio & Case Study Builder**\n• **Live Interview & Voice Screening Preparation**\n• **Saved Posts & Bookmarks**`,
      quickActions: [
        { label: 'View Portfolio', query: 'Take me to my portfolio' },
        { label: 'Saved Posts', query: 'Show my saved posts' },
        { label: 'Track Applications', query: 'Show my applications' }
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
