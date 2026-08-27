export interface MeetingTranscriptEntry {
  timestamp: string
  speaker: string
  speakerRole: 'interviewer' | 'candidate' | 'ai'
  text: string
}

export interface MeetingRecording {
  id: string
  title: string
  jobTitle: string
  company: string
  companyLogo?: string
  interviewType: 'Technical' | 'HR Screening' | 'System Design' | 'Executive Discussion'
  status: 'Scheduled' | 'In Progress' | 'Completed'
  date: string
  time: string
  durationMinutes: number
  roomUrl: string
  recordingUrl?: string
  videoThumbnail?: string
  score?: number
  recommendation?: string
  panelists: { name: string; role: string; avatar?: string }[]
  keyCompetencies: { skill: string; score: number }[]
  summaryNotes: string
  proctoringStatus: string
  transcript: MeetingTranscriptEntry[]
}

const INITIAL_MEETINGS: MeetingRecording[] = [
  {
    id: 'meet-1',
    title: 'Senior Business Analyst — Technical & ETL Round',
    jobTitle: 'Senior Business Analyst',
    company: 'Northstar Analytics',
    interviewType: 'Technical',
    status: 'Completed',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    time: '3:00 PM IST',
    durationMinutes: 38,
    roomUrl: '/interview/room/int-1?role=Senior%20Business%20Analyst&company=Northstar%20Analytics',
    recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    score: 94,
    recommendation: 'Strong Hire — Advanced SQL & Data Pipeline Proficiency',
    panelists: [
      { name: 'Sarah (AI Agent)', role: 'RAS AI Technical Evaluator', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
      { name: 'Vikram Sen', role: 'VP of Analytics Engineering', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
    ],
    keyCompetencies: [
      { skill: 'SQL & Window Functions', score: 96 },
      { skill: 'ETL Pipeline Debugging', score: 94 },
      { skill: 'Stakeholder BRD Translation', score: 92 },
      { skill: 'Executive Communication', score: 95 }
    ],
    summaryNotes:
      'Candidate clearly demonstrated senior-level grasp of dimensional modeling in Snowflake and Power BI DAX expressions. Solved the funnel drop-off SQL scenario using ROW_NUMBER() and transparently outlined data governance triage protocols.',
    proctoringStatus: '100% Clean Proctoring — 0 Warnings (Face & Gaze Verified)',
    transcript: [
      {
        timestamp: '00:01',
        speaker: 'Sarah (AI Technical Evaluator)',
        speakerRole: 'ai',
        text: 'Welcome Avinash to your Technical Interview session for Senior Business Analyst at Northstar Analytics. To start, how do you handle data anomalies and reconcile discrepancies across ETL pipelines?'
      },
      {
        timestamp: '00:45',
        speaker: 'Avinash Tiwari (Candidate)',
        speakerRole: 'candidate',
        text: 'Thank you Sarah. In my previous role, I implemented automated staging schema validation where every daily ingestion batch runs automated row-count and null-threshold checks. If a variance exceeds 20% of moving averages, records are quarantined in an error logging table while firing webhooks.'
      },
      {
        timestamp: '02:10',
        speaker: 'Vikram Sen (Hiring Panel)',
        speakerRole: 'interviewer',
        text: 'Impressive quarantine approach. How do you communicate this delay to executive stakeholders when a morning dashboard might be delayed?'
      },
      {
        timestamp: '02:50',
        speaker: 'Avinash Tiwari (Candidate)',
        speakerRole: 'candidate',
        text: 'I believe in proactive transparency. We broadcast an automated status banner directly atop the Power BI report notifying users of data refresh in progress, alongside an estimated resolution ETA sent to key VP stakeholders.'
      },
      {
        timestamp: '05:15',
        speaker: 'Sarah (AI Technical Evaluator)',
        speakerRole: 'ai',
        text: 'Explain the difference between WHERE and HAVING clauses in SQL, and when you would prefer window functions over standard GROUP BY aggregations.'
      },
      {
        timestamp: '06:05',
        speaker: 'Avinash Tiwari (Candidate)',
        speakerRole: 'candidate',
        text: 'WHERE filters rows prior to aggregation, whereas HAVING evaluates aggregated values after GROUP BY. I utilize window functions like ROW_NUMBER() and DENSE_RANK() when I need to compute running totals or top-N partitions while still preserving individual record granularity.'
      }
    ]
  },
  {
    id: 'meet-2',
    title: 'Lead Business Analyst & Product Strategist — Final Discussion',
    jobTitle: 'Lead Business Analyst',
    company: 'Lattice Labs',
    interviewType: 'Executive Discussion',
    status: 'Scheduled',
    date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    time: '4:30 PM IST',
    durationMinutes: 45,
    roomUrl: '/interview/room/int-2?role=Lead%20Business%20Analyst&company=Lattice%20Labs',
    panelists: [
      { name: 'Dr. Anita Roy', role: 'Head of Product Analytics', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { name: 'Marcus Vance', role: 'Director of Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
    ],
    keyCompetencies: [
      { skill: 'Product Roadmap Alignment', score: 90 },
      { skill: 'Cross-functional Leadership', score: 92 }
    ],
    summaryNotes: 'Round 2 scheduled. Please join directly on RAS 5 minutes prior to start time. Camera & screen sharing required.',
    proctoringStatus: 'Proctoring Ready (Webcam & Gaze calibration required)',
    transcript: []
  },
  {
    id: 'meet-3',
    title: 'Preliminary AI Voice HR Screening Session',
    jobTitle: 'Senior Business Analyst',
    company: 'Northstar Analytics',
    interviewType: 'HR Screening',
    status: 'Completed',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    time: '11:00 AM IST',
    durationMinutes: 12,
    roomUrl: '/voice-screening',
    recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    score: 95,
    recommendation: 'Recommended for Round 1 Technical — Notice period & CTC aligned',
    panelists: [
      { name: 'Sarah', role: 'RAS AI Talent Partner', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' }
    ],
    keyCompetencies: [
      { skill: 'Communication Clarity', score: 95 },
      { skill: 'Role & CTC Alignment', score: 96 }
    ],
    summaryNotes: 'Candidate confirmed 30-day notice period with buyout feasibility. Salary expectation is within hiring budget (₹24-28 LPA). Highly articulate.',
    proctoringStatus: 'Audio Voice Biometrics Verified (100% Match)',
    transcript: [
      {
        timestamp: '00:05',
        speaker: 'Sarah (AI Talent Partner)',
        speakerRole: 'ai',
        text: 'Hello Avinash! Could you start with a brief overview of your current analytical responsibilities?'
      },
      {
        timestamp: '00:30',
        speaker: 'Avinash Tiwari (Candidate)',
        speakerRole: 'candidate',
        text: 'Currently I lead business intelligence initiatives, designing automated Power BI pipelines and SQL models across 12 product lines.'
      },
      {
        timestamp: '01:15',
        speaker: 'Sarah (AI Talent Partner)',
        speakerRole: 'ai',
        text: 'What is your current notice period and expected compensation bracket?'
      },
      {
        timestamp: '01:40',
        speaker: 'Avinash Tiwari (Candidate)',
        speakerRole: 'candidate',
        text: 'My official notice period is 30 days with 15-day buyout flexibility. My expected bracket is ₹24 to 28 LPA.'
      }
    ]
  }
]

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

  getMeetingById(id: string): MeetingRecording | null {
    const all = this.getMeetings()
    return all.find((m) => m.id === id) || null
  },

  saveCompletedSession(session: {
    jobTitle: string
    company: string
    interviewType: 'Technical' | 'HR Screening' | 'System Design' | 'Executive Discussion'
    score: number
    durationMinutes: number
    transcript: MeetingTranscriptEntry[]
    recommendation: string
    proctoringWarnings: number
  }) {
    const meetings = this.getMeetings()
    const newMeeting: MeetingRecording = {
      id: 'meet-' + Date.now(),
      title: `${session.jobTitle} — ${session.interviewType} Interview Session`,
      jobTitle: session.jobTitle,
      company: session.company,
      interviewType: session.interviewType,
      status: 'Completed',
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: session.durationMinutes,
      roomUrl: `/interview/room/int-${Date.now()}?role=${encodeURIComponent(session.jobTitle)}&company=${encodeURIComponent(session.company)}`,
      recordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      score: session.score,
      recommendation: session.recommendation,
      panelists: [
        { name: 'Sarah (AI Agent)', role: 'RAS AI Technical Evaluator', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' }
      ],
      keyCompetencies: [
        { skill: 'Technical Depth', score: session.score },
        { skill: 'Problem Solving', score: Math.max(70, session.score - 3) },
        { skill: 'Communication', score: Math.max(75, session.score - 2) }
      ],
      summaryNotes: `AI Interview session completed with ${session.score}% compatibility rating. Full recording and transcript indexed.`,
      proctoringStatus:
        session.proctoringWarnings === 0
          ? '100% Clean Proctoring — 0 Warnings'
          : `${session.proctoringWarnings} Minor Warnings Logged`,
      transcript: session.transcript
    }

    const updated = [newMeeting, ...meetings]
    this.saveMeetings(updated)
    return newMeeting
  }
}
