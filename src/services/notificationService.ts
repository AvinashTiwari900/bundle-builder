const KEY = 'rap_notifications'

export const notificationService = {
  list(){
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  },
  create(payload:any){
    const all = this.list()
    const n = { id: 'n-'+Date.now(), read: false, createdAt: new Date().toISOString(), ...payload }
    all.unshift(n)
    localStorage.setItem(KEY, JSON.stringify(all))
    // also attach to profile
    try{
      const pRaw = localStorage.getItem('rap_profile')
      if(pRaw){ const p = JSON.parse(pRaw); p.notifications = p.notifications||[]; p.notifications.unshift(n); localStorage.setItem('rap_profile', JSON.stringify(p)) }
    }catch{}
    return n
  },
  markRead(id:string){
    const all = this.list().map((n:any)=> n.id===id? {...n,read:true}:n)
    localStorage.setItem(KEY, JSON.stringify(all))
  },
  markAllRead(){
    const all = this.list().map((n:any)=> ({...n,read:true}))
    localStorage.setItem(KEY, JSON.stringify(all))
  },
  delete(id:string){
    const all = this.list().filter((n:any)=>n.id!==id)
    localStorage.setItem(KEY, JSON.stringify(all))
  }
}
