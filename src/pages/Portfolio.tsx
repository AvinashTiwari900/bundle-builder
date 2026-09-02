import React, { useEffect, useState } from 'react'
import {
  Globe,
  Edit2,
  Github,
  Linkedin,
  Mail,
  CheckCircle2,
  Share2,
  Save,
  Plus,
  X,
  Trash2
} from 'lucide-react'
import { portfolioService } from '../services/portfolioService'
import { profileService } from '../services/profileService'
import { firestoreService } from '../services/firestoreService'
import { portfolioApiService } from '../services/portfolioApiService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function PortfolioPage() {
  const [profile, setProfile] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(portfolioService.get())
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [newSkill, setNewSkill] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectTech, setNewProjectTech] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get() || {}
    const pf = portfolioService.get() || {}

    // Ensure synchronized defaults
    const combined = {
      name: p.name || 'Avinash Tiwari',
      headline: p.headline || 'Lead Business Analyst & Product Strategist',
      location: p.location || 'Bengaluru, India',
      experienceYears: p.experienceYears || 5,
      avatar:
        p.profilePhoto ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      intro:
        pf.intro ||
        'Passionate Business Analyst bridging data engineering and strategic decision-making.',
      about:
        pf.about ||
        'With 5+ years of experience across fintech, analytics consulting, and e-commerce platforms, I specialize in crafting automated data pipelines, interactive dashboards, and executive insights.',
      skills: pf.skills || p.skills || [
        'SQL',
        'Power BI',
        'Python',
        'Business Analysis',
        'Excel',
        'Agile / Scrum',
        'Tableau',
        'Stakeholder Management'
      ],
      socials: {
        github: pf.socials?.github || 'https://github.com/AvinashTiwari900',
        linkedin: pf.socials?.linkedin || 'https://www.linkedin.com/in/avinashtiwari626/',
        portfolioUrl: pf.socials?.portfolioUrl || 'https://avinash-tiwari.dev',
        email: pf.socials?.email || p.email || 'avinashtiwari@gmail.com'
      },
      featuredProjects: p.projects || [
        {
          id: 'proj-1',
          name: 'Enterprise Revenue Analytics Engine',
          description:
            'Designed unified BI reporting dashboards automating revenue forecasting across 12 product lines, cutting report generation time by 75%.',
          technologies: ['Power BI', 'SQL', 'Snowflake', 'Python']
        },
        {
          id: 'proj-2',
          name: 'Customer Churn Predictor & Retention Portal',
          description:
            'Built machine learning model integration predicting customer churn with 89% precision, triggering proactive retention campaigns.',
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Tableau']
        }
      ]
    }

    setProfile(p)
    setPortfolio(combined)
    setForm(combined)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    // 1. Save to portfolio service
    portfolioService.save(form)
    setPortfolio(form)

    // 2. Sync to profile state
    const p = profileService.get() || {}
    p.name = form.name
    p.headline = form.headline
    p.location = form.location
    p.experienceYears = form.experienceYears
    p.profilePhoto = form.avatar
    p.skills = form.skills
    p.projects = form.featuredProjects
    profileService.save(p)

    // 3. Persist locally, then sync both the portfolio and core profile fields to the backend
    await firestoreService.saveCandidateProfile(p)
    portfolioApiService.save({
      name: form.name,
      headline: form.headline,
      location: form.location,
      experienceYears: form.experienceYears,
      avatar: form.avatar,
      intro: form.intro,
      about: form.about,
      skills: form.skills,
      featuredProjects: form.featuredProjects,
      socials: form.socials
    })
    portfolioApiService.saveCoreProfile({
      name: form.name,
      headline: form.headline,
      location: form.location,
      experienceYears: form.experienceYears,
      profilePhoto: form.avatar,
      skills: form.skills
    })

    setEditing(false)
    showToast('Public portfolio & profile saved successfully! 🎉')
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    const current = form.skills || []
    if (!current.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...current, newSkill.trim()] })
    }
    setNewSkill('')
  }

  const removeSkill = (skillToRemove: string) => {
    const current = form.skills || []
    setForm({ ...form, skills: current.filter((s: string) => s !== skillToRemove) })
  }

  const addFeaturedProject = () => {
    if (!newProjectName.trim()) return
    const currentProjects = form.featuredProjects || []
    const newProj = {
      id: 'proj-' + Date.now(),
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      technologies: newProjectTech
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    setForm({ ...form, featuredProjects: [...currentProjects, newProj] })
    setNewProjectName('')
    setNewProjectDesc('')
    setNewProjectTech('')
  }

  const removeFeaturedProject = (id: string) => {
    const current = form.featuredProjects || []
    setForm({ ...form, featuredProjects: current.filter((p: any) => p.id !== id) })
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

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Public Candidate Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recruiter-facing showcase presenting your identity, skills, case studies, and verified links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={editing ? 'primary' : 'outline'}
            size="md"
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="font-bold text-xs"
          >
            {editing ? (
              <>
                <Save size={15} />
                <span>Save All Changes</span>
              </>
            ) : (
              <>
                <Edit2 size={15} />
                <span>Edit All Fields</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              showToast('Public portfolio link copied to clipboard!')
            }}
            className="font-bold text-xs"
          >
            <Share2 size={15} />
            <span>Share Link</span>
          </Button>
        </div>
      </div>

      {/* Comprehensive Edit Form Drawer */}
      {editing && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Edit All Portfolio Fields
              </h3>
              <p className="text-xs text-slate-500">
                Customize your name, headline, biography, GitHub, LinkedIn, skills, and case studies
              </p>
            </div>
            <button
              onClick={() => setEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Identity & Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              1. Candidate Identity & Header
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Avinash Tiwari"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
                <Input
                  value={form.headline || ''}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="e.g. Lead Business Analyst & Product Strategist"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                <Input
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  value={form.experienceYears || 5}
                  onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <Input
                  value={form.avatar || ''}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              2. Social Profiles & Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  GitHub Profile URL *
                </label>
                <Input
                  value={form.socials?.github || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, github: e.target.value }
                    })
                  }
                  placeholder="https://github.com/AvinashTiwari900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  LinkedIn Profile URL *
                </label>
                <Input
                  value={form.socials?.linkedin || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, linkedin: e.target.value }
                    })
                  }
                  placeholder="https://www.linkedin.com/in/avinashtiwari626/"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Personal Website / Portfolio URL
                </label>
                <Input
                  value={form.socials?.portfolioUrl || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, portfolioUrl: e.target.value }
                    })
                  }
                  placeholder="https://avinash-tiwari.dev"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Email Address
                </label>
                <Input
                  value={form.socials?.email || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, email: e.target.value }
                    })
                  }
                  placeholder="avinashtiwari@gmail.com"
                />
              </div>
            </div>
          </div>

          {/* Executive Intro & Biography */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              3. Tagline & Biography
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Executive Tagline & Intro
              </label>
              <textarea
                value={form.intro || ''}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20 leading-relaxed font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                About Me / Background & Philosophy
              </label>
              <textarea
                value={form.about || ''}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-24 leading-relaxed font-medium"
              />
            </div>
          </div>

          {/* Skills Competencies */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              4. Core Competencies & Skills
            </h4>

            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                placeholder="Type a skill (e.g. Snowflake, Tableau) and press Enter..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="font-bold text-xs">
                <Plus size={14} />
                <span>Add Skill</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(form.skills || []).map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100"
                >
                  <span>{skill}</span>
                  <X
                    size={13}
                    className="cursor-pointer text-blue-400 hover:text-blue-700"
                    onClick={() => removeSkill(skill)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Featured Projects Editor */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              5. Featured Case Studies & Projects
            </h4>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="font-bold text-xs text-slate-800">Add New Case Study:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Case Study Title (e.g. Real-Time Pricing Optimization)"
                />
                <Input
                  value={newProjectTech}
                  onChange={(e) => setNewProjectTech(e.target.value)}
                  placeholder="Technologies (e.g. Python, SQL, Tableau)"
                />
              </div>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief outcome & business impact..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-16"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeaturedProject}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add to Featured Projects</span>
              </Button>
            </div>

            {/* List of current projects */}
            <div className="space-y-2 pt-2">
              {(form.featuredProjects || []).map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeaturedProject(p.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} className="font-bold">
              <Save size={15} />
              <span>Save & Publish Portfolio</span>
            </Button>
          </div>
        </div>
      )}

      {/* Public Portfolio Live Recruiter View Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-md overflow-hidden">
        {/* Banner header */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8">
            <img
              src={portfolio.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={portfolio.name}
              className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl object-cover"
            />
          </div>

          <div className="absolute top-4 right-4">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Edit2 size={13} />
              <span>Edit Live View</span>
            </button>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="pt-16 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{portfolio.name}</h2>
              <p className="text-sm font-bold text-blue-600 mt-0.5">{portfolio.headline}</p>
              <p className="text-xs text-slate-500 mt-1">
                📍 {portfolio.location} · 💼 {portfolio.experienceYears}+ Years Experience
              </p>
            </div>

            {/* Social Profile Links */}
            <div className="flex items-center gap-2">
              <a
                href={portfolio.socials?.linkedin || 'https://www.linkedin.com/in/avinashtiwari626/'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin size={18} />
              </a>

              <a
                href={portfolio.socials?.github || 'https://github.com/AvinashTiwari900'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors"
                title="GitHub Profile"
              >
                <Github size={18} />
              </a>

              {portfolio.socials?.portfolioUrl && (
                <a
                  href={portfolio.socials.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl border border-slate-200 transition-colors"
                  title="Personal Portfolio"
                >
                  <Globe size={18} />
                </a>
              )}

              {portfolio.socials?.email && (
                <a
                  href={`mailto:${portfolio.socials.email}`}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-xl border border-slate-200 transition-colors"
                  title="Email Candidate"
                >
                  <Mail size={18} />
                </a>
              )}
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
              {(portfolio.skills || []).map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Projects */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900">Featured Case Studies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(portfolio.featuredProjects || []).slice(0, 4).map((p: any) => (
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
