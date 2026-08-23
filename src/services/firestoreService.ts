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

export const firestoreService = {
  /**
   * Save or sync Candidate Profile with Cloudinary URLs to Firestore
   */
  async saveCandidateProfile(profileData: any) {
    // Always persist to local state
    profileService.save(profileData)

    if (isFirebaseConnected && db) {
      try {
        const candidateId = profileData.id || 'candidate-1'
        const candidateRef = doc(db, 'candidates', candidateId)
        await setDoc(candidateRef, {
          ...profileData,
          updatedAt: new Date().toISOString()
        }, { merge: true })
      } catch (err) {
        console.warn('Firestore candidate sync notice (running hybrid mode):', err)
      }
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
      try {
        const resumeRef = doc(db, 'resumes', resumeData.id)
        await setDoc(resumeRef, {
          ...resumeData,
          candidateId: p.id || 'candidate-1',
          createdAt: new Date().toISOString()
        })
      } catch (err) {
        console.warn('Firestore resume record sync notice:', err)
      }
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
      try {
        const docRef = doc(db, 'documents', docData.id)
        await setDoc(docRef, {
          ...docData,
          candidateId: p.id || 'candidate-1',
          createdAt: new Date().toISOString()
        })
      } catch (err) {
        console.warn('Firestore document record sync notice:', err)
      }
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
      try {
        const projRef = doc(db, 'projects', projectData.id)
        await setDoc(projRef, {
          ...projectData,
          candidateId: p.id || 'candidate-1',
          updatedAt: new Date().toISOString()
        })
      } catch (err) {
        console.warn('Firestore project sync notice:', err)
      }
    }
    return projectData
  }
}
