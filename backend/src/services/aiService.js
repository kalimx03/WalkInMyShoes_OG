import OpenAI from 'openai'

// Initialize OpenAI client with fallback
let openaiClient = null
let isConfigured = false

try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for demo - in production use Lambda proxy
    })
    isConfigured = true
  } else {
    console.warn('OpenAI API key not configured. Using mock responses.')
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error.message)
  isConfigured = false
}

class AIService {
  constructor() {
    this.isConfigured = isConfigured
  }

  // Mock scenario for development/demo
  getMockScenario(disabilityType, userSkillLevel) {
    const scenarios = {
      visual: {
        setting: 'Urban downtown area during lunch hour',
        tasks: [
          {
            id: 'navigate_crosswalk',
            name: 'Cross the street',
            description: 'Navigate to the crosswalk and cross the street safely',
            challenge: 'No visual landmarks, must listen for traffic patterns',
            learningObjective: 'Understand reliance on audio cues for navigation'
          },
          {
            id: 'find_cafe',
            name: 'Find a café',
            description: 'Locate and enter a nearby café',
            challenge: 'Can\'t read signs, must ask for directions',
            learningObjective: 'Experience need for clear audio signage and helpful staff'
          }
        ],
        barriers: [
          {
            type: 'lack_of_audio_cues',
            description: 'No tactile or audio feedback for obstacles',
            solution: 'Implement audio beacons and tactile feedback'
          }
        ],
        difficulty: userSkillLevel || 'beginner'
      },
      hearing: {
        setting: 'University lecture hall',
        tasks: [
          {
            id: 'understand_lecture',
            name: 'Follow the lecture',
            description: 'Attend and understand the lecture content',
            challenge: 'Cannot hear the instructor, must rely on captions',
            learningObjective: 'Understand the importance of accurate real-time captioning'
          }
        ],
        difficulty: userSkillLevel || 'beginner'
      },
      motor: {
        setting: 'Office building with accessibility barriers',
        tasks: [
          {
            id: 'enter_building',
            name: 'Enter the building',
            description: 'Navigate from parking to building entrance',
            challenge: 'Maneuvering wheelchair around obstacles',
            learningObjective: 'Experience physical barriers in everyday navigation'
          }
        ],
        difficulty: userSkillLevel || 'beginner'
      }
    }
    return scenarios[disabilityType] || scenarios.visual
  }
  async generateScenario(disabilityType, userSkillLevel, previousScenarios = []) {
    try {
      // Use mock if OpenAI is not configured
      if (!this.isConfigured) {
        console.warn('OpenAI not configured, using mock scenario')
        return this.getMockScenario(disabilityType, userSkillLevel)
      }

      const prompt = `Generate a realistic accessibility scenario for ${disabilityType} disability simulation.
      
      User skill level: ${userSkillLevel} (beginner/intermediate/advanced)
      Previous scenarios completed: ${previousScenarios.join(', ') || 'none'}
      
      Create a scenario that:
      1. Is appropriate for the user's skill level
      2. Avoids repetition of previous scenarios
      3. Includes realistic barriers and challenges
      4. Provides learning opportunities
      5. Can be completed in 10-25 minutes
      
      Return JSON with:
      {
        "setting": "detailed environment description",
        "tasks": [
          {
            "id": "task_id",
            "name": "task name",
            "description": "what user must do",
            "challenge": "main difficulty",
            "learningObjective": "what user learns"
          }
        ],
        "barriers": [
          {
            "type": "barrier type",
            "description": "what makes it challenging",
            "solution": "accessible alternative"
          }
        ],
        "npcs": [
          {
            "role": "character role",
            "behavior": "how they interact",
            "dialogue": "sample dialogue"
          }
        ],
        "accessibleRoutes": ["description of accessible paths"],
        "estimatedTime": "time in minutes",
        "difficulty": "beginner/intermediate/advanced"
      }`

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an accessibility expert creating realistic empathy training scenarios. Focus on educational value and authentic experiences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error('Error generating scenario:', error)
      // Fallback to mock scenario
      return this.getMockScenario(disabilityType, userSkillLevel)
      throw new Error('Failed to generate scenario')
    }
  }

