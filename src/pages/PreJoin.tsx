import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { meetingService, MeetingRecording } from '../services/meetingService'
import { profileService } from '../services/profileService'
import { mediaStreamManager } from '../services/mediaStreamManager'
import Button from '../components/ui/Button'

export default function PreJoinPage() {
  const { code } = useParams<{ code: string }>()
  const nav = useNavigate()
  const loc = useLocation()
  const queryParams = new URLSearchParams(loc.search)

  const candidateProfile = profileService.get() || { name: 'Avinash Tiwari' }
  const [displayName, setDisplayName] = useState(candidateProfile.name || 'Avinash Tiwari')
  const [meeting, setMeeting] = useState<MeetingRecording | null>(null)

  // Hardware toggle states
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isWaitingRoomNotice, setIsWaitingRoomNotice] = useState(false)

  // Stream Refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    // Find meeting by code or id
    if (code) {
      const found = meetingService.getMeetingById(code)
      if (found) {
        setMeeting(found)
        if (found.waitingRoomEnabled) {
          setIsWaitingRoomNotice(true)
        }
      } else {
        // Fallback for direct code links
        setMeeting({
          id: 'meet-' + code,
          code: code.toUpperCase(),
          title: queryParams.get('title') || 'Team Collaboration & Project Sync',
          meetingType: 'Live Video Conference',
          hostName: queryParams.get('host') || 'Marcus Chen',
          status: 'In Progress',
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationMinutes: 45,
          roomUrl: `/interview/room/meet-${code}?code=${code}`,
          shareUrl: `${window.location.origin}/meet/${code}`,
          isRecorded: false,
          hasScreenShare: false,
          participants: [],
          summaryNotes: '',
          transcript: []
        })
      }
    }
  }, [code, loc.search])

  const stopHardware = useCallback(() => {
    isMountedRef.current = false

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
          track.enabled = false
        } catch (e) {}
      })
      mediaStreamRef.current = null
    }

    try {
      mediaStreamManager.stopAll()
    } catch (e) {}

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (e) {}
      audioContextRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (videoPreviewRef.current) {
      try {
        videoPreviewRef.current.pause()
        videoPreviewRef.current.srcObject = null
        videoPreviewRef.current.load()
      } catch (e) {}
    }
  }, [])

  const initPreview = async () => {
    setCameraError(null)
    isMountedRef.current = true

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Webcam access not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop()
            t.enabled = false
          } catch (e) {}
        })
        return
      }

      mediaStreamManager.register(stream)
      mediaStreamRef.current = stream

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play().catch(() => {})
      }

      // Audio level meter
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioCtx = new AudioContextClass()
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {})
        }
        audioContextRef.current = audioCtx
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        const microphone = audioCtx.createMediaStreamSource(stream)
        microphone.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateAudio = () => {
          if (!isMountedRef.current) return
          analyser.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length
          setAudioLevel(Math.min(100, avg * 2.5))
          animationFrameRef.current = requestAnimationFrame(updateAudio)
        }
        updateAudio()
      } catch (audioErr) {
        console.warn('Audio metering skipped:', audioErr)
      }
    } catch (err: any) {
      console.warn('Webcam permission error:', err)
      setCameraError('Camera or microphone blocked. You can still join with audio/video muted.')
      setIsCameraOn(false)
    }
  }

  useEffect(() => {
    initPreview()
    return () => {
      stopHardware()
    }
  }, [stopHardware])

  const toggleMic = () => {
    const next = !isMicOn
    setIsMicOn(next)
    if (!next) {
      setAudioLevel(0)
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {})
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next))
    }
  }

  const toggleCamera = () => {
    const next = !isCameraOn
    setIsCameraOn(next)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
      if (next && videoPreviewRef.current) {
        if (!videoPreviewRef.current.srcObject) {
          videoPreviewRef.current.srcObject = mediaStreamRef.current
        }
        videoPreviewRef.current.play().catch(() => {})
      }
    }
  }

  const handleJoinNow = (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) return

    stopHardware()
    const targetRoomId = meeting?.id || 'meet-' + (code || 'session')
    const query = new URLSearchParams({
      code: code || 'ROOM',
      title: meeting?.title || 'Team Video Conference',
      host: meeting?.hostName || 'Marcus Chen',
      userName: displayName.trim(),
      mic: isMicOn ? '1' : '0',
      cam: isCameraOn ? '1' : '0'
    })

    nav(`/interview/room/${targetRoomId}?${query.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold">
            <Video size={13} />
            <span>Secure In-Platform Meeting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            You're Invited to a Meeting
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Check your audio and video before joining. Everyone in the meeting will be able to see and hear you.
          </p>
        </div>

        {/* Camera/Mic Permission Warning Banner if blocked */}
        {cameraError && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-start gap-3 text-xs text-rose-200 animate-in fade-in duration-200">
            <AlertCircle size={17} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="font-bold text-rose-100">Media Device Notice</div>
              <p className="text-rose-300/90 leading-relaxed">{cameraError}</p>
            </div>
            <button
              type="button"
              onClick={initPreview}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-xl font-bold border border-rose-700/60 text-xs cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Meeting Details Bar */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
              Meeting Title
            </span>
            <div className="font-extrabold text-sm text-white">{meeting?.title || 'Product Planning Sync'}</div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Host</span>
              <span className="font-bold text-slate-200">{meeting?.hostName || 'Marcus Chen'}</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Meeting Code</span>
              <span className="font-mono font-extrabold text-cyan-400">{code?.toUpperCase() || 'X7K92P'}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Live Hardware Preview & Join Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Camera Preview (7 Cols) */}
          <div className="md:col-span-7 space-y-3">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center group">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-150 ${
                  isCameraOn ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />

              {!isCameraOn && (
                <div className="text-center space-y-2 p-4 text-slate-500 animate-in fade-in duration-150">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <VideoOff size={28} />
                  </div>
                  <div className="text-xs font-bold text-slate-300">Camera is Turned Off</div>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span>{isCameraOn ? 'Live Preview' : 'Video Off'}</span>
              </div>

              {/* Microphone Volume Meter Bar */}
              {isMicOn && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <Mic size={12} className="text-emerald-400" />
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-75"
                      style={{ width: `${audioLevel}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Toggle Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isMicOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-rose-950/80 text-rose-400 border-rose-800'
                }`}
              >
                {isMicOn ? <Mic size={15} className="text-emerald-400" /> : <MicOff size={15} />}
                <span>{isMicOn ? 'Mic is ON' : 'Mic is OFF'}</span>
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  isCameraOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-rose-950/80 text-rose-400 border-rose-800'
                }`}
              >
                {isCameraOn ? <Video size={15} className="text-blue-400" /> : <VideoOff size={15} />}
                <span>{isCameraOn ? 'Camera is ON' : 'Camera is OFF'}</span>
              </button>
            </div>
          </div>

          {/* Right: Display Name & Join Form (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            <form onSubmit={handleJoinNow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                />
                <span className="text-[10px] text-slate-500">This name will be shown to other participants.</span>
              </div>

              {isWaitingRoomNotice && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-[11px] text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info size={13} />
                    <span>Waiting Room Enabled</span>
                  </div>
                  <p className="text-slate-300 leading-tight">
                    The host will be notified and will admit you into the call after you join.
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full font-extrabold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 py-3.5"
              >
                <span>Join Meeting</span>
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-500">
                🔒 Encrypted WebRTC audio & video with manual user-controlled recording.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
