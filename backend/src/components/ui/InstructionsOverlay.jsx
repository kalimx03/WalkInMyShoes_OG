import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/appStore'

export default function InstructionsOverlay({ instructions, onDismiss, onStart }) {
  const { currentScene } = useAppStore()

  const getSceneSpecificInstructions = () => {
    switch (currentScene) {
      case 'visual':
        return {
          title: 'Visual Impairment Simulation',
          icon: '👁️',
          steps: [
            'Use WASD keys to move around the city',
            'Move your mouse to look around',
            'Approach street signs to read them',
            'Follow traffic signals to cross safely',
            'Find accessible building entrances',
            'Your vision will progressively deteriorate through 5 stages'
          ],
          controls: [
            'W/A/S/D - Movement',
            'Mouse - Look around',
            'E - Exit simulation'
          ]
        }
      case 'hearing':
        return {
          title: 'Hearing Loss Simulation',
          icon: '👂',
          steps: [
            'Listen to the lecture with degraded audio',
            'Toggle captions on/off for accessibility',
            'Respond when your name is called (SPACE key)',
            'React to emergency alarms (E key)',
            'Experience 5 different hearing loss modes'
          ],
          controls: [
            'SPACE - I heard that!',
            'E - Emergency noticed',
            'C - Toggle captions',
            '1-5 - Change hearing mode'
          ]
        }
      case 'motor':
        return {
          title: 'Motor Disability Simulation',
          icon: '🦽',
          steps: [
            'Navigate using realistic wheelchair physics',
            'Find accessible entrances (avoid stairs)',
            'Use elevators to reach upper floors',
            'Navigate around obstacles in hallways',
            'Experience real mobility challenges'
          ],
          controls: [
            'W/S - Forward/Backward',
            'A/D - Turn left/right',
            'Space - Interact with objects',
            'E - Exit simulation'
          ]
        }
      case 'ar':
        return {
          title: 'AR Accessibility Auditor',
          icon: '📱',
          steps: [
            'Point camera at objects to detect accessibility issues',
            'Tap screen to check color contrast',
            'Tilt device to measure ramp angles',
            'Generate AI-powered accessibility reports',
            'Scan real-world spaces for compliance'
          ],
          controls: [
            'Tap - Analyze object',
            'Pinch - Zoom in/out',
            'Button - Toggle camera',
            'Menu - Generate report'
          ]
        }
      default:
        return {
          title: 'General Instructions',
          icon: '📖',
          steps: [
            'Choose your experience from the main menu',
            'Follow on-screen instructions',
            'Use AI guide for help anytime',
            'Complete all scenarios for full experience'
          ],
          controls: [
            'Mouse/Touch - Navigate interface',
            'Enter - Select/Confirm',
            'Escape - Go back'
          ]
        }
    }
  }

  const sceneInstructions = getSceneSpecificInstructions()

  return (
    <AnimatePresence>
      {instructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass-morphism p-8 max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">{sceneInstructions.icon}</div>
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  {sceneInstructions.title}
                </h2>
                <div className="text-gray-300 text-sm">
                  Follow these instructions to complete the simulation
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">How to Play:</h3>
              <ul className="space-y-2">
                {sceneInstructions.steps.map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <span className="text-cyan-accent mr-2">•</span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Controls:</h3>
              <div className="flex flex-wrap gap-2">
                {sceneInstructions.controls.map((control, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-white/10 rounded-lg text-sm font-mono"
                  >
                    {control}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onStart}
                className="button-primary flex-1"
              >
                Start Experience
              </button>
              <button
                onClick={onDismiss}
                className="button-secondary flex-1"
              >
                Skip Tutorial
              </button>
            </div>

            <div className="text-center text-xs text-gray-400">
              Press ESC or click outside to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
