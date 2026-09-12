import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server as SocketIOServer } from 'socket.io'
import { env } from './lib/env'
import authRouter from './routes/auth'
import candidatesRouter from './routes/candidates'
import jobsRouter from './routes/jobs'
import applicationsRouter from './routes/applications'
import resumesRouter from './routes/resumes'
import documentsRouter from './routes/documents'
import projectsRouter from './routes/projects'
import notificationsRouter from './routes/notifications'
import portfolioRouter from './routes/portfolio'
import postsRouter from './routes/posts'
import connectionsRouter from './routes/connections'
import meetingsRouter from './routes/meetings'
import { setupMeetingSockets } from './sockets/meeting.socket'

const app = express()

app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/candidates', candidatesRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/resumes', resumesRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/portfolio', portfolioRouter)
app.use('/api/posts', postsRouter)
app.use('/api/connections', connectionsRouter)
app.use('/api/meetings', meetingsRouter)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const httpServer = http.createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: env.frontendOrigins, credentials: true }
})
setupMeetingSockets(io)

httpServer.listen(env.port, () => {
  console.log(`RAS API (+ Socket.IO) listening on http://localhost:${env.port}`)
})
