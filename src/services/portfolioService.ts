export const portfolioService = {
  get() {
    const raw = localStorage.getItem('rap_portfolio')
    if (!raw) {
      return {
        intro: 'Passionate Business Analyst bridging data engineering and strategic decision-making.',
        about: 'With 5+ years of experience across fintech, analytics consulting, and e-commerce platforms, I specialize in crafting automated data pipelines, interactive dashboards, and executive insights.',
        skills: ['SQL', 'Power BI', 'Python', 'Excel', 'Agile', 'Stakeholder Management', 'ETL', 'Tableau'],
        featuredProjects: [],
        socials: {
          linkedin: 'https://linkedin.com/in/avinash-tiwari',
          github: 'https://github.com/avinash-tiwari',
          portfolioUrl: 'https://avinash-tiwari.dev'
        }
      }
    }
    try {
      return JSON.parse(raw)
    } catch {
      return { intro: '', about: '', skills: [], featuredProjects: [], socials: {} }
    }
  },

  save(portfolio: any) {
    localStorage.setItem('rap_portfolio', JSON.stringify(portfolio))
    return portfolio
  },

  strength(portfolio: any) {
    if (!portfolio) return 40
    let score = 20
    if (portfolio.intro && portfolio.intro.length > 20) score += 25
    if (portfolio.about && portfolio.about.length > 40) score += 25
    score += Math.min(20, (portfolio.skills || []).length * 4)
    score += Math.min(10, (portfolio.featuredProjects || []).length * 5)
    return Math.min(100, score)
  }
}
