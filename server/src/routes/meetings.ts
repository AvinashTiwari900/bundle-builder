import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/asyncHandler'

const router = Router()

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const meetingInclude = {
  notes: { orderBy: { createdAt: 'asc' as const } },
  actionItems: { orderBy: { order: 'asc' as const } },
  transcriptEntries: { orderBy: { createdAt: 'asc' as const } },
  chatMessages: { orderBy: { createdAt: 'asc' as const } }
}

// Maps the DB row (with its normalized child-table relations) back onto the
// exact flat shape the frontend's MeetingRecording type expects - callers
// never need to know notes/actionItems/transcript/chats live in their own
// tables now instead of JSON columns.
function toResponse(meeting: any) {
  const { notes, actionItems, transcriptEntries, chatMessages, ...rest } = meeting
  return {
    ...rest,
    notes: (notes || []).map((n: any) => ({ id: n.id, timestamp: n.timestamp, author: n.author, text: n.text, createdAt: n.createdAt })),
    actionItems: (actionItems || []).map((a: any) => ({ id: a.id, assignee: a.assignee, task: a.task, done: a.done })),
    transcript: (transcriptEntries || []).map((t: any) => ({ speaker: t.speaker, speakerRole: t.speakerRole, text: t.text, timestamp: t.timestamp })),
    chats: (chatMessages || []).map((c: any) => ({ id: c.id, senderId: c.senderId, senderName: c.senderName, text: c.text, timestamp: c.timestamp }))
  }
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const meetings = await prisma.meeting.findMany({ where: { hostId: req.user!.id }, include: meetingInclude, orderBy: { createdAt: 'desc' } })
    return res.json({ success: true, meetings: meetings.map(toResponse) })
  })
)

// Public: joining a meeting by code doesn't require the viewer to own it
router.get(
  '/:code',
  asyncHandler(async (req, res) => {
    const meeting = await prisma.meeting.findFirst({
      where: { OR: [{ code: req.params.code.toUpperCase() }, { id: req.params.code }] },
      include: meetingInclude
    })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })
    return res.json({ success: true, meeting: toResponse(meeting) })
  })
)

const createSchema = z.object({
  title: z.string().optional(),
  hostName: z.string().optional()
})

router.post(
  '/instant',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body)
    const code = generateCode()
    const meeting = await prisma.meeting.create({
      data: {
        code,
        title: parsed.success && parsed.data.title ? parsed.data.title : 'Instant Meeting',
        hostId: req.user!.id,
        hostName: parsed.success ? parsed.data.hostName : undefined,
        status: 'In Progress',
        roomUrl: `/interview/room/${code}?code=${code}`,
        shareUrl: `/meet/${code}`
      },
      include: meetingInclude
    })
    return res.status(201).json({ success: true, message: 'Meeting created', meeting: toResponse(meeting) })
  })
)

const completeSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  title: z.string(),
  meetingType: z.string().optional(),
  hostName: z.string().optional(),
  organization: z.string().optional(),
  durationMinutes: z.number(),
  transcript: z.array(z.any()).optional(),
  hasScreenShare: z.boolean().optional(),
  recordingUrl: z.string().optional(),
  videoThumbnail: z.string().optional(),
  summaryNotes: z.string().optional(),
  notes: z.array(z.any()).optional(),
  participants: z.array(z.any()).optional()
})

router.post(
  '/complete',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = completeSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid meeting data' })
    const d = parsed.data

    const data = {
      title: d.title,
      meetingType: d.meetingType,
      organization: d.organization,
      hostName: d.hostName,
      status: 'Completed',
      durationMinutes: d.durationMinutes,
      hasScreenShare: d.hasScreenShare || false,
      recordingUrl: d.recordingUrl,
      videoThumbnail: d.videoThumbnail,
      summaryNotes: d.summaryNotes,
      participants: d.participants || [],
      isRecorded: !!d.recordingUrl
    }

    const existing = d.id
      ? await prisma.meeting.findUnique({ where: { id: d.id } })
      : d.code
      ? await prisma.meeting.findUnique({ where: { code: d.code.toUpperCase() } })
      : null

    const meeting = await prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.meeting.update({ where: { id: existing.id }, data })
        : await tx.meeting.create({ data: { ...data, code: (d.code || generateCode()).toUpperCase(), hostId: req.user!.id } })

      // Real-time capture (live dictation via Socket.IO transcript-chunk
      // events) already persists transcript/notes incrementally as the
      // meeting happens - these are only a fallback append for whatever a
      // client collected on its own and didn't already stream in live, so
      // this never deletes/replaces what's already there.
      if (d.transcript?.length) {
        await tx.meetingTranscriptEntry.createMany({
          data: d.transcript.map((t: any) => ({
            meetingId: saved.id,
            speaker: t.speaker || 'Participant',
            speakerRole: t.speakerRole,
            text: t.text,
            timestamp: t.timestamp
          }))
        })
      }
      if (d.notes?.length) {
        await tx.meetingNote.createMany({
          data: d.notes.map((n: any) => ({
            meetingId: saved.id,
            timestamp: n.timestamp || '00:00',
            author: n.author || 'Host',
            text: n.text
          }))
        })
      }

      return tx.meeting.findUniqueOrThrow({ where: { id: saved.id }, include: meetingInclude })
    })

    return res.status(201).json({ success: true, meeting: toResponse(meeting) })
  })
)

