import { jobService } from './jobService'
import { profileService } from './profileService'
import { notificationService } from './notificationService'

function calculateMatch(profile:any, job:any){
  const skillMatch = ((job.skills||[]).filter((s:string)=> (profile.skills||[]).includes(s))).length
  const score = Math.min(100, 40 + skillMatch*15 + ((profile.experienceYears||0)>=(parseInt((job.experience||'0').split('-')[0])?10:0)))
  return score
}

export const autoApplyService = {
  async run(settings:any){
    const jobs = await jobService.list()
    const profile = profileService.get()
    const matches = []
    for(const j of jobs){
      const match = calculateMatch(profile,j)
      if(match>= (settings.minMatch||70)){
        // create application
        const applications = profile.applications || []
        const exists = applications.find((a:any)=>a.jobId===j.id)
        if(!exists){
          const app = { id: 'app-'+Date.now()+'-'+Math.random().toString(36).slice(2,6), jobId: j.id, jobTitle: j.title, company: j.company, appliedDate: new Date().toISOString(), status: 'Applied (Auto)', matchScore: match }
          profile.applications = [...applications, app]
          localStorage.setItem('rap_profile', JSON.stringify(profile))
          notificationService.create({ title: 'Auto Apply submitted', message: `${j.title} at ${j.company}` })
          matches.push(app)
        }
      }
    }
    return matches
  }
}
