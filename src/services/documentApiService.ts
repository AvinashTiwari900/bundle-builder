const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
}

export const documentApiService = {
  async list() {
    try {
      const res = await apiFetch('/documents/me')
      if (res.ok) return await res.json()
    } catch {
      /* backend unreachable - caller falls back to local cache */
    }
    return null
  },

  async create(data: {
    name: string
    type: string
    status?: string
    aiConfidence?: number
    extractedName?: string
    extractedIdNumber?: string
    cloudinaryUrl?: string
    cloudinaryPublicId?: string
  }) {
    const res = await apiFetch('/documents', { method: 'POST', body: JSON.stringify(data) })
    if (!res.ok) throw new Error('Failed to save document record')
    return await res.json()
  },

  async updateStatus(id: string, status: string) {
    try {
      const res = await apiFetch(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      if (res.ok) return await res.json()
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
    return null
  },

  async remove(id: string) {
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' })
    } catch {
      /* best-effort - local cache already updated by the caller */
    }
  }
}
