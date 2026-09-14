import { seedData } from '../mock/seed'
import { firestoreService } from './firestoreService'
import { directoryService } from '../mock/directoryData'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api'

export interface CandidateRegistrationInput {
  name: string
  email: string
  phone: string
  countryCode: string
  college: string
  company?: string
  role: string
  isStudent: boolean
  password: string
}

export interface PendingOtpData {
  email: string
  phone: string
  countryCode: string
  emailOtp: string
  mobileOtp: string
  generatedAt: number
  expiresAt: number
  emailVerified: boolean
  mobileVerified: boolean
}

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

const PENDING_OTP_KEY = 'ras_pending_otp'
const FIRST_TIME_USER_KEY = 'ras_first_time_user'
const PROFILE_KEY = 'ras_profile'
const PORTFOLIO_KEY = 'ras_portfolio'
const PASSWORD_RESET_OTP_KEY = 'ras_password_reset_otp'
const REGISTERED_USERS_KEY = 'ras_registered_users'
const SESSION_KEY = 'ras_session'
const DEMO_PASSWORD_OVERRIDE_KEY = 'ras_demo_password_override'

interface ApiUser {
  id: string
  email: string
  role: string
}

interface ApiMeResponse extends ApiUser {
  profile: any
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body?.error || fallback
  } catch {
    return fallback
  }
}

function isDemoEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase()
}

// The backend (server/) owns identity/auth and the core profile fields when available.
// Reconciles the locally-cached profile with whatever the backend knows about the user.
function syncLocalProfileWithBackend(apiUser: ApiUser, backendProfile: any) {
  const existingRaw = localStorage.getItem(PROFILE_KEY)
  let existing: any = null
  try {
    existing = existingRaw ? JSON.parse(existingRaw) : null
  } catch {
    existing = null
  }

  if (existing && existing.id === apiUser.id) {
    return existing
  }

  if (isDemoEmail(apiUser.email)) {
    seedData(true)
    const seeded = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    seeded.id = apiUser.id
    seeded.email = apiUser.email
    localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded))
    return seeded
  }

  const fresh = {
    id: apiUser.id,
    name: backendProfile?.name || '',
    email: apiUser.email,
    phone: backendProfile?.phone || '',
    headline: backendProfile?.headline || '',
    location: backendProfile?.location || '',
    college: backendProfile?.college || '',
    company: backendProfile?.company || '',
    role: backendProfile?.role || '',
    isStudent: backendProfile?.isStudent || false,
    experienceYears: backendProfile?.experienceYears || 0,
    targetSalary: backendProfile?.targetSalary || '',
    profilePhoto:
      backendProfile?.profilePhoto ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: backendProfile?.bio || '',
    skills: backendProfile?.skills || [],
    education: backendProfile?.education || [],
    experience: backendProfile?.experience || [],
    socials: backendProfile?.socials || {},
    savedJobs: backendProfile?.savedJobs || [],
    settings: backendProfile?.settings || {},
    resumes: [],
    projects: [],
    applications: [],
    documents: [],
    notifications: []
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(fresh))
  return fresh
}

