import { Request, Response } from 'express'
import { SarvamVoiceService } from '../services/sarvam.service'

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
  category?: string
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

export class VoicePracticeController {
  /**
   * GET /api/v1/voice-practice/status
   * Check if Sarvam AI backend service is active
   */
  static getStatus(req: Request, res: Response) {
    const isSarvamConfigured = SarvamVoiceService.isAvailable()
    return res.status(200).json({
      success: true,
      service: 'RAS AI Voice Interview Practice Studio',
      provider: isSarvamConfigured ? 'Sarvam AI' : 'Web Speech API (Fallback Mode)',
      sarvamActive: isSarvamConfigured,
      models: {
        stt: 'saarika:v2',
        tts: 'bulbul:v1'
      },
      supportedLanguages: ['en-IN', 'hi-IN']
    })
  }

  /**
   * POST /api/v1/voice-practice/session/start
   * Initialize a new adaptive practice interview session
   */
  static async startSession(req: Request, res: Response) {
    try {
      const {
        candidate,
        targetRole = 'Software Engineer',
        mode = 'recruiter', // 'recruiter' (Sarah) | 'technical' (Alex)
        languageCode = 'en-IN'
      } = req.body

      const firstName = candidate?.name ? candidate.name.split(' ')[0] : 'there'
      const role = targetRole || candidate?.role || 'Software Professional'

      let initialQuestion = ''
      let initialCategory = 'intro'
      const speaker = mode === 'recruiter' ? 'meera' : 'arvind'

      if (mode === 'recruiter') {
        initialQuestion = `Hello ${firstName}! I am Sarah, your simulated RAS AI Talent Partner. We are starting a 15-minute practice session today for the ${role} position. To kick things off, could you walk me through your professional background and current responsibilities?`
        initialCategory = 'intro'
      } else {
        initialQuestion = `Hello ${firstName}! Welcome to your technical mock interview for the ${role} role. I'm Alex, your senior AI technical lead. Let's begin — could you share a high-level overview of your recent engineering focus and core stack?`
        initialCategory = 'intro'
      }

      // Generate TTS audio via Sarvam AI
      const ttsResult = await SarvamVoiceService.synthesizeSpeech(initialQuestion, {
        speaker,
        targetLanguageCode: languageCode,
        pace: 1.0,
        loudness: 1.5
      })

      return res.status(200).json({
        success: true,
        sessionId: `session-${Date.now()}`,
        mode,
        targetRole,
        initialQuestion,
        initialCategory,
        difficulty: 'intermediate',
        audioBase64: ttsResult?.audioBase64 || null,
        audioFormat: ttsResult?.format || null,
        provider: ttsResult ? 'sarvam' : 'browser_fallback'
      })
    } catch (error: any) {
      console.error('[VoicePracticeController.startSession] Error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize voice interview session',
        error: error?.message
      })
    }
  }

  /**
   * POST /api/v1/voice-practice/transcribe
   * Transcribe candidate audio via Sarvam STT (saarika:v2)
   */
  static async transcribeAudio(req: Request, res: Response) {
    try {
      const { audioBase64, mimeType = 'audio/webm', languageCode = 'en-IN' } = req.body

      if (!audioBase64) {
        return res.status(400).json({
          success: false,
          message: 'audioBase64 payload is required'
        })
      }

      const audioBuffer = Buffer.from(audioBase64, 'base64')
      const result = await SarvamVoiceService.transcribeAudio(audioBuffer, mimeType, languageCode)

      return res.status(200).json({
        success: true,
        transcript: result.transcript,
        languageCode: result.languageCode,
        confidence: result.confidence,
        provider: result.provider
      })
    } catch (error: any) {
      console.error('[VoicePracticeController.transcribeAudio] Error:', error)
      return res.status(500).json({
        success: false,
        message: 'Audio transcription failed',
        error: error?.message
      })
    }
  }

  /**
   * POST /api/v1/voice-practice/turn
   * Adaptive Question Engine: Understand Answer -> Analyze -> Follow-Up / Adapt -> Sarvam TTS
   */
  static async nextTurn(req: Request, res: Response) {
    try {
      const {
        turns = [],
        candidate = {},
        targetRole = 'Software Engineer',
        currentDifficulty = 'intermediate',
        actionType = 'normal', // 'normal' | 'repeat' | 'clarify' | 'skip'
        mode = 'recruiter',
        languageCode = 'en-IN'
      } = req.body

      const lastAiTurn = [...turns].reverse().find((t: ConversationTurn) => t.speaker === 'ai')
      const lastCandidateTurn = [...turns].reverse().find((t: ConversationTurn) => t.speaker === 'candidate')
      const candidateAnswer = (lastCandidateTurn?.text || '').trim()

      const speaker = mode === 'recruiter' ? 'meera' : 'arvind'

      // 1. Handle Special Candidate Actions
      if (actionType === 'repeat') {
        const text = `Certainly. Let me repeat: ${lastAiTurn?.text || 'Could you tell me more about your recent project?'}`
        const tts = await SarvamVoiceService.synthesizeSpeech(text, { speaker, targetLanguageCode: languageCode })
        return res.status(200).json({
          success: true,
          next_question: text,
          category: lastAiTurn?.category || 'intro',
          difficulty: currentDifficulty,
          follow_up: false,
          audioBase64: tts?.audioBase64 || null
        })
      }

      if (actionType === 'clarify') {
        const text = mode === 'recruiter'
          ? `To clarify: As a talent partner, I want to understand how you articulate your impact, work preferences, and how you collaborate. Could you share your perspective on that?`
          : `To clarify: I'm focusing on your architectural implementation, how you handled production constraints, and the trade-offs you considered. Could you elaborate?`
        const tts = await SarvamVoiceService.synthesizeSpeech(text, { speaker, targetLanguageCode: languageCode })
        return res.status(200).json({
          success: true,
          next_question: text,
          category: lastAiTurn?.category || 'technical',
          difficulty: currentDifficulty,
          follow_up: false,
          audioBase64: tts?.audioBase64 || null
        })
      }

      if (actionType === 'skip' || /i don't know|not sure|no idea|skip|can't answer/i.test(candidateAnswer)) {
        const ack = 'That is completely fine. In interviews, it is always best to be upfront and transparent.'
        const nextCategory = mode === 'recruiter' ? 'work_mode' : 'behavioral'
        const easierQ = mode === 'recruiter'
          ? 'What type of team culture or working arrangement helps you do your best work?'
          : 'What is one core tool or library you feel most confident using in your day-to-day work?'

        const text = `${ack} Let's pivot to a different area: ${easierQ}`
        const tts = await SarvamVoiceService.synthesizeSpeech(text, { speaker, targetLanguageCode: languageCode })

        return res.status(200).json({
          success: true,
          next_question: text,
          category: nextCategory,
          difficulty: 'beginner',
          follow_up: false,
          audioBase64: tts?.audioBase64 || null,
          analysis: {
            identifiedKeywords: ['skipped'],
            qualityRating: 'uncertain',
            communicationScore: 65,
            technicalScore: 50,
            problemSolvingScore: 55,
            feedbackComment: 'Candidate passed on this prompt honestly without guessing.',
            isFollowUp: false
          }
        })
      }

      // 2. Analyze Candidate's Response (Natural keyword extraction & claims detection)
      const analysis = VoicePracticeController.analyzeAnswer(candidateAnswer, targetRole, lastAiTurn?.text || '', mode)
      const aiTurnsCount = turns.filter((t: ConversationTurn) => t.speaker === 'ai').length

      // 3. Dynamic Difficulty Transition
      let nextDifficulty: 'beginner' | 'intermediate' | 'advanced' = currentDifficulty
      if (analysis.qualityRating === 'strong') {
        nextDifficulty = currentDifficulty === 'beginner' ? 'intermediate' : 'advanced'
      } else if (analysis.qualityRating === 'weak') {
        nextDifficulty = currentDifficulty === 'advanced' ? 'intermediate' : 'beginner'
      }

      // 4. Dynamic Probing & Follow-Up Generator
      const followUp = VoicePracticeController.generateDynamicFollowUp(
        candidateAnswer,
        analysis.identifiedKeywords,
        targetRole,
        lastAiTurn?.text || '',
        mode
      )

      let nextQuestion = ''
      let nextCategory = 'technical'
      let isFollowUp = false

      if (followUp && !analysis.isFollowUp && aiTurnsCount < 7) {
        nextQuestion = followUp
        nextCategory = mode === 'recruiter' ? 'compensation' : 'project_deepdive'
        isFollowUp = true
      } else if (mode === 'recruiter') {
        // Recruiter Screening Flow
        const recruiterPlan = [
          { cat: 'project_deepdive', q: 'What would you consider your most impactful project or career accomplishment over the last year or two?' },
          { cat: 'motivation', q: 'What is your primary motivation for exploring new opportunities at this point, and what are you seeking in your next company?' },
          { cat: 'compensation', q: 'In recruiter screening calls, compensation is a key checkpoint. Could you share your current CTC and the expected salary bracket you are aiming for?' },
          { cat: 'notice_period', q: 'What is your official notice period with your current employer, and do you have any flexibility for an early buyout or accumulated leave adjustment?' },
          { cat: 'work_mode', q: 'Regarding work arrangements, are you looking primarily for Remote, Hybrid, or On-site roles, and are you open to relocation if the opportunity aligns?' },
          { cat: 'behavioral', q: 'How do you prefer to collaborate with engineering leads, product managers, and business stakeholders during high-pressure sprint cycles?' },
          { cat: 'candidate_q', q: 'We have covered the main recruiter screening checkpoints. In a real call, recruiters will always ask if you have questions. What questions would you like to ask me about the role, team culture, or hiring process?' }
        ]
        const step = recruiterPlan[Math.min(aiTurnsCount - 1, recruiterPlan.length - 1)] || recruiterPlan[0]
        nextQuestion = step.q
        nextCategory = step.cat
      } else {
        // Technical Mock Interview Flow
        if (aiTurnsCount === 1) {
          nextQuestion = candidate.projects?.[0]
            ? `You noted "${candidate.projects[0].title}" in your background. Can you describe your primary architectural responsibilities and key challenges in that project?`
            : `Could you walk me through a complex technical project you recently delivered, and explain your specific architectural contribution?`
          nextCategory = 'project_deepdive'
        } else if (aiTurnsCount === 2 || aiTurnsCount === 3) {
          nextQuestion = VoicePracticeController.getRoleTechnicalQuestion(targetRole, nextDifficulty)
          nextCategory = 'technical'
        } else if (aiTurnsCount === 4 || aiTurnsCount === 5) {
          nextQuestion = VoicePracticeController.getBehavioralQuestion(nextDifficulty)
          nextCategory = 'behavioral'
        } else {
          nextQuestion = 'We have covered the key technical and architectural scenarios for today. What questions do you have for me about the team, stack, or engineering roadmap?'
          nextCategory = 'candidate_q'
        }
      }

      // Generate TTS audio via Sarvam AI
      const ttsResult = await SarvamVoiceService.synthesizeSpeech(nextQuestion, {
        speaker,
        targetLanguageCode: languageCode,
        pace: 1.0,
        loudness: 1.5
      })

      return res.status(200).json({
        success: true,
        next_question: nextQuestion,
        category: nextCategory,
        difficulty: nextDifficulty,
        follow_up: isFollowUp,
        audioBase64: ttsResult?.audioBase64 || null,
        audioFormat: ttsResult?.format || null,
        provider: ttsResult ? 'sarvam' : 'browser_fallback',
        analysis: {
          ...analysis,
          isFollowUp,
          followUpTopic: isFollowUp ? analysis.identifiedKeywords[0] || 'Technical Probing' : undefined
        }
      })
    } catch (error: any) {
      console.error('[VoicePracticeController.nextTurn] Error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to process interview turn',
        error: error?.message
      })
    }
  }

  /**
   * Analyze candidate response text
   */
  private static analyzeAnswer(
    answer: string,
    role: string,
    question: string,
    mode: string
  ): {
    identifiedKeywords: string[]
    qualityRating: 'strong' | 'good' | 'average' | 'weak' | 'uncertain'
    communicationScore: number
    technicalScore: number
    problemSolvingScore: number
    isFollowUp: boolean
  } {
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
   * Dynamic follow-up prober
   */
  private static generateDynamicFollowUp(
    answer: string,
    keywords: string[],
    role: string,
    lastQuestion: string,
    mode: string
  ): string | null {
    const lower = answer.toLowerCase()

    if (mode === 'recruiter') {
      if (/lpa|k|thousand|lakh|crore|\d+\s*(to|-)\s*\d+/i.test(answer) && lastQuestion.toLowerCase().includes('compensation')) {
        return `You mentioned that salary expectation. Is that figure strictly base salary, or are you open to factoring in performance bonuses, retention allowances, and equity as part of your total CTC?`
      }
      if (/90 days|3 months|60 days|2 months/i.test(lower) && lastQuestion.toLowerCase().includes('notice')) {
        return `A notice period of that duration is common in enterprise firms. If the hiring team needed a faster onboarding, would your current employer entertain a notice buyout or leave deduction?`
      }
      if (/toxic|bad manager|politics|fired|laid off|micromanag/i.test(lower)) {
        return `In live recruiter calls, how would you reframe that challenge to emphasize your desire for positive leadership and career growth rather than past team friction?`
      }
    }

    const mlMatch = answer.match(/\b(xgboost|random forest|neural network|lstm|transformer|bert|gpt|logistic regression|kmeans|linear regression|svm)\b/i)
    if (mlMatch) {
      const algo = mlMatch[1]
      return `You mentioned using ${algo}. What factors led you to choose ${algo} over other alternative algorithms or baseline models for that specific dataset?`
    }

    const dbMatch = answer.match(/\b(snowflake|redis|postgresql|mongodb|kafka|dynamodb|mysql|elasticsearch|cassandra|spark|dbt)\b/i)
    if (dbMatch) {
      const tech = dbMatch[1]
      return `You highlighted working with ${tech}. How did you handle data schema consistency, query indexing, or throughput bottlenecks when scaling with ${tech}?`
    }

    const techMatch = answer.match(/\b(react|next\.js|node|fastapi|spring boot|docker|kubernetes|microservices|graphql|rest api|ci\/cd|aws|azure)\b/i)
    if (techMatch) {
      const tech = techMatch[1]
      return `You mentioned implementing ${tech}. What was the biggest architectural trade-off or debugging challenge you faced while adopting ${tech}?`
    }

    if (/reduced|increased|improved|boosted|accelerated|saved|optimized/i.test(lower)) {
      return `You noted achieving measurable improvements. What baseline metrics did you track, and how did you validate that the gains were attributable to your changes?`
    }

    return null
  }

  private static getRoleTechnicalQuestion(role: string, difficulty: string): string {
    const r = role.toLowerCase()
    if (r.includes('software') || r.includes('developer') || r.includes('frontend') || r.includes('backend')) {
      if (difficulty === 'advanced') return 'How would you design a distributed rate-limiting mechanism for a multi-region API that handles over 50,000 requests per second while maintaining sub-5ms latency?'
      if (difficulty === 'intermediate') return 'Can you explain how you handle database connection pooling and prevent race conditions when multiple concurrent transactions update the same resource?'
      return 'Can you explain the difference between synchronous and asynchronous execution in your primary programming language, and when you would use each?'
    }
    if (r.includes('data scientist') || r.includes('machine learning') || r.includes('ml')) {
      if (difficulty === 'advanced') return 'When deploying real-time inference pipelines, how do you continuously detect data drift and concept drift in production without incurring massive compute overhead?'
      if (difficulty === 'intermediate') return 'How do you handle severe class imbalance in a classification model, and why might accuracy be a misleading metric in such cases?'
      return 'Can you explain the bias-variance tradeoff and how regularization techniques like L1 and L2 help prevent overfitting?'
    }
    return 'Could you describe a challenging technical or domain problem you recently encountered, and the structured methodology you used to resolve it?'
  }

  private static getBehavioralQuestion(difficulty: string): string {
    if (difficulty === 'advanced') return 'Tell me about a time when you strongly disagreed with a technical or strategic decision made by senior leadership. How did you present your perspective, and what was the outcome?'
    if (difficulty === 'intermediate') return 'Describe a situation where a project deadline was at serious risk due to unforeseen roadblocks. What immediate actions did you take to manage stakeholder expectations and deliver?'
    return 'Can you share an example of a time you had to learn a completely unfamiliar technology or business domain on a tight timeline?'
  }

  /**
   * POST /api/v1/voice-practice/evaluate
   * Compute comprehensive end-of-interview diagnostic evaluation
   */
  static evaluateSession(req: Request, res: Response) {
    try {
      const {
        turns = [],
        candidate = {},
        targetRole = 'Software Engineer',
        mode = 'recruiter'
      } = req.body

      const candidateTurns = turns.filter((t: ConversationTurn) => t.speaker === 'candidate')
      const aiTurns = turns.filter((t: ConversationTurn) => t.speaker === 'ai')
      const interviewerName = mode === 'recruiter' ? 'Sarah (RAS AI Talent Partner)' : 'Alex (Senior Technical Lead)'

      let totalComm = 0
      let totalTechOrComp = 0
      let totalProbOrMotiv = 0
      let totalWords = 0
      const keywordsFound = new Set<string>()

      const questionBreakdowns: any[] = []

      candidateTurns.forEach((turn: ConversationTurn, idx: number) => {
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

      const count = Math.max(1, candidateTurns.length)
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

      const strengths: string[] = []
      if (avgComm >= 75) strengths.push('Clear, articulate verbal communication with confident professional tone.')
      if (mode === 'recruiter') {
        strengths.push('Provided direct, transparent responses on notice period and compensation parameters.')
        strengths.push('Demonstrated strong alignment with collaborative team dynamics.')
      } else {
        if (keywordsFound.size >= 2) strengths.push(`Demonstrated hands-on technical vocabulary: ${Array.from(keywordsFound).slice(0, 4).join(', ')}.`)
        strengths.push('Articulated project architecture and technical responsibilities.')
      }

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
        ? `You completed a ${candidateTurns.length}-turn 15-min recruiter screening simulation with Sarah for the ${targetRole} role. Your demonstrated strengths include ${strengths[0]?.toLowerCase() || 'solid engagement'}. Focusing on ${areasForImprovement[0]?.toLowerCase() || 'structured responses'} will maximize your interview callback rate.`
        : `You completed a ${candidateTurns.length}-turn technical mock interview with Alex for the ${targetRole} position. Your demonstrated strengths include ${strengths[0]?.toLowerCase() || 'solid engagement'}. Focusing on ${areasForImprovement[0]?.toLowerCase() || 'structured responses'} will help you stand out in live rounds.`

      return res.status(200).json({
        success: true,
        evaluation: {
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
      })
    } catch (error: any) {
      console.error('[VoicePracticeController.evaluateSession] Error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview evaluation',
        error: error?.message
      })
    }
  }
}
