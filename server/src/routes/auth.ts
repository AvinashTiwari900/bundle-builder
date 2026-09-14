import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signAuthToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE_MS } from '../lib/jwt'
import { requireAuth, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'
import { profileInclude, toProfileResponse } from './candidates'

const router = Router()

// 'localhost' is treated as a secure context by browsers, so Secure cookies
// work in dev too - no need to relax this for non-production.
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
  path: '/'
}

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  college: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  isStudent: z.boolean().optional(),
  headline: z.string().optional(),
  experienceYears: z.number().optional(),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional()
})

router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid registration data', details: parsed.error.flatten() })
  }
  const data = parsed.data
  const email = data.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, role: 'candidate' }
    })
    await tx.candidateProfile.create({
      data: {
        userId: created.id,
        name: data.name.trim(),
        phone: data.phone,
        headline: data.headline || data.role || '',
        location: '',
        college: data.college,
        company: data.company,
        role: data.role,
        isStudent: data.isStudent ?? false,
        experienceYears: data.experienceYears ?? 0,
        profilePhoto: data.profilePhoto,
        bio: data.bio,
        skills: data.skills ?? []
      }
    })
    return created
  })

  const token = signAuthToken({ sub: user.id, role: user.role })
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions)
  return res.status(201).json({ id: user.id, email: user.email, role: user.role, token })
}))

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  remember: z.boolean().optional()
})

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password' })
  }
  const email = parsed.data.email.toLowerCase()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!matches) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = signAuthToken({ sub: user.id, role: user.role })
  // remember=false issues a browser-session cookie (no maxAge) instead of a
  // persistent 7-day one, mirroring the "Remember this device" checkbox.
  const { maxAge, ...sessionCookieOptions } = cookieOptions
  res.cookie(AUTH_COOKIE_NAME, token, parsed.data.remember === false ? sessionCookieOptions : cookieOptions)
  return res.json({ id: user.id, email: user.email, role: user.role, token })
}))

router.get('/check-email', asyncHandler(async (req, res) => {
  const email = z.string().trim().email().safeParse(req.query.email)
  if (!email.success) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  const existing = await prisma.user.findUnique({ where: { email: email.data.toLowerCase() } })
  return res.json({ taken: !!existing })
}))

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' })
  return res.status(204).send()
})

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { candidateProfile: { include: profileInclude } }
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.candidateProfile ? toProfileResponse(user.candidateProfile) : null
    })
  })
)

const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  newPassword: z.string().min(8)
})

router.post('/reset-password', asyncHandler(async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email and new password (min 8 characters) required' })
  }
  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' })
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  })
  return res.json({ ok: true, message: 'Password updated successfully' })
}))

export default router
