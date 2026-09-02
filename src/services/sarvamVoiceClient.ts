import { API_BASE_URL } from '../config/api.config'
import { speechService } from './speechService'
import { CandidateContext, ConversationTurn, InterviewEvaluation, InterviewerMode } from './aiVoicePracticeService'

export interface SarvamSessionInitResponse {
  success: boolean
  sessionId: string
  mode: InterviewerMode
  targetRole: string
  initialQuestion: string
  initialCategory: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audioBase64: string | null
  audioFormat: string | null
  provider: 'sarvam' | 'browser_fallback'
}

export interface SarvamTurnResponse {
  success: boolean
  next_question: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  follow_up: boolean
  audioBase64: string | null
  audioFormat: string | null
  provider: 'sarvam' | 'browser_fallback'
  analysis?: any
}

class SarvamVoiceClientService {
  private currentAudio: HTMLAudioElement | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private isRecordingActive = false

  /**
   * Check Sarvam status from backend
   */
  async checkBackendStatus(): Promise<{ sarvamActive: boolean; provider: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/voice-practice/status`)
      if (!res.ok) return { sarvamActive: false, provider: 'Web Speech API (Fallback Mode)' }
      const data = await res.json()
      return {
        sarvamActive: Boolean(data.sarvamActive),
        provider: data.provider || 'Web Speech API'
      }
    } catch {
      return { sarvamActive: false, provider: 'Web Speech API (Fallback Mode)' }
    }
  }

  /**
   * Start a new Practice Session via Backend
   */
  async startSession(
    candidate: CandidateContext,
    targetRole: string,
    mode: InterviewerMode = 'recruiter',
    languageCode = 'en-IN'
  ): Promise<SarvamSessionInitResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/voice-practice/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, targetRole, mode, languageCode })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[SarvamVoiceClient] Backend session start failed, using fallback:', err)
      const firstName = candidate.name ? candidate.name.split(' ')[0] : 'there'
      const initialQuestion = mode === 'recruiter'
        ? `Hello ${firstName}! I am Sarah, your simulated RAS AI Talent Partner. We are starting a 15-minute practice session today for the ${targetRole} position. Could you walk me through your professional background and current responsibilities?`
        : `Hello ${firstName}! Welcome to your technical mock interview for the ${targetRole} role. I'm Alex, your senior AI technical lead. Could you share a high-level overview of your recent engineering focus and core stack?`

      return {
        success: true,
        sessionId: `fallback-${Date.now()}`,
        mode,
        targetRole,
        initialQuestion,
        initialCategory: 'intro',
        difficulty: 'intermediate',
        audioBase64: null,
        audioFormat: null,
        provider: 'browser_fallback'
      }
    }
  }

  /**
   * Send turn to backend Adaptive Question Engine
   */
  async sendTurn(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string,
    currentDifficulty: 'beginner' | 'intermediate' | 'advanced',
    actionType: 'normal' | 'repeat' | 'clarify' | 'skip' = 'normal',
    mode: InterviewerMode = 'recruiter',
    languageCode = 'en-IN'
  ): Promise<SarvamTurnResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/voice-practice/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns,
          candidate,
          targetRole,
          currentDifficulty,
          actionType,
          mode,
          languageCode
        })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[SarvamVoiceClient] Backend nextTurn failed, using client engine:', err)
      return {
        success: false,
        next_question: 'Could you elaborate on the core technologies and architectural decisions in your last project?',
        category: 'technical',
        difficulty: currentDifficulty,
        follow_up: false,
        audioBase64: null,
        audioFormat: null,
        provider: 'browser_fallback'
      }
    }
  }

  /**
   * Request End-of-Interview Diagnostic Evaluation from Backend
   */
  async evaluateSession(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string,
    mode: InterviewerMode = 'recruiter'
  ): Promise<InterviewEvaluation | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/voice-practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns, candidate, targetRole, mode })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return data.evaluation || null
    } catch (err) {
      console.warn('[SarvamVoiceClient] Backend evaluation failed:', err)
      return null
    }
  }

  /**
   * Start recording candidate speech audio via MediaRecorder
   */
  async startAudioRecording(callbacks?: {
    onStart?: () => void
    onError?: (err: any) => void
  }): Promise<boolean> {
    this.stopAudioPlayback()
    this.audioChunks = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4'
        else mimeType = ''
      }

      this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstart = () => {
        this.isRecordingActive = true
        callbacks?.onStart?.()
      }

      this.mediaRecorder.start(250)
      return true
    } catch (err) {
      console.warn('[SarvamVoiceClient] Microphone access failed:', err)
      callbacks?.onError?.(err)
      return false
    }
  }

  /**
   * Stop recording and send audio to backend for Sarvam STT transcription
   */
  async stopAudioRecordingAndTranscribe(languageCode = 'en-IN'): Promise<{ transcript: string; provider: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecordingActive) {
        resolve({ transcript: '', provider: 'fallback' })
        return
      }

      this.mediaRecorder.onstop = async () => {
        this.isRecordingActive = false
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' })
        
        // Stop all audio tracks
        this.mediaRecorder?.stream.getTracks().forEach((t) => t.stop())
        this.mediaRecorder = null

        if (audioBlob.size < 500) {
          resolve({ transcript: '', provider: 'fallback' })
          return
        }

        try {
          // Convert Blob to Base64
          const reader = new FileReader()
          reader.onloadend = async () => {
            const dataUrl = reader.result as string
            const base64Data = dataUrl.split(',')[1] || ''

            const res = await fetch(`${API_BASE_URL}/voice-practice/transcribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: audioBlob.type,
                languageCode
              })
            })

            if (!res.ok) {
              resolve({ transcript: '', provider: 'fallback' })
              return
            }

            const data = await res.json()
            resolve({
              transcript: data.transcript || '',
              provider: data.provider || 'sarvam'
            })
          }
          reader.readAsDataURL(audioBlob)
        } catch {
          resolve({ transcript: '', provider: 'fallback' })
        }
      }

      try {
        this.mediaRecorder.stop()
      } catch {
        resolve({ transcript: '', provider: 'fallback' })
      }
    })
  }

  /**
   * Play high-fidelity Sarvam audio stream (WAV/MP3 base64) with fallback to browser Web Speech API
   */
  playAiAudio(
    text: string,
    audioBase64: string | null,
    format = 'audio/wav',
    callbacks?: {
      onStart?: () => void
      onEnd?: () => void
    }
  ) {
    this.stopAudioPlayback()

    if (audioBase64) {
      try {
        const audioSrc = `data:${format};base64,${audioBase64}`
        const audio = new Audio(audioSrc)
        this.currentAudio = audio

        audio.onplay = () => callbacks?.onStart?.()
        audio.onended = () => {
          this.currentAudio = null
          callbacks?.onEnd?.()
        }
        audio.onerror = (e) => {
          console.warn('[SarvamVoiceClient] Audio element playback error, falling back to Web Speech:', e)
          this.currentAudio = null
          speechService.speak(text, {
            onStart: callbacks?.onStart,
            onEnd: callbacks?.onEnd
          })
        }

        audio.play().catch((err) => {
          console.warn('[SarvamVoiceClient] Autoplay prevented, falling back to Web Speech:', err)
          speechService.speak(text, {
            onStart: callbacks?.onStart,
            onEnd: callbacks?.onEnd
          })
        })
        return
      } catch (err) {
        console.warn('[SarvamVoiceClient] Failed to instantiate audio element:', err)
      }
    }

    // Fallback to Web Speech API
    speechService.speak(text, {
      onStart: callbacks?.onStart,
      onEnd: callbacks?.onEnd
    })
  }

  /**
   * Barge-in: Instantly stop/interrupt AI speech
   */
  stopAudioPlayback() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      } catch {}
      this.currentAudio = null
    }
    speechService.stop()
  }

  /**
   * Cancel ongoing recording if any
   */
  cancelRecording() {
    if (this.mediaRecorder && this.isRecordingActive) {
      try {
        this.mediaRecorder.stream.getTracks().forEach((t) => t.stop())
        this.mediaRecorder.stop()
      } catch {}
      this.isRecordingActive = false
      this.mediaRecorder = null
    }
    speechService.stopListening()
  }
}

export const sarvamVoiceClient = new SarvamVoiceClientService()
