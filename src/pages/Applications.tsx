import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ClipboardList,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  X,
  FileText,
  Video,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Mail,
  MessageSquare,
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  XCircle,
  Phone,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react'
import {
  applicationService,
  CandidateApplication,
  ApplicationStage,
  ApplicationKPIs
} from '../services/applicationService'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

// Pipeline stages for compact progress visualization
const PIPELINE_STAGES: { stage: ApplicationStage; label: string; shortLabel: string }[] = [
  { stage: 'Applied', label: 'Applied', shortLabel: 'Applied' },
  { stage: 'Resume Screening', label: 'Resume Screening', shortLabel: 'Resume' },
  { stage: 'AI Screening', label: 'Recruiter Screening Call', shortLabel: 'Recruiter Call' },
  { stage: 'Shortlisted', label: 'Shortlisted', shortLabel: 'Shortlisted' },
  { stage: 'Interview', label: 'Interview', shortLabel: 'Interview' },
  { stage: 'HR Round', label: 'HR Round', shortLabel: 'HR' },
  { stage: 'Offer', label: 'Offer', shortLabel: 'Offer' }
]

function getStageStepIndex(status: ApplicationStage): number {
  switch (status) {
    case 'Applied':
    case 'Application Submitted':
      return 0
    case 'Resume Screening':
      return 1
    case 'AI Screening':
      return 2
    case 'Shortlisted':
      return 3
    case 'Interview':
    case 'Interview Scheduled':
    case 'Interview in Progress':
    case 'Interview Completed':
    case 'Technical Round':
      return 4
    case 'HR Round':
    case 'Under Review':
      return 5
    case 'Selected':
    case 'Offer':
      return 6
    case 'Rejected':
    case 'Withdrawn':
    case 'On Hold':
      return -1
    default:
      return 0
  }
}

