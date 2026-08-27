import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  MapPin,
  Building2,
  DollarSign,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Briefcase,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
  Send,
  Star,
  Clock,
  Zap,
  Award
} from 'lucide-react'
import { jobService } from '../services/jobService'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import JobComparisonModal from '../components/JobComparisonModal'

const HIRING_PERIODS = [
  'All Periods',
  'Immediate (0-15 Days)',
  'Active · Next 15 Days',
  'Urgent Joining (7 Days)',
  '30 Days Notice Accepted',
  'Active · Next 30 Days',
  'Cohort Joining (Q3)'
]

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const nav = useNavigate()
  const [jobs, setJobs] = useState<any[]>([])
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedJobForModal, setSelectedJobForModal] = useState<any>(null)
  const [comparingJob, setComparingJob] = useState<any>(null)
  const [applyNotes, setApplyNotes] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const q = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const workMode = searchParams.get('workMode') || ''
  const hiringPeriod = searchParams.get('hiringPeriod') || ''
  const minRating = searchParams.get('minRating') || ''
  const sort = searchParams.get('sort') || 'best'

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setSavedJobs(p?.savedJobs || [])
    jobService.list().then((data) => {
      setAllJobs(data)
      const uniqueLocs = Array.from(new Set(data.map((j: any) => j.location)))
      setLocations(uniqueLocs as string[])
    })
  }, [])

  useEffect(() => {
    const filters: any = {
      location: location || undefined,
      workMode: workMode || undefined,
      hiringPeriod: hiringPeriod || undefined,
      minRating: minRating || undefined,
      sort
    }
    jobService.search(q, filters).then(setJobs)
  }, [q, location, workMode, hiringPeriod, minRating, sort])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const updateParam = (key: string, value: any) => {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '' || value === 'all' || value === 'All Periods') {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    setSearchParams(next)
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const handleToggleSave = async (jobId: string) => {
    const isNowSaved = await jobService.toggleSave(jobId)
    const updated = profileService.get()
    setProfile(updated)
    setSavedJobs(updated.savedJobs || [])
    showToast(isNowSaved ? 'Job bookmarked!' : 'Job removed from bookmarks')
  }

  const handleQuickApply = async (job: any) => {
    const res = await jobService.applyToJob(job.id, applyNotes)
    if (res.success) {
      const updated = profileService.get()
      setProfile(updated)
      setSelectedJobForModal(null)
      setApplyNotes('')
      showToast('Application successfully submitted! 🎉')
    } else {
      showToast(res.message || 'Failed to submit application')
    }
  }

  const badgeColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600']

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Filter Controls Bar */}
      <div className="bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Opportunities</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curated high-growth tech & business roles with verified Employer Response SLAs & fast-track hiring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="best">✨ AI Best Match</option>
              <option value="rating_desc">⭐ Company Rating: High → Low</option>
              <option value="latest">⚡ Latest Posted</option>
              <option value="salary_desc">💰 Salary: High → Low</option>
              <option value="salary_asc">💵 Salary: Low → High</option>
            </select>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <Input
              icon={<Search size={16} />}
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search title, skill (SQL, Python, Snowflake), company..."
            />
            {q && (
              <button
                onClick={() => updateParam('q', '')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="lg:col-span-2">
            <select
              value={location}
              onChange={(e) => updateParam('location', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Hiring Period Filter */}
          <div className="lg:col-span-2">
            <select
              value={hiringPeriod}
              onChange={(e) => updateParam('hiringPeriod', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Hiring Periods</option>
              {HIRING_PERIODS.slice(1).map((hp) => (
                <option key={hp} value={hp}>
                  ⏱️ {hp}
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode Filter */}
          <div className="lg:col-span-2">
            <select
              value={workMode}
              onChange={(e) => updateParam('workMode', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Work Modes</option>
              <option value="Remote">🌐 Remote</option>
              <option value="Hybrid">🏢 Hybrid</option>
              <option value="Onsite">📍 Onsite</option>
            </select>
          </div>

          {/* Company Rating Filter */}
          <div className="lg:col-span-2">
            <select
              value={minRating}
              onChange={(e) => updateParam('minRating', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="4.8">⭐ 4.8+ Fast Responders</option>
              <option value="4.6">⭐ 4.6+ High Response</option>
              <option value="4.5">⭐ 4.5+ Standard</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Smart Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Quick Filters:</span>
          
          <button
            onClick={() => updateParam('hiringPeriod', hiringPeriod === 'Immediate (0-15 Days)' ? '' : 'Immediate (0-15 Days)')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              hiringPeriod === 'Immediate (0-15 Days)'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            ⚡ Immediate (0-15 Days)
          </button>

          <button
            onClick={() => updateParam('workMode', workMode === 'Remote' ? '' : 'Remote')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              workMode === 'Remote'
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/30'
                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
            }`}
          >
            🌐 Remote Only
          </button>

          <button
            onClick={() => updateParam('minRating', minRating === '4.8' ? '' : '4.8')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              minRating === '4.8'
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-500/30'
                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/20'
            }`}
          >
            ⭐ Fast Responders (4.8+ ★)
          </button>
        </div>

        {/* Active Filters Pills */}
        {(q || location || workMode || hiringPeriod || minRating) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">Active filters:</span>
            {q && (
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                Keyword: "{q}"
                <X size={12} className="cursor-pointer hover:text-blue-900 dark:hover:text-white" onClick={() => updateParam('q', '')} />
              </span>
            )}
            {location && (
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                Location: {location}
                <X size={12} className="cursor-pointer hover:text-blue-900 dark:hover:text-white" onClick={() => updateParam('location', '')} />
              </span>
            )}
            {hiringPeriod && (
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-lg font-semibold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                Period: {hiringPeriod}
                <X size={12} className="cursor-pointer hover:text-amber-900 dark:hover:text-white" onClick={() => updateParam('hiringPeriod', '')} />
              </span>
            )}
            {minRating && (
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                Rating: {minRating}+ ★
                <X size={12} className="cursor-pointer hover:text-indigo-900 dark:hover:text-white" onClick={() => updateParam('minRating', '')} />
              </span>
            )}
            {workMode && (
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                Mode: {workMode}
                <X size={12} className="cursor-pointer hover:text-blue-900 dark:hover:text-white" onClick={() => updateParam('workMode', '')} />
              </span>
            )}
            <button onClick={resetFilters} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline ml-2 cursor-pointer">
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Match Tagline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Found <strong className="text-slate-900 dark:text-white font-extrabold">{jobs.length}</strong> Opportunities
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
            Live Database
          </span>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
          <Sparkles size={13} className="text-emerald-500 dark:text-emerald-400 animate-pulse" />
          <span>Ranked by AI Compatibility & 24h Recruiter SLA</span>
        </span>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Briefcase size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No jobs match your search criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, resetting filters, or broadening hiring periods.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 font-bold">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job, idx) => {
            const isSaved = savedJobs.includes(job.id)
            const hasApplied = (profile?.applications || []).some((a: any) => a.jobId === job.id)
            const matchScore = Math.max(72, 95 - ((idx % 10) * 2))

            // Dynamic gradient palette for company avatars
            const avatarGradients = [
              'from-blue-600 to-indigo-600',
              'from-indigo-600 to-purple-600',
              'from-violet-600 to-fuchsia-600',
              'from-emerald-600 to-teal-600',
              'from-amber-500 to-orange-600',
              'from-rose-600 to-pink-600'
            ]
            const avatarGrad = avatarGradients[idx % avatarGradients.length]

            return (
              <div
                key={job.id}
                className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between group relative backdrop-blur-sm hover:-translate-y-1"
              >
                {/* Glowing subtle hover accent */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/50 to-transparent transition-all" />

                <div>
                  {/* Top Bar: Company Avatar, Title, Rating & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Gradient squircle avatar */}
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGrad} text-white font-extrabold flex items-center justify-center text-base shadow-md shadow-slate-900/10 shrink-0 ring-2 ring-white/20`}
                      >
                        {job.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => nav(`/jobs/${job.id}`)}
                          className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
                          title={job.title}
                        >
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[130px]">
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

                    {/* Match Score Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] shrink-0 shadow-xs">
                      <Sparkles size={11} className="text-emerald-500 dark:text-emerald-400" />
                      <span>{matchScore}%</span>
                    </span>
                  </div>

                  {/* Hiring Period & Response Velocity Badges (Creative Frosted Glass) */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
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

                  {/* Location & Compensation Details */}
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

                  {/* Skills Tags with interactive hover glow */}
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

                {/* Bottom Action Controls */}
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
                      onClick={() => setComparingJob(job)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Compare JD with Candidate Profile"
                    >
                      <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
                      <span>JD Match</span>
                    </button>

                    <button
                      onClick={() => nav(`/jobs/${job.id}`)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      disabled={hasApplied}
                      onClick={() => setSelectedJobForModal(job)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                        hasApplied
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {hasApplied ? 'Applied ✓' : '1-Click Apply'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 1-Click Apply Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Apply with Gettin Candidate Profile
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedJobForModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{selectedJobForModal.company} · {selectedJobForModal.location}</p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1">
                <div className="font-bold text-slate-800">Attached Candidate Profile:</div>
                <div>👤 {profile?.name || 'Avinash Tiwari'} (Contact Privacy Shield Active 🔒)</div>
                <div>📄 Primary Resume: {profile?.resumes?.[0]?.name || 'Avinash_Tiwari_Lead_BA.pdf'} (94% ATS Score)</div>
                <div>⏱️ Hiring Period: <strong>{selectedJobForModal.hiringPeriod || 'Immediate'}</strong></div>
                <div>⭐ Company Hiring Rating: <strong>{selectedJobForModal.companyRating || 4.9} / 5.0</strong> ({selectedJobForModal.companyResponseRate || '99% Response Rate'})</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional Note for Recruiter / Hiring Manager
                </label>
                <textarea
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="Mention your relevant experience, notice period, or key achievements..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setSelectedJobForModal(null)}
                className="font-semibold text-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleQuickApply(selectedJobForModal)}
                className="font-bold"
              >
                <Send size={15} />
                <span>Confirm Application</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JD vs Profile Comparison Modal */}
      {comparingJob && (
        <JobComparisonModal
          job={comparingJob}
          onClose={() => setComparingJob(null)}
          onApply={(jobId) => {
            const j = jobs.find((x) => x.id === jobId)
            if (j) setSelectedJobForModal(j)
          }}
        />
      )}
    </div>
  )
}
