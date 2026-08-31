import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  UserMinus,
  MessageSquare,
  Building2,
  Award,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import { connectionService, ConnectionUser } from '../services/connectionService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ConnectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const nav = useNavigate()

  const [activeTab, setActiveTab] = useState<'my_connections' | 'requests' | 'discover'>('my_connections')
  const [connections, setConnections] = useState<ConnectionUser[]>([])
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [discoverPeople, setDiscoverPeople] = useState<ConnectionUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [toast, setToast] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const tabParam = searchParams.get('tab')
  useEffect(() => {
    if (tabParam === 'requests') setActiveTab('requests')
    else if (tabParam === 'discover') setActiveTab('discover')
    else setActiveTab('my_connections')
  }, [tabParam])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [conns, reqs, people] = await Promise.all([
        connectionService.getMyConnections(),
        connectionService.getRequests(),
        connectionService.discoverPeople(searchQuery, selectedSkill, selectedLocation)
      ])
      setConnections(conns)
      setIncomingRequests(reqs.incoming)
      setSentRequests(reqs.sent)
      setDiscoverPeople(people)
    } catch (e) {
      console.warn('Error loading connections:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [searchQuery, selectedSkill, selectedLocation])

  const handleTabChange = (tab: 'my_connections' | 'requests' | 'discover') => {
    setActiveTab(tab)
    setSearchParams(tab === 'my_connections' ? {} : { tab })
  }

  const handleSendRequest = async (targetUserId: string) => {
    const res = await connectionService.sendRequest(targetUserId)
    showToast(res.message || 'Connection request sent! 🚀')
    loadData()
  }

  const handleAcceptRequest = async (requestIdOrUserId: string) => {
    const res = await connectionService.acceptRequest(requestIdOrUserId)
    showToast(res.message || 'Connection accepted! 🎉')
    loadData()
  }

  const handleDeclineRequest = async (requestIdOrUserId: string) => {
    const res = await connectionService.declineRequest(requestIdOrUserId)
    showToast(res.message || 'Connection request declined.')
    loadData()
  }

  const handleCancelRequest = async (requestIdOrUserId: string) => {
    const res = await connectionService.cancelRequest(requestIdOrUserId)
    showToast(res.message || 'Request cancelled.')
    loadData()
  }

  const handleRemoveConnection = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      const res = await connectionService.removeConnection(userId)
      showToast(res.message || 'Connection removed.')
      loadData()
    }
  }

  const SKILL_FILTERS = ['all', 'SQL', 'Product Strategy', 'Go', 'Python', 'React', 'Kubernetes', 'TypeScript', 'Business Analysis']
  const LOCATION_FILTERS = ['all', 'Bengaluru', 'Ahmedabad', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi NCR']

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Professional Network & Connections
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Peer Circle
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connect with fellow candidates, verified hiring panels, product architects, and engineering peers
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase block">Connections</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{connections.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase block">Pending</span>
              <span className="text-base font-extrabold text-amber-500">{incomingRequests.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            onClick={() => handleTabChange('my_connections')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_connections'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={15} />
            <span>My Connections</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'my_connections' ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {connections.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('requests')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck size={15} />
            <span>Connection Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px] animate-pulse">
                {incomingRequests.length} new
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('discover')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserPlus size={15} />
            <span>Discover People</span>
          </button>
        </div>

        {/* Search & Filter Controls (For Discover / My Connections) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-6 relative">
            <Input
              icon={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, headline, skill (SQL, React, Python)..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">📍 All Locations</option>
              {LOCATION_FILTERS.slice(1).map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">⚡ All Skills</option>
              {SKILL_FILTERS.slice(1).map((sk) => (
                <option key={sk} value={sk}>
                  ⚡ {sk}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: MY CONNECTIONS */}
      {activeTab === 'my_connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {connections.length} Connected Professional{connections.length === 1 ? '' : 's'}
            </span>
          </div>

          {connections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Users size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">No connections yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Discover peer candidates, architects, and product leads to build your professional network.
              </p>
              <Button variant="primary" size="sm" onClick={() => handleTabChange('discover')} className="font-bold">
                <UserPlus size={14} />
                <span>Discover Professionals</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((user) => (
                <div
                  key={user.userId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => nav(`/network/user/${user.userId}`)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
                        >
                          {user.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                          {user.headline}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{user.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills preview */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(user.skills || []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => nav(`/network/user/${user.userId}`)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => handleRemoveConnection(user.userId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Remove Connection"
                    >
                      <UserMinus size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={15} className="text-emerald-500" />
                <span>Incoming Connection Invitations ({incomingRequests.length})</span>
              </span>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400">
                No incoming connection requests at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={req.requester?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                        alt={req.requester?.name}
                        className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => nav(`/network/user/${req.requester?.userId}`)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
                        >
                          {req.requester?.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                          {req.requester?.headline}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate">{req.requester?.location}</span>
                          <span>•</span>
                          <span>{req.requester?.totalExperienceYears || 5} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineRequest(req.requestId)}
                        className="text-xs text-slate-500 hover:text-rose-500 font-semibold"
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptRequest(req.requestId)}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500"
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept & Connect</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-amber-500" />
                <span>Pending Sent Requests ({sentRequests.length})</span>
              </span>
            </div>

            {sentRequests.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400">
                No outgoing pending connection requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={req.recipient?.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                        alt={req.recipient?.name}
                        className="w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {req.recipient?.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {req.recipient?.headline}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(req.requestId)}
                      className="text-xs text-slate-500 hover:text-rose-500 font-semibold shrink-0"
                    >
                      <span>Cancel Request</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVER PEOPLE */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recommended Professionals Matching Your Stack
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverPeople.map((user) => {
              const isConnected = user.connectionStatus === 'connected'
              const isPendingSent = user.connectionStatus === 'pending_sent'
              const isPendingReceived = user.connectionStatus === 'pending_received'

              return (
                <div
                  key={user.userId}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={user.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => nav(`/network/user/${user.userId}`)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate"
                        >
                          {user.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                          {user.headline}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <MapPin size={11} />
                          <span>{user.location}</span>
                          <span>•</span>
                          <span>{user.totalExperienceYears || 6} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    {user.bio && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>
                    )}

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(user.skills || []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => nav(`/network/user/${user.userId}`)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      View Full Profile
                    </button>

                    {isConnected ? (
                      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Connected</span>
                      </span>
                    ) : isPendingSent ? (
                      <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Clock size={13} />
                        <span>Request Sent</span>
                      </span>
                    ) : isPendingReceived ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptRequest(user.userId)}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500"
                      >
                        <CheckCircle2 size={13} />
                        <span>Accept</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendRequest(user.userId)}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500"
                      >
                        <UserPlus size={13} />
                        <span>Connect</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
