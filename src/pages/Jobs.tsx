import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  MapPin,
  Filter,
  Bookmark,
  Briefcase,
  Sparkles,
  CheckCircle2,
  X,
  Send
} from 'lucide-react'
import { jobService } from '../services/jobService'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import JobComparisonModal from '../components/JobComparisonModal'

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
      sort
    }
    jobService.search(q, filters).then(setJobs)
  }, [q, location, workMode, sort])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const updateParam = (key: string, value: any) => {
    const next = new URLSearchParams(searchParams)
    if (value === undefined || value === '' || value === 'all') {
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
      showToast(res.message)
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Opportunities</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover and apply to curated roles tailored to your background
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="best">AI Best Match</option>
              <option value="latest">Latest Posted</option>
              <option value="salary_desc">Salary: High → Low</option>
              <option value="salary_asc">Salary: Low → High</option>
            </select>
          </div>
        </div>

        {/* Filter Input Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
          {/* Keyword Search */}
          <div className="lg:col-span-5 relative">
            <Input
              icon={<Search size={16} />}
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by title, skill (e.g. SQL, Power BI), or company..."
            />
            {q && (
              <button
                onClick={() => updateParam('q', '')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="lg:col-span-3">
            <select
              value={location}
              onChange={(e) => updateParam('location', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Locations (India)</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode Filter */}
          <div className="lg:col-span-2">
            <select
              value={workMode}
              onChange={(e) => updateParam('workMode', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="lg:col-span-2 flex items-center">
            <Button
              variant="outline"
              size="md"
              onClick={resetFilters}
              className="w-full text-slate-600 font-semibold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Pills */}
        {(q || location || workMode) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">Active filters:</span>
            {q && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold flex items-center gap-1 border border-blue-200">
                Keyword: "{q}"
                <X size={12} className="cursor-pointer" onClick={() => updateParam('q', '')} />
              </span>
            )}
            {location && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold flex items-center gap-1 border border-blue-200">
                Location: {location}
                <X size={12} className="cursor-pointer" onClick={() => updateParam('location', '')} />
              </span>
            )}
            {workMode && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold flex items-center gap-1 border border-blue-200">
                Mode: {workMode}
                <X size={12} className="cursor-pointer" onClick={() => updateParam('workMode', '')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Found <strong className="text-slate-900">{jobs.length}</strong> matching positions
        </span>
        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
          <Sparkles size={13} className="text-emerald-500" />
          Ranked by candidate profile match
        </span>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs match your search criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, resetting filters, or broadening location settings.
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
            const matchScore = Math.max(72, 94 - ((idx % 10) * 2))

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar: Company Badge & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0 ${
                          badgeColors[idx % badgeColors.length]
                        }`}
                      >
                        {job.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => nav(`/jobs/${job.id}`)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer truncate"
                          title={job.title}
                        >
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">{job.company}</p>
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setComparingJob(job)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      title="Compare JD with Candidate Profile"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>JD Match</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => nav(`/jobs/${job.id}`)}
                      className="font-semibold text-xs text-slate-600 px-2"
                    >
                      Details
                    </Button>
                    <Button
                      variant={hasApplied ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={hasApplied}
                      onClick={() => setSelectedJobForModal(job)}
                      className="font-bold text-xs"
                    >
                      {hasApplied ? 'Applied ✓' : '1-Click Apply'}
                    </Button>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Apply with RAS Candidate Profile
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
                <div>👤 {profile?.name || 'Avinash Tiwari'} ({profile?.email})</div>
                <div>📄 Primary Resume: {profile?.resumes?.[0]?.name || 'Avinash_Tiwari_Lead_BA.pdf'} (94% ATS)</div>
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

