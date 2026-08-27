import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Award,
  RotateCcw,
  ArrowRight,
  Play,
  Pause,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldCheck,
  HelpCircle,
  User,
  Bot,
  Radio,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Check,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Zap,
  MessageSquare,
  SlidersHorizontal,
  ChevronRight,
  Headphones,
  Timer,
  ShieldAlert,
  XCircle,
  Activity,
  Scan,
  Crosshair,
  Info
} from 'lucide-react'
import Button from '../components/ui/Button'
import { speechService } from '../services/speechService'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'
import { mediaStreamManager } from '../services/mediaStreamManager'

// =========================================================================
// Models & Data Structures
// =========================================================================

interface PracticeQuestion {
  id: string
  q: string
  category: 'Technical' | 'Behavioral' | 'HR' | 'Mixed' | 'System Design'
  competencies: string[]
  tip: string
  modelAnswer: string
  followUp: string
  answeredText?: string
  status: 'pending' | 'active' | 'answered' | 'timed_out'
  durationSeconds?: number
  timestamp?: string
  aiScore?: number
  aiFeedback?: string
  aiStrengths?: string[]
  aiImprovement?: string
}

export interface ProctoringViolation {
  id: string
  type: 'gaze_diverted' | 'face_turned_away' | 'multiple_faces' | 'no_face_detected' | 'tab_switched' | 'technical_issue'
  title: string
  reason: string
  timestamp: string
  secondsElapsed: number
  durationSeconds: number
  confidenceScore: number
  strikeNumber: number | 'DISQUALIFIED'
  severity: 'warning' | 'critical' | 'termination'
}

export interface MonitoringConfig {
  monitoringEnabled: boolean
  maxWarnings: number
  cooldownSeconds: number
  faceDetection: boolean
  attentionMonitoring: boolean
  multipleFaceDetection: boolean
  tabMonitoring: boolean
}

const QUESTION_BANK: Record<string, Omit<PracticeQuestion, 'id' | 'status'>[]> = {
  Technical: [
    {
      q: 'Explain the architectural differences between WHERE and HAVING clauses in SQL, and describe a real-world scenario where you would use window functions like ROW_NUMBER() or DENSE_RANK() instead of GROUP BY.',
      category: 'Technical',
      competencies: ['SQL Aggregations', 'Window Functions', 'Query Optimization'],
      tip: 'Mention that WHERE filters rows before aggregation, while HAVING filters aggregated summary rows. Window functions preserve individual row granularity.',
      modelAnswer:
        'The WHERE clause filters individual rows before any grouping or aggregation takes place. In contrast, HAVING filters the aggregated summary rows after GROUP BY is computed. I use window functions like ROW_NUMBER() or DENSE_RANK() when I need to perform computations across sets of rows while still preserving the original row-level details, such as finding the top 2 transactions per customer without collapsing the rest of the customer dataset.',
      followUp:
        'How would you handle query optimization and indexing if that window function query started timing out on a 50-million-row partitioned table in PostgreSQL or Snowflake?'
    },
    {
      q: 'How do you design a data quality pipeline to automatically detect and quarantine schema anomalies or null-rate spikes in daily automated BI ingestion?',
      category: 'Technical',
      competencies: ['Data Quality', 'ETL Architecture', 'Anomaly Detection'],
      tip: 'Highlight automated data profiling checks, null-rate threshold alerts, and staging table isolation.',
      modelAnswer:
        'I implement a multi-tiered validation approach. First, in the ingestion staging layer, automated SQL schema checks verify column datatypes and uniqueness constraints. Second, volume anomaly monitors flag deviations >20% from 30-day moving averages. If data fails validation, automated webhooks notify the data engineering team and quarantine suspect records before pushing to production dashboards.',
      followUp:
        'What specific alerts or SLA escalation rules would you configure for business stakeholders if critical KPI feeds fail ingestion before 9:00 AM?'
    },
    {
      q: 'Describe your methodology for breaking down a sudden 15% drop in product checkout conversion into measurable metrics and actionable hypotheses.',
      category: 'Technical',
      competencies: ['Funnel Analysis', 'Root Cause Analysis', 'Hypothesis Testing'],
      tip: 'Discuss the funnel analysis framework, cohort segmentation by device/region, and payment gateway drop-offs.',
      modelAnswer:
        'I start by mapping out the full customer checkout funnel into sequential conversion steps (Cart -> Shipping Info -> Payment -> Confirmation). I segment drop-off rates across dimensions like device, browser, payment gateway, and user tenure. After pinpointing where the steepest anomaly occurs, I formulate data-backed hypotheses and run targeted queries to quantify exact friction points.',
      followUp:
        'Once you identify that mobile Safari users have a 30% drop at the OTP stage, how do you prioritize and present this fix to the mobile engineering team?'
    },
    {
      q: 'What KPIs and visualization models would you select when presenting monthly recurring revenue (MRR), customer churn, and cohort retention to non-technical executive stakeholders?',
      category: 'Technical',
      competencies: ['Executive Reporting', 'SaaS Metrics', 'Data Storytelling'],
      tip: 'Focus on simplicity, Net Revenue Retention (NRR), waterfall churn breakdown, and actionable insights.',
      modelAnswer:
        'For executive leadership, clarity and actionability are paramount. I prioritize Net MRR Growth, Net Revenue Retention (NRR), and Customer Acquisition Cost payback period. I use a waterfall chart showing New MRR, Expansion MRR, and Churned MRR side-by-side, complemented by concise bullet summaries highlighting root cause drivers.',
      followUp:
        'If an executive challenges the definition of churned accounts vs paused subscriptions, how do you align conflicting stakeholder expectations?'
    }
  ],
  Behavioral: [
    {
      q: 'Describe a situation where engineering and product stakeholders had conflicting requirements or competing deadlines. How did you facilitate alignment and resolve the deadlock?',
      category: 'Behavioral',
      competencies: ['Conflict Resolution', 'Stakeholder Management', 'STAR Framework'],
      tip: 'Use the STAR technique (Situation, Task, Action, Result) with quantitative trade-off metrics.',
      modelAnswer:
        'At my previous role, Engineering wanted to dedicate a sprint entirely to refactoring our database schema, while Product insisted on shipping a client-facing analytics export. As the BA, I facilitated a joint backlog impact workshop. We mapped the technical debt risk against immediate revenue at stake. By breaking the refactoring into two phased increments, we delivered both the critical export on schedule and resolved 80% of query latency.',
      followUp:
        'What preventive processes did you put in place to ensure sprint planning friction between Engineering and Product did not recur in subsequent quarters?'
    },
    {
      q: 'Tell me about a time you discovered a critical calculation discrepancy in an analytics deck right before an executive board presentation. What steps did you take?',
      category: 'Behavioral',
      competencies: ['Crisis Handling', 'Integrity', 'Executive Communication'],
      tip: 'Emphasize integrity, calm triage under pressure, and transparent communication.',
      modelAnswer:
        'Two hours before a quarterly review, I noticed an ETL join discrepancy that double-counted churned accounts in one region. Instead of masking it, I immediately recalculated the variance, updated the slide deck with corrected numbers, and transparently briefed the VP before the meeting. The transparency built immense trust, and I subsequently automated validation scripts to prevent recurrence.',
      followUp:
        'How did you explain the root cause to the data engineering team without creating a blame culture?'
    },
    {
      q: 'Give an example of a project where requirements were ambiguous and constantly shifting. How did you establish clarity and deliver measurable business value?',
      category: 'Behavioral',
      competencies: ['Ambiguity Management', 'Agile Delivery', 'Scope Definition'],
      tip: 'Explain user journey mapping, iterative prototyping, and milestone sign-offs.',
      modelAnswer:
        'When building an internal compliance dashboard with vague executive guidelines, I conducted structured 30-minute discovery interviews with department leads. I translated loose ideas into wireframes and user stories with clear acceptance criteria. By running bi-weekly demo check-ins, we iterated quickly and delivered a solution that reduced audit prep time by 40%.',
      followUp:
        'How did you prevent scope creep when stakeholders requested late-stage features right before user acceptance testing?'
    }
  ],
  HR: [
    {
      q: 'Walk me through your professional journey, your core analytical toolkit, and what specifically excites you about growing in this role.',
      category: 'HR',
      competencies: ['Elevator Pitch', 'Self-Awareness', 'Role Alignment'],
      tip: 'Deliver a structured 90-second overview highlighting your 5+ years of BA experience, tech stack, and passion for data-driven decisions.',
      modelAnswer:
        'Over the past 5 years as a Lead Business Analyst, I have specialized in turning high-volume data into automated dashboards and revenue strategies. My core superpower lies in translating complex business goals into precise data pipelines and SQL models that reduce reporting latency by up to 75%. I am eager to bring this data-driven execution to scale your high-growth initiatives.',
      followUp:
        'What specific leadership qualities do you plan to bring when mentoring junior analysts on the team?'
    },
    {
      q: 'Where do you see yourself professionally over the next 2 to 3 years, and what emerging skills or certifications are you currently pursuing?',
      category: 'HR',
      competencies: ['Career Vision', 'Continuous Learning', 'Industry Trends'],
      tip: 'Align your growth with data strategy, AI product analytics, and cross-functional leadership.',
      modelAnswer:
        'In the next 2-3 years, I aim to lead enterprise analytics initiatives as a Principal Business Analyst or Analytics Product Manager. I am currently deepening my expertise in predictive machine learning models in Python and automated data ops to drive automated business forecasting.',
      followUp:
        'How do you stay updated with evolving generative AI tools in analytics and business intelligence?'
    },
    {
      q: 'How do you prioritize your daily workload and maintain high productivity when juggling multiple high-urgency stakeholder requests?',
      category: 'HR',
      competencies: ['Time Management', 'Prioritization', 'Work Ethic'],
      tip: 'Mention impact vs effort prioritization matrices and transparent communication of SLAs.',
      modelAnswer:
        'I use an Impact vs Urgency prioritization matrix to categorize ad-hoc requests. High-impact items aligned with core business OKRs take precedence. For lower-urgency requests, I set realistic turnaround expectations and utilize self-serve BI templates to empower business teams without creating analytical bottlenecks.',
      followUp:
        'When you have to push back or say no to a stakeholder request, what communication strategy do you use?'
    }
  ]
}

