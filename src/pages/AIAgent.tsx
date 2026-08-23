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
  CheckCircle2
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { jobService } from '../services/jobService'
import { resumeAnalysisService } from '../services/resumeAnalysisService'
import Button from '../components/ui/Button'

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  actionLink?: { label: string; url: string }
}

export default function AIAgent() {
  const nav = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hello Avinash! I am your RAP AI Career Copilot. I've analyzed your profile and active job openings. How can I assist your career progression today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const profile = profileService.get()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const suggestedPrompts = [
    '📊 Analyze my resume ATS score & top improvements',
    '💼 Recommend the top 3 highest-matching jobs for me',
    '🎯 Give me top 3 interview questions for Senior BA',
    '💰 What is the market salary benchmark for my profile?'
  ]

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

    // Simulate AI response synthesis
    setTimeout(async () => {
      const q = textToSend.toLowerCase()
      let reply = ''
      let actionLink = undefined

      if (q.includes('ats') || q.includes('resume') || q.includes('score')) {
        const analysis = resumeAnalysisService.analyze(profile)
        reply = `📄 **ATS Resume Analysis for ${profile?.name || 'Candidate'}**:\n\n` +
          `• **Current Score**: ${analysis.score}/100 (Top 5% candidate pool)\n` +
          `• **Keywords Match**: 94% (SQL, Power BI, Business Analysis detected)\n` +
          `• **Key Suggestion**: ${analysis.recommendations[0] || 'Add quantified outcomes to your projects'}.\n\n` +
          `Your profile is optimized for Senior Business Analyst and Product Analyst positions!`
        actionLink = { label: 'Go to Resume ATS Scanner', url: '/resume' }
      } else if (q.includes('job') || q.includes('recommend') || q.includes('match') || q.includes('highest')) {
        const allJobs = await jobService.list()
        const top3 = allJobs.slice(0, 3)
        reply = `🎯 **Top 3 Recommended Roles Matching Your Profile (90%+ Match)**:\n\n` +
          top3.map((j: any, i: number) => 
            `${i + 1}. **${j.title}** at **${j.company}**\n` +
            `   • Location: ${j.location} (${j.workMode})\n` +
            `   • Salary: ₹${Math.round(j.salaryMin/100000)}-${Math.round(j.salaryMax/100000)} LPA\n` +
            `   • Skills: ${(j.skills || []).slice(0, 3).join(', ')}`
          ).join('\n\n')
        actionLink = { label: 'Explore All 50+ Jobs', url: '/jobs' }
      } else if (q.includes('interview') || q.includes('question') || q.includes('practice')) {
        reply = `🎙️ **Top 3 Interview Questions for Senior Business Analyst**:\n\n` +
          `1. *“How do you prioritize competing requirements from diverse executive stakeholders under tight release deadlines?”*\n` +
          `2. *“Walk me through your approach to identifying anomalies and root causes in enterprise data pipelines using SQL and BI tools.”*\n` +
          `3. *“Tell me about a time a project scope drifted. How did you realign the backlog?”*\n\n` +
          `Would you like to practice these in the interactive studio?`
        actionLink = { label: 'Open Interview Studio', url: '/interview-practice' }
      } else if (q.includes('salary') || q.includes('market') || q.includes('benchmark') || q.includes('lpa')) {
        reply = `💰 **Compensation Insights for 5+ Years Experience (India)**:\n\n` +
          `• **Target Bracket**: ₹22 - 28 LPA for Senior BA / Product Strategist\n` +
          `• **Top Paying Hubs**: Bengaluru (₹24-30 LPA), Hyderabad (₹20-26 LPA), Pune (₹18-24 LPA)\n` +
          `• **High-Demand Multipliers**: Python + Power BI + Cloud Data Warehousing adds ~15-20% compensation leverage.`
      } else {
        reply = `I can help you optimize your candidate profile, review ATS resume keywords, prepare for upcoming interviews, or discover tailored job matches. Try asking:\n\n` +
          `• *"Analyze my resume ATS score"*\n` +
          `• *"Recommend top jobs for me"*\n` +
          `• *"Prepare technical interview questions"*`
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, aiMsg])
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles size={22} className="animate-spin-slow text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              RAP AI Career Copilot
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time candidate intelligence, ATS optimization & interview prep
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: 'm-reset',
                sender: 'ai',
                text: "Chat cleared. What else can I assist you with today?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])
          }
          className="text-xs text-slate-500 font-semibold hover:text-slate-800"
        >
          <RotateCcw size={14} />
          <span>Reset Chat</span>
        </Button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all shadow-xs cursor-pointer text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm h-[520px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.actionLink && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => nav(m.actionLink!.url)}
                      className="font-bold text-xs"
                    >
                      <span>{m.actionLink.label}</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Row */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder="Ask anything about your resume, applications, interview practice, or jobs..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
  )
}
