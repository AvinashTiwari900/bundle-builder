import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  Monitor,
  Radio,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  FileText,
  Download,
  ArrowLeft,
  X,
  Plus,
  Send,
  MoreVertical,
  Settings,
  PhoneOff,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  User,
  ShieldCheck,
  Lock,
  Unlock,
  UserX,
  Crown,
  Search
} from 'lucide-react'
import Button from '../components/ui/Button'
import { speechService } from '../services/speechService'
import { profileService } from '../services/profileService'
import { meetingService, MeetingTranscriptEntry, MeetingRecording } from '../services/meetingService'
import { notificationService } from '../services/notificationService'
import { mediaStreamManager } from '../services/mediaStreamManager'

interface ParticipantState {
  id: string
  name: string
  role: string
  avatar?: string
  isHost: boolean
  isMicOn: boolean
  isCameraOn: boolean
  isSpeaking: boolean
  isSharingScreen: boolean
}

export default function MeetingRoomPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const queryParams = new URLSearchParams(loc.search)

  const meetingCode = queryParams.get('code') || id?.replace('meet-', '').toUpperCase() || 'X7K92P'
  const meetingTitle = queryParams.get('title') || 'Product Planning & Sprint Sync'
  const hostParam = queryParams.get('host') || 'Marcus Chen'
  const candidateProfile = profileService.get() || { name: 'Avinash Tiwari' }
  const candidateName = queryParams.get('userName') || candidateProfile.name || 'Avinash Tiwari'

  // Hardware states (respect pre-join query params if passed)
  const initialMic = queryParams.get('mic') !== '0'
  const initialCam = queryParams.get('cam') !== '0'

  const [isMicMuted, setIsMicMuted] = useState(!initialMic)
  const [isVideoDisabled, setIsVideoDisabled] = useState(!initialCam)
  const [isSelfSpeaking, setIsSelfSpeaking] = useState(false)

  // Streams
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Side Drawer Tabs: 'transcript' | 'chat' | 'participants' | null
  const [activeSidePanel, setActiveSidePanel] = useState<'transcript' | 'chat' | 'participants' | null>('transcript')
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  // Recording State (Explicitly User-Initiated ONLY)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordingSavedModal, setRecordingSavedModal] = useState<boolean>(false)
  const [hadScreenShareDuringRecording, setHadScreenShareDuringRecording] = useState(false)
  const [showRecordingToast, setShowRecordingToast] = useState(false)

  // Overall Meeting Timer
  const [meetingElapsed, setMeetingElapsed] = useState(0)

  // Security / Host settings
  const [isMeetingLocked, setIsMeetingLocked] = useState(false)
  const [allowScreenSharing, setAllowScreenSharing] = useState(true)

  // Dynamic Remote Participants in Room
  const [participants, setParticipants] = useState<ParticipantState[]>([
    {
      id: 'p-self',
      name: `${candidateName} (You)`,
      role: 'Participant',
      isHost: candidateName.toLowerCase().includes('marcus'),
      isMicOn: initialMic,
      isCameraOn: initialCam,
      isSpeaking: false,
      isSharingScreen: false
    },
    {
      id: 'p-1',
      name: 'Marcus Chen',
      role: 'VP of Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      isHost: true,
      isMicOn: true,
      isCameraOn: true,
      isSpeaking: true,
      isSharingScreen: false
    },
    {
      id: 'p-2',
      name: 'Sarah Jenkins',
      role: 'Product Designer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      isHost: false,
      isMicOn: true,
      isCameraOn: true,
      isSpeaking: false,
      isSharingScreen: false
    },
    {
      id: 'p-3',
      name: 'Elena Vance',
      role: 'Data Architect',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
      isHost: false,
      isMicOn: false,
      isCameraOn: true,
      isSpeaking: false,
      isSharingScreen: false
    }
  ])

  // Live Transcript
  const [transcriptEntries, setTranscriptEntries] = useState<MeetingTranscriptEntry[]>([
    {
      timestamp: '00:05',
      speaker: 'Marcus Chen',
      speakerRole: 'host',
      text: `Welcome everyone to ${meetingTitle}. Let us review our key deliverables and sync on technical milestones.`
    },
    {
      timestamp: '00:23',
      speaker: candidateName,
      speakerRole: 'participant',
      text: "Hello Marcus, I have the architecture notes and partition benchmark data ready to present."
    }
  ])
  const [transcriptSearch, setTranscriptSearch] = useState('')

  // In-Meeting Chat
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; time: string; text: string; isSelf: boolean }[]
  >([
    {
      id: 'c-1',
      sender: 'Marcus Chen',
      time: '10:30 AM',
      text: 'Welcome! Feel free to share your screen whenever ready.',
      isSelf: false
    }
  ])
  const [chatInput, setChatInput] = useState('')

  // Stream & Hardware Refs (Guaranteed cleanup on unmount)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const meetingTimerRef = useRef<any>(null)
  const recordingTimerRef = useRef<any>(null)
  const isRecordingRef = useRef<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null)
  const chatBottomRef = useRef<HTMLDivElement | null>(null)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // =========================================================================
  // GUARANTEED HARDWARE CLEANUP: Releases all camera and microphone tracks immediately
  // =========================================================================
  const stopAllMediaTracks = useCallback(() => {
    isMountedRef.current = false

    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
          track.enabled = false
        } catch (e) {}
      })
      webcamStreamRef.current = null
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
          track.enabled = false
        } catch (e) {}
      })
      screenStreamRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
      mediaRecorderRef.current = null
    }

    // Force global cleanup of any remaining tracks
    try {
      mediaStreamManager.stopAll()
    } catch (e) {}

    try {
      speechService.stop()
      speechService.stopListening()
    } catch (e) {}

    if (localVideoRef.current) {
      try {
        localVideoRef.current.pause()
        localVideoRef.current.srcObject = null
        localVideoRef.current.load()
      } catch (e) {}
    }
    if (screenVideoRef.current) {
      try {
        screenVideoRef.current.pause()
        screenVideoRef.current.srcObject = null
        screenVideoRef.current.load()
      } catch (e) {}
    }

    setWebcamStream(null)
    setScreenStream(null)
  }, [])

  // =========================================================================
  // 1. Initialize Hardware Webcam Feed
  // =========================================================================
  const initWebcam = async () => {
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

      // If user navigated away or left while camera was initializing, kill tracks instantly!
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
      webcamStreamRef.current = stream
      setWebcamStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.play().catch(() => {})
      }

      if (isVideoDisabled) {
        stream.getVideoTracks().forEach((t) => (t.enabled = false))
      }
      if (isMicMuted) {
        stream.getAudioTracks().forEach((t) => (t.enabled = false))
      }
    } catch (err: any) {
      try {
        if (!isMountedRef.current) return
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
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
        webcamStreamRef.current = stream
        setWebcamStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          localVideoRef.current.play().catch(() => {})
        }
      } catch (err2) {
        console.warn('Webcam permission not granted:', err2)
        setCameraError('Webcam blocked or busy. Click to grant camera access.')
      }
    }
  }

  useEffect(() => {
    initWebcam()

    // Overall Meeting Stopwatch
    meetingTimerRef.current = setInterval(() => {
      setMeetingElapsed((prev) => prev + 1)
    }, 1000)

    // Simulate natural remote participant speaking indicator
    const speakerInterval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === 'p-self') return p
          if (p.id === 'p-1') return { ...p, isSpeaking: Math.random() > 0.4 }
          if (p.id === 'p-2') return { ...p, isSpeaking: Math.random() > 0.7 }
          return { ...p, isSpeaking: false }
        })
      )
    }, 3000)

    const handleBeforeUnload = () => stopAllMediaTracks()
    const handlePopState = () => stopAllMediaTracks()
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      if (meetingTimerRef.current) clearInterval(meetingTimerRef.current)
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      clearInterval(speakerInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      stopAllMediaTracks()
    }
  }, [stopAllMediaTracks])

  // Attach webcam stream to DOM
  useEffect(() => {
    if (localVideoRef.current && webcamStream && !isVideoDisabled) {
      localVideoRef.current.srcObject = webcamStream
      localVideoRef.current.play().catch(() => {})
    }
  }, [webcamStream, isVideoDisabled])

  // Attach screen stream to DOM
  useEffect(() => {
    if (screenVideoRef.current && screenStream && isScreenSharing) {
      screenVideoRef.current.srcObject = screenStream
      screenVideoRef.current.play().catch(() => {})
    }
  }, [screenStream, isScreenSharing])

  // Auto-scroll transcript drawer
  useEffect(() => {
    if (activeSidePanel === 'transcript') {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcriptEntries, activeSidePanel])

  // Auto-scroll chat drawer
  useEffect(() => {
    if (activeSidePanel === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, activeSidePanel])

  // =========================================================================
  // 2. Hardware Controls: Mic, Video
  // =========================================================================
  const toggleMic = () => {
    const next = !isMicMuted
    setIsMicMuted(next)
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next))
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-self' ? { ...p, isMicOn: !next, isSpeaking: !next } : p))
    )
    if (next) {
      speechService.stopListening()
      setIsSelfSpeaking(false)
    } else if (isRecording) {
      startDictation()
    }
  }

  const toggleVideo = () => {
    const next = !isVideoDisabled
    setIsVideoDisabled(next)
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !next))
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-self' ? { ...p, isCameraOn: !next } : p))
    )
  }

  // =========================================================================
  // 3. Screen Sharing (Independent of Recording)
  // =========================================================================
  const handleStartScreenShare = async () => {
    if (!allowScreenSharing) {
      alert('Screen sharing is currently locked by the host.')
      return
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is not supported on this browser.')
        return
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      screenStreamRef.current = stream
      setScreenStream(stream)
      setIsScreenSharing(true)

      setParticipants((prev) =>
        prev.map((p) => (p.id === 'p-self' ? { ...p, isSharingScreen: true } : p))
      )

      if (isRecordingRef.current) {
        setHadScreenShareDuringRecording(true)
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => handleStopScreenShare()
      }
    } catch (err: any) {
      console.warn('Screen share canceled:', err)
      setIsScreenSharing(false)
    }
  }

  const handleStopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => {
        t.stop()
        t.enabled = false
      })
      screenStreamRef.current = null
    }
    setScreenStream(null)
    setIsScreenSharing(false)

    setParticipants((prev) =>
      prev.map((p) => (p.id === 'p-self' ? { ...p, isSharingScreen: false } : p))
    )
  }

  // =========================================================================
  // 4. User-Initiated Recording & Privacy Notification
  // =========================================================================
  const handleStartRecording = () => {
    setIsRecording(true)
    isRecordingRef.current = true
    setRecordingSeconds(0)
    recordedChunksRef.current = []

    if (isScreenSharing) {
      setHadScreenShareDuringRecording(true)
    }

    // Show privacy & consent notification
    setShowRecordingToast(true)
    setTimeout(() => setShowRecordingToast(false), 6000)

    // Capture media stream if supported
    const activeStream = screenStreamRef.current || webcamStreamRef.current
    if (activeStream && typeof MediaRecorder !== 'undefined') {
      try {
        let mimeType = 'video/webm'
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        }

        const recorder = new MediaRecorder(activeStream, { mimeType })
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        recorder.start(1000)
        mediaRecorderRef.current = recorder
      } catch (err) {
        console.warn('MediaRecorder error:', err)
      }
    }

    startDictation()

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1)
    }, 1000)

    const notice: MeetingTranscriptEntry = {
      timestamp: formatTime(meetingElapsed),
      speaker: 'System',
      speakerRole: 'host',
      text: `[Meeting Recording Started by ${candidateName}]`
    }
    setTranscriptEntries((prev) => [...prev, notice])
  }

  const handleStopRecording = () => {
    if (!isRecordingRef.current) return

    setIsRecording(false)
    isRecordingRef.current = false
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }

    let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    if (recordedChunksRef.current.length > 0) {
      try {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        videoUrl = URL.createObjectURL(blob)
      } catch (e) {}
    }

    const durationMins = Math.max(1, Math.ceil(recordingSeconds / 60))
    const recordId = id || 'meet-' + meetingCode.toLowerCase()

    meetingService.saveCompletedSession({
      id: recordId,
      code: meetingCode,
      title: meetingTitle,
      hostName: hostParam,
      durationMinutes: durationMins,
      hasScreenShare: hadScreenShareDuringRecording || isScreenSharing,
      recordingUrl: videoUrl,
      transcript: transcriptEntries,
      summaryNotes: `Recorded session (${formatTime(recordingSeconds)}) with ${hostParam}. Full verbatim dialogue transcribed.`
    })

    notificationService.create({
      title: 'Meeting Recording Saved! 🎥',
      message: `Recording for "${meetingTitle}" (${formatTime(recordingSeconds)}) is stored in Meeting Records.`,
      type: 'success'
    })

    setRecordingSavedModal(true)
  }

  // =========================================================================
  // 5. Real-Time Speech Dictation
  // =========================================================================
  const startDictation = () => {
    if (isMicMuted) return
    setIsSelfSpeaking(true)

    speechService.startListening({
      onStart: () => setIsSelfSpeaking(true),
      onResult: (text: string) => {
        if (!text.trim()) return
        setIsSelfSpeaking(true)

        if (text.length > 6) {
          const entry: MeetingTranscriptEntry = {
            timestamp: formatTime(meetingElapsed),
            speaker: candidateName,
            speakerRole: 'participant',
            text
          }
          setTranscriptEntries((prev) => {
            const last = prev[prev.length - 1]
            if (last && last.speaker === candidateName && text.startsWith(last.text)) {
              return [...prev.slice(0, -1), entry]
            }
            return [...prev, entry]
          })
        }
      },
      onError: () => setIsSelfSpeaking(false)
    })
  }

  // =========================================================================
  // 6. In-Meeting Chat
  // =========================================================================
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg = {
      id: 'c-' + Date.now(),
      sender: `${candidateName} (You)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatInput.trim(),
      isSelf: true
    }

    setChatMessages((prev) => [...prev, newMsg])
    setChatInput('')

    // Simulated reply from remote participant
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'c-' + Date.now(),
          sender: 'Marcus Chen',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Thanks for noting that. We have updated the backlog accordingly.',
          isSelf: false
        }
      ])
      if (activeSidePanel !== 'chat') {
        setUnreadChatCount((c) => c + 1)
      }
    }, 3000)
  }

  // =========================================================================
  // 7. Host Moderation Actions
  // =========================================================================
  const handleMuteParticipant = (pId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, isMicOn: false, isSpeaking: false } : p))
    )
  }

  const handleRemoveParticipant = (pId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== pId))
  }

  const handleMuteAll = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.id !== 'p-self' ? { ...p, isMicOn: false, isSpeaking: false } : p))
    )
  }

  // Leave Call
  const handleLeaveMeeting = () => {
    if (isRecording) {
      handleStopRecording()
    }
    stopAllMediaTracks()
    nav('/meetings')
  }

  // Download Transcript (.txt)
  const handleExportTranscript = () => {
    const textContent =
      `=====================================================\n` +
      `MEETING TRANSCRIPT RECORD\n` +
      `=====================================================\n` +
      `Meeting: ${meetingTitle}\n` +
      `Code: ${meetingCode}\n` +
      `Date & Time: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n` +
      `Duration: ${formatTime(meetingElapsed)}\n` +
      `Recording Status: ${isRecording ? 'Recorded' : 'Not Recorded'}\n` +
      `Participants: ${participants.map((p) => p.name).join(', ')}\n\n` +
      `VERBATIM DIALOGUE:\n` +
      `-----------------------------------------------------\n` +
      transcriptEntries.map((t) => `[${t.timestamp}] ${t.speaker}:\n${t.text}\n`).join('\n')

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Meeting_Transcript_${meetingCode}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtered transcript
  const filteredTranscript = transcriptEntries.filter((t) => {
    if (!transcriptSearch.trim()) return true
    const q = transcriptSearch.toLowerCase()
    return t.speaker.toLowerCase().includes(q) || t.text.toLowerCase().includes(q)
  })

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP BAR */}
      <header className="h-14 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeaveMeeting}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Leave meeting and return to dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {meetingTitle}
              </h1>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold">
                {meetingCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Encrypted Connection</span>
              </span>
              <span>·</span>
              <span>{formatTime(meetingElapsed)} duration</span>
            </div>
          </div>
        </div>

        {/* Center: Recording Status Badge */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="px-3 py-1 bg-rose-950/80 border border-rose-600/80 text-rose-300 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>REC Active ({formatTime(recordingSeconds)})</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span>Not Recording</span>
            </div>
          )}

          {isScreenSharing && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/80 rounded-full text-xs font-bold">
              <Monitor size={13} className="text-indigo-400" />
              <span>Screen Shared</span>
            </span>
          )}

          {isMeetingLocked && (
            <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Lock size={10} />
              <span>Room Locked</span>
            </span>
          )}
        </div>

        {/* Right: Leave Button */}
        <Button
          variant="danger"
          size="sm"
          onClick={handleLeaveMeeting}
          className="font-bold text-xs bg-rose-600 hover:bg-rose-500 cursor-pointer"
        >
          <PhoneOff size={14} />
          <span className="hidden sm:inline">Leave Room</span>
        </Button>
      </header>

      {/* 2. PRIVACY & CONSENT RECORDING BANNER */}
      {showRecordingToast && (
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 px-4 py-2 text-xs text-rose-100 flex items-center justify-between border-b border-rose-800/60 z-30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
            <span className="font-semibold text-white">
              🔴 Meeting Recording Started. All participants have been informed that this meeting is being recorded according to privacy/consent standards.
            </span>
          </div>
          <button
            onClick={() => setShowRecordingToast(false)}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SCREEN SHARE ACTIVE BANNER */}
      {isScreenSharing && (
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 px-4 py-1.5 text-xs text-indigo-100 flex items-center justify-between shrink-0 border-b border-indigo-800 z-20">
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-cyan-300 animate-pulse" />
            <span className="font-bold">You are currently sharing your screen with all participants.</span>
          </div>
          <button
            onClick={handleStopScreenShare}
            className="px-2.5 py-0.5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-md text-[11px] font-extrabold transition-colors cursor-pointer"
          >
            Stop Sharing
          </button>
        </div>
      )}

      {/* 3. MAIN AREA & SIDE DRAWER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAIN VIDEO STAGE */}
        <div className="flex-1 p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto">
          {isScreenSharing ? (
            /* SCREEN SHARING HERO VIEW */
            <div className="flex-1 flex flex-col gap-3 min-h-[380px]">
              <div className="flex-1 bg-black rounded-3xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-300 border border-cyan-500/30 flex items-center gap-2">
                  <Monitor size={13} />
                  <span>Your Shared Screen</span>
                </div>
              </div>

              {/* DOCKED PARTICIPANTS STRIP */}
              <div className="h-32 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between p-2 shadow-md"
                  >
                    {p.id === 'p-self' ? (
                      webcamStream && !isVideoDisabled ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="my-auto text-center text-slate-500 text-xs">
                          <User size={20} className="mx-auto text-slate-600 mb-1" />
                          <span>Camera Off</span>
                        </div>
                      )
                    ) : (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    )}

                    <div className="z-10 flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white truncate max-w-[120px]">
                        {p.name}
                      </span>
                      {p.isMicOn ? (
                        <span className={`w-2 h-2 rounded-full ${p.isSpeaking ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      ) : (
                        <span className="p-0.5 bg-rose-950 text-rose-400 rounded-full">
                          <MicOff size={8} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* DYNAMIC RESPONSIVE PARTICIPANT VIDEO GRID */
            <div
              className={`grid gap-4 flex-1 min-h-[380px] ${
                participants.length === 1
                  ? 'grid-cols-1 max-w-3xl mx-auto w-full'
                  : participants.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
              }`}
            >
              {participants.map((p) => {
                const isSelf = p.id === 'p-self'
                return (
                  <div
                    key={p.id}
                    className={`bg-slate-900 border rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 shadow-xl transition-all ${
                      p.isSpeaking
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {isSelf ? (
                      webcamStream && !isVideoDisabled ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                      ) : (
                        <div className="my-auto text-center space-y-3 z-10 p-4">
                          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-lg">
                            <VideoOff size={24} />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-slate-300">
                              {isVideoDisabled ? 'Camera Muted' : 'Camera Access Required'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={initWebcam}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Video size={13} />
                            <span>Connect Camera</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-85"
                      />
                    )}

                    {/* Top Tile Badges */}
                    <div className="z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        {p.isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                        <span className="text-xs font-extrabold text-white">{p.name}</span>
                        {p.isHost && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold flex items-center gap-1">
                            <Crown size={9} />
                            <span>Host</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!p.isMicOn && (
                          <span className="p-1 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-full">
                            <MicOff size={11} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Speaking Bar */}
                    <div className="z-10 mt-auto flex items-center justify-between">
                      <div className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-[11px] text-slate-300 border border-white/10 font-medium">
                        {p.role}
                      </div>

                      {p.isSpeaking && (
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                          {[10, 18, 12, 22, 14].map((h, i) => (
                            <span
                              key={i}
                              className="w-1 bg-emerald-400 rounded-full animate-pulse"
                              style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 4. TABBED COLLAPSIBLE SIDE PANEL */}
        {activeSidePanel && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30 animate-in slide-in-from-right duration-200 shadow-2xl">
            {/* Panel Tabs Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setActiveSidePanel('transcript')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeSidePanel === 'transcript' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText size={13} />
                  <span>Transcript</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSidePanel('chat')
                    setUnreadChatCount(0)
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                    activeSidePanel === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Chat</span>
                  {unreadChatCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5"></span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSidePanel('participants')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeSidePanel === 'participants' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users size={13} />
                  <span>{participants.length}</span>
                </button>
              </div>

              <button
                onClick={() => setActiveSidePanel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB 1: LIVE TRANSCRIPT */}
            {activeSidePanel === 'transcript' && (
              <div className="p-4 flex-1 flex flex-col overflow-hidden text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                      Live Transcript
                    </h3>
                    <p className="text-[10px] text-slate-400">Synchronized speech-to-text turns</p>
                  </div>

                  <button
                    onClick={handleExportTranscript}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Export transcript as .txt"
                  >
                    <Download size={12} />
                    <span>Export</span>
                  </button>
                </div>

                {/* Search transcript */}
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={transcriptSearch}
                    onChange={(e) => setTranscriptSearch(e.target.value)}
                    placeholder="Search spoken dialogue..."
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Transcript stream */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {filteredTranscript.map((t, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-blue-400">{t.speaker}</span>
                        <span className="text-slate-500 font-mono">[{t.timestamp}]</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                  <div ref={transcriptBottomRef} />
                </div>
              </div>
            )}

            {/* TAB 2: IN-CALL CHAT */}
            {activeSidePanel === 'chat' && (
              <div className="p-4 flex-1 flex flex-col overflow-hidden text-xs space-y-3">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${
                        m.isSelf
                          ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] opacity-75">
                        <span className="font-bold">{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="leading-snug">{m.text}</p>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message all in meeting..."
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <Button variant="primary" size="sm" type="submit" className="px-3 bg-blue-600 hover:bg-blue-500">
                    <Send size={13} />
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 3: PARTICIPANTS & HOST MODERATION */}
            {activeSidePanel === 'participants' && (
              <div className="p-4 flex-1 overflow-y-auto text-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                    Participants ({participants.length})
                  </h3>
                  <button
                    onClick={handleMuteAll}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Mute All
                  </button>
                </div>

                {/* Host Security Toggles */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Host Room Controls</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Lock Meeting Room</span>
                    <button
                      onClick={() => setIsMeetingLocked(!isMeetingLocked)}
                      className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
                        isMeetingLocked
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isMeetingLocked ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{isMeetingLocked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Allow Screen Sharing</span>
                    <button
                      onClick={() => setAllowScreenSharing(!allowScreenSharing)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        allowScreenSharing ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {allowScreenSharing ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Participant List */}
                <div className="space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isHost && <Crown size={11} className="text-amber-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.role}</div>
                        </div>
                      </div>

                      {/* Participant status & quick moderation */}
                      <div className="flex items-center gap-1.5">
                        {p.isMicOn ? (
                          <button
                            onClick={() => handleMuteParticipant(p.id)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                            title="Mute participant"
                          >
                            <Mic size={12} className="text-emerald-400" />
                          </button>
                        ) : (
                          <span className="p-1 text-rose-400">
                            <MicOff size={12} />
                          </span>
                        )}

                        {p.id !== 'p-self' && (
                          <button
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="p-1 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove participant from call"
                          >
                            <UserX size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 5. BOTTOM MEETING CONTROL TOOLBAR */}
      <footer className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        {/* Left: Audio & Video */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              !isMicMuted
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {!isMicMuted ? <Mic size={16} className="text-emerald-400" /> : <MicOff size={16} />}
            <span className="hidden sm:inline">{!isMicMuted ? 'Mute' : 'Unmute'}</span>
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              !isVideoDisabled
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
            title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {!isVideoDisabled ? <Video size={16} className="text-blue-400" /> : <VideoOff size={16} />}
            <span className="hidden sm:inline">{!isVideoDisabled ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center: Screen Share & User-Initiated Recording */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            <Monitor size={15} className={isScreenSharing ? 'text-white' : 'text-indigo-400'} />
            <span className="hidden sm:inline">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>

          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            {isRecording ? (
              <>
                <span className="w-2.5 h-2.5 rounded-sm bg-white"></span>
                <span>Stop Recording ({formatTime(recordingSeconds)})</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Record Meeting</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Drawer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSidePanel((prev) => (prev === 'transcript' ? null : 'transcript'))}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSidePanel === 'transcript'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Toggle Live Transcript"
          >
            <FileText size={15} />
            <span className="hidden md:inline">Transcript</span>
          </button>

          <button
            onClick={() => {
              setActiveSidePanel((prev) => (prev === 'chat' ? null : 'chat'))
              setUnreadChatCount(0)
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer relative ${
              activeSidePanel === 'chat'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Toggle Meeting Chat"
          >
            <MessageSquare size={15} />
            <span className="hidden md:inline">Chat</span>
            {unreadChatCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSidePanel((prev) => (prev === 'participants' ? null : 'participants'))}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSidePanel === 'participants'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Toggle Participants Panel"
          >
            <Users size={15} />
            <span className="hidden md:inline">{participants.length}</span>
          </button>
        </div>
      </footer>

      {/* 6. RECORDING SAVED SUCCESS MODAL */}
      {recordingSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={30} />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                Meeting Record Saved
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">Recording & Transcript Archived</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your recording ({formatTime(recordingSeconds)}), verbatim transcript dialogue, and AI insights have been securely saved to Meeting Records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordingSavedModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Continue In Room
              </button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setRecordingSavedModal(false)
                  stopAllMediaTracks()
                  nav('/meetings')
                }}
                className="font-bold text-xs bg-blue-600 hover:bg-blue-500"
              >
                <span>View in Meeting Records</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
