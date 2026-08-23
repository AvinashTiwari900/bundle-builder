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
      return JSON.parse(raw)
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
