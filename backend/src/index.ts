import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.routes'
import { setupMeetingSockets } from './sockets/meeting.socket'
import { errorHandler } from './middlewares/errorHandler.middleware'

dotenv.config()

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 5000
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

// 1. Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: [allowedOrigin, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 2. Health & Status Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Gettin Candidates Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  })
})

// 3. API Version 1 Routes
app.use('/api/v1', apiRoutes)

// 4. Centralized Error Handler
app.use(errorHandler)

// 5. Socket.io WebRTC Signaling
const io = new SocketIOServer(server, {
  cors: {
    origin: [allowedOrigin, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

setupMeetingSockets(io)

// 6. Start Server Listener
server.listen(PORT, () => {
  console.log('====================================================')
  console.log(`🚀 Gettin Candidates API Server running on port ${PORT}`)
  console.log(`📡 REST API Base: http://localhost:${PORT}/api/v1`)
  console.log(`🔌 WebRTC Socket Signaling: ws://localhost:${PORT}`)
  console.log(`💚 Health Check: http://localhost:${PORT}/health`)
  console.log('====================================================')
})

export { app, server }
