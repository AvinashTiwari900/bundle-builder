const KEY = 'ras_notifications'
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

export const notificationService = {
  list(){
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  },

  // Refreshes the local cache from the backend (source of truth).
  async sync(){
    try {
      const res = await apiFetch('/notifications/me')
      if (res.ok) {
        const notifications = await res.json()
        localStorage.setItem(KEY, JSON.stringify(notifications))
        try {
          const pRaw = localStorage.getItem('ras_profile')
          if (pRaw) {
            const p = JSON.parse(pRaw)
            p.notifications = notifications
            localStorage.setItem('ras_profile', JSON.stringify(p))
          }
        } catch { /* ignore - profile cache stays stale, non-fatal */ }
        return notifications
      }
    } catch { /* backend unreachable - fall back to local cache below */ }
    return this.list()
  },

  create(payload:any){
    const all = this.list()
    const n = { id: 'n-'+Date.now(), read: false, createdAt: new Date().toISOString(), ...payload }
    all.unshift(n)
    localStorage.setItem(KEY, JSON.stringify(all))
    // also attach to profile
    try{
      const pRaw = localStorage.getItem('ras_profile')
      if(pRaw){ const p = JSON.parse(pRaw); p.notifications = p.notifications||[]; p.notifications.unshift(n); localStorage.setItem('ras_profile', JSON.stringify(p)) }
    }catch(e){ console.warn('Failed to attach notification to profile', e) }

    apiFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify({ title: n.title, message: n.message, type: n.type })
    }).catch(() => {})

    return n
  },
  addNotification(payload: any) {
    return this.create(payload)
  },
  markRead(id:string){
    const all = this.list().map((n:any)=> n.id===id? {...n,read:true}:n)
    localStorage.setItem(KEY, JSON.stringify(all))
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
  },
  markAllRead(){
    const all = this.list().map((n:any)=> ({...n,read:true}))
    localStorage.setItem(KEY, JSON.stringify(all))
    apiFetch('/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  },
  delete(id:string){
    const all = this.list().filter((n:any)=>n.id!==id)
    localStorage.setItem(KEY, JSON.stringify(all))
    apiFetch(`/notifications/${id}`, { method: 'DELETE' }).catch(() => {})
  }
}
