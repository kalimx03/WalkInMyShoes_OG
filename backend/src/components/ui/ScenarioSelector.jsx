import React from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/appStore'

export default function ScenarioSelector() {
  const { setCurrentScene } = useAppStore()

  const scenarios = [
    {
      id: 'visual',
      title: 'Visual Impairment',
      description: 'Experience navigation with progressive vision loss through 5 stages',
      icon: '👁️',
      difficulty: 'Advanced',
      duration: '15-20 min',
      features: ['5 vision stages', 'Realistic city environment', 'Interactive tasks']
    },
    {
      id: 'hearing',
      title: 'Hearing Loss',
      description: 'Navigate a world with varying degrees of hearing impairment',
      icon: '👂',
      difficulty: 'Intermediate',
      duration: '10-15 min',
      features: ['5 audio modes', 'Classroom simulation', 'Caption challenges']
    },
    {
      id: 'motor',
      title: 'Motor Disability',
      description: 'Navigate barriers from a wheelchair with realistic physics',
      icon: '🦽',
      difficulty: 'Challenging',
      duration: '20-25 min',
      features: ['Realistic physics', 'Office environment', 'ADA compliance']
    },
    {
      id: 'ar',
      title: 'AR Auditor',
      description: 'Scan real spaces for accessibility violations',
      icon: '📱',
      difficulty: 'Beginner',
      duration: '5-10 min',
      features: ['Real-time detection', 'AI analysis', 'Compliance reports']
    }
  ]

  const handleScenarioSelect = (scenarioId) => {
    setCurrentScene(scenarioId)
  }

  return (
    <div className="min-h-screen bg-deep-navy p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Choose Your Experience
          </h1>
          <p className="text-xl text-gray-300">
            Select a scenario to begin your empathy training journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleScenarioSelect(scenario.id)}
              className="glass-morphism p-8 cursor-pointer group hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {scenario.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{scenario.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      scenario.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      scenario.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      scenario.difficulty === 'Advanced' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{scenario.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>⏱️ {scenario.duration}</span>
                    <span>🎯 Interactive</span>
                  </div>
                  
                  <div className="space-y-2">
                    {scenario.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-cyan-accent">
                        <span>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button className="button-primary text-sm px-6 py-2">
                  Start Experience
                </button>
                <div className="text-cyan-accent group-hover:text-cyan-accent/80 transition-colors">
                  →
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setCurrentScene('menu')}
            className="button-secondary"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
