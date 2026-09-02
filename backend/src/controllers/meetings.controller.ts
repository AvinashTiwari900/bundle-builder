import { Request, Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Meeting, MeetingChatMessage } from '../models/types'
import { getRoomChatHistory, saveRoomChatMessage, getRoomTranscripts, saveRoomTranscript } from '../sockets/meeting.socket'
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

    // Attach real-time saved chats and transcripts
    const chats = getRoomChatHistory(meeting.code)
    const transcripts = getRoomTranscripts(meeting.code)

    return res.status(200).json({
      success: true,
      meeting: {
        ...meeting,
        chats: chats.length > 0 ? chats : meeting.chats || [],
        transcripts: transcripts.length > 0 ? transcripts : meeting.transcripts || []
      }
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
      chats: [],
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

  static async getMeetingChats(req: Request, res: Response) {
    const { code } = req.params
    const chats = getRoomChatHistory(code)
    const meeting = db.meetings.find((m) => m.code.toUpperCase() === code.toUpperCase())

    return res.status(200).json({
      success: true,
      roomCode: code,
      chats: chats.length > 0 ? chats : meeting?.chats || []
    })
  }

  static async addMeetingChat(req: Request, res: Response) {
    const { code } = req.params
    const { senderId, senderName, text, timestamp } = req.body

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' })
    }

    const savedMessage = saveRoomChatMessage(code, {
      roomCode: code,
      senderSocketId: 'rest-api',
      senderId: senderId || 'user-participant',
      senderName: senderName || 'Candidate',
      text: text.trim(),
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    return res.status(201).json({
      success: true,
      message: 'Chat saved successfully.',
      chat: savedMessage
    })
  }

  static async addTranscript(req: Request, res: Response) {
    const { id } = req.params
    const { speaker, text, timestamp } = req.body

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Transcript text is required.' })
    }

    const entry = saveRoomTranscript(id, speaker || 'Participant', text, timestamp)

    return res.status(200).json({
      success: true,
      transcript: entry,
      transcripts: getRoomTranscripts(id)
    })
  }

  static async getTranscripts(req: Request, res: Response) {
    const { id } = req.params
    const transcripts = getRoomTranscripts(id)
    const meeting = db.meetings.find((m) => m.id === id || m.code.toUpperCase() === id.toUpperCase())

    return res.status(200).json({
      success: true,
      transcripts: transcripts.length > 0 ? transcripts : meeting?.transcripts || []
    })
  }
}
