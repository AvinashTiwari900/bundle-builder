const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

export const resumeApiService = {
  async list() {
    try {
      const res = await apiFetch('/resumes/me')
      if (res.ok) return await res.json()
    } catch {
      /* backend unreachable - caller falls back to local cache */
    }
    return null
  },

  async create(data: {
    name: string
    size?: number
    isPrimary?: boolean
    atsScore?: number
    cloudinaryUrl?: string
    cloudinaryPublicId?: string
  }) {
    const res = await apiFetch('/resumes', { method: 'POST', body: JSON.stringify(data) })
    if (!res.ok) throw new Error('Failed to save resume record')
    return await res.json()
  },

  async setPrimary(id: string) {
    try {
      const res = await apiFetch(`/resumes/${id}/primary`, { method: 'PUT' })
      if (res.ok) return await res.json()
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
    return null
  },

  async remove(id: string) {
    try {
      await apiFetch(`/resumes/${id}`, { method: 'DELETE' })
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
  }
}
