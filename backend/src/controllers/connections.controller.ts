import { Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Connection, CandidateProfile } from '../models/types'
import { maskEmail, maskPhone } from '../middlewares/privacyShield.middleware'
import { v4 as uuidv4 } from 'uuid'

export class ConnectionsController {
  // 1. Get My Accepted Connections
  static async getMyConnections(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    const acceptedConns = db.connections.filter(
      (c) =>
        c.status === 'accepted' &&
        (c.requesterId === currentUserId || c.recipientId === currentUserId)
    )

    const connectedUserIds = acceptedConns.map((c) =>
      c.requesterId === currentUserId ? c.recipientId : c.requesterId
    )

    const connectionProfiles = connectedUserIds
      .map((uid) => {
        const p = db.profiles.find((prof) => prof.userId === uid)
        if (!p) return null
        const connRecord = acceptedConns.find(
          (c) =>
            (c.requesterId === currentUserId && c.recipientId === uid) ||
            (c.recipientId === currentUserId && c.requesterId === uid)
        )
        return {
          ...p,
          email: p.privacySettings?.showEmailToConnections ? p.email : maskEmail(p.email),
          phone: p.privacySettings?.showPhoneToConnections ? p.phone : maskPhone(p.phone),
          connectionId: connRecord?.id,
          connectedSince: connRecord?.updatedAt || connRecord?.createdAt,
          postsCount: db.posts.filter((post) => post.authorId === uid).length
        }
      })
      .filter(Boolean)

    return res.status(200).json({
      success: true,
      count: connectionProfiles.length,
      connections: connectionProfiles
    })
  }

  // 2. Get Connection Requests (Incoming & Sent)
  static async getRequests(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'

    // Incoming requests (someone sent to me)
    const incomingConns = db.connections.filter(
      (c) => c.recipientId === currentUserId && c.status === 'pending'
    )

    const incoming = incomingConns
      .map((c) => {
        const requesterProfile = db.profiles.find((p) => p.userId === c.requesterId)
        if (!requesterProfile) return null
        return {
          requestId: c.id,
          createdAt: c.createdAt,
          requester: {
            userId: requesterProfile.userId,
            name: requesterProfile.name,
            headline: requesterProfile.headline,
            location: requesterProfile.location,
            profilePhoto: requesterProfile.profilePhoto,
            skills: requesterProfile.skills?.slice(0, 4) || [],
            totalExperienceYears: requesterProfile.totalExperienceYears
          }
        }
      })
      .filter(Boolean)

    // Sent requests (I sent to someone)
    const sentConns = db.connections.filter(
      (c) => c.requesterId === currentUserId && c.status === 'pending'
    )

    const sent = sentConns
      .map((c) => {
        const recipientProfile = db.profiles.find((p) => p.userId === c.recipientId)
        if (!recipientProfile) return null
        return {
          requestId: c.id,
          createdAt: c.createdAt,
          recipient: {
            userId: recipientProfile.userId,
            name: recipientProfile.name,
            headline: recipientProfile.headline,
            location: recipientProfile.location,
            profilePhoto: recipientProfile.profilePhoto,
            skills: recipientProfile.skills?.slice(0, 4) || []
          }
        }
      })
      .filter(Boolean)

    return res.status(200).json({
      success: true,
      incomingCount: incoming.length,
      sentCount: sent.length,
      incoming,
      sent
    })
  }

  // 3. Send Connection Request
  static async sendRequest(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { targetUserId } = req.body

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required.' })
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' })
    }

    const targetProfile = db.profiles.find((p) => p.userId === targetUserId)
    if (!targetProfile) {
      return res.status(404).json({ success: false, message: 'Target professional profile not found.' })
    }

