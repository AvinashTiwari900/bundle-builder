import { API_BASE_URL } from '../config/api.config'

export interface MeetingTranscriptEntry {
  timestamp: string
  speaker: string
  speakerRole: 'host' | 'participant' | 'guest'
  text: string
}

export interface MeetingNote {
  id: string
  timestamp: string
  author: string
  text: string
  createdAt: string
}

export interface MeetingActionItem {
  id: string
  assignee: string
  task: string
  done: boolean
}

export interface MeetingRecording {
  id: string
  code: string
  title: string
  meetingType: string
  organization?: string
  hostName: string
  hostAvatar?: string
  status: 'Scheduled' | 'Completed' | 'In Progress'
  date: string
  time: string
  durationMinutes: number
  roomUrl: string
  shareUrl: string
  recordingUrl?: string
  videoThumbnail?: string
  isRecorded: boolean
  hasScreenShare: boolean
  screenShareThumbnail?: string
  participants: { name: string; role: string; avatar?: string; isHost?: boolean }[]
  summaryNotes: string
  aiSummary?: string
  keyDiscussionPoints?: string[]
  decisions?: string[]
  actionItems?: MeetingActionItem[]
  followUps?: string[]
  notes?: MeetingNote[]
  passcode?: string
  waitingRoomEnabled?: boolean
  transcript: MeetingTranscriptEntry[]
}

