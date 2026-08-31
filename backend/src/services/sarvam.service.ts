/**
 * Sarvam AI Voice Service (Backend Integration Layer)
 * 
 * Provides modular integration for:
 * 1. Speech-to-Text (STT) via Sarvam AI (e.g. saarika:v2 / en-IN, hi-IN)
 * 2. Text-to-Speech (TTS) via Sarvam AI (e.g. bulbul:v1 / en-IN, hi-IN)
 * 
 * Security:
 * - Reads SARVAM_API_KEY from backend process.env.
 * - Never exposes API keys to client or browser.
 */

export interface SarvamTtsOptions {
  speaker?: 'meera' | 'pavithra' | 'maitreyi' | 'arvind' | 'amartya' | 'amrit'
  targetLanguageCode?: string
  pitch?: number
  pace?: number
  loudness?: number
  model?: string
}

export interface SarvamTtsResult {
  audioBase64: string
  format: 'audio/wav' | 'audio/mp3'
  provider: 'sarvam' | 'fallback'
}

export interface SarvamSttResult {
  transcript: string
  languageCode?: string
  confidence?: number
  provider: 'sarvam' | 'fallback'
}

export class SarvamVoiceService {
  private static getApiKey(): string | null {
    const key = process.env.SARVAM_API_KEY
    if (!key || key.trim() === '' || key.includes('your_sarvam_api_key_here')) {
      return null
    }
    return key.trim()
  }

  /**
   * Check if Sarvam AI is configured with a valid API key
   */
  static isAvailable(): boolean {
    return Boolean(this.getApiKey())
  }

  /**
   * Convert candidate speech audio to text via Sarvam Speech-to-Text API
   * Endpoint: POST https://api.sarvam.ai/speech-to-text
   */
  static async transcribeAudio(
    audioBuffer: Buffer,
    mimeType = 'audio/wav',
    languageCode = 'en-IN'
  ): Promise<SarvamSttResult> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      return {
        transcript: '',
        languageCode,
        provider: 'fallback'
      }
    }

    try {
      const boundary = `----WebKitFormBoundary${Date.now().toString(16)}`
      
      // Determine file extension
      let filename = 'candidate_speech.wav'
      if (mimeType.includes('webm')) filename = 'candidate_speech.webm'
      else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) filename = 'candidate_speech.mp3'
      else if (mimeType.includes('ogg')) filename = 'candidate_speech.ogg'

      const preBuffer = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
        `Content-Type: ${mimeType}\r\n\r\n`
      )

      const midBuffer = Buffer.from(
        `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="model"\r\n\r\n` +
        `saarika:v2\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="language_code"\r\n\r\n` +
        `${languageCode}\r\n` +
        `--${boundary}--\r\n`
      )

      const payload = Buffer.concat([preBuffer, audioBuffer, midBuffer])

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: payload
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.warn(`[Sarvam STT] HTTP ${response.status}: ${errText}`)
        return {
          transcript: '',
          languageCode,
          provider: 'fallback'
        }
      }

      const data: any = await response.json()
      const transcript = (data.transcript || '').trim()

      return {
        transcript,
        languageCode: data.language_code || languageCode,
        confidence: data.confidence || 0.95,
        provider: 'sarvam'
      }
    } catch (err: any) {
      console.warn('[Sarvam STT] Transcription failed:', err?.message || err)
      return {
        transcript: '',
        languageCode,
        provider: 'fallback'
      }
    }
  }

  /**
   * Synthesize AI interviewer question to speech via Sarvam Text-to-Speech API
   * Endpoint: POST https://api.sarvam.ai/text-to-speech
   */
  static async synthesizeSpeech(
    text: string,
    options?: SarvamTtsOptions
  ): Promise<SarvamTtsResult | null> {
    const apiKey = this.getApiKey()
    if (!apiKey || !text || !text.trim()) {
      return null
    }

    try {
      const cleanText = text.trim()
      const speaker = options?.speaker || 'meera'
      const targetLanguageCode = options?.targetLanguageCode || 'en-IN'
      const model = options?.model || 'bulbul:v1'

      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [cleanText],
          target_language_code: targetLanguageCode,
          speaker: speaker,
          pitch: options?.pitch ?? 0,
          pace: options?.pace ?? 1.0,
          loudness: options?.loudness ?? 1.5,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: model
        })
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.warn(`[Sarvam TTS] HTTP ${response.status}: ${errText}`)
        return null
      }

      const data: any = await response.json()
      const audios = data.audios || []
      const audioBase64 = audios[0]

      if (!audioBase64) {
        return null
      }

      return {
        audioBase64,
        format: 'audio/wav',
        provider: 'sarvam'
      }
    } catch (err: any) {
      console.warn('[Sarvam TTS] Speech synthesis failed:', err?.message || err)
      return null
    }
  }
}
