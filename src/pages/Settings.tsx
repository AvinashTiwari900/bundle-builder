import React, { useState } from 'react'
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Zap,
  Key,
  Cloud,
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { authService } from '../services/authService'
import { isFirebaseConnected } from '../services/firebase'
import { cloudinaryService } from '../services/cloudinaryService'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme()
  const [autoApplyThreshold, setAutoApplyThreshold] = useState(85)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [proctoringStrictness, setProctoringStrictness] = useState('Standard (3 Warnings)')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleResetData = () => {
    if (confirm('Reset candidate demo data to initial defaults?')) {
      localStorage.clear()
      authService.init()
      showToast('Demo data re-seeded to default candidate state! 🔄')
      setTimeout(() => window.location.reload(), 800)
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Configuration & Integrations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage theme appearance, Cloudinary storage, Firebase Firestore sync, and automation
        </p>
      </div>

      {/* Theme Appearance Mode Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            {theme === 'dark' ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-amber-500" />}
            <span>Interface Theme & Visual Appearance</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Active: <span className="capitalize text-blue-600 font-extrabold">{theme} Mode</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Option */}
          <button
            type="button"
            onClick={() => {
              setTheme('light')
              showToast('Switched to Crisp Light Mode ☀️')
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Sun size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Light Mode</div>
                <div className="text-xs text-slate-500">Crisp slate background with high readability</div>
              </div>
            </div>
            {theme === 'light' && <Check size={18} className="text-blue-600 shrink-0" />}
          </button>

          {/* Dark Option */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark')
              showToast('Switched to Sleek Dark Mode 🌙')
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center font-bold border border-slate-700">
                <Moon size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Dark Mode</div>
                <div className="text-xs text-slate-500">Deep obsidian background for night focus</div>
              </div>
            </div>
            {theme === 'dark' && <Check size={18} className="text-blue-500 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Cloud Integrations Status Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Cloud size={18} className="text-blue-600" />
          <span>Cloud Storage & Database Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cloudinary Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Cloudinary CDN Storage</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <Check size={11} />
                <span>Active</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>Cloud Name: <strong className="text-slate-800 font-mono">je6whpaq</strong></div>
              <div>API Key: <strong className="text-slate-800 font-mono">819734381438919</strong></div>
              <div>Usage: Resumes, KYC Documents & Case Studies</div>
            </div>
          </div>

          {/* Firebase Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Firebase Firestore</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <Check size={11} />
                <span>Configured</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>Project ID: <strong className="text-slate-800 font-mono">recruitment-cebef</strong></div>
              <div>Project Number: <strong className="text-slate-800 font-mono">398833030288</strong></div>
              <div>Sync Mode: Cloud Firestore with Offline Fallback</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Interview Proctoring Policy Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Shield size={18} className="text-indigo-600" />
          <span>AI Interview Proctoring Policy</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Warning Tolerance Before Termination
            </label>
            <select
              value={proctoringStrictness}
              onChange={(e) => {
                setProctoringStrictness(e.target.value)
                showToast('Proctoring policy updated')
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Lenient (5 Warnings)">Lenient (5 Warnings allowed)</option>
              <option value="Standard (3 Warnings)">Standard (3 Warnings before termination)</option>
              <option value="Strict (1 Warning)">Strict (1 Warning before termination)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Recruiter Decision SLA Window
            </label>
            <input
              type="text"
              readOnly
              value="24 Working Hours (Auto-Escalation Enabled)"
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Auto-Apply Matching Threshold Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <span>Automated Job Application Engine</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Minimum Profile Match % to Auto-Apply</span>
            <span className="text-blue-600 font-extrabold text-sm">{autoApplyThreshold}%</span>
          </div>

          <input
            type="range"
            min="60"
            max="95"
            value={autoApplyThreshold}
            onChange={(e) => setAutoApplyThreshold(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>60% (Broad matching)</span>
            <span>85% (Recommended)</span>
            <span>95% (Exact skill match only)</span>
          </div>
        </div>
      </div>

      {/* Demo State Reset */}
      <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-rose-900">Reset Demo Database & State</h3>
          <p className="text-xs text-rose-600/80 mt-0.5">
            Restores mock candidates, applications, KYC documents, and interview scorecards.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs"
        >
          <RefreshCw size={14} />
          <span>Reset Demo Data</span>
        </Button>
      </div>
    </div>
  )
}
