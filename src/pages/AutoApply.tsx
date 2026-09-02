import React, { useEffect, useState } from 'react'
import {
  Zap,
  CheckCircle2,
  Sliders,
  ShieldCheck
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { autoApplyService } from '../services/autoApplyService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function AutoApplyPage() {
  const [profile, setProfile] = useState<any>(null)
  const [enabled, setEnabled] = useState(true)
  const [minMatch, setMinMatch] = useState(80)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setEnabled(p?.settings?.autoApply ?? true)
    setMinMatch(p?.settings?.minMatchScore ?? 80)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggleEngine = () => {
    const next = !enabled
    setEnabled(next)
    const p = profileService.get() || {}
    p.settings = { ...p.settings, autoApply: next, minMatchScore: minMatch }
    profileService.save(p)
    setProfile(p)
    showToast(next ? 'Auto Apply Engine Enabled' : 'Auto Apply Engine Paused')
  }

  const handleRunNow = async () => {
    setRunning(true)
    try {
      const matches = await autoApplyService.run({ minMatch })
      setResults(matches)
      const updated = profileService.get()
      setProfile(updated)
      if (matches.length > 0) {
        showToast(`Auto Apply Engine submitted ${matches.length} applications! 🚀`)
      } else {
        showToast('No new unapplied jobs matched above threshold.')
      }
    } catch (err: any) {
      showToast('Execution error: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300">
              <Zap size={14} />
              <span>Smart Automation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              1-Click Auto Apply Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Continuously scans active recruiter postings and automatically applies with your optimized ATS resume whenever compatibility exceeds your threshold.
            </p>
          </div>

          {/* Engine Master Switch */}
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs font-bold text-white">Engine Status</div>
              <div className="text-xs text-blue-200 font-semibold">
                {enabled ? 'Active & Matching' : 'Paused'}
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={toggleEngine}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Engine Configuration Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Sliders size={18} className="text-blue-600" />
          <span>Automation Rules & Match Filter</span>
        </h2>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Minimum AI Match Score Threshold
            </label>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {minMatch}% Match or Higher
            </span>
          </div>
          <input
            type="range"
            min={60}
            max={95}
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-semibold">
            <span>60% (Broad reach)</span>
            <span>80% (Recommended Quality)</span>
            <span>95% (Exact Perfect Fit)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Applications are logged to your Applications tracker with timestamps</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleRunNow}
            disabled={running || !enabled}
            className="w-full sm:w-auto font-bold"
          >
            <Zap size={16} />
            <span>{running ? 'Running Matching Engine...' : 'Run Auto Apply Now'}</span>
          </Button>
        </div>
      </div>

      {/* Execution Results Feed */}
      {results.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Submitted Applications in this Run</span>
          </h3>

          <div className="space-y-3">
            {results.map((res: any) => (
              <div
                key={res.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{res.jobTitle}</h4>
                  <p className="text-slate-500 font-medium">{res.company}</p>
                </div>
                <span className="match-pill">{res.matchScore}% Match</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
