import React, { useEffect, useState } from 'react'
import {
  Globe,
  Sparkles,
  Edit2,
  ExternalLink,
  Github,
  Linkedin,
  CheckCircle2,
  Share2,
  Save
} from 'lucide-react'
import { portfolioService } from '../services/portfolioService'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(portfolioService.get())
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(portfolio)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    const pf = portfolioService.get()
    setProfile(p)
    setPortfolio(pf)
    setForm(pf)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    portfolioService.save(form)
    setPortfolio(form)
    setEditing(false)
    showToast('Public portfolio saved successfully! 🎉')
  }

  const name = profile?.name || 'Avinash Tiwari'
  const headline = profile?.headline || 'Lead Business Analyst & Product Strategist'
  const avatar =
    profile?.profilePhoto ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Public Candidate Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            This is the live view verified recruiters see when evaluating your application
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={editing ? 'primary' : 'outline'}
            size="md"
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="font-bold"
          >
            {editing ? (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit2 size={16} />
                <span>Edit Portfolio Content</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => showToast('Public portfolio link copied to clipboard!')}
            className="font-bold text-xs"
          >
            <Share2 size={15} />
            <span>Share Link</span>
          </Button>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {editing && (
        <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-lg space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-slate-900">Edit Portfolio Sections</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Professional Tagline & Intro
            </label>
            <textarea
              value={form.intro || ''}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              About Me Biography
            </label>
            <textarea
              value={form.about || ''}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-28"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="font-bold">
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Public Portfolio Preview Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-md overflow-hidden">
        {/* Banner header */}
        <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl object-cover"
            />
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="pt-16 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
              <p className="text-sm font-bold text-blue-600 mt-0.5">{headline}</p>
              <p className="text-xs text-slate-500 mt-1">
                📍 {profile?.location || 'Bengaluru, India'} · 💼 5+ Years Experience
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={portfolio?.socials?.linkedin || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={portfolio?.socials?.github || 'https://github.com'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={portfolio?.socials?.portfolioUrl || 'https://avinash-tiwari.dev'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl border border-slate-200 transition-colors"
                title="Personal Site"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Professional Introduction */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {portfolio.intro}
            </p>
          </div>

          {/* About Me */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">Background & Philosophy</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {portfolio.about}
            </p>
          </div>

          {/* Featured Skills */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Core Competencies</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || ['SQL', 'Power BI', 'Python', 'Excel', 'Agile']).map(
                (skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Featured Projects */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900">Featured Case Studies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile?.projects || []).slice(0, 2).map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-2"
                >
                  <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(p.technologies || []).map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
