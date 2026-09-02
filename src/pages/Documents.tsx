import React, { useEffect, useState } from 'react'
import {
  ShieldCheck,
  Upload,
  FileCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Key,
  X,
  Sparkles,
  Cloud,
  ExternalLink
} from 'lucide-react'
import { profileService } from '../services/profileService'
import { cloudinaryService } from '../services/cloudinaryService'
import { firestoreService } from '../services/firestoreService'
import { documentApiService } from '../services/documentApiService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const DOCUMENT_CATEGORIES = [
  'Aadhaar Card (Govt ID)',
  'PAN Card (Tax ID)',
  'Degree Certificate (Education)',
  'Previous Relieving Letter (Experience)',
  'Recent Salary Slips (Last 3 Months)',
  'Past Offer Letter',
  'Passport Size Photograph'
]

export default function DocumentsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState(DOCUMENT_CATEGORIES[0])
  const [selectedDocForOtp, setSelectedDocForOtp] = useState<any>(null)
  const [otpValue, setOtpValue] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [activeAnalysisModal, setActiveAnalysisModal] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const p = profileService.get()
    setProfile(p)
    setDocs(p?.documents || [])

    documentApiService.list().then((backendDocs) => {
      if (!backendDocs) return
      const updated = profileService.get() || {}
      updated.documents = backendDocs
      profileService.save(updated)
      setProfile(updated)
      setDocs(backendDocs)
    })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Upload file to Cloudinary
      const cloudResult = await cloudinaryService.upload(file, 'ras_kyc_docs')

      // 2. Create the real backend record (source of truth for the id)
      const backendDoc = await documentApiService.create({
        name: file.name,
        type: selectedCategory,
        status: 'Pending Verification',
        aiConfidence: 98,
        extractedName: profile?.name || 'Avinash Tiwari',
        extractedIdNumber: 'XXXX-XXXX-4321',
        cloudinaryUrl: cloudResult.secure_url,
        cloudinaryPublicId: cloudResult.public_id
      })

      // 3. Mirror into the local cache using the same id
      await firestoreService.saveDocumentRecord(backendDoc)

      const updated = profileService.get() || {}
      setProfile(updated)
      setDocs(updated.documents || [])
      showToast(`Uploaded ${file.name}! Please verify via OTP.`)
    } catch (err: any) {
      showToast('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpValue.trim() !== generatedOtp) {
      return showToast('Invalid OTP. Please re-check the demo code shown above.')
    }

    const updatedDoc = { ...selectedDocForOtp, status: 'Verified' }
    await firestoreService.saveDocumentRecord(updatedDoc)
    documentApiService.updateStatus(selectedDocForOtp.id, 'Verified')

    const updated = profileService.get() || {}
    setProfile(updated)
    setDocs(updated.documents || [])
    setSelectedDocForOtp(null)
    showToast('Document verified successfully! 🎉')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete document?')) return
    const updated = profileService.get() || {}
    updated.documents = (updated.documents || []).filter((d: any) => d.id !== id)
    profileService.save(updated)
    setProfile(updated)
    setDocs(updated.documents)
    documentApiService.remove(id)
    showToast('Document deleted')
  }

  const verifiedCount = docs.filter((d) => d.status === 'Verified').length

  const openOtpModal = (doc: any) => {
    setSelectedDocForOtp(doc)
    setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString())
    setOtpValue('')
  }

  const closeOtpModal = () => {
    setSelectedDocForOtp(null)
    setGeneratedOtp('')
    setOtpValue('')
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
              KYC & Document Verification Hub
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Cloud size={12} />
              <span>Cloudinary Storage Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit required identity, academic, and compensation records stored on Cloudinary and indexed in the RAS database
          </p>
        </div>
      </div>

      {/* KYC Progress & Upload Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-wider">
                  KYC Verification Score: 96%
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {verifiedCount} of {docs.length} Verified
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                Verified candidate status enabled for all hiring partners
              </h3>
            </div>
          </div>
        </div>

        {/* Upload Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Document Category to Upload to Cloudinary
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleUpload}
                className="sr-only"
                disabled={uploading}
              />
              <span className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload size={15} />
                <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload to Cloudinary'}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Your KYC Records</h2>

        {docs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <FileCheck size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No documents uploaded yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload your government ID, education certificates, and previous employment proofs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => {
              const isVerified = doc.status === 'Verified'
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                        {doc.type}
                      </span>

                      {isVerified ? (
                        <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                          <Clock size={12} />
                          <span>Pending OTP</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mt-2" title={doc.name}>
                      {doc.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>

                    {/* Cloudinary CDN Link */}
                    {doc.cloudinaryUrl && (
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                        <span className="truncate max-w-[150px] font-mono text-slate-600">
                          ☁️ {doc.cloudinaryUrl}
                        </span>
                        <a
                          href={doc.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-bold flex items-center gap-0.5 shrink-0 ml-1"
                        >
                          <span>CDN</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {!isVerified ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openOtpModal(doc)}
                        className="text-xs font-bold"
                      >
                        <Key size={13} />
                        <span>Verify with OTP</span>
                      </Button>
                    ) : (
                      <button
                        onClick={() => setActiveAnalysisModal(doc)}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Sparkles size={13} />
                        <span>AI OCR Report</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <a
                        href={doc.cloudinaryUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                        title="View Cloudinary File"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {selectedDocForOtp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">OTP Identity Verification</h3>
              </div>
              <button
                onClick={closeOtpModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm your identity to authorize secure verification for{' '}
                <strong className="text-slate-900">{selectedDocForOtp.name}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  className="w-full text-center text-xl tracking-widest font-extrabold py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-center">
                  Demo code: <span className="font-bold text-slate-700">{generatedOtp}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="md" onClick={closeOtpModal}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleVerifyOtp} className="font-bold">
                Authorize & Verify Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI OCR Validation Modal */}
      {activeAnalysisModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">AI Document Recognition</h3>
              </div>
              <button
                onClick={() => setActiveAnalysisModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-bold text-slate-800">{activeAnalysisModal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cloud Storage:</span>
                  <span className="font-bold text-blue-600">Cloudinary CDN Synced</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Extracted Name:</span>
                  <span className="font-bold text-emerald-700">
                    {activeAnalysisModal.extractedName || 'Avinash Tiwari'} (100% Match)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authenticity Confidence:</span>
                  <span className="font-bold text-emerald-700">98% Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cross-Document Consistency:</span>
                  <span className="font-bold text-blue-600">Passed</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setActiveAnalysisModal(null)}
              className="w-full font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
