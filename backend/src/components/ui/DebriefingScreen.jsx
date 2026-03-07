import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/appStore'

export default function DebriefingScreen({ scenarioId, taskResults, onContinue, onExit }) {
  const { empathyScore, preAssessment, postAssessment } = useAppStore()
  const [showDetails, setShowDetails] = useState(false)

  const getScenarioData = () => {
    const scenarios = {
      visual: {
        title: 'Visual Impairment',
        icon: '👁️',
        color: '#7c3aed',
        stats: {
          visionStage: 'Stage 3 - Macular Degeneration',
          timeTaken: '12:34',
          errors: 2,
          helpRequests: 1
        },
        insights: [
          'You experienced central vision loss while preserving peripheral vision',
          'Low contrast signs are a major barrier for people with vision impairments',
          'Audio cues become essential when vision is compromised'
        ],
        realWorldImpact: '1 billion people worldwide live with vision impairment'
      },
      hearing: {
        title: 'Hearing Loss',
        icon: '👂',
        color: '#06b6d4',
        stats: {
          hearingMode: 'Mode 3 - Severe + Tinnitus',
          timeTaken: '8:45',
          errors: 1,
          helpRequests: 2
        },
        insights: [
          'Visual cues dramatically improve comprehension for people with hearing loss',
          'Tinnitus creates constant background noise that interferes with speech',
          'Captions quality directly impacts information access'
        ],
        realWorldImpact: '466 million people have disabling hearing loss'
      },
      motor: {
        title: 'Motor Disability',
        icon: '🦽',
        color: '#10b981',
        stats: {
          obstaclesHit: 3,
          timeTaken: '18:22',
          errors: 4,
          helpRequests: 1
        },
        insights: [
          'Environmental barriers create constant navigation challenges',
          'Many buildings fail basic accessibility standards',
          'Wheelchair users plan routes carefully to avoid obstacles'
        ],
        realWorldImpact: '2.2 million wheelchair users in the US'
      }
    }

    return scenarios[scenarioId] || scenarios.visual
  }

  const scenarioData = getScenarioData()
  const knowledgeGain = postAssessment.score - preAssessment.score

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-deep-navy p-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-morphism p-8 mb-8"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="text-5xl">{scenarioData.icon}</div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {scenarioData.title} Debriefing
              </h1>
              <div className="text-gray-300">
                Reflection on your experience and key takeaways
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Your Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Taken:</span>
                  <span className="font-mono">{scenarioData.stats.timeTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Errors Made:</span>
                  <span className="font-mono">{scenarioData.stats.errors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Help Requests:</span>
                  <span className="font-mono">{scenarioData.stats.helpRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Empathy Score:</span>
                  <span className="font-mono text-2xl font-bold" style={{ color: scenarioData.color }}>
                    {Math.round(empathyScore.total)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">Knowledge Growth</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pre-Assessment:</span>
                  <span className="font-mono">{preAssessment.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Post-Assessment:</span>
                  <span className="font-mono">{postAssessment.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Improvement:</span>
                  <span className="font-mono text-green-400">+{knowledgeGain}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="button-secondary w-full"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-morphism p-8 mb-8"
            >
              <h3 className="text-xl font-semibold mb-6 text-white">Key Insights</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3" style={{ color: scenarioData.color }}>
                    What You Experienced
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    {scenarioData.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-cyan-accent">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-white">Real-World Impact</h4>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-300 mb-2">
                      In just 15 minutes, you experienced barriers that affect 
                      <span className="font-bold text-white"> {scenarioData.realWorldImpact} </span>
                      people daily.
                    </p>
                    <p className="text-gray-300">
                      Your experience helps build understanding of the challenges faced by 
                      people with disabilities in everyday life.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-white">Best Practices</h4>
                  <div className="space-y-2 text-gray-300">
                    {scenarioId === 'visual' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Use minimum 4.5:1 contrast ratio for normal text</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Provide alt text for all meaningful images</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Test with screen readers regularly</span>
                        </div>
                      </>
                    )}
                    {scenarioId === 'hearing' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Provide high-quality captions for all video content</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Include visual alerts for important information</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Consider assistive listening systems in public spaces</span>
                        </div>
                      </>
                    )}
                    {scenarioId === 'motor' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Ensure 32-inch minimum door width for wheelchair access</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Maintain 1:12 maximum ramp slope (8.33% grade)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-accent">•</span>
                          <span>Provide 60×60 inch clear turning space for wheelchairs</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-white">User Stories</h4>
                  <div className="space-y-4">
                    {scenarioId === 'visual' && (
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="text-4xl">👩‍🦰</div>
                          <div>
                            <div className="font-semibold">Sarah Chen</div>
                            <div className="text-sm text-gray-600">Visual Impairment</div>
                            <div className="text-gray-700 italic">
                              "The low contrast signs in this simulation are exactly what I face daily. 
                              Most people don't realize how much information they're missing until 
                              they experience it themselves."
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {scenarioId === 'hearing' && (
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="text-4xl">🧑‍🦱</div>
                          <div>
                            <div className="font-semibold">Marcus Johnson</div>
                            <div className="text-sm text-gray-600">Hearing Loss</div>
                            <div className="text-gray-700 italic">
                              "The degraded captions in this simulation show the reality of what 
                              deaf and hard of hearing people experience with auto-generated captions. 
                              It's not just about hearing - it's about accessing information."
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {scenarioId === 'motor' && (
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="text-4xl">👩‍🦽</div>
                          <div>
                            <div className="font-semibold">Emily Rodriguez</div>
                            <div className="text-sm text-gray-600">Mobility Impairment</div>
                            <div className="text-gray-700 italic">
                              "The narrow doorways and steep ramps in this simulation are 
                              frustratingly realistic. I navigate these barriers every single day, 
                              and most people have no idea how much planning it requires."
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <button
            onClick={onContinue}
            className="button-primary flex-1"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={onExit}
            className="button-secondary flex-1"
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
