export interface PostComment {
  id: string
  authorName: string
  authorAvatar?: string
  authorRole: string
  content: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  description: string
  authorName: string
  authorRole: string
  authorType: 'company' | 'candidate'
  authorAvatar?: string
  companyName?: string
  companyBadge?: string
  companyRating?: number
  links?: { title: string; url: string; iconType?: 'github' | 'live' | 'portfolio' | 'article' | 'job' }[]
  tags: string[]
  imageUrl?: string
  videoUrl?: string
  likes: number
  hasLiked?: boolean
  isBookmarked?: boolean
  comments: PostComment[]
  createdAt: string
  category: 'Company Hiring' | 'Candidate Showcase' | 'Interview Experience' | 'Career Tips' | 'Tech Insight'
  featured?: boolean
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: '🚀 Northstar Analytics is Hiring: 15+ Lead & Senior Business Analysts (Immediate Joiners)',
    description: `We are scaling our core enterprise analytics engineering practice across Bengaluru & Hyderabad! 🌟

We are looking for data-driven Business Analysts with 3-7 years of experience who excel at:
• Advanced SQL data modeling and ETL pipeline validation
• Building high-frequency executive BI dashboards (Power BI / Tableau)
• Partnering with product management on revenue forecasting & funnel conversion optimization

✨ **Why Northstar?**
- 99% Candidate Response Rate with 24h recruiter feedback SLA
- 100% RAS verified hiring partner with 4.9 ★ Rating
- Comprehensive wellness perks, hybrid 2-day office setup, and annual certification stipends.

Feel free to check out our open jobs or connect directly through the RAS Candidate Portal!`,
    authorName: 'Northstar Talent Acquisition',
    authorRole: 'Official Hiring Team',
    authorType: 'company',
    companyName: 'Northstar Analytics',
    companyBadge: '4.9 ★ Fast Responder',
    companyRating: 4.9,
    authorAvatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    links: [
      { title: 'Apply to Senior BA Role (RAS 1-Click)', url: '/jobs/job-1', iconType: 'job' },
      { title: 'Northstar Engineering Tech Blog', url: 'https://northstar-analytics.dev/careers', iconType: 'article' }
    ],
    tags: ['#hiring', '#businessanalyst', '#powerbi', '#sql', '#bengaluru', '#hyderabad'],
    likes: 142,
    hasLiked: false,
    isBookmarked: true,
    category: 'Company Hiring',
    featured: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-1',
        authorName: 'Avinash Tiwari',
        authorRole: 'Lead Business Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        content: 'Just submitted my application through RAS Auto-Apply! Excited about the analytics engineering scale here.',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      },
      {
        id: 'c-2',
        authorName: 'Priya Sharma',
        authorRole: 'Senior Data Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        content: 'Is this role open for candidates serving a 30-day notice period as well?',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'post-2',
    title: '💡 My Experience Clearing the AI Technical Round on RAS for Senior BA (94% Score Breakdown)',
    description: `Hey everyone! I recently attended the Technical Interview round conducted by the RAS AI Recruitment Agent for a Lead Business Analyst position and wanted to share my takeaways:

📌 **What the AI Interviewer focused on:**
1. **SQL Aggregation nuances**: The difference between \`WHERE\` and \`HAVING\`, plus when to use window functions (\`ROW_NUMBER()\` vs \`DENSE_RANK()\`) preserving row-level granularity.
2. **Data Pipeline Anomalies**: How to implement quarantine logic and threshold alerts for corrupted staging ETL records.
3. **STAR Method for Stakeholder Deadlock**: Clearly defining Situation, Task, Action, and quantified Result (e.g. 75% latency reduction).

⚡ **Top Tip:** Practice in the *AI Mock Interview Studio* on the platform before the real meeting! The live facial gaze tracking & proctoring check builds great confidence.

Check out my full case study and public portfolio below!`,
    authorName: 'Avinash Tiwari',
    authorRole: 'Lead Business Analyst & Product Strategist',
    authorType: 'candidate',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    links: [
      { title: 'View My Public Portfolio', url: '/portfolio', iconType: 'portfolio' },
      { title: 'Revenue Analytics Project GitHub', url: 'https://github.com/AvinashTiwari900/revenue-analytics', iconType: 'github' }
    ],
    tags: ['#interview-experience', '#businessanalyst', '#sql', '#ai-interview', '#career-tips'],
    likes: 98,
    hasLiked: true,
    isBookmarked: false,
    category: 'Interview Experience',
    featured: false,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-3',
        authorName: 'Rohan Mehta',
        authorRole: 'Product Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        content: 'Super helpful breakdown Avinash! The tip on window functions is spot on.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'post-3',
    title: '📊 Project Showcase: Enterprise Revenue Analytics & Automated Forecasting Engine',
    description: `Excited to showcase my latest end-to-end data analytics project built with **Power BI, SQL, Python, and Snowflake**! 🎯

🚀 **Key Problem Solved:**
Executive reporting for our 12 product lines required manual spreadsheet reconciliation across 4 separate databases, causing a 4-day reporting lag at the end of every quarter.

🛠️ **Technical Architecture:**
• Automated SQL pipelines extracting and standardizing 2.5M+ daily transactions
• Dimensional star-schema data modeling in Snowflake
• Dynamic Power BI dashboards with automated parameter forecasting and scenario modeling

📈 **Measurable Business Impact:**
- Reduced report turnaround from 4 days to **2 hours (75% time savings)**
- Prevented ~₹18 Lakhs in inventory over-allocation during quarterly forecasting cycles.

Live demo & repository links attached below! Feedback is warmly welcomed.`,
    authorName: 'Avinash Tiwari',
    authorRole: 'Lead Business Analyst',
    authorType: 'candidate',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    links: [
      { title: 'Interactive BI Web Embed', url: 'https://avinash-tiwari.dev/demo-bi', iconType: 'live' },
      { title: 'Project Repository (SQL & Python Scripts)', url: 'https://github.com/AvinashTiwari900/revenue-analytics-engine', iconType: 'github' }
    ],
    tags: ['#portfolio-showcase', '#projects', '#powerbi', '#snowflake', '#sql', '#python'],
    likes: 187,
    hasLiked: false,
    isBookmarked: true,
    category: 'Candidate Showcase',
    featured: false,
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-4',
        authorName: 'DataVista Systems',
        authorRole: 'Analytics Hiring Panel',
        authorAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&q=80',
        content: 'Impressive star-schema architecture. We are reviewing candidate portfolios for our Q3 Senior Analytics batch and this caught our attention!',
        createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'post-4',
    title: '🏢 Astra Digital: Announcing New AI & Cloud Analytics Engineering Hub in Pune',
    description: `Astra Digital is officially expanding our high-impact AI & Product Analytics hub in Pune! 🏙️

We are actively hiring for 20+ roles across:
- Senior / Lead Business Analysts
- Full Stack Python & React Engineers
- Cloud Data Warehousing Specialists (Snowflake / BigQuery)

⚡ **Highlights of our hiring cycle:**
- 4.8 ★ Employer Rating on RAS
- Fast-track 2-week turnaround from application to final offer
- Zero unsolicited calls policy: candidate contact privacy respected with in-platform communication.

Explore all open positions directly on the RAS Jobs Explorer tab!`,
    authorName: 'Astra Digital Careers',
    authorRole: 'Talent Acquisition Team',
    authorType: 'company',
    companyName: 'Astra Digital',
    companyBadge: '4.8 ★ Fast Responder',
    companyRating: 4.8,
    authorAvatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    links: [
      { title: 'Explore Astra Digital Jobs', url: '/jobs?q=Astra', iconType: 'job' },
      { title: 'Astra Engineering Culture', url: 'https://astradigital.io/culture', iconType: 'article' }
    ],
    tags: ['#hiring', '#pune', '#dataanalytics', '#cloud', '#softwareengineering'],
    likes: 115,
    hasLiked: false,
    isBookmarked: false,
    category: 'Company Hiring',
    featured: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    comments: []
  },
  {
    id: 'post-5',
    title: '🎯 5 Common Resume & ATS Mistakes Candidates Make (And How to Fix Them in 10 Minutes)',
    description: `Having reviewed thousands of candidate resumes and ATS scoring algorithms, here are the top 5 mistakes that silently get applications filtered out:

1. **Vague Bullet Points without Quantified Impact**: Instead of writing "Created sales reports", write *"Built automated Power BI sales dashboards cutting reporting lag by 75% for 12 business units."*
2. **Missing Exact Keyword Variations**: Many parsers look for both "SQL" and "Relational Databases", or "Business Analysis" and "BRD/FRD authoring".
3. **Unstructured Project Sections**: Always provide Project Name, Your Exact Role, Technologies, and Tangible Outcomes.
4. **Outdated Contact/Location Settings**: Keep your preferred locations (e.g. Remote, Bengaluru, Hyderabad) and notice period accurate.
5. **Not comparing against Target Job Descriptions**: Use the **JD Match Comparator** on RAS to spot missing keywords before 1-Click Applying!

Save this post for your next job application sprint! 📌`,
    authorName: 'RAS Career Coach AI',
    authorRole: 'AI Career Intelligence',
    authorType: 'company',
    companyName: 'Recruitment Automation Software (RAS)',
    companyBadge: 'AI Verified Guide',
    authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    links: [
      { title: 'Run Instant ATS Resume Scan', url: '/resume', iconType: 'article' },
      { title: 'Compare Resume against JD', url: '/jobs', iconType: 'job' }
    ],
    tags: ['#career-tips', '#resume-ats', '#job-search', '#recruitment', '#skills'],
    likes: 312,
    hasLiked: true,
    isBookmarked: true,
    category: 'Career Tips',
    featured: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    comments: []
  }
]

