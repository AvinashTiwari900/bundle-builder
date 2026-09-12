import { Server as SocketIOServer, Socket } from 'socket.io'
import { prisma } from '../lib/prisma'

export interface RoomParticipant {
  socketId: string
  userId: string
  userName: string
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
}

// Live roster is genuinely ephemeral connection state, not data worth
// persisting - chat and transcript (the actual content) go to Postgres via
// the Meeting row below, so a server restart only loses "who's currently
// in the room", not anything a candidate would expect to survive.
const roomParticipants: Record<string, RoomParticipant[]> = {}

async function findMeeting(roomCode: string) {
  return prisma.meeting.findFirst({ where: { OR: [{ code: roomCode.toUpperCase() }, { id: roomCode }] } })
}

async function appendChat(roomCode: string, chat: { senderId?: string; senderName?: string; text: string; timestamp: string }) {
  const meeting = await findMeeting(roomCode)
  if (!meeting) return { id: 'chat-' + Date.now(), ...chat }
  return prisma.meetingChatMessage.create({
    data: { meetingId: meeting.id, senderId: chat.senderId, senderName: chat.senderName, text: chat.text, timestamp: chat.timestamp }
  })
}

async function appendTranscript(roomCode: string, speaker: string, text: string, timestamp?: string) {
  const entryTimestamp = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const meeting = await findMeeting(roomCode)
  if (!meeting) return { speaker: speaker || 'Participant', text, timestamp: entryTimestamp }
  return prisma.meetingTranscriptEntry.create({
    data: { meetingId: meeting.id, speaker: speaker || 'Participant', text, timestamp: entryTimestamp }
  })
}

export function setupMeetingSockets(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('join-room', async ({ roomCode, userId, userName }: { roomCode: string; userId: string; userName: string }) => {
      socket.join(roomCode)

      const participant: RoomParticipant = {
        socketId: socket.id,
        userId: userId || socket.id,
        userName: userName || 'Candidate Participant',
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false
      }

      roomParticipants[roomCode] = (roomParticipants[roomCode] || []).filter((p) => p.socketId !== socket.id)
      roomParticipants[roomCode].push(participant)

      socket.to(roomCode).emit('user-joined', { participant, participants: roomParticipants[roomCode] })
      socket.emit('room-state', { participants: roomParticipants[roomCode] })

      const meeting = await findMeeting(roomCode)
      const [messages, transcripts] = meeting
        ? await Promise.all([
            prisma.meetingChatMessage.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } }),
            prisma.meetingTranscriptEntry.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } })
          ])
        : [[], []]
      socket.emit('chat-history', { messages })
      socket.emit('transcript-history', { transcripts })
    })

    socket.on(
      'send-chat-message',
      async (
        { roomCode, senderId, senderName, text, timestamp }: { roomCode: string; senderId?: string; senderName?: string; text: string; timestamp?: string },
        callback?: (res: { success: boolean; message?: any }) => void
      ) => {
        if (!roomCode || !text?.trim()) {
          callback?.({ success: false })
          return
        }
        const savedMessage = await appendChat(roomCode, {
          senderId: senderId || socket.id,
          senderName: senderName || 'Candidate',
          text: text.trim(),
          timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        io.to(roomCode).emit('chat-message', savedMessage)
        callback?.({ success: true, message: savedMessage })
      }
    )

    socket.on('get-chat-history', async ({ roomCode }: { roomCode: string }, callback?: (res: { success: boolean; messages: any[] }) => void) => {
      const meeting = await findMeeting(roomCode)
      const messages = meeting
        ? await prisma.meetingChatMessage.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } })
        : []
      socket.emit('chat-history', { messages })
      callback?.({ success: true, messages })
    })

    socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('webrtc-offer', { senderSocketId: socket.id, offer })
    })

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', { senderSocketId: socket.id, answer })
    })

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { senderSocketId: socket.id, candidate })
    })

    socket.on('media-state-change', ({ roomCode, isMuted, isCameraOff, isScreenSharing }) => {
      const participant = roomParticipants[roomCode]?.find((p) => p.socketId === socket.id)
      if (participant) {
        if (typeof isMuted === 'boolean') participant.isMuted = isMuted
        if (typeof isCameraOff === 'boolean') participant.isCameraOff = isCameraOff
        if (typeof isScreenSharing === 'boolean') participant.isScreenSharing = isScreenSharing
      }
      socket.to(roomCode).emit('media-state-changed', { socketId: socket.id, isMuted, isCameraOff, isScreenSharing })
    })

    socket.on('transcript-chunk', async ({ roomCode, speaker, text, timestamp }) => {
      if (!roomCode || !text?.trim()) return
      const entry = await appendTranscript(roomCode, speaker, text, timestamp)
      io.to(roomCode).emit('live-transcript', entry)
    })

    socket.on('disconnect', () => {
      for (const roomCode in roomParticipants) {
        const left = roomParticipants[roomCode]?.find((p) => p.socketId === socket.id)
        if (left) {
          roomParticipants[roomCode] = roomParticipants[roomCode].filter((p) => p.socketId !== socket.id)
          socket.to(roomCode).emit('user-left', { socketId: socket.id, userName: left.userName, participants: roomParticipants[roomCode] })
        }
      }
    })
  })
}
