import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { authService, PendingOtpData } from '../services/authService'
import { directoryService, COUNTRY_CODES } from '../mock/directoryData'
import SearchableSelect from '../components/ui/SearchableSelect'

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2: OTP State
  const [pendingOtp, setPendingOtp] = useState<PendingOtpData | null>(null)
  const [emailOtpInput, setEmailOtpInput] = useState('')
  const [mobileOtpInput, setMobileOtpInput] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [mobileVerified, setMobileVerified] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // General Status
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const nav = useNavigate()

  // Predefined lists
  const collegeList = directoryService.getColleges()
  const companyList = directoryService.getCompanies()
  const roleList = directoryService.getRoles()

  // Handle role change (if user selects 'Student')
  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole)
    if (selectedRole.toLowerCase() === 'student') {
      setIsStudent(true)
      setCompany('')
    }
  }

  // Toggle student status
  const handleToggleStudent = (checked: boolean) => {
    setIsStudent(checked)
    if (checked) {
      setRole('Student')
      setCompany('')
    } else if (role === 'Student') {
      setRole('')
    }
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-700' }
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2 || score === 3) return { score: 2, label: 'Good', color: 'bg-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' }
  }

  // Active OTP countdown timer
  useEffect(() => {
    let interval: any = null
    if (step === 2 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [step, timerSeconds])

  // Step 1: Proceed to OTP Verification
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 1. Full Name Validation (letters, spaces, dots, hyphens, min 2 chars)
    const nameRegex = /^[a-zA-Z\s.\-']{2,60}$/
    if (!nameRegex.test(name.trim())) {
      return setError('Please enter a valid full name (letters, dots, hyphens, min 2 characters).')
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return setError('Please enter a valid email address format.')
    }

    // 3. Email Uniqueness Check
    if (authService.isEmailTaken(email.trim())) {
      return setError('An account with this email address already exists. Please log in or use another email.')
    }

    // 4. Mobile Validation (7 to 15 digits)
    const cleanPhone = phone.replace(/[\s\-]/g, '')
    if (!/^\d{7,15}$/.test(cleanPhone)) {
      return setError('Please enter a valid mobile number with digits only (7 to 15 digits).')
    }

    // 5. College Validation
    if (!college.trim()) {
      return setError('College / University name is mandatory.')
    }

    // 6. Role & Company Validation
    if (!isStudent && !role.trim()) {
      return setError('Please select or enter your current role/status.')
    }
    if (!isStudent && !company.trim()) {
      return setError('Company name is required for working professionals (or select "Student" status).')
    }

    // 7. Password Validation
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.')
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-check confirm password.')
    }

    // Generate Dual OTPs and move to Step 2
    const otpData = authService.generateOtps(email, cleanPhone, countryCode)
    setPendingOtp(otpData)
    setEmailVerified(false)
    setMobileVerified(false)
    setEmailOtpInput('')
    setMobileOtpInput('')
    setTimerSeconds(60)
    setCanResend(false)
    setStep(2)
  }

  // Handle Verify Individual Email OTP
  const handleVerifyEmail = (entered?: string) => {
    const code = entered !== undefined ? entered : emailOtpInput
    const res = authService.verifyEmailOtp(code)
    if (res.success) {
      setEmailVerified(true)
      setError('')
    } else {
      setError(res.message)
    }
  }

  // Handle Verify Individual Mobile OTP
  const handleVerifyMobile = (entered?: string) => {
    const code = entered !== undefined ? entered : mobileOtpInput
    const res = authService.verifyMobileOtp(code)
    if (res.success) {
      setMobileVerified(true)
      setError('')
    } else {
      setError(res.message)
    }
  }

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return
    const cleanPhone = phone.replace(/[\s\-]/g, '')
    const otpData = authService.generateOtps(email, cleanPhone, countryCode)
    setPendingOtp(otpData)
    setEmailVerified(false)
    setMobileVerified(false)
    setEmailOtpInput('')
    setMobileOtpInput('')
    setTimerSeconds(60)
    setCanResend(false)
    setError('')
  }

  // Complete Registration Final Action
  const handleCompleteRegistration = async () => {
    setError('')

    let isEmailOk = emailVerified
    let isMobileOk = mobileVerified

    // Auto-verify if matching code was entered even if button wasn't clicked
    if (!isEmailOk && pendingOtp && emailOtpInput.trim() === pendingOtp.emailOtp) {
      isEmailOk = true
      setEmailVerified(true)
    }
    if (!isMobileOk && pendingOtp && mobileOtpInput.trim() === pendingOtp.mobileOtp) {
      isMobileOk = true
      setMobileVerified(true)
    }

    if (!isEmailOk || !isMobileOk) {
      return setError('Please enter and verify both Email OTP and Mobile OTP before completing registration.')
    }

    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/[\s\-]/g, ''),
        countryCode,
        college: college.trim(),
        company: isStudent ? undefined : company.trim(),
        role: isStudent ? 'Student' : (role.trim() || 'Professional'),
        isStudent,
        password
      })

      // Immediately redirect first-time registered candidate to Portfolio Setup page
      nav('/portfolio-setup')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const pwdStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Subtle Purple & Blue Ambient Edge Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20 shrink-0">
              <UserPlus size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Create Candidate Account
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Gettin Candidates — AI-Powered Job & Career Platform
              </p>
            </div>
          </div>

          {/* Pill-Shaped Step Indicator Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs font-bold text-slate-300 shrink-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 1 ? '1' : '✓'}
            </span>
            <span className="hidden sm:inline">{step === 1 ? 'Account Details' : 'OTP Verification'}</span>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-2xl font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToOtp} className="space-y-4" aria-label="Create Candidate Account Form">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your official legal name as shown on KYC certificates.
              </p>
            </div>

            {/* 2. Two-Column Row: Email Address & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter candidate email ID"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">An email OTP will be sent here.</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-2.5 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.country} value={c.code} className="bg-slate-900 text-white">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                      <Phone size={15} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter candidate mobile number"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">An SMS OTP will be sent here.</p>
              </div>
            </div>

            {/* 3. College / University Name */}
            <div>
              <SearchableSelect
                label="College / University Name"
                value={college}
                onChange={(val) => setCollege(val)}
                options={collegeList}
                placeholder="Enter college or university name"
                icon={<GraduationCap size={16} />}
                allowCustom={true}
                onAddCustom={(customCollege) => directoryService.addCustomCollege(customCollege)}
                required={true}
                customTypeLabel="college"
                helperText="Select from top universities or type and press enter to add custom."
                theme="dark"
              />
            </div>

            {/* 4. Card / Panel: Student Toggle, Role & Company */}
            <div className="p-4 sm:p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3.5">
              {/* Toggle Row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Are you currently a student?</span>
                  <p className="text-[11px] text-slate-400">
                    Students can skip current company requirements
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => handleToggleStudent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="border-t border-slate-700/60"></div>

              {/* Two-Column Row Inside Card: Current Role & Current Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Current Role / Status */}
                <div>
                  <SearchableSelect
                    label="Current Role / Status"
                    value={role}
                    onChange={handleRoleChange}
                    options={roleList}
                    placeholder="Enter current role or status"
                    icon={<Briefcase size={16} />}
                    allowCustom={true}
                    required={!isStudent}
                    customTypeLabel="role"
                    theme="dark"
                  />
                </div>

                {/* Current Company Name */}
                <div>
                  <SearchableSelect
                    label="Current Company Name"
                    value={isStudent ? 'N/A (Student)' : company}
                    onChange={(val) => setCompany(val)}
                    options={companyList}
                    placeholder={isStudent ? 'Not applicable for students' : 'Enter current company name'}
                    icon={<Building2 size={16} />}
                    allowCustom={!isStudent}
                    onAddCustom={(c) => directoryService.addCustomCompany(c)}
                    disabled={isStudent}
                    required={!isStudent}
                    customTypeLabel="company"
                    helperText={isStudent ? 'Disabled for student candidates' : 'Required for working professionals'}
                    theme="dark"
                  />
                </div>
              </div>
            </div>

            {/* 5. Two-Column Row: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  />
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-700'
                        }`}
                      ></div>
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-700'
                        }`}
                      ></div>
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-700'
                        }`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Bottom: Full-width Gradient Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Proceed to OTP Verification</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: Dual OTP Verification */}
        {step === 2 && pendingOtp && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-slate-800/50 border border-slate-700/70 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{name}</div>
                <div className="text-[11px] text-slate-400">{email} • {countryCode} {phone}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError('')
                }}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Edit Details</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Email OTP Field */}
              <div className="p-4 bg-slate-900/80 border border-slate-700/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                    <Mail size={14} className="text-indigo-400" />
                    <span>Email OTP Code (6 Digits)</span>
                  </label>
                  {emailVerified && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setEmailOtpInput(val)
                      if (val.length === 6) handleVerifyEmail(val)
                    }}
                    placeholder="Enter 6-digit email OTP"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    disabled={emailVerified}
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyEmail()}
                    disabled={emailVerified || emailOtpInput.length < 6}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                      emailVerified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 cursor-pointer'
                    }`}
                  >
                    {emailVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Mobile OTP Field */}
              <div className="p-4 bg-slate-900/80 border border-slate-700/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                    <Phone size={14} className="text-emerald-400" />
                    <span>Mobile SMS OTP (6 Digits)</span>
                  </label>
                  {mobileVerified && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setMobileOtpInput(val)
                      if (val.length === 6) handleVerifyMobile(val)
                    }}
                    placeholder="Enter 6-digit SMS OTP"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    disabled={mobileVerified}
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyMobile()}
                    disabled={mobileVerified || mobileOtpInput.length < 6}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                      mobileVerified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 cursor-pointer'
                    }`}
                  >
                    {mobileVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>

            {/* Resend Timer Row */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                <span>
                  OTP Expires in:{' '}
                  <strong className="font-mono text-slate-200">
                    {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                    {String(timerSeconds % 60).padStart(2, '0')}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend}
                className={`font-bold flex items-center gap-1 ${
                  canResend
                    ? 'text-indigo-400 hover:underline cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={13} className={!canResend ? 'opacity-50' : ''} />
                <span>Resend OTPs</span>
              </button>
            </div>

            {/* Final Complete Registration Action */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleCompleteRegistration}
                disabled={(!emailVerified && emailOtpInput !== pendingOtp?.emailOtp) || (!mobileVerified && mobileOtpInput !== pendingOtp?.mobileOtp) || loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Creating Account & Launching Portfolio...</span>
                  </span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                Upon registration, you will be redirected to the First-Time Portfolio Setup page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
