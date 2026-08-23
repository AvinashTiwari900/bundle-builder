import { saveFile, getFile, deleteFile } from './storageService'

const FILE_KEY = 'rap_files'

export const documentService = {
  async upload(type:string, file:File){
    const id = await saveFile(file)
    const profileRaw = localStorage.getItem('rap_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : { id:'candidate-1', documents:[] }
    profile.documents = profile.documents || []
    profile.documents.push({ id, name: file.name, type, uploadedAt: new Date().toISOString(), status: 'Uploaded' })
    localStorage.setItem('rap_profile', JSON.stringify(profile))
    return { id, name: file.name }
  },
  list(){
    const profileRaw = localStorage.getItem('rap_profile')
    const profile = profileRaw ? JSON.parse(profileRaw) : { documents:[] }
    return profile.documents || []
  },
  async getFileUrl(id:string){
    const rec = await getFile(id)
    if(!rec) return null
    const url = URL.createObjectURL(rec.blob)
    return { url, name: rec.name, type: rec.type }
  },
  async verifyDemo(id:string){
    const otp = prompt('Enter demo OTP (123456)')
    if(otp==='123456'){
      // update profile doc status
      const profileRaw = localStorage.getItem('rap_profile')
      if(profileRaw){ const profile = JSON.parse(profileRaw); profile.documents = (profile.documents||[]).map((d:any)=> d.id===id? {...d,status:'Verified'}:d); localStorage.setItem('rap_profile', JSON.stringify(profile)) }
      return { success:true }
    }
    return { success:false }
  },
  async replace(id:string, file:File){
    // replace blob, keep same id
    await saveFile(file) // we create new id; simple approach: upload new and update metadata
    return this.upload(file.type, file)
  },
  async delete(id:string){
    await deleteFile(id)
    const profileRaw = localStorage.getItem('rap_profile')
    if(profileRaw){ const profile = JSON.parse(profileRaw); profile.documents = (profile.documents||[]).filter((d:any)=>d.id!==id); localStorage.setItem('rap_profile', JSON.stringify(profile)) }
  }
}
