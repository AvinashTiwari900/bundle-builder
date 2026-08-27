import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db, isFirebaseConnected } from './firebase'
import { profileService } from './profileService'

// Helper for safe non-blocking Firestore sync
function syncToFirestoreSafely(syncFn: () => Promise<any>, operationName: string) {
  if (!isFirebaseConnected || !db) return

  // Race with timeout so background sync never hangs or blocks the application
  Promise.race([
    syncFn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore sync operation timed out')), 800)
    )
  ]).catch((err) => {
    // Non-fatal warning - client continues seamlessly with local state
    console.warn(`[RAS Hybrid] ${operationName} offline notice:`, err?.message || err)
  })
}

export const firestoreService = {
  /**
   * Save or sync Candidate Profile with Cloudinary URLs to Firestore
   */
  async saveCandidateProfile(profileData: any) {
    // 1. Always persist to local state immediately
    profileService.save(profileData)

    // 2. Non-blocking cloud synchronization
    if (isFirebaseConnected && db) {
      const candidateId = profileData.id || 'candidate-1'
      const candidateRef = doc(db, 'candidates', candidateId)
      syncToFirestoreSafely(
        () =>
          setDoc(
            candidateRef,
            {
              ...profileData,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          ),
        'saveCandidateProfile'
      )
    }
    return profileData
  },

  /**
   * Save uploaded Resume record with Cloudinary file URL to Firestore
   */
  async saveResumeRecord(resumeData: {
    id: string
    name: string
    cloudinaryUrl: string
    cloudinaryPublicId?: string
    size: number
    atsScore: number
    isPrimary: boolean
    uploadedAt: string
  }) {
    // Update local profile state
    const p = profileService.get() || {}
    p.resumes = [resumeData, ...(p.resumes || []).filter((r: any) => r.id !== resumeData.id)]
    profileService.save(p)

    if (isFirebaseConnected && db) {
      const resumeRef = doc(db, 'resumes', resumeData.id)
      syncToFirestoreSafely(
        () =>
          setDoc(resumeRef, {
            ...resumeData,
            candidateId: p.id || 'candidate-1',
            createdAt: new Date().toISOString()
          }),
        'saveResumeRecord'
      )
    }
    return resumeData
  },

  /**
   * Save uploaded KYC Document record with Cloudinary file URL to Firestore
   */
  async saveDocumentRecord(docData: {
    id: string
    name: string
    type: string
    cloudinaryUrl: string
    cloudinaryPublicId?: string
    status: string
    uploadedAt: string
    aiConfidence?: number
    extractedName?: string
  }) {
    // Update local profile state
    const p = profileService.get() || {}
    p.documents = [docData, ...(p.documents || []).filter((d: any) => d.id !== docData.id)]
    profileService.save(p)

    if (isFirebaseConnected && db) {
      const docRef = doc(db, 'documents', docData.id)
      syncToFirestoreSafely(
        () =>
          setDoc(docRef, {
            ...docData,
            candidateId: p.id || 'candidate-1',
            createdAt: new Date().toISOString()
          }),
        'saveDocumentRecord'
      )
    }
    return docData
  },

  /**
   * Save Project Case Study with Cloudinary Screenshot / Attachments to Firestore
   */
  async saveProjectRecord(projectData: any) {
    const p = profileService.get() || {}
    p.projects = [projectData, ...(p.projects || []).filter((pr: any) => pr.id !== projectData.id)]
    profileService.save(p)

    if (isFirebaseConnected && db) {
      const projRef = doc(db, 'projects', projectData.id)
      syncToFirestoreSafely(
        () =>
          setDoc(projRef, {
            ...projectData,
            candidateId: p.id || 'candidate-1',
            updatedAt: new Date().toISOString()
          }),
        'saveProjectRecord'
      )
    }
    return projectData
  }
}
