import { seedData } from '../mock/seed'
import { firestoreService } from './firestoreService'
import { directoryService } from '../mock/directoryData'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

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

// The backend (server/) now owns identity/auth and the core profile fields.
// Resumes, applications, documents, projects, notifications and the
// portfolio stay local-only for now (Phase 2 migrates those too) - this
// reconciles the locally-cached "rich" profile with whatever the backend
// knows about the signed-in user whenever a session is established.
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
    // Fresh browser logging into the demo account - seed the full rich demo
    // dataset locally (resumes, applications, projects, etc.) so the rest of
    // the app has something to show, keyed to the real backend user id.
    seedData(true)
    const seeded = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    seeded.id = apiUser.id
    seeded.email = apiUser.email
    localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded))
    return seeded
  }

  // Fresh browser for a real (non-demo) account: only the core profile is
  // known server-side, so sub-entities start empty until Phase 2.
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

  async isEmailTaken(email: string): Promise<boolean> {
    const cleaned = email.trim().toLowerCase()
    if (isDemoEmail(cleaned)) return false
    try {
      const res = await apiFetch(`/auth/check-email?email=${encodeURIComponent(cleaned)}`)
      if (!res.ok) return false
      const data = await res.json()
      return !!data.taken
    } catch {
      // Backend unreachable - don't block the form client-side; the real
      // uniqueness check happens server-side on submit regardless.
      return false
    }
  },

  // 1. Dual OTP Generation & Verification (unchanged demo simulator - see
  // Register.tsx's own copy: real delivery needs a paid SMS/email provider,
  // a decision for later, not part of standing up the backend).
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

  // 2. Candidate Registration - real account via the backend API, then the
  // existing rich local profile/portfolio seeding keeps every other page
  // (Jobs, Applications, Resume, Documents, Projects, Portfolio...) working
  // exactly as before, keyed to the real backend-issued user id.
  async register(data: CandidateRegistrationInput) {
    seedData()

    if (data.college) directoryService.addCustomCollege(data.college)
    if (data.company && !data.isStudent) directoryService.addCustomCompany(data.company)

    const email = data.email.trim().toLowerCase()
    const fullPhone = `${data.countryCode} ${data.phone}`

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
    if (!res.ok) {
      throw new Error(await readError(res, 'Registration failed. Please try again.'))
    }
    const apiUser: ApiUser = await res.json()
    const candidateId = apiUser.id

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
            description: `Driving strategic projects and cross-functional product analytics.`
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
          title: 'Welcome to RAS! 🎉',
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

    await firestoreService.saveCandidateProfile(initialProfile)

    sessionStorage.setItem(FIRST_TIME_USER_KEY, 'true')
    sessionStorage.removeItem(PENDING_OTP_KEY)

    return { id: candidateId, name: data.name.trim(), email, headline: initialProfile.headline }
  },

  // Used only by the demo-account self-heal path in login() below - creates
  // a real backend account for the demo credentials, then seeds the full
  // rich local dataset (resumes, applications, projects...) so "Quick Demo
  // Login" stays a true one-click action against a fresh database.
  async registerDemoAccount() {
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
    if (!res.ok) {
      throw new Error(await readError(res, 'Unable to set up the demo account. Please try again.'))
    }
    const apiUser: ApiUser = await res.json()

    seedData(true)
    const seeded = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    seeded.id = apiUser.id
    localStorage.setItem(PROFILE_KEY, JSON.stringify(seeded))

    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
    return { id: apiUser.id, name: seeded.name, email: apiUser.email, headline: seeded.headline }
  },

  // 3. User Authentication
  async login(email: string, password: string, remember = true) {
    seedData()
    const cleanedEmail = email.trim().toLowerCase()

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: cleanedEmail, password, remember })
    })

    if (res.ok) {
      const apiUser: ApiUser = await res.json()
      const meRes = await apiFetch('/auth/me')
      const me: ApiMeResponse | null = meRes.ok ? await meRes.json() : null
      const localProfile = syncLocalProfileWithBackend(apiUser, me?.profile)
      sessionStorage.removeItem(FIRST_TIME_USER_KEY)
      return { id: apiUser.id, name: localProfile.name, email: apiUser.email, headline: localProfile.headline }
    }

    // Demo account self-heal: only the exact seeded demo credentials trigger
    // this. Anything else that fails login is a real rejection below.
    if (isDemoEmail(cleanedEmail) && password === DEMO_CREDENTIALS.password) {
      const notFound = res.status === 401
      if (notFound) {
        try {
          return await this.registerDemoAccount()
        } catch {
          // fall through to the generic error below if self-heal also fails
        }
      }
    }

    throw new Error(await readError(res, 'Invalid email or password. You can use the Quick Demo Login.'))
  },

  // Restores the session on app load by asking the backend who's currently
  // authenticated (via the httpOnly cookie) - replaces the old synchronous
  // localStorage session read.
  async restoreSession() {
    try {
      const res = await apiFetch('/auth/me')
      if (!res.ok) return null
      const me: ApiMeResponse = await res.json()
      const localProfile = syncLocalProfileWithBackend(me, me.profile)
      return { id: me.id, name: localProfile.name, email: me.email, headline: localProfile.headline }
    } catch {
      return null
    }
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
    } catch {
      // best-effort - clear local state regardless so the UI reflects logged-out
    }
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(PORTFOLIO_KEY)
    localStorage.removeItem('ras_notifications')
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
    sessionStorage.removeItem(PENDING_OTP_KEY)
  },

  // 4. Password Reset Operations
  sendPasswordResetOtp(email: string): { success: boolean; otp: string; message: string } {
    const cleanedEmail = email.trim().toLowerCase()

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

    // Call backend reset API
    const res = await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanedEmail, newPassword })
    })

    if (!res.ok) {
      throw new Error(await readError(res, 'Failed to update password. Please try again.'))
    }

    sessionStorage.removeItem(PASSWORD_RESET_OTP_KEY)

    return {
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.'
    }
  }
}
