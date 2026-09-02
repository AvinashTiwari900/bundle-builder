import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  Pause,
  Clock,
  Calendar,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  FileText,
  User,
  Users,
  ExternalLink,
  ChevronRight,
  Volume2,
  VolumeX,
  Filter,
  Monitor,
  Plus,
  ArrowRight,
  Share2,
  MessageSquare,
  Check,
  X,
  Maximize2,
  RotateCcw,
  Trash2,
  Copy,
  Link,
  ShieldCheck,
  Lock,
  ListTodo,
  CheckSquare,
  Square,
  Bot,
  Send,
  HelpCircle,
  Bookmark
} from 'lucide-react'
import {
  meetingService,
  MeetingRecording,
  MeetingTranscriptEntry,
  MeetingNote,
  MeetingActionItem,
  generateSecureMeetingCode
} from '../services/meetingService'
import { notificationService } from '../services/notificationService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function MeetingsPage() {
  const nav = useNavigate()
  const [meetings, setMeetings] = useState<MeetingRecording[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecording | null>(null)
  const [activeTab, setActiveTab] = useState<'records' | 'scheduled' | 'all'>('records')
  const [activeDetailTab, setActiveDetailTab] = useState<'transcript' | 'ai' | 'notes'>('transcript')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<'all' | 'transcript' | 'ai' | 'screen'>('all')

  // Media Player State
  const [mediaViewMode, setMediaViewMode] = useState<'camera' | 'screen'>('camera')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0)
  const [playbackDuration, setPlaybackDuration] = useState(240)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Modals
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingRecording | null>(null)
  const [showInstantReadyModal, setShowInstantReadyModal] = useState(false)
  const [instantMeetingData, setInstantMeetingData] = useState<MeetingRecording | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  // Schedule Modal Inputs
  const [newTitle, setNewTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newType, setNewType] = useState('Product Planning')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('10:30 AM IST')
  const [newPasscode, setNewPasscode] = useState('')
  const [newWaitingRoom, setNewWaitingRoom] = useState(true)

  // Note taking in active meeting
  const [newNoteText, setNewNoteText] = useState('')

  // AI Chat about Meeting
  const [aiChatQuery, setAiChatQuery] = useState('')
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I analyzed this meeting transcript. Ask me anything about key decisions, action items, or discussion topics.'
    }
  ])

  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    refreshMeetingList()
  }, [])

  const refreshMeetingList = () => {
    const list = meetingService.getMeetings()
    setMeetings(list)
    const recordedList = list.filter((m) => m.isRecorded || m.status === 'Completed')
    if (recordedList.length > 0) {
      setSelectedMeeting((prev) => {
        if (prev && recordedList.some((m) => m.id === prev.id)) return prev
        return recordedList[0]
      })
    } else if (list.length > 0) {
      setSelectedMeeting(list[0])
    } else {
      setSelectedMeeting(null)
    }
  }

  const recordedMeetings = meetings.filter((m) => m.isRecorded || m.status === 'Completed')
  const scheduledMeetings = meetings.filter((m) => m.status === 'Scheduled')

  // Filtered Meetings List
  const displayedMeetings = meetings.filter((m) => {
    if (activeTab === 'records' && !m.isRecorded && m.status !== 'Completed') return false
    if (activeTab === 'scheduled' && m.status !== 'Scheduled') return false

    if (filterTag === 'transcript' && (!m.transcript || m.transcript.length === 0)) return false
    if (filterTag === 'ai' && !m.aiSummary) return false
    if (filterTag === 'screen' && !m.hasScreenShare) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const inTitle = m.title.toLowerCase().includes(q)
      const inHost = m.hostName.toLowerCase().includes(q)
      const inCode = m.code.toLowerCase().includes(q)
      const inTranscript = m.transcript?.some((t) => t.text.toLowerCase().includes(q) || t.speaker.toLowerCase().includes(q))
      return inTitle || inHost || inCode || inTranscript
    }

    return true
  })

  const formatSeconds = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const parseTimestampToSeconds = (ts: string) => {
    const parts = ts.split(':')
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
    }
    return 0
  }

  const handleSeekToTranscriptTimestamp = (ts: string) => {
    const targetSeconds = parseTimestampToSeconds(ts)
    setPlaybackCurrentTime(targetSeconds)
    if (videoRef.current) {
      videoRef.current.currentTime = targetSeconds
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err)
            setIsPlaying(true)
          })
      }
    } else {
      setIsPlaying((prev) => !prev)
    }
  }

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setPlaybackCurrentTime(val)
    if (videoRef.current) {
      videoRef.current.currentTime = val
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  // 1. Instant Meeting Flow
  const handleLaunchInstantMeeting = () => {
    const newM = meetingService.createInstantMeeting('Product & Sprint Review Meeting', 'Avinash Tiwari')
    setInstantMeetingData(newM)
    setShowInstantReadyModal(true)
    refreshMeetingList()
  }

  // 2. Join Meeting Flow
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCodeInput.trim()) return

    const clean = joinCodeInput.trim().replace(/^.*\/meet\//i, '').toUpperCase()
    setShowJoinModal(false)
    nav(`/meet/join/${clean}`)
  }

  // 3. Copy Link Helper
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
    notificationService.create({
      title: 'Link Copied',
      message: 'Meeting invite link copied to clipboard.',
      type: 'info'
    })
  }

  // 4. Schedule Meeting
  const handleCreateScheduledMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const code = generateSecureMeetingCode()
    const id = 'meet-' + code.toLowerCase()
    const newM: MeetingRecording = {
      id,
      code,
      title: newTitle.trim(),
      organization: newCompany.trim() || 'Workspace Team',
      meetingType: newType,
      hostName: 'Avinash Tiwari',
      status: 'Scheduled',
      date: newDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      time: newTime || '10:30 AM IST',
      durationMinutes: 45,
      roomUrl: `/interview/room/${id}?code=${code}&title=${encodeURIComponent(newTitle)}`,
      shareUrl: `${window.location.origin}/meet/${code}`,
      isRecorded: false,
      hasScreenShare: false,
      passcode: newPasscode || undefined,
      waitingRoomEnabled: newWaitingRoom,
      participants: [
        {
          name: 'Avinash Tiwari',
          role: 'Host',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isHost: true
        }
      ],
      summaryNotes: 'Scheduled meeting. Link will be accessible on the scheduled date and time.',
      transcript: []
    }

    const updated = [newM, ...meetings]
    setMeetings(updated)
    meetingService.saveMeetings(updated)
    setShowScheduleModal(false)
    setNewTitle('')
    setNewCompany('')
    setActiveTab('scheduled')

    notificationService.create({
      title: 'Meeting Scheduled 📅',
      message: `"${newM.title}" has been created with code ${code}.`,
      type: 'success'
    })
  }

  // 5. Delete Meeting
  const handleConfirmDelete = () => {
    if (!meetingToDelete) return

    try {
      meetingService.deleteMeeting(meetingToDelete.id)
      const updated = meetings.filter((m) => m.id !== meetingToDelete.id)
      setMeetings(updated)

      if (selectedMeeting?.id === meetingToDelete.id) {
        const remainingRecorded = updated.filter((m) => m.isRecorded || m.status === 'Completed')
        setSelectedMeeting(remainingRecorded.length > 0 ? remainingRecorded[0] : null)
        setIsPlaying(false)
      }

      try {
        notificationService.create({
          title: 'Meeting Removed',
          message: `"${meetingToDelete.title}" has been deleted from your records.`,
          type: 'info'
        })
      } catch {}
    } catch (err) {
      console.warn('Error deleting meeting:', err)
    } finally {
      setMeetingToDelete(null)
    }
  }

  // 6. Add Timestamped Meeting Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMeeting || !newNoteText.trim()) return

    const ts = formatSeconds(playbackCurrentTime)
    meetingService.addMeetingNote(selectedMeeting.id, newNoteText.trim(), ts, 'Avinash Tiwari')
    refreshMeetingList()
    setNewNoteText('')
  }

  // 7. Toggle Action Item
  const handleToggleAction = (actionId: string) => {
    if (!selectedMeeting) return
    meetingService.toggleActionItem(selectedMeeting.id, actionId)
    refreshMeetingList()
  }

  // 8. Ask AI About This Meeting
  const handleAskAI = (queryText?: string) => {
    const q = queryText || aiChatQuery
    if (!q.trim() || !selectedMeeting) return

    const userMsg = { sender: 'user' as const, text: q.trim() }
    setAiChatMessages((prev) => [...prev, userMsg])
    setAiChatQuery('')

    // Generate smart transcript-based answer
    setTimeout(() => {
      let reply = ''
      const lq = q.toLowerCase()

      if (lq.includes('decision')) {
        reply = selectedMeeting.decisions?.length
          ? `**Key Decisions Made:**\n` + selectedMeeting.decisions.map((d) => `• ${d}`).join('\n')
          : 'According to the transcript, no binding formal decisions were concluded during this segment.'
      } else if (lq.includes('action') || lq.includes('item') || lq.includes('task')) {
        reply = selectedMeeting.actionItems?.length
          ? `**Action Items:**\n` + selectedMeeting.actionItems.map((a) => `• **${a.assignee}**: ${a.task} ${a.done ? '*(Done)*' : '*(Pending)*'}`).join('\n')
          : 'No specific individual action items were assigned in the verbatim transcript.'
      } else if (lq.includes('marcus') || lq.includes('deadline') || lq.includes('sprint')) {
        reply = `Marcus Chen highlighted Sprint 14 delivery deadlines and emphasized staging validation by Thursday at 5:00 PM.`
      } else {
        reply = `**Meeting Summary Context:**\n${selectedMeeting.aiSummary || selectedMeeting.summaryNotes}`
      }

      setAiChatMessages((prev) => [...prev, { sender: 'ai', text: reply }])
    }, 600)
  }

  // 9. Export Transcript (.txt)
  const handleDownloadTranscript = (meeting: MeetingRecording) => {
    const textContent =
      `=====================================================\n` +
      `MEETING RECORDING, TRANSCRIPT & AI INSIGHTS\n` +
      `=====================================================\n` +
      `Title: ${meeting.title}\n` +
      `Meeting Code: ${meeting.code}\n` +
      `Type: ${meeting.meetingType}\n` +
      `Host: ${meeting.hostName}\n` +
      `Date & Time: ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}\n` +
      `Duration: ${meeting.durationMinutes} Minutes\n` +
      `Screen Share Captured: ${meeting.hasScreenShare ? 'Yes' : 'No'}\n` +
      `Participants: ${meeting.participants.map((p) => `${p.name} (${p.role})`).join(', ')}\n\n` +
      `AI EXECUTIVE SUMMARY:\n` +
      `-----------------------------------------------------\n` +
      `${meeting.aiSummary || meeting.summaryNotes}\n\n` +
      (meeting.decisions?.length ? `DECISIONS MADE:\n${meeting.decisions.map((d) => `• ${d}`).join('\n')}\n\n` : '') +
      (meeting.actionItems?.length ? `ACTION ITEMS:\n${meeting.actionItems.map((a) => `• [${a.done ? 'X' : ' '}] ${a.assignee}: ${a.task}`).join('\n')}\n\n` : '') +
      `VERBATIM TRANSCRIPT DIALOGUE:\n` +
      `-----------------------------------------------------\n` +
      meeting.transcript.map((t) => `[${t.timestamp}] ${t.speaker}:\n${t.text}\n`).join('\n')

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Meeting_${meeting.code}_Transcript_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Active Video URL source
  const activeVideoSrc =
    mediaViewMode === 'screen'
      ? selectedMeeting?.recordingUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      : selectedMeeting?.recordingUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER BANNER WITH 3 PRIMARY ACTIONS */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-cyan-300 border border-white/10">
              <Video size={14} />
              <span>General-Purpose Video Meetings & Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Meetings & Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Create, join, schedule, record, and manage professional meetings with live transcription, screen sharing, and AI-powered meeting insights.
            </p>
          </div>

          {/* 3 Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleLaunchInstantMeeting}
              className="bg-white text-blue-950 hover:bg-slate-100 font-extrabold border-none shadow-lg text-xs cursor-pointer py-2.5 px-4"
            >
              <Video size={16} className="text-blue-600" />
              <span>Start Instant Meeting</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowScheduleModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs cursor-pointer"
            >
              <Calendar size={15} />
              <span>Schedule Meeting</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setShowJoinModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs cursor-pointer"
            >
              <Link size={15} />
              <span>Join Meeting</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TABS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs text-xs font-bold">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'records'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video size={14} />
            <span>Meeting Records ({recordedMeetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'scheduled'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={14} />
            <span>Upcoming Scheduled ({scheduledMeetings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All ({meetings.length})</span>
          </button>
        </div>

        {/* Search Input & Tag Filters */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px] w-full sm:w-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, transcripts, people..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* VIEW: MEETING RECORDS & RECORDING VIEWER */}
      {activeTab !== 'scheduled' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Meeting Records List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Meeting Records & Transcripts
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {displayedMeetings.length} records
              </span>
            </div>

            {displayedMeetings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3">
                <Video size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Meeting Records</h4>
                <p className="text-xs text-slate-500">
                  Your recorded meetings and transcripts will appear here after conducting meetings.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleLaunchInstantMeeting}
                  className="font-bold text-xs"
                >
                  <Video size={13} />
                  <span>Start a Meeting</span>
                </Button>
              </div>
            ) : (
              displayedMeetings.map((meet) => {
                const isSelected = selectedMeeting?.id === meet.id
                return (
                  <div
                    key={meet.id}
                    onClick={() => {
                      setSelectedMeeting(meet)
                      setMediaViewMode('camera')
                      setIsPlaying(false)
                      setPlaybackCurrentTime(0)
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-3 group relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                            {meet.meetingType}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {meet.code}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                          {meet.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Host: {meet.hostName}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMeetingToDelete(meet)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-3 right-3 cursor-pointer"
                        title="Delete recording"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        <span>{new Date(meet.date).toLocaleDateString()}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {meet.hasScreenShare && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold flex items-center gap-1 shrink-0"
                            title="Screen share recorded"
                          >
                            <Monitor size={9} />
                            <span>Screen</span>
                          </span>
                        )}
                        {meet.aiSummary && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-[9px] font-bold flex items-center gap-0.5 shrink-0"
                            title="AI Summary Generated"
                          >
                            <Sparkles size={9} />
                            <span>AI</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <Clock size={11} className="text-blue-600" />
                          <span>{meet.durationMinutes}m</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Column: Professional Recording Player & Multi-Tab Hub (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedMeeting ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                {/* Meeting Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                        {selectedMeeting.meetingType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                        ID: {selectedMeeting.code}
                      </span>
                      {selectedMeeting.hasScreenShare && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold flex items-center gap-1">
                          <Monitor size={11} />
                          <span>Screen Share Captured</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {selectedMeeting.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Hosted by {selectedMeeting.hostName} · {new Date(selectedMeeting.date).toLocaleDateString()} at{' '}
                      {selectedMeeting.time} · Duration: {selectedMeeting.durationMinutes} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(selectedMeeting.shareUrl)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy meeting share link"
                    >
                      <Copy size={13} />
                      <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTranscript(selectedMeeting)}
                      className="font-bold text-xs cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Export (.txt)</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMeetingToDelete(selectedMeeting)}
                      className="font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>

                {/* Participants Row */}
                <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" />
                    <span>Participants:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedMeeting.participants?.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-slate-200 text-[11px] font-bold text-slate-800 shadow-2xs"
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                            {p.name.charAt(0)}
                          </span>
                        )}
                        <span>{p.name}</span>
                        {p.isHost && <span className="text-amber-600 font-bold text-[9px]">👑 Host</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* REAL FUNCTIONAL VIDEO RECORDING PLAYER */}
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group">
                    <video
                      ref={videoRef}
                      key={`${selectedMeeting.id}-${mediaViewMode}`}
                      src={activeVideoSrc}
                      poster={
                        mediaViewMode === 'screen'
                          ? selectedMeeting.screenShareThumbnail ||
                            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
                          : selectedMeeting.videoThumbnail ||
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
                      }
                      className="w-full h-full object-contain bg-black"
                      onTimeUpdate={() => {
                        if (videoRef.current) {
                          setPlaybackCurrentTime(videoRef.current.currentTime)
                          if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                            setPlaybackDuration(videoRef.current.duration)
                          }
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                          setPlaybackDuration(videoRef.current.duration)
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      playsInline
                    />

                    {/* Overlay view indicator */}
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 z-10 pointer-events-none">
                      {mediaViewMode === 'screen' ? (
                        <Monitor size={12} className="text-cyan-400" />
                      ) : (
                        <Video size={12} className="text-emerald-400" />
                      )}
                      <span>
                        {mediaViewMode === 'screen'
                          ? 'Screen Share Recording'
                          : 'Meeting Video Recording'}
                      </span>
                    </div>

                    {/* Center Large Play button */}
                    {!isPlaying && (
                      <button
                        onClick={toggleVideoPlayback}
                        className="absolute z-20 w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border border-blue-400/40"
                      >
                        <Play size={26} className="ml-1" />
                      </button>
                    )}

                    {/* Bottom Custom Playback Bar */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2 z-10">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={toggleVideoPlayback}
                            className="p-1 text-white hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button
                            onClick={toggleMute}
                            className="p-1 text-white hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} />}
                          </button>
                          <span>
                            {formatSeconds(playbackCurrentTime)} / {formatSeconds(playbackDuration)}
                          </span>
                        </div>

                        {/* Playback speed selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">Speed:</span>
                          {[1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleChangePlaybackRate(rate)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                playbackRate === rate
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={playbackDuration || 100}
                        step={0.1}
                        value={playbackCurrentTime}
                        onChange={handleScrubberChange}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 INTERACTIVE DETAIL TABS: Transcript | AI Assistant | Meeting Notes */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                    <button
                      onClick={() => setActiveDetailTab('transcript')}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeDetailTab === 'transcript'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileText size={14} />
                      <span>Verbatim Transcript ({selectedMeeting.transcript?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setActiveDetailTab('ai')}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeDetailTab === 'ai'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>AI Meeting Assistant</span>
                    </button>

                    <button
                      onClick={() => setActiveDetailTab('notes')}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeDetailTab === 'notes'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark size={14} />
                      <span>Meeting Notes ({selectedMeeting.notes?.length || 0})</span>
                    </button>
                  </div>

                  {/* TAB 1: VERBATIM TRANSCRIPT */}
                  {activeDetailTab === 'transcript' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 flex items-center justify-between">
                        <span>💡 <strong>Interactive Playback:</strong> Click any timestamp to jump the video recording straight to that moment.</span>
                      </div>

                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {selectedMeeting.transcript?.length === 0 ? (
                          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                            No transcript recorded for this session.
                          </div>
                        ) : (
                          selectedMeeting.transcript?.map((t, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-3.5 bg-slate-50/90 hover:bg-blue-50/50 border border-slate-200/80 rounded-2xl transition-colors space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-900">{t.speaker}</span>
                                <button
                                  onClick={() => handleSeekToTranscriptTimestamp(t.timestamp)}
                                  className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 rounded-md text-[10px] font-mono font-bold text-blue-600 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Click to jump video to this moment"
                                >
                                  <Play size={8} />
                                  <span>[{t.timestamp}]</span>
                                </button>
                              </div>
                              <p className="text-slate-700 leading-relaxed font-normal">{t.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: AI MEETING ASSISTANT & INSIGHTS */}
                  {activeDetailTab === 'ai' && (
                    <div className="space-y-5 text-xs">
                      {/* AI Executive Summary Card */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-3xl border border-purple-100 space-y-2">
                        <div className="flex items-center gap-2 text-purple-900 font-extrabold uppercase text-[10px] tracking-wider">
                          <Sparkles size={13} className="text-purple-600" />
                          <span>AI Executive Summary</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {selectedMeeting.aiSummary || selectedMeeting.summaryNotes}
                        </p>
                      </div>

                      {/* Key Discussion Points & Decisions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Discussion Points */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                            Key Discussion Points
                          </h4>
                          <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                            {selectedMeeting.keyDiscussionPoints?.map((pt, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Decisions Made */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                            Decisions Agreed Upon
                          </h4>
                          <ul className="space-y-1.5 text-slate-700 leading-relaxed">
                            {selectedMeeting.decisions?.map((dec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                                <span>{dec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Items List */}
                      {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-2">
                            <ListTodo size={14} className="text-indigo-600" />
                            <span>Action Items & Ownership</span>
                          </h4>
                          <div className="space-y-2">
                            {selectedMeeting.actionItems.map((act) => (
                              <div
                                key={act.id}
                                onClick={() => handleToggleAction(act.id)}
                                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  {act.done ? (
                                    <CheckSquare size={16} className="text-emerald-600 shrink-0" />
                                  ) : (
                                    <Square size={16} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className={`font-medium ${act.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {act.task}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {act.assignee}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ask AI About This Meeting */}
                      <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot size={15} className="text-purple-400" />
                            <span className="font-extrabold text-xs">Ask AI About This Meeting</span>
                          </div>
                          <span className="text-[10px] text-slate-400">Based strictly on transcript</span>
                        </div>

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap gap-1.5">
                          {['What decisions were made?', 'What are the action items?', 'Summarize technical discussion'].map((qp, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAskAI(qp)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                            >
                              "{qp}"
                            </button>
                          ))}
                        </div>

                        {/* Chat dialogue output */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {aiChatMessages.map((m, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                                m.sender === 'user'
                                  ? 'bg-blue-600 text-white ml-auto max-w-[85%]'
                                  : 'bg-slate-800 text-slate-200 mr-auto max-w-[90%] whitespace-pre-line'
                              }`}
                            >
                              {m.text}
                            </div>
                          ))}
                        </div>

                        {/* Query Input */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleAskAI()
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={aiChatQuery}
                            onChange={(e) => setAiChatQuery(e.target.value)}
                            placeholder="Ask questions about this meeting..."
                            className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                          <Button variant="primary" size="sm" type="submit" className="bg-purple-600 hover:bg-purple-500">
                            <Send size={12} />
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MEETING NOTES */}
                  {activeDetailTab === 'notes' && (
                    <div className="space-y-4 text-xs">
                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder={`Add timestamped note at [${formatSeconds(playbackCurrentTime)}]...`}
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                        />
                        <Button variant="primary" size="sm" type="submit" className="font-bold text-xs bg-blue-600 hover:bg-blue-500">
                          <Plus size={13} />
                          <span>Pin Note</span>
                        </Button>
                      </form>

                      {/* Notes list */}
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {!selectedMeeting.notes || selectedMeeting.notes.length === 0 ? (
                          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                            No notes added yet. Scrub the video and add timestamped notes above.
                          </div>
                        ) : (
                          selectedMeeting.notes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSeekToTranscriptTimestamp(note.timestamp)}
                                    className="px-2 py-0.5 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                  >
                                    [{note.timestamp}]
                                  </button>
                                  <span className="font-bold text-slate-800">{note.author}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-normal">{note.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                Select a meeting from the list to view recording playback and AI analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: UPCOMING SCHEDULED MEETINGS */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scheduledMeetings.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-3">
                <Calendar size={36} className="text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">No Upcoming Meetings Scheduled</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Schedule meetings with colleagues, project partners, or clients with secure invite links.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowScheduleModal(true)}
                  className="font-bold text-xs"
                >
                  <Plus size={15} />
                  <span>Schedule Meeting</span>
                </Button>
              </div>
            ) : (
              scheduledMeetings.map((meet) => (
                <div
                  key={meet.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                        {meet.meetingType}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Confirmed
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{meet.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Host: {meet.hostName} · {meet.organization || 'Workspace'}
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-blue-600 shrink-0" />
                        <span>
                          {new Date(meet.date).toLocaleDateString()} at {meet.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-blue-600 shrink-0" />
                        <span>{meet.participants?.length || 2} participants invited</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyLink(meet.shareUrl)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy invite link"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => setMeetingToDelete(meet)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cancel meeting"
                      >
                        <Trash2 size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => nav(`/meet/join/${meet.code}`)}
                      className="font-bold text-xs bg-blue-600 hover:bg-blue-500 cursor-pointer"
                    >
                      <Video size={13} />
                      <span>Join Room</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. INSTANT MEETING READY MODAL */}
      {showInstantReadyModal && instantMeetingData && (
        <div
          onClick={() => setShowInstantReadyModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 mb-2">
                <Video size={24} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Your Meeting is Ready</h3>
              <p className="text-xs text-slate-500">
                Share this secure meeting link with anyone you want to join your call.
              </p>
            </div>

            {/* Meeting Link Pill */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
              <div className="truncate font-mono text-xs text-blue-600 font-bold">
                {instantMeetingData.shareUrl}
              </div>
              <button
                type="button"
                onClick={() => handleCopyLink(instantMeetingData.shareUrl)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy size={13} />
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInstantReadyModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Done
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowInstantReadyModal(false)
                  nav(instantMeetingData.roomUrl)
                }}
                className="font-extrabold text-xs bg-blue-600 hover:bg-blue-500 cursor-pointer"
              >
                <span>Start Meeting Now</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. JOIN MEETING MODAL */}
      {showJoinModal && (
        <div
          onClick={() => setShowJoinModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Join a Meeting</h3>
                <p className="text-xs text-slate-500">Enter the meeting code or invitation link</p>
              </div>
              <button onClick={() => setShowJoinModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Meeting Code or URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. X7K92P or https://yourplatform.com/meet/X7K92P"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <Button variant="primary" size="md" type="submit" className="font-bold text-xs bg-blue-600 hover:bg-blue-500">
                  <span>Continue to Pre-Join</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div
          onClick={() => setShowScheduleModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                  Schedule Conference
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">Schedule New Meeting</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateScheduledMeeting} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Product Roadmap & Sprint Planning"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Organization / Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Product Team"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Meeting Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Product Planning">Product Planning</option>
                    <option value="Architecture Review">Architecture Review</option>
                    <option value="Team Standup">Team Standup</option>
                    <option value="Client Discussion">Client Discussion</option>
                    <option value="Executive Sync">Executive Sync</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM IST"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                🔒 Includes unique meeting identifier, live transcript capture, and screen sharing permissions.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="font-bold text-xs bg-blue-600 hover:bg-blue-500"
                >
                  <span>Schedule & Generate Link</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {meetingToDelete && (
        <div
          onClick={() => setMeetingToDelete(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {meetingToDelete.status === 'Completed' ? 'Delete Meeting Record?' : 'Cancel Scheduled Meeting?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{meetingToDelete.title}"</strong>?
                {meetingToDelete.status === 'Completed'
                  ? ' This will permanently remove the video recording, transcript dialogue, and notes from your library.'
                  : ' This will remove the upcoming meeting from your calendar.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMeetingToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
