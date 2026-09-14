import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  TrendingUp,
  Award,
  ArrowRight,
  RotateCcw,
  Briefcase,
  Video,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  Globe,
  AlertTriangle,
  ChevronRight,
  Sparkle
} from 'lucide-react'
import {
  aiCopilotService,
  CopilotResponse,
  CopilotCard,
  AI_QUICK_ACTIONS
} from '../services/aiCopilotService'
import { profileService } from '../services/profileService'
import { jobService } from '../services/jobService'
import { resumeAnalysisService } from '../services/resumeAnalysisService'
import { portfolioService } from '../services/portfolioService'
import Button from '../components/ui/Button'
import MarkdownMessage from '../components/ui/MarkdownMessage'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  card?: CopilotCard
  quickActions?: { label: string; query: string }[]
  suggestedRoute?: string
}

export default function AIAgent() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<any>(profileService.get() || {})
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${profile?.name?.split(' ')[0] || 'Avinash'}! 👋\n\nI am your **GetnextIn Candidates AI Copilot & Platform Navigation Assistant**.\n\nI can guide you through end-to-end recruitment workflows, analyze your resume ATS match, recommend jobs, explain application feedback, or directly navigate you anywhere across the platform.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: AI_QUICK_ACTIONS.slice(0, 6)
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const atsScore = resumeAnalysisService.analyze(profile).score
  const portfolioStrength = portfolioService.strength(portfolioService.get())
  const applications = profile?.applications || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    if (!queryText) setInput('')
    setIsTyping(true)

    try {
      const response: CopilotResponse = await aiCopilotService.processQuery(textToSend)

      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          card: response.card,
          quickActions: response.quickActions,
          suggestedRoute: response.suggestedRoute
        }

        setIsTyping(false)
        setMessages((prev) => [...prev, aiMsg])
      }, 500)
    } catch {
      setIsTyping(false)
    }
  }

  // Handle Confirmed Sensitive Action
  const handleConfirmAction = async (actionType: string, payload: any) => {
    const res = await aiCopilotService.executeConfirmedAction(actionType, payload)
    if (res.success) {
      setActionSuccess(res.message)
      setTimeout(() => setActionSuccess(null), 4000)

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-confirmed-' + Date.now(),
          sender: 'ai',
          text: `✅ **Action Confirmed & Executed**:\n${res.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          card: res.redirectUrl
            ? {
                type: 'navigation',
                title: 'Go to Applications Tracker',
                actionUrl: res.redirectUrl,
                actionLabel: 'View Application Status'
              }
            : undefined
        }
      ])
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
            <Sparkles size={14} className="text-amber-300 animate-spin-slow" />
            <span>Intelligent Chatbot & Platform Navigation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GetnextIn AI Career Copilot
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Real-time candidate intelligence, workflow guidance, and instant platform navigation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setMessages([
                {
                  id: 'm-reset',
                  sender: 'ai',
                  text: '👋 Chat session refreshed. What would you like to explore?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  quickActions: AI_QUICK_ACTIONS.slice(0, 6)
                }
              ])
            }
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-xs shadow-none cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Clear Session</span>
          </Button>
        </div>
      </div>

      {/* Global Success Banner */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 px-5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={18} className="text-emerald-200" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Split Layout: Chat Panel + Live Context Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Chat Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-2">
            {AI_QUICK_ACTIONS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-slate-900 hover:text-blue-700 dark:hover:text-blue-300 transition-all shadow-xs cursor-pointer text-left"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Card */}
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm h-[580px] flex flex-col justify-between backdrop-blur-sm">
            <div className="overflow-y-auto space-y-4 pr-2 flex-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className="max-w-xl space-y-2">
                    <div
                      className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-blue-500/10'
                          : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                      }`}
                    >
                      <MarkdownMessage content={m.text} isUser={m.sender === 'user'} />

                      {/* Embedded Rich Cards */}
                      {m.card && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                          {/* Navigation Card */}
                          {m.card.type === 'navigation' && (
                            <div className="p-3.5 bg-blue-50/90 dark:bg-black/90 rounded-2xl border border-blue-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{m.card.title}</div>
                                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Direct Platform Route</div>
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => nav(m.card!.actionUrl!)}
                                className="font-bold text-xs shrink-0"
                              >
                                <span>{m.card.actionLabel || 'Navigate Now'}</span>
                                <ArrowRight size={13} />
                              </Button>
                            </div>
                          )}

                          {/* Stepper Workflow Card */}
                          {m.card.type === 'workflow' && Array.isArray(m.card.data) && (
                            <div className="p-4 bg-white dark:bg-black/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Sparkles size={15} className="text-blue-600 dark:text-blue-400" />
                                <span>{m.card.title}</span>
                              </div>
                              <div className="space-y-2">
                                {m.card.data.map((step: any) => (
                                  <div
                                    key={step.step}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                        {step.step}
                                      </span>
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                                          {step.title}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                          {step.description}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => nav(step.route)}
                                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-0.5 ml-2 cursor-pointer"
                                    >
                                      <span>{step.actionLabel}</span>
                                      <ChevronRight size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => nav(m.card!.actionUrl!)}
                                className="w-full font-bold text-xs"
                              >
                                <span>{m.card.actionLabel || 'Start Workflow'}</span>
                                <ArrowRight size={13} />
                              </Button>
                            </div>
                          )}

                          {/* Job Recommendations Card */}
                          {m.card.type === 'job_list' && Array.isArray(m.card.data) && (
                            <div className="space-y-2">
                              {m.card.data.map((job: any) => (
                                <div
                                  key={job.id}
                                  className="p-3 bg-white dark:bg-black/90 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{job.title}</div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                      {job.company} · ₹{Math.round(job.salaryMin / 100000)}-{Math.round(job.salaryMax / 100000)} LPA
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => nav(`/jobs/${job.id}`)}
                                    className="font-bold text-[11px] shrink-0"
                                  >
                                    <span>View Details</span>
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => nav('/jobs')}
                                className="w-full font-bold text-xs"
                              >
                                <span>Explore All 50+ Jobs</span>
                                <ArrowRight size={13} />
                              </Button>
                            </div>
                          )}

                          {/* Sensitive Action Confirmation Card */}
                          {m.card.type === 'confirmation' && m.card.confirmationAction && (
                            <div className="p-4 bg-amber-50 dark:bg-black/90 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl space-y-3">
                              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                                <AlertTriangle size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Action Confirmation Required</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {m.card.confirmationAction.prompt}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmAction(
                                      m.card!.confirmationAction!.actionType,
                                      m.card!.confirmationAction!.payload
                                    )
                                  }
                                  className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Confirm Submission</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: 'ai-cancelled-' + Date.now(),
                                        sender: 'ai',
                                        text: 'Action cancelled. No application was submitted.',
                                        timestamp: new Date().toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      }
                                    ])
                                  }}
                                  className="font-bold text-xs"
                                >
                                  <span>Cancel</span>
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Scheduled Interview Card */}
                          {m.card.type === 'interview_list' && m.card.data && (
                            <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/10 dark:bg-black/90 rounded-2xl border border-amber-300 dark:border-amber-700/60 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                                <Calendar size={15} className="text-amber-600 dark:text-amber-400" />
                                <span>{m.card.data.jobTitle}</span>
                              </div>
                              <div className="text-[11px] text-slate-700 dark:text-slate-300">
                                <strong>Company:</strong> {m.card.data.company} · <strong>Time:</strong>{' '}
                                {m.card.data.interviewDate || 'Thursday, 3:00 PM'}
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => nav(m.card!.actionUrl!)}
                                className="w-full font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white mt-1"
                              >
                                <span>{m.card.actionLabel || 'Enter Interview Room'}</span>
                                <ArrowRight size={13} />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contextual Quick Actions */}
                      {m.quickActions && m.quickActions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap gap-1.5">
                          {m.quickActions.map((qa, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSend(qa.query)}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-black/90 hover:bg-blue-100 dark:hover:bg-slate-900 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold border border-blue-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs"
                            >
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-[10px] text-right ${
                        m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    ></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Row */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="Ask about your resume, applications, jobs, or say 'Take me to my portfolio'..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="py-3 px-5 font-bold"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Candidate Context & Workflow Shortcuts */}
        <div className="space-y-5">
          {/* Live Context Inspector Card */}
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 backdrop-blur-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkle size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Live Candidate Context</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-black/80 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Resume ATS Match</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {atsScore}/100
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-black/80 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Active Applications</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {applications.length} Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-black/80 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Portfolio Strength</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                  {portfolioStrength}% Complete
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-black/80 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Target Role</span>
                <span className="font-bold text-slate-900 dark:text-white text-right truncate max-w-[140px]">
                  {profile.headline || 'Lead BA'}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Shortcuts Card */}
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 backdrop-blur-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Guided Workflows</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSend('How do I create my portfolio?')}
                className="w-full text-left p-3 rounded-2xl bg-blue-50/60 dark:bg-black/90 hover:bg-blue-100 dark:hover:bg-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-white">
                  <Globe size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Portfolio Creation Workflow</span>
                </div>
                <ChevronRight size={15} className="text-blue-500 dark:text-blue-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSend('How can I apply for a job?')}
                className="w-full text-left p-3 rounded-2xl bg-indigo-50/60 dark:bg-black/90 hover:bg-indigo-100 dark:hover:bg-slate-900 border border-indigo-100 dark:border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-white">
                  <Briefcase size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Job Application Workflow</span>
                </div>
                <ChevronRight size={15} className="text-indigo-500 dark:text-indigo-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSend('How do I prepare for an interview?')}
                className="w-full text-left p-3 rounded-2xl bg-purple-50/60 dark:bg-black/90 hover:bg-purple-100 dark:hover:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-white">
                  <Video size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Interview Preparation Plan</span>
                </div>
                <ChevronRight size={15} className="text-purple-500 dark:text-purple-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSend('Where can I upload my documents?')}
                className="w-full text-left p-3 rounded-2xl bg-emerald-50/60 dark:bg-black/90 hover:bg-emerald-100 dark:hover:bg-slate-900 border border-emerald-100 dark:border-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-white">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Document KYC Hub</span>
                </div>
                <ChevronRight size={15} className="text-emerald-500 dark:text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
