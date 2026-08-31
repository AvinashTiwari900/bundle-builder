/**
 * RAS AI Voice Interview Practice Engine
 *
 * Implements realistic, adaptive candidate mock interviews:
 * - Dynamic answer analysis & follow-up generation (Question -> Answer -> Analyze -> Follow-up/Adapt)
 * - Role-based domain knowledge (Software, Data, BA, PM, QA, Design, HR, Sales, etc.)
 * - Adaptive difficulty (Beginner -> Intermediate -> Advanced)
 * - Evidence-based performance diagnostics & structured feedback
 * - Strict practice simulation (Zero recruitment decisions, zero hiring screening)
 */

export interface CandidateContext {
  name: string
  role: string
  skills: string[]
  tools: string[]
  experienceYears: number
  projects: Array<{ title: string; description: string; technologies?: string[] }>
  headline?: string
  targetCompany?: string
}

export interface ConversationTurn {
  id: string
  speaker: 'ai' | 'candidate'
  text: string
  timestamp: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: 'intro' | 'technical' | 'project_deepdive' | 'behavioral' | 'situational' | 'candidate_q' | 'wrap_up'
  analysis?: {
    identifiedKeywords: string[]
    qualityRating: 'strong' | 'good' | 'average' | 'weak' | 'uncertain'
    communicationScore: number
    technicalScore: number
    problemSolvingScore: number
    feedbackComment?: string
    isFollowUp: boolean
    followUpTopic?: string
  }
}

export interface InterviewEvaluation {
  overallScore: number
  categoryScores: {
    communication: number
    technicalKnowledge: number
    problemSolving: number
    answerDepth: number
    confidenceAndStructure: number
  }
  performanceSummary: string
  strengths: string[]
  areasForImprovement: string[]
  recommendedTopics: string[]
  questionBreakdowns: Array<{
    question: string
    candidateAnswer: string
    category: string
    score: number
    assessment: string
    suggestedBetterApproach: string
  }>
}

export const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Business Analyst',
  'Data Analyst',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'QA & Test Automation Engineer',
  'DevOps & Cloud Engineer',
  'HR & Talent Partner',
  'Sales & Account Executive',
  'Marketing & Growth Specialist',
  'Financial Analyst'
]

// Common natural acknowledgments
const NATURAL_ACKS = [
  'Okay.',
  'Got it.',
  'Understood.',
  'Thanks for explaining that.',
  'That makes sense.'
]

export class AiVoicePracticeService {
  /**
   * Generates the initial interview opening question tailored to the selected role and candidate profile
   */
  static getInitialGreeting(candidate: CandidateContext, targetRole: string): string {
    const firstName = candidate.name ? candidate.name.split(' ')[0] : 'there'
    const role = targetRole || candidate.role || 'Software Professional'

    return `Hello ${firstName}! Welcome to your RAS AI Voice Interview Practice session for the ${role} role. I will be your mock interviewer today. Let's begin with a quick introduction — could you walk me through your professional background and recent experience?`
  }

