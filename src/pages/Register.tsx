import React, { useState } from 'react'
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
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { authService } from '../services/authService'
import { directoryService, COUNTRY_CODES } from '../mock/directoryData'
import SearchableSelect from '../components/ui/SearchableSelect'

export default function RegisterPage() {
  // Form State
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

  // Status
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

  // Direct Registration Action (No OTP required)
  const handleRegister = async (e: React.FormEvent) => {
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
    if (await authService.isEmailTaken(email.trim())) {
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

    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
        countryCode,
        college: college.trim(),
        company: isStudent ? undefined : company.trim(),
        role: isStudent ? 'Student' : (role.trim() || 'Professional'),
        isStudent,
        password
      })

      // Redirect first-time registered candidate to Portfolio Setup page
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

          {/* Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs font-bold text-slate-300 shrink-0">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Instant Access</span>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-2xl font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4" aria-label="Create Candidate Account Form">
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
              <p className="text-[11px] text-slate-400 mt-1">Used for interview invites & application status updates.</p>
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
              <p className="text-[11px] text-slate-400 mt-1">Used for recruiter notifications & screening.</p>
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

          {/* Direct Submit Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Creating Account & Setting Up Profile...</span>
                </span>
              ) : (
                <>
                  <span>Create Candidate Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
