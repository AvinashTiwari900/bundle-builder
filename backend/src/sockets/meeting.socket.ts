import { Server as SocketIOServer, Socket } from 'socket.io'

interface RoomParticipant {
  socketId: string
  userId: string
  userName: string
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
}

const roomParticipants: Record<string, RoomParticipant[]> = {}

export function setupMeetingSockets(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Connected: ${socket.id}`)

    // 1. Join Room
    socket.on('join-room', ({ roomCode, userId, userName }: { roomCode: string; userId: string; userName: string }) => {
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
    })

    // 2. WebRTC Signaling: Offer, Answer, ICE Candidates
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

    // 3. Media Controls State Broadcast
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

    // 4. Live Audio Transcript Chunk Stream
    socket.on('transcript-chunk', ({ roomCode, speaker, text, timestamp }) => {
      io.to(roomCode).emit('live-transcript', {
        speaker: speaker || 'Speaker',
        text,
        timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    })

    // 5. Disconnect
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
