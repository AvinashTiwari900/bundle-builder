import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  Pause,
  Clock,
  Calendar,
  Sparkles,
  Award,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  FileText,
  User,
  Users,
  Bot,
  ExternalLink,
  ChevronRight,
  Volume2,
  Filter,
  Eye,
  RotateCcw
} from 'lucide-react'
import { meetingService, MeetingRecording, MeetingTranscriptEntry } from '../services/meetingService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function MeetingsPage() {
  const nav = useNavigate()
  const [meetings, setMeetings] = useState<MeetingRecording[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecording | null>(null)
  const [transcriptSearch, setTranscriptSearch] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [tabFilter, setTabFilter] = useState<'all' | 'scheduled' | 'completed'>('all')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const list = meetingService.getMeetings()
    setMeetings(list)
    if (list.length > 0 && !selectedMeeting) {
      setSelectedMeeting(list[0])
    }
  }, [])

  const filteredMeetings = meetings.filter((m) => {
    if (tabFilter === 'scheduled') return m.status === 'Scheduled'
    if (tabFilter === 'completed') return m.status === 'Completed'
    return true
  })

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    }
  }

  const handleDownloadTranscript = (meeting: MeetingRecording) => {
    const textContent = `RAS INTERVIEW MEETING RECORDING & TRANSCRIPT
=====================================================
Title: ${meeting.title}
Company: ${meeting.company}
Role: ${meeting.jobTitle}
Date & Time: ${meeting.date} at ${meeting.time}
Overall Score: ${meeting.score || 90}/100
Recommendation: ${meeting.recommendation || 'Evaluated'}
Proctoring Status: ${meeting.proctoringStatus}

SUMMARY NOTES:
${meeting.summaryNotes}

VERBATIM TRANSCRIPT:
-----------------------------------------------------
${meeting.transcript.map((t) => `[${t.timestamp}] ${t.speaker}:\n${t.text}\n`).join('\n')}
`
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meeting.company}_Interview_Transcript_${meeting.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300">
              <Video size={14} />
              <span>In-Platform Meeting & Recording Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interviews & Meeting Recordings
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Attend scheduled interviews directly through the RAS platform without third-party tools. All interview talks are securely recorded, live-transcribed, and viewable at any time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => nav('/interview/room/int-1')}
              className="bg-white text-blue-900 hover:bg-slate-100 font-bold border-none shadow-lg"
            >
              <Video size={16} />
              <span>Launch Live Room</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              tabFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setTabFilter('scheduled')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              tabFilter === 'scheduled'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📅 Upcoming Scheduled ({meetings.filter((m) => m.status === 'Scheduled').length})
          </button>
          <button
            onClick={() => setTabFilter('completed')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              tabFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎥 Recorded Talks & Transcripts ({meetings.filter((m) => m.status === 'Completed').length})
          </button>
        </div>
      </div>

      {/* Main Grid: Left List (4 Cols) / Right Player & Transcript Details (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Meetings List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            Interview Meeting Sessions
          </h3>

          <div className="space-y-3">
            {filteredMeetings.map((meet) => {
              const isSelected = selectedMeeting?.id === meet.id
              const isCompleted = meet.status === 'Completed'

              return (
                <div
                  key={meet.id}
                  onClick={() => setSelectedMeeting(meet)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-100 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {meet.status === 'Completed' ? '🎥 Recorded Talk' : '📅 Scheduled'}
                    </span>

                    {meet.score && (
                      <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        {meet.score}/100 Score
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{meet.title}</h4>
                    <p className="text-[11px] text-blue-600 font-bold">{meet.company} · {meet.interviewType}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{meet.durationMinutes} mins</span>
                    </span>
                    <span>{new Date(meet.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Active Meeting Detail, Video Player, and Searchable Transcript */}
        <div className="lg:col-span-8 space-y-5">
          {selectedMeeting ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Top Details & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-extrabold uppercase">
                      {selectedMeeting.company} · {selectedMeeting.interviewType}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{selectedMeeting.time}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedMeeting.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMeeting.status === 'Scheduled' ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => nav(selectedMeeting.roomUrl)}
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    >
                      <Video size={15} />
                      <span>Join Live Meeting (RAS)</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTranscript(selectedMeeting)}
                      className="font-bold text-xs text-slate-700"
                    >
                      <Download size={14} />
                      <span>Export Transcript</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Video Recording Player (If Completed) or Scheduled Join Card */}
              {selectedMeeting.status === 'Completed' ? (
                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-xl group">
                    <video
                      ref={videoRef}
                      src={selectedMeeting.recordingUrl}
                      poster={selectedMeeting.videoThumbnail}
                      onTimeUpdate={() => {
                        if (videoRef.current) setPlaybackTime(videoRef.current.currentTime)
                      }}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Play/Pause Trigger */}
                    <button
                      onClick={togglePlay}
                      className="absolute w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>

                    {/* Recording Watermark Pill */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold flex items-center gap-1.5 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Archived Cloud Recording (Viewable)</span>
                      </span>
                    </div>
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1"
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                        <span>{isPlaying ? 'Pause' : 'Play Video Replay'}</span>
                      </button>
                      <span className="font-mono">
                        {Math.floor(playbackTime / 60)}:{(Math.floor(playbackTime) % 60).toString().padStart(2, '0')} / {selectedMeeting.durationMinutes}:00
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {selectedMeeting.proctoringStatus}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-amber-50 to-blue-50 rounded-2xl border border-amber-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Upcoming Live Interview Session</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Scheduled for {new Date(selectedMeeting.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedMeeting.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedMeeting.summaryNotes}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => nav(selectedMeeting.roomUrl)}
                    className="font-bold text-xs"
                  >
                    <Video size={15} />
                    <span>Enter Live Interview Meeting Room</span>
                  </Button>
                </div>
              )}

              {/* Panelists & Evaluation Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Panelists */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" />
                    <span>Interview Panelists</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedMeeting.panelists.map((p, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs">
                        <img
                          src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                          alt={p.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score & Key Competencies */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      <span>Competency Evaluation</span>
                    </h4>
                    {selectedMeeting.score && (
                      <span className="text-xs font-extrabold text-emerald-700">{selectedMeeting.score}% Overall</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {selectedMeeting.keyCompetencies.map((comp, i) => (
                      <div key={i} className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>{comp.skill}</span>
                          <span className="font-bold text-blue-600">{comp.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${comp.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Searchable Verbatim Transcript */}
              {selectedMeeting.transcript && selectedMeeting.transcript.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      <span>Full Meeting Transcript ({selectedMeeting.transcript.length} dialogue turns)</span>
                    </h4>

                    {/* Transcript search */}
                    <div className="relative">
                      <Search size={13} className="text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={transcriptSearch}
                        onChange={(e) => setTranscriptSearch(e.target.value)}
                        placeholder="Search spoken dialogue..."
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-56"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                    {selectedMeeting.transcript
                      .filter((t) =>
                        transcriptSearch.trim()
                          ? t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
                            t.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
                          : true
                      )
                      .map((t, idx) => {
                        const isCandidate = t.speakerRole === 'candidate'
                        const isAI = t.speakerRole === 'ai'

                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                              isCandidate
                                ? 'bg-blue-50/50 border-blue-200/80 ml-4'
                                : isAI
                                ? 'bg-purple-50/50 border-purple-200/80 mr-4'
                                : 'bg-slate-50 border-slate-200 mr-4'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span
                                className={`flex items-center gap-1.5 ${
                                  isCandidate
                                    ? 'text-blue-700'
                                    : isAI
                                    ? 'text-purple-700'
                                    : 'text-slate-800'
                                }`}
                              >
                                {isAI ? <Bot size={13} /> : <User size={13} />}
                                <span>{t.speaker}</span>
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                                {t.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-medium pl-5">{t.text}</p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              <Video size={36} className="mx-auto text-slate-300 mb-2" />
              <p>Select a meeting from the left to view recording and transcript details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
