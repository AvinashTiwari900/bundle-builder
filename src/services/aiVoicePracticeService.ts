/**
 * RAS AI Voice Interview Practice Engine
 *
 * Implements realistic, adaptive candidate mock interviews:
 * 1. Sarah — RAS AI Talent Partner (15-Minute Recruiter Screening Call Practice)
 * 2. Alex — Senior Technical Lead (Deep Technical & Architecture Simulation)
 *
 * Features:
 * - Dynamic answer analysis & follow-up generation (Question -> Answer -> Analyze -> Follow-up/Adapt)
 * - Sourced candidate context (Skills, Projects, Experience, Location)
 * - Strict practice simulation (Zero real recruitment decisions, zero hiring screening)
 * - Evidence-based performance diagnostics & structured feedback
 */

export type InterviewerMode = 'recruiter' | 'technical'

export interface CandidateContext {
  name: string
  role: string
  skills: string[]
  tools: string[]
  experienceYears: number
  projects: Array<{ title: string; description: string; technologies?: string[] }>
  headline?: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  location?: string
}

export interface ConversationTurn {
  id: string
  speaker: 'ai' | 'candidate'
  text: string
  timestamp: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: 'intro' | 'technical' | 'project_deepdive' | 'behavioral' | 'situational' | 'candidate_q' | 'compensation' | 'notice_period' | 'motivation' | 'work_mode' | 'wrap_up'
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
  mode: InterviewerMode
  interviewerName: string
  categoryScores: {
    communication: number
    technicalOrCompensation: number
    problemSolvingOrMotivation: number
    answerDepth: number
    confidenceAndStructure: number
  }
  categoryLabels: {
    category1: string
    category2: string
    category3: string
    category4: string
    category5: string
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
   * Generates the initial interview opening question tailored to the persona and candidate profile
   */
  static getInitialGreeting(candidate: CandidateContext, targetRole: string, mode: InterviewerMode = 'recruiter'): string {
    const firstName = candidate.name ? candidate.name.split(' ')[0] : 'there'
    const role = targetRole || candidate.role || 'Software Professional'

    if (mode === 'recruiter') {
      return `Hello ${firstName}! This is Sarah, your simulated RAS AI Talent Partner. We are doing a 15-minute practice session today to help you master recruiter screening calls for the ${role} position. Is now a good time to get started with a brief overview of your current role?`
    }

    return `Hello ${firstName}! Welcome to your technical mock interview for the ${role} role. I'm Alex, your senior AI interviewer. Let's begin with a quick introduction — could you walk me through your professional background and recent engineering focus?`
  }

  /**
   * Evaluates candidate's answer and dynamically decides the next question or follow-up
   */
  static generateNextQuestion(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string,
    currentDifficulty: 'beginner' | 'intermediate' | 'advanced',
    actionType: 'normal' | 'repeat' | 'clarify' | 'skip' = 'normal',
    mode: InterviewerMode = 'recruiter'
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
      return {
        question: mode === 'recruiter'
          ? `To clarify: As a recruiter, I'm trying to understand your practical experience, what you enjoy doing day-to-day, and how you articulate your impact. Could you share your thoughts with that in mind?`
          : `To clarify: I'm interested in understanding your practical technical implementation, architectural decisions, and how you tackle trade-offs in production. Could you elaborate?`,
        category: lastAiTurn?.category || 'technical',
        difficulty: currentDifficulty
      }
    }

    // 3. Handle "I don't know" or Skip
    if (actionType === 'skip' || /i don't know|not sure|no idea|skip|can't answer/i.test(candidateAnswer)) {
      const ack = 'That is completely fine. In interviews, it is always best to be upfront and transparent.'
      const nextCategory: ConversationTurn['category'] = mode === 'recruiter' ? 'work_mode' : 'behavioral'
      const easierQuestion = mode === 'recruiter'
        ? 'What type of team culture or working arrangement helps you do your best work?'
        : 'What is one core tool or library you feel most confident using in your day-to-day work?'

      return {
        question: `${ack} Let's pivot to a different area: ${easierQuestion}`,
        category: nextCategory,
        difficulty: 'beginner',
        analysis: {
          identifiedKeywords: ['skipped'],
          qualityRating: 'uncertain',
          communicationScore: 65,
          technicalScore: 50,
          problemSolvingScore: 55,
          feedbackComment: 'Candidate passed on this prompt honestly without guessing.',
          isFollowUp: false
        }
      }
    }

    // 4. Analyze candidate response
    const analysis = this.analyzeCandidateAnswer(candidateAnswer, targetRole, lastAiTurn?.text || '', mode)
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
    const followUp = this.findDynamicFollowUp(candidateAnswer, analysis.identifiedKeywords, targetRole, lastAiTurn?.text || '', mode)

    if (followUp && !analysis.isFollowUp && aiTurnsCount < 7) {
      return {
        question: `${ack} ${followUp}`,
        category: mode === 'recruiter' ? 'compensation' : 'project_deepdive',
        difficulty: nextDifficulty,
        analysis: {
          ...analysis,
          isFollowUp: true,
          followUpTopic: analysis.identifiedKeywords[0] || 'Clarification'
        }
      }
    }

    // =========================================================================
    // 6A. RECRUITER SCREENING CALL PROGRESSION (Sarah - 15-Min HR Practice)
    // =========================================================================
    if (mode === 'recruiter') {
      if (aiTurnsCount === 1) {
        // Turn 2: Key Accomplishment & Core Strengths
        return {
          question: `${ack} What would you consider your most impactful project or career accomplishment over the last year or two?`,
          category: 'project_deepdive',
          difficulty: nextDifficulty,
          analysis
        }
      }

      if (aiTurnsCount === 2) {
        // Turn 3: Career Motivation & Reason for Change
        return {
          question: `${ack} What is your primary motivation for exploring new opportunities at this point, and what are you seeking in your next company?`,
          category: 'motivation',
          difficulty: nextDifficulty,
          analysis
        }
      }

      if (aiTurnsCount === 3) {
        // Turn 4: Compensation & Salary Expectations Practice
        return {
          question: `${ack} In recruiter calls, compensation is always a key checkpoint. Could you share your current CTC and the expected salary bracket you are aiming for?`,
          category: 'compensation',
          difficulty: nextDifficulty,
          analysis
        }
      }

      if (aiTurnsCount === 4) {
        // Turn 5: Notice Period & Joining Timeline
        return {
          question: `${ack} What is your official notice period with your current employer, and do you have any flexibility for an early buyout or accumulated leave adjustment?`,
          category: 'notice_period',
          difficulty: nextDifficulty,
          analysis
        }
      }

      if (aiTurnsCount === 5) {
        // Turn 6: Work Mode, Location & Relocation
        return {
          question: `${ack} Regarding work arrangements, are you looking primarily for Remote, Hybrid, or On-site roles, and are you open to relocation if the opportunity aligns?`,
          category: 'work_mode',
          difficulty: nextDifficulty,
          analysis
        }
      }

      if (aiTurnsCount === 6) {
        // Turn 7: Cultural Fit & Team Collaboration
        return {
          question: `${ack} How do you prefer to collaborate with engineering leads, product managers, and business stakeholders during high-pressure sprint cycles?`,
          category: 'behavioral',
          difficulty: nextDifficulty,
          analysis
        }
      }

      // Final Turn: Candidate's Questions to the Recruiter
      return {
        question: `${ack} We have covered the main recruiter screening checkpoints. In a real call, recruiters will always ask if you have questions. What questions would you like to ask me about the role, team culture, or hiring process?`,
        category: 'candidate_q',
        difficulty: nextDifficulty,
        analysis
      }
    }

    // =========================================================================
    // 6B. TECHNICAL INTERVIEW PROGRESSION (Alex - Senior Tech Simulation)
    // =========================================================================
    if (aiTurnsCount === 1) {
      const projectPrompt = candidate.projects?.[0]
        ? `You noted "${candidate.projects[0].title}" in your background. Can you describe your primary architectural responsibilities and key challenges in that project?`
        : `Could you walk me through a complex technical project you recently delivered, and explain your specific architectural contribution?`

      return {
        question: `${ack} ${projectPrompt}`,
        category: 'project_deepdive',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 2 || aiTurnsCount === 3) {
      const techQ = this.getRoleTechnicalQuestion(targetRole, nextDifficulty)
      return {
        question: `${ack} ${techQ}`,
        category: 'technical',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 4 || aiTurnsCount === 5) {
      const behavioralQ = this.getBehavioralQuestion(nextDifficulty)
      return {
        question: `${ack} ${behavioralQ}`,
        category: 'behavioral',
        difficulty: nextDifficulty,
        analysis
      }
    }

    if (aiTurnsCount === 6) {
      const situationalQ = this.getSituationalQuestion(targetRole, nextDifficulty)
      return {
        question: `${ack} ${situationalQ}`,
        category: 'situational',
        difficulty: nextDifficulty,
        analysis
      }
    }

    return {
      question: `${ack} We have covered the main technical and architectural areas for today's session. Do you have any questions for me about the team, stack, or engineering roadmap?`,
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
    lastQuestion: string,
    mode: InterviewerMode = 'recruiter'
  ): string | null {
    const lower = answer.toLowerCase()

    // 1. Recruiter Mode: Salary Probing
    if (mode === 'recruiter') {
      if (/lpa|k|thousand|lakh|crore|\d+\s*(to|-)\s*\d+/i.test(answer) && lastQuestion.toLowerCase().includes('compensation')) {
        return `You mentioned that salary expectation. Is that figure strictly base salary, or are you open to factoring in performance bonuses, retention allowances, and equity as part of your total CTC?`
      }

      if (/90 days|3 months|60 days|2 months/i.test(lower) && lastQuestion.toLowerCase().includes('notice')) {
        return `A notice period of that duration is common in enterprise firms. If the hiring team needed a faster onboarding, would your current employer entertain a notice buyout or leave deduction?`
      }

      if (/toxic|bad manager|politics|fired|laid off|micromanag/i.test(lower)) {
        return `Thank you for being open. In live recruiter calls, how would you reframe that challenge to emphasize your desire for positive leadership and career growth rather than past team friction?`
      }
    }

    // 2. Technical Mode: Specific ML / Algorithm mention
    const mlMatch = answer.match(/\b(xgboost|random forest|neural network|lstm|transformer|bert|gpt|logistic regression|kmeans|linear regression|svm)\b/i)
    if (mlMatch) {
      const algo = mlMatch[1]
      return `You mentioned using ${algo}. What factors led you to choose ${algo} over other alternative algorithms or baseline models for that specific dataset?`
    }

    // 3. Database / Data Warehouse mention
    const dbMatch = answer.match(/\b(snowflake|redis|postgresql|mongodb|kafka|dynamodb|mysql|elasticsearch|cassandra|spark|dbt)\b/i)
    if (dbMatch) {
      const tech = dbMatch[1]
      return `You highlighted working with ${tech}. How did you handle data schema consistency, query indexing, or throughput bottlenecks when scaling with ${tech}?`
    }

    // 4. Frontend / Backend Architecture
    const techMatch = answer.match(/\b(react|next\.js|node|fastapi|spring boot|docker|kubernetes|microservices|graphql|rest api|ci\/cd|aws|azure)\b/i)
    if (techMatch) {
      const tech = techMatch[1]
      return `You mentioned implementing ${tech}. What was the biggest architectural trade-off or debugging challenge you faced while adopting ${tech}?`
    }

    // 5. Quantifiable metrics claim
    if (/reduced|increased|improved|boosted|accelerated|saved|optimized/i.test(lower)) {
      return `You noted achieving measurable improvements. What baseline metrics did you track, and how did you rigorously validate that the gains were attributable to your changes?`
    }

    return null
  }

  /**
   * Evaluates text response quality and keyword presence
   */
  private static analyzeCandidateAnswer(
    answer: string,
    role: string,
    question: string,
    mode: InterviewerMode = 'recruiter'
  ): NonNullable<ConversationTurn['analysis']> {
    const words = answer.split(/\s+/).filter(Boolean)
    const wordCount = words.length

    const keywordRegex = /\b(sql|python|javascript|typescript|react|angular|vue|node|java|golang|c\+\+|aws|azure|gcp|docker|kubernetes|kafka|redis|postgres|mongodb|snowflake|dbt|spark|pandas|numpy|xgboost|tensorflow|pytorch|git|jira|scrum|agile|ci\/cd|rest|graphql|microservices|oauth|jwt|brd|frd|tableau|power bi|figma|selenium|cypress|junit|testing|architecture|latency|scalability|performance|security|compliance|lpa|ctc|notice|hybrid|remote|growth|leadership|ownership|culture)\b/gi
    const matched = answer.match(keywordRegex) || []
    const identifiedKeywords = Array.from(new Set(matched.map((w) => w.toLowerCase())))

    let qualityRating: 'strong' | 'good' | 'average' | 'weak' | 'uncertain' = 'average'
    let communicationScore = 72
    let technicalScore = 70
    let problemSolvingScore = 72

    if (wordCount < 8) {
      qualityRating = 'weak'
      communicationScore = 58
      technicalScore = 52
      problemSolvingScore = 54
    } else if (wordCount >= 35 && identifiedKeywords.length >= 2) {
      qualityRating = 'strong'
      communicationScore = 88
      technicalScore = 86
      problemSolvingScore = 87
    } else if (wordCount >= 18 || identifiedKeywords.length >= 1) {
      qualityRating = 'good'
      communicationScore = 80
      technicalScore = 76
      problemSolvingScore = 78
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
    difficulty: 'beginner' | 'intermediate' | 'advanced'
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

    return 'Could you describe a challenging technical or domain problem you recently encountered, and the structured methodology you used to resolve it?'
  }

  /**
   * Behavioral question picker
   */
  private static getBehavioralQuestion(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
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
   * Generates a comprehensive, evidence-based performance evaluation after mock interview completion
   */
  static generateEvaluation(
    turns: ConversationTurn[],
    candidate: CandidateContext,
    targetRole: string,
    mode: InterviewerMode = 'recruiter'
  ): InterviewEvaluation {
    const candidateTurns = turns.filter((t) => t.speaker === 'candidate')
    const aiTurns = turns.filter((t) => t.speaker === 'ai')
    const interviewerName = mode === 'recruiter' ? 'Sarah (RAS AI Talent Partner)' : 'Alex (Senior Technical Lead)'

    if (candidateTurns.length === 0) {
      return {
        overallScore: 50,
        mode,
        interviewerName,
        categoryScores: {
          communication: 50,
          technicalOrCompensation: 50,
          problemSolvingOrMotivation: 50,
          answerDepth: 50,
          confidenceAndStructure: 50
        },
        categoryLabels: mode === 'recruiter'
          ? {
              category1: 'Verbal Articulation',
              category2: 'Compensation Framing',
              category3: 'Career Motivation & Diplomacy',
              category4: 'Answer Relevance & Depth',
              category5: 'Recruiter Rapport & Confidence'
            }
          : {
              category1: 'Communication Clarity',
              category2: 'Technical & Domain Knowledge',
              category3: 'Problem Solving & Architecture',
              category4: 'Answer Depth & Rigor',
              category5: 'STAR Method Structure'
            },
        performanceSummary: 'Session concluded before answers were provided for full diagnostic evaluation.',
        strengths: ['Attended practice session'],
        areasForImprovement: ['Complete at least 3-4 questions for structured scoring'],
        recommendedTopics: ['Preliminary HR Screening Walkthrough', 'Salary Negotiation Basics'],
        questionBreakdowns: []
      }
    }

    let totalComm = 0
    let totalTechOrComp = 0
    let totalProbOrMotiv = 0
    let totalWords = 0
    const keywordsFound = new Set<string>()

    const questionBreakdowns: InterviewEvaluation['questionBreakdowns'] = []

    candidateTurns.forEach((turn, idx) => {
      const matchingAiTurn = aiTurns[idx]
      const words = turn.text.split(/\s+/).filter(Boolean).length
      totalWords += words

      const commScore = turn.analysis?.communicationScore || (words > 25 ? 78 : 62)
      const techScore = turn.analysis?.technicalScore || (turn.analysis?.identifiedKeywords.length ? 82 : 68)
      const probScore = turn.analysis?.problemSolvingScore || 72

      totalComm += commScore
      totalTechOrComp += techScore
      totalProbOrMotiv += probScore

      turn.analysis?.identifiedKeywords.forEach((k) => keywordsFound.add(k))

      const qScore = Math.round((commScore + techScore + probScore) / 3)
      const isShort = words < 12
      const hasKeywords = (turn.analysis?.identifiedKeywords.length || 0) > 0

      let assessment = ''
      let suggestion = ''

      if (mode === 'recruiter') {
        if (matchingAiTurn?.category === 'compensation') {
          assessment = 'Addressed compensation expectations directly.'
          suggestion = 'Always frame your salary as a range (e.g. ₹24–28 LPA) and state that you consider total rewards including bonuses and growth opportunities.'
        } else if (matchingAiTurn?.category === 'motivation') {
          assessment = 'Shared reasons for career transition.'
          suggestion = 'Keep motivation focused on seeking greater scope, leadership, or technical scale rather than dissatisfaction with past management.'
        } else if (isShort) {
          assessment = 'Answer was very brief.'
          suggestion = 'Give a 60-90 second structured answer covering Context, Action taken, and Results achieved.'
        } else {
          assessment = 'Strong professional articulation with appropriate recruiter rapport.'
          suggestion = 'Continue highlighting quantifiable team outcomes and your flexibility.'
        }
      } else {
        if (isShort) {
          assessment = 'Response was concise but lacked depth, concrete metrics, and architectural justification.'
          suggestion = 'Use the STAR technique (Situation, Task, Action, Result) to highlight specific decisions and trade-offs.'
        } else if (hasKeywords) {
          assessment = `Strong practical response demonstrating domain familiarity with ${turn.analysis?.identifiedKeywords.slice(0, 3).join(', ')}.`
          suggestion = 'Continue elaborating on architectural trade-offs and quantitative performance metrics.'
        } else {
          assessment = 'Good conversational delivery with clear articulation.'
          suggestion = 'Incorporate more domain-specific terminology and system trade-offs.'
        }
      }

      questionBreakdowns.push({
        question: matchingAiTurn?.text || `Question ${idx + 1}`,
        candidateAnswer: turn.text,
        category: matchingAiTurn?.category || 'general',
        score: qScore,
        assessment,
        suggestedBetterApproach: suggestion
      })
    })

    const count = candidateTurns.length
    const avgComm = Math.round(totalComm / count)
    const avgTechOrComp = Math.round(totalTechOrComp / count)
    const avgProbOrMotiv = Math.round(totalProbOrMotiv / count)
    const avgWordsPerAnswer = Math.round(totalWords / count)

    const answerDepthScore = Math.min(95, Math.max(50, Math.round(avgWordsPerAnswer * 1.5) + 30))
    const confidenceScore = Math.min(95, Math.max(55, Math.round((avgComm + avgProbOrMotiv) / 2)))

    const overallScore = Math.round(
      (avgComm * 0.25) +
      (avgTechOrComp * 0.25) +
      (avgProbOrMotiv * 0.20) +
      (answerDepthScore * 0.15) +
      (confidenceScore * 0.15)
    )

    // Formulate evidence-based strengths
    const strengths: string[] = []
    if (avgComm >= 75) strengths.push('Clear, articulate verbal communication with confident tone.')
    if (mode === 'recruiter') {
      strengths.push('Provided direct, transparent responses on notice period and compensation parameters.')
      strengths.push('Demonstrated strong alignment with collaborative team dynamics.')
    } else {
      if (keywordsFound.size >= 2) strengths.push(`Demonstrated hands-on technical vocabulary: ${Array.from(keywordsFound).slice(0, 4).join(', ')}.`)
      strengths.push('Articulated project architecture and technical responsibilities.')
    }

    // Areas for improvement
    const areasForImprovement: string[] = []
    if (avgWordsPerAnswer < 22) {
      areasForImprovement.push('Elaborate with more structural detail (Context -> Specific Action -> Quantified Outcome).')
    }
    if (mode === 'recruiter') {
      areasForImprovement.push('When discussing salary, emphasize your total value proposition before settling on a target bracket.')
      areasForImprovement.push('Prepare 2-3 strategic questions to ask the recruiter regarding team roadmap and growth culture.')
    } else {
      areasForImprovement.push('Deepen explanations around architectural trade-offs and edge-case handling.')
    }

    const recommendedTopics = mode === 'recruiter'
      ? [
          'Salary Negotiation Strategies for Phone Screens',
          'Framing Career Transitions with Positive Diplomacy',
          'Notice Period Buyout & Joining Flexibility Dialogue',
          'High-Impact Questions to Ask Your Recruiter'
        ]
      : [
          `${targetRole} Core Architecture & System Design`,
          'STAR Method Behavioral Storytelling',
          'Quantifying Engineering Impact (Latency, SLA, ROI)',
          'Handling Edge Cases & Distributed Bottlenecks'
        ]

    const categoryLabels = mode === 'recruiter'
      ? {
          category1: 'Verbal Articulation',
          category2: 'Compensation Framing',
          category3: 'Career Motivation & Diplomacy',
          category4: 'Answer Relevance & Depth',
          category5: 'Recruiter Rapport & Confidence'
        }
      : {
          category1: 'Communication Clarity',
          category2: 'Technical Knowledge',
          category3: 'Problem Solving & Architecture',
          category4: 'Answer Depth & Rigor',
          category5: 'STAR Method Structure'
        }

    const performanceSummary = mode === 'recruiter'
      ? `You completed a ${count}-turn 15-min recruiter screening simulation with Sarah for the ${targetRole} role. Your demonstrated strengths include ${strengths[0]?.toLowerCase() || 'solid engagement'}. Focusing on ${areasForImprovement[0]?.toLowerCase() || 'structured responses'} will maximize your interview callback rate.`
      : `You completed a ${count}-turn technical mock interview with Alex for the ${targetRole} position. Your demonstrated strengths include ${strengths[0]?.toLowerCase() || 'solid engagement'}. Focusing on ${areasForImprovement[0]?.toLowerCase() || 'structured responses'} will help you stand out in live rounds.`

    return {
      overallScore,
      mode,
      interviewerName,
      categoryScores: {
        communication: avgComm,
        technicalOrCompensation: avgTechOrComp,
        problemSolvingOrMotivation: avgProbOrMotiv,
        answerDepth: answerDepthScore,
        confidenceAndStructure: confidenceScore
      },
      categoryLabels,
      performanceSummary,
      strengths,
      areasForImprovement,
      recommendedTopics,
      questionBreakdowns
    }
  }
}
