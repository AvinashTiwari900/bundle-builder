import React, { useEffect, useState } from 'react'
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Sliders,
  Play,
  Briefcase,
  Layers,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
  MessageSquare,
  Eye,
  X,
  Phone,
  Send,
  Star,
  RefreshCw
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { autoApplyService, AutoApplyDispatch } from '../services/autoApplyService'
import { jobService } from '../services/jobService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function AutoApplyPage() {
  const [profile, setProfile] = useState<any>(null)
  const [enabled, setEnabled] = useState(true)
  const [minMatch, setMinMatch] = useState(80)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [dispatches, setDispatches] = useState<AutoApplyDispatch[]>([])
  const [activeDispatchModal, setActiveDispatchModal] = useState<AutoApplyDispatch | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'dispatches'>('overview')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setEnabled(p?.settings?.autoApply ?? true)
    setMinMatch(p?.settings?.minMatchScore ?? 80)
    setDispatches(autoApplyService.getDispatches())
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
    showToast(next ? 'Auto Apply Engine Enabled 🚀' : 'Auto Apply Engine Paused')
  }

  const handleRunNow = async () => {
    setRunning(true)
    try {
      const matches = await autoApplyService.run({ minMatch })
      setResults(matches)
      const updated = profileService.get()
      setProfile(updated)
      setDispatches(autoApplyService.getDispatches())
      if (matches.length > 0) {
        showToast(`Auto Apply Engine submitted ${matches.length} applications with Email & WhatsApp alerts! 🎉`)
        setActiveTab('dispatches')
      } else {
        showToast('No new unapplied jobs matched above threshold. Try lowering the slider.')
      }
    } catch (err: any) {
      showToast('Execution error: ' + err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleSendTestAlert = async () => {
    const allJobs = await jobService.list()
    if (allJobs.length > 0) {
      const sampleJob = allJobs[0]
      const alertItem = autoApplyService.triggerSingleTestAlert(sampleJob)
      setDispatches(autoApplyService.getDispatches())
      setActiveDispatchModal(alertItem)
      showToast('Test Email & WhatsApp alert generated! 📬')
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
              Continuously scans active recruiter postings and automatically applies with your optimized ATS resume whenever compatibility exceeds your threshold. Triggers instant Email & WhatsApp confirmation alerts.
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

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️ Automation Settings & Controls
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'dispatches'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail size={14} />
          <span>Triggered Email & WhatsApp Dispatches ({dispatches.length})</span>
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
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

            {/* Email & WhatsApp Notification Protocol */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <Mail size={15} className="text-blue-600" />
                <span>Triggered Notifications Protocol (Email + WhatsApp)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Whenever Gettin Candidates identifies and applies to an eligible job on your behalf, an automated confirmation is dispatched via <strong>HTML Email</strong> and <strong>WhatsApp Message</strong> containing the company name, role, application date, match score, and status.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleSendTestAlert}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={12} />
                  <span>Send Test Trigger Alert</span>
                </button>
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
                <span>Submitted Applications in this Run ({results.length})</span>
              </h3>

              <div className="space-y-3">
                {results.map((res: any) => (
                  <div
                    key={res.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{res.jobTitle}</h4>
                      <p className="text-slate-500 font-medium">{res.company} · {res.location}</p>
                    </div>
                    <span className="match-pill">{res.matchScore}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Dispatches Log Tab */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Triggered Email & WhatsApp Dispatch Log
              </h2>
              <p className="text-xs text-slate-500">
                Live audit trail of real-time messages sent whenever Auto-Apply submits an application
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTestAlert}
              className="font-bold text-xs"
            >
              <Send size={13} />
              <span>Simulate Trigger Alert</span>
            </Button>
          </div>

          {dispatches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <Mail size={36} className="mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">No triggered dispatches yet</h4>
              <p className="text-xs text-slate-500">
                Run the Auto-Apply engine or click "Simulate Trigger Alert" to test real-time notifications.
              </p>
              <Button variant="primary" size="sm" onClick={handleSendTestAlert} className="font-bold text-xs">
                Send Demo Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dispatches.map((disp) => (
                <div
                  key={disp.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                          ⚡ Auto-Apply Triggered
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">•</span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {new Date(disp.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">{disp.jobTitle}</h3>
                      <p className="text-xs text-blue-600 font-bold">{disp.company} · {disp.location}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="match-pill text-xs">{disp.matchScore}% Match</span>
                    </div>
                  </div>

                  {/* Dispatch preview badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    {/* Email preview badge */}
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Mail size={13} className="text-blue-600" />
                        <span>Email Confirmation Sent</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        To: {disp.email.to}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Subject: {disp.email.subject}
                      </div>
                    </div>

                    {/* WhatsApp preview badge */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-600" />
                        <span>WhatsApp Message Delivered</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        To: {disp.whatsapp.to}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        From: {disp.whatsapp.from}
                      </div>
                    </div>
                  </div>

                  {/* Action button to view full formatted message */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setActiveDispatchModal(disp)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Formatted Email & WhatsApp Message Previews →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Preview Lightbox Modal */}
      {activeDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                  Notification Dispatch Audit
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Triggered Messages: {activeDispatchModal.jobTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Company: {activeDispatchModal.company} · Applied on {new Date(activeDispatchModal.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveDispatchModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Preview Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={14} className="text-blue-600" />
                <span>1. Formatted HTML Email Notification</span>
              </h4>
              <div
                className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner"
                dangerouslySetInnerHTML={{ __html: activeDispatchModal.email.htmlContent }}
              />
            </div>

            {/* WhatsApp Chat Preview Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-600" />
                <span>2. Delivered WhatsApp Mobile Message</span>
              </h4>
              <div className="p-4 bg-[#e5ddd5] rounded-2xl border border-[#d1d7db] font-sans">
                <div className="bg-[#d9fdd3] p-3.5 rounded-2xl rounded-tr-none shadow-sm text-xs text-slate-800 whitespace-pre-wrap max-w-lg ml-auto border border-[#c4eec0] leading-relaxed">
                  {activeDispatchModal.whatsapp.text}
                  <div className="text-[10px] text-slate-500 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                    <span>{new Date(activeDispatchModal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="md" onClick={() => setActiveDispatchModal(null)} className="font-bold">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
