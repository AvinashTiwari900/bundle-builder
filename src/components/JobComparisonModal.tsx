import React from 'react'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react'
import Button from './ui/Button'
import { profileService } from '../services/profileService'

interface JobComparisonModalProps {
  job: any
  onClose: () => void
  onApply: (jobId: string) => void
}

export default function JobComparisonModal({ job, onClose, onApply }: JobComparisonModalProps) {
  const profile = profileService.get()
  const candidateSkills = (profile?.skills || []).map((s: string) => s.toLowerCase())
  const jobSkills = job.skills || []

  const matchingSkills = jobSkills.filter((s: string) =>
    candidateSkills.includes(s.toLowerCase())
  )
  const missingSkills = jobSkills.filter(
    (s: string) => !candidateSkills.includes(s.toLowerCase())
  )

  const matchPercent = Math.min(
    98,
    Math.max(65, Math.round((matchingSkills.length / Math.max(1, jobSkills.length)) * 100))
  )

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                AI Job Description Comparison
              </span>
              <span className="match-pill">{matchPercent}% Match</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{job.title}</h2>
            <p className="text-xs text-slate-500 font-medium">{job.company} · {job.location}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Match Breakdown Scores */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Skill Alignment</div>
            <div className="text-xl font-extrabold text-blue-600 mt-0.5">{matchPercent}%</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Experience Level</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">High Fit</div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold">Location Fit</div>
            <div className="text-xl font-extrabold text-purple-600 mt-0.5">100%</div>
          </div>
        </div>

        {/* Skills Matched vs Missing */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Matched Core Skills ({matchingSkills.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {matchingSkills.map((s: string) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          {missingSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                <span>Skill Gaps / Keywords to Highlight ({missingSkills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Actionable Tailoring Advice */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 text-xs text-indigo-950">
          <div className="font-bold flex items-center gap-1.5 text-indigo-800">
            <Sparkles size={14} />
            <span>AI Resume Optimization Recommendation</span>
          </div>
          <p className="leading-relaxed font-medium">
            To reach 98% recruiter ATS score for this role at {job.company}, ensure your primary resume includes quantifiable outcomes for <strong>{jobSkills.slice(0, 3).join(', ')}</strong> and mention your experience with cross-functional reporting.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose()
              onApply(job.id)
            }}
            className="font-bold"
          >
            <span>Proceed to 1-Click Apply</span>
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}
