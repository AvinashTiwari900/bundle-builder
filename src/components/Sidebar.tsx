import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
  Video,
  Phone,
  FileText,
  ShieldCheck,
  FolderGit2,
  Globe,
  Settings,
  LogOut,
  ChevronRight,
  MessageSquare,
  Radio,
  FileQuestion
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { profileService } from '../services/profileService'

export default function Sidebar() {
  const { logout } = useAuth()
  const nav = useNavigate()
  const profile = profileService.get()
  const name = profile?.name || 'Avinash Tiwari'
  const headline = profile?.headline || 'Lead Business Analyst'
  const avatar =
    profile?.profilePhoto ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Explore Jobs', icon: Briefcase },
    { to: '/applications', label: 'Applications', icon: Layers, badge: profile?.applications?.length },
    { to: '/posts', label: 'Posts & Feed', icon: MessageSquare, highlightBadge: 'NEW' },
    { to: '/meetings', label: 'Meetings & Records', icon: Video },
    { to: '/auto-apply', label: 'Auto Apply Engine', icon: Zap },
    { to: '/ai-agent', label: 'AI Career Copilot', icon: Sparkles, highlight: true },
    { to: '/interview-practice', label: 'Interview Studio', icon: Radio },
    { to: '/voice-screening', label: 'AI Voice Screening', icon: Phone },
    { to: '/resume', label: 'Resume & ATS', icon: FileText },
    { to: '/documents', label: 'Documents & KYC', icon: ShieldCheck },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/portfolio', label: 'Portfolio (Panel View)', icon: Globe },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand Header */}
      <div className="brand-box">
        <div className="brand-mark">
          <span>R</span>
        </div>
        <div>
          <div className="brand-name">RAS Candidate</div>
          <div className="brand-subtitle">Recruitment Automation</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" role="navigation" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${
                  item.highlight && !isActive
                    ? 'text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50'
                    : ''
                }`
              }
            >
              <Icon
                size={18}
                className={
                  item.highlight ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'
                }
              />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.highlightBadge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-md tracking-wider">
                  {item.highlightBadge}
                </span>
              )}
              {item.highlight && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md tracking-wider">
                  AI
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-footer">
        <div
          className="profile-mini group"
          onClick={() => nav('/profile')}
          title="Open your profile & privacy settings"
        >
          <img src={avatar} alt={name} className="shadow-xs" />
          <div className="flex-1 min-w-0">
            <strong className="block truncate text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
              {name}
            </strong>
            <div className="text-xs text-slate-500 truncate">{headline}</div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