function getStatusBadgeStyle(status: ApplicationStage): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Selected':
    case 'Offer':
      return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 'Interview':
    case 'Interview Scheduled':
    case 'Technical Round':
    case 'HR Round':
      return { bg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-700', border: 'border-indigo-200' }
    case 'Shortlisted':
      return { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' }
    case 'AI Screening':
      return { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' }
    case 'Resume Screening':
    case 'Under Review':
      return { bg: 'bg-cyan-50 text-cyan-700', text: 'text-cyan-700', border: 'border-cyan-200' }
    case 'Applied':
    case 'Application Submitted':
      return { bg: 'bg-slate-100 text-slate-700', text: 'text-slate-700', border: 'border-slate-200' }
    case 'Rejected':
      return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' }
    case 'Withdrawn':
      return { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' }
    case 'On Hold':
    default:
      return { bg: 'bg-slate-100 text-slate-600', text: 'text-slate-600', border: 'border-slate-200' }
  }
}

export default function MyApplicationsPage() {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Data states
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [kpis, setKpis] = useState<ApplicationKPIs>({
    total: 0,
    active: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    awaitingResponse: 0,
    rejected: 0,
    withdrawn: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false)

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all')
  const [selectedMatchScore, setSelectedMatchScore] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent_applied')

  // Modals & Details states
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null)
  const [withdrawingApp, setWithdrawingApp] = useState<CandidateApplication | null>(null)
  const [withdrawReason, setWithdrawReason] = useState<string>('Accepted another offer')
  const [withdrawNote, setWithdrawNote] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [detailActiveTab, setDetailActiveTab] = useState<'details' | 'match' | 'timeline' | 'interview' | 'communications' | 'documents'>('details')

  // Real-time SLA clock tick
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load applications
  const loadData = () => {
    setIsLoading(true)
    setError(null)
    try {
      const all = applicationService.getAll()
      const kpiData = applicationService.getKPIs()
      setApplications(all)
      setKpis(kpiData)

      // Sync URL tab if present
      const tabParam = searchParams.get('tab')
      if (tabParam) {
        setActiveTab(tabParam)
      }
    } catch (e) {
      setError('Unable to load applications. Please verify your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Tab Switch
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSearchParams(tabId === 'all' ? {} : { tab: tabId })
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedStatuses([])
    setSelectedSource('all')
    setSelectedLocation('all')
    setSelectedWorkMode('all')
    setSelectedMatchScore('all')
    setSelectedDateRange('all')
    setSearchQuery('')
    setSortBy('recent_applied')
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedStatuses.length > 0) count++
    if (selectedSource !== 'all') count++
    if (selectedLocation !== 'all') count++
    if (selectedWorkMode !== 'all') count++
    if (selectedMatchScore !== 'all') count++
    if (selectedDateRange !== 'all') count++
    return count
  }, [selectedStatuses, selectedSource, selectedLocation, selectedWorkMode, selectedMatchScore, selectedDateRange])

  // Filtered and Sorted Applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Tab Filter
        if (activeTab === 'active') {
          const terminal: ApplicationStage[] = ['Rejected', 'Withdrawn']
          if (terminal.includes(app.status)) return false
        } else if (activeTab === 'interviews') {
          const interviewList: ApplicationStage[] = [
            'Interview',
            'Interview Scheduled',
            'Technical Round',
            'HR Round',
            'Interview in Progress',
            'Interview Completed'
          ]
          if (!interviewList.includes(app.status)) return false
        } else if (activeTab === 'shortlisted') {
          if (app.status !== 'Shortlisted') return false
        } else if (activeTab === 'rejected') {
          if (app.status !== 'Rejected') return false
        } else if (activeTab === 'offers') {
          if (app.status !== 'Offer' && app.status !== 'Selected') return false
        } else if (activeTab === 'withdrawn') {
          if (app.status !== 'Withdrawn') return false
        }

        // Search Query
        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase()
          const matchCompany = app.company.toLowerCase().includes(term)
          const matchTitle = app.jobTitle.toLowerCase().includes(term)
          const matchId = app.id.toLowerCase().includes(term)
          const matchLocation = app.location.toLowerCase().includes(term)
          if (!matchCompany && !matchTitle && !matchId && !matchLocation) return false
        }

        // Status filter
        if (selectedStatuses.length > 0) {
          if (!selectedStatuses.includes(app.status)) return false
        }

        // Source filter
        if (selectedSource === 'manual' && app.applicationSource !== 'manual') return false
        if (selectedSource === 'auto_apply' && app.applicationSource !== 'auto_apply') return false

        // Location filter
        if (selectedLocation !== 'all' && !app.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false
        }

        // Work Mode filter
        if (selectedWorkMode !== 'all' && app.workMode.toLowerCase() !== selectedWorkMode.toLowerCase()) {
          return false
        }

        // Match Score filter
        if (selectedMatchScore === '90+') {
          if (app.matchScore < 90) return false
        } else if (selectedMatchScore === '80-89') {
          if (app.matchScore < 80 || app.matchScore > 89) return false
        } else if (selectedMatchScore === '70-79') {
          if (app.matchScore < 70 || app.matchScore > 79) return false
        } else if (selectedMatchScore === 'below70') {
          if (app.matchScore >= 70) return false
        }

        // Applied Date filter
        if (selectedDateRange !== 'all') {
          const appliedTime = new Date(app.appliedAt).getTime()
          const diffDays = (nowTimestamp - appliedTime) / (1000 * 3600 * 24)
          if (selectedDateRange === 'today' && diffDays > 1) return false
          if (selectedDateRange === '7days' && diffDays > 7) return false
          if (selectedDateRange === '30days' && diffDays > 30) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'recent_applied') {
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        }
        if (sortBy === 'recent_updated') {
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        }
        if (sortBy === 'highest_match') {
          return b.matchScore - a.matchScore
        }
        if (sortBy === 'lowest_match') {
          return a.matchScore - b.matchScore
        }
        if (sortBy === 'upcoming_interview') {
          const aTime = a.interview?.date ? 1 : 0
          const bTime = b.interview?.date ? 1 : 0
          return bTime - aTime
        }
        if (sortBy === 'oldest_applied') {
          return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
        }
        return 0
      })
  }, [
    applications,
    activeTab,
    searchQuery,
    selectedStatuses,
    selectedSource,
    selectedLocation,
    selectedWorkMode,
    selectedMatchScore,
    selectedDateRange,
    sortBy,
    nowTimestamp
  ])

  // Handle Withdrawal Submission
  const handleConfirmWithdraw = () => {
    if (!withdrawingApp) return
    const updated = applicationService.withdraw(withdrawingApp.id, withdrawReason, withdrawNote)
    if (updated) {
      setApplications(applicationService.getAll())
      setKpis(applicationService.getKPIs())
      if (selectedApp?.id === withdrawingApp.id) {
        setSelectedApp(updated)
      }
      showToast(`Application for ${withdrawingApp.jobTitle} at ${withdrawingApp.company} has been withdrawn.`)
    }
    setWithdrawingApp(null)
    setWithdrawNote('')
  }

  // Format SLA time remaining
  const formatSLA = (deadlineStr?: string) => {
    if (!deadlineStr) return null
    const deadline = new Date(deadlineStr).getTime()
    const diff = deadline - nowTimestamp
    if (diff <= 0) {
      const overdueHours = Math.floor(Math.abs(diff) / (1000 * 3600))
      const overdueMins = Math.floor((Math.abs(diff) % (1000 * 3600)) / (1000 * 60))
      return { isBreached: true, text: `SLA Breached: Overdue by ${overdueHours}h ${overdueMins}m` }
    }
    const hours = Math.floor(diff / (1000 * 3600))
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60))
    return { isBreached: false, text: `${hours}h ${mins}m remaining` }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Applications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Track your job applications, interviews, and hiring progress in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="md"
            onClick={() => nav('/auto-apply')}
            className="text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            aria-label="Manage Auto-Apply Engine"
          >
            <Sparkles size={15} />
            <span>Auto-Apply Engine</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => nav('/jobs')}
            className="text-xs font-bold"
            aria-label="Explore more job opportunities"
          >
            <Plus size={15} />
            <span>Find More Jobs</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Command Center */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { id: 'all', label: 'Total Applications', count: kpis.total, color: 'text-slate-900', bg: 'hover:border-slate-400', activeBg: 'border-slate-800 bg-slate-50/80 shadow-xs' },
          { id: 'active', label: 'Active Applications', count: kpis.active, color: 'text-blue-700', bg: 'hover:border-blue-300', activeBg: 'border-blue-600 bg-blue-50/80 shadow-xs' },
          { id: 'shortlisted', label: 'Shortlisted', count: kpis.shortlisted, color: 'text-indigo-700', bg: 'hover:border-indigo-300', activeBg: 'border-indigo-600 bg-indigo-50/80 shadow-xs' },
          { id: 'interviews', label: 'Interviews', count: kpis.interviews, color: 'text-purple-700', bg: 'hover:border-purple-300', activeBg: 'border-purple-600 bg-purple-50/80 shadow-xs' },
          { id: 'offers', label: 'Offers', count: kpis.offers, color: 'text-emerald-700', bg: 'hover:border-emerald-300', activeBg: 'border-emerald-600 bg-emerald-50/80 shadow-xs' },
          { id: 'awaiting', label: 'Awaiting Response', count: kpis.awaitingResponse, color: 'text-amber-700', bg: 'hover:border-amber-300', activeBg: 'border-amber-600 bg-amber-50/80 shadow-xs' }
        ].map((card) => {
          const isSelected = activeTab === card.id || (card.id === 'awaiting' && activeTab === 'all' && false)
          return (
            <button
              key={card.id}
              type="button"
              id={`kpiCard-${card.id}`}
              onClick={() => handleTabChange(card.id === 'awaiting' ? 'active' : card.id)}
              aria-label={`${card.label}: ${card.count}`}
              className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer group ${card.bg} ${
                isSelected ? card.activeBg : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate mb-1">
                {card.label}
              </div>
              <div className={`text-2xl font-black ${card.color} tracking-tight group-hover:scale-105 transition-transform`}>
                {isLoading ? <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" /> : card.count}
              </div>
            </button>
          )
        })}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max pb-0.5" role="tablist" aria-label="Application categories">
          {[
            { id: 'all', label: 'All', count: kpis.total },
            { id: 'active', label: 'Active', count: kpis.active },
            { id: 'interviews', label: 'Interviews', count: kpis.interviews },
            { id: 'shortlisted', label: 'Shortlisted', count: kpis.shortlisted },
            { id: 'offers', label: 'Offers', count: kpis.offers },
            { id: 'rejected', label: 'Rejected', count: kpis.rejected },
            { id: 'withdrawn', label: 'Withdrawn', count: kpis.withdrawn }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter Bar & Sort Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Dynamic Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="applicationSearch"
              type="text"
              aria-label="Search applications by company, job title, or application ID"
              placeholder="Search applications by company, job title, or application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Filter Toggle Button */}
            <button
              type="button"
              id="toggleFilterPanelBtn"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              aria-label="Toggle filter panel"
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                showFilterPanel || activeFilterCount > 0
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <ArrowUpDown size={13} className="text-slate-400" />
              <label htmlFor="applicationSort" className="text-slate-400 font-semibold mr-1">Sort:</label>
              <select
                id="applicationSort"
                aria-label="Sort applications"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="recent_applied">Recently Applied</option>
                <option value="recent_updated">Recently Updated</option>
                <option value="highest_match">Highest Match Score</option>
                <option value="lowest_match">Lowest Match Score</option>
                <option value="upcoming_interview">Upcoming Interview</option>
                <option value="oldest_applied">Oldest Application</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilterPanel && (
          <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in slide-in-from-top-2 duration-200">
            {/* Status Filter */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Stage / Status</label>
              <select
                aria-label="Filter by application status"
                value={selectedStatuses[0] || 'all'}
                onChange={(e) => setSelectedStatuses(e.target.value === 'all' ? [] : [e.target.value])}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                <option value="Application Submitted">Applied / Submitted</option>
                <option value="Resume Screening">Resume Screening</option>
                <option value="AI Screening">Recruiter Call / Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Technical Round">Technical Round</option>
                <option value="HR Round">HR Round</option>
                <option value="Under Review">Under Review</option>
                <option value="Offer">Offer Released</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Application Source */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Application Source</label>
              <select
                aria-label="Filter by application source"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="manual">👤 Manual Application</option>
                <option value="auto_apply">🤖 RAS Auto-Apply</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Work Mode</label>
              <select
                aria-label="Filter by work mode"
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Work Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            {/* Match Score */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">AI Match Score</label>
              <select
                aria-label="Filter by match score range"
                value={selectedMatchScore}
                onChange={(e) => setSelectedMatchScore(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Match Scores</option>
                <option value="90+">90%+ (High Fit)</option>
                <option value="80-89">80% – 89% (Good Fit)</option>
                <option value="70-79">70% – 79% (Moderate Fit)</option>
                <option value="below70">Below 70%</option>
              </select>
            </div>

            {/* Applied Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Applied Date</label>
              <select
                aria-label="Filter by applied date"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            {/* Filter Buttons */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-end justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                id="resetFiltersBtn"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
                aria-label="Reset all active filters"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                id="applyFiltersBtn"
                onClick={() => setShowFilterPanel(false)}
                className="text-xs font-bold"
                aria-label="Apply configured filters"
              >
                <span>Apply Filters ({filteredApplications.length} Results)</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs font-bold border-rose-300 text-rose-800 hover:bg-rose-100">
            <RefreshCw size={12} />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Applications Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-6 bg-white border border-slate-200 rounded-3xl animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="w-full h-12 bg-slate-100 rounded-xl" />
              <div className="w-full h-20 bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        /* Contextual Empty State */
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-4 max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
            {activeTab === 'interviews' ? (
              <Video size={28} />
            ) : activeTab === 'offers' ? (
              <Award size={28} />
            ) : searchQuery || activeFilterCount > 0 ? (
              <Search size={28} />
            ) : (
              <Briefcase size={28} />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {activeTab === 'interviews'
                ? 'No interviews scheduled'
                : activeTab === 'active'
                ? 'No active applications'
                : activeTab === 'offers'
                ? 'No offers received yet'
                : searchQuery || activeFilterCount > 0
                ? 'No applications match your filters'
                : 'No applications yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'interviews'
                ? 'Your scheduled technical and HR interview rounds will appear here with instant WebRTC links.'
                : activeTab === 'offers'
                ? 'When employers release formal offer letters, they will be listed here for review and acceptance.'
                : searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search terms, status filters, or match score range.'
                : 'Start exploring verified jobs that match your skills and experience to launch applications.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {searchQuery || activeFilterCount > 0 ? (
              <Button variant="primary" size="md" onClick={handleResetFilters} className="text-xs font-bold">
                <RefreshCw size={14} />
                <span>Reset Filters</span>
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={() => nav('/jobs')} className="text-xs font-bold">
                <Plus size={14} />
                <span>Explore Jobs</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Applications List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredApplications.map((app) => {
            const statusStyle = getStatusBadgeStyle(app.status)
            const currentStepIdx = getStageStepIndex(app.status)
            const slaInfo = app.sla?.enabled ? formatSLA(app.sla.deadline) : null

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Card Top: Company, Title & Source */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {app.companyLogo ? (
                        <img
                          src={app.companyLogo}
                          alt={app.company}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                          {app.company.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {app.jobTitle}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 flex-wrap">
                          <span className="font-bold text-slate-800">{app.company}</span>
                          {app.companyRating && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold">
                              ⭐ {app.companyRating}
                            </span>
                          )}
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400 font-mono text-[11px]">{app.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {app.applicationSource === 'auto_apply' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                          <Bot size={13} className="text-purple-600" />
                          <span>🤖 RAS Auto-Apply</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          <User size={13} className="text-blue-600" />
                          <span>👤 Manual Application</span>
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusStyle.bg} ${statusStyle.border}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Job Metadata Chips */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1 font-semibold">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{app.location}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <div className="flex items-center gap-1 font-semibold">
                      <Briefcase size={13} className="text-slate-400" />
                      <span>{app.workMode}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <div className="font-extrabold text-slate-800">
                      <span>{app.salary}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">Applied {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* AI Match Breakdown Banner */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-amber-400" />
                        <span className="text-xs font-bold text-slate-200">AI Compatibility Score</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-xs">
                        {app.matchScore}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Skills</div>
                        <div className="text-xs font-black text-slate-100">{app.matchBreakdown.skills}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Experience</div>
                        <div className="text-xs font-black text-slate-100">{app.matchBreakdown.experience}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Location</div>
                        <div className="text-xs font-black text-slate-100">{app.matchBreakdown.location}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Education</div>
                        <div className="text-xs font-black text-slate-100">{app.matchBreakdown.education}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Compact 7-Stage Recruitment Progress Pipeline */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recruitment Pipeline Progress
                    </div>
                    <div className="grid grid-cols-7 gap-1 items-center">
                      {PIPELINE_STAGES.map((step, idx) => {
                        const isTerminal = currentStepIdx === -1
                        const isCompleted = !isTerminal && currentStepIdx > idx
                        const isActive = !isTerminal && currentStepIdx === idx
                        return (
                          <div key={step.stage} className="flex flex-col items-center gap-1 group/step">
                            <div
                              className={`w-full h-1.5 rounded-full transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : isActive
                                  ? 'bg-blue-600 animate-pulse'
                                  : 'bg-slate-200'
                              }`}
                              title={`${step.label}: ${isCompleted ? 'Completed' : isActive ? 'Active' : 'Pending'}`}
                            />
                            <span
                              className={`text-[10px] font-extrabold truncate w-full text-center tracking-tight flex items-center justify-center gap-1 ${
                                isCompleted
                                  ? 'text-emerald-700 font-bold'
                                  : isActive
                                  ? 'text-blue-700 font-extrabold'
                                  : 'text-slate-400 font-medium'
                              }`}
                            >
                              {isCompleted && <span className="text-[9px] text-emerald-600 font-black">✓</span>}
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />}
                              <span>{step.shortLabel}</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Next Action Box */}
                  {app.nextAction && app.status !== 'Withdrawn' && (
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900">
                          {app.nextAction.type === 'interview' ? (
                            <Video size={14} className="text-indigo-600" />
                          ) : app.nextAction.type === 'offer' ? (
                            <Award size={14} className="text-emerald-600" />
                          ) : app.nextAction.type === 'feedback' ? (
                            <AlertCircle size={14} className="text-rose-600" />
                          ) : (
                            <Clock size={14} className="text-indigo-600" />
                          )}
                          <span>{app.nextAction.title}</span>
                        </div>

                        {app.nextAction.date && (
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                            {app.nextAction.date}
                          </span>
                        )}
                      </div>

                      {app.nextAction.description && (
                        <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                          {app.nextAction.description}
                        </p>
                      )}

                      {app.nextAction.actionLabel && (
                        <div className="pt-1 flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (app.nextAction?.actionUrl) nav(app.nextAction.actionUrl)
                              else setSelectedApp(app)
                            }}
                            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none"
                            aria-label={app.nextAction.actionLabel}
                          >
                            <span>{app.nextAction.actionLabel}</span>
                            <ArrowUpDown size={12} className="rotate-90" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SLA Real-Time Status indicator */}
                  {slaInfo && (
                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        slaInfo.isBreached
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-100'
                      }`}
                    >
                      <Clock size={13} className={slaInfo.isBreached ? 'text-rose-600' : 'text-blue-600'} />
                      <span>{slaInfo.isBreached ? '⚠' : '⏱'} Recruiter Response: {slaInfo.text}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    id={`viewApplicationBtn-${app.id}`}
                    onClick={() => {
                      setSelectedApp(app)
                      setDetailActiveTab('details')
                    }}
                    aria-label={`View full details for application ${app.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer group/btn"
                  >
                    <span>View Application</span>
                    <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-2">
                    {app.status === 'Offer' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app)
                          setDetailActiveTab('interview')
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold border-none"
                      >
                        <Award size={13} />
                        <span>Review Offer</span>
                      </Button>
                    ) : app.interview?.status === 'scheduled' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => nav('/meetings')}
                        className="text-xs font-bold"
                      >
                        <Video size={13} />
                        <span>Join Meeting</span>
                      </Button>
                    ) : app.status !== 'Withdrawn' && app.status !== 'Rejected' ? (
                      <button
                        type="button"
                        id={`withdrawCardBtn-${app.id}`}
                        onClick={() => setWithdrawingApp(app)}
                        aria-label={`Withdraw application for ${app.jobTitle}`}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors cursor-pointer"
                      >
                        Withdraw
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED APPLICATION VIEW MODAL                                           */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="appDetailModalTitle"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-start gap-4">
                {selectedApp.companyLogo ? (
                  <img
                    src={selectedApp.companyLogo}
                    alt={selectedApp.company}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                    {selectedApp.company.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 id="appDetailModalTitle" className="text-xl sm:text-2xl font-black text-white">
                      {selectedApp.jobTitle}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {selectedApp.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                    <span className="font-bold text-white">{selectedApp.company}</span>
                    <span>·</span>
                    <span>{selectedApp.location} ({selectedApp.workMode})</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-extrabold">{selectedApp.salary}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                aria-label="Close application details modal"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'details', label: 'Job & Application' },
                { id: 'match', label: `AI Match (${selectedApp.matchScore}%)` },
                { id: 'timeline', label: 'Timeline' },
                { id: 'interview', label: 'Interview Info' },
                { id: 'communications', label: 'Communications' },
                { id: 'documents', label: 'Documents' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDetailActiveTab(t.id as any)}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    detailActiveTab === t.id
                      ? 'border-blue-600 text-blue-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
              {/* TAB 1: JOB & APPLICATION DETAILS */}
              {detailActiveTab === 'details' && (
                <div className="space-y-6">
                  {/* Status & SLA Alert */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs font-bold text-slate-500 uppercase">Current Stage</div>
                      <div className="text-base font-extrabold text-blue-700">{selectedApp.status}</div>
                      <div className="text-xs text-slate-500">
                        Applied via {selectedApp.applicationSource === 'auto_apply' ? '🤖 RAS Auto-Apply' : '👤 Manual Application'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                      <div className="text-xs font-bold text-indigo-700 uppercase">Recruiter Response SLA</div>
                      <div className="text-base font-extrabold text-indigo-950">
                        {selectedApp.sla?.enabled ? formatSLA(selectedApp.sla.deadline)?.text : '24-Hour Standard SLA'}
                      </div>
                      <div className="text-xs text-indigo-600">Automated escalation active</div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-900">Job Description</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {selectedApp.jobDescription || 'No full description text available.'}
                    </p>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-900">Required Skills & Competencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-xs border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Application Metadata Grid */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Application ID</span>
                      <span className="font-mono font-bold text-slate-800">{selectedApp.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Applied Date</span>
                      <span className="font-bold text-slate-800">{new Date(selectedApp.appliedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Last Updated</span>
                      <span className="font-bold text-slate-800">{new Date(selectedApp.lastUpdated).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Employment Type</span>
                      <span className="font-bold text-slate-800">{selectedApp.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Resume Version</span>
                      <span className="font-bold text-slate-800 truncate block">{selectedApp.resumeUsed}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Work Mode</span>
                      <span className="font-bold text-slate-800">{selectedApp.workMode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI MATCH ANALYSIS */}
              {detailActiveTab === 'match' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs">
                        <Sparkles size={14} />
                        <span>AI Match Evaluation</span>
                      </div>
                      <h3 className="text-2xl font-black">{selectedApp.matchScore}% Overall Compatibility</h3>
                      <p className="text-xs text-slate-300 max-w-md">
                        Calculated by cross-referencing your verified portfolio, project telemetry, and ATS resume against the job description.
                      </p>
                    </div>

                    <div className="w-24 h-24 rounded-full border-4 border-amber-400 flex items-center justify-center font-black text-2xl text-amber-300 shrink-0 bg-white/5">
                      {selectedApp.matchScore}%
                    </div>
                  </div>

                  {/* 4 Pillars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Skills Coverage', val: selectedApp.matchBreakdown.skills },
                      { label: 'Experience Match', val: selectedApp.matchBreakdown.experience },
                      { label: 'Location Fit', val: selectedApp.matchBreakdown.location },
                      { label: 'Education Alignment', val: selectedApp.matchBreakdown.education }
                    ].map((p) => (
                      <div key={p.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-center">
                        <div className="text-xs text-slate-500 font-bold">{p.label}</div>
                        <div className="text-xl font-black text-slate-900">{p.val}%</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strengths and Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                        <CheckCircle2 size={16} />
                        <span>Why You're a Good Match</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                        {selectedApp.matchBreakdown.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                        <AlertTriangle size={16} />
                        <span>Identified Skill Gaps / Tips</span>
                      </div>
                      {selectedApp.matchBreakdown.gaps.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-amber-900 font-medium">
                          {selectedApp.matchBreakdown.gaps.map((gap, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-amber-600 font-bold">⚠</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-amber-800 font-semibold">
                          No significant skill gaps identified. Your credentials exceed baseline role requirements.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: APPLICATION TIMELINE */}
              {detailActiveTab === 'timeline' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">Chronological Event Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {selectedApp.timeline.map((event) => (
                      <div key={event.id} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white shadow-xs" />
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{event.title}</h5>
                            <span className="text-[11px] font-bold text-slate-400">
                              {new Date(event.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVIEW INFORMATION */}
              {detailActiveTab === 'interview' && (
                <div className="space-y-6">
                  {selectedApp.interview ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                            {selectedApp.interview.type}
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900">
                            {selectedApp.interview.interviewerName || 'Panel Interview'}
                          </h4>
                          <div className="text-xs text-slate-500 font-semibold">
                            {selectedApp.interview.interviewerRole || 'Hiring Assessment Team'}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-indigo-900">{selectedApp.interview.date || 'TBD'}</div>
                          <div className="text-xs text-slate-500 font-semibold">{selectedApp.interview.time || ''}</div>
                        </div>
                      </div>

                      {selectedApp.interview.instructions && (
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="font-bold text-slate-800 text-xs">Interview Instructions</div>
                          <p className="text-xs text-slate-600 leading-relaxed">{selectedApp.interview.instructions}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => nav(selectedApp.interview?.meetingUrl || '/meetings')}
                          className="font-bold text-xs"
                        >
                          <Video size={15} />
                          <span>Join Interview Room</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => nav('/interview-practice/setup')}
                          className="font-bold text-xs"
                        >
                          <Sparkles size={15} />
                          <span>Practice in AI Studio</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                      <Video size={32} className="mx-auto text-slate-400" />
                      <div className="font-extrabold text-slate-800 text-sm">No Live Interview Scheduled Yet</div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        When the employer shortlists your profile and schedules a round, live WebRTC video room links will be visible here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: COMMUNICATIONS */}
              {detailActiveTab === 'communications' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">Communication & Dispatch History</h4>
                  <div className="space-y-3">
                    {selectedApp.communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            comm.channel === 'whatsapp'
                              ? 'bg-emerald-100 text-emerald-700'
                              : comm.channel === 'email'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {comm.channel === 'whatsapp' ? (
                            <MessageSquare size={16} />
                          ) : comm.channel === 'email' ? (
                            <Mail size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{comm.title}</h5>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              {comm.status}
                            </span>
                          </div>
                          {comm.content && (
                            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-2 rounded-xl border border-slate-100">
                              {comm.content}
                            </p>
                          )}
                          <div className="text-[11px] text-slate-400">
                            Sent {new Date(comm.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {detailActiveTab === 'documents' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">Application Documents</h4>
                  <div className="space-y-3">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                            <FileText size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{doc.name}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              {doc.type} · {doc.size || '240 KB'} · Verified
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedApp.resumeUrl || '#', '_blank')}
                            className="text-xs font-bold"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              {selectedApp.status !== 'Withdrawn' && selectedApp.status !== 'Rejected' && (
                <Button
                  variant="outline"
                  size="sm"
                  id={`withdrawApplicationBtn-${selectedApp.id}`}
                  onClick={() => {
                    setWithdrawingApp(selectedApp)
                    setSelectedApp(null)
                  }}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold"
                  aria-label="Withdraw this application"
                >
                  <XCircle size={14} />
                  <span>Withdraw Application</span>
                </Button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                  className="text-xs font-bold"
                >
                  <span>Close</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WITHDRAW APPLICATION CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      {withdrawingApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdrawModalTitle"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 id="withdrawModalTitle" className="text-lg font-extrabold text-slate-900">
                  Withdraw Application?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {withdrawingApp.jobTitle} at {withdrawingApp.company}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to withdraw your application for <strong>{withdrawingApp.jobTitle}</strong> at{' '}
              <strong>{withdrawingApp.company}</strong>? Your application history will be preserved.
            </p>

            {/* Reasons Radio List */}
            <div className="space-y-2 text-xs font-semibold text-slate-800">
              <label className="block text-slate-500 font-bold mb-1">Please select a reason:</label>
              {[
                'Accepted another offer',
                'No longer interested',
                'Salary expectations changed',
                'Location issue',
                'Other'
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="withdrawReason"
                    value={r}
                    checked={withdrawReason === r}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {withdrawReason === 'Other' && (
              <div>
                <label className="block text-slate-500 font-bold text-xs mb-1">Additional Note:</label>
                <textarea
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="Provide details..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setWithdrawingApp(null)}
                className="text-xs font-bold"
              >
                <span>Cancel</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmWithdraw}
                className="bg-rose-600 hover:bg-rose-700 text-xs font-bold border-none"
              >
                <span>Confirm Withdrawal</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
