import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  User,
  Sparkles,
  Send,
  X,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Briefcase,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkle
} from 'lucide-react'
import {
  aiCopilotService,
  CopilotResponse,
  CopilotCard,
  AI_QUICK_ACTIONS
} from '../services/aiCopilotService'
import Button from './ui/Button'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  card?: CopilotCard
  quickActions?: { label: string; query: string }[]
  suggestedRoute?: string
}

interface AICopilotDrawerProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

export default function AICopilotDrawer({
  isOpen,
  onClose,
  initialQuery
}: AICopilotDrawerProps) {
  const nav = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: "👋 Hi there! I'm your **RAP AI Copilot & Platform Navigation Assistant**.\n\nI can guide you through platform workflows (Portfolio, Job Applications, Interview Practice), provide career insights, or directly navigate you to any section of RAP. How can I help you right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: AI_QUICK_ACTIONS.slice(0, 5)
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, messages, isTyping])

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery)
    }
  }, [initialQuery, isOpen])

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
          text: `✅ **Action Executed Successfully**:\n${res.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          card: res.redirectUrl
            ? {
                type: 'navigation',
                title: 'Go to Applications Tracker',
                actionUrl: res.redirectUrl,
                actionLabel: 'View in Applications'
              }
            : undefined
        }
      ])

      if (res.redirectUrl) {
        setTimeout(() => {
          nav(res.redirectUrl!)
          onClose()
        }, 1200)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-extrabold shadow-inner">
              <Sparkles size={20} className="text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">RAP AI Copilot</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                Assistant, Workflow Guide & Platform Navigator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'm-reset',
                    sender: 'ai',
                    text: '👋 Chat cleared. What would you like to explore next?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    quickActions: AI_QUICK_ACTIONS.slice(0, 5)
                  }
                ])
              }
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Action Success Toast */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 px-5 animate-in slide-in-from-top duration-200">
            <CheckCircle2 size={16} className="text-emerald-200" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Chat Thread Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  <Bot size={16} />
                </div>
              )}

              <div className="max-w-[88%] space-y-2">
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-blue-500/10'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{m.text}</div>

                  {/* Render Embedded Rich UI Cards */}
                  {m.card && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* 1. Navigation Action Card */}
                      {m.card.type === 'navigation' && (
                        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{m.card.title}</div>
                            <div className="text-[11px] text-blue-600 font-medium">Direct Platform Route</div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              nav(m.card!.actionUrl!)
                              onClose()
                            }}
                            className="font-bold text-xs shrink-0"
                          >
                            <span>{m.card.actionLabel || 'Navigate Now'}</span>
                            <ArrowRight size={13} />
                          </Button>
                        </div>
                      )}

                      {/* 2. Stepper Workflow Guide Card */}
                      {m.card.type === 'workflow' && Array.isArray(m.card.data) && (
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                          <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-blue-600" />
                            <span>{m.card.title}</span>
                          </div>
                          <div className="space-y-1.5">
                            {m.card.data.map((step: any) => (
                              <div
                                key={step.step}
                                className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                    {step.step}
                                  </span>
                                  <div>
                                    <div className="font-bold text-slate-900 text-[11px]">
                                      {step.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {step.description}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    nav(step.route)
                                    onClose()
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:underline shrink-0 flex items-center gap-0.5 ml-2 cursor-pointer"
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
                            onClick={() => {
                              nav(m.card!.actionUrl!)
                              onClose()
                            }}
                            className="w-full font-bold text-xs mt-1"
                          >
                            <span>{m.card.actionLabel || 'Start Workflow'}</span>
                            <ArrowRight size={13} />
                          </Button>
                        </div>
                      )}

                      {/* 3. Job Recommendations List Card */}
                      {m.card.type === 'job_list' && Array.isArray(m.card.data) && (
                        <div className="space-y-2 pt-1">
                          {m.card.data.map((job: any) => (
                            <div
                              key={job.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-900">{job.title}</div>
                                <div className="text-[11px] text-slate-600">
                                  {job.company} · ₹{Math.round(job.salaryMin / 100000)}-{Math.round(job.salaryMax / 100000)} LPA
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  nav(`/jobs/${job.id}`)
                                  onClose()
                                }}
                                className="font-bold text-[11px] shrink-0"
                              >
                                <span>View Job</span>
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              nav('/jobs')
                              onClose()
                            }}
                            className="w-full font-bold text-xs"
                          >
                            <span>Explore All Jobs</span>
                            <ArrowRight size={13} />
                          </Button>
                        </div>
                      )}

                      {/* 4. Sensitive Action Confirmation Card */}
                      {m.card.type === 'confirmation' && m.card.confirmationAction && (
                        <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2.5 animate-in zoom-in-95 duration-150">
                          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                            <span>Confirmation Required</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
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
                              <CheckCircle2 size={13} />
                              <span>Confirm Action</span>
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
                                    text: 'Action cancelled. No changes or submissions were made.',
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

                      {/* 5. Scheduled Interview Card */}
                      {m.card.type === 'interview_list' && m.card.data && (
                        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/10 rounded-2xl border border-amber-300 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                            <Calendar size={15} className="text-amber-600" />
                            <span>{m.card.data.jobTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-700">
                            <strong>Company:</strong> {m.card.data.company} · <strong>Time:</strong>{' '}
                            {m.card.data.interviewDate || 'Thursday, 3:00 PM'}
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              nav(m.card!.actionUrl!)
                              onClose()
                            }}
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
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(qa.query)}
                          className="px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200/80 transition-colors cursor-pointer"
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
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-1.5 shadow-xs">
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

        {/* Footer Quick Action Pills & Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 space-y-2.5">
          {/* Quick suggestions scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
            {AI_QUICK_ACTIONS.map((qa, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qa.query)}
                className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-full font-semibold shrink-0 text-xs border border-slate-200/80 transition-colors cursor-pointer"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Input text field & send button */}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="Ask anything or say 'Take me to my portfolio'..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 font-bold cursor-pointer shrink-0"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
