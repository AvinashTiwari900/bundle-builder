const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

export const portfolioApiService = {
  async save(data: {
    name?: string
    headline?: string
    location?: string
    experienceYears?: number
    avatar?: string
    intro?: string
    about?: string
    skills?: string[]
    featuredProjects?: any[]
    socials?: Record<string, any>
  }) {
    try {
      const res = await apiFetch('/portfolio/me', { method: 'PUT', body: JSON.stringify(data) })
      if (res.ok) return await res.json()
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
    return null
  },

  // Also updates the core candidate profile fields shared with the rest of
  // the app (name/headline/location/experienceYears/skills/profilePhoto),
  // via the same endpoint the rest of the app uses for profile edits.
  async saveCoreProfile(data: Record<string, any>) {
    try {
      const res = await apiFetch('/candidates/me', { method: 'PUT', body: JSON.stringify(data) })
      if (res.ok) return await res.json()
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
    return null
  }
}
