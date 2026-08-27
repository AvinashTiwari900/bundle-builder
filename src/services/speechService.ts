/**
 * High-Quality Voice Synthesis (Text-to-Speech) and Speech Recognition (Speech-to-Text) Service
 * Powers AI interview question reading and candidate spoken voice transcription.
 */

class SpeechService {
  private activeUtterance: SpeechSynthesisUtterance | null = null
  private recognition: any = null
  private isMuted: boolean = false

  constructor() {
    // Warm up speech synthesis voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Cache voices
      }
    }
  }

  /**
   * Check if Text-to-Speech is supported
   */
  isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /**
   * Check if Speech Recognition (Mic to Text) is supported
   */
  isSttSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  }

  /**
   * Toggle global speech mute
   */
  setMuted(muted: boolean) {
    this.isMuted = muted
    if (muted) {
      this.stop()
    }
  }

  getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Find best natural sounding voice
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.isTtsSupported()) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null

    // Preference hierarchy for professional AI interviewers
    const preferred = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft Jenny') ||
          v.name.includes('Microsoft Aria') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira')) &&
        v.lang.startsWith('en')
    )

    if (preferred) return preferred

    // Fallback to any English voice
    const enVoice = voices.find((v) => v.lang.startsWith('en'))
    return enVoice || voices[0] || null
  }

  /**
   * Read text aloud with natural inflection, callbacks, and automatic cleanup
   */
  speak(
    text: string,
    options?: {
      rate?: number
      pitch?: number
      onStart?: () => void
      onEnd?: () => void
      onError?: (err: any) => void
    }
  ) {
    if (this.isMuted || !this.isTtsSupported()) {
      options?.onEnd?.()
      return
    }

    // Cancel ongoing speech
    this.stop()

    // Clean formatting characters (markdown, quotes, etc.)
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim()

    if (!cleanText) {
      options?.onEnd?.()
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = options?.rate || 0.95 // Clear, measured interview pacing
      utterance.pitch = options?.pitch || 1.05 // Friendly professional tone

      const voice = this.getBestVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang || 'en-US'
      } else {
        utterance.lang = 'en-US'
      }

      utterance.onstart = () => {
        options?.onStart?.()
      }

      utterance.onend = () => {
        this.activeUtterance = null
        options?.onEnd?.()
      }

      utterance.onerror = (e) => {
        // Ignore interrupted errors caused by explicit stop()
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis playback notice:', e)
        }
        this.activeUtterance = null
        options?.onEnd?.()
      }

      this.activeUtterance = utterance
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('Speech synthesis invocation failed:', e)
      options?.onEnd?.()
    }
  }

  /**
   * Stop any current speech playback
   */
  stop() {
    if (this.isTtsSupported()) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {
        console.warn('Error stopping speech synthesis:', e)
      }
    }
    this.activeUtterance = null
  }

  /**
   * Start Speech-to-Text Dictation
   */
  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: string) => void
  }): boolean {
    if (!this.isSttSupported()) {
      callbacks.onError?.('Speech recognition is not supported in this browser.')
      return false
    }

    this.stopListening()

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognitionClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        callbacks.onStart?.()
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        const fullText = finalTranscript || interimTranscript
        callbacks.onResult(fullText, !!finalTranscript)
      }

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          callbacks.onError?.(event.error)
        }
      }

      recognition.onend = () => {
        callbacks.onEnd?.()
      }

      this.recognition = recognition
      recognition.start()
      return true
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err)
      callbacks.onError?.(err?.message || 'Could not start microphone dictation')
      return false
    }
  }

  /**
   * Stop Speech-to-Text Dictation
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (e) {}
      this.recognition = null
    }
  }
}

export const speechService = new SpeechService()
