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
  ChevronLeft,
  MessageSquare,
  Radio
} from 'lucide-react'
import { useAuth } from '../context/auth'
import { profileService } from '../services/profileService'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
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
    { to: '/posts', label: 'Posts & Feed', icon: MessageSquare },
    { to: '/meetings', label: 'Meetings & Records', icon: Video },
    { to: '/auto-apply', label: 'Auto Apply Engine', icon: Zap },
    { to: '/ai-agent', label: 'AI Career Copilot', icon: Sparkles, aiBadge: true },
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
    <aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Main navigation"
    >
      {/* Brand Header */}
      <div className="brand-box">
        <button
          type="button"
          onClick={onToggle}
          title={isCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
          className="flex items-center gap-3 w-full text-left bg-transparent border-0 cursor-pointer group focus:outline-none"
        >
          <div className="brand-mark shrink-0 group-hover:scale-105 transition-transform" title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <span>G</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="min-w-0">
                <div className="brand-name truncate">Gettin</div>
                <div className="brand-subtitle truncate">Candidates</div>
              </div>
              <span
                className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </span>
            </div>
          )}
        </button>

        {isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" role="navigation" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={18} />
                {isCollapsed && ((item.badge !== undefined && item.badge > 0) || item.aiBadge) && (
                  <span
                    className={`absolute -top-1 -right-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                      item.aiBadge ? 'bg-purple-500' : 'bg-blue-600'
                    }`}
                  />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.aiBadge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md tracking-wider shrink-0">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-footer">
        <div
          className={`profile-mini group ${isCollapsed ? 'justify-center p-2' : ''}`}
          onClick={() => nav('/profile')}
          title={isCollapsed ? `${name} - Profile & Settings` : 'Open your profile & privacy settings'}
        >
          <img src={avatar} alt={name} className="shadow-xs shrink-0" />
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <strong className="block truncate text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                  {name}
                </strong>
                <div className="text-xs text-slate-500 truncate">{headline}</div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={`flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200 mt-1 ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
        >
          <LogOut size={15} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
