import React, { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  Sparkles,
  Trash2,
  Check,
  Clock
} from 'lucide-react'
import { notificationService } from '../services/notificationService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function NotificationsPage() {
  const [list, setList] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setList(notificationService.list())
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleMarkAllRead = () => {
    notificationService.markAllRead()
    setList(notificationService.list())
    showToast('All notifications marked as read')
  }

  const handleDelete = (id: string) => {
    notificationService.delete(id)
    setList(notificationService.list())
    showToast('Notification removed')
  }

  const displayedList = list.filter((n) => (filter === 'unread' ? !n.read : true))

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recruiter communications, scheduled interviews, and AI match alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              All ({list.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Unread ({list.filter((n) => !n.read).length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={list.every((n) => n.read)}
            className="text-xs font-bold"
          >
            <Check size={14} />
            <span>Mark all read</span>
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <Bell size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No notifications in this view</h4>
            <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          displayedList.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex items-start justify-between gap-4 ${
                !item.read ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
                    item.type === 'interview'
                      ? 'bg-amber-100 text-amber-700'
                      : item.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.type === 'interview' ? (
                    <Calendar size={18} />
                  ) : item.type === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.message}
                  </p>
                  <div className="text-[10px] text-slate-400 font-semibold pt-1 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