const INITIAL_MEETINGS: MeetingRecording[] = [
  {
    id: 'meet-prd-01',
    code: 'X7K92P',
    title: 'Product Planning & Sprint 14 Deliverables',
    meetingType: 'Product Planning',
    organization: 'Acme Systems',
    hostName: 'Marcus Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Completed',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    time: '02:30 PM IST',
    durationMinutes: 28,
    roomUrl: '/interview/room/meet-prd-01?code=X7K92P&title=Product%20Planning%20%26%20Sprint%2014&host=Marcus%20Chen',
    shareUrl: `${window.location.origin}/meet/X7K92P`,
    recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    isRecorded: true,
    hasScreenShare: true,
    screenShareThumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    participants: [
      {
        name: 'Marcus Chen',
        role: 'VP of Engineering (Host)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        isHost: true
      },
      {
        name: 'Avinash Tiwari',
        role: 'Lead Business Analyst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Sarah Jenkins',
        role: 'Senior Product Designer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Elena Vance',
        role: 'Data Architect',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80'
      }
    ],
    summaryNotes:
      'Team aligned on the Sprint 14 feature milestones. Avinash presented data query benchmarks across the staging cluster and Sarah finalized design tokens.',
    aiSummary:
      'The engineering and product teams aligned on the Sprint 14 milestone deliverables. Discussed real-time WebSocket telemetry, resolved database index contention on partitioned logs, and scheduled the staging release for Friday.',
    keyDiscussionPoints: [
      'Sprint 14 velocity target and priority feature delivery across client dashboards',
      'Database table partitioning strategies to mitigate 15-minute refresh contention in PostgreSQL',
      'Design review for new collaborative live meeting transcript view'
    ],
    decisions: [
      'Adopt daily composite partitioning for analytics tables to reduce scan costs by 68%',
      'Release Sprint 14 candidate build to staging by Thursday 5:00 PM',
      'Enforce mandatory WebRTC track termination on room exit across all clients'
    ],
    actionItems: [
      { id: 'act-1', assignee: 'Avinash Tiwari', task: 'Run benchmark SQL queries on the partitioned staging cluster', done: true },
      { id: 'act-2', assignee: 'Sarah Jenkins', task: 'Deliver finalized icon tokens for transcript export', done: false },
      { id: 'act-3', assignee: 'Marcus Chen', task: 'Coordinate staging deployment window with DevOps team', done: false }
    ],
    followUps: [
      'Re-evaluate query response latency after staging deployment during Monday standup',
      'Conduct accessibility audit on video conference controls'
    ],
    notes: [
      {
        id: 'note-1',
        timestamp: '00:45',
        author: 'Avinash Tiwari',
        text: 'Screen share started for query execution plan visualization.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'note-2',
        timestamp: '02:15',
        author: 'Avinash Tiwari',
        text: 'Team agreed on 15-minute refresh cadence for materialized views.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ],
    transcript: [
      {
        timestamp: '00:05',
        speaker: 'Marcus Chen',
        speakerRole: 'host',
        text: "Welcome everyone to our Sprint 14 planning sync. Today we're reviewing roadmap deliverables and clearing blockers for the analytics pipeline."
      },
      {
        timestamp: '00:23',
        speaker: 'Avinash Tiwari',
        speakerRole: 'participant',
        text: "Thanks Marcus. I have the technical proposal ready. Let me share my screen to show the execution plan and staging partition metrics."
      },
      {
        timestamp: '01:10',
        speaker: 'Elena Vance',
        speakerRole: 'participant',
        text: 'I see the screen share. What clustering keys are we applying to the high-volume event stream tables?'
      },
      {
        timestamp: '01:45',
        speaker: 'Avinash Tiwari',
        speakerRole: 'participant',
        text: 'We cluster by event_date and organization_id. For heavy aggregation endpoints, materialized views cut query latency from 4.2s down to 280ms.'
      },
      {
        timestamp: '02:30',
        speaker: 'Sarah Jenkins',
        speakerRole: 'participant',
        text: 'From the UX perspective, the transcript layout and meeting notes drawers are fully responsive and ready for production styling.'
      },
      {
        timestamp: '03:15',
        speaker: 'Marcus Chen',
        speakerRole: 'host',
        text: 'Great work team. Let us proceed with staging rollout on Thursday and verify performance under peak load.'
      }
    ]
  },
  {
    id: 'meet-arc-02',
    code: 'ARC982',
    title: 'Enterprise Architecture Review & Security Protocol',
    meetingType: 'Architecture Review',
    organization: 'Lattice Labs',
    hostName: 'Dr. Anita Roy',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Completed',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    time: '11:00 AM IST',
    durationMinutes: 35,
    roomUrl: '/interview/room/meet-arc-02?code=ARC982&title=Architecture%20Review&host=Dr.%20Anita%20Roy',
    shareUrl: `${window.location.origin}/meet/ARC982`,
    recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    isRecorded: true,
    hasScreenShare: false,
    participants: [
      {
        name: 'Dr. Anita Roy',
        role: 'Head of Product Architecture (Host)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isHost: true
      },
      {
        name: 'Avinash Tiwari',
        role: 'Lead Business Analyst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'David Kim',
        role: 'Security Engineer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
      }
    ],
    summaryNotes:
      'Reviewed enterprise webhook security, HMAC-SHA256 signature verification, and OAuth 2.0 token rotation intervals.',
    aiSummary:
      'Security architecture review focused on securing enterprise webhooks and rate limiting. Agreed on enforcing HMAC-SHA256 request signatures with a 5-minute replay tolerance window.',
    keyDiscussionPoints: [
      'Webhook replay protection and timestamp tolerance verification',
      'OAuth 2.0 token expiration lifecycle for third-party integrations',
      'API rate limiting tiers for standard vs enterprise customers'
    ],
    decisions: [
      'Enforce mandatory HMAC-SHA256 signature verification on all outbound webhooks',
      'Set token refresh lifetime to 30 days with sliding expiration'
    ],
    actionItems: [
      { id: 'act-4', assignee: 'David Kim', task: 'Draft developer documentation on HMAC signature validation', done: true },
      { id: 'act-5', assignee: 'Avinash Tiwari', task: 'Update API schema specification in Postman workspace', done: false }
    ],
    followUps: ['Schedule penetration testing review in 2 weeks'],
    notes: [],
    transcript: [
      {
        timestamp: '00:08',
        speaker: 'Dr. Anita Roy',
        speakerRole: 'host',
        text: 'Good morning. We are reviewing the enterprise webhook architecture and verification standards.'
      },
      {
        timestamp: '00:40',
        speaker: 'David Kim',
        speakerRole: 'participant',
        text: 'I recommend standardizing on HMAC-SHA256 header signatures with timestamp validation to prevent replay attacks.'
      },
      {
        timestamp: '01:25',
        speaker: 'Avinash Tiwari',
        speakerRole: 'participant',
        text: 'Agreed. We can implement a 5-minute tolerance header check on all incoming webhook consumers.'
      }
    ]
  },
  {
    id: 'meet-sch-03',
    code: 'SYNC404',
    title: 'Cross-Functional Product Strategy & Q4 Roadmap',
    meetingType: 'Strategy Sync',
    organization: 'FinTech Pulse',
    hostName: 'Marcus Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Scheduled',
    date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    time: '10:30 AM IST',
    durationMinutes: 45,
    roomUrl: '/interview/room/meet-sch-03?code=SYNC404&title=Product%20Strategy%20Sync&host=Marcus%20Chen',
    shareUrl: `${window.location.origin}/meet/SYNC404`,
    isRecorded: false,
    hasScreenShare: false,
    waitingRoomEnabled: true,
    passcode: '4829',
    participants: [
      {
        name: 'Marcus Chen',
        role: 'Host',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        isHost: true
      },
      {
        name: 'Avinash Tiwari',
        role: 'Lead Business Analyst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Dr. Anita Roy',
        role: 'Head of Product',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      },
      {
        name: 'Sarah Jenkins',
        role: 'Product Designer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
      }
    ],
    summaryNotes:
      'Upcoming cross-functional sync. Agenda covers Q4 roadmap milestones, client onboarding metrics, and UX enhancements.',
    transcript: []
  }
]

// Generate secure, short human-readable meeting code like "X7K92P"
export function generateSecureMeetingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const meetingService = {
  getMeetings(): MeetingRecording[] {
    const raw = localStorage.getItem('rap_interview_meetings')
    if (!raw) {
      localStorage.setItem('rap_interview_meetings', JSON.stringify(INITIAL_MEETINGS))
      return INITIAL_MEETINGS
    }
    try {
      const parsed = JSON.parse(raw)
      return parsed.length ? parsed : INITIAL_MEETINGS
    } catch {
      return INITIAL_MEETINGS
    }
  },

  saveMeetings(meetings: MeetingRecording[]) {
    localStorage.setItem('rap_interview_meetings', JSON.stringify(meetings))
  },

  upsertLocal(record: MeetingRecording) {
    const meetings = this.getMeetings()
    const updated = [record, ...meetings.filter((m) => m.id !== record.id && m.code !== record.code)]
    this.saveMeetings(updated)
  },

  async getMeetingById(idOrCode: string): Promise<MeetingRecording | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${encodeURIComponent(idOrCode)}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.meeting) {
          const record = data.meeting as MeetingRecording
          this.upsertLocal(record)
          return record
        }
      }
    } catch {
      // offline or backend unreachable - fall back to local cache below
    }

    const all = this.getMeetings()
    const clean = idOrCode.toLowerCase().trim()
    return all.find((m) => m.id.toLowerCase() === clean || m.code.toLowerCase() === clean)
  },

  async createInstantMeeting(title?: string, hostName?: string): Promise<MeetingRecording> {
    const meetingTitle = title || 'Instant Team Meeting'
    const host = hostName || 'Avinash Tiwari'

    try {
      const res = await fetch(`${API_BASE_URL}/meetings/instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: meetingTitle, hostName: host })
      })
      if (res.ok) {
        const data = await res.json()
        const m = data.meeting
        const record: MeetingRecording = {
          id: m.id,
          code: m.code,
          title: m.title,
          meetingType: m.meetingType || 'Instant Meeting',
          hostName: m.hostName || host,
          status: m.status || 'In Progress',
          date: m.date || new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationMinutes: m.durationMinutes || 30,
          roomUrl: `/interview/room/${m.id}?code=${m.code}&title=${encodeURIComponent(meetingTitle)}&host=${encodeURIComponent(host)}`,
          shareUrl: `${window.location.origin}/meet/${m.code}`,
          isRecorded: false,
          hasScreenShare: false,
          participants: [
            {
              name: host,
              role: 'Host',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              isHost: true
            }
          ],
          summaryNotes: 'Instant meeting initiated with shareable link.',
          transcript: []
        }
        this.upsertLocal(record)
        return record
      }
    } catch {
      // offline or backend unreachable - fall back to a local-only meeting below
    }

    const code = generateSecureMeetingCode()
    const id = 'meet-' + code.toLowerCase()
    const newMeeting: MeetingRecording = {
      id,
      code,
      title: meetingTitle,
      meetingType: 'Instant Meeting',
      hostName: host,
      status: 'In Progress',
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 30,
      roomUrl: `/interview/room/${id}?code=${code}&title=${encodeURIComponent(meetingTitle)}&host=${encodeURIComponent(host)}`,
      shareUrl: `${window.location.origin}/meet/${code}`,
      isRecorded: false,
      hasScreenShare: false,
      participants: [
        {
          name: host,
          role: 'Host',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isHost: true
        }
      ],
      summaryNotes: 'Instant meeting initiated with shareable link.',
      transcript: []
    }
    this.upsertLocal(newMeeting)
    return newMeeting
  },

  async syncFromBackend(): Promise<MeetingRecording[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, { credentials: 'include' })
      if (!res.ok) return null
      const data = await res.json()
      const meetings = data.meetings as MeetingRecording[]
      if (!Array.isArray(meetings)) return null

      const local = this.getMeetings()
      const byId = new Map(local.map((m) => [m.id, m]))
      meetings.forEach((m) => byId.set(m.id, { ...byId.get(m.id), ...m }))
      const merged = Array.from(byId.values())
      this.saveMeetings(merged)
      return meetings
    } catch {
      return null
    }
  },

  saveCompletedSession(sessionData: {
    id?: string
    code?: string
    title: string
    meetingType?: string
    hostName?: string
    organization?: string
    durationMinutes: number
    transcript: MeetingTranscriptEntry[]
    hasScreenShare?: boolean
    recordingUrl?: string
    videoThumbnail?: string
    summaryNotes?: string
    notes?: MeetingNote[]
  }): MeetingRecording {
    const meetings = this.getMeetings()
    const code = sessionData.code || generateSecureMeetingCode()
    const newId = sessionData.id || 'meet-' + code.toLowerCase()

    // Auto-generate realistic AI meeting assistant data from verbatim transcript
    const transcriptText = (sessionData.transcript || []).map((t) => `${t.speaker}: ${t.text}`).join(' ')
    const aiSummary =
      transcriptText.length > 50
        ? `Discussion covered ${sessionData.title}. Participants reviewed project deliverables and aligned on technical milestones.`
        : `Meeting completed on ${new Date().toLocaleDateString()}. Video recording and audio transcription archived.`

    const newMeeting: MeetingRecording = {
      id: newId,
      code,
      title: sessionData.title || 'Live Video Conference Meeting',
      meetingType: sessionData.meetingType || 'General Meeting',
      organization: sessionData.organization || 'Workspace Partner',
      hostName: sessionData.hostName || 'Marcus Chen',
      status: 'Completed',
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: Math.max(1, sessionData.durationMinutes || 1),
      roomUrl: `/interview/room/${newId}?code=${code}`,
      shareUrl: `${window.location.origin}/meet/${code}`,
      recordingUrl: sessionData.recordingUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoThumbnail:
        sessionData.videoThumbnail ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      isRecorded: true,
      hasScreenShare: Boolean(sessionData.hasScreenShare),
      screenShareThumbnail: sessionData.hasScreenShare
        ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        : undefined,
      participants: [
        {
          name: 'Avinash Tiwari',
          role: 'Host / Participant',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isHost: true
        },
        {
          name: 'Marcus Chen',
          role: 'Team Lead',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        }
      ],
      summaryNotes:
        sessionData.summaryNotes ||
        `Meeting concluded on ${new Date().toLocaleDateString()}. Transcript and video recording saved.`,
      aiSummary,
      keyDiscussionPoints: [
        `Key priorities for ${sessionData.title}`,
        'Collaborative action plans and milestone execution',
        'Review of technical architecture and operational SLAs'
      ],
      decisions: [
        'Approved sprint milestones and scheduled deployment checks',
        'Finalized meeting recording and transcript archiving'
      ],
      actionItems: [
        { id: 'act-a', assignee: 'Avinash Tiwari', task: 'Follow up on discussion points and share meeting minutes', done: false },
        { id: 'act-b', assignee: 'Team Lead', task: 'Review updated specifications and confirm schedule', done: false }
      ],
      followUps: ['Next scheduled sync session next week'],
      notes: sessionData.notes || [],
      transcript: sessionData.transcript || []
    }

    const filtered = meetings.filter((m) => m.id !== newId && m.code !== code)
    const updated = [newMeeting, ...filtered]
    this.saveMeetings(updated)

    fetch(`${API_BASE_URL}/meetings/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: newMeeting.id,
        code: newMeeting.code,
        title: newMeeting.title,
        meetingType: newMeeting.meetingType,
        hostName: newMeeting.hostName,
        organization: newMeeting.organization,
        durationMinutes: newMeeting.durationMinutes,
        transcript: newMeeting.transcript,
        hasScreenShare: newMeeting.hasScreenShare,
        recordingUrl: newMeeting.recordingUrl,
        videoThumbnail: newMeeting.videoThumbnail,
        summaryNotes: newMeeting.summaryNotes,
        notes: newMeeting.notes,
        participants: newMeeting.participants
      })
    }).catch(() => {})

    return newMeeting
  },

  addMeetingNote(meetingId: string, noteText: string, timestamp: string, author: string): MeetingNote {
    const meetings = this.getMeetings()
    const target = meetings.find((m) => m.id === meetingId)
    const newNote: MeetingNote = {
      id: 'note-' + Date.now(),
      timestamp: timestamp || '00:00',
      author: author || 'Avinash Tiwari',
      text: noteText,
      createdAt: new Date().toISOString()
    }

    if (target) {
      target.notes = [...(target.notes || []), newNote]
      this.saveMeetings(meetings)

      fetch(`${API_BASE_URL}/meetings/${target.id}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: noteText, author })
      }).catch(() => {})
    }
    return newNote
  },

  toggleActionItem(meetingId: string, actionId: string): boolean {
    const meetings = this.getMeetings()
    const target = meetings.find((m) => m.id === meetingId)
    if (target && target.actionItems) {
      const item = target.actionItems.find((a) => a.id === actionId)
      if (item) {
        item.done = !item.done
        this.saveMeetings(meetings)

        fetch(`${API_BASE_URL}/meetings/${meetingId}/action-item/${actionId}/toggle`, {
          method: 'PATCH',
          credentials: 'include'
        }).catch(() => {})

        return true
      }
    }
    return false
  },

  deleteMeeting(id: string): boolean {
    const meetings = this.getMeetings()
    const updated = meetings.filter((m) => m.id !== id && m.code !== id)
    this.saveMeetings(updated)

    fetch(`${API_BASE_URL}/meetings/${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})

    return true
  }
}