  async adjustDifficulty(scenarioId, completionData) {
    try {
      const prompt = `Analyze user performance and suggest difficulty adjustments for scenario ${scenarioId}.
      
      Performance data:
      - Completion time: ${completionData.completionTime}ms
      - Errors made: ${completionData.errors}
      - Help requests: ${completionData.helpRequests}
      - Frustration events: ${completionData.frustrationEvents}
      - Current difficulty: ${completionData.currentDifficulty}
      
      Provide recommendations to optimize learning experience. Don't make it too easy or too hard.
      
      Return JSON with:
      {
        "newDifficulty": "beginner/intermediate/advanced",
        "adjustments": {
          "visionStage": 1-5 (for visual scenarios),
          "obstacleCount": number,
          "timerBonus": seconds,
          "hintFrequency": "low/medium/high"
        },
        "reasoning": "why these changes were made",
        "encouragement": "positive feedback for user"
      }`

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an adaptive learning expert optimizing difficulty for accessibility training."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error('Error adjusting difficulty:', error)
      throw new Error('Failed to adjust difficulty')
    }
  }

  async generateAccessibilityReport(violations, locationName, scanDate) {
    try {
      const prompt = `Generate a comprehensive accessibility audit report based on detected violations.
      
      Location: ${locationName}
      Scan date: ${scanDate}
      
      Violations detected:
      ${violations.map(v => `- ${v.type}: ${v.description} (${v.severity})`).join('\n')}
      
      Create a professional report including:
      1. Executive summary
      2. Critical issues (immediate safety/legal risks)
      3. Important issues (accessibility barriers)
      4. Minor issues (recommendations for improvement)
      5. Estimated costs to fix each issue
      6. Legal references (ADA sections)
      7. Prioritized remediation roadmap
      8. Long-term accessibility strategy
      
      Format as markdown with clear sections and actionable recommendations.`

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a certified accessibility consultant generating professional audit reports. Include specific ADA references and practical solutions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: true
      })

      return response
    } catch (error) {
      console.error('Error generating report:', error)
      throw new Error('Failed to generate accessibility report')
    }
  }

  async analyzeEmpathyPattern(sessionData, assessmentScores) {
    try {
      const prompt = `Analyze user's empathy development pattern and provide personalized insights.
      
      Session data:
      - Total time: ${sessionData.totalTime}ms
      - Scenarios completed: ${sessionData.scenariosCompleted}
      - Help seeking behavior: ${sessionData.helpRequests} requests
      - Error recovery: ${sessionData.retryCount} retries
      - Frustration management: ${sessionData.frustrationEvents} events
      
      Assessment scores:
      - Pre-assessment: ${assessmentScores.pre}%
      - Post-assessment: ${assessmentScores.post}%
      - Improvement: ${assessmentScores.post - assessmentScores.pre}%
      
      Provide analysis on:
      1. Learning style and preferences
      2. Strengths in empathy development
      3. Areas for continued growth
      4. Personalized recommendations
      5. Real-world application suggestions
      
      Return as encouraging, actionable insights.`

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an empathy development expert providing personalized coaching insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error analyzing empathy pattern:', error)
      throw new Error('Failed to analyze empathy pattern')
    }
  }

  async generateContextualGuideResponse(message, scene, scenarioData) {
    try {
      const systemPrompt = this.getSceneSpecificPrompt(scene, scenarioData)
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating guide response:', error)
      throw new Error('Failed to get AI guide response')
    }
  }

  getSceneSpecificPrompt(scene, scenarioData) {
    const basePrompt = "You are an accessibility expert AI guide in the WalkInMyShoes platform. Be empathetic, educational, and specific. Reference real statistics and ADA/WCAG standards. Keep responses concise but informative."
    
    switch (scene) {
      case 'visual':
        return `${basePrompt}
        
The user is experiencing a visual impairment simulation (stage ${scenarioData.visionStage || 1}/5).
Current context: Vision impairment affects 1 billion people globally.
Key statistics: 83% of websites fail WCAG contrast, 2.2 billion people have vision impairment.
Focus on: navigation strategies, assistive technology, environmental barriers.`
        
      case 'hearing':
        return `${basePrompt}
        
The user is experiencing hearing loss simulation (mode ${scenarioData.hearingMode || 1}/5).
Current context: 466 million people have disabling hearing loss.
Key statistics: Only 20% who could benefit use hearing aids, 75% of deaf children attend mainstream schools.
Focus on: communication strategies, assistive technology, social inclusion.`
        
      case 'motor':
        return `${basePrompt}
        
The user is navigating as a wheelchair user.
Current context: 2.2 million wheelchair users in the US, 30% report building access difficulties.
Key statistics: ADA requires 32" door width, 1:12 ramp slope, 60" turning radius.
Focus on: environmental barriers, ADA standards, mobility solutions.`
        
      case 'ar':
        return `${basePrompt}
        
The user is conducting an accessibility audit.
Current context: Most buildings have accessibility violations, many go unnoticed.
Key statistics: Average 15-50 violations per building, compliance costs vary widely.
Focus on: detection methods, compliance requirements, remediation strategies.`
        
      default:
        return basePrompt
    }
  }
}

export default new AIService()
