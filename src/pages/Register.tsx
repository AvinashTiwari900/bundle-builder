import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  UserPlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  Send,
  Sparkle
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { authService, PendingOtpData } from '../services/authService'
import { directoryService, COUNTRY_CODES } from '../mock/directoryData'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
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
  const [role, setRole] = useState('Lead Business Analyst & Product Strategist')
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
      setRole('Business Analyst')
    }
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200' }
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
      return setError('Please enter a valid email address format (e.g. name@domain.com).')
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
    if (!role.trim()) {
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

  // 1-Click Auto Fill Demo OTPs helper for smooth testing
  const handleAutoFillDemoOtps = () => {
    if (!pendingOtp) return
    setEmailOtpInput(pendingOtp.emailOtp)
    setMobileOtpInput(pendingOtp.mobileOtp)
    setEmailVerified(true)
    setMobileVerified(true)
    setError('')
  }

  // Complete Registration Final Action
  const handleCompleteRegistration = async () => {
    setError('')
    if (!emailVerified || !mobileVerified) {
      return setError('Please verify both Email OTP and Mobile OTP before completing registration.')
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
        role: isStudent ? 'Student' : role.trim(),
        isStudent,
        password
      })

      // Immediately redirect first-time registered candidate to Portfolio Setup page
      nav('/portfolio-setup')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pwdStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding & Steps */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/25">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create Candidate Account
              </h2>
              <p className="text-xs text-slate-500">
                AI-Powered Career & Recruitment Acceleration Platform
              </p>
            </div>
          </div>

          {/* Stepper Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 1 ? '1' : '✓'}
            </span>
            <span>{step === 1 ? 'Account Details' : 'OTP Verification'}</span>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleProceedToOtp} className="space-y-4" aria-label="Register Step 1">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Name, Middle Name, Last Name (e.g. Avinash Tiwari)"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your official legal name as shown on KYC certificates.
              </p>
            </div>

            {/* 2. Email Address & 3. Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@domain.com"
                  icon={<Mail size={15} />}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">An email OTP will be sent here.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.country} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    icon={<Phone size={15} />}
                    className="flex-1"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">An SMS OTP will be sent here.</p>
              </div>
            </div>

            {/* 4. College Name (Searchable dropdown with custom entry) */}
            <div>
              <SearchableSelect
                label="College / University Name"
                value={college}
                onChange={(val) => setCollege(val)}
                options={collegeList}
                placeholder="Search college or type custom institution..."
                icon={<GraduationCap size={16} />}
                allowCustom={true}
                onAddCustom={(customCollege) => directoryService.addCustomCollege(customCollege)}
                required={true}
                customTypeLabel="college"
                helperText="Select from top universities or type and press enter to add custom."
              />
            </div>

            {/* Student Toggle & Role Selection */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Are you currently a student?</span>
                  <p className="text-[11px] text-slate-500">
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
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                {/* 6. Role */}
                <div>
                  <SearchableSelect
                    label="Current Role / Status"
                    value={role}
                    onChange={handleRoleChange}
                    options={roleList}
                    placeholder="Select or enter job role..."
                    icon={<Briefcase size={16} />}
                    allowCustom={true}
                    required={true}
                    customTypeLabel="role"
                  />
                </div>

                {/* 5. Company Name (Optional for students) */}
                <div>
                  <SearchableSelect
                    label="Current Company Name"
                    value={isStudent ? 'N/A (Student)' : company}
                    onChange={(val) => setCompany(val)}
                    options={companyList}
                    placeholder={isStudent ? 'Not applicable for students' : 'Search or enter company...'}
                    icon={<Building2 size={16} />}
                    allowCustom={!isStudent}
                    onAddCustom={(c) => directoryService.addCustomCompany(c)}
                    disabled={isStudent}
                    required={!isStudent}
                    customTypeLabel="company"
                    helperText={isStudent ? 'Disabled for student candidates' : 'Required for working professionals'}
                  />
                </div>
              </div>
            </div>

            {/* 7. Password & 8. Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, e.g. Pass@123"
                  icon={<Lock size={15} />}
                  required
                />
                {/* Strength Meter */}
                {password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`h-full flex-1 rounded-full transition-all ${
                          pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'
                        }`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  icon={<Lock size={15} />}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button type="submit" size="lg" className="w-full font-bold">
                <span>Proceed to OTP Verification</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Dual OTP Verification Screen */}
        {step === 2 && pendingOtp && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Candidate Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900">{name} ({role})</div>
                <div className="text-slate-600 flex items-center gap-2">
                  <span>✉️ {email}</span>
                  <span>·</span>
                  <span>📱 {countryCode} {phone}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Edit Info</span>
              </button>
            </div>

            {/* Live Interactive OTP Simulation Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-800">
                  <Sparkle size={15} className="text-blue-600 animate-spin" />
                  <span>Dual OTP Simulator (Live Delivery)</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemoOtps}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>⚡ 1-Click Auto-Fill OTPs</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600">
                In production, these codes are dispatched via AWS SES & Twilio SMS. For this interactive demo, enter the matching codes below:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-white/80 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">
                    Email OTP
                  </span>
                  <span className="text-blue-700 font-extrabold text-sm tracking-wider">
                    {pendingOtp.emailOtp}
                  </span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">
                    Mobile OTP
                  </span>
                  <span className="text-purple-700 font-extrabold text-sm tracking-wider">
                    {pendingOtp.mobileOtp}
                  </span>
                </div>
              </div>
            </div>

            {/* OTP Inputs Grid */}
            <div className="space-y-4">
              {/* 1. Email OTP Field */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Mail size={15} className="text-blue-600" />
                    <span>Email OTP Code (6 Digits)</span>
                  </label>
                  {emailVerified ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Pending Entry</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.trim()
                      setEmailOtpInput(val)
                      if (val.length === 6 && val === pendingOtp.emailOtp) {
                        handleVerifyEmail(val)
                      }
                    }}
                    placeholder="Enter 6-digit email OTP"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    disabled={emailVerified}
                  />
                  <Button
                    type="button"
                    variant={emailVerified ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => handleVerifyEmail()}
                    disabled={emailVerified || emailOtpInput.length < 6}
                    className="font-bold text-xs"
                  >
                    {emailVerified ? 'Verified' : 'Verify Email'}
                  </Button>
                </div>
              </div>

              {/* 2. Mobile OTP Field */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Phone size={15} className="text-purple-600" />
                    <span>Mobile SMS OTP Code (6 Digits)</span>
                  </label>
                  {mobileVerified ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Pending Entry</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtpInput}
                    onChange={(e) => {
                      const val = e.target.value.trim()
                      setMobileOtpInput(val)
                      if (val.length === 6 && val === pendingOtp.mobileOtp) {
                        handleVerifyMobile(val)
                      }
                    }}
                    placeholder="Enter 6-digit mobile OTP"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500"
                    disabled={mobileVerified}
                  />
                  <Button
                    type="button"
                    variant={mobileVerified ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => handleVerifyMobile()}
                    disabled={mobileVerified || mobileOtpInput.length < 6}
                    className="font-bold text-xs"
                  >
                    {mobileVerified ? 'Verified' : 'Verify Mobile'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Resend Timer Row */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                <span>
                  OTP Expires in:{' '}
                  <strong className="font-mono text-slate-700">
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
                    ? 'text-blue-600 hover:underline cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={13} className={!canResend ? 'opacity-50' : ''} />
                <span>Resend OTPs</span>
              </button>
            </div>

            {/* Final Complete Registration Action */}
            <div className="pt-3">
              <Button
                type="button"
                size="lg"
                onClick={handleCompleteRegistration}
                disabled={!emailVerified || !mobileVerified || loading}
                className="w-full font-bold shadow-lg shadow-blue-500/25"
              >
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </Button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Upon registration, you will be redirected to the First-Time Portfolio Setup page.
              </p>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Already have a candidate account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  )
}