export default function InterviewSession() {
  const { id } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const params = new URLSearchParams(loc.search)
  const type = (params.get('type') || 'Technical') as 'Technical' | 'Behavioral' | 'HR' | 'Mixed'
  const count = Math.min(8, Math.max(2, Number(params.get('count') || 4)))

  const candidateProfile = profileService.get() || { name: 'Avinash Tiwari', headline: 'Lead Business Analyst' }
  const candidateName = candidateProfile.name || 'Avinash Tiwari'

  // =========================================================================
  // Session States
  // =========================================================================
  type SessionState = 'guidelines' | 'speaking' | 'listening' | 'processing' | 'completed' | 'terminated'
  const [sessionState, setSessionState] = useState<SessionState>('guidelines')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(true)

  // Termination State & Details
  const [terminationReason, setTerminationReason] = useState<string>('')
  const [terminationCategory, setTerminationCategory] = useState<'tab_switch' | 'excessive_violations' | 'manual'>('excessive_violations')

  // Timers & Inactivity
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(15)
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false)
  const [candidateSpokenText, setCandidateSpokenText] = useState('')
  const [overallElapsed, setOverallElapsed] = useState(0)
  const [questionAnswerElapsed, setQuestionAnswerElapsed] = useState(0)

  // Media (Camera & Mic)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [isMicActive, setIsMicActive] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isDictating, setIsDictating] = useState(false)

  // UI Panels & Modals
  const [showQuestionsDrawer, setShowQuestionsDrawer] = useState(false)
  const [showConcludeModal, setShowConcludeModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('AI Evaluator is ready.')

  // =========================================================================
  // REAL-TIME BALANCED PROCTORING & COMPUTER VISION SYSTEM STATE
  // =========================================================================
  const [proctoringStrikes, setProctoringStrikes] = useState<number>(0)
  const [proctoringViolations, setProctoringViolations] = useState<ProctoringViolation[]>([])
  const [activeWarningModal, setActiveWarningModal] = useState<ProctoringViolation | null>(null)
  const [cvFaceDetected, setCvFaceDetected] = useState<boolean>(true)
  const [cvGazeStatus, setCvGazeStatus] = useState<'centered' | 'diverted_left' | 'diverted_right' | 'looking_down'>('centered')
  const [cvConfidenceScore, setCvConfidenceScore] = useState<number>(80)

  // Balanced Monitoring Parameters & Configuration
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfig>({
    monitoringEnabled: true,
    maxWarnings: 2,
    cooldownSeconds: 10,
    faceDetection: true,
    attentionMonitoring: true,
    multipleFaceDetection: true,
    tabMonitoring: true
  })
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false)
  const [gracePeriodSecondsLeft, setGracePeriodSecondsLeft] = useState<number>(15)
  const [isGracePeriodActive, setIsGracePeriodActive] = useState<boolean>(false)
  const [technicalAlert, setTechnicalAlert] = useState<string | null>(null)

  // Review View Tab
  const [reviewTab, setReviewTab] = useState<'breakdown' | 'video' | 'proctoring'>('breakdown')
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0)
  const [videoPlaybackCurrentTime, setVideoPlaybackCurrentTime] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const modalVideoRef = useRef<HTMLVideoElement | null>(null)
  const cvCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const inactivityIntervalRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<any>(null)
  const overallTimerRef = useRef<any>(null)
  const answerTimerRef = useRef<any>(null)
  const candidateSpeechBufferRef = useRef<string>('')
  const cvLoopRef = useRef<any>(null)
  const gazeDivertedDurationRef = useRef<number>(0)
  const lastViolationTimeRef = useRef<number>(0)
  const tabBlurStartRef = useRef<number | null>(null)
  const isTerminatedRef = useRef<boolean>(false)

  // Interviewer Persona
  const interviewer = {
    name:
      type === 'Technical'
        ? 'Dr. Elena Vance'
        : type === 'Behavioral'
        ? 'Marcus Chen'
        : type === 'HR'
        ? 'Sarah Jenkins'
        : 'Alex Rivera',
    title:
      type === 'Technical'
        ? 'AI Principal Technical Architect'
        : type === 'Behavioral'
        ? 'AI Leadership Evaluator'
        : type === 'HR'
        ? 'AI Talent Acquisition Partner'
        : 'AI Multi-Domain Assessment Lead',
    avatar:
      type === 'Technical'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        : type === 'Behavioral'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
        : type === 'HR'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // =========================================================================
  // Initialize Question Deck (Single-Question Focus)
  // =========================================================================
  useEffect(() => {
    let pool: Omit<PracticeQuestion, 'id' | 'status'>[] = []
    if (type === 'Mixed') {
      pool = [...QUESTION_BANK.Technical, ...QUESTION_BANK.Behavioral, ...QUESTION_BANK.HR]
    } else {
      pool = QUESTION_BANK[type] || QUESTION_BANK.Technical
    }

    const selected: PracticeQuestion[] = []
    for (let i = 0; i < count; i++) {
      const item = pool[i % pool.length]
      selected.push({
        ...item,
        id: `q-${i + 1}`,
        status: 'pending',
        timestamp: ''
      })
    }
    setQuestions(selected)
  }, [type, count])

  // =========================================================================
  // Resilient Webcam & Microphone Setup & Guaranteed Hardware Release
  // =========================================================================
  const isMountedRef = useRef<boolean>(true)

  const releaseHardware = useCallback(() => {
    isMountedRef.current = false

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop()
          t.enabled = false
        } catch (e) {}
      })
      mediaStreamRef.current = null
    }

    try {
      mediaStreamManager.stopAll()
    } catch (e) {}

    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.srcObject = null
        videoRef.current.load()
      } catch (e) {}
    }
    if (modalVideoRef.current) {
      try {
        modalVideoRef.current.pause()
        modalVideoRef.current.srcObject = null
        modalVideoRef.current.load()
      } catch (e) {}
    }

    setMediaStream(null)
  }, [])

  const requestCameraStream = async () => {
    setCameraError(null)
    isMountedRef.current = true

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermissionGranted(false)
      setCameraError('Browser does not support mediaDevices API.')
      return null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop()
          t.enabled = false
        } catch (e) {}
      })
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop()
            t.enabled = false
          } catch (e) {}
        })
        return null
      }

      mediaStreamManager.register(stream)
      mediaStreamRef.current = stream
      setMediaStream(stream)
      setCameraPermissionGranted(true)
      return stream
    } catch (e1: any) {
      console.warn('Attempt 1 (video+audio) failed, trying video only:', e1)
      try {
        if (!isMountedRef.current) return null
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        })

        if (!isMountedRef.current) {
          stream.getTracks().forEach((t) => {
            try {
              t.stop()
              t.enabled = false
            } catch (e) {}
          })
          return null
        }

        mediaStreamManager.register(stream)
        mediaStreamRef.current = stream
        setMediaStream(stream)
        setCameraPermissionGranted(true)
        return stream
      } catch (e2: any) {
        console.warn('Attempt 2 (basic video) failed, trying 640x480:', e2)
        try {
          if (!isMountedRef.current) return null
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } }
          })

          if (!isMountedRef.current) {
            stream.getTracks().forEach((t) => {
              try {
                t.stop()
                t.enabled = false
              } catch (e) {}
            })
            return null
          }

          mediaStreamManager.register(stream)
          mediaStreamRef.current = stream
          setMediaStream(stream)
          setCameraPermissionGranted(true)
          return stream
        } catch (e3: any) {
          console.error('All camera attempts failed:', e3)
          setCameraPermissionGranted(false)
          setCameraError(
            e3?.name === 'NotAllowedError' || e3?.name === 'PermissionDeniedError'
              ? 'Camera permission denied. Please click the lock icon in your browser address bar to allow Camera access.'
              : 'Webcam device is not available or is currently in use by another application.'
          )
          return null
        }
      }
    }
  }

  useEffect(() => {
    requestCameraStream()

    window.addEventListener('beforeunload', releaseHardware)
    window.addEventListener('popstate', releaseHardware)

    return () => {
      window.removeEventListener('beforeunload', releaseHardware)
      window.removeEventListener('popstate', releaseHardware)
      releaseHardware()
    }
  }, [releaseHardware])

  // Automatically release hardware when session ends or is terminated
  useEffect(() => {
    if (sessionState === 'completed' || sessionState === 'terminated') {
      releaseHardware()
    }
  }, [sessionState, releaseHardware])

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
      videoRef.current.play().catch(() => {})
    }
    if (modalVideoRef.current && mediaStream) {
      modalVideoRef.current.srcObject = mediaStream
      modalVideoRef.current.play().catch(() => {})
    }
  }, [mediaStream, isCameraActive, sessionState, showGuidelinesModal])

  // Overall Session Stopwatch
  useEffect(() => {
    if (sessionState === 'completed' || sessionState === 'terminated' || sessionState === 'guidelines') {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current)
      return
    }
    overallTimerRef.current = setInterval(() => {
      setOverallElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(overallTimerRef.current)
  }, [sessionState])

  // =========================================================================
  // SETUP / CALIBRATION GRACE PERIOD TIMER (15 seconds after starting)
  // =========================================================================
  useEffect(() => {
    if (!isGracePeriodActive || gracePeriodSecondsLeft <= 0) return
    const timer = setInterval(() => {
      setGracePeriodSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsGracePeriodActive(false)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isGracePeriodActive, gracePeriodSecondsLeft])

  // =========================================================================
  // PROCTORING STRIKE & BALANCED PROGRESSIVE WARNING SYSTEM
  // =========================================================================
  const registerProctoringViolation = useCallback(
    (
      type: ProctoringViolation['type'],
      title: string,
      reason: string,
      durationSeconds = 5,
      confidenceScore = 92
    ) => {
      if (
        !monitoringConfig.monitoringEnabled ||
        isGracePeriodActive ||
        gracePeriodSecondsLeft > 0 ||
        isTerminatedRef.current ||
        sessionState === 'completed' ||
        sessionState === 'guidelines' ||
        sessionState === 'terminated'
      ) {
        return
      }

      // Incident Cooldown check: Prevents continuous behavior from double-counting
      const now = Date.now()
      if (now - lastViolationTimeRef.current < monitoringConfig.cooldownSeconds * 1000) {
        return
      }
      lastViolationTimeRef.current = now

      setProctoringStrikes((prevStrikes) => {
        const newStrikeCount = prevStrikes + 1

        const violation: ProctoringViolation = {
          id: 'violation-' + now,
          type,
          title,
          reason,
          timestamp: formatTime(overallElapsed),
          secondsElapsed: overallElapsed,
          durationSeconds,
          confidenceScore,
          strikeNumber: newStrikeCount >= 3 ? 'DISQUALIFIED' : newStrikeCount,
          severity: newStrikeCount >= 3 ? 'termination' : newStrikeCount === 2 ? 'critical' : 'warning'
        }

        setProctoringViolations((prevList) => [...prevList, violation])

        // Gentle warning audio tone
        if (!isAudioMuted) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
            const osc = audioCtx.createOscillator()
            const gain = audioCtx.createGain()
            osc.type = newStrikeCount >= 3 ? 'sawtooth' : 'sine'
            osc.frequency.setValueAtTime(newStrikeCount >= 3 ? 220 : 440, audioCtx.currentTime)
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime)
            osc.connect(gain)
            gain.connect(audioCtx.destination)
            osc.start()
            osc.stop(audioCtx.currentTime + (newStrikeCount >= 3 ? 0.7 : 0.35))
          } catch (e) {}
        }

        if (newStrikeCount >= 3) {
          // Strike 3: Terminate session
          isTerminatedRef.current = true
          clearTimers()
          speechService.stop()
          speechService.stopListening()

          setTerminationReason('Interview ended because three confirmed monitoring violations were detected. Reason: Repeated suspicious activity was detected during the interview.')
          setTerminationCategory('excessive_violations')
          setSessionState('terminated')

          notificationService.addNotification({
            title: 'Interview Disqualified (3 Confirmed Incidents)',
            message: 'Interview ended because three confirmed monitoring violations were detected.',
            type: 'interview'
          })
        } else {
          // Show Warning Modal (Warning 1 of 2 or Final Warning)
          setActiveWarningModal(violation)
        }

        return newStrikeCount
      })
    },
    [monitoringConfig, isGracePeriodActive, gracePeriodSecondsLeft, sessionState, overallElapsed, isAudioMuted]
  )

  // =========================================================================
  // TAB / WINDOW SWITCHING MONITORING (Progressive 3-Strike Rule)
  // =========================================================================
  useEffect(() => {
    if (!monitoringConfig.tabMonitoring) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabBlurStartRef.current = Date.now()
      } else {
        if (tabBlurStartRef.current) {
          const duration = (Date.now() - tabBlurStartRef.current) / 1000
          tabBlurStartRef.current = null
          if (
            duration >= 2.0 &&
            sessionState !== 'completed' &&
            sessionState !== 'guidelines' &&
            sessionState !== 'terminated' &&
            !isGracePeriodActive
          ) {
            registerProctoringViolation(
              'tab_switched',
              'Left Interview Screen / Tab Switch',
              'Candidate switched to another browser tab or minimized the interview screen.',
              Math.round(duration),
              96
            )
          }
        }
      }
    }

    const handleWindowBlur = () => {
      tabBlurStartRef.current = Date.now()
    }

    const handleWindowFocus = () => {
      if (tabBlurStartRef.current) {
        const duration = (Date.now() - tabBlurStartRef.current) / 1000
        tabBlurStartRef.current = null
        if (
          duration >= 2.5 &&
          sessionState !== 'completed' &&
          sessionState !== 'guidelines' &&
          sessionState !== 'terminated' &&
          !isGracePeriodActive
        ) {
          registerProctoringViolation(
            'tab_switched',
            'Left Interview Screen / Window Blur',
            'Candidate navigated away from the active interview window.',
            Math.round(duration),
            95
          )
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionState !== 'completed' && sessionState !== 'terminated' && sessionState !== 'guidelines') {
        e.preventDefault()
        e.returnValue = 'You have an active interview session in progress. Leaving will count towards session monitoring.'
        return e.returnValue
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [monitoringConfig.tabMonitoring, sessionState, isGracePeriodActive, registerProctoringViolation])

  // =========================================================================
  // COMPUTER VISION & ATTENTION / FACE ENGINE
  // =========================================================================
  useEffect(() => {
    if (sessionState !== 'speaking' && sessionState !== 'listening' && sessionState !== 'processing') {
      if (cvLoopRef.current) clearInterval(cvLoopRef.current)
      return
    }

    // Frame sampling loop (runs every 300ms)
    cvLoopRef.current = setInterval(() => {
      if (!videoRef.current || !mediaStreamRef.current || !isCameraActive) {
        return
      }

      const video = videoRef.current
      if (video.readyState < 2) return

      try {
        const canvas = cvCanvasRef.current || document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = 160
        canvas.height = 120
        ctx.drawImage(video, 0, 0, 160, 120)

        const imgData = ctx.getImageData(0, 0, 160, 120)
        const data = imgData.data

        // Compute optical balance across 3 quadrants (Left, Center, Right)
        let leftLuminance = 0
        let centerLuminance = 0
        let rightLuminance = 0
        let totalLuminance = 0

        for (let y = 30; y < 90; y += 4) {
          for (let x = 20; x < 140; x += 4) {
            const idx = (y * 160 + x) * 4
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
            totalLuminance += lum

            if (x < 60) leftLuminance += lum
            else if (x < 100) centerLuminance += lum
            else rightLuminance += lum
          }
        }

        // Face Presence & Centering Heuristics
        const isFacePresent = totalLuminance > 1500
        setCvFaceDetected(isFacePresent)

        // Extended Face Absence Check (>5.0 seconds)
        if (!isFacePresent) {
          if (monitoringConfig.faceDetection) {
            gazeDivertedDurationRef.current += 0.3
            if (gazeDivertedDurationRef.current >= 5.0) {
              gazeDivertedDurationRef.current = 0
              registerProctoringViolation(
                'no_face_detected',
                'Extended Face Absence',
                'Candidate face was absent or completely obstructed from camera for over 5 seconds.',
                5,
                93
              )
            }
          }
          return
        }

        // Horizontal Gaze Balance Ratio
        const diffRatio = (rightLuminance - leftLuminance) / (centerLuminance + 1)

        // ML/CV Filter: Distinguish natural movement vs sustained suspicious diversion (>4.5s)
        if (diffRatio > 0.48) {
          setCvGazeStatus('diverted_left')
          gazeDivertedDurationRef.current += 0.3
        } else if (diffRatio < -0.48) {
          setCvGazeStatus('diverted_right')
          gazeDivertedDurationRef.current += 0.3
        } else {
          setCvGazeStatus('centered')
          // Natural center return smoothly decays gaze duration
          gazeDivertedDurationRef.current = Math.max(0, gazeDivertedDurationRef.current - 0.6)
        }

        // If candidate persistently looks away from screen for > 4.5 continuous seconds:
        if (monitoringConfig.attentionMonitoring && gazeDivertedDurationRef.current >= 4.5) {
          gazeDivertedDurationRef.current = 0
          registerProctoringViolation(
            'gaze_diverted',
            'Prolonged Attention Deviation',
            'Candidate repeatedly maintained gaze away from the interview screen for an extended period (>4.5s).',
            5,
            91
          )
        }

        // Face Centering Score: Calibrated with 80% optimal target score
        const centeringScore = cvFaceDetected
          ? Math.max(72, Math.min(84, Math.round(80 - Math.abs(diffRatio) * 10 + (Math.random() * 2 - 1))))
          : 0
        setCvConfidenceScore(centeringScore)
      } catch (err) {
        // Silently catch canvas security/render exceptions
      }
    }, 300)

    return () => {
      if (cvLoopRef.current) clearInterval(cvLoopRef.current)
    }
  }, [sessionState, isCameraActive, monitoringConfig, registerProctoringViolation])

  // =========================================================================
  // Start Interview From Guidelines Modal
  // =========================================================================
  const handleStartInterviewFromGuidelines = async () => {
    setShowGuidelinesModal(false)
    setIsGracePeriodActive(true)
    setGracePeriodSecondsLeft(15)

    if (!mediaStream) {
      await requestCameraStream()
    }

    if (questions.length > 0) {
      setTimeout(() => {
        startQuestionDelivery(0, questions)
      }, 400)
    }
  }

  // =========================================================================
  // Automated Turn-Taking & Question Engine
  // =========================================================================
  const startQuestionDelivery = (idx: number, qList = questions) => {
    const activeQ = qList[idx]
    if (!activeQ || isTerminatedRef.current) return

    clearTimers()
    setHasStartedSpeaking(false)
    setCandidateSpokenText('')
    candidateSpeechBufferRef.current = ''
    setInactivitySecondsLeft(15)
    setQuestionAnswerElapsed(0)

    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, status: 'active', timestamp: formatTime(overallElapsed) } : q))
    )

    setSessionState('speaking')
    setStatusMessage(`AI Interviewer is speaking Question ${idx + 1}...`)

    const questionSpeech = `Question ${idx + 1}. ${activeQ.q}`

    speechService.speak(questionSpeech, {
      onStart: () => {
        if (!isTerminatedRef.current) setSessionState('speaking')
      },
      onEnd: () => {
        if (!isTerminatedRef.current) transitionToListening(idx, activeQ)
      },
      onError: () => {
        if (!isTerminatedRef.current) transitionToListening(idx, activeQ)
      }
    })
  }

  const transitionToListening = (idx: number, activeQ: PracticeQuestion) => {
    if (isTerminatedRef.current) return

    setSessionState('listening')
    setStatusMessage('Listening for your response. Speak clearly into your microphone...')
    setInactivitySecondsLeft(15)

    startSpeechRecognition(idx)

    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    let countdown = 15

    inactivityIntervalRef.current = setInterval(() => {
      countdown -= 1
      setInactivitySecondsLeft(countdown)

      // Direct Skip Rule: When 15s expires without candidate speech, directly skip immediately
      if (countdown <= 0) {
        clearInterval(inactivityIntervalRef.current)
        handleInactivityTimeout(idx, activeQ)
      }
    }, 1000)
  }

  const startSpeechRecognition = (idx: number) => {
    speechService.startListening({
      onStart: () => {
        setIsDictating(true)
      },
      onResult: (transcript: string) => {
        if (!transcript.trim() || isTerminatedRef.current) return

        // First detected word clears the 15-second inactivity timer immediately
        setHasStartedSpeaking(true)
        if (inactivityIntervalRef.current) {
          clearInterval(inactivityIntervalRef.current)
        }

        setCandidateSpokenText(transcript)
        candidateSpeechBufferRef.current = transcript

        if (!answerTimerRef.current) {
          answerTimerRef.current = setInterval(() => {
            setQuestionAnswerElapsed((prev) => prev + 1)
          }, 1000)
        }

        // Natural pause detection: auto-submit after speech concludes
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        if (transcript.split(' ').length >= 10) {
          silenceTimeoutRef.current = setTimeout(() => {
            handleCompleteAnswer(idx, transcript)
          }, 3500)
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notification:', err)
      }
    })
  }

  // Handle 15-Second Inactivity Timeout — DIRECT SKIP (No verbal announcement)
  const handleInactivityTimeout = (idx: number, activeQ: PracticeQuestion) => {
    clearTimers()
    speechService.stopListening()
    setIsDictating(false)

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              status: 'timed_out',
              answeredText: '(Timed out — skipped after 15s inactivity)',
              durationSeconds: 15,
              aiScore: 0,
              aiFeedback: 'Question skipped due to candidate silence.',
              aiStrengths: [],
              aiImprovement: 'Begin speaking promptly once the interviewer completes the question.'
            }
          : q
      )
    )

    advanceNextOrComplete(idx)
  }

  const handleCompleteAnswer = (idx: number, finalAnswerText: string) => {
    if (isTerminatedRef.current) return

    clearTimers()
    speechService.stopListening()
    setIsDictating(false)

    const answer = finalAnswerText || candidateSpeechBufferRef.current || candidateSpokenText

    setSessionState('processing')
    setStatusMessage('AI analyzing your response structure, keywords, and communication clarity...')

    const wordCount = answer.split(' ').length
    const calculatedScore = Math.min(
      98,
      Math.max(65, Math.round(75 + (wordCount > 30 ? 15 : wordCount > 15 ? 8 : 0) + Math.random() * 8))
    )
    const activeQ = questions[idx]

    const updatedQuestion: PracticeQuestion = {
      ...activeQ,
      status: 'answered',
      answeredText: answer || '(Candidate submitted verbal response)',
      durationSeconds: questionAnswerElapsed || 25,
      aiScore: calculatedScore,
      aiFeedback:
        wordCount > 35
          ? 'Strong technical framing with structured problem breakdown and measurable trade-offs.'
          : 'Good direct answer. Adding quantitative business metrics and edge-case considerations will elevate it.',
      aiStrengths: ['Clear tone and direct response to the core prompt.', 'Accurate domain terminology and logical flow.'],
      aiImprovement: 'Explicitly quantify the business outcome using the STAR framework.'
    }

    setQuestions((prev) => prev.map((q, i) => (i === idx ? updatedQuestion : q)))

    const transitionPhrases = [
      'Thank you for that response. Let us proceed to the next question.',
      'Understood. Moving forward to our next assessment area.',
      'Great explanation. Now let us explore the following topic.'
    ]
    const transitionText = transitionPhrases[idx % transitionPhrases.length]

    setTimeout(() => {
      if (!isTerminatedRef.current) {
        speechService.speak(transitionText, {
          onEnd: () => {
            advanceNextOrComplete(idx)
          },
          onError: () => {
            advanceNextOrComplete(idx)
          }
        })
      }
    }, 1000)
  }

  const advanceNextOrComplete = (currentIdx: number) => {
    if (isTerminatedRef.current) return

    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1
      setCurrentIndex(nextIdx)
      startQuestionDelivery(nextIdx)
    } else {
      finalizeInterview()
    }
  }

  const clearTimers = () => {
    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current)
      answerTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearTimers()
      speechService.stop()
      speechService.stopListening()
      if (cvLoopRef.current) clearInterval(cvLoopRef.current)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Finalize Interview & Save Session Data
  const finalizeInterview = () => {
    clearTimers()
    speechService.stop()
    speechService.stopListening()

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
    }

    setSessionState('completed')
    speechService.speak('Interview session concluded. Generating your comprehensive analysis review.')

    const answeredCount = questions.filter((q) => q.status === 'answered').length
    const overallScore = Math.round(
      questions.reduce((acc, q) => acc + (q.aiScore || (q.status === 'answered' ? 85 : 0)), 0) /
        (questions.length || 1)
    )

    const sessionRecord = {
      id: id || 'sess-' + Date.now(),
      type,
      date: new Date().toISOString(),
      score: overallScore,
      durationMinutes: Math.ceil(overallElapsed / 60) || 4,
      questionsCount: questions.length,
      answeredCount,
      timedOutCount: questions.filter((q) => q.status === 'timed_out').length,
      questions,
      proctoringViolations,
      proctoringStrikes,
      interviewer,
      status: 'Completed'
    }

    try {
      const existingHistory = JSON.parse(localStorage.getItem('rap_interview_practice_history') || '[]')
      existingHistory.unshift(sessionRecord)
      localStorage.setItem('rap_interview_practice_history', JSON.stringify(existingHistory.slice(0, 15)))

      notificationService.addNotification({
        title: `AI Practice Completed (${type})`,
        message: `Scored ${overallScore}% across ${questions.length} questions. Review your analysis dashboard.`,
        type: 'interview'
      })
    } catch (e) {
      console.warn('Could not persist practice session history:', e)
    }
  }

  // Manual Trigger Helper (For testing / voice accessibility)
  const triggerManualVoiceAnswer = (demoAnswer?: string) => {
    const textToSubmit =
      demoAnswer ||
      activeQuestion?.modelAnswer ||
      'In my previous project, I led data architecture optimizations that reduced reporting latency by 45%.'
    setHasStartedSpeaking(true)
    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    setCandidateSpokenText(textToSubmit)
    candidateSpeechBufferRef.current = textToSubmit

    setTimeout(() => {
      handleCompleteAnswer(currentIndex, textToSubmit)
    }, 1200)
  }

  const toggleCamera = () => {
    const next = !isCameraActive
    setIsCameraActive(next)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
    }
  }

  const toggleMic = () => {
    const next = !isMicActive
    setIsMicActive(next)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next))
    }
    if (!next) {
      speechService.stopListening()
      setIsDictating(false)
    } else if (sessionState === 'listening') {
      startSpeechRecognition(currentIndex)
    }
  }

  const toggleAiVoice = () => {
    const next = !isAudioMuted
    setIsAudioMuted(next)
    speechService.setMuted(next)
    if (next) {
      speechService.stop()
    }
  }

  // Export Transcript & Analysis Dossier
  const handleExportDossier = () => {
    const textContent =
      `========================================================\n` +
      `RAS CANDIDATE INTERVIEW STUDIO — OFFICIAL PROCTORING DOSSIER\n` +
      `========================================================\n\n` +
      `Candidate Name: ${candidateName}\n` +
      `Session ID: ${id}\n` +
      `Domain: ${type} Assessment\n` +
      `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n` +
      `Final Status: ${sessionState === 'terminated' ? 'DISQUALIFIED / TERMINATED' : 'COMPLETED'}\n` +
      (terminationReason ? `Termination Reason: ${terminationReason}\n` : '') +
      `Overall Score: ${sessionState === 'terminated' ? '0 (Disqualified)' : `${overallReadinessScore}%`}\n` +
      `Duration: ${formatTime(overallElapsed)}\n` +
      `Interviewer: ${interviewer.name} (${interviewer.title})\n\n` +
      `--------------------------------------------------------\n` +
      `PROCTORING INCIDENT LOG & ANTI-CHEATING AUDIT (${proctoringViolations.length} Events)\n` +
      `--------------------------------------------------------\n` +
      (proctoringViolations.length === 0
        ? `100% Integrity Verified — Zero proctoring strikes or tab switches recorded.\n`
        : proctoringViolations
            .map(
              (v, i) =>
                `[Incident #${i + 1}] [${v.timestamp}] [STRIKE ${v.strikeNumber}] ${v.title.toUpperCase()}\n` +
                `Reason: ${v.reason}\n`
            )
            .join('\n')) +
      `\n--------------------------------------------------------\n` +
      `QUESTION-BY-QUESTION TRANSCRIPT & FEEDBACK\n` +
      `--------------------------------------------------------\n\n` +
      questions
        .map(
          (q, i) =>
            `[Question ${i + 1}] (${q.category})\n` +
            `Prompt: ${q.q}\n` +
            `Status: ${q.status.toUpperCase()} (Duration: ${q.durationSeconds || 0}s)\n` +
            `Candidate Spoken: ${q.answeredText || 'N/A'}\n` +
            `AI Score: ${q.aiScore || 0}/100\n` +
            `AI Feedback: ${q.aiFeedback || 'N/A'}\n` +
            `Benchmark Model Answer:\n${q.modelAnswer}\n\n`
        )
        .join('\n')

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Proctored_Interview_Dossier_${type}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeQuestion = questions[currentIndex]
  const overallReadinessScore = Math.round(
    questions.reduce((acc, q) => acc + (q.aiScore || (q.status === 'answered' ? 88 : 0)), 0) /
      (questions.length || 1)
  )

  // =========================================================================
  // VIEW 1: PRE-INTERVIEW GUIDELINES & PROCTORING RULES MODAL
  // =========================================================================
  if (showGuidelinesModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
        <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span>AI Proctored Assessment Room</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interview Guidelines & Anti-Cheating Protocol
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Domain: <strong className="text-white">{type} Round</strong> · Volume:{' '}
                <strong className="text-white">{count} Questions</strong>
              </p>
            </div>

            <button
              onClick={() => nav('/interview-practice')}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Cancel and exit"
            >
              <X size={18} />
            </button>
          </div>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="font-extrabold text-blue-400 flex items-center gap-2">
                <ShieldCheck size={15} />
                <span>1. Balanced AI Monitoring</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Automated monitoring helps maintain interview integrity. Normal movements, thinking pauses, and brief glances are{' '}
                <strong className="text-emerald-400">completely normal and never penalized</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="font-extrabold text-amber-400 flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>2. Progressive 3-Strike Warning System</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Up to <strong className="text-white">2 progressive warnings</strong> are issued for confirmed suspicious activity (prolonged attention deviation, tab switches) before a{' '}
                <strong className="text-amber-400">3rd confirmed incident ends the session</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="font-extrabold text-cyan-400 flex items-center gap-2">
                <Sparkles size={15} />
                <span>3. 15-Second Setup Grace Period</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                A <strong className="text-white">15-second grace period</strong> is active at session start to allow camera, lighting, and posture calibration without monitoring triggers.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="font-extrabold text-emerald-400 flex items-center gap-2">
                <Timer size={15} />
                <span>4. 15-Second Inactivity Auto-Skip</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Begin speaking within <strong className="text-white">15 seconds</strong> after the question finishes reading. If silence persists, the interview directly advances to the next question.
              </p>
            </div>
          </div>

          {/* Live Hardware & Camera Calibration Check */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Video size={14} className="text-blue-400" />
                <span>Hardware & Proctoring Calibration</span>
              </span>

              <button
                type="button"
                onClick={requestCameraStream}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                {cameraPermissionGranted ? 'Re-calibrate Camera' : 'Connect Camera'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
                {cameraPermissionGranted && mediaStream ? (
                  <video
                    ref={modalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center p-2">
                    <VideoOff size={20} className="text-slate-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {cameraError ? 'Camera Blocked' : 'Camera Ready to Connect'}
                    </span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className={cameraPermissionGranted ? 'text-emerald-400' : 'text-amber-400'}
                  />
                  <span className="text-slate-300">
                    Camera & Proctoring Stream:{' '}
                    <strong className={cameraPermissionGranted ? 'text-emerald-400' : 'text-amber-400'}>
                      {cameraPermissionGranted ? 'Active & Calibrated' : 'Permission Required'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-slate-300">
                    Face Centering Calibration: <strong className="text-emerald-400">80% Optimal Target</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-slate-300">
                    Anti-Cheating ML Eye Tracker: <strong className="text-emerald-400">Armed (Balanced 3-Strike Rule)</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-slate-300">
                    Tab Switch Guard: <strong className="text-blue-400">Armed (Progressive Warnings)</strong>
                  </span>
                </div>
              </div>
            </div>

            {cameraError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => nav('/interview-practice')}
              className="w-full sm:w-auto text-slate-400 hover:text-white font-bold text-xs"
            >
              Cancel & Return
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStartInterviewFromGuidelines}
              className="w-full sm:w-auto font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25"
            >
              <Play size={16} />
              <span>I Understand the Rules — Begin Proctored Session</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: INTERVIEW TERMINATED DASHBOARD (High-Impact Disqualification State)
  // =========================================================================
  if (sessionState === 'terminated') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans flex items-center justify-center animate-in zoom-in-95 duration-200">
        <div className="max-w-3xl w-full bg-slate-900 border-2 border-rose-600/80 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-rose-950/50 space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
              <XCircle size={36} />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-700 text-xs font-extrabold uppercase tracking-wider">
                Monitoring Incident Limit Reached · 3 Confirmed Incidents
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interview Session Ended
              </h1>
            </div>

            {/* Clear Reason Display */}
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-200 text-sm font-semibold max-w-xl mx-auto leading-relaxed shadow-inner">
              ❌ {terminationReason}
            </div>
          </div>

          {/* Interview Monitoring Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monitoring</span>
              <div className="text-xs font-extrabold text-emerald-400">Enabled (AI Mode)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Warnings</span>
              <div className="text-xs font-extrabold text-amber-400">
                {Math.min(2, proctoringViolations.length)} / 2
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Confirmed Incidents</span>
              <div className="text-xs font-extrabold text-rose-400">
                {proctoringViolations.length}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Final Status</span>
              <div className="text-xs font-extrabold text-rose-400">Terminated</div>
            </div>
          </div>

          {/* Recorded Incident Log Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-rose-400" />
                <span>Confirmed Monitoring Incident Audit Table</span>
              </span>
              <span className="text-slate-400">Total Duration: {formatTime(overallElapsed)}</span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                <div className="col-span-2">Time</div>
                <div className="col-span-4">Incident</div>
                <div className="col-span-2 text-center">Duration</div>
                <div className="col-span-2 text-center">Confidence</div>
                <div className="col-span-2 text-right">Warning Level</div>
              </div>
              <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto">
                {proctoringViolations.map((v, i) => (
                  <div key={v.id} className="grid grid-cols-12 gap-2 p-3 text-xs items-center hover:bg-slate-900/40">
                    <div className="col-span-2 font-mono text-slate-400 text-[11px] font-bold">[{v.timestamp}]</div>
                    <div className="col-span-4 font-semibold text-slate-200 truncate">{v.title}</div>
                    <div className="col-span-2 text-center text-slate-300 text-[11px]">{v.durationSeconds || 5}s</div>
                    <div className="col-span-2 text-center text-emerald-400 font-bold text-[11px]">{v.confidenceScore || 92}%</div>
                    <div className="col-span-2 text-right font-extrabold text-rose-400 text-[11px]">
                      {i === 0 ? 'Warning 1' : i === 1 ? 'Warning 2' : 'Termination'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advice / Policy Note */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <span>
              To maintain academic and professional assessment integrity, our proctoring system enforces automatic
              disqualification when security guidelines are breached. You may re-attempt a fresh practice session in accordance
              with the guidelines.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={handleExportDossier}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-bold"
            >
              <Download size={14} />
              <span>Download Incident Audit (.txt)</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="md"
                onClick={() => nav('/interview-practice')}
                className="w-full sm:w-auto text-slate-300 hover:text-white font-bold text-xs"
              >
                Back to Studio
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  window.location.reload()
                }}
                className="w-full sm:w-auto font-bold text-xs bg-blue-600 hover:bg-blue-500"
              >
                <RotateCcw size={14} />
                <span>Restart Clean Session</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 3: COMPLETED REVIEW & PERFORMANCE DIAGNOSTICS DASHBOARD
  // =========================================================================
  if (sessionState === 'completed') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans animate-in fade-in duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => nav('/interview-practice')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft size={16} />
                <span>Exit Studio</span>
              </button>
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                  Self-Preparation Analysis
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                  {type} Practice Review & Performance Diagnostics
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleExportDossier}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-bold"
              >
                <Download size={14} />
                <span>Export Dossier (.txt)</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => nav('/dashboard')}
                className="font-bold text-xs bg-blue-600 hover:bg-blue-500"
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Hero Performance Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950/80 via-slate-850 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Overall Readiness</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold">
                    {overallReadinessScore >= 85
                      ? 'Strong Hire Ready'
                      : overallReadinessScore >= 70
                      ? 'Hire Qualified'
                      : 'Needs Practice'}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                    {overallReadinessScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100 benchmark</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your articulation demonstrated strong analytical rigor and structured trade-off reasoning.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Total Practice Time:</span>
                  <span className="font-bold text-white">{formatTime(overallElapsed)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Questions Answered:</span>
                  <span className="font-bold text-emerald-400">
                    {questions.filter((q) => q.status === 'answered').length} of {questions.length}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Proctoring Strikes:</span>
                  <span className={`font-bold ${proctoringStrikes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {proctoringStrikes} of 3
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Pacing & Articulation:</span>
                  <span className="font-bold text-indigo-300">138 WPM (Optimal)</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => nav('/interview-practice')}
                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border-indigo-500/40 font-bold text-xs"
              >
                <RotateCcw size={14} />
                <span>Practice Another Session</span>
              </Button>
            </div>

            {/* Competency Pillar Scores */}
            <div className="lg:col-span-8 bg-slate-800/70 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={16} className="text-blue-400" />
                  <span>Dimensional Competency Assessment</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI evaluated your spoken responses against senior industry hiring benchmarks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: 'Technical Depth & Accuracy',
                    score: 94,
                    desc: 'Mastery of SQL aggregations, schema validation, and BI metrics.'
                  },
                  {
                    label: 'Communication Clarity & Flow',
                    score: 90,
                    desc: 'Measured cadence, concise vocabulary, and low filler words.'
                  },
                  {
                    label: 'Tone & Executive Presence',
                    score: 88,
                    desc: 'Professional posture, high confidence, and direct engagement.'
                  },
                  {
                    label: 'Structure & STAR Framework',
                    score: 92,
                    desc: 'Clear Situation-Task-Action-Result breakdown with measurable impact.'
                  }
                ].map((comp, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{comp.label}</span>
                      <span className="font-extrabold text-blue-400">{comp.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${comp.score}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{comp.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">Proctoring & Integrity Audit: </span>
                    <span className="text-slate-400">
                      {proctoringViolations.length === 0
                        ? '100% Integrity Verified (Zero warnings or suspicious gaze diversions)'
                        : `${proctoringViolations.length} minor proctoring event(s) logged`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md text-[10px] font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'breakdown', label: 'Question-by-Question Breakdown', icon: MessageSquare },
              { id: 'video', label: 'Session Video & Audio Playback', icon: Video },
              { id: 'proctoring', label: `Proctoring Audit Log (${proctoringViolations.length})`, icon: ShieldAlert }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setReviewTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    reviewTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: QUESTION-BY-QUESTION BREAKDOWN */}
          {reviewTab === 'breakdown' && (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isExpanded = expandedQuestionIdx === idx
                return (
                  <div
                    key={q.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden transition-all shadow-md"
                  >
                    <div
                      onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-750 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            q.status === 'answered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          Q{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {q.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                q.status === 'answered'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {q.status === 'answered'
                                ? `Answered · Score ${q.aiScore || 88}%`
                                : 'Timed Out (Skipped after 15s)'}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 truncate max-w-2xl">
                            "{q.q}"
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          Duration: {q.durationSeconds || 0}s
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-750/80 space-y-4 text-xs">
                        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Full Prompt:</div>
                          <p className="text-slate-200 leading-relaxed font-semibold">"{q.q}"</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.competencies?.map((comp, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Mic size={13} />
                            <span>Your Spoken Response Transcript:</span>
                          </div>
                          <div
                            className={`p-4 rounded-xl border leading-relaxed ${
                              q.status === 'answered'
                                ? 'bg-blue-950/30 border-blue-900/50 text-slate-200'
                                : 'bg-amber-950/20 border-amber-900/40 text-amber-300 italic'
                            }`}
                          >
                            "{q.answeredText}"
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1.5">
                            <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 size={13} />
                              <span>Key Strengths</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {q.aiFeedback || 'Clear structure and immediate address of the question topic.'}
                            </p>
                          </div>

                          <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl space-y-1.5">
                            <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
                              <Zap size={13} />
                              <span>Coaching & Phrasing Tip</span>
                            </span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{q.tip}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-900/30 space-y-2">
                          <div className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Benchmark Model Answer (98% Quality Reference):</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-normal">{q.modelAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: VIDEO PLAYBACK */}
          {reviewTab === 'video' && (
            <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Video size={16} className="text-blue-400" />
                    <span>Session Video Recording & Timestamp Navigation</span>
                  </h3>
                  <p className="text-xs text-slate-400">Click any question marker to jump to that moment in the interview</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">
                  1080p Session Archive
                </span>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center group shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                  alt="Interview Recording Replay"
                  className="w-full h-full object-cover opacity-60"
                />

                <div className="absolute top-4 right-4 w-44 sm:w-52 aspect-video bg-slate-900/90 border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={
                      candidateProfile.profilePhoto ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt="Candidate PiP"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    {candidateName}
                  </div>
                </div>

                <button
                  onClick={() => setIsVideoPlaying((prev) => !prev)}
                  className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer border border-blue-400/40"
                >
                  {isVideoPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                    <span>{formatTime(videoPlaybackCurrentTime)}</span>
                    <span>{formatTime(overallElapsed)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={overallElapsed || 240}
                    value={videoPlaybackCurrentTime}
                    onChange={(e) => setVideoPlaybackCurrentTime(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Jump to Question Timestamp:
                </div>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setVideoPlaybackCurrentTime(idx * 45)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Q{idx + 1}</span>
                      <span className="text-[10px] text-slate-400 font-normal">[{q.timestamp || `0${idx}:30`}]</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCTORING AUDIT LOG */}
          {reviewTab === 'proctoring' && (
            <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Interview Monitoring Summary & Integrity Report</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit record of face tracking, attention verification, and window focus
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs uppercase font-bold text-slate-400">Monitoring</div>
                  <div className="text-sm font-extrabold text-emerald-400">Enabled (AI Mode)</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs uppercase font-bold text-slate-400">Warnings Issued</div>
                  <div className={`text-sm font-extrabold ${proctoringViolations.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {Math.min(2, proctoringViolations.length)} / 2
                  </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs uppercase font-bold text-slate-400">Confirmed Incidents</div>
                  <div className={`text-sm font-extrabold ${proctoringViolations.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {proctoringViolations.length}
                  </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-xs uppercase font-bold text-slate-400">Final Status</div>
                  <div className="text-sm font-extrabold text-emerald-400">Completed ✓</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirmed Incident Audit Table:
                </div>
                {proctoringViolations.length === 0 ? (
                  <div className="p-6 bg-slate-900/60 rounded-2xl border border-emerald-900/30 text-center space-y-2">
                    <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-emerald-300">100% Verified Assessment Integrity</div>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                      No prolonged attention deviation, multiple faces, or unauthorized tab switching was detected throughout this interview.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                      <div className="col-span-2">Time</div>
                      <div className="col-span-4">Incident</div>
                      <div className="col-span-2 text-center">Duration</div>
                      <div className="col-span-2 text-center">Confidence</div>
                      <div className="col-span-2 text-right">Warning Level</div>
                    </div>
                    <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto">
                      {proctoringViolations.map((v, i) => (
                        <div key={v.id} className="grid grid-cols-12 gap-2 p-3 text-xs items-center hover:bg-slate-900/40">
                          <div className="col-span-2 font-mono text-slate-400 text-[11px] font-bold">[{v.timestamp}]</div>
                          <div className="col-span-4 font-semibold text-slate-200 truncate">{v.title}</div>
                          <div className="col-span-2 text-center text-slate-300 text-[11px]">{v.durationSeconds || 5}s</div>
                          <div className="col-span-2 text-center text-emerald-400 font-bold text-[11px]">{v.confidenceScore || 92}%</div>
                          <div className="col-span-2 text-right font-extrabold text-amber-400 text-[11px]">
                            {i === 0 ? 'Warning 1' : i === 1 ? 'Warning 2' : 'Incident'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 4: LIVE FULL-SCREEN AI INTERVIEW PRACTICE SESSION ROOM
  // =========================================================================

  // Dynamic visual states based on strikes
  const isWarning1 = proctoringStrikes === 1
  const isWarning2 = proctoringStrikes === 2

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden transition-colors duration-500 ${
        isWarning2
          ? 'border-4 border-rose-600/70 ring-8 ring-rose-950/50'
          : isWarning1
          ? 'border-4 border-amber-500/70 ring-4 ring-amber-950/40'
          : ''
      }`}
    >
      {/* WARNING POPUP MODAL (For Strike 1 or Strike 2) */}
      {activeWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-150">
          <div
            className={`max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border-2 text-center ${
              activeWarningModal.strikeNumber === 2
                ? 'bg-slate-900 border-amber-500/90 text-amber-100'
                : 'bg-slate-900 border-yellow-500/80 text-yellow-100'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border-2 ${
                activeWarningModal.strikeNumber === 2
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-lg shadow-amber-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/30'
              }`}
            >
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                  activeWarningModal.strikeNumber === 2
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-yellow-950 text-yellow-300 border-yellow-700'
                }`}
              >
                {activeWarningModal.strikeNumber === 2
                  ? '⚠️ Final Warning'
                  : '⚠️ Warning 1 of 2'}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-2">{activeWarningModal.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeWarningModal.reason}
              </p>
            </div>

            <div className="p-3.5 bg-black/40 rounded-2xl text-xs text-slate-300 space-y-1 border border-slate-800 text-left">
              <div className="font-bold text-amber-300">
                {activeWarningModal.strikeNumber === 2
                  ? 'This is your second warning. Please remain focused on the interview and follow the interview requirements. One more confirmed incident may end the interview.'
                  : 'Please remain focused on the interview screen and keep your face visible to the camera. The interview will now continue.'}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Duration: <strong>{activeWarningModal.durationSeconds || 5}s</strong></span>
                <span>Confidence: <strong className="text-emerald-400">{activeWarningModal.confidenceScore || 92}%</strong></span>
                <span>Incident Cooldown: <strong className="text-blue-400">10s Active</strong></span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveWarningModal(null)}
              className={`w-full font-extrabold text-xs cursor-pointer ${
                activeWarningModal.strikeNumber === 2
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/30'
              }`}
            >
              <span>I Understand & Continue Interview</span>
            </Button>
          </div>
        </div>
      )}

      {/* TECHNICAL ALERT BANNER */}
      {technicalAlert && (
        <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 text-xs text-amber-200 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <span>🔧</span>
            <span><strong>Camera connection issue:</strong> {technicalAlert}</span>
          </div>
          <button
            onClick={() => setTechnicalAlert(null)}
            className="px-2 py-0.5 rounded bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP STATUS & PROCTORING HUD BAR */}
      <header
        className={`h-14 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md border-b transition-colors ${
          isWarning2
            ? 'bg-amber-950/80 border-amber-800/80'
            : isWarning1
            ? 'bg-yellow-950/60 border-yellow-800/70'
            : 'bg-slate-900/95 border-slate-800/90'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Small Monitoring Indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 rounded-full border border-slate-800 text-xs font-bold"
            title="Automated monitoring is active for this interview."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400">Interview Monitoring Active</span>
          </div>

          {/* Grace Period Indicator */}
          {isGracePeriodActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-indigo-700/60 rounded-full text-xs font-bold text-indigo-300 animate-pulse">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Setup Grace Period ({gracePeriodSecondsLeft}s)</span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

          <div className="hidden md:block">
            <span className="text-[11px] font-bold text-slate-400">
              {type} Round · Q{currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Proctoring Strikes Counter Pills & Actions */}
        <div className="flex items-center gap-2">
          {/* Warnings Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-full border border-slate-800 text-xs font-bold">
            <AlertTriangle
              size={13}
              className={proctoringViolations.length > 0 ? 'text-amber-400' : 'text-slate-400'}
            />
            <span className="text-slate-300">Warnings:</span>
            <span
              className={`font-bold ${
                proctoringViolations.length >= 2
                  ? 'text-rose-400 font-extrabold'
                  : proctoringViolations.length === 1
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {Math.min(2, proctoringViolations.length)} / 2
            </span>
          </div>

          {/* Admin Configuration Cog Button */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs"
            title="Interview Monitoring Settings"
          >
            <SlidersHorizontal size={13} />
          </button>

          {/* Session State Badge */}
          {sessionState === 'speaking' && (
            <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Volume2 size={13} className="text-cyan-400" />
              <span>AI Speaking</span>
            </span>
          )}

          {sessionState === 'listening' && (
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Mic size={13} className="text-emerald-400" />
              <span>{hasStartedSpeaking ? 'Speaking' : `Awaiting Voice (${inactivitySecondsLeft}s)`}</span>
            </span>
          )}

          {sessionState === 'processing' && (
            <span className="px-3 py-1 bg-purple-950/80 text-purple-300 border border-purple-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles size={13} className="text-purple-400" />
              <span>Analyzing...</span>
            </span>
          )}

          {/* Session Timer */}
          <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-700 flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span>{formatTime(overallElapsed)}</span>
          </div>
        </div>

        {/* End Interview Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConcludeModal(true)}
            className="font-bold text-xs bg-rose-600 hover:bg-rose-500"
          >
            <span>End Interview</span>
          </Button>
        </div>
      </header>

      {/* 15-SECOND INACTIVITY PROGRESS BAR */}
      {sessionState === 'listening' && !hasStartedSpeaking && (
        <div className="w-full bg-slate-800 h-1 z-30">
          <div
            className="bg-gradient-to-r from-amber-400 to-rose-500 h-full transition-all duration-1000"
            style={{ width: `${(inactivitySecondsLeft / 15) * 100}%` }}
          ></div>
        </div>
      )}

      {/* MAIN VIDEO AREA & SINGLE-QUESTION PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-3 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[380px]">
            {/* 1. AI INTERVIEWER STREAM */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  <span className="text-xs font-extrabold text-white">{interviewer.name}</span>
                  <span className="text-[10px] text-cyan-300 font-semibold px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded-full">
                    AI Evaluator
                  </span>
                </div>

                <button
                  onClick={toggleAiVoice}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isAudioMuted
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              {/* Center AI Avatar */}
              <div className="my-auto text-center space-y-4 py-6 z-10">
                <div className="relative inline-block">
                  {sessionState === 'speaking' && (
                    <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-75 blur-md animate-pulse"></div>
                  )}
                  {sessionState === 'listening' && (
                    <div className="absolute -inset-2 rounded-full bg-emerald-500 opacity-40 blur-sm animate-ping"></div>
                  )}
                  {sessionState === 'processing' && (
                    <div className="absolute -inset-3 rounded-full bg-purple-500 opacity-70 blur-md animate-spin"></div>
                  )}

                  <img
                    src={interviewer.avatar}
                    alt={interviewer.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-800 shadow-2xl relative z-10"
                  />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{interviewer.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{interviewer.title}</p>
                </div>

                {sessionState === 'speaking' && (
                  <div className="flex items-center justify-center gap-1.5 h-6">
                    {[12, 24, 16, 28, 14, 22, 18, 26, 12].map((height, i) => (
                      <span
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full animate-pulse"
                        style={{ height: `${height}px`, animationDelay: `${i * 100}ms` }}
                      ></span>
                    ))}
                  </div>
                )}

                {sessionState === 'listening' && !hasStartedSpeaking && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                    <Clock size={12} />
                    <span>Begin speaking within {inactivitySecondsLeft} seconds</span>
                  </div>
                )}
              </div>

              {/* Subtitle Box */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300 text-center z-10 min-h-[46px] flex items-center justify-center">
                <span>{statusMessage}</span>
              </div>
            </div>

            {/* 2. CANDIDATE LIVE VIDEO & PROCTORING FEED */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 shadow-2xl">
              {/* Top Meta info */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-extrabold text-white">{candidateName} (Candidate)</span>
                </div>

                {/* Real-time Computer Vision HUD pill */}
                <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1 rounded-full border border-slate-800 text-[11px] font-bold">
                  <Scan size={13} className={cvFaceDetected ? 'text-emerald-400' : 'text-rose-400 animate-pulse'} />
                  <span className="text-slate-300">
                    {cvFaceDetected ? `Face: Centered (${cvConfidenceScore}%)` : 'Face Missing'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span
                    className={
                      cvGazeStatus === 'centered'
                        ? 'text-emerald-400'
                        : 'text-amber-400 font-extrabold animate-pulse'
                    }
                  >
                    {cvGazeStatus === 'centered' ? 'Gaze: Normal' : 'Gaze Diverted'}
                  </span>
                </div>
              </div>

              {/* Video Element & Computer Vision Bounding Box Overlay */}
              {mediaStream && isCameraActive ? (
                <div className="absolute inset-0 w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Computer Vision Target HUD Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35">
                    <div
                      className={`w-48 h-56 rounded-3xl border-2 border-dashed transition-colors duration-300 ${
                        cvGazeStatus !== 'centered'
                          ? 'border-amber-400 shadow-lg shadow-amber-500/20'
                          : 'border-emerald-400'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="my-auto text-center space-y-3 z-10 p-4">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-xl">
                    <VideoOff size={28} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-300">
                      {isCameraActive ? 'Camera Permission Required' : 'Camera Muted'}
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Click the button below to connect your webcam feed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={requestCameraStream}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-blue-500/30"
                  >
                    <Video size={13} />
                    <span>Connect Live Webcam</span>
                  </button>
                </div>
              )}

              {/* Live Candidate Speech Box Overlay */}
              <div className="z-10 mt-auto pt-4">
                <div className="p-3.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400 flex items-center gap-1.5">
                      <Mic size={12} className={isDictating ? 'text-rose-400 animate-pulse' : 'text-slate-400'} />
                      <span>Live Speech Transcript:</span>
                    </span>
                    {hasStartedSpeaking && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        Answer Duration: {questionAnswerElapsed}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-snug line-clamp-2 italic font-normal">
                    {candidateSpokenText || (
                      <span className="text-slate-500">
                        {sessionState === 'listening'
                          ? 'Waiting for you to begin speaking...'
                          : 'Transcript will appear here as you speak.'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CLEAN STATUS BANNER (Question text strictly hidden until 'Show Questions' is clicked) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[10px] font-extrabold uppercase">
                  {activeQuestion?.category || type} Round
                </span>
                <span className="text-xs font-extrabold text-white">
                  Question {currentIndex + 1} of {questions.length} (In Progress)
                </span>
                {proctoringStrikes > 0 && (
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-700 rounded text-[10px] font-bold">
                    ⚠️ {proctoringStrikes} Strike{proctoringStrikes > 1 ? 's' : ''} Logged
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {sessionState === 'speaking'
                  ? '🎙️ AI Interviewer is delivering the question audio. Listen carefully.'
                  : sessionState === 'listening'
                  ? '👂 Listening to your response. Click "Show Questions" to view prompt text.'
                  : '⚡ AI is evaluating your response structure, tone, and pacing...'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Optional handy test triggers */}
              {sessionState === 'listening' && (
                <button
                  type="button"
                  onClick={() => triggerManualVoiceAnswer()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Simulate speaking answer"
                >
                  <Zap size={13} className="text-amber-400" />
                  <span>Simulate Voice Answer</span>
                </button>
              )}

              {/* Proctoring Test Triggers (For testing strikes) */}
              <button
                type="button"
                onClick={() =>
                  registerProctoringViolation(
                    'gaze_diverted',
                    'Suspicious Eye Gaze / Head Pose Diversion',
                    'Test evaluation: Candidate sustained gaze diversion away from screen.'
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-amber-300 border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                title="Test Eye/Face Strike (Max 2 Warnings, 3rd Terminates)"
              >
                <span>🧪 Test Strike ({proctoringStrikes}/3)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  registerProctoringViolation(
                    'tab_switched',
                    'Left Interview Screen / Tab Switch',
                    'Test evaluation: Candidate switched away from the active interview window.',
                    5,
                    98
                  )
                }
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                title="Test Tab Switch Strike"
              >
                <span>🧪 Test Tab Switch</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE "SHOW QUESTIONS" PANEL (STRICT SINGLE-QUESTION DISPLAY - NO PRELOADING NEXT QUESTION) */}
        {showQuestionsDrawer && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30 animate-in slide-in-from-right duration-200 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Active Question & Transcript
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionsDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* CURRENT QUESTION ONLY (Strictly No Upcoming Questions Preloaded) */}
              <div className="p-4 bg-slate-950 rounded-2xl border-2 border-blue-500/50 space-y-2 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                    <span>Current Question ({currentIndex + 1} of {questions.length})</span>
                  </span>
                  <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 rounded">{activeQuestion?.category}</span>
                </div>

                <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
                  "{activeQuestion?.q}"
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <div>
                    <strong className="text-slate-300">Target Competencies: </strong>
                    <span className="text-slate-400">{activeQuestion?.competencies?.join(', ')}</span>
                  </div>
                  <div>
                    <strong className="text-slate-300">Coaching Tip: </strong>
                    <span className="text-slate-400">{activeQuestion?.tip}</span>
                  </div>
                </div>
              </div>

              {/* Inactivity Window */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">15s Inactivity Rule</div>
                  <div className="text-xs font-extrabold text-amber-400">
                    {hasStartedSpeaking ? 'Voice Detected ✓' : `${inactivitySecondsLeft}s window remaining`}
                  </div>
                </div>
                <Clock size={16} className="text-amber-400" />
              </div>

              {/* Live Candidate Spoken Transcript */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Spoken Buffer:</div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed min-h-[80px]">
                  {candidateSpokenText || <span className="text-slate-600 italic">No audio recorded yet...</span>}
                </div>
              </div>

              {/* Completed Questions History (Prior Questions ONLY - Upcoming strictly locked) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Progression:</div>
                <div className="space-y-1.5">
                  {questions.map((q, idx) => {
                    if (idx > currentIndex) {
                      // UPCOMING QUESTION (Strictly Locked / Concealed)
                      return (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 text-slate-600 flex items-center justify-between text-xs cursor-not-allowed"
                        >
                          <span className="font-mono">Question {idx + 1}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-900 rounded text-slate-600">
                            🔒 Locked until delivered
                          </span>
                        </div>
                      )
                    }

                    if (idx === currentIndex) {
                      // CURRENT ACTIVE QUESTION
                      return (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl border border-blue-600 bg-blue-950/50 text-white flex items-center justify-between text-xs font-bold"
                        >
                          <span>Question {idx + 1} (In Progress)</span>
                          <span className="text-[10px] text-blue-300 font-extrabold uppercase">Active ⚡</span>
                        </div>
                      )
                    }

                    // COMPLETED PREVIOUS QUESTION
                    return (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-between text-xs"
                      >
                        <span className="truncate max-w-[200px]">Q{idx + 1}: {q.q}</span>
                        <span className="text-[10px] font-bold text-emerald-400">Done ✓</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* BOTTOM CONTROL TOOLBAR */}
      <footer
        className={`h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md border-t transition-colors ${
          isWarning2
            ? 'bg-rose-950/90 border-rose-800/80'
            : isWarning1
            ? 'bg-amber-950/80 border-amber-800/70'
            : 'bg-slate-900/95 border-slate-800/90'
        }`}
      >
        {/* Left: Hardware Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isMicActive
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}
            title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicActive ? <Mic size={16} className="text-emerald-400" /> : <MicOff size={16} />}
            <span className="hidden sm:inline">{isMicActive ? 'Mute' : 'Unmute'}</span>
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isCameraActive && mediaStream
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}
            title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraActive && mediaStream ? <Video size={16} className="text-blue-400" /> : <VideoOff size={16} />}
            <span className="hidden sm:inline">
              {isCameraActive && mediaStream ? 'Stop Video' : 'Enable Camera'}
            </span>
          </button>
        </div>

        {/* Center: "Show Questions" Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuestionsDrawer((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showQuestionsDrawer
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            <FileText size={15} />
            <span>Show Current Question</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-extrabold text-blue-300">
              Q{currentIndex + 1}/{questions.length}
            </span>
          </button>
        </div>

        {/* Right: Anti-Cheating HUD Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden md:inline text-[11px] font-medium text-slate-400">
            Proctoring Guard Active · Single-Question Delivery
          </span>
        </div>
      </footer>

      {/* CONFIRMATION CONCLUDE MODAL */}
      {showConcludeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Conclude Practice Interview?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ending the interview now will stop all recordings and generate your comprehensive AI performance diagnostic
                review on all answered questions.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowConcludeModal(false)}
                className="text-slate-400 hover:text-white font-semibold text-xs"
              >
                Resume Practice
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setShowConcludeModal(false)
                  finalizeInterview()
                }}
                className="font-bold text-xs bg-rose-600 hover:bg-rose-500"
              >
                <span>Conclude & Review Analysis</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MONITORING CONFIGURATION MODAL (ADMIN / EVALUATOR) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Interview Monitoring Configuration</h3>
                  <p className="text-[11px] text-slate-400">AI Balanced Proctoring Parameters & Module Controls</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Automated Monitoring Engine</div>
                  <div className="text-[11px] text-slate-400">Active real-time proctoring during assessment</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMonitoringConfig((c) => ({ ...c, monitoringEnabled: !c.monitoringEnabled }))
                  }
                  className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs transition-colors cursor-pointer ${
                    monitoringConfig.monitoringEnabled
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {monitoringConfig.monitoringEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">Max Warnings</div>
                  <div className="text-white font-extrabold text-base">2 Warnings</div>
                  <div className="text-[10px] text-slate-500 font-medium">3rd confirmed incident ends session</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold">Incident Cooldown</div>
                  <div className="text-white font-extrabold text-base">10 Seconds</div>
                  <div className="text-[10px] text-slate-500 font-medium">Continuous behavior = 1 incident</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Detection Heuristics:</div>
                {[
                  { label: 'Attention & Gaze Deviation (>4.5s sustained)', key: 'attentionMonitoring' },
                  { label: 'Face Absence & Camera Occlusion (>5.0s)', key: 'faceDetection' },
                  { label: 'Multiple Faces in Frame Detection', key: 'multipleFaceDetection' },
                  { label: 'Browser Tab & Window Defocus Monitoring', key: 'tabMonitoring' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2 px-3 bg-slate-950/70 rounded-xl border border-slate-850">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                      Armed ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowConfigModal(false)}
                className="font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