router.patch(
  '/:id/note',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = z.object({ text: z.string(), author: z.string().optional() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'note text is required' })

    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    const note = await prisma.meetingNote.create({
      data: {
        meetingId: meeting.id,
        timestamp: new Date().toISOString(),
        author: parsed.data.author || 'You',
        text: parsed.data.text
      }
    })

    return res.status(201).json({ success: true, note })
  })
)

router.patch(
  '/:id/action-item/:actionId/toggle',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    const item = await prisma.meetingActionItem.findUnique({ where: { id: req.params.actionId } })
    if (!item || item.meetingId !== meeting.id) return res.status(404).json({ error: 'Action item not found' })

    await prisma.meetingActionItem.update({ where: { id: item.id }, data: { done: !item.done } })
    const actionItems = await prisma.meetingActionItem.findMany({ where: { meetingId: meeting.id }, orderBy: { order: 'asc' } })

    return res.json({ success: true, actionItems })
  })
)

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const meeting = await prisma.meeting.findFirst({
      where: { OR: [{ id: req.params.id }, { code: req.params.id.toUpperCase() }], hostId: req.user!.id }
    })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    await prisma.meeting.delete({ where: { id: meeting.id } })
    return res.status(204).send()
  })
)

// ---------- Chat & transcript (public - joined by room code, no auth gate,
// matching the live-room mechanics that PreJoin/InterviewRoom rely on) ----------

router.get(
  '/:code/chats',
  asyncHandler(async (req, res) => {
    const meeting = await prisma.meeting.findUnique({ where: { code: req.params.code.toUpperCase() } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })
    const chats = await prisma.meetingChatMessage.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } })
    return res.json({ success: true, roomCode: meeting.code, chats })
  })
)

router.post(
  '/:code/chats',
  asyncHandler(async (req, res) => {
    const parsed = z.object({ senderId: z.string().optional(), senderName: z.string().optional(), text: z.string() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'text is required' })

    const meeting = await prisma.meeting.findUnique({ where: { code: req.params.code.toUpperCase() } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    const chat = await prisma.meetingChatMessage.create({
      data: {
        meetingId: meeting.id,
        senderId: parsed.data.senderId,
        senderName: parsed.data.senderName,
        text: parsed.data.text,
        timestamp: new Date().toISOString()
      }
    })

    return res.status(201).json({ success: true, chat })
  })
)

router.get(
  '/:id/transcripts',
  asyncHandler(async (req, res) => {
    const meeting = await prisma.meeting.findFirst({ where: { OR: [{ id: req.params.id }, { code: req.params.id.toUpperCase() }] } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })
    const transcripts = await prisma.meetingTranscriptEntry.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } })
    return res.json({ success: true, transcripts })
  })
)

router.post(
  '/:id/transcript',
  asyncHandler(async (req, res) => {
    const parsed = z.object({ speaker: z.string().optional(), speakerRole: z.string().optional(), text: z.string() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'text is required' })

    const meeting = await prisma.meeting.findFirst({ where: { OR: [{ id: req.params.id }, { code: req.params.id.toUpperCase() }] } })
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' })

    const entry = await prisma.meetingTranscriptEntry.create({
      data: {
        meetingId: meeting.id,
        speaker: parsed.data.speaker || 'Participant',
        speakerRole: parsed.data.speakerRole || 'participant',
        text: parsed.data.text,
        timestamp: new Date().toISOString()
      }
    })
    const transcripts = await prisma.meetingTranscriptEntry.findMany({ where: { meetingId: meeting.id }, orderBy: { createdAt: 'asc' } })

    return res.status(201).json({ success: true, transcript: entry, transcripts })
  })
)

export default router
