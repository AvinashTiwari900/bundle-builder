import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Save,
  Plus,
  X,
  Sparkles,
  Award,
  GraduationCap,
  Calendar,
  Clock,
  Camera,
  Trash2,
  Globe,
  Github,
  Linkedin,
  Shield,
  Eye,
  Lock,
  Code2,
  Layers,
  ChevronRight,
  Edit3,
  ExternalLink,
  Check,
  Share2,
  FolderGit2,
  FileText,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { profileService, EducationEntry, ExperienceEntry, ProjectEntry } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ProfilePage() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  // Mode: 'details' (Show Details View) vs 'edit' (Edit Profile Form)
  const [viewMode, setViewMode] = useState<'details' | 'edit'>('details')
  const [activeEditTab, setActiveEditTab] = useState<'basics' | 'skills' | 'experience' | 'education' | 'projects' | 'privacy'>('basics')

  const [newSkill, setNewSkill] = useState('')
  const [newCertName, setNewCertName] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // File Upload input refs
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const editCoverFileInputRef = useRef<HTMLInputElement>(null)
  const editAvatarFileInputRef = useRef<HTMLInputElement>(null)

  // Experience modal state
  const [expModal, setExpModal] = useState(false)
  const [expForm, setExpForm] = useState<Partial<ExperienceEntry>>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    workType: 'Hybrid',
    description: '',
    skillsUsed: []
  })

  // Education modal state
  const [eduModal, setEduModal] = useState(false)
  const [eduForm, setEduForm] = useState<Partial<EducationEntry>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: 2018,
    endYear: 2022,
    grade: ''
  })

  // Project modal state
  const [projModal, setProjModal] = useState(false)
  const [projForm, setProjForm] = useState<Partial<ProjectEntry>>({
    title: '',
    description: '',
    role: '',
    technologies: [],
    liveUrl: '',
    githubUrl: ''
  })

  useEffect(() => {
    const p = profileService.get() || {}
    const normalized = {
      ...p,
      githubUrl: p.githubUrl !== undefined ? p.githubUrl : (p.socials?.github || ''),
      linkedinUrl: p.linkedinUrl !== undefined ? p.linkedinUrl : (p.socials?.linkedin || ''),
      portfolioUrl: p.portfolioUrl !== undefined ? p.portfolioUrl : (p.socials?.portfolioUrl || '')
    }
    normalized.socials = {
      github: normalized.githubUrl,
      linkedin: normalized.linkedinUrl,
      portfolioUrl: normalized.portfolioUrl
    }
    setProfile(normalized)
    setForm(JSON.parse(JSON.stringify(normalized)))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Handle Cover / Background Image Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image file too large. Max size is 15MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string
      if (dataUrl) {
        const updated = {
          ...form,
          backgroundImage: dataUrl,
          coverPhoto: dataUrl
        }
        setForm(updated)
        setProfile(updated)
        profileService.save(updated)
        showToast('Background cover image updated! 🖼️')
      }
    }
    reader.readAsDataURL(file)
    if (coverFileInputRef.current) coverFileInputRef.current.value = ''
    if (editCoverFileInputRef.current) editCoverFileInputRef.current.value = ''
  }

  // Remove Cover Background
  const handleRemoveCover = () => {
    const updated = {
      ...form,
      backgroundImage: '',
      coverPhoto: ''
    }
    setForm(updated)
    setProfile(updated)
    profileService.save(updated)
    showToast('Cover background reset to gradient.')
  }

  // Handle Avatar Image Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file too large. Max size is 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string
      if (dataUrl) {
        const updated = {
          ...form,
          profilePhoto: dataUrl
        }
        setForm(updated)
        setProfile(updated)
        profileService.save(updated)
        showToast('Profile avatar photo updated! 👤')
      }
    }
    reader.readAsDataURL(file)
    if (avatarFileInputRef.current) avatarFileInputRef.current.value = ''
    if (editAvatarFileInputRef.current) editAvatarFileInputRef.current.value = ''
  }

  // Switch to Edit Mode
  const handleOpenEdit = (tab: 'basics' | 'skills' | 'experience' | 'education' | 'projects' | 'privacy' = 'basics') => {
    const p = profileService.get() || profile || {}
    const normalized = {
      ...p,
      githubUrl: p.githubUrl !== undefined ? p.githubUrl : (p.socials?.github || ''),
      linkedinUrl: p.linkedinUrl !== undefined ? p.linkedinUrl : (p.socials?.linkedin || ''),
      portfolioUrl: p.portfolioUrl !== undefined ? p.portfolioUrl : (p.socials?.portfolioUrl || '')
    }
    normalized.socials = {
      github: normalized.githubUrl,
      linkedin: normalized.linkedinUrl,
      portfolioUrl: normalized.portfolioUrl
    }
    setForm(JSON.parse(JSON.stringify(normalized)))
    setActiveEditTab(tab)
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel Edit and Return to Show Details
  const handleCancelEdit = () => {
    const p = profileService.get() || profile || {}
    setForm(JSON.parse(JSON.stringify(p)))
    setViewMode('details')
    showToast('Editing cancelled. Unsaved changes discarded.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Save Changes and Return to Show Details
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    const toSave = {
      ...form,
      githubUrl: form.githubUrl !== undefined ? form.githubUrl : (form.socials?.github || ''),
      linkedinUrl: form.linkedinUrl !== undefined ? form.linkedinUrl : (form.socials?.linkedin || ''),
      portfolioUrl: form.portfolioUrl !== undefined ? form.portfolioUrl : (form.socials?.portfolioUrl || '')
    }
    toSave.socials = {
      github: toSave.githubUrl,
      linkedin: toSave.linkedinUrl,
      portfolioUrl: toSave.portfolioUrl
    }
    try {
      await profileService.save(toSave)
      setProfile(JSON.parse(JSON.stringify(toSave)))
      setForm(JSON.parse(JSON.stringify(toSave)))
      setViewMode('details')
      showToast('Profile updated successfully! 🎉')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setProfile(JSON.parse(JSON.stringify(toSave)))
      setForm(JSON.parse(JSON.stringify(toSave)))
      setViewMode('details')
      showToast('Profile saved locally.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    const current = form.skills || []
    if (!current.includes(newSkill.trim())) {
      const updated = { ...form, skills: [...current, newSkill.trim()] }
      setForm(updated)
    }
    setNewSkill('')
  }

  const removeSkill = (skillToRemove: string) => {
    const current = form.skills || []
    const updated = { ...form, skills: current.filter((s: string) => s !== skillToRemove) }
    setForm(updated)
  }

  const addCert = () => {
    if (!newCertName.trim() || !newCertIssuer.trim()) return
    const certs = [...(form.certifications || [])]
    certs.push({
      id: 'cert-' + Date.now(),
      name: newCertName.trim(),
      issuer: newCertIssuer.trim(),
      year: new Date().getFullYear()
    })
    const updated = { ...form, certifications: certs }
    setForm(updated)
    setNewCertName('')
    setNewCertIssuer('')
    showToast('Certification added')
  }

  const removeCert = (id: string) => {
    const certs = (form.certifications || []).filter((c: any) => c.id !== id)
    const updated = { ...form, certifications: certs }
    setForm(updated)
  }

  // Experience handlers
  const saveExperience = () => {
    if (!expForm.company || !expForm.position) {
      showToast('Please fill in company and position.')
      return
    }
    const newEntry: ExperienceEntry = {
      id: expForm.id || 'exp-' + Date.now(),
      company: expForm.company || '',
      position: expForm.position || '',
      startDate: expForm.startDate || '2022',
      endDate: expForm.isCurrent ? 'Present' : expForm.endDate || '2024',
      isCurrent: expForm.isCurrent || false,
      workType: (expForm.workType as any) || 'Hybrid',
      description: expForm.description || '',
      skillsUsed: expForm.skillsUsed || []
    }
    const experiences = [...(form.experience || [])]
    const existingIndex = experiences.findIndex((x) => x.id === newEntry.id)
    if (existingIndex >= 0) {
      experiences[existingIndex] = newEntry
    } else {
      experiences.unshift(newEntry)
    }
    setForm({ ...form, experience: experiences })
    setExpModal(false)
    showToast('Experience entry added to draft! 💼')
  }

  const removeExperience = (id: string) => {
    const experiences = (form.experience || []).filter((x: any) => x.id !== id)
    setForm({ ...form, experience: experiences })
    showToast('Experience entry removed.')
  }

  // Education handlers
  const saveEducation = () => {
    if (!eduForm.institution || !eduForm.degree) {
      showToast('Please fill in institution and degree.')
      return
    }
    const newEntry: EducationEntry = {
      id: eduForm.id || 'edu-' + Date.now(),
      institution: eduForm.institution || '',
      degree: eduForm.degree || '',
      fieldOfStudy: eduForm.fieldOfStudy || '',
      startYear: Number(eduForm.startYear) || 2018,
      endYear: Number(eduForm.endYear) || 2022,
      grade: eduForm.grade || ''
    }
    const education = [...(form.education || [])]
    const existingIndex = education.findIndex((x) => x.id === newEntry.id)
    if (existingIndex >= 0) {
      education[existingIndex] = newEntry
    } else {
      education.unshift(newEntry)
    }
    setForm({ ...form, education })
    setEduModal(false)
    showToast('Education record added to draft! 🎓')
  }

  const removeEducation = (id: string) => {
    const education = (form.education || []).filter((x: any) => x.id !== id)
    setForm({ ...form, education })
    showToast('Education record removed.')
  }

  // Project handlers
  const saveProject = () => {
    if (!projForm.title) {
      showToast('Please provide a project title.')
      return
    }
    const newEntry: ProjectEntry = {
      id: projForm.id || 'proj-' + Date.now(),
      title: projForm.title || '',
      description: projForm.description || '',
      role: projForm.role || '',
      technologies: projForm.technologies || [],
      liveUrl: projForm.liveUrl || '',
      githubUrl: projForm.githubUrl || ''
    }
    const projects = [...(form.projects || [])]
    const existingIndex = projects.findIndex((x) => x.id === newEntry.id)
    if (existingIndex >= 0) {
      projects[existingIndex] = newEntry
    } else {
      projects.unshift(newEntry)
    }
    setForm({ ...form, projects })
    setProjModal(false)
    showToast('Featured project added to draft! 🚀')
  }

  const removeProject = (id: string) => {
    const projects = (form.projects || []).filter((x: any) => x.id !== id)
    setForm({ ...form, projects })
    showToast('Project removed.')
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
      {/* Hidden File Inputs for Background Cover and Avatar */}
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleCoverUpload}
        aria-label="Upload background cover photo"
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarUpload}
        aria-label="Upload profile avatar photo"
      />
      <input
        type="file"
        ref={editCoverFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleCoverUpload}
        aria-label="Upload background cover photo in edit mode"
      />
      <input
        type="file"
        ref={editAvatarFileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarUpload}
        aria-label="Upload profile avatar photo in edit mode"
      />

      {/* Toast Notification */}
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

      {/* ========================================================================= */}
      {/* VIEW MODE: SHOW DETAILS PAGE                                              */}
      {/* ========================================================================= */}
      {viewMode === 'details' ? (
        <div className="space-y-6">
          {/* Profile Hero Showcase Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
            {/* Cover Gradient Banner with Background Image Support (Dedicated Background Area) */}
            <div
              className="h-44 sm:h-56 relative p-4 sm:p-6 flex justify-end items-start overflow-hidden group/cover transition-all"
              style={{
                backgroundColor: '#3b82f6',
                backgroundImage: activeCover
                  ? `url(${activeCover})`
                  : 'linear-gradient(to right, #1d4ed8, #4f46e5, #7e22ce)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Action Buttons in Hero */}
              <div className="flex items-center gap-2.5 relative z-10 flex-wrap justify-end">
                {/* Upload Background Image Button */}
                <button
                  type="button"
                  id="uploadBackgroundBtn"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white border border-white/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Upload or change cover background image"
                >
                  <Camera size={13} />
                  <span>{activeCover ? 'Change Background' : 'Upload Background'}</span>
                </button>

                {activeCover && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-rose-600/80 backdrop-blur-md text-white border border-white/30 transition-all cursor-pointer"
                    title="Remove background image and restore default gradient"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => nav('/portfolio')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold backdrop-blur-md"
                  aria-label="View Public Portfolio"
                >
                  <Globe size={14} />
                  <span>Public Portfolio</span>
                </Button>

                <Button
                  type="button"
                  id="editProfileBtn"
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenEdit('basics')}
                  className="bg-white text-indigo-700 hover:bg-slate-50 border-none text-xs font-extrabold shadow-md cursor-pointer"
                  aria-label="Edit Profile Details"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>

            {/* Candidate Details Header Section (Strictly Below Cover Image) */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="relative -mt-16 sm:-mt-20 shrink-0 group">
                    <img
                      src={
                        profile.profilePhoto ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={profile.name || 'Candidate'}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Click to change profile avatar photo"
                    >
                      <Camera size={22} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {profile.name || 'Avinash Tiwari'}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Sparkles size={12} className="text-blue-600" />
                        <span>ATS Score: {profile.atsScore || 92}%</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Verified Candidate</span>
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-indigo-700">
                      {profile.headline || 'Lead Business Analyst & Analytics Engineer'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {profile.location || 'Bengaluru, India'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={13} className="text-slate-400" />
                        {profile.currentRole || 'Lead Business Analyst'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {profile.totalExperienceYears || profile.experienceYears || 6.5} Yrs Experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button for Mobile / Small Screens */}
                <div className="sm:hidden pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenEdit('basics')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile Details</span>
                  </Button>
                </div>
              </div>

              {/* Highlights Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Period</span>
                  <div className="font-extrabold text-slate-900">{profile.noticePeriod || '15 Days (Serving)'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current CTC</span>
                  <div className="font-extrabold text-slate-900">{profile.currentSalaryLPA ? `₹${profile.currentSalaryLPA} LPA` : profile.currentCtc || '₹22 LPA'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected CTC</span>
                  <div className="font-extrabold text-indigo-700">{profile.expectedSalaryLPA ? `₹${profile.expectedSalaryLPA} LPA` : profile.targetSalary || '₹28 LPA'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visibility</span>
                  <div className="font-extrabold text-slate-900 capitalize flex items-center gap-1">
                    <Globe size={12} className="text-blue-500" />
                    <span>{profile.privacySettings?.profileVisibility || profile.privacy?.profileVisibility || 'Public'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Content Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Main Column (About, Experience, Education, Projects) */}
            <div className="lg:col-span-2 space-y-6">
              {/* About / Executive Summary */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <span>Professional Summary</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('basics')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {profile.bio ||
                    'Lead Business Analyst with 6+ years driving enterprise digital transformation, automated pipeline architectures, and analytics engines across Fintech, SaaS, and Supply Chain ecosystems.'}
                </p>
              </div>

              {/* Work Experience Timeline */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Work Experience</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                      {profile.experience?.length || 0}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('experience')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-4 pt-1">
                  {(profile.experience || []).map((exp: ExperienceEntry, idx: number) => (
                    <div
                      key={exp.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{exp.position}</h4>
                          <p className="text-xs font-bold text-indigo-700">{exp.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                            {exp.workType || 'Hybrid'}
                          </span>
                          <span>•</span>
                          <span>{exp.startDate} → {exp.isCurrent ? 'Present' : exp.endDate}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{exp.description}</p>

                      {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {exp.skillsUsed.map((s: string) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-indigo-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Education & Academics</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                      {profile.education?.length || 0}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('education')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {(profile.education || []).map((edu: EducationEntry, idx: number) => (
                    <div
                      key={edu.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                    >
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{edu.institution}</h4>
                      <p className="text-xs font-bold text-indigo-700">{edu.degree}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {edu.fieldOfStudy} ({edu.startYear} - {edu.endYear})
                      </p>
                      {edu.grade && (
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 mt-1">
                          Grade: {edu.grade}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Projects */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 size={18} className="text-indigo-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Featured Projects & Case Studies</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                      {profile.projects?.length || 0}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('projects')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {(profile.projects || []).map((proj: ProjectEntry, idx: number) => (
                    <div
                      key={proj.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{proj.title}</h4>
                          {proj.role && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md shrink-0">
                              {proj.role}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                          {proj.description}
                        </p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t: string) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-bold border border-slate-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {(proj.liveUrl || proj.githubUrl) && (
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 text-xs">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Github size={12} />
                              <span>Source Code</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (Contact, Skills, Certs, Privacy) */}
            <div className="space-y-6">
              {/* Contact Information & Links */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Contact & Profiles</h3>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('basics')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs font-medium">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{profile.email || 'avinash.tiwari@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{profile.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{profile.location || 'Bengaluru, India'}</span>
                  </div>
                </div>

                {/* Social & Portfolio Links (Shown ONLY if provided by candidate) */}
                {(linkedinLink || githubLink || websiteLink) && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    {linkedinLink && (
                      <a
                        href={linkedinLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:text-indigo-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Linkedin size={14} className="text-blue-600" />
                          <span>LinkedIn Profile</span>
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {githubLink && (
                      <a
                        href={githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:text-indigo-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Github size={14} className="text-slate-800" />
                          <span>GitHub Repositories</span>
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {websiteLink && (
                      <a
                        href={websiteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:text-indigo-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Globe size={14} className="text-emerald-600" />
                          <span>Personal Website</span>
                        </span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Skills & Technologies */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Skills & Tech Stack</h3>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('skills')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(profile.skills || []).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {profile.tools && profile.tools.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Tools & Frameworks
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.tools.map((tool: string) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" />
                    <span>Certifications</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('skills')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div className="space-y-2">
                  {(profile.certifications || []).map((cert: any, idx: number) => (
                    <div
                      key={cert.id || idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs"
                    >
                      <div className="font-extrabold text-slate-900">{cert.name}</div>
                      <div className="text-slate-500 text-[11px]">
                        {cert.issuer} ({cert.year})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Privacy Status */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Shield size={16} className="text-blue-500" />
                    <span>Privacy & Masking</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('privacy')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Profile Visibility</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {profile.privacySettings?.profileVisibility || profile.privacy?.profileVisibility || 'Public'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600 font-medium">Contact Privacy Shield</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* EDIT MODE: EDIT PROFILE FORM                                              */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Edit Mode Header (Clean page title and description only) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Edit Candidate Profile
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Editing Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Make changes to your candidate identity, cover media, career timeline, and preferences.
            </p>
          </div>

          {/* Edit Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
            {[
              { id: 'basics', label: 'Basics & Media', icon: User },
              { id: 'skills', label: 'Skills & Certifications', icon: Award, count: (form.skills?.length || 0) + (form.certifications?.length || 0) },
              { id: 'experience', label: 'Work Experience', icon: Briefcase, count: form.experience?.length || 0 },
              { id: 'education', label: 'Education', icon: GraduationCap, count: form.education?.length || 0 },
              { id: 'projects', label: 'Projects', icon: Code2, count: form.projects?.length || 0 },
              { id: 'privacy', label: 'Privacy & Visibility', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeEditTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveEditTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* EDIT TAB 1: BASICS & MEDIA */}
          {activeEditTab === 'basics' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Media Upload Section (Background Cover & Avatar) */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Profile Images & Cover Background
                </label>

                {/* Cover Background Preview & Upload Card */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600">Cover Background Image</span>
                  <div
                    className="h-32 sm:h-40 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 relative overflow-hidden flex items-center justify-center p-4 transition-all"
                    style={{
                      backgroundColor: '#3b82f6',
                      backgroundImage: (form.backgroundImage || form.coverPhoto)
                        ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.6)), url(${form.backgroundImage || form.coverPhoto})`
                        : 'linear-gradient(to right, #1d4ed8, #4f46e5, #7e22ce)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="flex items-center gap-2 bg-slate-900/75 backdrop-blur-md px-4 py-2 rounded-xl text-white shadow-md">
                      <button
                        type="button"
                        onClick={() => editCoverFileInputRef.current?.click()}
                        className="text-xs font-bold flex items-center gap-1.5 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <Upload size={14} />
                        <span>{(form.backgroundImage || form.coverPhoto) ? 'Upload New Cover' : 'Upload Background Image'}</span>
                      </button>

                      {(form.backgroundImage || form.coverPhoto) && (
                        <>
                          <span className="text-slate-500">|</span>
                          <button
                            type="button"
                            onClick={handleRemoveCover}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reset to default gradient"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Recommended dimensions: 1200x300px. Supports JPG, PNG, WEBP (Max 15MB).
                  </p>
                </div>

                {/* Avatar Row */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="relative group shrink-0">
                    <img
                      src={
                        form.profilePhoto ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt="Profile"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => editAvatarFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={16} />
                    </button>
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editAvatarFileInputRef.current?.click()}
                      className="text-xs font-bold text-slate-700"
                    >
                      <Upload size={13} />
                      <span>Upload Avatar Photo</span>
                    </Button>
                    <p className="text-[11px] text-slate-400 mt-1">Square headshot (JPG, PNG, max 10MB).</p>
                  </div>
                </div>
              </div>

              {/* Form Fields: Personal & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <Input
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <Input
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Headline & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Professional Headline
                  </label>
                  <Input
                    value={form.headline || ''}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Current Location (City, Country)
                  </label>
                  <Input
                    value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Total Experience (Years)
                  </label>
                  <Input
                    type="number"
                    value={form.totalExperienceYears || form.experienceYears || 6.5}
                    onChange={(e) => setForm({ ...form, totalExperienceYears: Number(e.target.value), experienceYears: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* CTC & Notice Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Current CTC
                  </label>
                  <Input
                    value={form.currentSalaryLPA ? `₹${form.currentSalaryLPA} LPA` : form.currentCtc || '₹22 LPA'}
                    onChange={(e) => setForm({ ...form, currentCtc: e.target.value })}
                    placeholder="e.g. ₹22 LPA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Expected CTC
                  </label>
                  <Input
                    value={form.expectedSalaryLPA ? `₹${form.expectedSalaryLPA} LPA` : form.targetSalary || '₹28 LPA'}
                    onChange={(e) => setForm({ ...form, targetSalary: e.target.value })}
                    placeholder="e.g. ₹28 LPA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Notice Period
                  </label>
                  <select
                    value={form.noticePeriod || '15 days'}
                    onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Immediate">Immediate Joiner (0 days)</option>
                    <option value="15 days">15 Days (Serving Notice)</option>
                    <option value="30 days">30 Days (Standard / Negotiable)</option>
                    <option value="60 days">60 Days</option>
                    <option value="90 days">90 Days</option>
                  </select>
                </div>
              </div>

              {/* Social URLs with real-time bidirectional synchronization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    GitHub Profile URL
                  </label>
                  <Input
                    value={form.githubUrl !== undefined ? form.githubUrl : (form.socials?.github || '')}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({
                        ...form,
                        githubUrl: val,
                        socials: { ...(form.socials || {}), github: val }
                      })
                    }}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    value={form.linkedinUrl !== undefined ? form.linkedinUrl : (form.socials?.linkedin || '')}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({
                        ...form,
                        linkedinUrl: val,
                        socials: { ...(form.socials || {}), linkedin: val }
                      })
                    }}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Portfolio Website
                  </label>
                  <Input
                    value={form.portfolioUrl !== undefined ? form.portfolioUrl : (form.socials?.portfolioUrl || '')}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({
                        ...form,
                        portfolioUrl: val,
                        socials: { ...(form.socials || {}), portfolioUrl: val }
                      })
                    }}
                    placeholder="https://portfolio.dev"
                  />
                </div>
              </div>

              {/* Candidate Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Candidate Executive Summary / Bio
                </label>
                <textarea
                  value={form.bio || ''}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 h-28 leading-relaxed font-medium"
                />
              </div>
            </div>
          )}

          {/* EDIT TAB 2: SKILLS & CERTIFICATIONS */}
          {activeEditTab === 'skills' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Skills Management */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Core Skills & Technical Competencies
                </label>

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
                    placeholder="Add skill (e.g. Python, SQL, React, AWS) and press Enter..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={addSkill}
                    className="font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus size={14} />
                    <span>Add Skill</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(form.skills || []).map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200"
                    >
                      <span>{skill}</span>
                      <X
                        size={13}
                        className="cursor-pointer text-indigo-400 hover:text-indigo-700"
                        onClick={() => removeSkill(skill)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications Manager */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-amber-500" />
                  <span>Professional Certifications</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    placeholder="Certification Name (e.g. PL-300, CBAP, AWS Architect)"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  <input
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder="Issuing Authority (e.g. Microsoft, AWS, IIBA)"
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={addCert}
                    className="font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus size={14} />
                    <span>Add Certification</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(form.certifications || []).map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[11px]">{c.issuer} ({c.year})</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCert(c.id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDIT TAB 3: WORK EXPERIENCE */}
          {activeEditTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {form.experience?.length || 0} Work Experience Records
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setExpForm({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, workType: 'Hybrid', description: '', skillsUsed: [] })
                    setExpModal(true)
                  }}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus size={14} />
                  <span>Add Work Experience</span>
                </Button>
              </div>

              <div className="space-y-4">
                {(form.experience || []).map((exp: ExperienceEntry) => (
                  <div
                    key={exp.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">{exp.position}</h3>
                        <p className="text-xs font-bold text-indigo-700">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {exp.workType}
                        </span>
                        <span>•</span>
                        <span>{exp.startDate} → {exp.isCurrent ? 'Present' : exp.endDate}</span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer p-1"
                          title="Delete Entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{exp.description}</p>

                    {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exp.skillsUsed.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT TAB 4: EDUCATION */}
          {activeEditTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {form.education?.length || 0} Education Records
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEduForm({ institution: '', degree: '', fieldOfStudy: '', startYear: 2018, endYear: 2022, grade: '' })
                    setEduModal(true)
                  }}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus size={14} />
                  <span>Add Education</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(form.education || []).map((edu: EducationEntry) => (
                  <div
                    key={edu.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{edu.institution}</h3>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-indigo-700">{edu.degree}</p>
                    <p className="text-xs text-slate-500">{edu.fieldOfStudy} ({edu.startYear} - {edu.endYear})</p>
                    {edu.grade && (
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Grade: {edu.grade}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT TAB 5: PROJECTS */}
          {activeEditTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {form.projects?.length || 0} Featured Projects
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setProjForm({ title: '', description: '', role: '', technologies: [], liveUrl: '', githubUrl: '' })
                    setProjModal(true)
                  }}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus size={14} />
                  <span>Add Featured Project</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(form.projects || []).map((proj: ProjectEntry) => (
                  <div
                    key={proj.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{proj.title}</h3>
                        <button
                          type="button"
                          onClick={() => removeProject(proj.id)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                          title="Delete Entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {proj.role && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                          {proj.role}
                        </span>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(proj.technologies || []).map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT TAB 6: PRIVACY & VISIBILITY */}
          {activeEditTab === 'privacy' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" />
                  <span>Profile Privacy & Network Visibility</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure what peers, recruiters, and the public can view on your candidate profile
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Profile Visibility</div>
                    <div className="text-[11px] text-slate-500">Who can view your full showcase profile and credentials</div>
                  </div>
                  <select
                    value={form.privacySettings?.profileVisibility || form.privacy?.profileVisibility || 'public'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        privacySettings: { ...(form.privacySettings || {}), profileVisibility: e.target.value },
                        privacy: { ...(form.privacy || {}), profileVisibility: e.target.value }
                      })
                    }
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="public">🌐 Public (All recruiters & peers)</option>
                    <option value="connections">👥 Connections Only</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Show Email Address</div>
                    <div className="text-[11px] text-slate-500">Control who can access your direct email contact</div>
                  </div>
                  <select
                    value={form.privacySettings?.showEmailToConnections ? 'connections' : 'private'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        privacySettings: { ...(form.privacySettings || {}), showEmailToConnections: e.target.value === 'connections' }
                      })
                    }
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="connections">👥 Connections Only</option>
                    <option value="private">🔒 Private (Hidden)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Show Phone Number</div>
                    <div className="text-[11px] text-slate-500">Control who can access your mobile contact for screening calls</div>
                  </div>
                  <select
                    value={form.privacySettings?.showPhoneToConnections ? 'connections' : 'private'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        privacySettings: { ...(form.privacySettings || {}), showPhoneToConnections: e.target.value === 'connections' }
                      })
                    }
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="connections">👥 Connections Only</option>
                    <option value="private">🔒 Private (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg flex items-center justify-between gap-3 sticky bottom-4 z-40">
            <span className="text-xs text-slate-500 font-medium">
              You are in <strong>Profile Editing Mode</strong>. Click Save when done.
            </span>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancelEdit}
                className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <X size={14} />
                <span>Cancel</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSave()}
                className="font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-none"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPERIENCE MODAL                                                          */}
      {/* ========================================================================= */}
      {expModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Add Work Experience</h3>
              <button onClick={() => setExpModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company *</label>
                <Input value={expForm.company || ''} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} placeholder="e.g. Swiggy, Paytm, FinScale" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Position / Role *</label>
                <Input value={expForm.position || ''} onChange={(e) => setExpForm({ ...expForm, position: e.target.value })} placeholder="e.g. Senior Business Analyst" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <Input value={expForm.startDate || ''} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} placeholder="e.g. Jan 2022" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <Input disabled={expForm.isCurrent} value={expForm.isCurrent ? 'Present' : expForm.endDate || ''} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} placeholder="e.g. Dec 2023" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isCurrentExp" checked={expForm.isCurrent} onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })} />
                <label htmlFor="isCurrentExp" className="font-semibold text-slate-700 cursor-pointer">I currently work here</label>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
                <select value={expForm.workType || 'Hybrid'} onChange={(e) => setExpForm({ ...expForm, workType: e.target.value as any })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Summary & Key Outcomes</label>
                <textarea value={expForm.description || ''} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20" placeholder="Spearheaded sprint planning and product roadmap alignment..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setExpModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveExperience} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white">Save Experience</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDUCATION MODAL                                                           */}
      {/* ========================================================================= */}
      {eduModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Add Education Record</h3>
              <button onClick={() => setEduModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution / University *</label>
                <Input value={eduForm.institution || ''} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="e.g. BITS Pilani, IIT Bombay" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree *</label>
                <Input value={eduForm.degree || ''} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="e.g. Master of Technology (M.Tech)" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field of Study</label>
                <Input value={eduForm.fieldOfStudy || ''} onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })} placeholder="e.g. Data Analytics & Software Engineering" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Year</label>
                  <Input type="number" value={eduForm.startYear || 2018} onChange={(e) => setEduForm({ ...eduForm, startYear: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Year</label>
                  <Input type="number" value={eduForm.endYear || 2022} onChange={(e) => setEduForm({ ...eduForm, endYear: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade / CGPA</label>
                  <Input value={eduForm.grade || ''} onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })} placeholder="9.2 CGPA" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setEduModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveEducation} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white">Save Education</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECT MODAL                                                             */}
      {/* ========================================================================= */}
      {projModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Add Featured Project</h3>
              <button onClick={() => setProjModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Title *</label>
                <Input value={projForm.title || ''} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} placeholder="e.g. Real-Time Order Analytics Engine" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Role</label>
                <Input value={projForm.role || ''} onChange={(e) => setProjForm({ ...projForm, role: e.target.value })} placeholder="e.g. Lead Analyst / Architect" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Architecture</label>
                <textarea value={projForm.description || ''} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20" placeholder="Built distributed ingestion pipeline reducing latency by 45%..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Live Demo URL</label>
                  <Input value={projForm.liveUrl || ''} onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })} placeholder="https://app.demo.io" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub Repo URL</label>
                  <Input value={projForm.githubUrl || ''} onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })} placeholder="https://github.com/repo" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setProjModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveProject} className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white">Save Project</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
