import { seedData } from '../mock/seed'

export const profileService = {
  get() {
    const raw = localStorage.getItem('rap_profile')
    if (!raw) {
      seedData()
      const after = localStorage.getItem('rap_profile')
      return after ? JSON.parse(after) : null
    }
    try {
      const parsed = JSON.parse(raw)
      if (parsed) {
        parsed.socials = parsed.socials || {}
        if (!parsed.socials.github || parsed.socials.github.includes('avinash-tiwari') || parsed.socials.github.includes('candidate')) {
          parsed.socials.github = 'https://github.com/AvinashTiwari900'
        }
      }
      return parsed
    } catch {
      seedData(true)
      return JSON.parse(localStorage.getItem('rap_profile')!)
    }
  },

  save(profile: any) {
    localStorage.setItem('rap_profile', JSON.stringify(profile))
    return profile
  },

  update(partial: any) {
    const current = this.get() || {}
    const updated = { ...current, ...partial }
    this.save(updated)
    return updated
  }
}
