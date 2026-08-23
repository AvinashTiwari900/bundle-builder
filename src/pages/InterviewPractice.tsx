import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Code2,
  Users,
  Brain,
  Sparkles,
  Play,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const CATEGORIES = [
  {
    id: 'Technical',
    title: 'Technical & Data BA',
    icon: Code2,
    count: 12,
    description: 'SQL queries, joins, data validation, BI KPIs, and ETL architecture scenarios.',
    color: 'from-blue-600 to-indigo-600',
    badge: 'High Demand'
  },
  {
    id: 'Behavioral',
    title: 'Behavioral & STAR Method',
    icon: Brain,
    count: 10,
    description: 'Conflict resolution, leadership under pressure, cross-functional prioritization.',
    color: 'from-purple-600 to-indigo-600',
    badge: 'Popular'
  },
  {
    id: 'HR',
    title: 'HR & Culture Fit',
    icon: Users,
    count: 8,
    description: 'Background presentation, salary expectations, career roadmap, and culture alignment.',
    color: 'from-emerald-600 to-teal-600',
    badge: 'Essential'
  },
  {
    id: 'Mixed',
    title: 'Full Simulation Mock Round',
    icon: Sparkles,
    count: 15,
    description: 'Comprehensive 360° AI interviewer simulating real hiring manager assessment.',
    color: 'from-amber-500 to-orange-600',
    badge: 'Recommended'
  }
]

export default function InterviewPractice() {
  const nav = useNavigate()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300">
            <Sparkles size={14} />
            <span>AI-Powered Interview Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Master Every Interview Round
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            Practice real questions asked by top tech employers, receive instant AI scoring, and refine your delivery before high-stakes recruiter rounds.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => nav('/interview-practice/setup?type=Mixed')}
              className="bg-white text-indigo-900 hover:bg-slate-100 font-bold border-none"
            >
              <Play size={16} />
              <span>Start Full Simulation</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => nav('/interview/test-camera')}
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold"
            >
              <Video size={16} />
              <span>Test Camera & Mic</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Select Practice Mode</h2>
          <p className="text-xs text-slate-500">Choose a focused domain or launch a full assessment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-slate-100 text-slate-700">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{cat.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <HelpCircle size={14} className="text-slate-400" />
                    <span>{cat.count} Question Bank</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => nav(`/interview-practice/setup?type=${cat.id}`)}
                    className="font-bold text-xs"
                  >
                    <span>Start Mode</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Past Mock Session Results */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          <span>Recent Practice Sessions</span>
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                92%
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Technical BA & SQL Scenario Round</h4>
                <div className="text-[11px] text-slate-500">Completed yesterday · 5 Questions answered</div>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full w-fit">
              Strong Hire Rating
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                88%
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Behavioral STAR Conflict Resolution</h4>
                <div className="text-[11px] text-slate-500">Completed 3 days ago · 4 Questions answered</div>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full w-fit">
              Good Articulation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
