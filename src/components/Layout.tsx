import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sparkles, User, X, CheckCircle2, ChevronDown } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { profileService } from '../services/profileService'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    setNotifications(notificationService.list())
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const profile = profileService.get()
  const name = profile?.name || 'Avinash Tiwari'
  const avatar =
    profile?.profilePhoto ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      nav(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const markAllRead = () => {
    notificationService.markAllRead()
    setNotifications(notificationService.list())
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-panel">
        {/* Topbar */}
        <header className="topbar" role="banner">
          {/* Global Search Bar */}
          <div className="search-wrap">
            <Search size={17} className="text-slate-400 shrink-0" />
            <input
              id="global-search"
              aria-label="Search jobs, skills, companies"
              placeholder="Search jobs, skills, companies (Press Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Actions on right */}
          <div className="topbar-actions relative">
            {/* Notifications Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="icon-btn"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-84 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Bell size={15} className="text-blue-600" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            !n.read ? 'bg-blue-50/70 border border-blue-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-800">{n.title}</div>
                          <div className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifications(false)
                      nav('/notifications')
                    }}
                    className="w-full mt-3 py-2 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    View All Notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar Pill */}
            <button
              onClick={() => nav('/profile')}
              className="user-pill"
              aria-label="Open profile"
            >
              <img src={avatar} alt="avatar" />
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {name.split(' ')[0]}
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Active
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="content" role="main">
          {children}
        </main>

        {/* Floating AI Copilot Trigger */}
        <button
          onClick={() => nav('/ai-agent')}
          title="Ask RAP AI Copilot"
          className="floating-ai-btn group"
        >
          <Sparkles size={18} className="animate-spin-slow text-amber-300" />
          <span>Ask AI Copilot</span>
        </button>
      </div>
    </div>
  )
}
