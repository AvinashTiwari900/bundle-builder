import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone,
  PhoneOff,
  Sparkles,
  Bot,
  Award,
  ArrowRight,
  Volume2,
  Mic,
  MicOff
} from 'lucide-react'
import Button from '../components/ui/Button'
import { profileService } from '../services/profileService'
import { notificationService } from '../services/notificationService'

interface VoiceQA {
  q: string
  a: string
}

const SpeechRecognitionCtor: any =
  typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null

export default function VoiceScreening() {
  const nav = useNavigate()
  const [callStatus, setCallStatus] = useState<'incoming' | 'connected' | 'completed'>('incoming')
  const [currentStep, setCurrentStep] = useState(0)
  const [userSpeech, setUserSpeech] = useState('')
  const [transcript, setTranscript] = useState<VoiceQA[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')
  const speechSupported = !!SpeechRecognitionCtor

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

  // Call duration counter
  useEffect(() => {
    let interval: any
    if (callStatus === 'connected') {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  // Stop any speech synthesis / mic capture if the candidate navigates away mid-call
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setIsAiSpeaking(true)
    utterance.onend = () => setIsAiSpeaking(false)
    utterance.onerror = () => setIsAiSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const startListening = () => {
    if (!speechSupported) return
    setMicError(null)
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    finalTranscriptRef.current = userSpeech ? userSpeech + ' ' : ''

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += piece + ' '
        } else {
          interim += piece
        }
      }
      setUserSpeech((finalTranscriptRef.current + interim).trim())
    }

    recognition.onerror = (event: any) => {
      setMicError(
        event.error === 'not-allowed'
          ? 'Microphone permission was denied. Please allow access and try again.'
          : event.error === 'no-speech'
          ? 'No speech detected. Please try again.'
          : 'Voice input failed. Please try again or type your answer.'
      )
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const acceptCall = () => {
    setCallStatus('connected')
    speak(hrQuestions[0].q)
  }

  const endCall = () => {
    window.speechSynthesis?.cancel()
    stopListening()
    setCallStatus('completed')

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
    stopListening()

    const activeQ = hrQuestions[currentStep]
    const updated = [...transcript, { q: activeQ.q, a: userSpeech.trim() }]
    setTranscript(updated)
    setUserSpeech('')
    finalTranscriptRef.current = ''

    if (currentStep + 1 < hrQuestions.length) {
      const nextIndex = currentStep + 1
      setCurrentStep(nextIndex)
      speak(hrQuestions[nextIndex].q)
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
          Automated preliminary HR phone screening interaction
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

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 cursor-pointer"
                title="Accept Call"
              >
                <Phone size={26} />
              </button>
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
              </span>
              <span className="font-bold text-white">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* AI Avatar & Audio Visualizer Waveform */}
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                <Bot size={34} />
              </div>
              <h3 className="font-bold text-base">Sarah (AI Talent Partner)</h3>

              {/* Simulated Audio Waveform */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[12, 24, 32, 16, 28, 40, 20, 36, 18, 30, 22].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 bg-blue-400 rounded-full transition-all duration-150 ${
                      isAiSpeaking ? 'animate-pulse' : 'opacity-40'
                    }`}
                    style={{ height: isAiSpeaking ? `${h}px` : '6px' }}
                  ></div>
                ))}
              </div>
            </div>

            {/* AI Spoken Dialogue Subtitle */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left text-xs leading-relaxed font-medium">
              <div className="text-[10px] font-bold text-amber-300 uppercase mb-1 flex items-center gap-1">
                <Volume2 size={12} />
                <span>AI Question {currentStep + 1} of {hrQuestions.length}</span>
              </div>
              <p className="text-white text-xs sm:text-sm">"{hrQuestions[currentStep].q}"</p>
            </div>

            {/* Candidate Voice Response Input */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">Your Response (Speech-to-Text):</span>
                <button
                  onClick={fillSampleSpeech}
                  className="text-amber-300 hover:underline text-[11px] font-bold flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Auto-Fill Sample Speech</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={userSpeech}
                  onChange={(e) => setUserSpeech(e.target.value)}
                  placeholder={speechSupported ? 'Tap the mic and speak, or type here...' : 'Speak your answer or type here...'}
                  className="w-full p-3.5 pr-14 bg-black/40 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 h-24"
                />
                {speechSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? 'Stop listening' : 'Speak your answer'}
                    className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isListening
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                )}
              </div>

              {isListening && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Listening... speak now</span>
                </div>
              )}
              {micError && <p className="text-[11px] text-rose-400 font-medium">{micError}</p>}
              {!speechSupported && (
                <p className="text-[11px] text-slate-400">
                  Voice input isn't supported in this browser (try Chrome or Edge) — you can still type your answer above.
                </p>
              )}
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
                className="font-bold text-xs bg-emerald-500 hover:bg-emerald-600"
              >
                <span>Submit Response</span>
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
                Your screening transcript and eligibility summary have been passed to the recruitment team.
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
