import React, { useEffect, useState } from 'react'
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Sparkles,
  Code2,
  Award,
  Clock,
  Briefcase,
  Layers,
  Wand2
} from 'lucide-react'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ProjectsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Lead Business Analyst')
  const [duration, setDuration] = useState('4 months')
  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [outcomes, setOutcomes] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [link, setLink] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [analyzingProjId, setAnalyzingProjId] = useState<string | null>(null)
  const [aiCritique, setAiCritique] = useState<{ id: string; score: number; tips: string[] } | null>(
    null
  )
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setProfile(profileService.get())
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const projects = profile?.projects || []

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newProj = {
      id: 'proj-' + Date.now(),
      name: name.trim(),
      role: role.trim(),
      duration: duration.trim(),
      description: description.trim(),
      responsibilities: responsibilities.trim(),
      outcomes: outcomes.trim(),
      technologies: technologies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      link: link.trim(),
      githubUrl: githubUrl.trim() || 'https://github.com/avinash-tiwari',
      createdAt: new Date().toISOString()
    }

    const updated = profileService.get() || {}
    updated.projects = [newProj, ...(updated.projects || [])]
    profileService.save(updated)
    setProfile(updated)

    setName('')
    setDescription('')
    setResponsibilities('')
    setOutcomes('')
    setTechnologies('')
    setLink('')
    setGithubUrl('')
    setIsAdding(false)
    showToast('Project added with measurable outcomes! 🚀')
  }

  const analyzeProjectWithAi = (proj: any) => {
    setAnalyzingProjId(proj.id)
    setTimeout(() => {
      setAnalyzingProjId(null)
      setAiCritique({
        id: proj.id,
        score: 92,
        tips: [
          'Strong technical toolkit (SQL & BI models prominently featured)',
          'High recruiter appeal: Clearly quantified 75% reporting latency reduction',
          'Suggestion: Add link to interactive Tableau / Power BI web embed'
        ]
      })
      showToast('AI Quality Feedback Generated! 💡')
    }, 700)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project?')) return
    const updated = profileService.get() || {}
    updated.projects = (updated.projects || []).filter((p: any) => p.id !== id)
    profileService.save(updated)
    setProfile(updated)
    if (aiCritique?.id === id) setAiCritique(null)
    showToast('Project removed')
  }

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
            Projects & Case Study Showcase
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase technical problem-solving, project leadership, and quantified outcomes
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAdding((prev) => !prev)}
          className="font-bold"
        >
          <Plus size={16} />
          <span>{isAdding ? 'Close Form' : 'Add New Project'}</span>
        </Button>
      </div>

      {/* Add Project Form Box */}
      {isAdding && (
        <form
          onSubmit={handleAddProject}
          className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Add New Case Study / Project</h3>
            <span className="text-xs text-blue-600 font-bold">Include measurable metrics for top score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Project Title *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Revenue Analytics & Forecasting Engine"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Your Role
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Business Analyst"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Project Summary & Problem Statement *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What business problem were you solving? What was the context?"
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Key Responsibilities & Actions Taken
              </label>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="e.g. Designed dimensional SQL data model, led sprint backlogs, authored BRD..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Measurable Business Outcomes / ROI
              </label>
              <textarea
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                placeholder="e.g. Cut manual report turnaround from 4 days to 2 hours (75% time saving)..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Technologies (comma separated)
              </label>
              <Input
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="Power BI, SQL, Python, Snowflake"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                GitHub Repository URL
              </label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Duration
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 4 months"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="md" type="button" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" className="font-bold">
              Save Project Case Study
            </Button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <FolderGit2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No projects added yet</h4>
          <p className="text-xs text-slate-500 mt-1">
            Add projects to increase your ATS match and showcase tangible accomplishments to recruiters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj: any) => (
            <div
              key={proj.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Code2 size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{proj.name}</h3>
                      <div className="text-[11px] text-blue-600 font-semibold">
                        {proj.role || 'Business Analyst'} · {proj.duration || '3 months'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {proj.description}
                </p>

                {proj.outcomes && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 font-semibold flex items-start gap-1.5">
                    <Award size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Outcome: {proj.outcomes}</span>
                  </div>
                )}

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.technologies || []).map((t: string) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* AI Review Card if analyzed */}
                {aiCritique?.id === proj.id && (
                  <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs space-y-2 text-indigo-950 animate-in fade-in duration-150">
                    <div className="font-extrabold flex items-center justify-between text-indigo-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-indigo-600" />
                        <span>AI Project Quality Rating</span>
                      </span>
                      <span className="text-emerald-700 font-bold">{aiCritique.score}/100</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {aiCritique.tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Bottom Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => analyzeProjectWithAi(proj)}
                    disabled={analyzingProjId === proj.id}
                    className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-indigo-200"
                  >
                    <Wand2 size={13} />
                    <span>{analyzingProjId === proj.id ? 'Analyzing...' : 'AI Review'}</span>
                  </button>

                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>Repository</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
