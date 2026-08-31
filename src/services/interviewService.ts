import { API_BASE_URL } from '../config/api.config'

export interface PracticeQuestion {
  id: string
  q: string
  category: string
  competencies: string[]
  tip: string
  modelAnswer: string
  followUp?: string
  answeredText?: string
  status: 'pending' | 'active' | 'answered' | 'skipped' | 'timed_out'
  durationSeconds?: number
  aiScore?: number
  aiFeedback?: string
  aiStrengths?: string[]
  aiImprovement?: string
  timestamp?: string
}

export interface ProctoringViolation {
  id: string
  type: 'gaze_diverted' | 'face_turned_away' | 'multiple_faces' | 'no_face_detected' | 'tab_switched' | 'technical_issue'
  title: string
  reason: string
  timestamp: string
  secondsElapsed?: number
  durationSeconds?: number
  confidenceScore?: number
  strikeNumber?: number | 'DISQUALIFIED'
  severity?: 'warning' | 'critical' | 'termination'
}

export interface InterviewSessionSummary {
  id: string
  type: string
  totalQuestions: number
  answeredQuestions: number
  overallScore: number
  status: 'completed' | 'terminated'
  terminationReason?: string
  violationsCount: number
  violations: ProctoringViolation[]
  questions: PracticeQuestion[]
  durationSeconds: number
  date: string
}

const STORAGE_KEY = 'rap_interview_sessions_history'

export const interviewService = {
  getHistory(): InterviewSessionSummary[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  saveSession(session: InterviewSessionSummary) {
    try {
      const history = this.getHistory()
      const updated = [session, ...history]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      // Try sending to backend API if available
      try {
        fetch(`${API_BASE_URL}/interviews/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        }).catch(() => {})
      } catch (e) {}

      return session
    } catch (e) {
      return session
    }
  }
}