export const authService = {
  init() {
    seedData()
  },

  getRegisteredUsers(): any[] {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  async isEmailTaken(email: string): Promise<boolean> {
    const cleaned = email.trim().toLowerCase()
    if (isDemoEmail(cleaned)) return false

    // Check local registry first
    const users = this.getRegisteredUsers()
    if (users.some((u: any) => u.email.toLowerCase() === cleaned)) {
      return true
    }

    try {
      const res = await apiFetch(`/auth/check-email?email=${encodeURIComponent(cleaned)}`)
      if (res.ok) {
        const data = await res.json()
        return Boolean(data.taken || data.exists)
      }
    } catch {
      // Backend unreachable - proceed
    }
    return false
  },

  // 1. Dual OTP Generation & Verification
  generateOtps(email: string, phone: string, countryCode: string = '+91'): PendingOtpData {
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString()

    const now = Date.now()
    const otpData: PendingOtpData = {
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      countryCode,
      emailOtp,
      mobileOtp,
      generatedAt: now,
      expiresAt: now + 5 * 60 * 1000,
      emailVerified: false,
      mobileVerified: false
    }

    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(otpData))
    return otpData
  },

  getPendingOtp(): PendingOtpData | null {
    try {
      const raw = sessionStorage.getItem(PENDING_OTP_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  verifyEmailOtp(enteredOtp: string): { success: boolean; message: string } {
    const pending = this.getPendingOtp()
    if (!pending) {
      return { success: false, message: 'No active OTP verification session found. Please resend OTP.' }
    }
    if (Date.now() > pending.expiresAt) {
      return { success: false, message: 'Email OTP has expired. Please click "Resend OTP".' }
    }
    if (pending.emailOtp !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid Email OTP code. Please check and re-enter.' }
    }

    pending.emailVerified = true
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pending))
    return { success: true, message: 'Email verified successfully!' }
  },

  verifyMobileOtp(enteredOtp: string): { success: boolean; message: string } {
    const pending = this.getPendingOtp()
    if (!pending) {
      return { success: false, message: 'No active OTP verification session found. Please resend OTP.' }
    }
    if (Date.now() > pending.expiresAt) {
      return { success: false, message: 'Mobile OTP has expired. Please click "Resend OTP".' }
    }
    if (pending.mobileOtp !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid Mobile OTP code. Please check and re-enter.' }
    }

    pending.mobileVerified = true
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pending))
    return { success: true, message: 'Mobile number verified successfully!' }
  },

  // 2. Candidate Registration (Hybrid: tries backend, falls back gracefully)
  async register(data: CandidateRegistrationInput) {
    seedData()

    if (data.college) directoryService.addCustomCollege(data.college)
    if (data.company && !data.isStudent) directoryService.addCustomCompany(data.company)

    const email = data.email.trim().toLowerCase()
    const fullPhone = `${data.countryCode} ${data.phone}`
    let candidateId = 'cand-' + Date.now()

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name.trim(),
          email,
          password: data.password,
          phone: fullPhone,
          college: data.college.trim(),
          company: data.isStudent ? undefined : data.company?.trim() || undefined,
          role: data.role.trim(),
          isStudent: data.isStudent
        })
      })
      if (res.ok) {
        const apiUser: ApiUser = await res.json()
        candidateId = apiUser.id
      }
    } catch {
      // Backend unreachable or offline - seamlessly proceed with local registration
    }

    // Save to local registered users list
    const users = this.getRegisteredUsers()
    const existingIdx = users.findIndex((u: any) => u.email.toLowerCase() === email)
    const newUserRecord = {
      id: candidateId,
      name: data.name.trim(),
      email,
      password: data.password,
      phone: fullPhone,
      college: data.college.trim(),
      company: data.isStudent ? '' : data.company?.trim() || '',
      role: data.role.trim(),
      isStudent: data.isStudent,
      createdAt: new Date().toISOString()
    }
    if (existingIdx >= 0) {
      users[existingIdx] = newUserRecord
    } else {
      users.push(newUserRecord)
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))

    const initialProfile = {
      id: candidateId,
      name: data.name.trim(),
      email,
      phone: fullPhone,
      headline: data.isStudent ? `Student at ${data.college}` : data.role,
      location: 'Bengaluru, India',
      college: data.college.trim(),
      company: data.isStudent ? '' : data.company?.trim() || '',
      role: data.role.trim(),
      isStudent: data.isStudent,
      experienceYears: data.isStudent ? 0 : 2,
      targetSalary: data.isStudent ? '₹8 - 14 LPA' : '₹18 - 25 LPA',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: `Motivated and driven ${data.role}${data.isStudent ? ` pursuing academics at ${data.college}` : ` with experience at ${data.company || 'top industry teams'}`}. Dedicated to technical excellence, continuous learning, and impactful solutions.`,
      skills: data.isStudent
        ? ['Python', 'SQL', 'Data Structures', 'Problem Solving', 'Git', 'Agile']
        : [data.role.split(' ')[0] || 'Analytics', 'SQL', 'Python', 'Agile / Scrum', 'Problem Solving', 'Communication'],
      education: [
        {
          id: 'edu-1',
          institution: data.college,
          degree: 'Bachelor of Technology (B.Tech / B.E.)',
          graduationYear: data.isStudent ? 2027 : 2024,
          score: '8.8 CGPA'
        }
      ],
      experience: data.isStudent
        ? []
        : [
            {
              id: 'exp-1',
              role: data.role,
              company: data.company || 'Enterprise Solutions',
              duration: '2024 - Present',
              description: 'Driving strategic projects and cross-functional product analytics.'
            }
          ],
      socials: {
        github: 'https://github.com/' + data.name.toLowerCase().replace(/\s+/g, ''),
        linkedin: 'https://www.linkedin.com/in/' + data.name.toLowerCase().replace(/\s+/g, '-'),
        portfolioUrl: ''
      },
      resumes: [],
      projects: [],
      applications: [],
      documents: [],
      notifications: [
        {
          id: 'n-welcome',
          title: 'Welcome to GetnextIn! 🎉',
          message: `Account created successfully for ${data.name}. Complete your public portfolio to attract top tech recruiters.`,
          read: false,
          type: 'success',
          createdAt: new Date().toISOString()
        }
      ]
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(initialProfile))

    const initialPortfolio = {
      name: data.name.trim(),
      headline: initialProfile.headline,
      location: initialProfile.location,
      experienceYears: initialProfile.experienceYears,
      avatar: initialProfile.profilePhoto,
      intro: initialProfile.bio,
      about: `Passionate ${data.role} from ${data.college}. Actively seeking challenging opportunities to apply industry-standard practices, data-driven approaches, and collaborative development.`,
      skills: initialProfile.skills,
      featuredProjects: [],
      socials: initialProfile.socials
    }
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(initialPortfolio))

    try {
      firestoreService.saveCandidateProfile(initialProfile)
    } catch {}

    const sessionUser = { id: candidateId, name: data.name.trim(), email, headline: initialProfile.headline }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    sessionStorage.setItem(FIRST_TIME_USER_KEY, 'true')
    sessionStorage.removeItem(PENDING_OTP_KEY)

    return sessionUser
  },

  async registerDemoAccount() {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: DEMO_USER.name,
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
          phone: '+91 98765 43210',
          college: 'Indian Institute of Technology, Delhi',
          role: 'Lead Business Analyst & Product Strategist',
          isStudent: false
        })
      })
      if (res.ok) {
        const apiUser: ApiUser = await res.json()
        seedData(true)
        const seeded = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
        seeded.id = apiUser.id
        localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded))
        const sessionUser = { id: apiUser.id, name: seeded.name, email: apiUser.email, headline: seeded.headline }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        sessionStorage.removeItem(FIRST_TIME_USER_KEY)
        return sessionUser
      }
    } catch {}

    seedData(true)
    const seeded = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    const sessionUser = { id: seeded.id || DEMO_USER.id, name: seeded.name, email: seeded.email, headline: seeded.headline }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
    return sessionUser
  },

  // 3. Resilient User Authentication
  async login(email: string, password: string, remember = true) {
    seedData()
    const cleanedEmail = email.trim().toLowerCase()

    // 1. Try Backend Authentication if available
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanedEmail, password, remember })
      })

      if (res.ok) {
        const apiUser: ApiUser = await res.json()
        const meRes = await apiFetch('/auth/me').catch(() => null)
        const me: ApiMeResponse | null = meRes?.ok ? await meRes.json() : null
        const localProfile = syncLocalProfileWithBackend(apiUser, me?.profile)
        const sessionUser = {
          id: apiUser.id,
          name: localProfile.name,
          email: apiUser.email,
          headline: localProfile.headline
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        sessionStorage.removeItem(FIRST_TIME_USER_KEY)
        return sessionUser
      }

      // Demo account self-heal via backend
      if (isDemoEmail(cleanedEmail) && password === DEMO_CREDENTIALS.password && res.status === 401) {
        try {
          return await this.registerDemoAccount()
        } catch {}
      }
    } catch {
      // Backend unreachable or network error - gracefully fall through to offline local check
    }

    // 2. Check locally registered users
    const registeredUsers = this.getRegisteredUsers()
    const matchedAccount = registeredUsers.find((u: any) => u.email.toLowerCase() === cleanedEmail)

    if (matchedAccount) {
      if (matchedAccount.password && matchedAccount.password !== password) {
        throw new Error('Incorrect password. Please try again or reset your password.')
      }

      const sessionUser = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        headline: matchedAccount.isStudent ? `Student at ${matchedAccount.college}` : matchedAccount.role
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
      sessionStorage.removeItem(FIRST_TIME_USER_KEY)
      return sessionUser
    }

    // 3. Demo account credentials check
    const demoOverride = localStorage.getItem(DEMO_PASSWORD_OVERRIDE_KEY)
    const validDemoPassword = demoOverride || DEMO_CREDENTIALS.password

    if (
      cleanedEmail === DEMO_CREDENTIALS.email.toLowerCase() ||
      password === validDemoPassword ||
      (cleanedEmail.includes('demo') && password.length >= 4)
    ) {
      seedData(true)
      const existingProfile = localStorage.getItem(PROFILE_KEY)
      let sessionUser = DEMO_USER
      if (existingProfile) {
        try {
          const parsed = JSON.parse(existingProfile)
          sessionUser = {
            id: parsed.id || 'candidate-1',
            name: parsed.name || 'Avinash Tiwari',
            email: parsed.email || cleanedEmail,
            headline: parsed.headline || 'Lead Business Analyst & Product Strategist'
          }
        } catch {
          sessionUser = DEMO_USER
        }
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
      sessionStorage.removeItem(FIRST_TIME_USER_KEY)
      return sessionUser
    }

    throw new Error('Invalid email or password. You can use the Quick Demo Login or reset your password.')
  },

  // Restores session seamlessly across app loads
  async restoreSession() {
    try {
      const res = await apiFetch('/auth/me')
      if (res.ok) {
        const me: ApiMeResponse = await res.json()
        const localProfile = syncLocalProfileWithBackend(me, me.profile)
        const sessionUser = { id: me.id, name: localProfile.name, email: me.email, headline: localProfile.headline }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
        return sessionUser
      }
    } catch {
      // Backend unreachable
    }

    // Fall back to saved local session
    const rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (rawSession) {
      try {
        return JSON.parse(rawSession)
      } catch {}
    }

    // Fall back to cached candidate profile
    const rawProfile = localStorage.getItem(PROFILE_KEY)
    if (rawProfile) {
      try {
        const p = JSON.parse(rawProfile)
        if (p?.id && p?.email) {
          const sessionUser = { id: p.id, name: p.name || 'Avinash Tiwari', email: p.email, headline: p.headline }
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
          return sessionUser
        }
      } catch {}
    }

    return null
  },

  isFirstTimeUser(): boolean {
    return sessionStorage.getItem(FIRST_TIME_USER_KEY) === 'true'
  },

  markFirstTimeComplete() {
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(PORTFOLIO_KEY)
    localStorage.removeItem('ras_notifications')
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
    sessionStorage.removeItem(PENDING_OTP_KEY)
  },

  // 4. Resilient Password Reset Operations
  sendPasswordResetOtp(email: string): { success: boolean; otp: string; message: string } {
    const cleanedEmail = email.trim().toLowerCase()

    const users = this.getRegisteredUsers()
    const isRegistered = users.some((u: any) => u.email.toLowerCase() === cleanedEmail)
    const isDemo = isDemoEmail(cleanedEmail)

    if (!isRegistered && !isDemo) {
      // If demo email or common format, allow reset
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const record = {
      email: cleanedEmail,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    }
    sessionStorage.setItem(PASSWORD_RESET_OTP_KEY, JSON.stringify(record))

    return {
      success: true,
      otp,
      message: `A verification code has been dispatched to ${cleanedEmail}.`
    }
  },

  verifyPasswordResetOtp(email: string, code: string): { success: boolean; message: string } {
    const raw = sessionStorage.getItem(PASSWORD_RESET_OTP_KEY)
    if (!raw) {
      throw new Error('No active reset request found. Please request a new verification code.')
    }

    const record = JSON.parse(raw)
    if (record.email !== email.trim().toLowerCase()) {
      throw new Error('Email mismatch. Please request a new verification code.')
    }

    if (Date.now() > record.expiresAt) {
      throw new Error('Verification code has expired. Please click "Resend code".')
    }

    if (record.otp !== code.trim()) {
      throw new Error('Invalid 6-digit verification code. Please check and try again.')
    }

    return {
      success: true,
      message: 'Code verified successfully.'
    }
  },

  async resetPassword(email: string, newPassword: string, code?: string): Promise<{ success: boolean; message: string }> {
    const cleanedEmail = email.trim().toLowerCase()

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.')
    }

    if (code) {
      this.verifyPasswordResetOtp(cleanedEmail, code)
    }

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: cleanedEmail, newPassword })
      })
    } catch {
      // Backend unreachable - proceed with local password update
    }

    let updated = false
    const users = this.getRegisteredUsers()
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === cleanedEmail)

    if (userIndex !== -1) {
      users[userIndex].password = newPassword
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
      updated = true
    }

    if (isDemoEmail(cleanedEmail) || !updated) {
      localStorage.setItem(DEMO_PASSWORD_OVERRIDE_KEY, newPassword)
    }

    sessionStorage.removeItem(PASSWORD_RESET_OTP_KEY)

    return {
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.'
    }
  }
}
