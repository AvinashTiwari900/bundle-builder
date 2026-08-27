import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Sparkles,
  Edit2,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  Share2,
  Save,
  Plus,
  X,
  User,
  Briefcase,
  MapPin,
  Award,
  Layers,
  Code2,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Lock,
  MessageSquare,
  Wand2
} from 'lucide-react'
import { portfolioService } from '../services/portfolioService'
import { profileService } from '../services/profileService'
import { firestoreService } from '../services/firestoreService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function PortfolioPage() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(portfolioService.get())
  const [editing, setEditing] = useState(false)
  const [isPanelView, setIsPanelView] = useState(false) // Toggle Company / Panel Member View
  const [maskContactInfo, setMaskContactInfo] = useState(true) // Privacy toggle
  const [form, setForm] = useState<any>({})
  const [newSkill, setNewSkill] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectTech, setNewProjectTech] = useState('')
  const [newProjectLink, setNewProjectLink] = useState('')
  const [newProjectGithub, setNewProjectGithub] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingAiTips, setIsGeneratingAiTips] = useState(false)

  useEffect(() => {
    const p = profileService.get() || {}
    const pf = portfolioService.get() || {}

    setMaskContactInfo(p.privacy?.maskContactInfo ?? true)

    const combined = {
      name: p.name || 'Avinash Tiwari',
      headline: p.headline || 'Lead Business Analyst & Product Strategist',
      location: p.location || 'Bengaluru, India',
      experienceYears: p.experienceYears || 5,
      currentCtc: p.currentCtc || '₹20 LPA',
      targetSalary: p.targetSalary || '₹24 - 28 LPA',
      noticePeriod: p.noticePeriod || '30 days (15-day buyout feasible)',
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
        'Snowflake',
        'Stakeholder Management'
      ],
      socials: {
        github: pf.socials?.github || 'https://github.com/AvinashTiwari900',
        linkedin: pf.socials?.linkedin || 'https://www.linkedin.com/in/avinashtiwari626/',
        portfolioUrl: pf.socials?.portfolioUrl || 'https://avinash-tiwari.dev',
        email: pf.socials?.email || p.email || 'avinashtiwari@gmail.com',
        phone: p.phone || '+91 98765 43210'
      },
      featuredProjects: p.projects || [
        {
          id: 'proj-1',
          name: 'Enterprise Revenue Analytics Engine',
          role: 'Lead Business Analyst',
          description:
            'Designed unified BI reporting dashboards automating revenue forecasting across 12 product lines, cutting report generation time by 75%.',
          technologies: ['Power BI', 'SQL', 'Snowflake', 'Python'],
          link: 'https://avinash-tiwari.dev/demo-bi',
          githubUrl: 'https://github.com/AvinashTiwari900/revenue-analytics'
        },
        {
          id: 'proj-2',
          name: 'Customer Churn Predictor & Retention Portal',
          role: 'Product Data Analyst',
          description:
            'Built machine learning model integration predicting customer churn with 89% precision, triggering proactive retention campaigns.',
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Tableau'],
          link: 'https://avinash-tiwari.dev/churn-portal',
          githubUrl: 'https://github.com/AvinashTiwari900/customer-churn-predictor'
        }
      ],
      education: p.education || [
        {
          degree: 'Bachelor of Technology in Computer Science & Engineering',
          institution: 'National Institute of Technology (NIT)',
          year: '2017 - 2021',
          score: '8.8 CGPA'
        }
      ],
      certifications: p.certifications || [
        { name: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)', issuer: 'Microsoft', year: 2024 },
        { name: 'Certified Business Analysis Professional (CBAP)', issuer: 'IIBA', year: 2023 }
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

  const maskEmail = (email: string) => {
    if (!email) return 'c********@gmail.com'
    const [user, domain] = email.split('@')
    return `${user.charAt(0)}*****${user.slice(-1)}@${domain}`
  }

  const maskPhone = (phone: string) => {
    if (!phone) return '+91 98****1234'
    return phone.replace(/(\+?\d{2,3})?\s?(\d{2})\d{4,6}(\d{2,4})/, '$1 $2****$3')
  }

  const handleSave = async () => {
    portfolioService.save(form)
    setPortfolio(form)

    const p = profileService.get() || {}
    p.name = form.name
    p.headline = form.headline
    p.location = form.location
    p.experienceYears = form.experienceYears
    p.profilePhoto = form.avatar
    p.skills = form.skills
    p.projects = form.featuredProjects
    p.socials = form.socials || {}
    p.privacy = { ...p.privacy, maskContactInfo }
    profileService.save(p)

    await firestoreService.saveCandidateProfile(p)
    setEditing(false)
    showToast('Public portfolio & privacy settings saved! 🎉')
  }

  const togglePrivacyMask = () => {
    const next = !maskContactInfo
    setMaskContactInfo(next)
    const p = profileService.get() || {}
    p.privacy = { ...(p.privacy || {}), maskContactInfo: next }
    profileService.save(p)
    showToast(next ? 'Contact Privacy Shield Enabled (Email & Phone Hidden)' : 'Direct Contact Visible')
  }

  const generateAiSuggestions = () => {
    setIsGeneratingAiTips(true)
    setTimeout(() => {
      setIsGeneratingAiTips(false)
      setAiSuggestions([
        'Add quantified metrics to your second project (e.g. "Saved ₹32 Lakhs in retained revenue").',
        'Add "Snowflake" and "Data Governance" to core competencies to unlock 14 high-matching roles.',
        'Your profile has 96% verification score — verified credentials badge is prominently displayed to employer panels.'
      ])
      showToast('AI Portfolio Optimization Analysis Ready! 💡')
    }, 700)
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
        .filter(Boolean),
      link: newProjectLink.trim(),
      githubUrl: newProjectGithub.trim()
    }
    setForm({ ...form, featuredProjects: [...currentProjects, newProj] })
    setNewProjectName('')
    setNewProjectDesc('')
    setNewProjectTech('')
    setNewProjectLink('')
    setNewProjectGithub('')
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Candidate Portfolio & Panel Showcase
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Verified Credentials</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Employer & interview panel facing showcase presenting your skills, case studies, and verified certifications
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Panel View Toggle */}
          <button
            onClick={() => setIsPanelView(!isPanelView)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPanelView
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isPanelView ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{isPanelView ? 'Exit Panel View' : '👁️ View as Recruiter/Panel'}</span>
          </button>

          <Button
            variant={editing ? 'primary' : 'outline'}
            size="md"
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="font-bold text-xs"
          >
            {editing ? (
              <>
                <Save size={15} />
                <span>Save All</span>
              </>
            ) : (
              <>
                <Edit2 size={15} />
                <span>Edit Fields</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              showToast('Public portfolio URL copied to clipboard!')
            }}
            className="font-bold text-xs"
          >
            <Share2 size={15} />
            <span>Share Link</span>
          </Button>
        </div>
      </div>

      {/* Privacy Shield Banner (Protection from direct unsolicited recruiter contact) */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider">
                Candidate Contact Privacy Shield
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${maskContactInfo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {maskContactInfo ? 'Active (Direct Contact Masked)' : 'Direct Contact Exposed'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Hides your direct email and phone number from companies to prevent unsolicited external calls. Recruiters message & schedule interviews directly inside Gettin Candidates.
            </p>
          </div>
        </div>

        <button
          onClick={togglePrivacyMask}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
            maskContactInfo
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          {maskContactInfo ? '🛡️ Privacy Mask ON' : '⚠️ Privacy Mask OFF'}
        </button>
      </div>

      {/* AI Quality Analyzer Trigger */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-900">AI Portfolio & Case Study Quality Analyzer</h3>
              <p className="text-[11px] text-slate-500">Get AI recommendations on missing skills, project presentation, and profile appeal</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={generateAiSuggestions}
            disabled={isGeneratingAiTips}
            className="font-bold text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Wand2 size={13} />
            <span>{isGeneratingAiTips ? 'Analyzing Portfolio...' : 'Analyze with AI'}</span>
          </Button>
        </div>

        {aiSuggestions.length > 0 && (
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs space-y-1.5 text-indigo-950 animate-in fade-in duration-200">
            <div className="font-bold text-indigo-900">💡 AI Recommendations to improve portfolio score:</div>
            {aiSuggestions.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Drawer Modal */}
      {editing && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Edit Portfolio Fields</h3>
              <p className="text-xs text-slate-500">Customize your bio, skills, case studies, and public links</p>
            </div>
            <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
              <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
              <Input value={form.headline || ''} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
              <Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Executive Summary / Intro</label>
            <textarea
              value={form.intro || ''}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Detailed Biography</label>
            <textarea
              value={form.about || ''}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs h-24"
            />
          </div>

          {/* Core Skills */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">Core Skills</label>
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
                placeholder="Add a skill and press Enter..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="font-bold text-xs">
                <Plus size={14} />
                <span>Add</span>
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

          {/* Public Social Profiles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Social Profiles & Portfolio Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">LinkedIn Profile</label>
                <Input
                  value={form.socials?.linkedin || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...(form.socials || {}), linkedin: e.target.value }
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">GitHub Profile</label>
                <Input
                  value={form.socials?.github || 'https://github.com/AvinashTiwari900'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...(form.socials || {}), github: e.target.value }
                    })
                  }
                  placeholder="https://github.com/AvinashTiwari900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Personal Portfolio / Website</label>
                <Input
                  value={form.socials?.portfolioUrl || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...(form.socials || {}), portfolioUrl: e.target.value }
                    })
                  }
                  placeholder="https://your-portfolio.dev"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} className="font-bold">
              <Save size={15} />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Recruiter / Panel Live Portfolio Card */}
      <div className={`bg-white border rounded-3xl shadow-md overflow-hidden transition-all ${
        isPanelView ? 'ring-4 ring-purple-200 border-purple-300' : 'border-slate-200/90'
      }`}>
        {/* Banner header */}
        <div className="h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-4">
            <img
              src={portfolio.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={portfolio.name}
              className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl object-cover"
            />
          </div>

          {/* Panel Preview Badge Banner */}
          {isPanelView && (
            <div className="absolute top-4 left-4 bg-purple-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-400/30 flex items-center gap-1.5 shadow-lg">
              <Building2 size={14} className="text-amber-300" />
              <span>Viewing in Recruiter & Panel Evaluation Mode</span>
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <Edit2 size={13} />
              <span>Edit Live View</span>
            </button>
          </div>
        </div>

        {/* Profile Info Body */}
        <div className="pt-16 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900">{portfolio.name}</h2>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                  94% ATS Fit
                </span>
              </div>
              <p className="text-sm font-bold text-blue-600 mt-0.5">{portfolio.headline}</p>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 font-medium">
                <span>📍 {portfolio.location}</span>
                <span>•</span>
                <span>💼 {portfolio.experienceYears}+ Yrs Exp</span>
                <span>•</span>
                <span>⏱️ {portfolio.noticePeriod}</span>
              </p>
            </div>

            {/* Social & Contact Channels with Privacy Masking */}
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>

          {/* Contact Details Protected Card (What Recruiters/Panels see) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className={maskContactInfo ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Contact Details (Employer & Panelist View)</span>
              </span>

              {maskContactInfo && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Lock size={10} />
                  <span>Privacy Guard Protected</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Mail size={12} />
                  <span>Email Address:</span>
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {maskContactInfo ? maskEmail(portfolio.socials?.email || 'avinashtiwari@gmail.com') : portfolio.socials?.email}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Phone size={12} />
                  <span>Contact Number:</span>
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {maskContactInfo ? maskPhone(portfolio.socials?.phone || '+91 98765 43210') : portfolio.socials?.phone}
                </div>
              </div>
            </div>
            {maskContactInfo && (
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                🔒 Direct personal contact is protected. Panel members communicate, send inquiries, and schedule live interviews directly through the Gettin platform.
              </p>
            )}
          </div>

          {/* Panel Evaluation Action Bar (Shown when in Panel View Mode) */}
          {isPanelView && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>Recruiter & Panel Evaluation Actions:</span>
                </span>
                <span className="text-[11px] text-purple-700">Interview Candidate on Gettin</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => nav('/interview/room/int-1')}
                  className="font-bold text-xs bg-purple-600 hover:bg-purple-700"
                >
                  <Calendar size={13} />
                  <span>Schedule Interview Round</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast('Candidate added to Employer Shortlist! ⭐')}
                  className="font-bold text-xs bg-white text-purple-800 border-purple-200"
                >
                  <Award size={13} />
                  <span>Shortlist Candidate</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nav('/documents')}
                  className="font-bold text-xs bg-white text-purple-800 border-purple-200"
                >
                  <ShieldCheck size={13} />
                  <span>Request KYC Verification</span>
                </Button>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {portfolio.intro}
            </p>
          </div>

          {/* About Background */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">Background & Philosophy</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {portfolio.about}
            </p>
          </div>

          {/* Core Competencies */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Core Competencies & Tools</h3>
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

          {/* Featured Case Studies & Projects */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900">Featured Case Studies & Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(portfolio.featuredProjects || []).map((p: any) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      <span className="text-[10px] text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded">
                        {p.role || 'Business Analyst'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
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

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>Live Demo</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-600 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>GitHub</span>
                          <Github size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                <span>Verified Certifications</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {(portfolio.certifications || []).map((c: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-700">
                    <strong>{c.name}</strong> · <span className="text-slate-500">{c.issuer} ({c.year})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Award size={14} className="text-blue-600" />
                <span>Academic Education</span>
              </h4>
              <div className="text-[11px] text-slate-700">
                <strong>B.Tech in Computer Science & Engineering</strong>
                <div className="text-slate-500">National Institute of Technology · 8.8 CGPA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
