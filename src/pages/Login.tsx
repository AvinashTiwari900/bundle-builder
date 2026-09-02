import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Eye, EyeOff, ShieldCheck, Zap, Bot } from 'lucide-react'
import { authService, DEMO_CREDENTIALS } from '../services/authService'
import { useAuth } from '../context/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    authService.init()
  }, [])

  const handleQuickDemo = async () => {
    setError('')
    setLoading(true)
    try {
      await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, true)
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, remember)
      nav('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please use the Quick Demo Login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative z-10">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white relative">
          <div>
            {/* Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-xl text-white shadow-inner">
                R
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">RAS Candidate</h1>
                <p className="text-xs text-blue-100 font-medium">AI Career Acceleration Platform</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Land your dream job with AI by your side.
            </h2>
            <p className="text-sm text-blue-100 mb-8 leading-relaxed">
              Supercharge your job hunt with real-time ATS scoring, AI mock interviews, and automated matching.
            </p>

            {/* Value Props */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">94% ATS Match Optimization</h4>
                  <p className="text-xs text-blue-100">Tailored keyword analysis for recruiter screening</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={15} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">1-Click Auto-Apply Engine</h4>
                  <p className="text-xs text-blue-100">Instantly match and submit to top-tier tech roles</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">AI Mock Interview Studio</h4>
                  <p className="text-xs text-blue-100">Real-time feedback on Technical & Behavioral rounds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-2 text-xs text-blue-100">
            <ShieldCheck size={16} className="text-emerald-300" />
            <span>Pre-seeded with candidate demo profile</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-10 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h3>
            <p className="text-sm text-slate-500 mt-1">Sign in to your candidate portal</p>
          </div>

          {/* Quick Demo Login Hero Action */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full mb-5 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles size={17} className="text-amber-300" />
            <span>⚡ Quick Demo Login (Avinash Tiwari)</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">
              Or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-slate-400">Demo password pre-filled</span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full text-slate-800 font-bold hover:bg-slate-50"
              disabled={loading}
            >
              <span>Continue with credentials</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create Candidate Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
