import { API_BASE_URL } from '../config/api.config'

export interface ConnectionUser {
  userId: string
  name: string
  headline: string
  location: string
  profilePhoto?: string
  skills?: string[]
  tools?: string[]
  languages?: string[]
  totalExperienceYears?: number
  currentRole?: string
  bio?: string
  email?: string
  phone?: string
  education?: any[]
  experience?: any[]
  projects?: any[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'self'
  connectionId?: string
  requestId?: string
  connectedSince?: string
  postsCount?: number
  posts?: any[]
}

const LOCAL_STORAGE_KEY_CONNS = 'rap_user_connections'
const LOCAL_STORAGE_KEY_REQUESTS = 'rap_user_requests'

const SEED_DISCOVERY_PROFILES: ConnectionUser[] = [
  {
    userId: 'usr-network-01',
    name: 'Priya Sharma',
    headline: 'Senior Product Manager — Payments & Merchant Scale',
    bio: 'Product leader passionate about fintech rails, developer experience, and 10x scale. Scaled payment onboarding at Razorpay.',
    location: 'Bengaluru, India',
    currentRole: 'Senior Product Manager @ Razorpay',
    totalExperienceYears: 7,
    skills: ['Product Strategy', 'Fintech', 'A/B Testing', 'Payment Rails', 'API Design', 'Roadmapping'],
    tools: ['Jira', 'Mixpanel', 'Figma', 'Postman'],
    languages: ['English', 'Hindi'],
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    education: [
      {
        id: 'edu-p1',
        institution: 'Indian Institute of Management (IIM), Bangalore',
        degree: 'MBA',
        fieldOfStudy: 'Product Management & Strategic Leadership',
        startYear: 2017,
        endYear: 2019
      }
    ],
    experience: [
      {
        id: 'exp-p1',
        company: 'Razorpay',
        position: 'Senior Product Manager',
        location: 'Bengaluru, India',
        workType: 'Hybrid',
        startDate: '2021-02-01',
        isCurrent: true,
        description: 'Owned the instant settlements product suite processing over $4B in annualized transaction volume.',
        skillsUsed: ['Fintech', 'Product Strategy', 'API Design']
      }
    ],
    projects: [
      {
        id: 'proj-p1',
        title: 'Sub-Second Merchant Checkout Engine',
        description: 'Redesigned the headless checkout flow resulting in +8.4% conversion uplift across 50,000+ online merchants.',
        technologies: ['React', 'Node.js', 'Redis', 'Kafka'],
        liveUrl: 'https://priyasharma.pm/checkout-case-study'
      }
    ],
    githubUrl: 'https://github.com/priyasharma-pm',
    linkedinUrl: 'https://linkedin.com/in/priyasharma-pm',
    portfolioUrl: 'https://priyasharma.pm',
    connectionStatus: 'connected',
    connectedSince: new Date(Date.now() - 86400000 * 14).toISOString(),
    postsCount: 2
  },
  {
    userId: 'usr-network-02',
    name: 'Rahul Verma',
    headline: 'Staff Full Stack Architect — Distributed Systems & Microservices',
    bio: 'Hands-on architect building resilient low-latency backend engines with Go, Node.js, and TypeScript. Tech speaker and open-source enthusiast.',
    location: 'Ahmedabad, Gujarat',
    currentRole: 'Staff Full Stack Architect @ Swiggy',
    totalExperienceYears: 8,
    skills: ['Go', 'TypeScript', 'Node.js', 'React', 'Kubernetes', 'Distributed Systems', 'Kafka', 'PostgreSQL'],
    tools: ['Docker', 'AWS', 'Grafana', 'Git'],
    languages: ['English', 'Gujarati', 'Hindi'],
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    education: [
      {
        id: 'edu-r1',
        institution: 'IIT Roorkee',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science and Engineering',
        startYear: 2014,
        endYear: 2018
      }
    ],
    experience: [
      {
        id: 'exp-r1',
        company: 'Swiggy Consumer Tech',
        position: 'Staff Architect',
        location: 'Ahmedabad (Hybrid)',
        workType: 'Hybrid',
        startDate: '2020-08-01',
        isCurrent: true,
        description: 'Designed the routing and order dispatch microservices mesh serving 2M+ daily active orders.',
        skillsUsed: ['Go', 'Kafka', 'Kubernetes', 'Redis']
      }
    ],
    projects: [
      {
        id: 'proj-r1',
        title: 'High-Throughput WebSockets Signaling Gateway',
        description: 'Ultra low-latency event broker handling 500k concurrent connections with sub-10ms pub-sub latency.',
        technologies: ['Go', 'WebSockets', 'Redis', 'Docker'],
        githubUrl: 'https://github.com/rahulverma-arch/fast-ws-gateway'
      }
    ],
    githubUrl: 'https://github.com/rahulverma-arch',
    linkedinUrl: 'https://linkedin.com/in/rahulverma-arch',
    portfolioUrl: 'https://rahulverma.dev',
    connectionStatus: 'pending_received',
    requestId: 'req-in-02',
    postsCount: 3
  },
  {
    userId: 'usr-network-03',
    name: 'Ananya Iyer',
    headline: 'Lead AI Data Scientist — Fraud Telemetry & Predictive Models',
    bio: 'Ph.D. in Machine Learning. Specializing in graph neural networks, anomaly detection, and credit fraud telemetry.',
    location: 'Mumbai, Maharashtra',
    currentRole: 'Lead AI Data Scientist @ CRED',
    totalExperienceYears: 6,
    skills: ['Machine Learning', 'Python', 'PyTorch', 'Graph Neural Networks', 'SQL', 'MLOps', 'Feature Stores'],
    tools: ['Feast', 'MLflow', 'Databricks', 'AWS SageMaker'],
    languages: ['English', 'Tamil', 'Hindi'],
    profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    education: [
      {
        id: 'edu-a1',
        institution: 'IIT Bombay',
        degree: 'Ph.D. & M.Tech',
        fieldOfStudy: 'Computer Science & Machine Intelligence',
        startYear: 2015,
        endYear: 2020
      }
    ],
    experience: [
      {
        id: 'exp-a1',
        company: 'CRED Scaled Architecture',
        position: 'Lead AI Scientist',
        location: 'Mumbai, India',
        workType: 'Hybrid',
        startDate: '2021-06-01',
        isCurrent: true,
        description: 'Engineered real-time graph embeddings for fraud anomaly detection on credit card payments.',
        skillsUsed: ['PyTorch', 'Python', 'Databricks', 'SQL']
      }
    ],
    projects: [
      {
        id: 'proj-a1',
        title: 'Graph Anomaly Detection Benchmark',
        description: 'Open benchmark comparing GCN and GraphSAGE accuracy on financial fraud datasets.',
        technologies: ['PyTorch Geometric', 'Python', 'DGL'],
        githubUrl: 'https://github.com/ananya-iyer-ai/graph-fraud-benchmark'
      }
    ],
    githubUrl: 'https://github.com/ananya-iyer-ai',
    linkedinUrl: 'https://linkedin.com/in/ananya-iyer-ai',
    portfolioUrl: 'https://ananya-iyer.ai',
    connectionStatus: 'none',
    postsCount: 1
  },
  {
    userId: 'usr-network-04',
    name: 'Vikram Patel',
    headline: 'Staff DevOps & Cloud Infrastructure Lead',
    bio: 'DevOps evangelist. Managing multi-region Kubernetes clusters, GitOps pipelines, and zero-downtime database migrations.',
    location: 'Pune, Maharashtra',
    currentRole: 'Staff DevOps Lead @ Zomato',
    totalExperienceYears: 8.5,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Prometheus', 'ArgoCD', 'Linux Kernel', 'Golang'],
    tools: ['Docker', 'Helm', 'ArgoCD', 'Datadog'],
    languages: ['English', 'Marathi', 'Hindi'],
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    education: [
      {
        id: 'edu-v1',
        institution: 'COEP Technological University, Pune',
        degree: 'B.E.',
        fieldOfStudy: 'Computer Engineering',
        startYear: 2012,
        endYear: 2016
      }
    ],
    experience: [
      {
        id: 'exp-v1',
        company: 'Zomato Hyper-Scale',
        position: 'Staff DevOps Lead',
        location: 'Pune, India',
        workType: 'Remote',
        startDate: '2019-11-01',
        isCurrent: true,
        description: 'Architected automated zero-downtime deployment pipelines across 400+ microservices on AWS EKS.',
        skillsUsed: ['Kubernetes', 'Terraform', 'ArgoCD', 'AWS']
      }
    ],
    projects: [
      {
        id: 'proj-v1',
        title: 'GitOps Auto-Scaler Operator',
        description: 'Custom Kubernetes CRD operator scaling workloads based on live queue depth metrics.',
        technologies: ['Golang', 'Kubernetes Operator SDK', 'Prometheus'],
        githubUrl: 'https://github.com/vikram-patel-devops/k8s-autoscale-operator'
      }
    ],
    githubUrl: 'https://github.com/vikram-patel-devops',
    linkedinUrl: 'https://linkedin.com/in/vikram-patel-devops',
    portfolioUrl: 'https://vikrampatel.infra',
    connectionStatus: 'none',
    postsCount: 1
  },
  {
    userId: 'usr-network-05',
    name: 'Sneha Kulkarni',
    headline: 'Frontend Engineering Lead — Design Systems & Performance',
    bio: 'Leading UI architecture at scale. Obsessed with micro-interactions, Web Performance, and accessibility.',
    location: 'Hyderabad, India',
    currentRole: 'Frontend Engineering Lead @ Flipkart',
    totalExperienceYears: 6.5,
    skills: ['React', 'TypeScript', 'Next.js', 'Design Systems', 'Web Performance', 'TailwindCSS', 'GraphQL', 'Jest'],
    tools: ['Storybook', 'Figma', 'Webpack', 'Vite'],
    languages: ['English', 'Telugu', 'Hindi'],
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    education: [
      {
        id: 'edu-s1',
        institution: 'IIIT Hyderabad',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startYear: 2014,
        endYear: 2018
      }
    ],
    experience: [
      {
        id: 'exp-s1',
        company: 'Flipkart',
        position: 'Lead Frontend Engineer',
        location: 'Hyderabad, India',
        workType: 'Hybrid',
        startDate: '2021-03-01',
        isCurrent: true,
        description: 'Designed the unified cross-platform design system component library powering 100M+ monthly shoppers.',
        skillsUsed: ['React', 'TypeScript', 'Storybook', 'TailwindCSS']
      }
    ],
    projects: [
      {
        id: 'proj-s1',
        title: 'Accessible Glassmorphic UI Kit',
        description: 'Zero-dependency accessible component library with dark-mode contrast presets and fluid typography.',
        technologies: ['TypeScript', 'TailwindCSS', 'Storybook'],
        githubUrl: 'https://github.com/sneha-kulkarni-ui/glass-ui-kit'
      }
    ],
    githubUrl: 'https://github.com/sneha-kulkarni-ui',
    linkedinUrl: 'https://linkedin.com/in/sneha-kulkarni-ui',
    portfolioUrl: 'https://snehakulkarni.design',
    connectionStatus: 'pending_sent',
    requestId: 'req-out-03',
    postsCount: 1
  }
]

function getLocalState(): ConnectionUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CONNS)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONNS, JSON.stringify(SEED_DISCOVERY_PROFILES))
      return SEED_DISCOVERY_PROFILES
    }
    return JSON.parse(raw)
  } catch {
    return SEED_DISCOVERY_PROFILES
  }
}

