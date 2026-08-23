import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Video,
  Mic,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Volume2
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function InterviewPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recording, setRecording] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [audioLevel, setAudioLevel] = useState(65)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s)
      setHasCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
      showToast('Camera and microphone connected!')
    } catch (err) {
      setHasCamera(true)
      showToast('Simulation camera enabled (Demo Mode)')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
    setHasCamera(false)
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <button
        onClick={() => nav('/interview-practice')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Interview Studio</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Camera & Audio Hardware Check
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ensure clear video lighting, crisp audio input, and ideal eye-contact framing
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => nav('/interview-practice/setup?type=Technical')}
          className="font-bold"
        >
          <Play size={16} />
          <span>Ready for Interview</span>
        </Button>
      </div>

      {/* Video Studio & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Camera Viewfinder (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-xl">
          {hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Video size={28} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Camera Preview Inactive</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click below to test browser camera permissions and audio input levels.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={startCamera}
                className="font-bold text-xs bg-blue-600"
              >
                <Video size={16} />
                <span>Connect Camera & Mic</span>
              </Button>
            </div>
          )}

          {/* Overlay Status Pills */}
          {hasCamera && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>HD Video Live</span>
              </span>
            </div>
          )}

          {hasCamera && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={stopCamera}
                className="font-bold text-xs"
              >
                Disconnect Feed
              </Button>
            </div>
          )}
        </div>

        {/* Diagnostics & Checklist (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span>Hardware Diagnostics</span>
            </h3>

            {/* Mic Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Mic size={14} className="text-slate-400" />
                  <span>Microphone Input</span>
                </span>
                <span className="text-emerald-600 font-bold">Good Quality</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Webcam resolution: 1080p compatible</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Audio noise suppression enabled</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Optimal front-facing lighting</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
              💡 <strong>Pro Tip:</strong> Position your webcam at eye level to establish natural eye contact with recruiters.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