  /**
   * Evaluates candidate's answer and dynamically decides the next question or follow-up
   */
  static generateNextQuestion(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string,
    currentDifficulty: 'beginner' | 'intermediate' | 'advanced',
    actionType: 'normal' | 'repeat' | 'clarify' | 'skip' = 'normal'
  ): {
    question: string
    category: ConversationTurn['category']
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    analysis?: ConversationTurn['analysis']
  } {
    const lastAiTurn = [...turns].reverse().find((t) => t.speaker === 'ai')
    const lastCandidateTurn = [...turns].reverse().find((t) => t.speaker === 'candidate')
    const candidateAnswer = (lastCandidateTurn?.text || '').trim()

    // 1. Handle Repeat Request
    if (actionType === 'repeat') {
      return {
        question: `Certainly. Let me repeat: ${lastAiTurn?.text || 'Could you walk me through your background and experience?'}`,
        category: lastAiTurn?.category || 'intro',
        difficulty: currentDifficulty
      }
    }

    // 2. Handle Clarification Request
    if (actionType === 'clarify') {
      const topic = lastAiTurn?.text || ''
      return {
        question: `To clarify: I'm interested in understanding your practical experience with this topic, how you approach problem-solving in real-world scenarios, and the specific decisions you made. Could you share your thoughts on that?`,
        category: lastAiTurn?.category || 'technical',
        difficulty: currentDifficulty
      }
    }

    // 3. Handle "I don't know" or Skip
    if (actionType === 'skip' || /i don't know|not sure|no idea|skip|can't answer/i.test(candidateAnswer)) {
      const ack = 'That is completely fine. In interviews, it is always better to be honest when you are unfamiliar with a topic.'
      const nextCategory: ConversationTurn['category'] = turns.length <= 4 ? 'technical' : 'behavioral'
      const easierQuestion = this.getFallbackQuestion(nextCategory, targetRole, 'beginner')

      return {
        question: `${ack} Let's pivot to a different area: ${easierQuestion}`,
        category: nextCategory,
        difficulty: 'beginner',
        analysis: {
          identifiedKeywords: ['skipped'],
          qualityRating: 'uncertain',
          communicationScore: 60,
          technicalScore: 45,
          problemSolvingScore: 50,
          feedbackComment: 'Candidate chose to pass on this question. Handled honestly without bluffing.',
          isFollowUp: false
        }
      }
    }

    // 4. Analyze candidate response
    const analysis = this.analyzeCandidateAnswer(candidateAnswer, targetRole, lastAiTurn?.text || '')
    const aiTurnsCount = turns.filter((t) => t.speaker === 'ai').length

    // Dynamic difficulty adjustment
    let nextDifficulty = currentDifficulty
    if (analysis.qualityRating === 'strong') {
      nextDifficulty = currentDifficulty === 'beginner' ? 'intermediate' : 'advanced'
    } else if (analysis.qualityRating === 'weak') {
      nextDifficulty = currentDifficulty === 'advanced' ? 'intermediate' : 'beginner'
    }

    // Pick random natural acknowledgment
    const ack = NATURAL_ACKS[Math.floor(Math.random() * NATURAL_ACKS.length)]

    // 5. Dynamic Follow-Up Generation (Key Requirement)
    // If the candidate mentioned specific technologies, metrics, or methods, probe deeper
    const followUp = this.findDynamicFollowUp(candidateAnswer, analysis.identifiedKeywords, targetRole, lastAiTurn?.text || '')

    if (followUp && !analysis.isFollowUp && aiTurnsCount < 7) {
      return {
        question: `${ack} ${followUp}`,
        category: 'project_deepdive',
        difficulty: nextDifficulty,
        analysis: {
          ...analysis,
          isFollowUp: true,
          followUpTopic: analysis.identifiedKeywords[0] || 'Technical Implementation'
        }
      }
    }

    // 6. Phase-based Question Progression
    if (aiTurnsCount === 1) {
      // Turn 2: Project Deep-Dive
      const projectPrompt = candidate.projects?.[0]
        ? `You have noted "${candidate.projects[0].title}" in your background. Can you describe your primary architectural responsibilities and key challenges in that project?`
        : `Could you walk me through a complex technical or business project you recently delivered, and explain your specific contribution?`

      return {
        question: `${ack} ${projectPrompt}`,
        category: 'project_deepdive',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 2 || aiTurnsCount === 3) {
      // Turn 3-4: Role-Specific Technical & Problem Solving
      const techQ = this.getRoleTechnicalQuestion(targetRole, nextDifficulty, turns)
      return {
        question: `${ack} ${techQ}`,
        category: 'technical',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 4 || aiTurnsCount === 5) {
      // Turn 5-6: Behavioral / STAR Scenario
      const behavioralQ = this.getBehavioralQuestion(nextDifficulty, turns)
      return {
        question: `${ack} ${behavioralQ}`,
        category: 'behavioral',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 6) {
      // Turn 7: Situational / Leadership / Ambiguity Scenario
      const situationalQ = this.getSituationalQuestion(targetRole, nextDifficulty)
      return {
        question: `${ack} ${situationalQ}`,
        category: 'situational',
        difficulty: nextDifficulty,
        analysis
      }
    }

    // Final Turn: Candidate Q&A
    return {
      question: `${ack} We have covered the main technical and behavioral areas for today's practice. Do you have any questions for me about the role, team dynamics, or technology stack?`,
      category: 'candidate_q',
      difficulty: nextDifficulty,
      analysis
    }
  }

  /**
   * Natural keyword extraction and dynamic follow-up prober
   */
  private static findDynamicFollowUp(
    answer: string,
    keywords: string[],
    role: string,
    lastQuestion: string
  ): string | null {
    const lower = answer.toLowerCase()

    // 1. Specific ML / Algorithm mention (e.g. XGBoost, Random Forest, PyTorch, TensorFlow)
    const mlMatch = answer.match(/\b(xgboost|random forest|neural network|lstm|transformer|bert|gpt|logistic regression|kmeans|linear regression|svm)\b/i)
    if (mlMatch) {
      const algo = mlMatch[1]
      return `You mentioned using ${algo}. What factors led you to choose ${algo} over other alternative algorithms or baseline models for that specific dataset?`
    }

    // 2. Database / Data Warehouse mention (e.g. Snowflake, Redis, PostgreSQL, MongoDB, Kafka)
    const dbMatch = answer.match(/\b(snowflake|redis|postgresql|mongodb|kafka|dynamodb|mysql|elasticsearch|cassandra|spark|dbt)\b/i)
    if (dbMatch) {
      const tech = dbMatch[1]
      return `You highlighted working with ${tech}. How did you handle data schema consistency, query indexing, or throughput bottlenecks when scaling with ${tech}?`
    }

    // 3. Frontend / Backend Architecture (e.g. React, Next.js, Microservices, GraphQL, Docker, Kubernetes)
    const techMatch = answer.match(/\b(react|next\.js|node|fastapi|spring boot|docker|kubernetes|microservices|graphql|rest api|ci\/cd|aws|azure)\b/i)
    if (techMatch) {
      const tech = techMatch[1]
      return `You mentioned implementing ${tech}. What was the biggest architectural trade-off or debugging challenge you faced while adopting ${tech}?`
    }

    // 4. Business Analysis / PM metrics (e.g. BRD, Jira, Agile, Stakeholders, ROI, KPIs, Tableau, Power BI)
    const baMatch = answer.match(/\b(brd|frd|jira|agile|scrum|stakeholder|kpi|power bi|tableau|roi|conversion|retention)\b/i)
    if (baMatch) {
      const concept = baMatch[1]
      return `Regarding your work with ${concept}, how did you reconcile conflicting requirements from business stakeholders with engineering constraints?`
    }

    // 5. Performance / Metric claim (e.g. "reduced latency", "increased revenue", "improved accuracy")
    if (/reduced|increased|improved|boosted|accelerated|saved|optimized/i.test(lower)) {
      return `You noted achieving measurable improvements. What baseline metrics did you track, and how did you rigorously validate that the gains were attributable to your changes?`
    }

    // 6. If answer was concise but mentioned a team or lead role
    if (/lead|managed|guided|mentored|team/i.test(lower) && !lastQuestion.includes('leadership')) {
      return `You mentioned leading aspects of that initiative. How did you delegate responsibilities and ensure alignment across cross-functional team members?`
    }

    return null
  }

  /**
   * Evaluates text response quality and keyword presence
   */
  private static analyzeCandidateAnswer(
    answer: string,
    role: string,
    question: string
  ): NonNullable<ConversationTurn['analysis']> {
    const words = answer.split(/\s+/).filter(Boolean)
    const wordCount = words.length

    // Extract notable technical/domain words
    const keywordRegex = /\b(sql|python|javascript|typescript|react|angular|vue|node|java|golang|c\+\+|aws|azure|gcp|docker|kubernetes|kafka|redis|postgres|mongodb|snowflake|dbt|spark|pandas|numpy|xgboost|tensorflow|pytorch|git|jira|scrum|agile|ci\/cd|rest|graphql|microservices|oauth|jwt|brd|frd|tableau|power bi|figma|selenium|cypress|junit|testing|architecture|latency|scalability|performance|security|compliance)\b/gi
    const matched = answer.match(keywordRegex) || []
    const identifiedKeywords = Array.from(new Set(matched.map((w) => w.toLowerCase())))

    let qualityRating: 'strong' | 'good' | 'average' | 'weak' | 'uncertain' = 'average'
    let communicationScore = 70
    let technicalScore = 68
    let problemSolvingScore = 70

    if (wordCount < 8) {
      qualityRating = 'weak'
      communicationScore = 55
      technicalScore = 50
      problemSolvingScore = 52
    } else if (wordCount >= 40 && identifiedKeywords.length >= 2) {
      qualityRating = 'strong'
      communicationScore = 88
      technicalScore = 85
      problemSolvingScore = 86
    } else if (wordCount >= 20 || identifiedKeywords.length >= 1) {
      qualityRating = 'good'
      communicationScore = 78
      technicalScore = 75
      problemSolvingScore = 76
    }

    return {
      identifiedKeywords,
      qualityRating,
      communicationScore,
      technicalScore,
      problemSolvingScore,
      isFollowUp: false
    }
  }

  /**
   * Role-specific technical questions based on adaptive difficulty
   */
  private static getRoleTechnicalQuestion(
    role: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    turns: ConversationTurn[]
  ): string {
    const r = role.toLowerCase()

    if (r.includes('software') || r.includes('developer') || r.includes('frontend') || r.includes('backend') || r.includes('full stack')) {
      if (difficulty === 'advanced') {
        return 'How would you design a distributed rate-limiting mechanism for a multi-region API that handles over 50,000 requests per second while maintaining sub-5ms latency?'
      }
      if (difficulty === 'intermediate') {
        return 'Can you explain how you handle database connection pooling and prevent race conditions when multiple concurrent transactions update the same resource?'
      }
      return 'Can you explain the difference between synchronous and asynchronous execution in your primary programming language, and when you would use each?'
    }

    if (r.includes('data scientist') || r.includes('machine learning') || r.includes('ml')) {
      if (difficulty === 'advanced') {
        return 'When deploying real-time inference pipelines, how do you continuously detect data drift and concept drift in production without incurring massive compute overhead?'
      }
      if (difficulty === 'intermediate') {
        return 'How do you handle severe class imbalance in a classification model, and why might accuracy be a misleading metric in such cases?'
      }
      return 'Can you explain the bias-variance tradeoff and how regularization techniques like L1 and L2 help prevent overfitting?'
    }

    if (r.includes('data analyst') || r.includes('analytics')) {
      if (difficulty === 'advanced') {
        return 'How do you design an incremental ELT pipeline on Snowflake or BigQuery that computes complex sessionization metrics across billions of clickstream events?'
      }
      if (difficulty === 'intermediate') {
        return 'What are SQL window functions, and can you walk me through a scenario where you used PARTITION BY and LEAD/LAG to solve a reporting puzzle?'
      }
      return 'How do you ensure data integrity and validate that upstream data anomalies do not contaminate your executive dashboards?'
    }

    if (r.includes('business analyst')) {
      if (difficulty === 'advanced') {
        return 'When leading a major business process re-engineering project, how do you handle executive stakeholders who resist adopting proposed workflow automations?'
      }
      if (difficulty === 'intermediate') {
        return 'How do you distinguish between a genuine functional requirement and a user preference when creating a Business Requirement Document (BRD)?'
      }
      return 'What techniques do you rely on most during requirements elicitation when domain stakeholders have vague or conflicting expectations?'
    }

    if (r.includes('product manager') || r.includes('pm')) {
      if (difficulty === 'advanced') {
        return 'If you launched a major feature that increased signups by 20% but dropped 30-day retention by 8%, how would you diagnose the root cause and make a pivot decision?'
      }
      if (difficulty === 'intermediate') {
        return 'How do you prioritize competing requests between technical debt, executive requests, and high-impact customer feature asks using frameworks like RICE or Kano?'
      }
      return 'How do you define success metrics for an early-stage product MVP before meaningful statistical significance is reached?'
    }

    if (r.includes('qa') || r.includes('test')) {
      if (difficulty === 'advanced') {
        return 'How do you design a resilient test automation architecture in CI/CD pipelines that minimizes flaky tests across dynamic microservice dependencies?'
      }
      if (difficulty === 'intermediate') {
        return 'What is the difference between regression testing and smoke testing, and how do you prioritize test cases when release schedules are suddenly shortened?'
      }
      return 'How do you write effective test cases for API boundary conditions and security validation?'
    }

    if (r.includes('design') || r.includes('ui') || r.includes('ux')) {
      if (difficulty === 'advanced') {
        return 'How do you build and maintain a scalable design system that balances brand consistency with engineering implementation constraints across mobile and web?'
      }
      if (difficulty === 'intermediate') {
        return 'Can you describe your UX research methodology when validating usability on complex enterprise data interfaces?'
      }
      return 'How do you incorporate accessibility standards (WCAG) into your regular UI component designs?'
    }

    // Default fallback
    return 'Could you describe a challenging technical or domain problem you recently encountered, and the structured methodology you used to resolve it?'
  }

  /**
   * Behavioral question picker
   */
  private static getBehavioralQuestion(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    turns: ConversationTurn[]
  ): string {
    if (difficulty === 'advanced') {
      return 'Tell me about a time when you strongly disagreed with a technical or strategic decision made by senior leadership. How did you present your perspective, and what was the outcome?'
    }
    if (difficulty === 'intermediate') {
      return 'Describe a situation where a project deadline was at serious risk due to unforeseen roadblocks. What immediate actions did you take to manage stakeholder expectations and deliver?'
    }
    return 'Can you share an example of a time you had to learn a completely unfamiliar technology or business domain on a tight timeline?'
  }

  /**
   * Situational question picker
   */
  private static getSituationalQuestion(
    role: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    return 'Imagine you are given ambiguous project requirements with an aggressive deadline and conflicting feedback from two key team leads. How do you step in, establish clarity, and keep the team moving forward?'
  }

  /**
   * Fallback question
   */
  private static getFallbackQuestion(
    category: ConversationTurn['category'],
    role: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    if (category === 'technical') {
      return `What is one core tool or programming framework you feel most confident using in your day-to-day work, and why?`
    }
    if (category === 'behavioral') {
      return `Can you tell me about a project you enjoyed working on and what made it a positive experience?`
    }
    return `Could you tell me a little about the work culture and team environment where you do your best work?`
  }

  /**
   * Generates a comprehensive, evidence-based performance evaluation after mock interview completion
   */
  static generateEvaluation(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string
  ): InterviewEvaluation {
    const candidateTurns = turns.filter((t) => t.speaker === 'candidate')
    const aiTurns = turns.filter((t) => t.speaker === 'ai')

    if (candidateTurns.length === 0) {
      return {
        overallScore: 50,
        categoryScores: {
          communication: 50,
          technicalKnowledge: 50,
          problemSolving: 50,
          answerDepth: 50,
          confidenceAndStructure: 50
        },
        performanceSummary: 'Session ended before sufficient answers were provided for detailed evaluation.',
        strengths: ['Attended practice session'],
        areasForImprovement: ['Complete at least 4-5 interview questions for full diagnostic scoring'],
        recommendedTopics: ['Basic Introduction', 'Role Fundamentals'],
        questionBreakdowns: []
      }
    }

    // Compute metrics
    let totalComm = 0
    let totalTech = 0
    let totalProblem = 0
    let totalWords = 0
    const keywordsFound = new Set<string>()

    const questionBreakdowns: InterviewEvaluation['questionBreakdowns'] = []

    candidateTurns.forEach((turn, idx) => {
      const matchingAiTurn = aiTurns[idx]
      const words = turn.text.split(/\s+/).filter(Boolean).length
      totalWords += words

      const commScore = turn.analysis?.communicationScore || (words > 25 ? 75 : 60)
      const techScore = turn.analysis?.technicalScore || (turn.analysis?.identifiedKeywords.length ? 80 : 65)
      const probScore = turn.analysis?.problemSolvingScore || 70

      totalComm += commScore
      totalTech += techScore
      totalProblem += probScore

      turn.analysis?.identifiedKeywords.forEach((k) => keywordsFound.add(k))

      const qScore = Math.round((commScore + techScore + probScore) / 3)
      const isShort = words < 15
      const hasKeywords = (turn.analysis?.identifiedKeywords.length || 0) > 0

      let assessment = ''
      let suggestion = ''

      if (isShort) {
        assessment = 'Response was concise but lacked depth, concrete metrics, and structural justification.'
        suggestion = 'Use the STAR technique (Situation, Task, Action, Result) to provide a 2-3 minute structured response highlighting your specific contributions.'
      } else if (hasKeywords) {
        assessment = `Strong practical response demonstrating domain familiarity with ${turn.analysis?.identifiedKeywords.slice(0, 3).join(', ')}.`
        suggestion = 'Continue elaborating on trade-offs and quantitative results (e.g. latency reduced by X%, revenue boosted by Y).'
      } else {
        assessment = 'Good conversational delivery with clear articulation.'
        suggestion = 'Incorporate more domain-specific terminology and architecture decisions to elevate the response.'
      }

      questionBreakdowns.push({
        question: matchingAiTurn?.text || `Interview Question ${idx + 1}`,
        candidateAnswer: turn.text,
        category: matchingAiTurn?.category || 'general',
        score: qScore,
        assessment,
        suggestedBetterApproach: suggestion
      })
    })

    const count = candidateTurns.length
    const avgComm = Math.round(totalComm / count)
    const avgTech = Math.round(totalTech / count)
    const avgProb = Math.round(totalProblem / count)
    const avgWordsPerAnswer = Math.round(totalWords / count)

    const answerDepthScore = Math.min(95, Math.max(50, Math.round(avgWordsPerAnswer * 1.5) + 30))
    const confidenceScore = Math.min(95, Math.max(55, Math.round((avgComm + avgProb) / 2)))

    const overallScore = Math.round(
      (avgComm * 0.25) +
      (avgTech * 0.30) +
      (avgProb * 0.20) +
      (answerDepthScore * 0.15) +
      (confidenceScore * 0.10)
    )

    // Formulate evidence-based strengths
    const strengths: string[] = []
    if (avgComm >= 75) strengths.push('Clear, professional verbal articulation without filler language.')
    if (keywordsFound.size >= 3) strengths.push(`Demonstrated hands-on technical vocabulary: ${Array.from(keywordsFound).slice(0, 4).join(', ')}.`)
    if (avgWordsPerAnswer >= 30) strengths.push('Elaborated with context and relevant project examples.')
    if (strengths.length === 0) strengths.push('Honest and direct communication throughout the session.')

    // Areas for improvement
    const areasForImprovement: string[] = []
    if (avgWordsPerAnswer < 25) {
      areasForImprovement.push('Provide more detailed answers by structuring responses with Situation, Action, and Measurable Outcomes.')
    }
    if (keywordsFound.size < 2) {
      areasForImprovement.push(`Incorporate more specific frameworks and tools relevant to ${targetRole}.`)
    }
    if (avgTech < 75) {
      areasForImprovement.push('Deepen explanations around architectural trade-offs and alternative approaches.')
    }
    if (areasForImprovement.length === 0) {
      areasForImprovement.push('Challenge yourself with advanced-level system design and leadership scenarios.')
    }

    // Recommended practice topics
    const recommendedTopics: string[] = [
      `${targetRole} Core Competencies & Architecture`,
      'STAR Method Behavioral Storytelling',
      'Quantifying Business & Engineering Impact (KPIs)',
      'Handling Unfamiliar Questions with Grace'
    ]

    const performanceSummary = `You completed a ${count}-turn practice interview for the ${targetRole} position. Your demonstrated strengths include ${strengths[0]?.toLowerCase() || 'solid engagement'}. Focusing on ${areasForImprovement[0]?.toLowerCase() || 'structured responses'} will help you stand out in live employer rounds.`

    return {
      overallScore,
      categoryScores: {
        communication: avgComm,
        technicalKnowledge: avgTech,
        problemSolving: avgProb,
        answerDepth: answerDepthScore,
        confidenceAndStructure: confidenceScore
      },
      performanceSummary,
      strengths,
      areasForImprovement,
      recommendedTopics,
      questionBreakdowns
    }
  }
}
