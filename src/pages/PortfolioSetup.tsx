import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  X,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Linkedin,
  Github,
  Globe,
  Share2,
  Trash2,
  SkipForward,
  ShieldCheck,
  Check,
  Save
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { portfolioService } from '../services/portfolioService'
import { authService } from '../services/authService'
import { firestoreService } from '../services/firestoreService'
import { cloudinaryService } from '../services/cloudinaryService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const SUGGESTED_SKILLS = [
  'Python',
  'SQL',
  'React',
  'TypeScript',
  'Power BI',
  'Tableau',
  'Node.js',
  'Machine Learning',
  'AWS Cloud',
  'Docker',
  'Agile / Scrum',
  'System Design',
  'Figma',
  'Data Structures',
  'Stakeholder Management'
]

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
]

const TABS = [
  { id: 'basics', label: '1. Basic Info & Photo', nextName: 'Skills & Competencies', icon: <User size={14} /> },
  { id: 'skills', label: '2. Skills & Tags', nextName: 'Academic Education', icon: <Code2 size={14} /> },
  { id: 'education', label: '3. Education', nextName: 'Work Experience', icon: <GraduationCap size={14} /> },
  { id: 'experience', label: '4. Experience', nextName: 'Projects & Links', icon: <Briefcase size={14} /> },
  { id: 'projects', label: '5. Projects & Links', nextName: 'Finalize Portfolio', icon: <Globe size={14} /> }
] as const

type TabId = (typeof TABS)[number]['id']

