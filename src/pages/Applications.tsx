import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers,
  Sparkles,
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Video,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Plus,
  AlertCircle,
  Phone,
  ShieldCheck,
  Mail,
  X,
  FileText
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const KANBAN_STAGES = [
  { id: 'Application Submitted', label: 'Application Submitted', color: 'border-blue-300 bg-blue-50/40 text-blue-700' },
  { id: 'Resume Screening', label: 'Resume Screening', color: 'border-slate-300 bg-slate-50/40 text-slate-700' },
  { id: 'AI Screening', label: 'AI Screening (Voice)', color: 'border-purple-300 bg-purple-50/40 text-purple-700' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'border-indigo-300 bg-indigo-50/40 text-indigo-700' },
  { id: 'Interview Scheduled', label: 'Interview Scheduled', color: 'border-amber-300 bg-amber-50/40 text-amber-700' },
  { id: 'Interview Completed', label: 'Interview Completed', color: 'border-teal-300 bg-teal-50/40 text-teal-700' },
  { id: 'Under Review', label: 'Under Review', color: 'border-cyan-300 bg-cyan-50/40 text-cyan-700' },
  { id: 'Selected', label: 'Selected / Offer', color: 'border-emerald-300 bg-emerald-50/40 text-emerald-700' },
  { id: 'Rejected', label: 'Rejected', color: 'border-rose-300 bg-rose-50/40 text-rose-700' },
  { id: 'On Hold', label: 'On Hold', color: 'border-slate-300 bg-slate-50/40 text-slate-700' }
]

export default function ApplicationsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    setProfile(profileService.get())
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const apps = profile?.applications || []

  const moveToStatus = (appId: string, nextStatus: string) => {
    const p = profileService.get()
    p.applications = (p.applications || []).map((a: any) =>
      a.id === appId ? { ...a, status: nextStatus } : a
    )
    profileService.save(p)
    setProfile(p)
    if (selectedAppForDrawer?.id === appId) {
      setSelectedAppForDrawer({ ...selectedAppForDrawer, status: nextStatus })
    }

    notificationService.create({
      title: 'Application Workflow Update',
      message: `Status moved to "${nextStatus}"`,
      type: 'application'
    })
    showToast(`Application updated to "${nextStatus}"`)
  }

  const badgeColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600']

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            End-to-End Application Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated tracking across all 11 stages with Recruiter SLA management and AI evaluations
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => nav('/jobs')} className="font-bold">
          <Plus size={16} />
          <span>Discover More Positions</span>
        </Button>
      </div>

      {/* SLA & Pipeline Status Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 text-blue-200 rounded-full text-[10px] font-bold">
            <Clock size={12} />
            <span>Configurable SLA Policy: 24h Recruiter Action SLA</span>
          </div>
          <h3 className="text-sm font-bold">
            Automated escalation guarantees candidate responses without recruiter bottleneck
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => nav('/voice-screening')}
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold text-xs"
          >
            <Phone size={13} />
            <span>Test AI Voice Screening</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {KANBAN_STAGES.map((stage) => {
          const stageApps = apps.filter((a: any) => {
            if (stage.id === 'Selected / Offer' || stage.id === 'Selected') {
              return a.status === 'Selected' || a.status === 'Offer' || a.status === 'Offer / Selected'
            }
            if (stage.id === 'Application Submitted') {
              return a.status === 'Applied' || a.status === 'Application Submitted'
            }
            return a.status === stage.id
          })

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 bg-slate-100/90 rounded-3xl p-4 border border-slate-200/80 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-800">{stage.label}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${stage.color}`}
                  >
                    {stageApps.length}
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {stageApps.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-slate-400 font-medium">
                    No roles in this stage
                  </div>
                ) : (
                  stageApps.map((app: any, idx: number) => (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shrink-0 ${
                              badgeColors[idx % badgeColors.length]
                            }`}
                          >
                            {app.company.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4
                              onClick={() => setSelectedAppForDrawer(app)}
                              className="font-bold text-xs text-slate-900 hover:text-blue-600 cursor-pointer truncate"
                              title={app.jobTitle}
                            >
                              {app.jobTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium truncate">{app.company}</p>
                          </div>
                        </div>

                        <span className="match-pill text-[10px] px-2 py-0.5 shrink-0">
                          {app.matchScore || 90}%
                        </span>
                      </div>

                      {/* SLA Timer Indicator */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Clock size={11} className="text-blue-600" />
                        <span>SLA Status: <strong>Within 24h Window</strong></span>
                      </div>

                      {/* Move Stage Selector & Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => moveToStatus(app.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-blue-500 max-w-[130px] truncate"
                        >
                          {KANBAN_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              → {s.id}
                            </option>
                          ))}
                        </select>

                        {app.status === 'Interview Scheduled' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              nav(
                                `/interview/room/${app.id}?role=${encodeURIComponent(
                                  app.jobTitle
                                )}&company=${encodeURIComponent(app.company)}`
                              )
                            }
                            className="text-[10px] py-1 px-2.5 font-bold"
                          >
                            <Video size={11} />
                            <span>Join Live</span>
                          </Button>
                        ) : app.status === 'AI Screening' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => nav('/voice-screening')}
                            className="text-[10px] py-1 px-2.5 font-bold bg-purple-600 hover:bg-purple-700"
                          >
                            <Phone size={11} />
                            <span>Voice Call</span>
                          </Button>
                        ) : (
                          <button
                            onClick={() => setSelectedAppForDrawer(app)}
                            className="text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Application Detail Drawer Modal */}
      {selectedAppForDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                  Application Dossier
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedAppForDrawer.jobTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedAppForDrawer.company} · {selectedAppForDrawer.location}
                </p>
              </div>

              <button
                onClick={() => setSelectedAppForDrawer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stage Progress Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Hiring Stage
              </div>
              <div className="text-sm font-extrabold text-blue-600">
                {selectedAppForDrawer.status}
              </div>
              <div className="text-[11px] text-slate-500">
                Applied on: {new Date(selectedAppForDrawer.appliedDate).toLocaleDateString()}
              </div>
            </div>

            {/* Recruiter SLA & Automated Action */}
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                <ShieldCheck size={14} />
                <span>Recruiter SLA & AI Escalation Protocol</span>
              </div>
              <p className="leading-relaxed">
                If the hiring manager does not review within 24 hours, the AI engine triggers escalation reminders and prepares automated interview scheduling per organization policy.
              </p>
            </div>

            {/* Action Buttons based on stage */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedAppForDrawer(null)
                  nav(
                    `/interview/room/${selectedAppForDrawer.id}?role=${encodeURIComponent(
                      selectedAppForDrawer.jobTitle
                    )}&company=${encodeURIComponent(selectedAppForDrawer.company)}`
                  )
                }}
                className="font-bold text-xs"
              >
                <Video size={15} />
                <span>Launch AI Interview Room</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedAppForDrawer(null)
                  nav('/voice-screening')
                }}
                className="font-bold text-xs"
              >
                <Phone size={14} />
                <span>AI Voice Screening</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
