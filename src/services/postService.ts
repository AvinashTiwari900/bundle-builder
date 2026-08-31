import { API_BASE_URL } from '../config/api.config'
import { profileService } from './profileService'
import { connectionService } from './connectionService'
import { notificationService } from './notificationService'

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
  label: string
  url: string
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
  postType: PostType
  title: string
  description: string
  hashtags: string[]
  links: PostLink[]
  media: PostMediaItem[]
  visibility: PostVisibility
  likes: number
  likedByUserIds: string[]
  hasLiked?: boolean
  isBookmarked?: boolean
  savedByUserIds: string[]
  comments: PostComment[]
  viewsCount?: number
  createdAt: string
  updatedAt?: string
}

const STORAGE_KEY = 'rap_candidate_community_posts_v3'

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-101',
    authorId: 'candidate-1',
    authorName: 'Avinash Tiwari',
    authorRole: 'Lead Business Analyst & Analytics Engineer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    postType: 'Case Study',
    title: '📊 Case Study: Slashing End-of-Day Payment Reconciliation from 4 Hours to 6 Minutes (₹800 Cr Monthly GMV)',
    description: `### 🎯 Problem Statement
In high-throughput FinTech ecosystems, payment gateway settlement batch files arrive asynchronously with up to 14% discrepancy noise due to intermittent network retries and webhook timeouts. Our finance operations team spent 4+ hours daily performing manual VLOOKUP reconciliations.

### 🛠️ Architecture & Solution
1. **Idempotency Key Verification**: Implemented distributed Redis key caching before ingesting settlement event payloads.
2. **Delta Telemetry on Snowflake**: Built dimensional star-schema staging models using dbt to compute real-time variance calculations.
3. **Automated Quarantines**: Designed automated discrepancy triage pipelines flagging orphaned refunds without human intervention.

### 📈 Quantified Impact
- **End-of-day reconciliation latency**: Reduced from **4 hours to under 6 minutes** (97.5% acceleration).
- **Zero Reconciliation Leakage**: Prevented an estimated ₹18 Lakhs in duplicate refund issuances across two fiscal quarters.`,
    hashtags: ['#casestudy', '#sql', '#snowflake', '#businessanalysis', '#fintech', '#dbt'],
    links: [
      { label: 'GitHub Architecture Code', url: 'https://github.com/AvinashTiwari900/payment-recon-engine' },
      { label: 'Live Project Demo & Diagram', url: 'https://avinash-tiwari.dev/projects/payment-recon' }
    ],
    media: [
      {
        id: 'med-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        name: 'Reconciliation_Pipeline_Architecture.png'
      }
    ],
    visibility: 'public',
    likes: 48,
    likedByUserIds: ['candidate-1', 'usr-network-01', 'usr-network-02'],
    hasLiked: true,
    isBookmarked: true,
    savedByUserIds: ['candidate-1'],
    viewsCount: 312,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-101',
        authorId: 'usr-network-01',
        authorName: 'Priya Sharma',
        authorRole: 'Senior Product Manager @ Razorpay',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        content: 'Phenomenal architecture breakdown Avinash! The automated quarantine step is critical for scale.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 'c-102',
        authorId: 'candidate-1',
        authorName: 'Avinash Tiwari',
        authorRole: 'Lead Business Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        content: 'Thanks Priya! Separating transient webhook lag from permanent ledger mismatch was the key insight.',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'post-102',
    authorId: 'usr-network-01',
    authorName: 'Priya Sharma',
    authorRole: 'Senior Product Manager @ Razorpay',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    postType: 'Technical / Knowledge Sharing',
    title: '🧠 5 Principles for Designing Scalable Executive Telemetry & North Star Metrics',
    description: `When building executive analytics suites, many teams fall into the trap of dashboard overload—shipping 40+ charts that nobody checks.

Here are the 5 principles I follow when establishing product metrics:
1. **Single North Star Metric**: Tied directly to customer value exchange (e.g. Weekly Active Transacting Merchants).
2. **Input vs Output Metrics**: You can't directly manipulate output metrics; align engineering squads against leading inputs.
3. **Threshold Alerts over Static Reports**: Push proactive anomaly notifications rather than expecting stakeholders to dig through BI tabs.
4. **Data Dictionary Transparency**: Every column must have an unambiguous business definition approved across departments.
5. **Speed & SLA Compliance**: A slow dashboard is an unused dashboard.`,
    hashtags: ['#productmanagement', '#analytics', '#kpis', '#metrics', '#leadership'],
    links: [
      { label: 'Product Metrics Framework Guide', url: 'https://priyasharma.pm/frameworks' }
    ],
    media: [
      {
        id: 'med-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        name: 'Executive_Telemetry_Framework.png'
      }
    ],
    visibility: 'public',
    likes: 84,
    likedByUserIds: ['candidate-1', 'usr-network-02'],
    hasLiked: false,
    isBookmarked: false,
    savedByUserIds: [],
    viewsCount: 520,
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    comments: []
  },
  {
    id: 'post-103',
    authorId: 'usr-network-02',
    authorName: 'Rahul Verma',
    authorRole: 'Staff Full Stack Architect @ Swiggy',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    postType: 'Project Showcase',
    title: '⚡ Open-Source Release: High-Throughput Event Streaming Gateway on Go & Kafka',
    description: `Excited to open-source **EventPulse**, a lightweight WebSocket-to-Kafka ingestion gateway capable of handling 50,000+ persistent connections with sub-5ms serialization latency.

**Key Technical Features:**
- Zero memory allocation JSON decoder with SIMD acceleration.
- Built-in rate limiting with token-bucket algorithms.
- Native Prometheus metrics exporter and OpenTelemetry tracing spans.

Feel free to star the repository and test the benchmark suite!`,
    hashtags: ['#golang', '#kafka', '#opensource', '#microservices', '#systemdesign'],
    links: [
      { label: 'GitHub Repository (Star on GitHub)', url: 'https://github.com/example/eventpulse' },
      { label: 'Benchmark Report & Documentation', url: 'https://eventpulse.dev' }
    ],
    media: [
      {
        id: 'med-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        name: 'EventPulse_Benchmark.png'
      }
    ],
    visibility: 'public',
    likes: 128,
    likedByUserIds: ['candidate-1'],
    hasLiked: true,
    isBookmarked: true,
    savedByUserIds: ['candidate-1'],
    viewsCount: 890,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c-103',
        authorId: 'candidate-1',
        authorName: 'Avinash Tiwari',
        authorRole: 'Lead Business Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        content: 'This is brilliant Rahul! Could this be plugged directly into an audit stream for financial delta events?',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'post-104',
    authorId: 'candidate-1',
    authorName: 'Avinash Tiwari',
    authorRole: 'Lead Business Analyst & Analytics Engineer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    postType: 'Achievement',
    title: '🏆 Cleared Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
    description: `Thrilled to share that I have officially passed the **PL-300 Certification Exam** with a score of 920/1000! 

The assessment tested deep competencies in:
- Advanced DAX calculations (Time Intelligence, Iterators, Context Transition)
- Row-Level Security (RLS) configuration across enterprise workspaces
- Semantic data model optimization and query plan inspection

Looking forward to applying these skills across larger enterprise datasets!`,
    hashtags: ['#certification', '#powerbi', '#pl300', '#dataanalytics', '#continuouslearning'],
    links: [
      { label: 'Microsoft Verified Credential Badge', url: 'https://learn.microsoft.com/credentials' }
    ],
    media: [
      {
        id: 'med-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80',
        name: 'PL300_Certificate.png'
      }
    ],
    visibility: 'public',
    likes: 62,
    likedByUserIds: ['candidate-1'],
    hasLiked: true,
    isBookmarked: false,
    savedByUserIds: [],
    viewsCount: 410,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    comments: []
  },
  {
    id: 'post-105',
    authorId: 'usr-network-03',
    authorName: 'Ananya Iyer',
    authorRole: 'Lead ML Engineer @ CRED',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    postType: 'Case Study',
    title: '🔍 Real-Time Credit Fraud Anomaly Detection on Streaming GNNs',
    description: `Graph Neural Networks (GNNs) provide significant recall improvements when identifying synthetic identity fraud rings. In this technical walkthrough, we break down our sub-40ms inference pipeline processing 10k transactions/sec.`,
    hashtags: ['#machinelearning', '#graphneuralnetworks', '#fintech', '#fraudprevention'],
    links: [
      { label: 'Technical Whitepaper', url: 'https://cred.club/tech/gnn-fraud' }
    ],
    media: [
      {
        id: 'med-5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
        name: 'GNN_Graph_Topology.png'
      }
    ],
    visibility: 'connections',
    likes: 95,
    likedByUserIds: [],
    hasLiked: false,
    isBookmarked: false,
    savedByUserIds: [],
    viewsCount: 680,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    comments: []
  }
]

