import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { JobsController } from '../controllers/jobs.controller'
import { ApplicationsController } from '../controllers/applications.controller'
import { MeetingsController } from '../controllers/meetings.controller'
import { PostsController } from '../controllers/posts.controller'
import { ConnectionsController } from '../controllers/connections.controller'
import { AIController } from '../controllers/ai.controller'
import { DocumentsController } from '../controllers/documents.controller'
import { VoicePracticeController } from '../controllers/voicePractice.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

// 1. Auth & Profile Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.get('/auth/profile', authMiddleware as any, AuthController.getProfile as any)
router.put('/auth/profile', authMiddleware as any, AuthController.updateProfile as any)
router.post('/auth/privacy-shield/toggle', authMiddleware as any, AuthController.togglePrivacyShield as any)

// 2. Jobs Routes (Location & Work Mode Search)
router.get('/jobs', JobsController.listJobs)
router.get('/jobs/:id', JobsController.getJobById)

// 3. Applications (11-Stage Pipeline) Routes
router.get('/applications', authMiddleware as any, ApplicationsController.getMyApplications as any)
router.post('/applications/apply', authMiddleware as any, ApplicationsController.apply as any)
router.patch('/applications/:id/stage', authMiddleware as any, ApplicationsController.updateStage as any)

// 4. Professional Networking & Connections Routes
router.get('/connections', authMiddleware as any, ConnectionsController.getMyConnections as any)
router.get('/connections/requests', authMiddleware as any, ConnectionsController.getRequests as any)
router.post('/connections/request', authMiddleware as any, ConnectionsController.sendRequest as any)
router.patch('/connections/:id/accept', authMiddleware as any, ConnectionsController.acceptRequest as any)
router.patch('/connections/:id/decline', authMiddleware as any, ConnectionsController.declineRequest as any)
router.delete('/connections/:id/cancel', authMiddleware as any, ConnectionsController.cancelRequest as any)
router.delete('/connections/:id/remove', authMiddleware as any, ConnectionsController.removeConnection as any)
router.get('/connections/discover', authMiddleware as any, ConnectionsController.discoverPeople as any)
router.get('/connections/user/:id', authMiddleware as any, ConnectionsController.getUserProfile as any)

// 5. Meetings & Transcripts Routes
router.get('/meetings', authMiddleware as any, MeetingsController.listMeetings as any)
router.get('/meetings/:code', MeetingsController.getMeetingByCode)
router.post('/meetings/instant', authMiddleware as any, MeetingsController.createInstantMeeting as any)
router.get('/meetings/:code/chats', MeetingsController.getMeetingChats)
router.post('/meetings/:code/chats', MeetingsController.addMeetingChat)
router.get('/meetings/:id/transcripts', MeetingsController.getTranscripts)
router.post('/meetings/:id/transcript', MeetingsController.addTranscript)

// 6. Posts & Saved Bookmarks Routes
router.get('/posts', authMiddleware as any, PostsController.listPosts as any)
router.get('/posts/:id', authMiddleware as any, PostsController.getPostById as any)
router.post('/posts', authMiddleware as any, PostsController.createPost as any)
router.put('/posts/:id', authMiddleware as any, PostsController.updatePost as any)
router.delete('/posts/:id', authMiddleware as any, PostsController.deletePost as any)
router.post('/posts/:id/like', authMiddleware as any, PostsController.toggleLike as any)
router.post('/posts/:id/bookmark', authMiddleware as any, PostsController.toggleBookmark as any)
router.post('/posts/:id/comment', authMiddleware as any, PostsController.addComment as any)
router.delete('/posts/:id/comments/:commentId', authMiddleware as any, PostsController.deleteComment as any)

// 7. AI Copilot & ATS Diagnostics Routes
router.post('/ai/copilot', authMiddleware as any, AIController.chat as any)
router.get('/ai/ats-diagnostics', authMiddleware as any, AIController.atsDiagnostics as any)

// 8. Documents & KYC OTP Routes
router.get('/documents', authMiddleware as any, DocumentsController.listDocuments as any)
router.post('/documents/upload', authMiddleware as any, DocumentsController.uploadDocument as any)
router.post('/documents/:id/verify-otp', authMiddleware as any, DocumentsController.verifyOTP as any)

// 9. RAS AI Voice Interview Practice & Sarvam AI Routes
router.get('/voice-practice/status', VoicePracticeController.getStatus)
router.post('/voice-practice/session/start', VoicePracticeController.startSession)
router.post('/voice-practice/transcribe', VoicePracticeController.transcribeAudio)
router.post('/voice-practice/turn', VoicePracticeController.nextTurn)
router.post('/voice-practice/evaluate', VoicePracticeController.evaluateSession)

export default router
