import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Award,
  ArrowRight,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
  HelpCircle,
  SkipForward,
  Send,
  Sliders,
  TrendingUp,
  Brain,
  MessageSquare,
  ChevronRight,
  Shield,
  Zap,
  Target,
  FileText,
  AlertCircle,
  DollarSign,
  Calendar,
  Briefcase,
  Activity,
  Volume2 as Waves,
  Loader2
} from 'lucide-react'
import Button from '../components/ui/Button'
import { profileService } from '../services/profileService'
import { speechService } from '../services/speechService'
import { sarvamVoiceClient } from '../services/sarvamVoiceClient'
import {
  AiVoicePracticeService,
  CandidateContext,
  ConversationTurn,
  InterviewEvaluation,
  InterviewerMode,
  TARGET_ROLES
} from '../services/aiVoicePracticeService'

export default function VoiceScreening() {
  const nav = useNavigate()
  const profile = profileService.get() || {}

  // Candidate Context sourced directly from Profile
  const candidateContext: CandidateContext = {
    name: profile.name || 'Avinash Tiwari',
    role: profile.headline || profile.currentRole || 'Lead Business Analyst',
    skills: profile.skills || ['SQL', 'Python', 'Business Analysis', 'Agile', 'Snowflake', 'Tableau'],
    tools: profile.tools || ['JIRA', 'Git', 'dbt', 'Power BI'],
    experienceYears: profile.totalExperienceYears ?? profile.experienceYears ?? 6.5,
    projects: profile.projects || [
      {
        title: 'Real-Time Payment Reconciliation Pipeline',
        description: 'Reduced settlement latency from 4 hours to 6 minutes using Snowflake and Redis key caching.'
      }
    ],
    headline: profile.headline || 'Lead Business Analyst & Analytics Engineer',
    currentCtc: profile.currentCtc || '₹22 LPA',
    expectedCtc: profile.targetSalary || '₹28 LPA',
    noticePeriod: profile.noticePeriod || '15 Days (Serving)',
    location: profile.location || 'Bengaluru, India'
  }

  // Session State
  const [interviewerMode, setInterviewerMode] = useState<InterviewerMode>('recruiter') // Default: Sarah - Recruiter Practice
  const [targetRole, setTargetRole] = useState(candidateContext.role || 'Business Analyst')
  const [callStatus, setCallStatus] = useState<'setup' | 'connected' | 'completed'>('setup')
  const [turns, setTurns] = useState<ConversationTurn[]>([])
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  // Live Interaction States
  const [interactionState, setInteractionState] = useState<'idle' | 'ai_speaking' | 'listening' | 'processing' | 'thinking'>('idle')
  const [sarvamStatus, setSarvamStatus] = useState<{ sarvamActive: boolean; provider: string }>({
    sarvamActive: false,
    provider: 'Sarvam AI / Web Speech'
  })

  // Audio & Input State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [candidateSpeechBuffer, setCandidateSpeechBuffer] = useState('')
  const [duration, setDuration] = useState(0)
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)

  // Diagnostics Evaluation State
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null)

  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Check backend Sarvam service status on mount
  useEffect(() => {
    sarvamVoiceClient.checkBackendStatus().then((status) => {
      setSarvamStatus(status)
    })
  }, [])

  // Auto-scroll chat buffer
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [turns, candidateSpeechBuffer])

  // 15-Minute timer duration counter
  useEffect(() => {
    let interval: any
    if (callStatus === 'connected') {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      sarvamVoiceClient.stopAudioPlayback()
      sarvamVoiceClient.cancelRecording()
    }
  }, [])

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Play AI text via Sarvam TTS or Web Speech fallback
  const playAiVoice = (text: string, audioBase64: string | null = null, audioFormat = 'audio/wav') => {
    if (isAudioMuted) return

    setInteractionState('ai_speaking')
    setIsAiSpeaking(true)

    sarvamVoiceClient.playAiAudio(text, audioBase64, audioFormat, {
      onStart: () => {
        setIsAiSpeaking(true)
        setInteractionState('ai_speaking')
      },
      onEnd: () => {
        setIsAiSpeaking(false)
        setInteractionState('idle')
      }
    })
  }

  // Toggle voice mute
  const toggleMute = () => {
    const nextMute = !isAudioMuted
    setIsAudioMuted(nextMute)
    if (nextMute) {
      sarvamVoiceClient.stopAudioPlayback()
      setIsAiSpeaking(false)
      setInteractionState('idle')
    } else {
      const lastAiTurn = [...turns].reverse().find((t) => t.speaker === 'ai')
      if (lastAiTurn) {
        playAiVoice(lastAiTurn.text)
      }
    }
  }

  // Barge-in: Interrupt AI Speech and start recording candidate
  const handleBargeInAndListen = () => {
    sarvamVoiceClient.stopAudioPlayback()
    setIsAiSpeaking(false)
    toggleSpeechRecording()
  }

  // Toggle Candidate Speech Recording (MediaRecorder + Sarvam STT)
  const toggleSpeechRecording = async () => {
    if (isListening) {
      setInteractionState('processing')
      setIsListening(false)

      const result = await sarvamVoiceClient.stopAudioRecordingAndTranscribe('en-IN')
      if (result.transcript) {
        setCandidateSpeechBuffer((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript))
      }
      setInteractionState('idle')
    } else {
      // Interrupt AI if currently speaking
      sarvamVoiceClient.stopAudioPlayback()
      setIsAiSpeaking(false)

      const started = await sarvamVoiceClient.startAudioRecording({
        onStart: () => {
          setIsListening(true)
          setInteractionState('listening')
        },
        onError: (err) => {
          console.warn('Microphone error:', err)
          setIsListening(false)
          setInteractionState('idle')
          // Fallback to browser SpeechRecognition if MediaRecorder fails
          speechService.startListening({
            onStart: () => {
              setIsListening(true)
              setInteractionState('listening')
            },
            onResult: (text) => setCandidateSpeechBuffer((prev) => (prev ? `${prev} ${text}` : text)),
            onEnd: () => {
              setIsListening(false)
              setInteractionState('idle')
            }
          })
        }
      })

      if (!started) {
        setIsListening(false)
        setInteractionState('idle')
      }
    }
  }

  // Start Practice Call via Backend / Sarvam AI
  const startPracticeCall = async () => {
    setCallStatus('connected')
    setDuration(0)
    setTurns([])
    setCurrentDifficulty('intermediate')
    setInteractionState('thinking')

    const initData = await sarvamVoiceClient.startSession(candidateContext, targetRole, interviewerMode, 'en-IN')

    const firstTurn: ConversationTurn = {
      id: `turn-${Date.now()}-ai`,
      speaker: 'ai',
      text: initData.initialQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficulty: initData.difficulty,
      category: initData.initialCategory as any
    }

    setTurns([firstTurn])
    playAiVoice(initData.initialQuestion, initData.audioBase64, initData.audioFormat || 'audio/wav')
  }

  // Submit Candidate's Answer (Analyze -> Follow-Up / Adapt)
  const handleCandidateSubmit = async (overrideAction?: 'normal' | 'repeat' | 'clarify' | 'skip') => {
    const answerText = overrideAction === 'skip'
      ? "I don't know the exact answer to this. Could we explore an adjacent topic?"
      : candidateSpeechBuffer.trim()

    if (!answerText && !overrideAction) return

    // Stop recording if active
    if (isListening) {
      sarvamVoiceClient.cancelRecording()
      setIsListening(false)
    }

    setIsProcessingAnswer(true)
    setInteractionState('thinking')

    // Append candidate turn
    const candidateTurn: ConversationTurn = {
      id: `turn-${Date.now()}-cand`,
      speaker: 'candidate',
      text: answerText || (overrideAction === 'repeat' ? 'Could you please repeat the question?' : 'Could you clarify what you mean?'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedTurns = [...turns, candidateTurn]
    setTurns(updatedTurns)
    setCandidateSpeechBuffer('')

    try {
      // Call backend Adaptive Question Engine (with Sarvam STT/TTS)
      const turnData = await sarvamVoiceClient.sendTurn(
        updatedTurns,
        candidateContext,
        targetRole,
        currentDifficulty,
        overrideAction || 'normal',
        interviewerMode,
        'en-IN'
      )

      setCurrentDifficulty(turnData.difficulty)

      const aiTurn: ConversationTurn = {
        id: `turn-${Date.now()}-ai`,
        speaker: 'ai',
        text: turnData.next_question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        difficulty: turnData.difficulty,
        category: turnData.category as any,
        analysis: turnData.analysis
      }

      if (turnData.analysis) {
        candidateTurn.analysis = turnData.analysis
      }

      setTurns([...updatedTurns, aiTurn])
      setIsProcessingAnswer(false)

      playAiVoice(turnData.next_question, turnData.audioBase64, turnData.audioFormat || 'audio/wav')
    } catch (err) {
      console.warn('Turn error, using client fallback:', err)
      // Client fallback
      const nextQ = AiVoicePracticeService.generateNextQuestion(
        updatedTurns,
        candidateContext,
        targetRole,
        currentDifficulty,
        overrideAction || 'normal',
        interviewerMode
      )
      const aiTurn: ConversationTurn = {
        id: `turn-${Date.now()}-ai`,
        speaker: 'ai',
        text: nextQ.question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        difficulty: nextQ.difficulty,
        category: nextQ.category,
        analysis: nextQ.analysis
      }
      setTurns([...updatedTurns, aiTurn])
      setIsProcessingAnswer(false)
      playAiVoice(nextQ.question)
    }
  }

  // End Practice Call & Generate Full Evaluation
  const endPracticeCall = async () => {
    sarvamVoiceClient.stopAudioPlayback()
    sarvamVoiceClient.cancelRecording()
    setIsListening(false)
    setIsAiSpeaking(false)
    setInteractionState('idle')

    // Request full diagnostic evaluation from backend
    let result = await sarvamVoiceClient.evaluateSession(turns, candidateContext, targetRole, interviewerMode)
    if (!result) {
      result = AiVoicePracticeService.generateEvaluation(turns, candidateContext, targetRole, interviewerMode)
    }

    setEvaluation(result)
    setCallStatus('completed')

    window.scrollTo({ top: 0, behavior: 'smooth' })

    const personaName = interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'
    const closingVoiceMessage = `Great job on completing your 15-minute mock interview with ${personaName}. Your overall practice score is ${result.overallScore} out of 100. Review your detailed feedback breakdown below.`
    
    setTimeout(() => {
      playAiVoice(closingVoiceMessage)
    }, 400)
  }

  // Category Badge Label
  const getCategoryBadge = (cat?: ConversationTurn['category']) => {
    switch (cat) {
      case 'intro':
        return { label: 'Introduction & Availability', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'project_deepdive':
        return { label: 'Recent Accomplishment & Impact', color: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'motivation':
        return { label: 'Career Transition & Motivation', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'compensation':
        return { label: 'Compensation & Salary Framing', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'notice_period':
        return { label: 'Notice Period & Early Buyout', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'work_mode':
        return { label: 'Work Mode & Location Preference', color: 'bg-teal-50 text-teal-700 border-teal-200' }
      case 'technical':
        return { label: 'Domain & Technical Competency', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'behavioral':
        return { label: 'Cultural Fit & Team Dynamics', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'situational':
        return { label: 'Situational Decision Making', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'candidate_q':
        return { label: 'Questions for Recruiter', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
      default:
        return { label: 'Screening Question', color: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  const activeAiTurn = [...turns].reverse().find((t) => t.speaker === 'ai')

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              RAS AI Voice Interview Practice Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-600" />
              <span>Sarvam AI Voice Integration</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Conduct realistic, adaptive mock interviews with Sarvam Speech-to-Text & Text-to-Speech models. Practice phone screens and technical rounds.
          </p>
        </div>

        {/* Practice Guarantee Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shrink-0">
          <Shield size={14} className="text-amber-600" />
          <span>Practice Only · No Real Hiring Decisions</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATE 1: SETUP & LAUNCH SCREEN                                            */}
      {/* ========================================================================= */}
      {callStatus === 'setup' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-md space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 animate-pulse">
              <Bot size={40} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Select Your AI Mock Practice Interviewer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Powered by Indian English acoustics (Sarvam AI <code className="px-1 py-0.5 bg-slate-100 rounded text-indigo-700 font-mono text-[11px]">saarika:v2</code> STT & <code className="px-1 py-0.5 bg-slate-100 rounded text-indigo-700 font-mono text-[11px]">bulbul:v1</code> TTS).
            </p>
          </div>

          {/* Persona Selection Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Sarah - Recruiter Screening */}
            <button
              type="button"
              id="selectSarahRecruiterBtn"
              onClick={() => setInterviewerMode('recruiter')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                interviewerMode === 'recruiter'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-extrabold shrink-0 shadow-md text-xl">
                  👩‍💼
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Sarah</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Recruiter Call
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-700">RAS AI Talent Partner</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    Master 15-min HR phone screens, salary negotiation discussions, notice period flexibility, and career transition stories.
                  </p>
                </div>
              </div>
              {interviewerMode === 'recruiter' && (
                <div className="absolute top-3 right-3 text-indigo-600 font-extrabold text-xs flex items-center gap-1">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>

            {/* Alex - Technical Mock Interview */}
            <button
              type="button"
              id="selectAlexTechBtn"
              onClick={() => setInterviewerMode('technical')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                interviewerMode === 'technical'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-md text-xl">
                  👨‍💻
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Alex</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                      Tech & System
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-700">Senior AI Technical Lead</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    Practice deep technical architecture, algorithmic decisions (XGBoost, Snowflake, Redis), trade-offs, and STAR scenarios.
                  </p>
                </div>
              </div>
              {interviewerMode === 'technical' && (
                <div className="absolute top-3 right-3 text-indigo-600 font-extrabold text-xs flex items-center gap-1">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>
          </div>

          {/* Role & Context Card */}
          <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="targetRoleSelect" className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Target Role for This Mock Practice
              </label>
              <select
                id="targetRoleSelect"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Candidate Name:</span>
                <div className="font-extrabold text-slate-900">{candidateContext.name}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Total Experience:</span>
                <div className="font-extrabold text-slate-900">
                  {candidateContext.experienceYears === 0 ? 'Fresher (0 Yrs)' : `${candidateContext.experienceYears} Years`}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Notice Period:</span>
                <div className="font-extrabold text-slate-900">{candidateContext.noticePeriod}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Target CTC:</span>
                <div className="font-extrabold text-indigo-700">{candidateContext.expectedCtc}</div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              id="startVoicePracticeBtn"
              onClick={startPracticeCall}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-indigo-200 transition-all hover:scale-105 cursor-pointer"
            >
              <Phone size={20} />
              <span>
                Start Adaptive Voice Practice with {interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: ACTIVE VOICE PRACTICE ROOM                                       */}
      {/* ========================================================================= */}
      {callStatus === 'connected' && (
        <div className="space-y-6">
          {/* Top Live Call Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                  {interviewerMode === 'recruiter' ? '👩‍💼' : '👨‍💻'}
                </div>
                {isAiSpeaking && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {interviewerMode === 'recruiter' ? 'Sarah — RAS AI Talent Partner' : 'Alex — Senior AI Interviewer'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Live Call ({formatTime(duration)} / 15:00)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {sarvamStatus.sarvamActive ? 'Sarvam AI Engine' : 'Web Speech Engine'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Practicing Role: <strong className="text-white">{targetRole}</strong> ·{' '}
                  <span className="text-indigo-300">
                    {interviewerMode === 'recruiter' ? 'Recruiter Phone Screening Mode' : 'Technical Simulation Mode'}
                  </span>
                </p>
              </div>
            </div>

            {/* Difficulty & Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <Sliders size={13} className="text-indigo-400" />
                <span>Difficulty: </span>
                <strong className="capitalize text-white">{currentDifficulty}</strong>
              </span>

              <button
                type="button"
                onClick={toggleMute}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                type="button"
                id="endPracticeCallBtn"
                onClick={endPracticeCall}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all cursor-pointer border-none"
                title="End interview practice and view performance diagnostics"
              >
                <PhoneOff size={14} className="shrink-0" />
                <span>End Practice</span>
              </button>
            </div>
          </div>

          {/* Active Status & Question Card */}
          {activeAiTurn && (
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-7 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${getCategoryBadge(activeAiTurn.category).color}`}>
                    {getCategoryBadge(activeAiTurn.category).label}
                  </span>
                  {activeAiTurn.analysis?.isFollowUp && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Zap size={11} />
                      <span>Adaptive Deep-Dive Follow-up</span>
                    </span>
                  )}
                </div>

                {/* Live State Visualizer Indicator */}
                <div className="flex items-center gap-2 text-xs">
                  {interactionState === 'ai_speaking' && (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse">
                      <Waves size={14} className="animate-spin" />
                      <span>AI Speaking</span>
                    </span>
                  )}
                  {interactionState === 'listening' && (
                    <span className="flex items-center gap-1.5 text-rose-700 font-extrabold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                      <Mic size={14} />
                      <span>Listening...</span>
                    </span>
                  )}
                  {interactionState === 'thinking' && (
                    <span className="flex items-center gap-1.5 text-indigo-700 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Thinking & Adapting...</span>
                    </span>
                  )}
                  {interactionState === 'idle' && (
                    <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <span>Ready for Candidate Response</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pulsating Voice Visualizer with Barge-In Button */}
              {isAiSpeaking && (
                <div className="flex items-center justify-between gap-3 p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-5 bg-indigo-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-7 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.25s]" />
                    <span className="w-1.5 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.1s]" />
                    <span className="text-xs font-bold text-indigo-900 ml-1">
                      {interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'} is speaking...
                    </span>
                  </div>

                  {/* Barge-In Interrupt Action */}
                  <button
                    type="button"
                    onClick={handleBargeInAndListen}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    title="Interrupt interviewer and speak"
                  >
                    <Mic size={13} className="text-rose-500" />
                    <span>Interrupt & Speak 🎙️</span>
                  </button>
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed">
                "{activeAiTurn.text}"
              </h3>
            </div>
          )}

          {/* Candidate Speech / Response Input Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="candidateAnswerInput" className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                <span>Your Response (Spoken or Typed)</span>
              </label>

              {/* Candidate Mic Dictation Status */}
              <button
                type="button"
                id="toggleCandidateMicBtn"
                onClick={toggleSpeechRecording}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isListening ? <Mic size={14} /> : <MicOff size={14} />}
                <span>{isListening ? '🔴 Recording (Tap to Transcribe with Sarvam STT)' : '🎙️ Speak (Sarvam STT)'}</span>
              </button>
            </div>

            {/* Response Textarea */}
            <textarea
              id="candidateAnswerInput"
              rows={4}
              value={candidateSpeechBuffer}
              onChange={(e) => setCandidateSpeechBuffer(e.target.value)}
              placeholder={
                interviewerMode === 'recruiter'
                  ? 'Speak with your microphone or type your response... The AI will analyze your salary framing, notice period flexibility, and career motivations.'
                  : 'Speak via microphone or type your response... The AI will evaluate your technical claims, models, tools, and trade-offs.'
              }
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />

            {/* Dynamic Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Candidate Actions (Repeat, Clarify, Skip) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="repeatQuestionBtn"
                  onClick={() => handleCandidateSubmit('repeat')}
                  disabled={isProcessingAnswer}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ask interviewer to repeat the question"
                >
                  <RotateCcw size={13} />
                  <span>Repeat Question</span>
                </button>

                <button
                  type="button"
                  id="clarifyQuestionBtn"
                  onClick={() => handleCandidateSubmit('clarify')}
                  disabled={isProcessingAnswer}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ask interviewer for clarification on this topic"
                >
                  <HelpCircle size={13} />
                  <span>Ask for Clarification</span>
                </button>

                <button
                  type="button"
                  id="skipQuestionBtn"
                  onClick={() => handleCandidateSubmit('skip')}
                  disabled={isProcessingAnswer}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Pass question honestly without penalty"
                >
                  <SkipForward size={13} />
                  <span>I Don't Know / Skip</span>
                </button>
              </div>

              {/* Action Buttons: End Practice + Submit Answer */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="bottomEndPracticeBtn"
                  onClick={endPracticeCall}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Conclude interview practice session and view diagnostic report"
                >
                  <PhoneOff size={14} />
                  <span>End Practice</span>
                </button>

                <button
                  type="button"
                  id="submitCandidateAnswerBtn"
                  onClick={() => handleCandidateSubmit('normal')}
                  disabled={!candidateSpeechBuffer.trim() || isProcessingAnswer}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send size={15} />
                  <span>{isProcessingAnswer ? 'Analyzing Response...' : 'Submit Response →'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Session Conversation History */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-indigo-600" />
              <span>Live Interview Transcript & Keyword Highlights</span>
            </h3>

            <div
              ref={chatScrollRef}
              className="max-h-72 overflow-y-auto space-y-3 pr-2 scroll-smooth"
            >
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                    turn.speaker === 'ai'
                      ? 'bg-slate-50 border border-slate-200/80'
                      : 'bg-indigo-50/70 border border-indigo-100 ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      {turn.speaker === 'ai' ? (
                        <span>{interviewerMode === 'recruiter' ? '👩‍💼 Sarah (RAS AI Talent Partner)' : '👨‍💻 Alex (AI Interviewer)'}</span>
                      ) : (
                        <span className="flex items-center gap-1"><User size={13} className="text-indigo-700" /> You (Candidate)</span>
                      )}
                    </span>
                    <span className="text-slate-400">{turn.timestamp}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-normal">{turn.text}</p>

                  {turn.analysis && turn.analysis.identifiedKeywords?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Analyzed keywords:</span>
                      {turn.analysis.identifiedKeywords.map((k: string) => (
                        <span key={k} className="px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 3: COMPLETED DIAGNOSTIC EVALUATION & RUBRIC                         */}
      {/* ========================================================================= */}
      {callStatus === 'completed' && evaluation && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overall Score Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 size={13} />
                <span>Practice Session Completed</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {evaluation.interviewerName} — Feedback Diagnostics
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {evaluation.performanceSummary}
              </p>
            </div>

            {/* Score Ring Display */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shrink-0 space-y-1 shadow-inner">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Practice Score</span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400">
                {evaluation.overallScore}
                <span className="text-xl text-slate-400 font-normal">/100</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-300 pt-1">
                {evaluation.overallScore >= 80 ? '⭐ Excellent Readiness' : evaluation.overallScore >= 65 ? '📈 Solid Performance' : '💡 Practice Needed'}
              </div>
            </div>
          </div>

          {/* Category Rubric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-bold">{evaluation.categoryLabels.category1}</span>
              <div className="text-xl font-extrabold text-slate-900">{evaluation.categoryScores.communication}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${evaluation.categoryScores.communication}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-bold">{evaluation.categoryLabels.category2}</span>
              <div className="text-xl font-extrabold text-slate-900">{evaluation.categoryScores.technicalOrCompensation}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${evaluation.categoryScores.technicalOrCompensation}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-bold">{evaluation.categoryLabels.category3}</span>
              <div className="text-xl font-extrabold text-slate-900">{evaluation.categoryScores.problemSolvingOrMotivation}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${evaluation.categoryScores.problemSolvingOrMotivation}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-bold">{evaluation.categoryLabels.category4}</span>
              <div className="text-xl font-extrabold text-slate-900">{evaluation.categoryScores.answerDepth}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${evaluation.categoryScores.answerDepth}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5 col-span-2 sm:col-span-1">
              <span className="text-slate-500 font-bold">{evaluation.categoryLabels.category5}</span>
              <div className="text-xl font-extrabold text-slate-900">{evaluation.categoryScores.confidenceAndStructure}%</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${evaluation.categoryScores.confidenceAndStructure}%` }} />
              </div>
            </div>
          </div>

          {/* Strengths & Areas of Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" />
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {evaluation.areasForImprovement.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Deep Dive */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <span>Question-by-Question Diagnostic Review</span>
            </h3>

            <div className="space-y-4">
              {evaluation.questionBreakdowns.map((q, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded">
                        Q{idx + 1} · {q.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                        {q.question}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-800 shrink-0">
                      Score: {q.score}/100
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Your Spoken Answer</span>
                    <p className="text-slate-700 font-normal leading-relaxed italic">"{q.candidateAnswer}"</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">AI Diagnostic Assessment</span>
                      <p className="text-slate-700 leading-relaxed">{q.assessment}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase">Suggested Better Approach</span>
                      <p className="text-slate-700 leading-relaxed">{q.suggestedBetterApproach}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Practice Topics */}
          <div className="p-6 bg-indigo-50/60 border border-indigo-100 rounded-3xl space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
              Recommended Focus Areas for Your Next Session
            </h4>
            <div className="flex flex-wrap gap-2">
              {evaluation.recommendedTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs">
                  🎯 {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => nav('/dashboard')}
              className="w-full sm:w-auto text-xs font-bold border-slate-300"
            >
              <span>Back to Dashboard</span>
            </Button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCallStatus('setup')}
                className="w-full sm:w-auto text-xs font-bold border-indigo-200 text-indigo-700"
              >
                <span>Change Persona & Role</span>
              </Button>

              <Button
                type="button"
                id="practiceAgainBtn"
                variant="primary"
                size="md"
                onClick={startPracticeCall}
                className="w-full sm:w-auto text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 border-none shadow-md"
              >
                <RotateCcw size={14} />
                <span>Practice Another Session</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
