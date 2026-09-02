import { Server as SocketIOServer, Socket } from 'socket.io'
import { db } from '../config/db'
import { MeetingChatMessage } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export interface RoomParticipant {
  socketId: string
  userId: string
  userName: string
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
}

export interface RoomChatMessage extends MeetingChatMessage {
  roomCode: string
  senderSocketId: string
}

export interface RoomTranscriptEntry {
  id: string
  roomCode: string
  speaker: string
  text: string
  timestamp: string
  createdAt: string
}

// Persistent In-Memory Store
const roomParticipants: Record<string, RoomParticipant[]> = {}
const roomChats: Record<string, RoomChatMessage[]> = {}
const roomTranscripts: Record<string, RoomTranscriptEntry[]> = {}

// Helper Data Accessors
export function getRoomChatHistory(roomCode: string): RoomChatMessage[] {
  return roomChats[roomCode] || []
}

export function saveRoomChatMessage(
  roomCode: string,
  chat: Omit<RoomChatMessage, 'id' | 'createdAt'>
): RoomChatMessage {
  if (!roomChats[roomCode]) {
    roomChats[roomCode] = []
  }
  const fullChat: RoomChatMessage = {
    ...chat,
    id: `msg-${uuidv4().slice(0, 8)}`,
    createdAt: new Date().toISOString()
  }
  roomChats[roomCode].push(fullChat)

  // Sync to db.meetings if meeting exists
  const meeting = db.meetings.find(
    (m) => m.code.toUpperCase() === roomCode.toUpperCase() || m.id === roomCode
  )
  if (meeting) {
    if (!meeting.chats) meeting.chats = []
    meeting.chats.push({
      id: fullChat.id,
      senderId: fullChat.senderId,
      senderName: fullChat.senderName,
      text: fullChat.text,
      timestamp: fullChat.timestamp,
      createdAt: fullChat.createdAt
    })
  }

  return fullChat
}

export function getRoomTranscripts(roomCode: string): RoomTranscriptEntry[] {
  return roomTranscripts[roomCode] || []
}

export function saveRoomTranscript(
  roomCode: string,
  speaker: string,
  text: string,
  timestamp?: string
): RoomTranscriptEntry {
  if (!roomTranscripts[roomCode]) {
    roomTranscripts[roomCode] = []
  }
  const entry: RoomTranscriptEntry = {
    id: `trans-${uuidv4().slice(0, 8)}`,
    roomCode,
    speaker: speaker || 'Participant',
    text,
    timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  }
  roomTranscripts[roomCode].push(entry)

  // Sync to db.meetings if meeting exists
  const meeting = db.meetings.find(
    (m) => m.code.toUpperCase() === roomCode.toUpperCase() || m.id === roomCode
  )
  if (meeting) {
    meeting.transcripts.push({
      speaker: entry.speaker,
      text: entry.text,
      timestamp: entry.timestamp
    })
  }

  return entry
}

export function setupMeetingSockets(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Connected: ${socket.id}`)

    // 1. Join Room
    socket.on(
      'join-room',
      ({ roomCode, userId, userName }: { roomCode: string; userId: string; userName: string }) => {
        socket.join(roomCode)

        if (!roomParticipants[roomCode]) {
          roomParticipants[roomCode] = []
        }

        const participant: RoomParticipant = {
          socketId: socket.id,
          userId: userId || socket.id,
          userName: userName || 'Candidate Participant',
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false
        }

        roomParticipants[roomCode] = roomParticipants[roomCode].filter((p) => p.socketId !== socket.id)
        roomParticipants[roomCode].push(participant)

        // Notify existing users
        socket.to(roomCode).emit('user-joined', {
          participant,
          participants: roomParticipants[roomCode]
        })

        // Send participant list to caller
        socket.emit('room-state', {
          participants: roomParticipants[roomCode]
        })

        // Send all saved chat history to newly joined user
        socket.emit('chat-history', {
          messages: roomChats[roomCode] || []
        })

        // Send all saved transcript history
        socket.emit('transcript-history', {
          transcripts: roomTranscripts[roomCode] || []
        })
      }
    )

    // 2. Chat Messaging: Save & Broadcast
    socket.on(
      'send-chat-message',
      (
        {
          roomCode,
          senderId,
          senderName,
          text,
          timestamp
        }: {
          roomCode: string
          senderId?: string
          senderName?: string
          text: string
          timestamp?: string
        },
        callback?: (res: { success: boolean; message: RoomChatMessage }) => void
      ) => {
        if (!roomCode || !text?.trim()) {
          if (callback) callback({ success: false, message: null as any })
          return
        }

        const savedMessage = saveRoomChatMessage(roomCode, {
          roomCode,
          senderSocketId: socket.id,
          senderId: senderId || socket.id,
          senderName: senderName || 'Candidate',
          text: text.trim(),
          timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })

        // Broadcast saved chat message to all clients in the room (including sender)
        io.to(roomCode).emit('chat-message', savedMessage)

        if (callback) {
          callback({ success: true, message: savedMessage })
        }
      }
    )

    // 3. Get / Export Saved Chat History
    socket.on('get-chat-history', ({ roomCode }: { roomCode: string }, callback) => {
      const messages = getRoomChatHistory(roomCode)
      socket.emit('chat-history', { messages })
      if (typeof callback === 'function') {
        callback({ success: true, messages })
      }
    })

    // 4. WebRTC Signaling: Offer, Answer, ICE Candidates
    socket.on('webrtc-offer', ({ roomCode, targetSocketId, offer }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        senderSocketId: socket.id,
        offer
      })
    })

    socket.on('webrtc-answer', ({ roomCode, targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        senderSocketId: socket.id,
        answer
      })
    })

    socket.on('ice-candidate', ({ roomCode, targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        senderSocketId: socket.id,
        candidate
      })
    })

    // 5. Media Controls State Broadcast
    socket.on('media-state-change', ({ roomCode, isMuted, isCameraOff, isScreenSharing }) => {
      if (roomParticipants[roomCode]) {
        const participant = roomParticipants[roomCode].find((p) => p.socketId === socket.id)
        if (participant) {
          if (typeof isMuted === 'boolean') participant.isMuted = isMuted
          if (typeof isCameraOff === 'boolean') participant.isCameraOff = isCameraOff
          if (typeof isScreenSharing === 'boolean') participant.isScreenSharing = isScreenSharing
        }
      }

      socket.to(roomCode).emit('media-state-changed', {
        socketId: socket.id,
        isMuted,
        isCameraOff,
        isScreenSharing
      })
    })

    // 6. Live Audio Transcript Chunk Stream & Persistence
    socket.on('transcript-chunk', ({ roomCode, speaker, text, timestamp }) => {
      if (!roomCode || !text?.trim()) return

      const entry = saveRoomTranscript(roomCode, speaker, text, timestamp)

      io.to(roomCode).emit('live-transcript', {
        speaker: entry.speaker,
        text: entry.text,
        timestamp: entry.timestamp
      })
    })

    // 7. Disconnect
    socket.on('disconnect', () => {
      for (const roomCode in roomParticipants) {
        const leftParticipant = roomParticipants[roomCode]?.find((p) => p.socketId === socket.id)
        if (leftParticipant) {
          roomParticipants[roomCode] = roomParticipants[roomCode].filter((p) => p.socketId !== socket.id)
          socket.to(roomCode).emit('user-left', {
            socketId: socket.id,
            userName: leftParticipant.userName,
            participants: roomParticipants[roomCode]
          })
        }
      }
      console.log(`[Socket.io] Disconnected: ${socket.id}`)
    })
  })
}
