const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

export const projectApiService = {
  async list() {
    try {
      const res = await apiFetch('/projects/me')
      if (res.ok) return await res.json()
    } catch {
      /* backend unreachable - caller falls back to local cache */
    }
    return null
  },

  async create(data: {
    name: string
    role?: string
    duration?: string
    description?: string
    responsibilities?: string
    outcomes?: string
    technologies?: string[]
    link?: string
    githubUrl?: string
  }) {
    const res = await apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) })
    if (!res.ok) throw new Error('Failed to save project')
    return await res.json()
  },

  async remove(id: string) {
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' })
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
  }
}