export default function PortfolioSetupPage() {
  const nav = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('basics')

  // Form states
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('Bengaluru, India')
  const [experienceYears, setExperienceYears] = useState(2)
  const [targetSalary, setTargetSalary] = useState('₹18 - 25 LPA')
  const [profilePhoto, setProfilePhoto] = useState(AVATAR_PRESETS[0])

  // Skills
  const [skills, setSkills] = useState<string[]>([])
  const [newSkillInput, setNewSkillInput] = useState('')

  // Experience
  const [experiences, setExperiences] = useState<any[]>([])
  const [newExpRole, setNewExpRole] = useState('')
  const [newExpCompany, setNewExpCompany] = useState('')
  const [newExpDuration, setNewExpDuration] = useState('2024 - Present')
  const [newExpDesc, setNewExpDesc] = useState('')

  // Education
  const [degree, setDegree] = useState('Bachelor of Technology (B.Tech)')
  const [collegeName, setCollegeName] = useState('')
  const [gradYear, setGradYear] = useState('2025')
  const [score, setScore] = useState('8.6 CGPA')

  // Projects
  const [projects, setProjects] = useState<any[]>([])
  const [newProjName, setNewProjName] = useState('')
  const [newProjTech, setNewProjTech] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjLink, setNewProjLink] = useState('')

  // Certifications
  const [certifications, setCertifications] = useState<string[]>([
    'AWS Certified Cloud Practitioner',
    'Google Data Analytics Professional'
  ])

  // Achievements
  const [achievements, setAchievements] = useState<string[]>([
    'National Hackathon Finalist',
    'Top 5% in Analytics Assessment'
  ])

  // Socials
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  useEffect(() => {
    const p = profileService.get() || {}
    setProfile(p)

    // Pre-populate fields from registered account
    setHeadline(p.headline || (p.isStudent ? `Student at ${p.college}` : p.role || 'Business Analyst'))
    setBio(
      p.bio ||
        `Motivated professional with focus on data-driven product strategy and technical problem solving.`
    )
    setLocation(p.location || 'Bengaluru, India')
    setExperienceYears(p.experienceYears || (p.isStudent ? 0 : 2))
    setTargetSalary(p.targetSalary || (p.isStudent ? '₹8 - 14 LPA' : '₹18 - 25 LPA'))
    setProfilePhoto(p.profilePhoto || AVATAR_PRESETS[0])
    setSkills(p.skills || ['SQL', 'Python', 'Agile', 'Power BI'])
    setCollegeName(p.college || 'Indian Institute of Technology (IIT) Bombay')
    setLinkedin(
      p.socials?.linkedin ||
        `https://www.linkedin.com/in/${(p.name || 'candidate').toLowerCase().replace(/\s+/g, '-')}`
    )
    setGithub(
      p.socials?.github || 'https://github.com/AvinashTiwari900'
    )
    setPortfolioUrl(p.socials?.portfolioUrl || '')

    if (p.experience && p.experience.length > 0) {
      setExperiences(p.experience)
    } else if (!p.isStudent && p.company) {
      setExperiences([
        {
          id: 'exp-init',
          role: p.role || 'Associate Specialist',
          company: p.company,
          duration: '2023 - Present',
          description: 'Delivering end-to-end technical solutions and cross-functional reporting.'
        }
      ])
    }

    if (p.projects && p.projects.length > 0) {
      setProjects(p.projects)
    }
  }, [])

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab)

  const handleNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSaveAndComplete()
    }
  }

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Add Skill
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed || skills.includes(trimmed)) return
    setSkills([...skills, trimmed])
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  // Add Experience
  const handleAddExperience = () => {
    if (!newExpRole.trim() || !newExpCompany.trim()) return
    const newExp = {
      id: 'exp-' + Date.now(),
      role: newExpRole.trim(),
      company: newExpCompany.trim(),
      duration: newExpDuration.trim(),
      description: newExpDesc.trim()
    }
    setExperiences([...experiences, newExp])
    setNewExpRole('')
    setNewExpCompany('')
    setNewExpDesc('')
  }

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id))
  }

  // Add Project
  const handleAddProject = () => {
    if (!newProjName.trim()) return
    const newProj = {
      id: 'proj-' + Date.now(),
      name: newProjName.trim(),
      technologies: newProjTech.split(',').map((t) => t.trim()).filter(Boolean),
      description: newProjDesc.trim(),
      link: newProjLink.trim() || github
    }
    setProjects([...projects, newProj])
    setNewProjName('')
    setNewProjTech('')
    setNewProjDesc('')
    setNewProjLink('')
  }

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setLoading(true)
      const uploaded = await cloudinaryService.upload(file)
      setProfilePhoto(uploaded.secure_url)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setLoading(false)
    }
  }

  // Skip for Now Action
  const handleSkipForNow = () => {
    authService.markFirstTimeComplete()
    nav('/dashboard')
  }

  // Complete & Save Portfolio Action
  const handleSaveAndComplete = async () => {
    setLoading(true)
    try {
      const current = profileService.get() || {}

      const updatedProfile = {
        ...current,
        headline,
        bio,
        location,
        experienceYears: Number(experienceYears),
        targetSalary,
        profilePhoto,
        skills,
        education: [
          {
            id: 'edu-1',
            institution: collegeName,
            degree,
            graduationYear: Number(gradYear) || 2025,
            score
          }
        ],
        experience: experiences,
        projects,
        certifications,
        achievements,
        socials: {
          linkedin,
          github,
          portfolioUrl
        }
      }

      // 1. Save profile
      profileService.save(updatedProfile)

      // 2. Save portfolio
      const updatedPortfolio = {
        name: updatedProfile.name,
        headline,
        location,
        experienceYears: Number(experienceYears),
        avatar: profilePhoto,
        intro: bio,
        about: `${headline} based in ${location}. Specializing in ${skills.slice(0, 5).join(', ')}.`,
        skills,
        featuredProjects: projects,
        socials: {
          linkedin,
          github,
          portfolioUrl,
          email: updatedProfile.email
        }
      }
      portfolioService.save(updatedPortfolio)

      // 3. Sync to Firestore (non-blocking)
      firestoreService.saveCandidateProfile(updatedProfile)

      // 4. Mark first-time onboarding completed
      authService.markFirstTimeComplete()

      // 5. Navigate to dashboard
      nav('/dashboard')
    } catch (err) {
      console.error(err)
      nav('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
                <Sparkles size={14} className="text-amber-300" />
                <span>First-Time Candidate Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Build Your Candidate Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Welcome, <strong>{profile?.name || 'Candidate'}</strong>! Let's showcase your skills, education, projects, and verified links.
              </p>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSkipForNow}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Skip for Now</span>
                <SkipForward size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Bar with Active Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id
            const isCompleted = idx < currentTabIndex
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : isCompleted
                    ? 'text-blue-700 bg-blue-50/70 hover:bg-blue-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isCompleted && <span className="text-[10px] text-blue-600 font-extrabold">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Tab 1: Basics & Photo */}
        {activeTab === 'basics' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <span>1. Professional Summary & Photo</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Step 1 of 5
              </span>
            </div>

            {/* Profile Photo Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Profile Photo
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={profilePhoto}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-2xl border-2 border-blue-500 shadow-md object-cover"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 cursor-pointer flex items-center gap-1.5">
                      <Upload size={14} />
                      <span>Upload Custom Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">or choose avatar preset:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((avatar, i) => (
                      <img
                        key={i}
                        src={avatar}
                        alt="Preset"
                        onClick={() => setProfilePhoto(avatar)}
                        className={`w-9 h-9 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                          profilePhoto === avatar
                            ? 'border-blue-600 scale-110 shadow-sm'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Professional Headline
                </label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Lead Business Analyst & Product Strategist"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Location
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={experienceYears}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e) => setExperienceYears(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
                  placeholder="0 for students / freshers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Target Salary Expectation
                </label>
                <Input
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                  placeholder="e.g. ₹18 - 25 LPA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Professional Bio & Executive Summary
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="Share a concise summary of your core strengths and career goals..."
              />
            </div>
          </div>
        )}

        {/* Tab 2: Skills & Competencies */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Code2 size={18} className="text-blue-600" />
                <span>2. Core Competencies & Technical Skills</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Step 2 of 5
              </span>
            </div>

            {/* Custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(newSkillInput)
                  }
                }}
                placeholder="Type a skill (e.g. Snowflake, PyTorch, Power BI) and press Enter..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleAddSkill(newSkillInput)}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </Button>
            </div>

            {/* Selected Skills Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Your Selected Skills ({skills.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-100 shadow-sm"
                  >
                    <span>{skill}</span>
                    <X
                      size={13}
                      className="cursor-pointer text-blue-400 hover:text-blue-700"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Skills */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Popular Suggestions (Click to Add):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddSkill(suggestion)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Education */}
        {activeTab === 'education' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" />
                <span>3. Academic Credentials & Education</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Step 3 of 5
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  College / University (From Registration)
                </label>
                <Input
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="College Name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Degree / Major
                  </label>
                  <Input
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Graduation Year
                  </label>
                  <Input
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2025"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    CGPA / Score
                  </label>
                  <Input
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 8.8 CGPA"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Experience */}
        {activeTab === 'experience' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                <span>4. Work Experience & Roles</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Optional for students</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Step 4 of 5
                </span>
              </div>
            </div>

            {/* Add Experience Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="font-bold text-xs text-slate-800">Add Work Experience:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={newExpRole}
                  onChange={(e) => setNewExpRole(e.target.value)}
                  placeholder="Job Role (e.g. Business Analyst)"
                />
                <Input
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  placeholder="Company Name (e.g. Infosys)"
                />
                <Input
                  value={newExpDuration}
                  onChange={(e) => setNewExpDuration(e.target.value)}
                  placeholder="Duration (e.g. 2023 - 2025)"
                />
              </div>
              <textarea
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                placeholder="Key accomplishments & quantifiable outcomes..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-16"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExperience}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Experience</span>
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {exp.role} · <span className="text-blue-600">{exp.company}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{exp.duration}</div>
                    <div className="text-slate-600 text-xs mt-1">{exp.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Projects & Socials */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe size={18} className="text-blue-600" />
                <span>5. Projects, Case Studies & Social Links</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Step 5 of 5
              </span>
            </div>

            {/* Social Links Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Public Social Profiles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    icon={<Linkedin size={15} className="text-blue-600" />}
                  />
                </div>
                <div>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    icon={<Github size={15} className="text-slate-800" />}
                  />
                </div>
                <div>
                  <Input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://your-portfolio.dev"
                    icon={<Globe size={15} className="text-indigo-600" />}
                  />
                </div>
              </div>
            </div>

            {/* Add Project Card */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="font-bold text-xs text-slate-800">Add Featured Project / Case Study:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Project Title (e.g. Revenue Forecasting Engine)"
                />
                <Input
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  placeholder="Tech Stack (e.g. Python, SQL, Tableau)"
                />
              </div>
              <textarea
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Key problem solved and measurable impact..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-16"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProject}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </Button>
            </div>

            {/* Projects List */}
            <div className="space-y-2">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{proj.name}</div>
                    <div className="text-[11px] text-slate-500">{proj.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(proj.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Bottom Navigation Bar with Back & Next Tab Buttons */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Skip Option */}
          <button
            type="button"
            onClick={handleSkipForNow}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <SkipForward size={14} />
            <span>Skip for Now (Go to Dashboard)</span>
          </button>

          {/* Right: Step Navigation Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Previous Step Button */}
            {currentTabIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevTab}
                className="font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </Button>
            )}

            {/* Next Tab Button (for tabs 1, 2, 3, 4) */}
            {currentTabIndex < TABS.length - 1 ? (
              <Button
                type="button"
                size="md"
                onClick={handleNextTab}
                className="font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Next: {TABS[currentTabIndex + 1].label.split('. ')[1]}</span>
                <ArrowRight size={15} />
              </Button>
            ) : (
              /* Final Tab: Complete & Save Button */
              <Button
                type="button"
                size="md"
                onClick={handleSaveAndComplete}
                disabled={loading}
                className="font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Complete & Save Portfolio</span>
                <ArrowRight size={15} />
              </Button>
            )}

            {/* Quick Save & Finish Button (available across all tabs) */}
            {currentTabIndex < TABS.length - 1 && (
              <button
                type="button"
                onClick={handleSaveAndComplete}
                className="text-[11px] font-bold text-blue-600 hover:underline px-2 py-1.5 cursor-pointer hidden md:inline-flex items-center gap-1"
                title="Save portfolio with current details and go to dashboard"
              >
                <Save size={13} />
                <span>Save & Finish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
