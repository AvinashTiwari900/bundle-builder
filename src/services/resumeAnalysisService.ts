export const resumeAnalysisService = {
  analyze(profile: any) {
    if (!profile) {
      return {
        score: 75,
        recommendations: [
          'Add 5+ core skills to boost job matching',
          'Include 2+ measurable projects in your portfolio',
          'Upload your latest PDF resume for recruiter screening'
        ],
        breakdown: { skills: 0, projects: 0, resumes: 0, keywords: 70, impact: 65 }
      }
    }

    const skillsCount = (profile.skills || []).length
    const projectsCount = (profile.projects || []).length
    const resumesCount = (profile.resumes || []).length

    const skillsScore = Math.min(30, skillsCount * 4)
    const projectsScore = Math.min(25, projectsCount * 12)
    const resumesScore = resumesCount > 0 ? 25 : 0
    const profileCompletenessScore = profile.headline && profile.location ? 15 : 5

    const score = Math.min(98, Math.max(45, skillsScore + projectsScore + resumesScore + profileCompletenessScore))

    const recommendations: string[] = []
    if (skillsCount < 6) recommendations.push('Add SQL, Power BI, Python or domain keywords to your top skills list')
    if (projectsCount < 2) recommendations.push('Add at least 2 quantified portfolio projects with outcomes (e.g. "improved speed by 30%")')
    if (resumesCount === 0) recommendations.push('Upload a primary ATS-friendly PDF resume to enable 1-click apply')
    if (!profile.targetSalary) recommendations.push('Specify target salary bracket to help match appropriate recruiter brackets')
    if (recommendations.length === 0) recommendations.push('Your profile and resume ATS match rating is in top 5% of candidates! Keep updated.')

    return {
      score,
      recommendations,
      breakdown: {
        skills: skillsCount,
        projects: projectsCount,
        resumes: resumesCount,
        keywords: Math.min(95, 60 + skillsCount * 5),
        impact: Math.min(95, 55 + projectsCount * 15)
      }
    }
  }
}
