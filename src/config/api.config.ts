// Points at server/ (Node/Express + PostgreSQL) - the same backend every
// other service in this app calls. Default matches VITE_API_URL's own
// fallback elsewhere so this works out of the box with no .env needed.
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:4000/api'

// Socket.IO shares the same Express HTTP server, mounted at the origin root
// (not under /api) - derive it by stripping the API path suffix.
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '')
