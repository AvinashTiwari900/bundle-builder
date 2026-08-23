import React, { useState, useEffect } from 'react'
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
  Camera
} from 'lucide-react'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [newSkill, setNewSkill] = useState('')
  const [newCertName, setNewCertName] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setForm(p || {})
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    profileService.save(form)
    setProfile(form)
    showToast('Candidate Profile & Preferences Saved! 🎉')
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

  const addCert = () => {
    if (!newCertName.trim() || !newCertIssuer.trim()) return
    const certs = form.certifications || []
    certs.push({
      id: 'cert-' + Date.now(),
      name: newCertName.trim(),
      issuer: newCertIssuer.trim(),
      year: new Date().getFullYear()
    })
    setForm({ ...form, certifications: certs })
    setNewCertName('')
    setNewCertIssuer('')
    showToast('Certification added')
  }

  const removeCert = (id: string) => {
    const certs = (form.certifications || []).filter((c: any) => c.id !== id)
    setForm({ ...form, certifications: certs })
  }

  if (!profile) return null

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
          Candidate Identity & Career Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed profile information used by AI matching, ATS screening, and recruiter SLA verification
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Avatar Row */}
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="relative group">
              <img
                src={
                  form.profilePhoto ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <button
                type="button"
                onClick={() => showToast('Avatar updated (Demo)')}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{form.name || 'Candidate'}</h3>
              <p className="text-xs text-blue-600 font-bold">{form.headline || 'Lead Business Analyst'}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span>📍 {form.location || 'Bengaluru, India'}</span>
                <span>•</span>
                <span>💼 {form.experienceYears || 5} Years Experience</span>
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

          {/* Role & Location Preferences */}
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
                Current Location
              </label>
              <Input
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Preferred Job Roles
              </label>
              <Input
                value={form.preferredRoles || 'Business Analyst, Product Analyst, Data Lead'}
                onChange={(e) => setForm({ ...form, preferredRoles: e.target.value })}
              />
            </div>
          </div>

          {/* Compensation & Notice Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Current CTC
              </label>
              <Input
                value={form.currentCtc || '₹18 LPA'}
                onChange={(e) => setForm({ ...form, currentCtc: e.target.value })}
                placeholder="e.g. ₹18 LPA"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Expected CTC
              </label>
              <Input
                value={form.targetSalary || '₹24 - 28 LPA'}
                onChange={(e) => setForm({ ...form, targetSalary: e.target.value })}
                placeholder="e.g. ₹24 - 28 LPA"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Notice Period
              </label>
              <select
                value={form.noticePeriod || '30 days'}
                onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Immediate">Immediate Joiner (0 days)</option>
                <option value="15 days">15 Days (Serving Notice)</option>
                <option value="30 days">30 Days (Standard / Negotiable)</option>
                <option value="60 days">60 Days</option>
                <option value="90 days">90 Days</option>
              </select>
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
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-24 leading-relaxed font-medium"
            />
          </div>

          {/* Skills Management */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Core Skills & Tools
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
                placeholder="Add skill (e.g. Python, Snowflake, Jira) and press Enter..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkill}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Skill</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
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

          {/* Certifications Manager */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                <span>Professional Certifications</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Certification Name (e.g. CBAP, Power BI PL-300)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                value={newCertIssuer}
                onChange={(e) => setNewCertIssuer(e.target.value)}
                placeholder="Issuing Authority (e.g. Microsoft, IIBA)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCert}
                className="font-bold text-xs"
              >
                <Plus size={14} />
                <span>Add Certification</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(form.certifications || [
                { id: 'c1', name: 'Microsoft Certified: Power BI Data Analyst Associate', issuer: 'Microsoft', year: 2024 },
                { id: 'c2', name: 'Certified Business Analysis Professional (CBAP)', issuer: 'IIBA', year: 2023 }
              ]).map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-slate-500 text-[11px]">{c.issuer} ({c.year})</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCert(c.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="lg" className="font-bold">
              <Save size={16} />
              <span>Save Full Candidate Profile</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
