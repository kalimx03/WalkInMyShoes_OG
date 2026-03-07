import { useState, useCallback } from 'react'

export function useAIGuide() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Context-aware system prompts
  const getSystemPrompt = (scene, scenarioData) => {
    const basePrompt = "You are an accessibility expert AI guide in the WalkInMyShoes platform. Be empathetic, educational, and specific. Reference real statistics and ADA/WCAG standards. Keep responses concise but informative."
    
    switch (scene) {
      case 'visual':
        return `${basePrompt}
        
The user is experiencing a visual impairment simulation (currently at stage ${scenarioData.visionStage || 1}/5). 
They may ask about: WCAG contrast standards, types of vision loss, adaptive technologies, 
navigation strategies, screen readers, or their current task.

Current vision stage details:
- Stage 1: Mild Myopia (slight blur, mild desaturation)
- Stage 2: Moderate + Tunnel Vision (blur + vignette)
- Stage 3: Macular Degeneration (central blur, peripheral preserved)
- Stage 4: Advanced Cataracts (heavy blur, yellow tint, halos)
- Stage 5: Legal Blindness (near darkness, audio cues only)

Relevant stats: 1 billion people worldwide have vision loss, 83% of websites fail WCAG contrast standards.`

      case 'hearing':
        return `${basePrompt}
        
The user is experiencing ${scenarioData.hearingMode ? `hearing mode ${scenarioData.hearingMode}` : 'a'} hearing impairment.
They may ask about: hearing aid technology, deaf culture, captioning standards,
ASL, cochlear implants, visual alert systems, CART services.

Hearing mode details:
- Mode 1: Mild high frequency loss (3000Hz+)
- Mode 2: Moderate bilateral loss (1500Hz+)
- Mode 3: Severe + tinnitus (800Hz+ + ringing)
- Mode 4: Profound - near silence (5% volume)
- Mode 5: Unilateral - one side only

Relevant stats: 466 million people have disabling hearing loss, only 20% of those who could benefit use hearing aids.`

      case 'motor':
        return `${basePrompt}
        
The user is navigating as a wheelchair user.
They may ask about: ADA door width standards (32" min), ramp slopes (1:12 max),
turning radius (60" × 60" clear floor space), reach ranges (15"-48"),
accessible parking, elevator button heights, automatic door openers.

Key ADA standards:
- Door width: 32" minimum clear opening
- Ramp slope: 1:12 maximum (8.33% grade)
- Turning radius: 60" × 60" clear space
- Reach range: 15"-48" for forward reach
- Knee space: 30" × 48" × 27" clear

Relevant stats: 2.2 million people use wheelchairs in the US, 30% of wheelchair users report difficulty entering buildings.`

      case 'ar':
        return `${basePrompt}
        
The user is using the AR Accessibility Auditor.
They may ask about: object detection accuracy, ADA compliance checking,
color contrast requirements, ramp angle measurements, or how to fix violations.

Detection capabilities:
- Door width measurement (pixel-based estimation)
- Color contrast analysis (WCAG 2.1 AA/AAA)
- Ramp angle measurement (device orientation)
- Obstacle detection (chairs, carts blocking paths)
- Sign accessibility assessment

Accuracy: Object detection ~85%, contrast analysis ~95%, angle measurement depends on device calibration.`

      case 'dashboard':
        return `${basePrompt}
        
The user is viewing their impact dashboard.
They may ask about: empathy scoring methodology, how to improve their score,
what the statistics mean, or how to apply what they've learned.

Empathy score formula:
- Knowledge gain (30%): Pre/post assessment improvement
- Time engaged (20%): Normalized engagement time
- Retries ratio (20%): Learning from mistakes
- Help seeking (15%): Using AI guide appropriately
- Resilience (15%): Not giving up after frustration`

      default:
        return `${basePrompt}
        
The user is in the main menu or landing area.
They may ask about: available scenarios, how to get started, 
platform features, or accessibility of the app itself.

Available scenarios:
- Visual Impairment: 5-stage progressive vision loss simulation
- Hearing Loss: 5-mode audio processing simulation  
- Motor Disability: Wheelchair navigation with realistic physics
- AR Auditor: Real-time accessibility scanning

Platform features: AI guide, empathy scoring, certificates, leaderboard, multi-device support.`
    }
  }

  const sendMessage = useCallback(async (message, scene, scenarioData) => {
    setIsLoading(true)
    setError(null)

    try {
      const systemPrompt = getSystemPrompt(scene, scenarioData)
      
      // For demo purposes, return contextual responses
      // In production, this would call OpenAI API via Lambda
      const response = await generateContextualResponse(message, scene, scenarioData)
      
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Generate contextual responses for demo
  const generateContextualResponse = async (message, scene, scenarioData) => {
    const lowerMessage = message.toLowerCase()
    
    // Visual impairment responses
    if (scene === 'visual') {
      if (lowerMessage.includes('contrast') || lowerMessage.includes('read')) {
        return "WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold). The sign you're trying to read has poor contrast - this affects 83% of websites that fail compliance. Try getting closer or using the high contrast mode if available."
      }
      
      if (lowerMessage.includes('screen reader')) {
        return "Screen readers convert digital text to synthesized speech or braille. Popular ones include JAWS, NVDA (free), and VoiceOver (built-in). They navigate by headings, links, and landmarks. In this simulation, stage 5 simulates complete reliance on audio cues like screen reader users experience."
      }
      
      if (lowerMessage.includes('macular')) {
        return "Macular degeneration affects central vision, creating a blind spot where detail vision occurs. It's the leading cause of vision loss for people over 50. You're experiencing stage 3 - notice how your peripheral vision remains clear but central details are blurred. This affects reading, recognizing faces, and detailed tasks."
      }
      
      if (lowerMessage.includes('stage')) {
        const stage = scenarioData.visionStage || 1
        return `You're currently at stage ${stage}/5. Each stage simulates different types of vision loss. Stage ${stage} represents ${stage === 1 ? 'mild nearsightedness' : stage === 2 ? 'moderate vision loss with tunnel vision' : stage === 3 ? 'macular degeneration' : stage === 4 ? 'advanced cataracts' : 'legal blindness'}. This helps you understand the spectrum of visual impairments.`
      }
    }
    
    // Hearing loss responses
    if (scene === 'hearing') {
      if (lowerMessage.includes('caption') || lowerMessage.includes('subtitle')) {
        return "Captions are crucial for deaf and hard-of-hearing individuals. Auto-captions have only 70-85% accuracy, which is why you're seeing degraded captions in this simulation. Professional CART services achieve 99%+ accuracy. The difference between 70% and 99% accuracy can completely change comprehension."
      }
      
      if (lowerMessage.includes('tinnitus')) {
        return "Tinnitus affects 15-20% of people, causing ringing, buzzing, or hissing sounds. In stage 3, you're experiencing a 6000Hz tone - this simulates how tinnitus can mask speech sounds. Many people with tinnitus also have hearing loss, creating a double challenge in understanding speech."
      }
      
      if (lowerMessage.includes('loop') || lowerMessage.includes('hearing loop')) {
        return "Hearing loops (induction loops) transmit audio directly to hearing aids via telecoil. They're required in many public venues but often missing or broken. They eliminate background noise and improve speech understanding dramatically - from 30% comprehension to 90%+ for many users."
      }
    }
    
    // Motor disability responses
    if (scene === 'motor') {
      if (lowerMessage.includes('door') || lowerMessage.includes('width')) {
        return "ADA requires 32 inches minimum clear door width for wheelchair access. The door you encountered is only 28 inches - this blocks access completely. Even 32 inches can be tight for larger wheelchairs. 36 inches is recommended for comfortable access."
      }
      
      if (lowerMessage.includes('ramp') || lowerMessage.includes('slope')) {
        return "ADA maximum ramp slope is 1:12 (8.33% grade). The steep ramp you encountered is 1:8 (12.5% grade) - this exceeds ADA limits and is dangerous for wheelchair users. Every 1:12 slope requires a 5-foot landing every 30 feet for rest."
      }
      
      if (lowerMessage.includes('turn')) {
        return "Wheelchairs need 60×60 inches clear space for 180-degree turns. The hallway obstruction you encountered violates this requirement. This is why you're having difficulty navigating - there's simply not enough space to maneuver safely."
      }
    }
    
    // AR Auditor responses
    if (scene === 'ar') {
      if (lowerMessage.includes('accurate') || lowerMessage.includes('detection')) {
        return "The object detection is about 85% accurate for common objects like doors and chairs. It uses TensorFlow.js COCO-SSD model running on your device. For professional audits, combine this with manual measurements and professional assessment tools."
      }
      
      if (lowerMessage.includes('contrast')) {
        return "Tap anywhere on the camera view to measure color contrast. The system calculates WCAG 2.1 ratios in real-time. Remember, contrast requirements vary: 4.5:1 for normal text, 3:1 for large text (18pt+), and 3:1 for graphical objects."
      }
    }
    
    // General responses
    if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return "To get started, choose any scenario from the main menu. Each simulation takes 10-25 minutes and includes interactive tasks. I recommend starting with the visual impairment scenario to understand the platform mechanics."
    }
    
    if (lowerMessage.includes('score') || lowerMessage.includes('empathy')) {
      return "Your empathy score combines knowledge gain, engagement time, learning from mistakes, seeking help appropriately, and resilience. The goal isn't perfection - it's about understanding and growth. Most users score 60-80 on their first attempt."
    }
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help! Ask me about anything related to the current scenario, accessibility standards, or how to improve your experience. You can also use the quick suggestion buttons below the chat area."
    }
    
    // Default response
    return "That's a great question! Based on your current scenario, I'd be happy to help you understand more about accessibility. Could you tell me more about what you'd like to know, or try one of the suggested questions below?"
  }

  return {
    sendMessage,
    isLoading,
    error
  }
}
