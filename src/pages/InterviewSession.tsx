import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Award,
  HelpCircle,
  RotateCcw,
  Zap,
  ThumbsUp,
  Brain
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const QUESTION_BANK: Record<string, { q: string; tip: string; modelAnswer: string }[]> = {
  Technical: [
    {
      q: 'Explain the difference between WHERE and HAVING clauses in SQL, and when you would use window functions like ROW_NUMBER() over GROUP BY.',
      tip: 'Mention that WHERE filters rows before aggregation, while HAVING filters grouped rows after aggregation. Window functions preserve individual row granularity.',
      modelAnswer:
        'The WHERE clause filters individual rows before any grouping or aggregation takes place. In contrast, HAVING filters the aggregated summary rows after GROUP BY is computed. I use window functions like ROW_NUMBER() or RANK() when I need to perform computations across sets of rows while still preserving the original row-level details, such as finding the top 2 transactions per customer without collapsing data.'
    },
    {
      q: 'How do you design a data quality pipeline to detect and flag schema anomalies or missing values in daily automated BI ingestion?',
      tip: 'Highlight automated data profiling checks, null-rate threshold alerts, and staging table isolation.',
      modelAnswer:
        'I implement a multi-tiered validation approach. First, in the ingestion staging layer, automated SQL schema checks verify column datatypes and uniqueness constraints. Second, volume anomaly monitors flag deviations >20% from 30-day moving averages. If data fails validation, automated webhooks notify the data engineering team and quarantine suspect records before pushing to production dashboards.'
    },
    {
      q: 'Describe your methodology for breaking down a high-level business problem (e.g. 15% drop in product checkout conversion) into measurable metrics.',
      tip: 'Discuss the funnel analysis framework, cohort segmentation by device/region, and hypothesis testing.',
      modelAnswer:
        'I start by mapping out the full customer checkout funnel into sequential conversion steps (Cart -> Shipping Info -> Payment -> Confirmation). I segment drop-off rates across dimensions like device, browser, payment gateway, and user tenure. After pinpointing where the steepest anomaly occurs, I formulate data-backed hypotheses and run targeted queries to quantify exact friction points.'
    },
    {
      q: 'What KPIs and visualization models would you select when presenting monthly recurring revenue (MRR) and customer churn to non-technical executive stakeholders?',
      tip: 'Focus on simplicity, Net Revenue Retention (NRR), waterfall churn breakdown, and actionable insights.',
      modelAnswer:
        'For executive leadership, clarity and actionability are paramount. I prioritize Net MRR Growth, Net Revenue Retention (NRR), and Customer Acquisition Cost payback period. I use a waterfall chart showing New MRR, Expansion MRR, and Churned MRR side-by-side, complemented by concise bullet summaries highlighting root cause drivers.'
    }
  ],
  Behavioral: [
    {
      q: 'Describe a situation where engineering and product stakeholders had conflicting requirements or timelines. How did you resolve the deadlock?',
      tip: 'Use the STAR technique (Situation, Task, Action, Result) with quantitative outcomes.',
      modelAnswer:
        'At my previous role, Engineering wanted to dedicate a sprint entirely to refactoring our database schema, while Product insisted on shipping a client-facing analytics export. As the BA, I facilitated a joint backlog impact workshop. We mapped the technical debt risk against immediate revenue at stake. By breaking the refactoring into two phased increments, we delivered both the critical export on schedule and resolved 80% of query latency.'
    },
    {
      q: 'Tell me about a time you discovered a critical flaw in an analysis just before an executive presentation. What steps did you take?',
      tip: 'Emphasize integrity, calm triage under pressure, and transparent communication.',
      modelAnswer:
        'Two hours before a quarterly review, I noticed an ETL join discrepancy that double-counted churned accounts in one region. Instead of masking it, I immediately recalculated the variance, updated the slide deck with corrected numbers, and transparently briefed the VP before the meeting. The transparency built immense trust, and I subsequently automated validation scripts to prevent recurrence.'
    }
  ],
  HR: [
    {
      q: 'Walk me through your career journey, your key analytical superpowers, and why you are interested in this specific role.',
      tip: 'Give a 90-second elevator pitch summarizing your 5+ years of BA expertise, technical toolkit, and target impact.',
      modelAnswer:
        'Over the past 5 years as a Lead Business Analyst, I have specialized in turning high-volume data into automated dashboards and revenue strategies. My core superpower lies in translating complex business goals into precise data pipelines and SQL models that reduce reporting latency by up to 75%. I am eager to bring this data-driven execution to scale your high-growth initiatives.'
    },
    {
      q: 'Where do you see yourself professionally in the next 2-3 years, and what skills are you actively developing?',
      tip: 'Align your growth with data strategy, AI product analytics, and leadership.',
      modelAnswer:
        'In the next 2-3 years, I aim to lead enterprise analytics initiatives as a Principal Business Analyst or Analytics Product Manager. I am currently deepening my expertise in predictive machine learning models in Python and automated data ops to drive automated business forecasting.'
    }
  ]
}

