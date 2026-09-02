import { seedData } from '../mock/seed'

export const profileService = {
  get() {
    const raw = localStorage.getItem('ras_profile')
    if (!raw) {
      seedData()
      const after = localStorage.getItem('ras_profile')
      return after ? JSON.parse(after) : null
    }
    try {
      return JSON.parse(raw)
    } catch {
      seedData(true)
      const after = localStorage.getItem('ras_profile')
      return after ? JSON.parse(after) : null
    }
  },

  save(profile: any) {
    localStorage.setItem('ras_profile', JSON.stringify(profile))
    return profile
  },

  update(partial: any) {
    const current = this.get() || {}
    const updated = { ...current, ...partial }
    this.save(updated)
    return updated
  }
}
