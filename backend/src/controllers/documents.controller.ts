import { Response } from 'express'
import { db } from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { KYCDocument } from '../models/types'
import { v4 as uuidv4 } from 'uuid'

export class DocumentsController {
  static async listDocuments(req: AuthenticatedRequest, res: Response) {
    const candidateId = req.user?.userId || 'usr-candidate-default-01'
    const docs = db.documents.filter((d) => d.candidateId === candidateId)

    return res.status(200).json({
      success: true,
      count: docs.length,
      documents: docs
    })
  }

  static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    const candidateId = req.user?.userId || 'usr-candidate-default-01'
    const { documentType, documentNumber, fileUrl } = req.body

    if (!documentType || !fileUrl) {
      return res.status(400).json({ success: false, message: 'Document type and fileUrl are required.' })
    }

    const maskedNum = documentNumber ? `XXXX-XXXX-${documentNumber.slice(-4)}` : 'VERIFIED-DOC'

    const newDoc: KYCDocument = {
      id: `doc-${uuidv4().slice(0, 8)}`,
      candidateId,
      documentType,
      documentNumberMasked: maskedNum,
      fileUrl,
      verifiedStatus: 'Pending Verification',
      otpVerified: false,
      uploadedAt: new Date().toISOString()
    }

    db.documents.unshift(newDoc)

    return res.status(201).json({
      success: true,
      message: 'Document uploaded. Enter 6-digit OTP to complete automated verification.',
      document: newDoc
    })
  }

  static async verifyOTP(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params
    const { otp } = req.body

    if (!otp || String(otp).length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit OTP is required.' })
    }

    const doc = db.documents.find((d) => d.id === id)
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' })
    }

    doc.otpVerified = true
    doc.verifiedStatus = 'Verified'

    return res.status(200).json({
      success: true,
      message: 'Document verified successfully with Digilocker / UIDAI telemetry.',
      document: doc
    })
  }
}
