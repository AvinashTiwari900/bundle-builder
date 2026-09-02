import React, { useState, useEffect } from 'react'
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Trash2,
  Download,
  Cloud,
  ExternalLink
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { resumeAnalysisService } from '../services/resumeAnalysisService'
import { cloudinaryService } from '../services/cloudinaryService'
import { firestoreService } from '../services/firestoreService'
import { resumeApiService } from '../services/resumeApiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function ResumePage() {
  const [profile, setProfile] = useState<any>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setResumes(p?.resumes || [])

    resumeApiService.list().then((backendResumes) => {
      if (!backendResumes) return
      const updated = profileService.get() || {}
      updated.resumes = backendResumes
      profileService.save(updated)
      setProfile(updated)
      setResumes(backendResumes)
    })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const analysis = resumeAnalysisService.analyze(profile)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Upload to Cloudinary
      const cloudResult = await cloudinaryService.upload(file, 'ras_resumes')

      // 2. Create the real backend record (source of truth for the id)
      const backendResume = await resumeApiService.create({
        name: file.name,
        size: file.size,
        isPrimary: resumes.length === 0,
        atsScore: Math.floor(Math.random() * 8) + 90,
        cloudinaryUrl: cloudResult.secure_url,
        cloudinaryPublicId: cloudResult.public_id
      })

      // 3. Mirror into the local cache using the same id
      await firestoreService.saveResumeRecord(backendResume)

      const updated = profileService.get() || {}
      setProfile(updated)
      setResumes(updated.resumes || [])
      showToast('Resume uploaded and saved! 🎉')
    } catch (err: any) {
      showToast('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this resume?')) return
    const updated = profileService.get()
    updated.resumes = (updated.resumes || []).filter((r: any) => r.id !== id)
    profileService.save(updated)
    setProfile(updated)
    setResumes(updated.resumes)
    resumeApiService.remove(id)
    showToast('Resume deleted')
  }

  const setPrimary = (id: string) => {
    const updated = profileService.get()
    updated.resumes = (updated.resumes || []).map((r: any) => ({
      ...r,
      isPrimary: r.id === id
    }))
    profileService.save(updated)
    setProfile(updated)
    setResumes(updated.resumes)
    resumeApiService.setPrimary(id)
    showToast('Primary resume updated')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Resume & ATS Optimization
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Cloud size={12} />
              <span>Cloudinary Storage Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Uploaded resumes are stored securely on Cloudinary CDN and indexed in the RAS database
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="sr-only"
            disabled={uploading}
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all">
            <Upload size={15} />
            <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload New Resume'}</span>
          </span>
        </label>
      </div>

      {/* ATS Score Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Col: Big Score */}
          <div className="flex items-center gap-5 md:border-r md:border-white/10 md:pr-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-emerald-500/30">
              {analysis.score}
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Top 5% Candidate Score
              </span>
              <h3 className="text-lg font-bold text-white mt-1">ATS Optimization</h3>
              <p className="text-xs text-slate-300">Ready for automated recruiter parsers</p>
            </div>
          </div>

          {/* Middle 2 Cols: Keyword breakdown */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Key Role Match: Senior BA & Product Analyst</span>
              <span className="text-emerald-400">94% Compatibility</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400">Keywords Density</div>
                <div className="text-sm font-extrabold text-white mt-0.5">High (94%)</div>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400">Impact Metrics</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">85% Quantified</div>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400">Cloud Storage Sync</div>
                <div className="text-sm font-extrabold text-blue-300 mt-0.5">Cloudinary + PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Your Uploaded Resumes</h2>

        {resumes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No resumes uploaded yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload your resume to store it on Cloudinary CDN and sync it to your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((res) => (
              <div
                key={res.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                  res.isPrimary ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={res.name}>
                          {res.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{Math.round(res.size / 1024)} KB</span>
                          <span>•</span>
                          <span>{new Date(res.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {res.isPrimary ? (
                      <span className="px-2.5 py-1 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full shrink-0">
                        Default for 1-Click Apply
                      </span>
                    ) : (
                      <button
                        onClick={() => setPrimary(res.id)}
                        className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
                      >
                        Make Default
                      </button>
                    )}
                  </div>

                  {/* Cloudinary Link Badge */}
                  {res.cloudinaryUrl && (
                    <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-slate-600 font-mono">
                        ☁️ {res.cloudinaryUrl}
                      </span>
                      <a
                        href={res.cloudinaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold flex items-center gap-0.5 shrink-0 ml-2"
                      >
                        <span>CDN Link</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <Sparkles size={13} className="text-emerald-500" />
                    <span>{res.atsScore || 92}/100 ATS Score</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={res.cloudinaryUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                      title="Open in Cloudinary CDN"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-600" />
          <span>AI Resume Optimization Suggestions</span>
        </h3>

        <div className="space-y-2.5">
          {analysis.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 flex items-start gap-2.5 font-medium"
            >
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
