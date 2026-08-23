import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Play, ArrowLeft, Clock, Sliders, CheckCircle2, Sparkles, Video } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function InterviewSetup() {
  const nav = useNavigate()
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const [type, setType] = useState(params.get('type') || 'Technical')
  const [count, setCount] = useState(4)
  const [enableTimer, setEnableTimer] = useState(true)
  const [timePerQuestion, setTimePerQuestion] = useState(120) // in seconds

  const startSession = () => {
    const id = 'sess-' + Date.now()
    nav(
      `/interview-practice/session/${id}?type=${encodeURIComponent(type)}&count=${count}&timer=${enableTimer}&duration=${timePerQuestion}`
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={() => nav('/interview-practice')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Practice Modes</span>
      </button>

      {/* Setup Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles size={13} />
            <span>Customize AI Session</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview Studio Setup
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure difficulty, question volume, and evaluation parameters
          </p>
        </div>

        {/* Practice Category Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Practice Domain
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Technical', 'Behavioral', 'HR', 'Mixed'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setType(cat)}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === cat
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Number of questions slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Number of Questions
            </label>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {count} Questions
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>2 (Quick 5 min)</span>
            <span>5 (Standard 15 min)</span>
            <span>8 (Deep Assessment)</span>
          </div>
        </div>

        {/* Timer toggle */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Per-Question Countdown Timer</div>
              <div className="text-[11px] text-slate-500">2 minutes per question response window</div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableTimer}
              onChange={(e) => setEnableTimer(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <Button size="lg" className="w-full font-bold" onClick={startSession}>
          <Play size={17} />
          <span>Launch AI Interview Session</span>
        </Button>
      </div>
    </div>
  )
}
