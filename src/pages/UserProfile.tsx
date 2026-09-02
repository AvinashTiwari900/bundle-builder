import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  UserPlus,
  UserMinus,
  MessageSquare,
  ArrowLeft,
  Share2,
  Award,
  Layers,
  Code2,
  FileText,
  Calendar,
  Lock
} from 'lucide-react'
import { connectionService, ConnectionUser } from '../services/connectionService'
import Button from '../components/ui/Button'
import FormattedContent from '../components/common/FormattedContent'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()

  const [user, setUser] = useState<ConnectionUser | null>(null)
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'projects' | 'posts'>('experience')
  const [toast, setToast] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadProfile = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const p = await connectionService.getUserProfile(id)
      setUser(p)
    } catch (e) {
      console.warn('Error loading user profile:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [id])

  const handleSendRequest = async () => {
    if (!user) return
    const res = await connectionService.sendRequest(user.userId)
    showToast(res.message || 'Connection request sent! 🚀')
    loadProfile()
  }

  const handleAcceptRequest = async () => {
    if (!user) return
    const res = await connectionService.acceptRequest(user.userId)
    showToast(res.message || 'Connection accepted! 🎉')
    loadProfile()
  }

  const handleRemoveConnection = async () => {
    if (!user) return
    if (window.confirm(`Are you sure you want to remove connection with ${user.name}?`)) {
      const res = await connectionService.removeConnection(user.userId)
      showToast(res.message || 'Connection removed.')
      loadProfile()
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 animate-pulse">
        <Sparkles size={24} className="mx-auto mb-2 text-blue-500 animate-spin" />
        <span className="text-xs font-bold">Loading verified professional profile...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">The requested professional profile could not be found or is set to private.</p>
        <Button variant="outline" size="sm" onClick={() => nav('/connections')}>
          <ArrowLeft size={14} />
          <span>Back to Network</span>
        </Button>
      </div>
    )
  }

  const isConnected = user.connectionStatus === 'connected'
  const isPendingSent = user.connectionStatus === 'pending_sent'
  const isPendingReceived = user.connectionStatus === 'pending_received'
  const isSelf = user.connectionStatus === 'self'

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {user.portfolioUrl && (
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles size={13} />
              <span>View Public Portfolio</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Hero Profile Header Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 min-w-[96px] min-h-[96px] rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 leading-snug">
                {user.headline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{user.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  <span>{user.totalExperienceYears || 6}+ Years Experience</span>
                </span>
              </div>
            </div>
          </div>

          {/* Connection Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {!isSelf && (
              <>
                {isConnected ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 size={15} />
                      <span>Connected</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveConnection}
                      className="text-xs text-slate-500 hover:text-rose-500 font-semibold"
                      title="Remove Connection"
                    >
                      <UserMinus size={14} />
                      <span className="hidden sm:inline">Disconnect</span>
                    </Button>
                  </div>
                ) : isPendingSent ? (
                  <span className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                    <Clock size={15} />
                    <span>Request Sent</span>
                  </span>
                ) : isPendingReceived ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAcceptRequest}
                    className="w-full sm:w-auto text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500"
                  >
                    <CheckCircle2 size={15} />
                    <span>Accept Connection</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSendRequest}
                    className="w-full sm:w-auto text-xs font-extrabold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25"
                  >
                    <UserPlus size={15} />
                    <span>Connect</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            {user.bio}
          </p>
        )}

        {/* Core Skills & External Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1">Skills:</span>
            {(user.skills || []).map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="GitHub Profile"
              >
                <Github size={16} />
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: 'experience', label: 'Work Experience', icon: Briefcase, count: user.experience?.length || 0 },
          { id: 'education', label: 'Education', icon: GraduationCap, count: user.education?.length || 0 },
          { id: 'projects', label: 'Featured Projects', icon: Code2, count: user.projects?.length || 0 },
          { id: 'posts', label: 'Community Posts', icon: FileText, count: user.postsCount || 0 }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {(!user.experience || user.experience.length === 0) ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No work experience listed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {user.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{exp.position}</h3>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {exp.workType || 'Hybrid'}
                      </span>
                      <span>•</span>
                      <span>{exp.startDate} → {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {exp.skillsUsed.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[10px] font-semibold border border-blue-200/60 dark:border-blue-800/40">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-4">
          {(!user.education || user.education.length === 0) ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No education history listed.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.education.map((edu) => (
                <div
                  key={edu.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{edu.institution}</h3>
                    <span className="text-[11px] font-bold text-slate-400">{edu.startYear} - {edu.endYear}</span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{edu.degree}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{edu.fieldOfStudy}</p>
                  {edu.grade && (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FEATURED PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {(!user.projects || user.projects.length === 0) ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No featured projects added.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {user.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{proj.title}</h3>
                      {proj.role && (
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">
                          {proj.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(proj.technologies || []).map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
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
                        className="text-slate-600 dark:text-slate-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Github size={12} />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMMUNITY POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {(!user.posts || user.posts.length === 0) ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No community posts shared by {user.name} yet.
            </div>
          ) : (
            <div className="space-y-4">
              {user.posts.map((post: any) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                      {post.postType || post.category || 'Post'}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{post.title}</h3>
                  <FormattedContent content={post.description} className="text-slate-600 dark:text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
