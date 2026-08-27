import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Award,
  ArrowRight,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio
} from 'lucide-react'
import Button from '../components/ui/Button'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'
import { speechService } from '../services/speechService'

interface VoiceQA {
  q: string
  a: string
}

export default function VoiceScreening() {
  const nav = useNavigate()
  const [callStatus, setCallStatus] = useState<'incoming' | 'connected' | 'completed'>('incoming')
  const [currentStep, setCurrentStep] = useState(0)
  const [userSpeech, setUserSpeech] = useState('')
  const [transcript, setTranscript] = useState<VoiceQA[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  const profile = profileService.get()
  const candidateName = profile?.name || 'Avinash Tiwari'

  const hrQuestions = [
    {
      q: `Hello ${candidateName.split(' ')[0]}! This is Sarah from the RAS AI Recruitment Team at Northstar Analytics. I'd like to ask a few quick questions regarding your recent Senior Business Analyst application. Could you start with a brief overview of your current role?`,
      sampleAnswer:
        'Sure Sarah! Currently I work as a Lead Business Analyst where I lead our revenue analytics team, build automated SQL data pipelines, and design executive BI dashboards.'
    },
    {
      q: 'Great! What is your current notice period, and when would you be available to join if selected?',
      sampleAnswer: 'My official notice period is 30 days, but I have buy-out flexibility and can join in 15 days.'
    },
    {
      q: 'Understood. Could you share your current compensation and your expected salary bracket for this position?',
      sampleAnswer:
        'My current CTC is ₹20 LPA, and based on market benchmarks and the responsibilities of this role, my expectation is ₹24 to 28 LPA.'
    },
    {
      q: 'What is your primary motivation for exploring new career opportunities at this time?',
      sampleAnswer:
        'I am looking to take on deeper end-to-end data strategy ownership and work closely with high-scale predictive analytics products.'
    },
    {
      q: 'Are you comfortable working in a hybrid model out of Hyderabad or Bengaluru?',
      sampleAnswer: 'Yes, absolutely. Both Hyderabad and Bengaluru are my top preferred locations.'
    }
  ]

  // Speak question function
  const speakQuestion = (stepIndex: number) => {
    const q = hrQuestions[stepIndex]?.q
    if (!q || isAudioMuted) return

    speechService.speak(q, {
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false)
    })
  }

  // Toggle voice mute
  const toggleMute = () => {
    const nextMute = !isAudioMuted
    setIsAudioMuted(nextMute)
    speechService.setMuted(nextMute)
    if (nextMute) {
      speechService.stop()
      setIsAiSpeaking(false)
    } else {
      speakQuestion(currentStep)
    }
  }

  // Dictation handler (Speech to Text)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechService.stopListening()
      setIsListening(false)
    } else {
      const started = speechService.startListening({
        onStart: () => setIsListening(true),
        onResult: (text) => {
          setUserSpeech((prev) => (prev ? prev + ' ' + text : text))
        },
        onEnd: () => setIsListening(false),
        onError: (err) => {
          console.warn('Speech recognition error:', err)
          setIsListening(false)
        }
      })
      if (!started) {
        setIsListening(false)
      }
    }
  }

  // Call duration counter
  useEffect(() => {
    let interval: any
    if (callStatus === 'connected') {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      speechService.stop()
      speechService.stopListening()
    }
  }, [])

  const acceptCall = () => {
    setCallStatus('connected')
    // Read the first question aloud when connected
    speakQuestion(0)
  }

  const endCall = () => {
    speechService.stop()
    speechService.stopListening()
    setIsListening(false)
    setCallStatus('completed')

    // Read closing message
    speechService.speak(
      `Thank you ${candidateName.split(' ')[0]}! Your responses have been successfully recorded and submitted to the RAS recruitment team.`,
      {
        onStart: () => setIsAiSpeaking(true),
        onEnd: () => setIsAiSpeaking(false)
      }
    )

    // Attach screening record
    const p = profileService.get() || {}
    p.hrScreening = {
      completedAt: new Date().toISOString(),
      score: 95,
      communicationRating: 'Fluent & Articulate',
      status: 'Recommended for Round 1 Technical'
    }
    profileService.save(p)

    notificationService.create({
      title: 'HR Screening Cleared! 🎉',
      message: 'AI Voice Screening completed. You have been recommended for Technical Round 1.',
      type: 'success'
    })
  }

  const handleSendVoiceResponse = () => {
    if (!userSpeech.trim()) return

    speechService.stop()
    if (isListening) {
      speechService.stopListening()
      setIsListening(false)
    }

    const activeQ = hrQuestions[currentStep]
    const updated = [...transcript, { q: activeQ.q, a: userSpeech.trim() }]
    setTranscript(updated)
    setUserSpeech('')

    if (currentStep + 1 < hrQuestions.length) {
      setCurrentStep(currentStep + 1)
      speakQuestion(currentStep + 1)
    } else {
      endCall()
    }
  }

  const fillSampleSpeech = () => {
    setUserSpeech(hrQuestions[currentStep].sampleAnswer)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          AI Voice Recruitment Screening
        </h1>
        <p className="text-xs text-slate-500">
          Automated preliminary HR phone screening with live AI voice question reading
        </p>
      </div>

      {/* Main Voice Call Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6 border border-white/10">
        {/* Incoming Call Screen */}
        {callStatus === 'incoming' && (
          <div className="space-y-6 py-6 animate-in fade-in duration-200">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40 relative">
              <span className="w-full h-full rounded-full bg-blue-500/30 absolute animate-ping"></span>
              <Bot size={40} className="relative z-10" />
            </div>

            <div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                Incoming AI HR Call
              </span>
              <h2 className="text-xl font-extrabold mt-2">Sarah · RAS AI Talent Partner</h2>
              <p className="text-xs text-slate-400 mt-1">Northstar Analytics · Senior Business Analyst</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 pt-4">
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 cursor-pointer"
                title="Accept Call & Start AI Voice"
              >
                <Phone size={26} />
              </button>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Volume2 size={14} className="animate-pulse" />
                <span>Click to Accept & Listen to Questions</span>
              </span>
            </div>
          </div>
        )}

        {/* Connected Live Voice Call Screen */}
        {callStatus === 'connected' && (
          <div className="space-y-6 py-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Call in Progress</span>
                {isAiSpeaking && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-400/30 animate-pulse">
                    Sarah is Speaking...
                  </span>
                )}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isAudioMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                  }`}
                  title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                >
                  {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                <span className="font-mono font-bold text-white">
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* AI Avatar & Audio Visualizer Waveform */}
            <div className="space-y-3">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 transition-transform duration-300 ${
                  isAiSpeaking ? 'scale-110 ring-4 ring-blue-400/40' : ''
                }`}
              >
                <Bot size={34} />
              </div>
              <div>
                <h3 className="font-bold text-base">Sarah (AI Talent Partner)</h3>
                <p className="text-[11px] text-slate-400">Voice Synthesis Engine: Active</p>
              </div>

              {/* Dynamic Audio Waveform */}
              <div className="flex items-center justify-center gap-1.5 h-10">
                {[14, 28, 42, 20, 36, 48, 26, 44, 22, 38, 18, 30, 46, 24, 16].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isAiSpeaking
                        ? 'bg-gradient-to-t from-blue-500 to-emerald-400 animate-pulse'
                        : 'bg-slate-700 opacity-40'
                    }`}
                    style={{
                      height: isAiSpeaking ? `${Math.max(10, (h * (i % 2 === 0 ? 1 : 0.8)))}px` : '6px'
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* AI Spoken Dialogue Subtitle & Replay Control */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left text-xs leading-relaxed font-medium space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Volume2 size={13} className={isAiSpeaking ? 'animate-bounce text-emerald-400' : ''} />
                  <span>
                    AI Question {currentStep + 1} of {hrQuestions.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => speakQuestion(currentStep)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  title="Read question again"
                >
                  <RotateCcw size={12} />
                  <span>{isAiSpeaking ? 'Re-reading...' : 'Replay Question'}</span>
                </button>
              </div>

              <p className="text-white text-xs sm:text-sm font-semibold">
                "{hrQuestions[currentStep].q}"
              </p>
            </div>

            {/* Candidate Voice Response Input */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span>Your Spoken / Typed Response:</span>
                  {isListening && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-extrabold flex items-center gap-1 animate-pulse border border-rose-500/40">
                      <Radio size={10} />
                      <span>Recording Voice...</span>
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-blue-600/80 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                    <span>{isListening ? 'Stop Mic' : '🎙️ Speak with Mic'}</span>
                  </button>

                  <button
                    onClick={fillSampleSpeech}
                    className="text-amber-300 hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Auto-Fill Sample</span>
                  </button>
                </div>
              </div>

              <textarea
                value={userSpeech}
                onChange={(e) => setUserSpeech(e.target.value)}
                placeholder="Speak directly into your microphone or type your response here..."
                className="w-full p-3.5 bg-black/40 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 h-24 leading-relaxed font-normal"
              />
            </div>

            {/* Call Action Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={endCall}
                className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneOff size={15} />
                <span>End Call</span>
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={handleSendVoiceResponse}
                disabled={!userSpeech.trim()}
                className="font-bold text-xs bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
              >
                <span>{currentStep + 1 === hrQuestions.length ? 'Submit Final Answer' : 'Submit & Next Question'}</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Completed Call Summary Screen */}
        {callStatus === 'completed' && (
          <div className="space-y-6 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Award size={32} />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                HR Screening Completed
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2">
                Preliminary Screening Cleared!
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your screening transcript and eligibility summary have been submitted to the recruitment team.
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Communication Rating:</span>
                <span className="font-bold text-emerald-400">Excellent (95%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Notice Period Verified:</span>
                <span className="font-bold text-white">30 Days (Flexible)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compensation Fit:</span>
                <span className="font-bold text-white">Within Hiring Bracket</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Step:</span>
                <span className="font-bold text-amber-300">Technical Round Scheduling</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => nav('/applications')}
              className="w-full font-bold text-xs"
            >
              Go to Application Tracker
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