export const postService = {
  /**
   * Fetch all posts from LocalStorage with fallback & backend sync
   */
  getPosts(): Post[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
      this.savePosts(INITIAL_POSTS)
      return INITIAL_POSTS
    } catch {
      return INITIAL_POSTS
    }
  },

  /**
   * Persist posts
   */
  savePosts(posts: Post[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
    } catch (e) {
      console.warn('Failed to save posts:', e)
    }
  },

  /**
   * Get filtered visible posts for current user respecting connection & privacy rules
   */
  getVisiblePosts(currentUserId: string = 'candidate-1'): Post[] {
    const all = this.getPosts()
    return all.filter((post) => {
      // 1. Author can always see own posts
      if (post.authorId === currentUserId) return true
      // 2. Private posts are hidden from others
      if (post.visibility === 'private') return false
      // 3. Connections only: check if user is connected
      if (post.visibility === 'connections') {
        return connectionService.isConnected(post.authorId)
      }
      // 4. Public posts are visible
      return true
    })
  },

  /**
   * Create new candidate post / case study / portfolio piece
   */
  createPost(newPostData: {
    title: string
    description: string
    postType: PostType
    hashtags?: string[]
    links?: PostLink[]
    media?: PostMediaItem[]
    visibility?: PostVisibility
  }): Post {
    const profile = profileService.get() || {}
    const currentUserId = profile.id || 'candidate-1'
    const posts = this.getPosts()

    const cleanLinks: PostLink[] = (newPostData.links || [])
      .filter((l) => l && l.label && l.url)
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))

    const cleanHashtags: string[] = (newPostData.hashtags || [])
      .map((t) => (t.startsWith('#') ? t.toLowerCase() : `#${t.toLowerCase()}`))

    const post: Post = {
      id: 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      authorId: currentUserId,
      authorName: profile.name || 'Avinash Tiwari',
      authorRole: profile.headline || 'Lead Business Analyst',
      authorAvatar: profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      postType: newPostData.postType || 'Normal Post',
      title: newPostData.title.trim(),
      description: newPostData.description.trim(),
      hashtags: cleanHashtags,
      links: cleanLinks,
      media: newPostData.media || [],
      visibility: newPostData.visibility || 'public',
      likes: 0,
      likedByUserIds: [],
      hasLiked: false,
      isBookmarked: false,
      savedByUserIds: [],
      comments: [],
      viewsCount: 1,
      createdAt: new Date().toISOString()
    }

    posts.unshift(post)
    this.savePosts(posts)

    // Notify user
    notificationService.create({
      title: '🌟 Post Published to Community Feed',
      message: `Your ${post.postType} "${post.title.slice(0, 40)}..." is now live on your portfolio & feed.`,
      type: 'system'
    })

    // Async backend synchronization
    try {
      fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      }).catch(() => {})
    } catch {}

    return post
  },

  /**
   * Update existing post (author only)
   */
  updatePost(postId: string, updatedData: Partial<Post>): Post | null {
    const posts = this.getPosts()
    const index = posts.findIndex((p) => p.id === postId)
    if (index === -1) return null

    const existing = posts[index]
    const updatedPost: Post = {
      ...existing,
      ...updatedData,
      updatedAt: new Date().toISOString()
    }

    posts[index] = updatedPost
    this.savePosts(posts)

    // Async backend update
    try {
      fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => {})
    } catch {}

    return updatedPost
  },

  /**
   * Delete post (author only)
   */
  deletePost(postId: string): boolean {
    const posts = this.getPosts()
    const filtered = posts.filter((p) => p.id !== postId)
    if (filtered.length === posts.length) return false

    this.savePosts(filtered)

    // Async backend delete
    try {
      fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE'
      }).catch(() => {})
    } catch {}

    return true
  },

  /**
   * Toggle like state
   */
  toggleLike(postId: string, currentUserId: string = 'candidate-1'): { isLiked: boolean; likesCount: number } {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (!post) return { isLiked: false, likesCount: 0 }

    post.likedByUserIds = post.likedByUserIds || []
    const hasLiked = post.likedByUserIds.includes(currentUserId)

    if (hasLiked) {
      post.likedByUserIds = post.likedByUserIds.filter((uid) => uid !== currentUserId)
      post.likes = Math.max(0, post.likes - 1)
      post.hasLiked = false
    } else {
      post.likedByUserIds.push(currentUserId)
      post.likes += 1
      post.hasLiked = true

      // Notify post author if not self
      if (post.authorId !== currentUserId) {
        notificationService.create({
          title: '❤️ New Like on your Post',
          message: `Someone liked your ${post.postType}: "${post.title.slice(0, 35)}..."`,
          type: 'social'
        })
      }
    }

    this.savePosts(posts)

    try {
      fetch(`${API_BASE_URL}/posts/${postId}/like`, { method: 'POST' }).catch(() => {})
    } catch {}

    return { isLiked: !hasLiked, likesCount: post.likes }
  },

  /**
   * Toggle bookmark
   */
  toggleBookmark(postId: string, currentUserId: string = 'candidate-1'): boolean {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (!post) return false

    post.savedByUserIds = post.savedByUserIds || []
    const isSaved = post.savedByUserIds.includes(currentUserId)

    if (isSaved) {
      post.savedByUserIds = post.savedByUserIds.filter((uid) => uid !== currentUserId)
      post.isBookmarked = false
    } else {
      post.savedByUserIds.push(currentUserId)
      post.isBookmarked = true
    }

    this.savePosts(posts)

    try {
      fetch(`${API_BASE_URL}/posts/${postId}/bookmark`, { method: 'POST' }).catch(() => {})
    } catch {}

    return !isSaved
  },

  /**
   * Add comment to post
   */
  addComment(postId: string, content: string): PostComment | null {
    if (!content.trim()) return null
    const profile = profileService.get() || {}
    const currentUserId = profile.id || 'candidate-1'
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (!post) return null

    const comment: PostComment = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      authorId: currentUserId,
      authorName: profile.name || 'Avinash Tiwari',
      authorRole: profile.headline || 'Lead Business Analyst',
      authorAvatar: profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      content: content.trim(),
      createdAt: new Date().toISOString()
    }

    post.comments = post.comments || []
    post.comments.push(comment)
    this.savePosts(posts)

    // Notify author if not self
    if (post.authorId !== currentUserId) {
      notificationService.create({
        title: '💬 New Comment on your Post',
        message: `${comment.authorName} commented: "${content.slice(0, 40)}..."`,
        type: 'social'
      })
    }

    try {
      fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      }).catch(() => {})
    } catch {}

    return comment
  },

  /**
   * Delete comment
   */
  deleteComment(postId: string, commentId: string): boolean {
    const posts = this.getPosts()
    const post = posts.find((p) => p.id === postId)
    if (!post || !post.comments) return false

    const filtered = post.comments.filter((c) => c.id !== commentId)
    if (filtered.length === post.comments.length) return false

    post.comments = filtered
    this.savePosts(posts)

    try {
      fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
      }).catch(() => {})
    } catch {}

    return true
  },

  /**
   * Get saved posts for user
   */
  getSavedPosts(currentUserId: string = 'candidate-1'): Post[] {
    const all = this.getPosts()
    return all.filter((p) => (p.savedByUserIds && p.savedByUserIds.includes(currentUserId)) || p.isBookmarked)
  },

  /**
   * Get count of saved posts
   */
  getSavedPostsCount(currentUserId: string = 'candidate-1'): number {
    return this.getSavedPosts(currentUserId).length
  }
}
