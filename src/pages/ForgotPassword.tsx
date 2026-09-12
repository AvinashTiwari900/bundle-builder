import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { authService } from '../services/authService'

type ResetStep = 'email' | 'otp' | 'new_password' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status & Feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const nav = useNavigate()

  useEffect(() => {
    let timer: any
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-slate-700' }
    let score = 0
    if (newPassword.length >= 8) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2 || score === 3) return { score: 2, label: 'Good', color: 'bg-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' }
  }

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfoMessage('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      return setError('Please enter your registered email address.')
    }

    setLoading(true)
    try {
      const res = authService.sendPasswordResetOtp(cleanEmail)
      setDevOtp(res.otp)
      setInfoMessage(`Verification code sent to ${cleanEmail}.`)
      setResendCooldown(60)
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery code. Please check your email.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanOtp = otp.trim()
    if (!cleanOtp || cleanOtp.length < 6) {
      return setError('Please enter the 6-digit verification code.')
    }

    setLoading(true)
    try {
      authService.verifyPasswordResetOtp(email.trim().toLowerCase(), cleanOtp)
      setStep('new_password')
      setError('')
      setInfoMessage('Code verified! Enter your new password below.')
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.')
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match. Please re-enter confirm password.')
    }

    setLoading(true)
    try {
      const cleanEmail = email.trim().toLowerCase()
      await authService.resetPassword(cleanEmail, newPassword, otp.trim())
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = () => {
    if (resendCooldown > 0) return
    setError('')
    try {
      const res = authService.sendPasswordResetOtp(email.trim().toLowerCase())
      setDevOtp(res.otp)
      setInfoMessage(`New verification code sent to ${email.trim().toLowerCase()}.`)
      setResendCooldown(60)
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.')
    }
  }

  const pwdStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-9 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                GetNextIn Candidates Account Recovery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-[11px] font-bold text-slate-300">
            <Sparkles size={12} className="text-indigo-400" />
            <span>Secure</span>
          </div>
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="flex items-center justify-between mb-6 px-2">
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 'email' ? 'text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
              <span>Email</span>
            </div>
            <div className="w-8 h-[1px] bg-slate-800"></div>
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 'otp' ? 'text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'otp' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span>Verify</span>
            </div>
            <div className="w-8 h-[1px] bg-slate-800"></div>
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 'new_password' ? 'text-indigo-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'new_password' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
              <span>Reset</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-2xl font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Info Message */}
        {infoMessage && !error && (
          <div className="mb-5 p-3.5 bg-indigo-950/50 border border-indigo-800/80 text-indigo-300 text-xs rounded-2xl font-medium flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-indigo-400" />
            <div className="flex-1">{infoMessage}</div>
          </div>
        )}

        {/* Dev OTP Helper Badge */}
        {devOtp && step === 'otp' && (
          <div className="mb-5 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Simulated OTP Code: <strong className="font-mono text-emerald-200 tracking-wider text-sm">{devOtp}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setOtp(devOtp)}
              className="text-[11px] underline hover:text-emerald-200 cursor-pointer font-semibold"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Registered Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. avinashtiwari@gmail.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We'll send a 6-digit verification code to reset your account password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold disabled:text-slate-600 disabled:no-underline cursor-pointer"
                >
                  <RefreshCw size={12} className={resendCooldown > 0 ? 'animate-spin' : ''} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-center text-xl tracking-[0.5em] font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                Check your inbox for the code sent to <strong className="text-slate-300">{email}</strong>
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 'new_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Password strength bar */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Password Strength:</span>
                    <span className={pwdStrength.score === 3 ? 'text-emerald-400' : pwdStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'}>
                      {pwdStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-800'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-800'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-800'}`}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
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
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/70 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Password Reset Successful!</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Your password has been securely updated. You can now sign in to your GetNextIn Candidates account.
              </p>
            </div>
            <div className="pt-3">
              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/25 inline-flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== 'success' && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Candidate Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
