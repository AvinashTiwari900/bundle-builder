import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Sparkles,
  Edit3,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  Share2,
  User,
  Briefcase,
  MapPin,
  Award,
  Layers,
  Code2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Lock,
  MessageSquare,
  GraduationCap,
  Clock,
  FolderGit2,
  MoreVertical,
  SlidersHorizontal,
  Check,
  FileText,
  X,
  ZoomIn
} from 'lucide-react'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'

export default function PortfolioPage() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [isPanelView, setIsPanelView] = useState(false) // Toggle Company / Panel Member View
  const [maskContactInfo, setMaskContactInfo] = useState(true) // Privacy toggle
  const [showMenu, setShowMenu] = useState(false) // Three dots dropdown state
  const [showPhotoModal, setShowPhotoModal] = useState(false) // Profile Photo Lightbox Modal
  const [toast, setToast] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPhotoModal) {
        setShowPhotoModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPhotoModal])

  // Load profile data directly from profileService
  useEffect(() => {
    const p = profileService.get() || {}
    setProfile(p)
    setMaskContactInfo(p.privacySettings?.contactPrivacyMask ?? p.privacy?.maskContactInfo ?? true)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const togglePrivacyMask = () => {
    const next = !maskContactInfo
    setMaskContactInfo(next)
    if (profile) {
      const updated = {
        ...profile,
        contactPrivacyMask: next,
        privacySettings: {
          ...(profile.privacySettings || {}),
          contactPrivacyMask: next
        }
      }
      profileService.save(updated)
      setProfile(updated)
    }
    showToast(next ? '🛡️ Privacy Shield enabled: Direct contact details masked' : '⚠️ Privacy Shield disabled: Direct contact details visible')
    setShowMenu(false)
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    showToast('🔗 Public portfolio link copied to clipboard!')
    setShowMenu(false)
  }

  const maskEmail = (email?: string) => {
    if (!email) return 'c********@example.com'
    const [user, domain] = email.split('@')
    return `${user.charAt(0)}*****${user.slice(-1)}@${domain || 'example.com'}`
  }

  const maskPhone = (phone?: string) => {
    if (!phone) return '+91 98****4321'
    return phone.replace(/(\+?\d{2,3})?\s?(\d{2})\d{4,6}(\d{2,4})/, '$1 $2****$3')
  }

  if (!profile) return null

  const activeCover = profile.backgroundImage || profile.coverPhoto

  // Strictly check if valid, user-provided URLs exist
  const rawGithub = profile.githubUrl !== undefined ? profile.githubUrl : (profile.socials?.github || '')
  const rawLinkedin = profile.linkedinUrl !== undefined ? profile.linkedinUrl : (profile.socials?.linkedin || '')
  const rawWebsite = profile.portfolioUrl !== undefined ? profile.portfolioUrl : (profile.socials?.portfolioUrl || '')

  const githubLink = typeof rawGithub === 'string' && rawGithub.trim().length > 0 ? rawGithub.trim() : null
  const linkedinLink = typeof rawLinkedin === 'string' && rawLinkedin.trim().length > 0 ? rawLinkedin.trim() : null
  const websiteLink = typeof rawWebsite === 'string' && rawWebsite.trim().length > 0 ? rawWebsite.trim() : null

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Clean Header with Three-Dots Menu */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Portfolio & Panel Showcase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Employer & interview panel facing showcase presenting your verified credentials, skills, and practical work.
          </p>
        </div>

        {/* Three Dots Menu Container */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            id="portfolioThreeDotsBtn"
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-xs transition-all cursor-pointer"
            aria-label="Portfolio Actions & Settings"
            aria-expanded={showMenu}
          >
            <MoreVertical size={18} />
          </button>

          {/* Three Dots Dropdown Menu */}
          {showMenu && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Option 1: Edit Profile */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowMenu(false)
                  nav('/profile')
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Edit3 size={14} />
                </div>
                <div>
                  <div className="text-slate-900">Edit Profile Details</div>
                  <div className="text-[10px] text-slate-400 font-normal">Edit bio, social links & media</div>
                </div>
              </button>

              {/* Option 2: Share Option */}
              <button
                type="button"
                role="menuitem"
                onClick={handleShare}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Share2 size={14} />
                </div>
                <div>
                  <div className="text-slate-900">Share Portfolio</div>
                  <div className="text-[10px] text-slate-400 font-normal">Copy public portfolio link</div>
                </div>
              </button>

              {/* Option 3: Privacy Option */}
              <button
                type="button"
                role="menuitem"
                onClick={togglePrivacyMask}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Shield size={14} />
                  </div>
                  <div>
                    <div className="text-slate-900">Privacy Shield</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {maskContactInfo ? 'Masking active' : 'Contact exposed'}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  maskContactInfo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {maskContactInfo ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Option 4: Panel View Toggle */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsPanelView(!isPanelView)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 flex items-center justify-between transition-colors cursor-pointer border-t border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    {isPanelView ? <EyeOff size={14} /> : <Eye size={14} />}
                  </div>
                  <div>
                    <div className="text-slate-900">Panel Mode</div>
                    <div className="text-[10px] text-slate-400 font-normal">View as Recruiter</div>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  isPanelView ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isPanelView ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Recruiter / Panel Live Portfolio Showcase Card */}
      <div className={`bg-white border rounded-3xl shadow-md overflow-hidden transition-all ${
        isPanelView ? 'ring-4 ring-purple-200 border-purple-300' : 'border-slate-200/90'
      }`}>
        {/* Cover Banner (Dedicated Visual Background Area - Zero profile text overlay) */}
        <div
          className="h-44 sm:h-56 relative w-full overflow-hidden transition-all"
          style={{
            backgroundColor: '#3b82f6',
            backgroundImage: activeCover
              ? `url(${activeCover})`
              : 'linear-gradient(to right, #1d4ed8, #4f46e5, #7e22ce)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Panel Preview Badge Banner */}
          {isPanelView && (
            <div className="absolute top-4 left-4 bg-purple-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-400/30 flex items-center gap-1.5 shadow-lg">
              <Building2 size={14} className="text-amber-300" />
              <span>Viewing in Recruiter & Panel Evaluation Mode</span>
            </div>
          )}
        </div>

        {/* Profile Info Body (100% Sited Below the Cover Banner with Dedicated Avatar and Clean Alignment) */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Profile Header: Avatar + Identity + Socials */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Left: Avatar + Names & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Candidate Avatar with Click-to-Expand Preview */}
              <div 
                className="relative -mt-16 sm:-mt-20 shrink-0 group cursor-pointer"
                onClick={() => setShowPhotoModal(true)}
                title="Click to view full profile photo"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowPhotoModal(true)
                  }
                }}
              >
                <img
                  src={
                    profile.profilePhoto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={profile.name || 'Candidate'}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white transition-all duration-200 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-indigo-100"
                />
                <div className="absolute inset-0 bg-slate-950/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white backdrop-blur-[1px]">
                  <ZoomIn size={22} className="drop-shadow-md transform group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Candidate Identity Block (Strictly Below Cover Image) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name || 'Avinash Tiwari'}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-extrabold flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-600" />
                    <span>{profile.atsScore || 94}% ATS Fit</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>Verified Candidate</span>
                  </span>
                  <a
                    href={websiteLink || 'https://mrig.tech'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-extrabold flex items-center gap-1 transition-colors"
                    title="Verified Custom Domain"
                  >
                    <Globe size={12} className="text-indigo-600" />
                    <span>mrig.tech</span>
                  </a>
                </div>

                <p className="text-sm sm:text-base font-bold text-indigo-700">
                  {profile.headline || 'Lead Business Analyst & Analytics Engineer'}
                </p>

                {/* Location, Experience, Notice Period, Salary */}
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {profile.location || 'Bengaluru, India'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {(profile.totalExperienceYears ?? profile.experienceYears ?? 0) === 0
                      ? 'Fresher (Entry Level)'
                      : `${profile.totalExperienceYears ?? profile.experienceYears ?? 0}+ Yrs Experience`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    {profile.noticePeriod || '15 Days (Serving Notice)'}
                  </span>
                  <span>•</span>
                  <span className="text-indigo-700 font-extrabold">
                    Expected: {profile.expectedSalaryLPA ? `₹${profile.expectedSalaryLPA} LPA` : profile.targetSalary || '₹28 LPA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Social Media Channels (Show ONLY if link exists) */}
            {(linkedinLink || githubLink || websiteLink) && (
              <div className="flex items-center gap-2 shrink-0 self-start pt-1">
                {linkedinLink && (
                  <a
                    href={linkedinLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl border border-slate-200 transition-colors shadow-2xs"
                    title="Verified LinkedIn Profile"
                  >
                    <Linkedin size={18} />
                  </a>
                )}

                {githubLink && (
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-2xl border border-slate-200 transition-colors shadow-2xs"
                    title="Verified GitHub Repositories"
                  >
                    <Github size={18} />
                  </a>
                )}

                {websiteLink && (
                  <a
                    href={websiteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl border border-slate-200 transition-colors shadow-2xs"
                    title="Personal Portfolio Website"
                  >
                    <Globe size={18} />
                  </a>
                )}
              </div>
            )}
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
                  <span>Privacy Shield Active</span>
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
                  {maskContactInfo ? maskEmail(profile.email || 'avinash.tiwari@example.com') : profile.email}
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Phone size={12} />
                  <span>Contact Number:</span>
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {maskContactInfo ? maskPhone(profile.phone || '+91 98765 43210') : profile.phone}
                </div>
              </div>
            </div>
            {maskContactInfo && (
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                🔒 Direct personal contact is protected. Panel members communicate, send inquiries, and schedule live interviews directly through the RAS Candidate Portal.
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
                <span className="text-[11px] text-purple-700">Interview Candidate on RAS</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => nav('/interview/room/int-1')}
                  className="font-bold text-xs bg-purple-600 hover:bg-purple-700 border-none"
                >
                  <Calendar size={13} />
                  <span>Schedule Technical Round</span>
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

          {/* Executive Summary / Bio */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Executive Summary & Bio
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {profile.bio ||
                'Lead Business Analyst with 6+ years driving enterprise digital transformation, automated pipeline architectures, and analytics engines across Fintech, SaaS, and Supply Chain ecosystems.'}
            </p>
          </div>

          {/* Core Competencies & Tools */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-slate-900">Core Competencies & Tools</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
              {(profile.tools || []).map((tool: string) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Case Studies & Projects */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900">Featured Projects & Case Studies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile.projects || []).map((p: any) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{p.title || p.name}</h4>
                      {p.role && (
                        <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 bg-indigo-50 rounded">
                          {p.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
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

                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      {(p.liveUrl || p.link) && (
                        <a
                          href={p.liveUrl || p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
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
                {(profile.certifications || []).map((c: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-700">
                    <strong>{c.name}</strong> · <span className="text-slate-500">{c.issuer} ({c.year})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-indigo-600" />
                <span>Academic Education</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {(profile.education || []).map((edu: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-700">
                    <strong>{edu.degree}</strong>
                    <div className="text-slate-500">{edu.institution} ({edu.startYear || edu.year} - {edu.endYear || ''}) {edu.grade ? `· ${edu.grade}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFILE PHOTO LIGHTBOX MODAL POPUP                                        */}
      {/* ========================================================================= */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {profile.name || 'Candidate Profile Photo'}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {profile.headline || profile.currentRole || 'Lead Business Analyst'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="closePhotoModalBtn"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo Container */}
            <div className="p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-white max-h-[70vh] flex items-center justify-center">
                <img
                  src={
                    profile.profilePhoto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={profile.name || 'Candidate Profile Photo'}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 flex items-center justify-between bg-white border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Verified Candidate Identity</span>
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