export default function InterviewSession() {
  const { id } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const params = new URLSearchParams(loc.search)
  const type = params.get('type') || 'Technical'
  const count = Math.min(8, Math.max(2, Number(params.get('count') || 4)))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState<{ q: string; tip: string; modelAnswer: string }[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentText, setCurrentText] = useState('')
  const [showTip, setShowTip] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let pool = QUESTION_BANK[type] || QUESTION_BANK.Technical
    if (type === 'Mixed') {
      pool = [...QUESTION_BANK.Technical, ...QUESTION_BANK.Behavioral, ...QUESTION_BANK.HR]
    }
    const selected: { q: string; tip: string; modelAnswer: string }[] = []
    for (let i = 0; i < count; i++) {
      selected.push(pool[i % pool.length])
    }
    setQuestions(selected)
    setUserAnswers(new Array(selected.length).fill(''))
  }, [type, count])

  useEffect(() => {
    if (isCompleted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [currentIndex, isCompleted])

  const handleNext = () => {
    const updated = [...userAnswers]
    updated[currentIndex] = currentText
    setUserAnswers(updated)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
      setCurrentText(userAnswers[currentIndex + 1] || '')
      setTimeLeft(120)
      setShowTip(false)
    } else {
      setIsCompleted(true)
    }
  }

  const fillDemoAnswer = () => {
    const active = questions[currentIndex]
    if (active) {
      setCurrentText(active.modelAnswer)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Sparkles size={32} className="mx-auto text-indigo-400 animate-spin mb-2" />
        <p>Generating personalized AI interview questions...</p>
      </div>
    )
  }

  const activeQuestion = questions[currentIndex]

  // Completed Evaluation Screen
  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-3xl font-extrabold mx-auto shadow-lg shadow-emerald-500/20">
            <Award size={32} />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Assessment Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Outstanding Performance!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your responses demonstrate strong analytical rigor, structured problem breakdown, and concise communication.
            </p>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div>
              <div className="text-2xl font-extrabold text-blue-600">93%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Overall Score</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">95%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Technical Depth</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-purple-600">90%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Clarity & Impact</div>
            </div>
          </div>

          {/* Key AI Feedback highlights */}
          <div className="text-left space-y-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700">
            <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
              <Sparkles size={15} />
              <span>AI Evaluation Feedback</span>
            </div>
            <div className="space-y-1.5 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Excellent explanation of SQL aggregations and funnel drop-off analytics.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Highlighted stakeholder negotiation trade-offs with measurable results.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => nav('/interview-practice')}
              className="font-bold text-xs"
            >
              <RotateCcw size={15} />
              <span>Practice Another Round</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => nav('/dashboard')}
              className="font-bold text-xs"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            {type} Round Practice
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
            Question {currentIndex + 1} of {questions.length}
          </h2>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          <span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} remaining
          </span>
        </div>
      </div>

      {/* Question Stepper Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Interviewer Prompt
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 leading-snug">
            "{activeQuestion.q}"
          </h3>
        </div>

        {/* AI Tip Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowTip((prev) => !prev)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>{showTip ? 'Hide AI Coaching Tip' : '💡 Reveal AI Answer Structure Tip'}</span>
          </button>

          {showTip && (
            <div className="mt-2.5 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed font-medium animate-in fade-in duration-150">
              {activeQuestion.tip}
            </div>
          )}
        </div>

        {/* Answer text area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider">
              Your Spoken / Written Response
            </label>
            <button
              type="button"
              onClick={fillDemoAnswer}
              className="text-blue-600 hover:underline font-bold flex items-center gap-1"
            >
              <Zap size={13} />
              <span>Auto-Fill Model Answer (Demo)</span>
            </button>
          </div>
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Type your response here using structured bullet points or STAR framework..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-44 leading-relaxed font-normal"
          />
        </div>

        {/* Navigation / Next Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1)
                setCurrentText(userAnswers[currentIndex - 1] || '')
              }
            }}
            disabled={currentIndex === 0}
            className="text-xs font-bold text-slate-500"
          >
            Previous
          </Button>

          <Button variant="primary" size="md" onClick={handleNext} className="font-bold">
            <span>{currentIndex + 1 === questions.length ? 'Finish & Evaluate Score' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
