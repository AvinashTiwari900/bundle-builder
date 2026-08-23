import { seedData } from '../mock/seed'

export const DEMO_USER = {
  id: 'candidate-1',
  name: 'Avinash Tiwari',
  email: 'avinashtiwari@gmail.com',
  headline: 'Lead Business Analyst & Product Strategist'
}

export const DEMO_CREDENTIALS = {
  email: 'avinashtiwari@gmail.com',
  password: 'Candidate@123'
}

const SESSION_KEY = 'rap_session'

export const authService = {
  init() {
    seedData()
  },

  async login(email: string, password: string, remember = true) {
    seedData()
    const cleanedEmail = email.trim().toLowerCase()
    
    // Support default demo credentials or custom registered user
    if (
      cleanedEmail === DEMO_CREDENTIALS.email.toLowerCase() ||
      password === DEMO_CREDENTIALS.password ||
      (cleanedEmail && password.length >= 4)
    ) {
      const existingProfile = localStorage.getItem('rap_profile')
      let user = DEMO_USER
      if (existingProfile) {
        try {
          const parsed = JSON.parse(existingProfile)
          user = {
            id: parsed.id || 'candidate-1',
            name: parsed.name || 'Avinash Tiwari',
            email: parsed.email || cleanedEmail,
            headline: parsed.headline || 'Business Analyst'
          }
        } catch {
          user = DEMO_USER
        }
      }

      const value = JSON.stringify(user)
      if (remember) {
        localStorage.setItem(SESSION_KEY, value)
      } else {
        sessionStorage.setItem(SESSION_KEY, value)
      }
      return user
    }
    throw new Error('Invalid email or password. You can use the Quick Demo Login.')
  },

  async register(name: string, email: string, phone: string, headline?: string) {
    seedData()
    const profileRaw = localStorage.getItem('rap_profile')
    let profile = profileRaw ? JSON.parse(profileRaw) : {}
    profile = {
      ...profile,
      id: 'candidate-' + Date.now(),
      name,
      email,
      phone,
      headline: headline || 'Business Analyst / Candidate'
    }
    localStorage.setItem('rap_profile', JSON.stringify(profile))

    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      headline: profile.headline
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  },

  getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
}
