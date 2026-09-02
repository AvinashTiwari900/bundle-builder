import { Request, Response, NextFunction } from 'express'
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../lib/jwt'

export interface AuthedRequest extends Request {
  user?: { id: string; role: 'candidate' | 'recruiter' | 'admin' }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  try {
    const payload = verifyAuthToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export function requireRole(...roles: Array<'candidate' | 'recruiter' | 'admin'>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
