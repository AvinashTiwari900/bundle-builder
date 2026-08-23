import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react'
import { jobService } from '../services/jobService'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function JobDetails() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    if (id) {
      jobService.get(id).then((j) => {
        setJob(j)
        if (j) {
          setHasApplied((p?.applications || []).some((a: any) => a.jobId === j.id))
          setIsSaved((p?.savedJobs || []).includes(j.id))
        }
      })
    }
  }, [id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleApply = async () => {
    if (!job) return
    const res = await jobService.applyToJob(job.id)
    if (res.success) {
      setHasApplied(true)
      showToast('Application submitted successfully! 🚀')
    } else {
      showToast(res.message)
    }
  }

  const handleToggleSave = async () => {
    if (!job) return
    const nextSaved = await jobService.toggleSave(job.id)
    setIsSaved(nextSaved)
    showToast(nextSaved ? 'Job saved to bookmarks' : 'Job removed from bookmarks')
  }

  if (!job) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Briefcase size={32} className="mx-auto text-slate-300 mb-2 animate-bounce" />
        <p>Loading job details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => nav('/jobs')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to All Jobs</span>
      </button>

      {/* Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              {job.company.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {job.company}
                </span>
                <span className="match-pill text-[11px]">
                  <Sparkles size={11} />
                  <span>94% Match</span>
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{job.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark size={18} className={isSaved ? 'fill-amber-500' : ''} />
            </button>
            <Button
              variant={hasApplied ? 'secondary' : 'primary'}
              size="lg"
              disabled={hasApplied}
              onClick={handleApply}
              className="w-full sm:w-auto font-bold"
            >
              <Send size={16} />
              <span>{hasApplied ? 'Applied ✓' : '1-Click Apply'}</span>
            </Button>
          </div>
        </div>

        {/* Quick Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <MapPin size={13} />
              <span>Location</span>
            </div>
            <div className="font-bold text-slate-800">{job.location} ({job.workMode})</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <DollarSign size={13} />
              <span>Salary Range</span>
            </div>
            <div className="font-bold text-slate-800">
              ₹{Math.round(job.salaryMin / 100000)}-{Math.round(job.salaryMax / 100000)} LPA
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Briefcase size={13} />
              <span>Experience</span>
            </div>
            <div className="font-bold text-slate-800">{job.experience}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Clock size={13} />
              <span>Employment</span>
            </div>
            <div className="font-bold text-slate-800">{job.employmentType || 'Full-time'}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 mb-2">About the Position</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {job.description} As a {job.title} at {job.company}, you will collaborate closely with product management, engineering, and business stakeholders to turn raw data into strategic insights and revenue drivers.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Key Responsibilities</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {(job.responsibilities || [
                  'Perform deep-dive data analysis and develop executive dashboards.',
                  'Gather business requirements and translate them into actionable functional specs.',
                  'Lead sprint backlog grooming and data quality validation processes.',
                  'Present findings and predictive forecasts to cross-functional leadership.'
                ]).map((resp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Required Skillsets</h3>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Match Breakdown & Quick Tips */}
        <div className="space-y-6">
          {/* AI Match Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles size={15} />
              <span>AI Match Intelligence</span>
            </div>

            <div className="text-2xl font-extrabold">94% Compatibility</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your profile matches <strong className="text-white">5 of 5 key requirements</strong> for this role, specifically in SQL, Power BI, and Business Analysis.
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Skill Fit</span>
                <span className="font-bold text-white">96%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Experience Level</span>
                <span className="font-bold text-white">92%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Location / Mode</span>
                <span className="font-bold text-white">100%</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => nav('/interview-practice')}
              className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs mt-2"
            >
              Practice Interview for this Role
            </Button>
          </div>

          {/* Recruiter Guarantee Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Verified Employer</span>
            </div>
            <p className="text-slate-500">
              Applications submitted through RAP Candidate Portal bypass generic recruiter queues and enter priority review.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
