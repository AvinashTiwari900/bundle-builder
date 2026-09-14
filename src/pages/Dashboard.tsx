import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Award,
  Layers,
  Video,
  ArrowRight,
  Briefcase,
  MapPin,
  Bookmark,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Clock,
  Star,
  Zap,
  Check,
  CircleDot,
  FileText,
  ShieldCheck,
  FolderGit2
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { resumeAnalysisService } from '../services/resumeAnalysisService'
import { portfolioService } from '../services/portfolioService'
import { jobService } from '../services/jobService'
import { autoApplyService } from '../services/autoApplyService'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setSavedJobs(p?.savedJobs || [])
    jobService.list().then(setJobs)
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const profileCompletion = () => {
    if (!profile) return 82
    let score = 20
    if (profile.name) score += 10
    if (profile.headline) score += 10
    if (profile.location) score += 10
    score += Math.min(25, (profile.skills || []).length * 4)
    score += (profile.resumes && profile.resumes.length > 0) ? 15 : 0
    score += Math.min(10, (profile.projects || []).length * 5)
    return Math.min(100, Math.max(50, score))
  }

  const applications: any[] = profile?.applications || []
  const autoAppliedDispatches = autoApplyService.getDispatches()

  // Calculate live KPI metrics
  const activeApplicationsCount = applications.length
  const interviewsScheduledCount = applications.filter(
    (a: any) => a.status === 'Interview Scheduled' || a.status === 'AI Screening'
  ).length
  const autoAppliedMonthCount = autoAppliedDispatches.length
  const strengthScore = profileCompletion()

  const handleApply = async (jobId: string) => {
    const res = await jobService.applyToJob(jobId)
    if (res.success) {
      const updated = profileService.get()
      setProfile(updated)
      showToast('Application submitted successfully! 🚀')
    } else {
      showToast(res.message || 'Failed to submit application')
    }
  }

  const handleToggleSave = async (jobId: string) => {
    const isNowSaved = await jobService.toggleSave(jobId)
    const updated = profileService.get()
    setProfile(updated)
    setSavedJobs(updated.savedJobs || [])
    showToast(isNowSaved ? 'Job saved to bookmarks' : 'Job removed from bookmarks')
  }

  // Profile completion checklist items
  const completionChecklist = [
    {
      title: 'Basic Info & Professional Headline',
      completed: Boolean(profile?.name && profile?.headline),
      link: '/profile'
    },
    {
      title: 'Upload Verified ATS Resume',
      completed: Boolean(profile?.resumes && profile.resumes.length > 0),
      link: '/resume'
    },
    {
      title: 'Add Portfolio & Project Showcases',
      completed: Boolean(profile?.projects && profile.projects.length > 0),
      link: '/projects'
    },
    {
      title: 'Complete Digilocker KYC Verification',
      completed: Boolean(profile?.kycVerified),
      link: '/documents'
    },
    {
      title: 'Practice AI Mock Interview',
      completed: false,
      link: '/interview-practice'
    }
  ]

  const candidateName = profile?.name ? profile.name.split(' ')[0] : 'Avinash'
  const candidateHeadline = profile?.headline || 'Senior Business Analyst & AI Operations Specialist'

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Large Rounded Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        {/* Subtle decorative glow elements */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/5 skew-x-12 translate-x-24 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wide text-blue-200 border border-white/10">
              <Sparkles size={14} className="text-amber-300" />
              <span>AI Job Match & Career Studio</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {candidateName} 👋
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              {candidateHeadline}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-300/80 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeApplicationsCount} active applications
              </span>
              <span>•</span>
              <span>{interviewsScheduledCount} scheduled interview{interviewsScheduledCount === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{jobs.length} jobs open</span>
            </div>
          </div>

          {/* Two prominent action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => nav('/jobs')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-lg shadow-black/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Briefcase size={17} className="text-blue-600" />
              <span>Find matching jobs</span>
            </button>

            <button
              onClick={() => nav('/interview-practice')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-sm backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Video size={17} className="text-indigo-300" />
              <span>Practice an interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Evenly Spaced Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active applications */}
        <div
          onClick={() => nav('/applications')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active applications
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {activeApplicationsCount}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold flex items-center gap-1">
              <span>{activeApplicationsCount > 0 ? `${activeApplicationsCount} in hiring pipeline` : 'No active applications'}</span>
              <ChevronRight size={13} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* KPI 2: Interviews scheduled */}
        <div
          onClick={() => nav('/interview-practice')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Interviews scheduled
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {interviewsScheduledCount}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold flex items-center gap-1">
              <span>{interviewsScheduledCount > 0 ? 'Upcoming sessions ready' : 'No upcoming sessions'}</span>
              <ChevronRight size={13} className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* KPI 3: Auto-applied this month */}
        <div
          onClick={() => nav('/auto-apply')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Auto-applied this month
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {autoAppliedMonthCount}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold flex items-center gap-1">
              <span>WhatsApp & Email protocol active</span>
              <ChevronRight size={13} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* KPI 4: Profile strength */}
        <div
          onClick={() => nav('/profile')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Profile strength
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{strengthScore}%</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">High match</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${strengthScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dashboard Content: Wider Recent Applications + Narrower Profile Strength */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Wider Left Column (2 Cols): Recent Applications Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Recent Applications
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track your application stages and recruiter SLA response time
                </p>
              </div>
            </div>

            <button
              onClick={() => nav('/applications')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>View all ({applications.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Applications list or meaningful empty state */}
          {applications.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Briefcase size={22} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No applications submitted yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Explore curated opportunities matched by your skillset and apply with 1-click.
              </p>
              <button
                onClick={() => nav('/jobs')}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                Browse Matching Jobs →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.slice(0, 4).map((app: any, idx: number) => {
                const statusColor =
                  app.status === 'Interview Scheduled'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                    : app.status === 'Shortlisted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : app.status === 'AI Screening'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700'

                return (
                  <div
                    key={app.id || idx}
                    onClick={() => nav('/applications')}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                        {(app.company || 'C').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {app.jobTitle || app.title || 'Software Opportunity'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold">{app.company || 'Tech Partner'}</span>
                          <span>•</span>
                          <span>Applied {app.appliedDate || 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}>
                        {app.status || 'Under Review'}
                      </span>
                      <ChevronRight size={15} className="text-slate-400 hidden sm:block" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* SLA Guarantee Strip */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/40 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-100">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-medium">
                <strong>24-Hour Recruiter SLA Guarantee</strong> protects every verified application submitted.
              </span>
            </div>
            <button
              onClick={() => nav('/applications')}
              className="text-blue-700 dark:text-blue-300 font-bold hover:underline shrink-0"
            >
              Track SLA →
            </button>
          </div>
        </div>

        {/* Narrower Right Column (1 Col): Profile Strength Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Award size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Profile Strength
              </h2>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
              {strengthScore}%
            </span>
          </div>

          {/* Progress gauge bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Completion Level</span>
              <span className="font-bold text-slate-900 dark:text-white">{strengthScore < 100 ? 'Needs Attention' : 'All Set'}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${strengthScore}%` }}
              />
            </div>
          </div>

          {/* Actionable Profile-Completion Guidance */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Actionable Guidance
            </div>

            {completionChecklist.map((item, idx) => (
              <div
                key={idx}
                onClick={() => nav(item.link)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  item.completed
                    ? 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      item.completed
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600 text-transparent'
                    }`}
                  >
                    {item.completed && <Check size={13} className="stroke-[3]" />}
                  </div>
                  <span className={`truncate font-medium ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'font-bold'}`}>
                    {item.title}
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
              </div>
            ))}
          </div>

          <button
            onClick={() => nav('/portfolio')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Edit Profile & Portfolio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4. Interactive AI Copilot Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              <Sparkles size={15} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Ask GetnextIn AI Copilot</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Workflow guidance, interview tips, or say 'Show high-match jobs'
              </p>
            </div>
          </div>
          <button
            onClick={() => nav('/ai-agent')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full AI Hub</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: '📰 Community Posts & Feed', path: '/posts' },
            { label: '🎥 Meetings & Recordings', path: '/meetings' },
            { label: '⚡ Auto-Apply Alerts (WhatsApp/Email)', path: '/auto-apply' },
            { label: '🔒 Contact Privacy Shield', path: '/portfolio' },
            { label: '🛡️ Documents & KYC Verification', path: '/documents' },
            { label: '💼 Explore High-Rating Jobs', path: '/jobs?sort=rating_desc' },
            { label: '🎙️ AI Voice Practice', path: '/voice-screening' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => nav(item.path)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Recommended Jobs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recommended Jobs for You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by AI compatibility with your skillset and verified credentials
            </p>
          </div>
          <button
            onClick={() => nav('/jobs')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({jobs.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.slice(0, 6).map((job, idx) => {
            const isSaved = savedJobs.includes(job.id)
            const hasApplied = applications.some((a: any) => a.jobId === job.id)
            const matchScore = 94 - idx * 2

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Company Badge & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0 ring-1 ring-white/10">
                        {job.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => nav(`/jobs/${job.id}`)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
                          title={job.title}
                        >
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[130px]">
                            {job.company}
                          </span>
                          {job.companyRating && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold flex items-center gap-0.5">
                              <Star size={9} className="fill-amber-500 text-amber-500" />
                              <span>{job.companyRating}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] shrink-0 shadow-xs">
                      <Sparkles size={11} className="text-emerald-500 dark:text-emerald-400" />
                      <span>{matchScore}%</span>
                    </span>
                  </div>

                  {/* Hiring Period & Response Rate Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    {job.hiringPeriod && (
                      <span className="px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Clock size={11} className="text-amber-600 dark:text-amber-400" />
                        <span>{job.hiringPeriod}</span>
                      </span>
                    )}

                    {job.companyResponseRate && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Zap size={11} className="text-emerald-600 dark:text-emerald-400" />
                        <span>{job.companyResponseRate}</span>
                      </span>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 dark:text-slate-400 my-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400 dark:text-slate-500" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-semibold text-[11px] border border-slate-200/50 dark:border-slate-700/50">
                      {job.workMode}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      ₹{Math.round(job.salaryMin / 100000)}-{Math.round(job.salaryMax / 100000)} LPA
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {(job.skills || []).slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400/60 dark:hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="px-1.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        +{(job.skills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-1">
                  <button
                    onClick={() => handleToggleSave(job.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <Bookmark size={15} className={isSaved ? 'fill-amber-500' : ''} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => nav(`/jobs/${job.id}`)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      disabled={hasApplied}
                      onClick={() => handleApply(job.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                        hasApplied
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {hasApplied ? 'Applied ✓' : 'Quick Apply'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
