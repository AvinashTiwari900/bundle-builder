import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { JobsController } from '../controllers/jobs.controller'
import { ApplicationsController } from '../controllers/applications.controller'
import { MeetingsController } from '../controllers/meetings.controller'
import { PostsController } from '../controllers/posts.controller'
import { AIController } from '../controllers/ai.controller'
import { DocumentsController } from '../controllers/documents.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

// 1. Auth & Profile Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.get('/auth/profile', authMiddleware as any, AuthController.getProfile as any)
router.put('/auth/profile', authMiddleware as any, AuthController.updateProfile as any)
router.post('/auth/privacy-shield/toggle', authMiddleware as any, AuthController.togglePrivacyShield as any)

// 2. Jobs Routes
router.get('/jobs', JobsController.listJobs)
router.get('/jobs/:id', JobsController.getJobById)

// 3. Applications (11-Stage Pipeline) Routes
router.get('/applications', authMiddleware as any, ApplicationsController.getMyApplications as any)
router.post('/applications/apply', authMiddleware as any, ApplicationsController.apply as any)
router.patch('/applications/:id/stage', authMiddleware as any, ApplicationsController.updateStage as any)

// 4. Meetings & Transcripts Routes
router.get('/meetings', authMiddleware as any, MeetingsController.listMeetings as any)
router.get('/meetings/:code', MeetingsController.getMeetingByCode)
router.post('/meetings/instant', authMiddleware as any, MeetingsController.createInstantMeeting as any)
router.post('/meetings/:id/transcript', MeetingsController.addTranscript)

// 5. Posts & Saved Bookmarks Routes
router.get('/posts', authMiddleware as any, PostsController.listPosts as any)
router.get('/posts/saved', authMiddleware as any, PostsController.getSavedPosts as any)
router.post('/posts', authMiddleware as any, PostsController.createPost as any)
router.post('/posts/:id/like', authMiddleware as any, PostsController.toggleLike as any)
router.post('/posts/:id/bookmark', authMiddleware as any, PostsController.toggleBookmark as any)
router.post('/posts/:id/comment', authMiddleware as any, PostsController.addComment as any)

// 6. AI Copilot & ATS Diagnostics Routes
router.post('/ai/copilot', authMiddleware as any, AIController.chat as any)
router.get('/ai/ats-diagnostics', authMiddleware as any, AIController.atsDiagnostics as any)

// 7. Documents & KYC OTP Routes
router.get('/documents', authMiddleware as any, DocumentsController.listDocuments as any)
router.post('/documents/upload', authMiddleware as any, DocumentsController.uploadDocument as any)
router.post('/documents/:id/verify-otp', authMiddleware as any, DocumentsController.verifyOTP as any)

export default router