export const postService = {
  getPosts(): Post[] {
    const raw = localStorage.getItem('rap_community_posts')
    if (!raw) {
      localStorage.setItem('rap_community_posts', JSON.stringify(INITIAL_POSTS))
      return INITIAL_POSTS
    }
    try {
      const parsed = JSON.parse(raw)
      return parsed.length ? parsed : INITIAL_POSTS
    } catch {
      return INITIAL_POSTS
    }
  },

  savePosts(posts: Post[]) {
    localStorage.setItem('rap_community_posts', JSON.stringify(posts))
  },

  createPost(input: {
    title: string
    description: string
    authorName: string
    authorRole: string
    authorType: 'company' | 'candidate'
    companyName?: string
    companyBadge?: string
    authorAvatar?: string
    links?: { title: string; url: string; iconType?: 'github' | 'live' | 'portfolio' | 'article' | 'job' }[]
    tags: string[]
    imageUrl?: string
    category: 'Company Hiring' | 'Candidate Showcase' | 'Interview Experience' | 'Career Tips' | 'Tech Insight'
  }): Post {
    const posts = this.getPosts()
    const newPost: Post = {
      id: 'post-' + Date.now(),
      title: input.title.trim(),
      description: input.description.trim(),
      authorName: input.authorName.trim(),
      authorRole: input.authorRole.trim(),
      authorType: input.authorType,
      companyName: input.companyName,
      companyBadge: input.companyBadge,
      authorAvatar:
        input.authorAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      links: input.links || [],
      tags: input.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)),
      imageUrl: input.imageUrl,
      likes: 0,
      hasLiked: false,
      isBookmarked: false,
      comments: [],
      category: input.category,
      createdAt: new Date().toISOString()
    }

    const updated = [newPost, ...posts]
    this.savePosts(updated)
    return newPost
  },

  toggleLike(postId: string): { likes: number; hasLiked: boolean } {
    const posts = this.getPosts()
    let result = { likes: 0, hasLiked: false }
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked
        const nextLikes = nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        result = { likes: nextLikes, hasLiked: nextLiked }
        return { ...p, likes: nextLikes, hasLiked: nextLiked }
      }
      return p
    })
    this.savePosts(updated)
    return result
  },

  toggleBookmark(postId: string): boolean {
    const posts = this.getPosts()
    let isBookmarked = false
    const updated = posts.map((p) => {
      if (p.id === postId) {
        isBookmarked = !p.isBookmarked
        return { ...p, isBookmarked }
      }
      return p
    })
    this.savePosts(updated)
    return isBookmarked
  },

  addComment(postId: string, comment: { authorName: string; authorRole: string; authorAvatar?: string; content: string }): PostComment {
    const posts = this.getPosts()
    const newComment: PostComment = {
      id: 'c-' + Date.now(),
      authorName: comment.authorName,
      authorRole: comment.authorRole,
      authorAvatar:
        comment.authorAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: comment.content.trim(),
      createdAt: new Date().toISOString()
    }

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] }
      }
      return p
    })
    this.savePosts(updated)
    return newComment
  },

  deletePost(postId: string) {
    const posts = this.getPosts()
    const updated = posts.filter((p) => p.id !== postId)
    this.savePosts(updated)
  },

  getSavedPosts(): Post[] {
    return this.getPosts().filter((p) => p.isBookmarked)
  },

  getSavedPostsCount(): number {
    return this.getPosts().filter((p) => p.isBookmarked).length
  }
}