    // Check for existing connection/request
    const existing = db.connections.find(
      (c) =>
        (c.requesterId === currentUserId && c.recipientId === targetUserId) ||
        (c.requesterId === targetUserId && c.recipientId === currentUserId)
    )

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(409).json({ success: false, message: 'You are already connected with this user.' })
      }
      if (existing.status === 'pending') {
        if (existing.requesterId === currentUserId) {
          return res.status(409).json({ success: false, message: 'Connection request is already pending.' })
        } else {
          // If the other user already sent a request, auto-accept
          existing.status = 'accepted'
          existing.updatedAt = new Date().toISOString()
          return res.status(200).json({
            success: true,
            message: `Connection request accepted! You are now connected with ${targetProfile.name}.`,
            status: 'connected',
            connection: existing
          })
        }
      }
    }

    const newConnection: Connection = {
      id: `conn-${uuidv4().slice(0, 8)}`,
      requesterId: currentUserId,
      recipientId: targetUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.connections.push(newConnection)

    return res.status(201).json({
      success: true,
      message: `Connection request sent to ${targetProfile.name}!`,
      status: 'pending_sent',
      connection: newConnection
    })
  }

  // 4. Accept Connection Request
  static async acceptRequest(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { id } = req.params // requestId or userId

    const conn = db.connections.find(
      (c) =>
        (c.id === id || c.requesterId === id) &&
        c.recipientId === currentUserId &&
        c.status === 'pending'
    )

    if (!conn) {
      return res.status(404).json({ success: false, message: 'Pending connection request not found.' })
    }

    conn.status = 'accepted'
    conn.updatedAt = new Date().toISOString()

    const requester = db.profiles.find((p) => p.userId === conn.requesterId)

    return res.status(200).json({
      success: true,
      message: `You are now connected with ${requester?.name || 'this professional'}!`,
      status: 'connected',
      connection: conn
    })
  }

  // 5. Decline Connection Request
  static async declineRequest(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { id } = req.params

    const connIndex = db.connections.findIndex(
      (c) =>
        (c.id === id || c.requesterId === id) &&
        c.recipientId === currentUserId &&
        c.status === 'pending'
    )

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pending connection request not found.' })
    }

    db.connections.splice(connIndex, 1)

    return res.status(200).json({
      success: true,
      message: 'Connection request declined.'
    })
  }

  // 6. Cancel Sent Request
  static async cancelRequest(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { id } = req.params

    const connIndex = db.connections.findIndex(
      (c) =>
        (c.id === id || c.recipientId === id) &&
        c.requesterId === currentUserId &&
        c.status === 'pending'
    )

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pending request not found.' })
    }

    db.connections.splice(connIndex, 1)

    return res.status(200).json({
      success: true,
      message: 'Connection request cancelled.'
    })
  }

  // 7. Remove Connection
  static async removeConnection(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { id } = req.params // connectionId or userId

    const connIndex = db.connections.findIndex(
      (c) =>
        (c.id === id || c.requesterId === id || c.recipientId === id) &&
        c.status === 'accepted' &&
        (c.requesterId === currentUserId || c.recipientId === currentUserId)
    )

    if (connIndex === -1) {
      return res.status(404).json({ success: false, message: 'Active connection not found.' })
    }

    db.connections.splice(connIndex, 1)

    return res.status(200).json({
      success: true,
      message: 'Connection removed successfully.'
    })
  }

  // 8. Discover Professionals
  static async discoverPeople(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { q, skill, location } = req.query

    // Exclude self
    let candidates = db.profiles.filter((p) => p.userId !== currentUserId)

    if (q && typeof q === 'string') {
      const term = q.toLowerCase()
      candidates = candidates.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.headline.toLowerCase().includes(term) ||
          p.skills.some((s) => s.toLowerCase().includes(term))
      )
    }

    if (skill && typeof skill === 'string') {
      candidates = candidates.filter((p) =>
        p.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      )
    }

    if (location && typeof location === 'string') {
      candidates = candidates.filter((p) =>
        p.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    const results = candidates.map((p) => {
      // Determine connection state
      const conn = db.connections.find(
        (c) =>
          (c.requesterId === currentUserId && c.recipientId === p.userId) ||
          (c.recipientId === currentUserId && c.requesterId === p.userId)
      )

      let connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected' = 'none'
      if (conn) {
        if (conn.status === 'accepted') connectionStatus = 'connected'
        else if (conn.requesterId === currentUserId) connectionStatus = 'pending_sent'
        else connectionStatus = 'pending_received'
      }

      return {
        userId: p.userId,
        name: p.name,
        headline: p.headline,
        location: p.location,
        profilePhoto: p.profilePhoto,
        skills: p.skills || [],
        totalExperienceYears: p.totalExperienceYears,
        connectionStatus,
        requestId: conn?.id
      }
    })

    return res.status(200).json({
      success: true,
      count: results.length,
      people: results
    })
  }

  // 9. Get Detailed User Profile (with Privacy Protections)
  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    const currentUserId = req.user?.userId || 'usr-candidate-default-01'
    const { id } = req.params

    const profile = db.profiles.find((p) => p.userId === id || p.id === id)
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' })
    }

    // Determine connection status
    const isSelf = profile.userId === currentUserId
    const conn = db.connections.find(
      (c) =>
        (c.requesterId === currentUserId && c.recipientId === profile.userId) ||
        (c.recipientId === currentUserId && c.requesterId === profile.userId)
    )

    let connectionStatus: 'self' | 'none' | 'pending_sent' | 'pending_received' | 'connected' = isSelf
      ? 'self'
      : 'none'

    if (!isSelf && conn) {
      if (conn.status === 'accepted') connectionStatus = 'connected'
      else if (conn.requesterId === currentUserId) connectionStatus = 'pending_sent'
      else connectionStatus = 'pending_received'
    }

    // Fetch public posts authored by this user
    const userPosts = db.posts.filter((p) => p.authorId === profile.userId)

    // Privacy Protections:
    // Never expose password, KYC documents, application history, internal notes
    const isConnected = connectionStatus === 'connected'
    const privacy = profile.privacySettings || {
      profileVisibility: 'public',
      showEmailToConnections: false,
      showPhoneToConnections: false,
      contactPrivacyMask: true
    }

    const emailVisible = isSelf || (isConnected && privacy.showEmailToConnections)
    const phoneVisible = isSelf || (isConnected && privacy.showPhoneToConnections)

    const sanitizedProfile = {
      userId: profile.userId,
      name: profile.name,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      currentRole: profile.currentRole,
      totalExperienceYears: profile.totalExperienceYears,
      skills: profile.skills,
      tools: profile.tools,
      languages: profile.languages,
      profilePhoto: profile.profilePhoto,
      education: profile.education || [],
      experience: profile.experience || [],
      projects: profile.projects || [],
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      email: emailVisible ? profile.email : maskEmail(profile.email),
      phone: phoneVisible ? profile.phone : maskPhone(profile.phone),
      connectionStatus,
      requestId: conn?.id,
      postsCount: userPosts.length,
      posts: userPosts
    }

    return res.status(200).json({
      success: true,
      profile: sanitizedProfile
    })
  }
}
