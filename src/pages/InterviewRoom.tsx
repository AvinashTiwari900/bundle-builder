import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Bot,
  User,
  Eye,
  Users,
  Maximize2
} from 'lucide-react'
import Button from '../components/ui/Button'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'

interface ProctoringEvent {
  id: string
  type: 'gaze_diverted' | 'multiple_faces' | 'camera_blocked' | 'tab_switched'
  message: string
  timestamp: string
}

export default function InterviewRoom() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const roleTitle = params.get('role') || 'Senior Business Analyst'
  const companyName = params.get('company') || 'Northstar Analytics'

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micMuted, setMicMuted] = useState(false)
  const [videoDisabled, setVideoDisabled] = useState(false)

  // Interview Question State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [candidateResponse, setCandidateResponse] = useState('')
  const [transcript, setTranscript] = useState<{ q: string; a: string }[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  // Proctoring System State
  const [proctoringWarnings, setProctoringWarnings] = useState<number>(0)
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([])
  const [activeWarningModal, setActiveWarningModal] = useState<string | null>(null)
  const [isTerminated, setIsTerminated] = useState(false)

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(180)

  const interviewQuestions = [
    {
      q: `Welcome to your AI-conducted Technical Round for ${roleTitle} at ${companyName}. To start, how do you handle data anomalies and reconcile discrepancies across ETL pipelines?`,
      focus: 'Data Quality, Validation, SQL Debugging'
    },
    {
      q: 'Tell me about a complex project where you translated vague business requirements into a concrete technical specifications document.',
      focus: 'BRD/FRD, Stakeholder Management, Agile Backlog'
    },
    {
      q: 'If an executive requests a KPI dashboard that contradicts existing operational data, how do you manage the discussion and maintain data governance?',
      focus: 'Data Governance, Executive Communication, Integrity'
    }
  ]

  // Initialize camera
  useEffect(() => {
    async function initMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      } catch (err) {
        console.warn('Camera stream simulation active')
      }
    }
    initMedia()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (isFinished || isTerminated) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [currentQuestionIndex, isFinished, isTerminated])

  // Proctoring trigger handler
  const triggerProctoringViolation = (
    type: 'gaze_diverted' | 'multiple_faces' | 'camera_blocked' | 'tab_switched',
    description: string
  ) => {
    if (isTerminated || isFinished) return

    const newWarnings = proctoringWarnings + 1
    const newEvent: ProctoringEvent = {
      id: 'proc-' + Date.now(),
      type,
      message: description,
      timestamp: new Date().toLocaleTimeString()
    }

    setProctoringEvents((prev) => [newEvent, ...prev])
    setProctoringWarnings(newWarnings)

    if (newWarnings >= 3) {
      setIsTerminated(true)
      setActiveWarningModal(null)

      // Notify HR
      notificationService.create({
        title: 'Interview Proctoring Termination Alert ⚠️',
        message: `Interview for ${roleTitle} was terminated due to exceeding 3 proctoring integrity violations.`,
        type: 'interview'
      })
    } else {
      setActiveWarningModal(
        `Warning ${newWarnings}/3: ${description}. Please face the camera directly. Continuous violations will result in automatic interview termination.`
      )
    }
  }

  const handleNextQuestion = () => {
    if (!candidateResponse.trim()) {
      alert('Please type or speak your response before moving to the next question.')
      return
    }

    const currentQ = interviewQuestions[currentQuestionIndex]
    const updatedTranscript = [...transcript, { q: currentQ.q, a: candidateResponse.trim() }]
    setTranscript(updatedTranscript)
    setCandidateResponse('')

    if (currentQuestionIndex + 1 < interviewQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSecondsRemaining(180)
    } else {
      setIsEvaluating(true)
      setTimeout(() => {
        setIsEvaluating(false)
        setIsFinished(true)

        // Attach interview completion to candidate profile
        const p = profileService.get() || {}
        p.interviews = p.interviews || []
        p.interviews.push({
          id: 'int-' + Date.now(),
          role: roleTitle,
          company: companyName,
          date: new Date().toISOString(),
          score: 92,
          recommendation: 'Strong Hire - Proceed to Final Discussion',
          proctoringStatus: proctoringWarnings === 0 ? 'Clean (0 Warnings)' : `${proctoringWarnings} Minor Warnings`
        })
        profileService.save(p)

        notificationService.create({
          title: 'AI Interview Evaluation Ready! 🎯',
          message: `Your technical evaluation report for ${roleTitle} is now generated with a 92% rating.`,
          type: 'success'
        })
      }, 1500)
    }
  }

  // Proctoring Terminated Screen
  if (isTerminated) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center text-3xl font-extrabold mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert size={32} />
          </div>

          <div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Interview Terminated
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
              Proctoring Threshold Exceeded
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              This session was terminated after 3 consecutive integrity flags (repeated gaze diversion or camera obstruction). An incident report with timestamps has been forwarded to the HR team for review.
            </p>
          </div>

          {/* Incident Log */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
            <div className="font-bold text-slate-800">Recorded Incident Log:</div>
            {proctoringEvents.map((ev) => (
              <div key={ev.id} className="flex justify-between text-slate-600">
                <span>• {ev.message}</span>
                <span className="text-slate-400 font-semibold">{ev.timestamp}</span>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => nav('/applications')}
            className="font-bold text-xs"
          >
            Return to Applications Tracker
          </Button>
        </div>
      </div>
    )
  }

  // Interview Finished & Evaluation Report Screen
  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/20">
                <Award size={32} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                  Evaluation Report Ready
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                  AI Interview Evaluation Report
                </h1>
                <p className="text-xs text-slate-500">{roleTitle} · {companyName}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-emerald-600">92/100</div>
              <div className="text-xs font-bold text-emerald-800">Recommendation: Strong Hire</div>
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-semibold">Technical Depth</div>
              <div className="text-xl font-extrabold text-blue-600 mt-1">94%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-semibold">Problem Solving</div>
              <div className="text-xl font-extrabold text-indigo-600 mt-1">91%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-semibold">Communication</div>
              <div className="text-xl font-extrabold text-purple-600 mt-1">90%</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-semibold">Proctoring Integrity</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-1">
                {proctoringWarnings === 0 ? '100% Pass' : `${100 - proctoringWarnings * 10}%`}
              </div>
            </div>
          </div>

          {/* Transcript Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Questions & Responses Transcript</h3>
            <div className="space-y-3">
              {transcript.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{item.q}</span>
                  </div>
                  <div className="pl-7 text-slate-600 leading-relaxed font-medium">
                    "{item.a}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => nav('/interview-practice')}
              className="font-bold text-xs"
            >
              Practice More
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => nav('/applications')}
              className="font-bold text-xs"
            >
              View in Applications
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* On-Screen Warning Modal */}
      {activeWarningModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-400 animate-in zoom-in-95 duration-150 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={30} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">AI Proctoring Warning</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeWarningModal}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveWarningModal(null)}
              className="w-full font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              I Understand & Acknowledge
            </Button>
          </div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
          <div>
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>LIVE AI Technical Interview</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-blue-600 font-bold">{companyName}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Question {currentQuestionIndex + 1} of {interviewQuestions.length} · {roleTitle}
            </div>
          </div>
        </div>

        {/* Proctoring Status Pill & Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
            <Clock size={13} className="text-slate-500" />
            <span>
              {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              proctoringWarnings === 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <ShieldCheck size={14} />
            <span>AI Proctoring Active (Flags: {proctoringWarnings}/3)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Interview Video Room / Right Question & Live Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Feed & Proctoring Monitor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-xl">
            {/* Camera View */}
            {!videoDisabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="text-center text-slate-500">
                <VideoOff size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Camera Feed Muted</p>
              </div>
            )}

            {/* AI Proctoring Live Bounding Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>AI Face & Gaze Tracking: Active</span>
              </span>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
              <button
                onClick={() => setMicMuted((prev) => !prev)}
                className={`p-2 rounded-full transition-colors ${
                  micMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={() => setVideoDisabled((prev) => !prev)}
                className={`p-2 rounded-full transition-colors ${
                  videoDisabled ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={videoDisabled ? 'Enable Camera' : 'Disable Camera'}
              >
                {videoDisabled ? <VideoOff size={16} /> : <Video size={16} />}
              </button>
            </div>
          </div>

          {/* Proctoring Simulator Triggers (For testing & demonstration) */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Proctoring Integrity Test Controls (Simulation):</span>
              <span className="text-[11px] text-slate-400">Max 3 warnings before auto-termination</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  triggerProctoringViolation('gaze_diverted', 'Candidate looked away from screen for >5s')
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors"
              >
                👀 Simulate Gaze Diversion
              </button>

              <button
                onClick={() =>
                  triggerProctoringViolation('multiple_faces', 'Multiple faces detected in frame')
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors"
              >
                👥 Simulate Multi-Person Alert
              </button>

              <button
                onClick={() =>
                  triggerProctoringViolation('camera_blocked', 'Camera obstruction / dark feed detected')
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors"
              >
                🚫 Simulate Camera Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Question Prompt & Answer Pad (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="space-y-4">
            {/* Question Box */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-100 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-extrabold">
                <Bot size={16} />
                <span>AI Interviewer Question</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                "{interviewQuestions[currentQuestionIndex].q}"
              </h3>
              <div className="text-[10px] text-indigo-900 font-bold">
                Target Competency: {interviewQuestions[currentQuestionIndex].focus}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Your Response (Speech-to-Text / Input):</span>
                <button
                  onClick={() =>
                    setCandidateResponse(
                      'I approach this by isolating pipeline stages in staging environments, cross-checking primary key constraints, and generating automated validation logs to confirm zero loss before pushing to production.'
                    )
                  }
                  className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Auto-Fill Sample</span>
                </button>
              </div>
              <textarea
                value={candidateResponse}
                onChange={(e) => setCandidateResponse(e.target.value)}
                placeholder="Speak or type your structured answer here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-44 leading-relaxed"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleNextQuestion}
            disabled={isEvaluating}
            className="w-full font-bold"
          >
            {isEvaluating ? (
              <span>Evaluating Responses...</span>
            ) : currentQuestionIndex + 1 === interviewQuestions.length ? (
              <span>Submit & Generate Evaluation Report</span>
            ) : (
              <>
                <span>Submit & Next Question</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
