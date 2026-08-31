import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  PhoneOff,
  Mic,
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
  HelpCircle,
  SkipForward,
  Send,
  Sliders,
  TrendingUp,
  Brain,
  Shield,
  Zap,
  Target,
  FileText,
  AlertCircle,
  Briefcase,
  Activity,
  Loader2,
  Check
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
  const [interviewerMode, setInterviewerMode] = useState<InterviewerMode>('recruiter') // Sarah vs Alex
  const [targetRole, setTargetRole] = useState(candidateContext.role || 'Business Analyst')
  const [callStatus, setCallStatus] = useState<'setup' | 'connected' | 'completed'>('setup')
  const [turns, setTurns] = useState<ConversationTurn[]>([])
  const [currentDifficulty, setCurrentDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  // Live Turn-Taking States:
  // 'idle' | 'ai_speaking' | 'listening' | 'candidate_speaking' | 'analyzing' | 'preparing'
  const [interactionState, setInteractionState] = useState<
    'idle' | 'ai_speaking' | 'listening' | 'candidate_speaking' | 'analyzing' | 'preparing'
  >('idle')

  // Spoken buffers & durations
  const [candidateSpeechBuffer, setCandidateSpeechBuffer] = useState('')
  const [duration, setDuration] = useState(0)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  // Diagnostics Evaluation State
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null)

  // Silence & Auto-Submit Refs
  const silenceTimerRef = useRef<any>(null)
  const speechBufferRef = useRef('')
  const isListeningRef = useRef(false)
  const turnsRef = useRef<ConversationTurn[]>([])
  const difficultyRef = useRef<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  // Sync refs with state
  useEffect(() => {
    speechBufferRef.current = candidateSpeechBuffer
  }, [candidateSpeechBuffer])

  useEffect(() => {
    turnsRef.current = turns
  }, [turns])

  useEffect(() => {
    difficultyRef.current = currentDifficulty
  }, [currentDifficulty])

  // 15-Minute timer duration counter
  useEffect(() => {
    let interval: any
    if (callStatus === 'connected') {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  // Cleanup audio & mic on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer()
      sarvamVoiceClient.stopAudioPlayback()
      sarvamVoiceClient.cancelRecording()
      speechService.stopListening()
    }
  }, [])

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  // Play AI text and automatically activate microphone when finished
  const playAiVoice = (text: string, audioBase64: string | null = null, audioFormat = 'audio/wav') => {
    if (isAudioMuted) {
      // If muted, wait a brief reading pause then open mic
      setTimeout(() => {
        autoStartListening()
      }, 2500)
      return
    }

    setInteractionState('ai_speaking')
    clearSilenceTimer()

    sarvamVoiceClient.playAiAudio(text, audioBase64, audioFormat, {
      onStart: () => {
        setInteractionState('ai_speaking')
      },
      onEnd: () => {
        // AI finished speaking -> automatically activate candidate listening
        autoStartListening()
      }
    })
  }

  // Automatic candidate microphone activation (VAD & Continuous Turn-taking)
  const autoStartListening = async () => {
    clearSilenceTimer()
    setCandidateSpeechBuffer('')
    speechBufferRef.current = ''
    setInteractionState('listening')
    isListeningRef.current = true

    // Start speech recognition / VAD
    speechService.startListening({
      onStart: () => {
        setInteractionState('listening')
      },
      onResult: (text: string) => {
        if (!isListeningRef.current) return
        
        const clean = text.trim()
        if (clean) {
          setCandidateSpeechBuffer(clean)
          speechBufferRef.current = clean
          setInteractionState('candidate_speaking')

          // Reset silence timer on every spoken word
          clearSilenceTimer()

          // If candidate has spoken at least 2 words, auto-submit after 2.0s of silence
          const wordCount = clean.split(/\s+/).filter(Boolean).length
          if (wordCount >= 2) {
            silenceTimerRef.current = setTimeout(() => {
              if (isListeningRef.current && speechBufferRef.current.trim().length > 0) {
                handleAutoSubmit()
              }
            }, 2000) // 2.0 second silence detection threshold
          }
        }
      },
      onEnd: () => {
        // If stopped naturally with buffer, auto-submit
        if (isListeningRef.current && speechBufferRef.current.trim().length > 3) {
          handleAutoSubmit()
        }
      }
    })
  }

  // Stop listening and auto-submit candidate's response
  const handleAutoSubmit = async (overrideAction?: 'normal' | 'repeat' | 'clarify' | 'skip') => {
    clearSilenceTimer()
    isListeningRef.current = false
    speechService.stopListening()
    sarvamVoiceClient.cancelRecording()

    const answerText = overrideAction === 'skip'
      ? "I'm not completely certain on this topic. Could we explore another area?"
      : speechBufferRef.current.trim()

    if (!answerText && !overrideAction) {
      // If candidate was silent, re-listen
      autoStartListening()
      return
    }

    setInteractionState('analyzing')

    // Append candidate turn
    const candidateTurn: ConversationTurn = {
      id: `turn-${Date.now()}-cand`,
      speaker: 'candidate',
      text: answerText || (overrideAction === 'repeat' ? 'Could you please repeat the question?' : 'Could you clarify what you mean?'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedTurns = [...turnsRef.current, candidateTurn]
    setTurns(updatedTurns)
    setCandidateSpeechBuffer('')
    speechBufferRef.current = ''

    try {
      // Call backend Adaptive Question Engine
      const turnData = await sarvamVoiceClient.sendTurn(
        updatedTurns,
        candidateContext,
        targetRole,
        difficultyRef.current,
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
      setInteractionState('preparing')

      // Automatically speak the next question
      playAiVoice(turnData.next_question, turnData.audioBase64, turnData.audioFormat || 'audio/wav')
    } catch (err) {
      console.warn('Turn error, using client fallback engine:', err)
      const nextQ = AiVoicePracticeService.generateNextQuestion(
        updatedTurns,
        candidateContext,
        targetRole,
        difficultyRef.current,
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
      setInteractionState('preparing')
      playAiVoice(nextQ.question)
    }
  }

  // Start Practice Call
  const startPracticeCall = async () => {
    setCallStatus('connected')
    setDuration(0)
    setTurns([])
    setCurrentDifficulty('intermediate')
    setInteractionState('preparing')

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

  // End Practice Call & Show Evaluation
  const endPracticeCall = async () => {
    clearSilenceTimer()
    isListeningRef.current = false
    sarvamVoiceClient.stopAudioPlayback()
    sarvamVoiceClient.cancelRecording()
    speechService.stopListening()
    setInteractionState('idle')

    let result = await sarvamVoiceClient.evaluateSession(turnsRef.current, candidateContext, targetRole, interviewerMode)
    if (!result) {
      result = AiVoicePracticeService.generateEvaluation(turnsRef.current, candidateContext, targetRole, interviewerMode)
    }

    setEvaluation(result)
    setCallStatus('completed')

    window.scrollTo({ top: 0, behavior: 'smooth' })

    const personaName = interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'
    const closingVoiceMessage = `Great job completing your mock interview practice with ${personaName}. Your overall score is ${result.overallScore} out of 100. Review your feedback below.`
    
    setTimeout(() => {
      sarvamVoiceClient.playAiAudio(closingVoiceMessage, null)
    }, 400)
  }

  // Toggle voice mute
  const toggleMute = () => {
    const nextMute = !isAudioMuted
    setIsAudioMuted(nextMute)
    if (nextMute) {
      sarvamVoiceClient.stopAudioPlayback()
      if (interactionState === 'ai_speaking') {
        autoStartListening()
      }
    }
  }

  // Category Badge Label
  const getCategoryBadge = (cat?: ConversationTurn['category']) => {
    switch (cat) {
      case 'intro':
        return { label: 'Background & Focus', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'project_deepdive':
        return { label: 'Project Architecture & Impact', color: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'motivation':
        return { label: 'Career Goals & Motivation', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'compensation':
        return { label: 'Compensation & Value Framing', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'notice_period':
        return { label: 'Notice Period & Joining Dialogue', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'work_mode':
        return { label: 'Work Mode & Environment', color: 'bg-teal-50 text-teal-700 border-teal-200' }
      case 'technical':
        return { label: 'Technical Competency', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'behavioral':
        return { label: 'Team Collaboration & STAR', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'situational':
        return { label: 'Situational Problem Solving', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'candidate_q':
        return { label: 'Your Questions for the Interviewer', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
      default:
        return { label: 'Interview Question', color: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  // Active prominent current AI question
  const currentAiTurn = [...turns].reverse().find((t) => t.speaker === 'ai')

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* ========================================================================= */}
      {/* CLEAN HEADER                                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            RAS AI Interview Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            AI Mock Interview · {targetRole}
          </p>
        </div>

        {callStatus === 'connected' ? (
          <div className="flex items-center gap-2.5">
            {/* Timer */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Clock size={13} className="text-emerald-400" />
              <span>{formatTime(duration)}</span>
              <span className="text-slate-400 font-normal">/ 15:00</span>
            </div>

            {/* Mute Button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Red End Practice Button in Header */}
            <button
              type="button"
              id="headerEndPracticeBtn"
              onClick={endPracticeCall}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-900/20 transition-all cursor-pointer border-none"
              title="End mock interview practice session"
            >
              <PhoneOff size={13} />
              <span>End Practice</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <Shield size={13} className="text-indigo-600" />
            <span>Practice Studio</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STATE 1: SETUP & PERSONA SELECTION                                        */}
      {/* ========================================================================= */}
      {callStatus === 'setup' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-2.5">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-100">
              <Bot size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Select Your Practice Interviewer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Hands-free voice practice with automatic turn-taking and adaptive follow-up questions.
            </p>
          </div>

          {/* Persona Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* Sarah */}
            <button
              type="button"
              id="selectSarahBtn"
              onClick={() => setInterviewerMode('recruiter')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative ${
                interviewerMode === 'recruiter'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  👩‍💼
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Sarah</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      HR & General
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Practice recruiter phone screens, compensation framing, notice periods, and career background stories.
                  </p>
                </div>
              </div>
              {interviewerMode === 'recruiter' && (
                <div className="absolute top-3 right-3 text-indigo-600 font-extrabold text-xs">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>

            {/* Alex */}
            <button
              type="button"
              id="selectAlexBtn"
              onClick={() => setInterviewerMode('technical')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative ${
                interviewerMode === 'technical'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  👨‍💻
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Alex</h3>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                      Technical
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Deep-dive technical questions, system architecture, models, algorithmic trade-offs, and STAR scenarios.
                  </p>
                </div>
              </div>
              {interviewerMode === 'technical' && (
                <div className="absolute top-3 right-3 text-indigo-600 font-extrabold text-xs">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </button>
          </div>

          {/* Role Selection */}
          <div className="max-w-md mx-auto space-y-1.5">
            <label htmlFor="targetRoleSelect" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Target Job Role
            </label>
            <select
              id="targetRoleSelect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              id="startVoicePracticeBtn"
              onClick={startPracticeCall}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-indigo-100 transition-all hover:scale-105 cursor-pointer"
            >
              <Phone size={20} />
              <span>Start Voice Practice with {interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: CLEAN VOICE-ONLY INTERVIEW ENVIRONMENT                           */}
      {/* ========================================================================= */}
      {callStatus === 'connected' && currentAiTurn && (
        <div className="space-y-6">
          {/* Main Stage: AI Interviewer Avatar & Live Soundwave */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
            {/* Centered Avatar */}
            <div className="relative inline-block">
              <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mx-auto flex items-center justify-center text-4xl sm:text-5xl shadow-xl transition-all duration-300 ${
                interactionState === 'ai_speaking'
                  ? 'bg-indigo-600 text-white ring-8 ring-indigo-100 scale-105 shadow-indigo-200'
                  : interactionState === 'candidate_speaking' || interactionState === 'listening'
                  ? 'bg-emerald-600 text-white ring-8 ring-emerald-100 scale-105 shadow-emerald-200'
                  : 'bg-slate-900 text-white ring-4 ring-slate-100'
              }`}>
                {interviewerMode === 'recruiter' ? '👩‍💼' : '👨‍💻'}
              </div>

              {/* Status Indicator Pip */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold text-white shadow-md flex items-center gap-1.5 whitespace-nowrap bg-slate-900">
                {interactionState === 'ai_speaking' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>AI Speaking</span>
                  </>
                )}
                {interactionState === 'listening' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Listening...</span>
                  </>
                )}
                {interactionState === 'candidate_speaking' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Listening to your answer...</span>
                  </>
                )}
                {interactionState === 'analyzing' && (
                  <>
                    <Loader2 size={11} className="animate-spin text-indigo-400" />
                    <span>Analyzing response...</span>
                  </>
                )}
                {interactionState === 'preparing' && (
                  <>
                    <Sparkles size={11} className="text-amber-400" />
                    <span>Preparing next question...</span>
                  </>
                )}
                {interactionState === 'idle' && (
                  <span>Ready</span>
                )}
              </div>
            </div>

            {/* Soundwave Visualizer Bar */}
            <div className="h-8 flex items-center justify-center gap-1.5">
              {interactionState === 'ai_speaking' ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-7 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-5 bg-indigo-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-8 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.25s]" />
                  <span className="w-1.5 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.1s]" />
                </div>
              ) : interactionState === 'candidate_speaking' || interactionState === 'listening' ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="w-1.5 h-7 bg-emerald-500 rounded-full animate-pulse [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
              )}
            </div>

            {/* Interaction State Prompt Text */}
            <div className="space-y-1">
              {interactionState === 'listening' && (
                <p className="text-sm font-extrabold text-emerald-700 animate-pulse">
                  🎙️ Your turn — speak naturally into your microphone
                </p>
              )}
              {interactionState === 'candidate_speaking' && (
                <p className="text-sm font-extrabold text-slate-900">
                  Capturing your response... (pause 2s when finished)
                </p>
              )}
              {interactionState === 'analyzing' && (
                <p className="text-sm font-bold text-indigo-700 flex items-center justify-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing answer & formulating adaptive follow-up...</span>
                </p>
              )}
              {interactionState === 'ai_speaking' && (
                <p className="text-xs font-semibold text-slate-500">
                  {interviewerMode === 'recruiter' ? 'Sarah' : 'Alex'} is asking the question. Listen carefully.
                </p>
              )}

              {/* Live Spoken Text Preview */}
              {candidateSpeechBuffer && (
                <div className="max-w-xl mx-auto p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 italic mt-2 animate-in fade-in">
                  "{candidateSpeechBuffer}"
                </div>
              )}
            </div>
          </div>

          {/* Prominent Current Question Card */}
          <div className="bg-white border-2 border-indigo-600/30 rounded-3xl p-7 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                CURRENT QUESTION
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getCategoryBadge(currentAiTurn.category).color}`}>
                {getCategoryBadge(currentAiTurn.category).label}
              </span>
            </div>

            {/* Large Question Typography */}
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
              "{currentAiTurn.text}"
            </h2>
          </div>

          {/* Candidate Control Pills (Repeat, Clarify, Skip, Done Speaking) */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="repeatQuestionBtn"
                onClick={() => handleAutoSubmit('repeat')}
                disabled={interactionState === 'analyzing' || interactionState === 'preparing'}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Ask interviewer to repeat the question"
              >
                <RotateCcw size={13} />
                <span>Repeat Question</span>
              </button>

              <button
                type="button"
                id="clarifyQuestionBtn"
                onClick={() => handleAutoSubmit('clarify')}
                disabled={interactionState === 'analyzing' || interactionState === 'preparing'}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Ask for clarification"
              >
                <HelpCircle size={13} />
                <span>Clarification</span>
              </button>

              <button
                type="button"
                id="skipQuestionBtn"
                onClick={() => handleAutoSubmit('skip')}
                disabled={interactionState === 'analyzing' || interactionState === 'preparing'}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Pass question without penalty"
              >
                <SkipForward size={13} />
                <span>Skip / Next Topic</span>
              </button>
            </div>

            {/* Optional Fast Done-Speaking Trigger */}
            {(interactionState === 'candidate_speaking' || interactionState === 'listening') && (
              <button
                type="button"
                id="doneSpeakingBtn"
                onClick={() => handleAutoSubmit('normal')}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Submit answer immediately without waiting for silence timeout"
              >
                <Check size={14} />
                <span>Done Speaking →</span>
              </button>
            )}
          </div>

          {/* Bottom End Practice Bar */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              id="bottomEndPracticeBtn"
              onClick={endPracticeCall}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
            >
              <PhoneOff size={16} />
              <span>End Practice & View Detailed Diagnostic Report</span>
            </button>
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

          {/* Recommended Focus Areas */}
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
