import { jobService } from './jobService'
import { profileService } from './profileService'

function calculateMatch(profile:any, job:any){
  const skillMatch = ((job.skills||[]).filter((s:string)=> (profile.skills||[]).includes(s))).length
  const minExperience = parseInt((job.experience||'0').split('-')[0]) || 0
  const experienceBonus = (profile.experienceYears||0) >= minExperience ? 10 : 0
  const score = Math.min(100, 40 + skillMatch*15 + experienceBonus)
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
        const res = await jobService.applyToJob(j.id)
        if(res.success){
          matches.push(res.application)
        }
      }
    }
    return matches
  }
}
