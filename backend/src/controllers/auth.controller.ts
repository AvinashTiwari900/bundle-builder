import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { applyPrivacyShield } from '../middlewares/privacyShield.middleware'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' })
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' })
    }

    const userId = uuidv4()
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = {
      id: userId,
      email,
      name,
      passwordHash,
      role: 'candidate' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.users.push(newUser)

    // Create default profile
    const newProfile = {
      id: uuidv4(),
      userId,
      name,
      email,
      phone: '',
      headline: 'Candidate',
      bio: '',
      location: 'India',
      totalExperienceYears: 0,
      currentSalaryLPA: 0,
      expectedSalaryLPA: 0,
      noticePeriodDays: 0,
      skills: [],
      tools: [],
      languages: [],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      atsScore: 75,
      contactPrivacyMask: true,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.profiles.push(newProfile)

    const secret = process.env.JWT_SECRET || 'gettin_candidates_jwt_super_secret_key_2026'
    const token = jwt.sign({ userId, email, role: 'candidate' }, secret, { expiresIn: '7d' })

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: userId, email, name, role: 'candidate' },
      profile: newProfile
    })
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }

    const profile = db.profiles.find((p) => p.userId === user.id)
    const secret = process.env.JWT_SECRET || 'gettin_candidates_jwt_super_secret_key_2026'
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' })

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile
    })
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    const isCandidateSelf = req.user?.userId === profile.userId
    const securedProfile = applyPrivacyShield(profile, isCandidateSelf)

    return res.status(200).json({
      success: true,
      profile: securedProfile
    })
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profileIndex = db.profiles.findIndex((p) => p.userId === userId)

    if (profileIndex === -1) {
      return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    const { name, email, ...rest } = req.body

    // Sync name in user table if changed
    if (name) {
      const user = db.users.find((u) => u.id === userId)
      if (user) user.name = name
    }

    db.profiles[profileIndex] = {
      ...db.profiles[profileIndex],
      ...rest,
      name: name || db.profiles[profileIndex].name,
      email: email || db.profiles[profileIndex].email,
      updatedAt: new Date().toISOString()
    }

    return res.status(200).json({
      success: true,
      message: 'Candidate Profile & Career Details saved successfully! 🎉',
      profile: db.profiles[profileIndex]
    })
  }

  static async togglePrivacyShield(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId || 'usr-candidate-default-01'
    const profile = db.profiles.find((p) => p.userId === userId)

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' })
    }

    profile.contactPrivacyMask = !profile.contactPrivacyMask
    profile.updatedAt = new Date().toISOString()

    return res.status(200).json({
      success: true,
      message: `Contact Privacy Shield ${profile.contactPrivacyMask ? 'Enabled' : 'Disabled'}.`,
      contactPrivacyMask: profile.contactPrivacyMask
    })
  }
}
