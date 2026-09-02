import { profileService } from './profileService'

// Local-persistence helper for candidate profile sub-entities (resumes, KYC
// documents, projects). This used to also mirror writes to Firestore; that
// backend has been replaced by the Node/Express + PostgreSQL API (see
// server/), which owns the core profile going forward. Resumes/documents/
// projects/notifications/portfolio stay on localStorage until Phase 2
// migrates them onto the new API too - this module keeps the same call
// signatures so callers don't need to change in the meantime.
export const firestoreService = {
  async saveCandidateProfile(profileData: any) {
    profileService.save(profileData)
    return profileData
  },

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
    const p = profileService.get() || {}
    p.resumes = [resumeData, ...(p.resumes || []).filter((r: any) => r.id !== resumeData.id)]
    profileService.save(p)
    return resumeData
  },

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
    const p = profileService.get() || {}
    p.documents = [docData, ...(p.documents || []).filter((d: any) => d.id !== docData.id)]
    profileService.save(p)
    return docData
  },

  async saveProjectRecord(projectData: any) {
    const p = profileService.get() || {}
    p.projects = [projectData, ...(p.projects || []).filter((pr: any) => pr.id !== projectData.id)]
    profileService.save(p)
    return projectData
  }
}
