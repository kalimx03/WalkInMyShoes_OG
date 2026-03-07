import { useEffect, useState } from 'react'

export function useEmpathyScore() {
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState({
    knowledge: 0,
    engagement: 0,
    retries: 0,
    helpSeeking: 0,
    resilience: 0
  })
  const [level, setLevel] = useState('aware')

  // Calculate empathy score based on various factors
  const calculateScore = (metrics) => {
    const {
      knowledgeGain = 0,
      timeEngaged = 0,
      retriesRatio = 0,
      helpSeeking = 0,
      frustrationResilience = 0
    } = metrics

    // Normalize values (0-1 scale)
    const normalizedKnowledgeGain = Math.min(knowledgeGain / 100, 1)
    const normalizedTimeEngaged = Math.min(timeEngaged / 600, 1) // 10 minutes = 1.0
    const normalizedRetriesRatio = Math.max(0, 1 - (retries / 10)) // Fewer retries = better
    const normalizedHelpSeeking = Math.min(helpSeeking / 5, 1) // Some help seeking is good
    const normalizedFrustrationResilience = Math.max(0, 1 - (frustrationEvents / 5)) // Less frustration = better

    // Weighted calculation
    const totalScore = (
      normalizedKnowledgeGain * 0.30 +
      normalizedTimeEngaged * 0.20 +
      normalizedRetriesRatio * 0.20 +
      normalizedHelpSeeking * 0.15 +
      normalizedFrustrationResilience * 0.15
    ) * 100

    return Math.round(totalScore)
  }

  // Determine empathy level based on score
  const getEmpathyLevel = (score) => {
    if (score >= 71) {
      return { level: 'ally', badge: '🏅 Accessibility Ally', color: '#7c3aed' }
    } else if (score >= 41) {
      return { level: 'advocate', badge: '🥈 Accessibility Advocate', color: '#f59e0b' }
    } else {
      return { level: 'aware', badge: '🥉 Accessibility Aware', color: '#10b981' }
    }
  }

  // Update score with new metrics
  const updateScore = (newMetrics) => {
    const newScore = calculateScore(newMetrics)
    const newLevel = getEmpathyLevel(newScore)
    
    setScore(newScore)
    setLevel(newLevel.level)
    setBreakdown({
      knowledge: newMetrics.knowledgeGain || 0,
      engagement: newMetrics.timeEngaged || 0,
      retries: Math.max(0, 1 - (newMetrics.retries / 10)),
      helpSeeking: Math.min(newMetrics.helpRequests / 5, 1),
      resilience: Math.max(0, 1 - (newMetrics.frustrationEvents / 5))
    })

    return newScore
  }

  // Calculate score breakdown for different scenarios
  const calculateScenarioScore = (scenarioData) => {
    const {
      completionTime,
      errors,
      helpRequests,
      frustrationEvents,
      tasksCompleted,
      totalTasks
    } = scenarioData

    // Base score for completion
    const completionScore = (tasksCompleted / totalTasks) * 50

    // Time engagement (optimal time varies by scenario)
    const optimalTime = {
      visual: 900000, // 15 minutes
      hearing: 600000,  // 10 minutes
      motor: 1200000, // 20 minutes
      ar: 300000 // 5 minutes
    }

    const timeScore = completionTime <= optimalTime[scenarioData.scenarioType] ? 25 : 
                    completionTime <= optimalTime[scenarioData.scenarioType] * 1.5 ? 15 : 10

    // Error handling (fewer errors is better)
    const errorScore = Math.max(0, 25 - (errors * 5))

    // Help seeking (moderate help seeking is good)
    const helpScore = Math.min(helpRequests * 5, 25)

    // Frustration resilience (less frustration is better)
    const frustrationScore = Math.max(0, 25 - (frustrationEvents * 5))

    return {
      total: completionScore + timeScore + errorScore + helpScore + frustrationScore,
      breakdown: {
        completion: completionScore,
        time: timeScore,
        errors: errorScore,
        help: helpScore,
        frustration: frustrationScore
      }
    }
  }

  // Get score improvement suggestions
  const getImprovementSuggestions = (currentScore, targetScore) => {
    const improvement = targetScore - currentScore
    const suggestions = []

    if (improvement <= 0) {
      suggestions.push('Try to engage more with the AI guide for contextual help')
      suggestions.push('Take your time to complete tasks accurately')
      suggestions.push('Focus on understanding the accessibility barriers presented')
    } else if (improvement < 20) {
      suggestions.push('Great progress! Try to complete scenarios without errors')
      suggestions.push('Continue using the AI guide to learn more about accessibility')
      suggestions.push('Aim for better time completion in next attempts')
    } else if (improvement < 40) {
      suggestions.push('Good improvement! Consider trying harder difficulty levels')
      suggestions.push('Help others by sharing your experiences and insights')
      suggestions.push('Explore different accessibility scenarios to broaden understanding')
    } else {
      suggestions.push('Excellent empathy development!')
      suggestions.push('Consider becoming an accessibility advocate in your community')
      suggestions.push('Share your knowledge to help create more inclusive spaces')
      suggestions.push('Continue learning about different types of disabilities')
    }

    return suggestions
  }

  // Get motivational message based on score
  const getMotivationalMessage = (score) => {
    if (score >= 90) {
      return 'Outstanding! You\'re truly making a difference in accessibility awareness.'
    } else if (score >= 80) {
      return 'Excellent work! Your empathy and understanding are truly inspiring.'
    } else if (score >= 70) {
      return 'Great job! You\'re developing real empathy for accessibility challenges.'
    } else if (score >= 60) {
      return 'Good progress! Keep exploring and learning about accessibility.'
    } else if (score >= 40) {
      return 'Nice start! You\'re beginning to understand important accessibility concepts.'
    } else {
      return 'Keep going! Every step helps build empathy and awareness.'
    }
  }

  // Generate empathy score report
  const generateScoreReport = (sessionData) => {
    const report = {
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      timestamp: new Date().toISOString(),
      scenarios: sessionData.scenarios,
      overallScore: score,
      level: level.level,
      breakdown,
      insights: [],
      recommendations: []
    }

    // Add insights based on performance
    if (score < 40) {
      report.insights.push('Consider spending more time in each scenario to fully understand the challenges')
      report.insights.push('Use the AI guide more frequently for contextual assistance')
      report.insights.push('Try different approaches when facing difficulties')
    } else if (score < 70) {
      report.insights.push('You\'re building a good foundation of empathy and awareness')
      report.insights.push('Consider exploring advanced scenarios to deepen understanding')
      report.insights.push('Share your experiences to help others learn')
    } else {
      report.insights.push('You demonstrate exceptional empathy and accessibility awareness')
      report.insights.push('Consider becoming an accessibility advocate in your community')
      report.insights.push('Your understanding could help create more inclusive environments')
    }

    // Add recommendations
    if (score < 50) {
      report.recommendations.push('Complete all scenarios to gain comprehensive understanding')
      report.recommendations.push('Spend more time reading the educational content')
      report.recommendations.push('Practice active listening and observation skills')
    } else if (score < 80) {
      report.recommendations.push('Try advanced difficulty levels for greater challenge')
      report.recommendations.push('Share your insights with friends and colleagues')
      report.recommendations.push('Consider real-world accessibility auditing')
    } else {
      report.recommendations.push('Consider accessibility advocacy and consulting')
      report.recommendations.push('Help organizations improve their digital and physical accessibility')
      report.recommendations.push('Mentor others in accessibility awareness')
      report.recommendations.push('Contribute to accessibility standards and guidelines')
    }

    return report
  }

  return {
    score,
    level,
    breakdown,
    updateScore,
    calculateScenarioScore,
    getEmpathyLevel,
    getImprovementSuggestions,
    getMotivationalMessage,
    generateScoreReport
  }
}