function saveLocalState(profiles: ConnectionUser[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONNS, JSON.stringify(profiles))
  } catch (e) {}
}

export const connectionService = {
  // 1. Get My Connected People
  async getMyConnections(): Promise<ConnectionUser[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.connections)) {
          // Merge real statuses into the local cache so the synchronous
          // getConnectionStatus()/isConnected() helpers (used to gate
          // 'connections'-visibility posts) see backend truth too, not just
          // whatever this browser mutated locally.
          const local = getLocalState()
          const byId = new Map(local.map((u) => [u.userId, u]))
          data.connections.forEach((c: ConnectionUser) => byId.set(c.userId, { ...byId.get(c.userId), ...c }))
          saveLocalState(Array.from(byId.values()))
          return data.connections
        }
      }
    } catch (e) {}

    const list = getLocalState()
    return list.filter((u) => u.connectionStatus === 'connected')
  },

  // 2. Get Requests (Incoming & Sent)
  async getRequests(): Promise<{ incoming: any[]; sent: any[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/requests`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const local = getLocalState()
          const byId = new Map(local.map((u) => [u.userId, u]))
          ;(data.incoming || []).forEach((r: any) => {
            if (r.requester) byId.set(r.requester.userId, { ...byId.get(r.requester.userId), ...r.requester, requestId: r.requestId, connectionStatus: 'pending_received' })
          })
          ;(data.sent || []).forEach((r: any) => {
            if (r.recipient) byId.set(r.recipient.userId, { ...byId.get(r.recipient.userId), ...r.recipient, requestId: r.requestId, connectionStatus: 'pending_sent' })
          })
          saveLocalState(Array.from(byId.values()))
          return { incoming: data.incoming || [], sent: data.sent || [] }
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const incoming = list
      .filter((u) => u.connectionStatus === 'pending_received')
      .map((u) => ({
        requestId: u.requestId || `req-${u.userId}`,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        requester: u
      }))

    const sent = list
      .filter((u) => u.connectionStatus === 'pending_sent')
      .map((u) => ({
        requestId: u.requestId || `req-${u.userId}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        recipient: u
      }))

    return { incoming, sent }
  },

  // 3. Send Connection Request
  async sendRequest(targetUserId: string): Promise<{ success: boolean; message: string; status: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // Sync local state
          const list = getLocalState()
          const updated = list.map((u) =>
            u.userId === targetUserId ? { ...u, connectionStatus: (data.status || 'pending_sent') as any } : u
          )
          saveLocalState(updated)
          return data
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const target = list.find((u) => u.userId === targetUserId)
    const updated = list.map((u) =>
      u.userId === targetUserId ? { ...u, connectionStatus: 'pending_sent' as any } : u
    )
    saveLocalState(updated)
    return {
      success: true,
      message: `Connection request sent to ${target?.name || 'user'}!`,
      status: 'pending_sent'
    }
  },

  // 4. Accept Connection Request
  async acceptRequest(requestIdOrUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/${requestIdOrUserId}/accept`, {
        method: 'PATCH',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const list = getLocalState()
          const updated = list.map((u) =>
            u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
              ? { ...u, connectionStatus: 'connected' as any, connectedSince: new Date().toISOString() }
              : u
          )
          saveLocalState(updated)
          return data
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const updated = list.map((u) =>
      u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
        ? { ...u, connectionStatus: 'connected' as any, connectedSince: new Date().toISOString() }
        : u
    )
    saveLocalState(updated)
    return { success: true, message: 'Connection request accepted!' }
  },

  // 5. Decline Request
  async declineRequest(requestIdOrUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/${requestIdOrUserId}/decline`, {
        method: 'PATCH',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const list = getLocalState()
          const updated = list.map((u) =>
            u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
              ? { ...u, connectionStatus: 'none' as any }
              : u
          )
          saveLocalState(updated)
          return data
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const updated = list.map((u) =>
      u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
        ? { ...u, connectionStatus: 'none' as any }
        : u
    )
    saveLocalState(updated)
    return { success: true, message: 'Connection request declined.' }
  },

  // 6. Cancel Sent Request
  async cancelRequest(requestIdOrUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/${requestIdOrUserId}/cancel`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const list = getLocalState()
          const updated = list.map((u) =>
            u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
              ? { ...u, connectionStatus: 'none' as any }
              : u
          )
          saveLocalState(updated)
          return data
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const updated = list.map((u) =>
      u.requestId === requestIdOrUserId || u.userId === requestIdOrUserId
        ? { ...u, connectionStatus: 'none' as any }
        : u
    )
    saveLocalState(updated)
    return { success: true, message: 'Request cancelled.' }
  },

  // 7. Remove Connection
  async removeConnection(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/${userId}/remove`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const list = getLocalState()
          const updated = list.map((u) =>
            u.userId === userId ? { ...u, connectionStatus: 'none' as any } : u
          )
          saveLocalState(updated)
          return data
        }
      }
    } catch (e) {}

    const list = getLocalState()
    const updated = list.map((u) =>
      u.userId === userId ? { ...u, connectionStatus: 'none' as any } : u
    )
    saveLocalState(updated)
    return { success: true, message: 'Connection removed successfully.' }
  },

  // 8. Discover Professionals
  async discoverPeople(query?: string, skill?: string, location?: string): Promise<ConnectionUser[]> {
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (skill) params.set('skill', skill)
      if (location) params.set('location', location)

      const res = await fetch(`${API_BASE_URL}/connections/discover?${params.toString()}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.people)) {
          return data.people
        }
      }
    } catch (e) {}

    let list = getLocalState()
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.headline.toLowerCase().includes(q) ||
          u.skills?.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (skill && skill !== 'all') {
      list = list.filter((u) => u.skills?.some((s) => s.toLowerCase().includes(skill.toLowerCase())))
    }
    if (location && location !== 'all') {
      list = list.filter((u) => u.location.toLowerCase().includes(location.toLowerCase()))
    }
    return list
  },

  // 9. Get Detailed User Profile
  async getUserProfile(userId: string): Promise<ConnectionUser | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/connections/user/${userId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.profile) {
          return data.profile
        }
      }
    } catch (e) {}

    const list = getLocalState()
    return list.find((u) => u.userId === userId) || null
  },

  // 10. Helper: Check status
  getConnectionStatus(userId: string): 'none' | 'pending_sent' | 'pending_received' | 'connected' {
    const list = getLocalState()
    const user = list.find((u) => u.userId === userId)
    return (user?.connectionStatus as any) || 'none'
  },

  // 11. Helper: Is connected
  isConnected(userId: string): boolean {
    return this.getConnectionStatus(userId) === 'connected'
  }
}
