import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Video,
  ArrowRight,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Bookmark,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { resumeAnalysisService } from '../services/resumeAnalysisService'
import { portfolioService } from '../services/portfolioService'
import { jobService } from '../services/jobService'
import Card from '../components/ui/Card'
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
    if (!profile) return 80
    let score = 20
    if (profile.name) score += 10
    if (profile.headline) score += 10
    if (profile.location) score += 10
    score += Math.min(25, (profile.skills || []).length * 4)
    score += (profile.resumes && profile.resumes.length > 0) ? 15 : 0
    score += Math.min(10, (profile.projects || []).length * 5)
    return Math.min(100, score)
  }

  const resumeAnalysis = resumeAnalysisService.analyze(profile)
  const portfolioScore = portfolioService.strength(portfolioService.get())
  const applications = profile?.applications || []

  const handleApply = async (jobId: string) => {
    const res = await jobService.applyToJob(jobId)
    if (res.success) {
      const updated = profileService.get()
      setProfile(updated)
      showToast('Application submitted successfully! 🚀')
    } else {
      showToast(res.message)
    }
  }

  const handleToggleSave = async (jobId: string) => {
    const isNowSaved = await jobService.toggleSave(jobId)
    const updated = profileService.get()
    setProfile(updated)
    setSavedJobs(updated.savedJobs || [])
    showToast(isNowSaved ? 'Job saved to bookmarks' : 'Job removed from bookmarks')
  }

  // Company avatar badge colors
  const badgeColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600']

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-7 sm:p-9 shadow-xl shadow-blue-500/15">
        {/* Background Graphic elements */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/10 skew-x-12 translate-x-32 pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide text-blue-100">
              <Sparkles size={14} className="text-amber-300" />
              <span>AI Job Match Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {profile?.name?.split(' ')[0] || 'Avinash'} 👋
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-medium">
              You have <span className="font-bold underline">{applications.length} active applications</span> and <span className="font-bold underline">1 scheduled interview</span>. 12 new high-match positions were discovered today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white shadow-none font-bold"
              onClick={() => nav('/jobs')}
            >
              <Briefcase size={16} />
              <span>Explore 50+ Jobs</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10 font-bold border-none"
              onClick={() => nav('/interview-practice')}
            >
              <Video size={16} />
              <span>Interview Studio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive AI Copilot Bar on Dashboard */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              <Sparkles size={15} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Ask AI Copilot</h3>
              <p className="text-[11px] text-slate-500">Ask career guidance, platform workflows, or say 'Take me to my portfolio'</p>
            </div>
          </div>
          <button
            onClick={() => nav('/ai-agent')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full AI Hub</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Quick query buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            '🌐 Take me to my portfolio',
            '💼 Show jobs suitable for my profile',
            '📄 Show me my applications',
            '📊 Improve my resume ATS score',
            '🎙️ How do I prepare for an interview?',
            '📁 How can I upload my project?',
            '🛡️ Where can I upload my documents?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => nav(`/ai-agent`)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-medium border border-slate-200/80 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Interview Alert Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20 shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 tracking-wider">
                Upcoming Round
              </span>
              <span className="text-xs text-slate-500 font-semibold">Thursday, 3:00 PM (45 mins)</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              Senior Business Analyst — Technical Interview with Northstar Analytics
            </h3>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 font-bold shrink-0"
          onClick={() => nav('/interview-practice/setup?type=Technical')}
        >
          <span>Practice Technical Round</span>
          <ChevronRight size={15} />
        </Button>
      </div>

      {/* 4 Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Profile Strength */}
        <Card hoverable className="relative overflow-hidden cursor-pointer" onClick={() => nav('/profile')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Profile Completeness
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{profileCompletion()}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion()}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">All core sections populated</div>
          </div>
        </Card>

        {/* Resume Score */}
        <Card hoverable className="relative overflow-hidden cursor-pointer" onClick={() => nav('/resume')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resume ATS Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{resumeAnalysis.score}</span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Top 5%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${resumeAnalysis.score}%` }}
              ></div>
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-2">Keywords optimized for BA</div>
          </div>
        </Card>

        {/* Active Applications */}
        <Card hoverable className="relative overflow-hidden cursor-pointer" onClick={() => nav('/applications')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{applications.length}</span>
              <span className="text-xs text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                2 in Stage 2+
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2 line-clamp-1">
              {applications.filter((a: any) => a.status === 'Interview Scheduled').length} Scheduled ·{' '}
              {applications.filter((a: any) => a.status === 'AI Screening').length} Screening
            </div>
            <div className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
              <span>View Kanban board</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </Card>

        {/* Portfolio Strength */}
        <Card hoverable className="relative overflow-hidden cursor-pointer" onClick={() => nav('/portfolio')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Portfolio Strength
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{portfolioScore}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${portfolioScore}%` }}
              ></div>
            </div>
            <div className="text-xs text-indigo-700 font-semibold mt-2">2 projects featured</div>
          </div>
        </Card>
      </div>

      {/* AI Career Insights & Recommendations */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">AI Career Copilot Recommendations</h2>
              <p className="text-xs text-slate-500">Tailored action points to increase recruiter response rate</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav('/ai-agent')} className="text-indigo-600 font-bold">
            <span>Ask AI Copilot</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-blue-50/50 transition-colors">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-extrabold mb-1">
              <Award size={14} />
              <span>Skill Gap Optimization</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              82% of top-paying Business Analyst roles demand <span className="font-bold text-slate-900">Power BI & Python</span>.
            </p>
            <button
              onClick={() => nav('/profile')}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Add to profile skills →</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-extrabold mb-1">
              <TrendingUp size={14} />
              <span>Resume ATS Check</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Your resume scored <span className="font-bold text-slate-900">94/100</span>. Adding quantifiable business impact metrics will reach 98%.
            </p>
            <button
              onClick={() => nav('/resume')}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Review ATS Breakdown →</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/50 transition-colors">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-extrabold mb-1">
              <Video size={14} />
              <span>Interview Readiness</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Complete a 5-minute <span className="font-bold text-slate-900">Technical SQL & BA Case Study</span> practice session.
            </p>
            <button
              onClick={() => nav('/interview-practice')}
              className="mt-3 text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>Start Practice Session →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Jobs for You</h2>
            <p className="text-xs text-slate-500">Ranked by AI compatibility with your skillset and experience</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav('/jobs')} className="text-blue-600 font-bold">
            <span>View All ({jobs.length})</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.slice(0, 6).map((job, idx) => {
            const isSaved = savedJobs.includes(job.id)
            const hasApplied = applications.some((a: any) => a.jobId === job.id)
            const matchScore = 92 - (idx * 2)

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Row: Company Badge & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl text-white font-extrabold flex items-center justify-center text-base shadow-sm ${
                          badgeColors[idx % badgeColors.length]
                        }`}
                      >
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3
                          onClick={() => nav(`/jobs/${job.id}`)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                        >
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <span className="match-pill shrink-0">
                      <Sparkles size={11} />
                      <span>{matchScore}% Match</span>
                    </span>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 my-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                      {job.workMode}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{Math.round(job.salaryMin / 100000)}-{Math.round(job.salaryMax / 100000)} LPA
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {(job.skills || []).slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 text-slate-600 rounded-lg border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length > 3 && (
                      <span className="px-1.5 py-1 text-[10px] text-slate-400">
                        +{(job.skills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleToggleSave(job.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <Bookmark size={16} className={isSaved ? 'fill-amber-500' : ''} />
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => nav(`/jobs/${job.id}`)}
                      className="font-semibold text-xs text-slate-600"
                    >
                      Details
                    </Button>
                    <Button
                      variant={hasApplied ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={hasApplied}
                      onClick={() => handleApply(job.id)}
                      className="font-bold text-xs"
                    >
                      {hasApplied ? 'Applied ✓' : 'Quick Apply'}
                    </Button>
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
