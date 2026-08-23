import { saveFile, getFile, deleteFile } from './storageService'

export const resumeService = {
  async upload(file:File){
    const id = await saveFile(file)
    // attach to profile metadata
    const profileRaw = localStorage.getItem('rap_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : { id:'candidate-1', resumes:[] }
    profile.resumes = profile.resumes || []
    profile.resumes.push({ id, name: file.name, size: file.size, uploadedAt: new Date().toISOString() })
    localStorage.setItem('rap_profile', JSON.stringify(profile))
    return { id, name: file.name }
  },
  list(){
    const profileRaw = localStorage.getItem('rap_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : { resumes:[] }
    return profile.resumes || []
  },
  async getFileUrl(id:string){
    const rec = await getFile(id)
    if(!rec) return null
    const url = URL.createObjectURL(rec.blob)
    return { url, name: rec.name, type: rec.type, size: rec.size }
  },
  async delete(id:string){
    await deleteFile(id)
    const profileRaw = localStorage.getItem('rap_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : { resumes:[] }
    profile.resumes = (profile.resumes||[]).filter((r:any)=>r.id!==id)
    localStorage.setItem('rap_profile', JSON.stringify(profile))
  }
}
