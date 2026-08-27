import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Meeting } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export class MeetingsController {
  static async listMeetings(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      meetings: db.meetings
    })
  }

  static async getMeetingByCode(req: Request, res: Response) {
    const { code } = req.params
    const meeting = db.meetings.find((m) => m.code.toUpperCase() === code.toUpperCase())

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting room code not found.' })
    }

    return res.status(200).json({
      success: true,
      meeting
    })
  }

  static async createInstantMeeting(req: AuthenticatedRequest, res: Response) {
    const hostId = req.user?.userId || 'usr-candidate-default-01'
    const { title } = req.body

    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = `GTN-${randomChars}`

    const newMeeting: Meeting = {
      id: `meet-${uuidv4().slice(0, 8)}`,
      code,
      title: title || 'Instant Video Collaboration & Interview Session',
      meetingType: 'instant',
      hostId,
      hostName: req.user?.email || 'Host',
      durationSeconds: 0,
      isLive: true,
      transcripts: [],
      notes: [],
      createdAt: new Date().toISOString()
    }

    db.meetings.unshift(newMeeting)

    return res.status(201).json({
      success: true,
      message: 'Instant meeting room created successfully.',
      meeting: newMeeting
    })
  }

  static async addTranscript(req: Request, res: Response) {
    const { id } = req.params
    const { speaker, text, timestamp } = req.body

    const meeting = db.meetings.find((m) => m.id === id || m.code === id)
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found.' })
    }

    meeting.transcripts.push({
      speaker: speaker || 'Participant',
      text,
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    return res.status(200).json({
      success: true,
      transcripts: meeting.transcripts
    })
  }
}
