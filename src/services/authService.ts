import { seedData } from '../mock/seed'
import { firestoreService } from './firestoreService'
import { directoryService } from '../mock/directoryData'

export interface RegisteredAccount {
  id: string
  name: string
  email: string
  phone: string
  countryCode: string
  college: string
  company?: string
  role: string
  isStudent: boolean
  password?: string
  createdAt: string
  isFirstTimeUser?: boolean
}

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

const SESSION_KEY = 'rap_session'
const REGISTERED_USERS_KEY = 'rap_registered_users'
const PENDING_OTP_KEY = 'rap_pending_otp'
const FIRST_TIME_USER_KEY = 'rap_first_time_user'

export const authService = {
  init() {
    seedData()
  },

  getRegisteredUsers(): RegisteredAccount[] {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  isEmailTaken(email: string): boolean {
    const cleaned = email.trim().toLowerCase()
    if (cleaned === DEMO_CREDENTIALS.email.toLowerCase()) return false // Demo is allowed
    const users = this.getRegisteredUsers()
    return users.some((u) => u.email.toLowerCase() === cleaned)
  },

  // 1. Dual OTP Generation & Verification
  generateOtps(email: string, phone: string, countryCode: string = '+91'): PendingOtpData {
    // Generate realistic 6-digit OTPs
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
      expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
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

  // 2. Candidate Registration with Comprehensive Profile & Portfolio Seeding
  async register(data: CandidateRegistrationInput) {
    seedData()

    // Store custom college and company if entered
    if (data.college) directoryService.addCustomCollege(data.college)
    if (data.company && !data.isStudent) directoryService.addCustomCompany(data.company)

    const candidateId = 'candidate-' + Date.now()
    const fullPhone = `${data.countryCode} ${data.phone}`

    // 1. Create registered user record
    const newAccount: RegisteredAccount = {
      id: candidateId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      countryCode: data.countryCode,
      college: data.college.trim(),
      company: data.isStudent ? 'Student / N/A' : (data.company?.trim() || 'Independent'),
      role: data.role.trim(),
      isStudent: data.isStudent,
      password: data.password,
      createdAt: new Date().toISOString(),
      isFirstTimeUser: true
    }

    const registeredUsers = this.getRegisteredUsers()
    registeredUsers.push(newAccount)
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers))

    // 2. Build initial candidate profile
    const initialProfile = {
      id: candidateId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: fullPhone,
      headline: data.isStudent ? `Student at ${data.college}` : data.role,
      location: 'Bengaluru, India',
      college: data.college.trim(),
      company: data.isStudent ? '' : (data.company?.trim() || ''),
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

    localStorage.setItem('rap_profile', JSON.stringify(initialProfile))

    // 3. Build initial portfolio
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
    localStorage.setItem('rap_portfolio', JSON.stringify(initialPortfolio))

    // 4. Sync profile with Firestore
    await firestoreService.saveCandidateProfile(initialProfile)

    // 5. Establish active user session
    const sessionUser = {
      id: candidateId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      headline: initialProfile.headline
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))

    // 6. Set first-time onboarding flag
    sessionStorage.setItem(FIRST_TIME_USER_KEY, 'true')

    // Clean up pending OTP session
    sessionStorage.removeItem(PENDING_OTP_KEY)

    return sessionUser
  },

  // 3. User Authentication
  async login(email: string, password: string, remember = true) {
    seedData()
    const cleanedEmail = email.trim().toLowerCase()
    const registeredUsers = this.getRegisteredUsers()

    // Check if custom registered user exists
    const matchedAccount = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanedEmail
    )

    if (matchedAccount) {
      if (matchedAccount.password && matchedAccount.password !== password) {
        throw new Error('Incorrect password. Please try again.')
      }

      const user = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        headline: matchedAccount.isStudent
          ? `Student at ${matchedAccount.college}`
          : matchedAccount.role
      }

      const value = JSON.stringify(user)
      if (remember) {
        localStorage.setItem(SESSION_KEY, value)
      } else {
        sessionStorage.setItem(SESSION_KEY, value)
      }

      // Returning user - clear first time flag
      sessionStorage.removeItem(FIRST_TIME_USER_KEY)
      return user
    }

    // Default demo credentials or fallback
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
            headline: parsed.headline || 'Lead Business Analyst & Product Strategist'
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

      // Returning user - clear first time flag
      sessionStorage.removeItem(FIRST_TIME_USER_KEY)
      return user
    }

    throw new Error('Invalid email or password. You can use the Quick Demo Login.')
  },

  isFirstTimeUser(): boolean {
    return sessionStorage.getItem(FIRST_TIME_USER_KEY) === 'true'
  },

  markFirstTimeComplete() {
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(FIRST_TIME_USER_KEY)
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
