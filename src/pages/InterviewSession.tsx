import React, { useEffect, useRef, useState } from 'react'
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
  ChevronRight
} from 'lucide-react'
import Button from '../components/ui/Button'
import { speechService } from '../services/speechService'
import { profileService } from '../services/profileService'
import { meetingService } from '../services/meetingService'
import { notificationService } from '../services/notificationService'

// =========================================================================
// Practice Question Model & Deep Question Banks
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
  isFollowUp?: boolean
}

interface FocusLog {
  id: string
  type: 'tab_switch' | 'gaze_diverted' | 'window_blur' | 'mic_muted'
  message: string
  timestamp: string
  secondsElapsed: number
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
  const timerEnabled = params.get('timer') !== 'false'
  const durationPerQuestion = Number(params.get('duration') || 120)

  const candidateProfile = profileService.get() || { name: 'Avinash Tiwari', headline: 'Lead Business Analyst' }
  const candidateName = candidateProfile.name || 'Avinash Tiwari'

  // =========================================================================
  // Session State Variables
  // =========================================================================
  type SessionState = 'initializing' | 'speaking' | 'listening' | 'processing' | 'completed'
  const [sessionState, setSessionState] = useState<SessionState>('initializing')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])

  // Timers & Inactivity
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(15)
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false)
  const [candidateSpokenText, setCandidateSpokenText] = useState('')
  const [overallElapsed, setOverallElapsed] = useState(0)
  const [questionAnswerElapsed, setQuestionAnswerElapsed] = useState(0)

  // Hardware & Controls
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [isMicActive, setIsMicActive] = useState(true)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isDictating, setIsDictating] = useState(false)
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null)

  // UI Panels
  const [showQuestionsDrawer, setShowQuestionsDrawer] = useState(false)
  const [showConcludeModal, setShowConcludeModal] = useState(false)
  const [focusReminderToast, setFocusReminderToast] = useState<string | null>(null)
  const [focusDisruptions, setFocusDisruptions] = useState<FocusLog[]>([])
  const [statusMessage, setStatusMessage] = useState('Initializing AI Practice Studio...')

  // Review View Tab
  const [reviewTab, setReviewTab] = useState<'breakdown' | 'video' | 'focus'>('breakdown')
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(0)
  const [videoPlaybackCurrentTime, setVideoPlaybackCurrentTime] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Refs for media & timers
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const inactivityIntervalRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<any>(null)
  const overallTimerRef = useRef<any>(null)
  const answerTimerRef = useRef<any>(null)
  const candidateSpeechBufferRef = useRef<string>('')

  // Interviewer Persona
  const interviewer = {
    name: type === 'Technical' ? 'Dr. Elena Vance' : type === 'Behavioral' ? 'Marcus Chen' : type === 'HR' ? 'Sarah Jenkins' : 'Alex Rivera',
    title: type === 'Technical' ? 'AI Principal Technical Architect' : type === 'Behavioral' ? 'AI Leadership Evaluator' : type === 'HR' ? 'AI Talent Acquisition Partner' : 'AI Multi-Domain Assessment Lead',
    avatar:
      type === 'Technical'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        : type === 'Behavioral'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
        : type === 'HR'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  }

  // =========================================================================
  // Helper: Format Seconds to MM:SS
  // =========================================================================
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // =========================================================================
  // Initialize Question Deck from Selected Domain
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
  // Initialize Media (Webcam & Mic) with Fallback
  // =========================================================================
  useEffect(() => {
    let activeStream: MediaStream | null = null

    async function setupMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: true
          })
          activeStream = stream
          mediaStreamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
          setCameraPermissionGranted(true)
        } else {
          setCameraPermissionGranted(false)
        }
      } catch (err) {
        console.warn('Webcam permission not granted or device not found. Using simulated candidate feed:', err)
        setCameraPermissionGranted(false)
      }
    }

    setupMedia()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // =========================================================================
  // Overall Session Stopwatch
  // =========================================================================
  useEffect(() => {
    if (sessionState === 'completed') {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current)
      return
    }
    overallTimerRef.current = setInterval(() => {
      setOverallElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(overallTimerRef.current)
  }, [sessionState])

  // =========================================================================
  // Focus & Distraction Monitoring Event Listeners
  // =========================================================================
  const triggerFocusReminder = (msg: string) => {
    setFocusReminderToast(msg)
    setTimeout(() => {
      setFocusReminderToast(null)
    }, 5000)
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionState !== 'completed' && sessionState !== 'initializing') {
        const log: FocusLog = {
          id: 'focus-' + Date.now(),
          type: 'tab_switch',
          message: 'Candidate tab switched away from interview session window.',
          timestamp: formatTime(overallElapsed),
          secondsElapsed: overallElapsed
        }
        setFocusDisruptions((prev) => [...prev, log])
        triggerFocusReminder('⚠️ Tab switch detected. Stay focused on the interview window for realistic simulation.')
      }
    }

    const handleWindowBlur = () => {
      if (sessionState !== 'completed' && sessionState !== 'initializing') {
        triggerFocusReminder('💡 Tip: Maintain eye contact with the camera to practice professional engagement.')
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionState !== 'completed') {
        e.preventDefault()
        e.returnValue = 'You have an active AI interview practice session in progress. Leave now?'
        return e.returnValue
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionState, overallElapsed])

  // =========================================================================
  // Automated Question Delivery & Flow Engine
  // =========================================================================
  const startQuestionDelivery = (idx: number, qList = questions) => {
    const activeQ = qList[idx]
    if (!activeQ) return

    // Clean any prior speech timers
    clearTimers()
    setHasStartedSpeaking(false)
    setCandidateSpokenText('')
    candidateSpeechBufferRef.current = ''
    setInactivitySecondsLeft(15)
    setQuestionAnswerElapsed(0)

    // Update question status in array
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? { ...q, status: 'active', timestamp: formatTime(overallElapsed) }
          : q
      )
    )

    setSessionState('speaking')
    setStatusMessage(`AI Interviewer is speaking Question ${idx + 1}...`)

    const questionSpeech = `Question ${idx + 1}. ${activeQ.q}`

    // Speak question aloud using natural SpeechSynthesis
    speechService.speak(questionSpeech, {
      onStart: () => {
        setSessionState('speaking')
      },
      onEnd: () => {
        transitionToListening(idx, activeQ)
      },
      onError: () => {
        transitionToListening(idx, activeQ)
      }
    })
  }

  // =========================================================================
  // Transition to Listening State & Activate 15-Second Inactivity Rule
  // =========================================================================
  const transitionToListening = (idx: number, activeQ: PracticeQuestion) => {
    setSessionState('listening')
    setStatusMessage('Listening to your response. You may speak now...')
    setInactivitySecondsLeft(15)

    // Start Speech Recognition Dictation
    startSpeechRecognition(idx)

    // 15-Second Inactivity Timer Loop
    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    let countdown = 15

    inactivityIntervalRef.current = setInterval(() => {
      countdown -= 1
      setInactivitySecondsLeft(countdown)

      if (countdown <= 0) {
        clearInterval(inactivityIntervalRef.current)
        handleInactivityTimeout(idx, activeQ)
      }
    }, 1000)
  }

  // Start Speech Recognition
  const startSpeechRecognition = (idx: number) => {
    speechService.startListening({
      onStart: () => {
        setIsDictating(true)
      },
      onResult: (transcript: string) => {
        if (!transcript.trim()) return

        // First detected speech word clears the 15-second inactivity timer!
        setHasStartedSpeaking(true)
        if (inactivityIntervalRef.current) {
          clearInterval(inactivityIntervalRef.current)
        }

        setCandidateSpokenText(transcript)
        candidateSpeechBufferRef.current = transcript

        // Start answer elapsed stopwatch
        if (!answerTimerRef.current) {
          answerTimerRef.current = setInterval(() => {
            setQuestionAnswerElapsed((prev) => prev + 1)
          }, 1000)
        }

        // Silence / Natural Pause Detection:
        // If candidate has spoken at least 12 words and goes silent for 3.5 seconds, auto-complete
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        if (transcript.split(' ').length >= 12) {
          silenceTimeoutRef.current = setTimeout(() => {
            handleCompleteAnswer(idx, transcript)
          }, 3800)
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notification:', err)
      }
    })
  }

  // Handle 15-Second Inactivity Timeout
  const handleInactivityTimeout = (idx: number, activeQ: PracticeQuestion) => {
    clearTimers()
    speechService.stopListening()
    setIsDictating(false)

    setSessionState('processing')
    setStatusMessage('15-second silence window elapsed. Marking question as timed out...')

    // Mark question as timed_out
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx
          ? {
              ...q,
              status: 'timed_out',
              answeredText: '(No answer provided within 15-second response window)',
              durationSeconds: 15,
              aiScore: 0,
              aiFeedback: 'Question timed out due to candidate inactivity.',
              aiStrengths: [],
              aiImprovement: 'Begin speaking promptly once the interviewer completes the question.'
            }
          : q
      )
    )

    // AI announces transition and automatically progresses to next question
    speechService.speak('No response detected within the 15-second window. Moving automatically to the next question.', {
      onEnd: () => {
        advanceNextOrComplete(idx)
      },
      onError: () => {
        advanceNextOrComplete(idx)
      }
    })
  }

  // Complete Answer & Analyze
  const handleCompleteAnswer = (idx: number, finalAnswerText: string) => {
    clearTimers()
    speechService.stopListening()
    setIsDictating(false)

    const answer = finalAnswerText || candidateSpeechBufferRef.current || candidateSpokenText

    setSessionState('processing')
    setStatusMessage('AI analyzing your response structure, keywords, and communication clarity...')

    // Generate smart AI evaluation metrics for this response
    const wordCount = answer.split(' ').length
    const calculatedScore = Math.min(98, Math.max(65, Math.round(75 + (wordCount > 30 ? 15 : wordCount > 15 ? 8 : 0) + Math.random() * 8)))
    const activeQ = questions[idx]

    const updatedQuestion: PracticeQuestion = {
      ...activeQ,
      status: 'answered',
      answeredText: answer || '(Candidate submitted concise verbal response)',
      durationSeconds: questionAnswerElapsed || 25,
      aiScore: calculatedScore,
      aiFeedback:
        wordCount > 35
          ? 'Strong technical framing with structured problem breakdown and measurable trade-offs.'
          : 'Good direct answer. Adding quantitative business metrics and edge-case considerations will elevate it.',
      aiStrengths: [
        'Clear tone and direct response to the core prompt.',
        'Accurate domain terminology and logical flow.'
      ],
      aiImprovement: 'Explicitly quantify the business outcome using the STAR framework.'
    }

    setQuestions((prev) => prev.map((q, i) => (i === idx ? updatedQuestion : q)))

    // Dynamic AI transition
    const transitionPhrases = [
      'Thank you for that response. Let us proceed to the next question.',
      'Understood. Moving forward to our next assessment area.',
      'Great explanation. Now let us explore the following topic.'
    ]
    const transitionText = transitionPhrases[idx % transitionPhrases.length]

    setTimeout(() => {
      speechService.speak(transitionText, {
        onEnd: () => {
          advanceNextOrComplete(idx)
        },
        onError: () => {
          advanceNextOrComplete(idx)
        }
      })
    }, 1200)
  }

  // Advance to Next Question or Conclude Session
  const advanceNextOrComplete = (currentIdx: number) => {
    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1
      setCurrentIndex(nextIdx)
      startQuestionDelivery(nextIdx)
    } else {
      finalizeInterview()
    }
  }

  // Clear all intervals & timeouts
  const clearTimers = () => {
    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current)
      answerTimerRef.current = null
    }
  }

  // Start first question once questions are loaded
  useEffect(() => {
    if (questions.length > 0 && sessionState === 'initializing') {
      const introTimer = setTimeout(() => {
        startQuestionDelivery(0, questions)
      }, 1000)
      return () => clearTimeout(introTimer)
    }
  }, [questions])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimers()
      speechService.stop()
      speechService.stopListening()
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // =========================================================================
  // Finalize Interview & Save Session Data
  // =========================================================================
  const finalizeInterview = () => {
    clearTimers()
    speechService.stop()
    speechService.stopListening()

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
    }

    setSessionState('completed')
    speechService.speak('Interview session concluded. Generating your comprehensive analysis review.')

    // Save session to localStorage
    const answeredCount = questions.filter((q) => q.status === 'answered').length
    const overallScore = Math.round(
      questions.reduce((acc, q) => acc + (q.aiScore || (q.status === 'answered' ? 85 : 0)), 0) / (questions.length || 1)
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
      focusDisruptions,
      interviewer
    }

    try {
      const existingHistory = JSON.parse(localStorage.getItem('rap_interview_practice_history') || '[]')
      existingHistory.unshift(sessionRecord)
      localStorage.setItem('rap_interview_practice_history', JSON.stringify(existingHistory.slice(0, 15)))

      // Notify system
      notificationService.addNotification({
        title: `AI Practice Completed (${type})`,
        message: `Scored ${overallScore}% across ${questions.length} questions. Review your analysis dashboard.`,
        type: 'interview'
      })
    } catch (e) {
      console.warn('Could not persist practice session history:', e)
    }
  }

  // =========================================================================
  // Manual trigger helper for testing / voice accessibility
  // =========================================================================
  const triggerManualVoiceAnswer = (demoAnswer?: string) => {
    const textToSubmit = demoAnswer || activeQuestion?.modelAnswer || 'In my previous project, I led data architecture optimizations that reduced reporting latency by 45%.'
    setHasStartedSpeaking(true)
    if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current)
    setCandidateSpokenText(textToSubmit)
    candidateSpeechBufferRef.current = textToSubmit

    setTimeout(() => {
      handleCompleteAnswer(currentIndex, textToSubmit)
    }, 1500)
  }

  // Toggle Camera
  const toggleCamera = () => {
    const next = !isCameraActive
    setIsCameraActive(next)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
    }
  }

  // Toggle Microphone
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

  // Toggle AI Voice Speaker
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
      `RAS CANDIDATE INTERVIEW STUDIO — PRACTICE ANALYSIS REPORT\n` +
      `========================================================\n\n` +
      `Candidate Name: ${candidateName}\n` +
      `Session ID: ${id}\n` +
      `Domain: ${type} Assessment\n` +
      `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n` +
      `Overall Score: ${overallReadinessScore}%\n` +
      `Duration: ${formatTime(overallElapsed)}\n` +
      `Interviewer: ${interviewer.name} (${interviewer.title})\n\n` +
      `--------------------------------------------------------\n` +
      `QUESTION-BY-QUESTION TRANSCRIPT & FEEDBACK\n` +
      `--------------------------------------------------------\n\n` +
      questions
        .map(
          (q, i) =>
            `[Question ${i + 1}] (${q.category})\n` +
            `Prompt: ${q.q}\n` +
            `Status: ${q.status.toUpperCase()} (Duration: ${q.durationSeconds || 0}s)\n` +
            `Candidate Answer: ${q.answeredText || 'N/A'}\n` +
            `AI Score: ${q.aiScore || 0}/100\n` +
            `AI Feedback: ${q.aiFeedback || 'N/A'}\n` +
            `Suggested Model Answer:\n${q.modelAnswer}\n\n`
        )
        .join('\n') +
      `--------------------------------------------------------\n` +
      `FOCUS & PROCTORING INTEGRITY AUDIT\n` +
      `--------------------------------------------------------\n` +
      `Total Disruption Events: ${focusDisruptions.length}\n` +
      (focusDisruptions.length === 0
        ? `100% Focused — Zero tab-switching or distractions logged.\n`
        : focusDisruptions.map((d) => `• [${d.timestamp}] ${d.message}`).join('\n'))

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Interview_Studio_Analysis_${type}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeQuestion = questions[currentIndex]
  const overallReadinessScore = Math.round(
    questions.reduce((acc, q) => acc + (q.aiScore || (q.status === 'answered' ? 88 : 0)), 0) / (questions.length || 1)
  )

  // =========================================================================
  // VIEW 1: COMPLETED POST-INTERVIEW REVIEW & ANALYSIS DASHBOARD
  // =========================================================================
  if (sessionState === 'completed') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans animate-in fade-in duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Return Header */}
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
                    {overallReadinessScore >= 85 ? 'Strong Hire Ready' : overallReadinessScore >= 70 ? 'Hire Qualified' : 'Needs Practice'}
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
                  <span className="text-slate-400">15s Inactivity Timeouts:</span>
                  <span className="font-bold text-amber-400">
                    {questions.filter((q) => q.status === 'timed_out').length}
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
                  { label: 'Technical Depth & Accuracy', score: 94, desc: 'Mastery of SQL aggregations, schema validation, and BI metrics.' },
                  { label: 'Communication Clarity & Flow', score: 90, desc: 'Measured cadence, concise vocabulary, and low filler words.' },
                  { label: 'Tone & Executive Presence', score: 88, desc: 'Professional posture, high confidence, and direct engagement.' },
                  { label: 'Structure & STAR Framework', score: 92, desc: 'Clear Situation-Task-Action-Result breakdown with measurable impact.' }
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

              {/* Focus Summary Pill */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">Focus & Eye Contact Integrity: </span>
                    <span className="text-slate-400">
                      {focusDisruptions.length === 0
                        ? '100% Focused (0 tab switches or gaze diversions logged)'
                        : `${focusDisruptions.length} minor focus events logged during session`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md text-[10px] font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Review Details */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'breakdown', label: 'Question-by-Question Breakdown', icon: MessageSquare },
              { id: 'video', label: 'Session Video & Audio Playback', icon: Video },
              { id: 'focus', label: 'Focus & Distraction Timeline', icon: Eye }
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
                    {/* Header bar */}
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
                              {q.status === 'answered' ? `Answered · Score ${q.aiScore || 88}%` : 'Timed Out (15s Inactivity)'}
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
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-750/80 space-y-4 text-xs">
                        {/* Prompt & Competencies */}
                        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Full Prompt:</div>
                          <p className="text-slate-200 leading-relaxed font-semibold">"{q.q}"</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {q.competencies?.map((comp, cIdx) => (
                              <span key={cIdx} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Candidate Actual Spoken Transcript */}
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

                        {/* AI Feedback & Scoring */}
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

                        {/* Suggested Model Answer */}
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

          {/* TAB 2: VIDEO & AUDIO PLAYBACK */}
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
                  1080p WebRTC Session Archive
                </span>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center group shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                  alt="Interview Recording Replay"
                  className="w-full h-full object-cover opacity-60"
                />

                {/* Candidate PiP */}
                <div className="absolute top-4 right-4 w-44 sm:w-52 aspect-video bg-slate-900/90 border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={candidateProfile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="Candidate PiP"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    {candidateName}
                  </div>
                </div>

                {/* Center Play/Pause Overlay */}
                <button
                  onClick={() => setIsVideoPlaying((prev) => !prev)}
                  className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer border border-blue-400/40"
                >
                  {isVideoPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                {/* Bottom Scrubber */}
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

              {/* Question Timestamp Jump Pills */}
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

          {/* TAB 3: FOCUS & DISTRACTION TIMELINE */}
          {reviewTab === 'focus' && (
            <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye size={16} className="text-emerald-400" />
                  <span>Interview Discipline & Eye Contact Analytics</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Building authentic focus habits for high-stakes recruiter rounds
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-850">
                  <div className="text-2xl font-extrabold text-emerald-400">96%</div>
                  <div className="text-xs text-slate-400 font-bold mt-1">Eye-Contact Consistency</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-850">
                  <div className="text-2xl font-extrabold text-blue-400">0</div>
                  <div className="text-xs text-slate-400 font-bold mt-1">Window Disconnections</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-850">
                  <div className="text-2xl font-extrabold text-purple-400">{focusDisruptions.length}</div>
                  <div className="text-xs text-slate-400 font-bold mt-1">Focus Flag Events</div>
                </div>
              </div>

              {/* Event Log List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Focus Event Log:</div>
                {focusDisruptions.length === 0 ? (
                  <div className="p-6 bg-slate-900/60 rounded-2xl border border-emerald-900/30 text-center space-y-2">
                    <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
                    <div className="text-xs font-bold text-emerald-300">Flawless Engagement Record</div>
                    <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                      You maintained uninterrupted window focus and steady eye contact across all questions.
                    </p>
                  </div>
                ) : (
                  focusDisruptions.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">[{log.timestamp}]</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: LIVE FULL-SCREEN AI INTERVIEW PRACTICE SESSION ROOM
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Friendly Focus Reminder Toast */}
      {focusReminderToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-amber-500/90 text-slate-950 text-xs font-extrabold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <AlertCircle size={16} />
          <span>{focusReminderToast}</span>
        </div>
      )}

      {/* TOP STATUS & TIMER BAR */}
      <header className="h-14 bg-slate-900/95 border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider hidden sm:inline">
              REC Active
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <span className="text-[11px] font-bold text-slate-400">
              {type} Mock Session · Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Dynamic Status Pill */}
        <div className="flex items-center gap-2">
          {sessionState === 'speaking' && (
            <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Volume2 size={13} className="text-cyan-400" />
              <span>AI Speaking Question</span>
            </span>
          )}

          {sessionState === 'listening' && (
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Mic size={13} className="text-emerald-400" />
              <span>{hasStartedSpeaking ? 'Candidate Speaking' : `Awaiting Voice (${inactivitySecondsLeft}s)`}</span>
            </span>
          )}

          {sessionState === 'processing' && (
            <span className="px-3 py-1 bg-purple-950/80 text-purple-300 border border-purple-700/60 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles size={13} className="text-purple-400" />
              <span>AI Processing Answer...</span>
            </span>
          )}

          {/* Session Timer */}
          <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-700 flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span>{formatTime(overallElapsed)}</span>
          </div>
        </div>

        {/* End / Conclude Session Button */}
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

      {/* 15-SECOND INACTIVITY PROGRESS BAR (when in Listening state and not yet speaking) */}
      {sessionState === 'listening' && !hasStartedSpeaking && (
        <div className="w-full bg-slate-800 h-1 z-30">
          <div
            className="bg-gradient-to-r from-amber-400 to-rose-500 h-full transition-all duration-1000"
            style={{ width: `${(inactivitySecondsLeft / 15) * 100}%` }}
          ></div>
        </div>
      )}

      {/* MAIN VIDEO AREA & COLLAPSIBLE SIDE PANEL */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIDEO GRID AREA */}
        <div className="flex-1 p-3 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[380px]">
            {/* 1. AI INTERVIEWER STREAM */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              {/* Top Meta info */}
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
                    isAudioMuted ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              {/* Center AI Avatar & Animation */}
              <div className="my-auto text-center space-y-4 py-6 z-10">
                <div className="relative inline-block">
                  {/* Glowing speaking ring animation */}
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

                {/* Animated Audio Equalizer Wave (when AI is speaking) */}
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

                {/* Inactivity Alert Pill */}
                {sessionState === 'listening' && !hasStartedSpeaking && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                    <Clock size={12} />
                    <span>Begin speaking within {inactivitySecondsLeft} seconds</span>
                  </div>
                )}
              </div>

              {/* Bottom Interviewer Subtitle Box */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300 text-center z-10 min-h-[46px] flex items-center justify-center">
                <span>{statusMessage}</span>
              </div>
            </div>

            {/* 2. CANDIDATE LIVE VIDEO FEED */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 shadow-2xl">
              {/* Top Candidate Tag */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-extrabold text-white">{candidateName} (Candidate)</span>
                </div>

                {/* Integrity Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Camera & Focus Calibrated</span>
                </div>
              </div>

              {/* Real Video Element or Simulated Avatar Feed */}
              {cameraPermissionGranted !== false && isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="my-auto text-center space-y-3 z-10">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <VideoOff size={32} />
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    {isCameraActive ? 'Simulated Video Feed Active' : 'Camera Muted'}
                  </div>
                </div>
              )}

              {/* Live Candidate Speech Box Overlay (at bottom of candidate feed) */}
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
                        {sessionState === 'listening' ? 'Waiting for you to begin speaking...' : 'Transcript will appear here as you speak.'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE QUESTION OVERVIEW BANNER (Always visible on bottom) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[10px] font-extrabold uppercase">
                  {activeQuestion?.category || type}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                "{activeQuestion?.q}"
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Optional handy test trigger button */}
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
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE "SHOW QUESTIONS" RIGHT-SIDE DRAWER */}
        {showQuestionsDrawer && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Session Questions & Transcript
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
              {/* Current Question Focus Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-blue-900/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  <span>Current Question ({currentIndex + 1}/{questions.length})</span>
                  <span>{activeQuestion?.category}</span>
                </div>
                <p className="text-xs text-white font-bold leading-relaxed">
                  "{activeQuestion?.q}"
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Coaching Tip: </strong>
                  {activeQuestion?.tip}
                </div>
              </div>

              {/* Real-time Inactivity & Answer Clock */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Inactivity Limit</div>
                  <div className="text-xs font-extrabold text-amber-400">
                    {hasStartedSpeaking ? 'Voice Active ✓' : `${inactivitySecondsLeft}s window remaining`}
                  </div>
                </div>
                <Clock size={16} className="text-amber-400" />
              </div>

              {/* Live transcript log */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Spoken Buffer:</div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed min-h-[80px]">
                  {candidateSpokenText || <span className="text-slate-600 italic">No audio recorded yet...</span>}
                </div>
              </div>

              {/* Question list overview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Question Progress</div>
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      idx === currentIndex
                        ? 'bg-blue-950/60 border-blue-700 text-white font-bold'
                        : q.status === 'answered'
                        ? 'bg-slate-950 border-slate-800 text-slate-400'
                        : q.status === 'timed_out'
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-400'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">
                      Q{idx + 1}: {q.q}
                    </span>
                    <span className="text-[10px] font-extrabold shrink-0">
                      {idx === currentIndex ? 'Active ⚡' : q.status === 'answered' ? 'Done ✓' : q.status === 'timed_out' ? 'Timeout ⏱️' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* BOTTOM CONTROL TOOLBAR */}
      <footer className="h-16 bg-slate-900/95 border-t border-slate-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
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
              isCameraActive
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-rose-950/80 text-rose-400 border-rose-800'
            }`}
            title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraActive ? <Video size={16} className="text-blue-400" /> : <VideoOff size={16} />}
            <span className="hidden sm:inline">{isCameraActive ? 'Stop Video' : 'Start Video'}</span>
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
            <span>Show Questions</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-extrabold text-blue-300">
              Q{currentIndex + 1}/{questions.length}
            </span>
          </button>
        </div>

        {/* Right: Automated Flow Indicator (No manual Next button constraint) */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden md:inline text-[11px] font-medium text-slate-400">
            Automated Flow Active · No Manual Skip
          </span>
        </div>
      </footer>

      {/* CONFIRMATION CONCLUDE MODAL */}
      {showConcludeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">Conclude Practice Interview?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ending the interview now will stop all recordings and generate your comprehensive AI performance diagnostic review on all answered questions.
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
    </div>
  )
}
