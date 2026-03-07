import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/appStore'
import 'aframe'

/*
  IMPORTANT:
  - No @react-three/fiber
  - No @react-three/drei
  - No three.js imports
  - A-Frame owns WebGL
*/

function AFrameCityScene({ visionStage }) {
  return (
    <a-scene
      embedded
      background="color: #0b1120"
      vr-mode-ui="enabled: false"
      renderer="antialias: true"
    >
      {/* Camera */}
      <a-entity
        camera
        look-controls
        wasd-controls="acceleration: 20"
        position="0 1.7 5"
      />

      {/* Lighting */}
      <a-entity light="type: ambient; intensity: 0.5"></a-entity>
      <a-entity
        light="type: directional; intensity: 1"
        position="10 20 10"
      ></a-entity>

      {/* Ground */}
      <a-plane
        rotation="-90 0 0"
        width="100"
        height="100"
        color="#808080"
      ></a-plane>

      {/* Buildings */}
      <a-box position="-15 5 -10" width="8" height="10" depth="8" color="#8B4513" />
      <a-box position="15 6 -10" width="10" height="12" depth="8" color="#696969" />
      <a-box position="-15 4 10" width="6" height="8" depth="8" color="#A0522D" />
      <a-box position="15 7 10" width="12" height="14" depth="8" color="#708090" />

      {/* Trees */}
      <a-cylinder position="-5 1 -5" radius="0.3" height="2" color="#8B4513" />
      <a-sphere position="-5 2.5 -5" radius="1.2" color="#228B22" />

      <a-cylinder position="5 1 -5" radius="0.3" height="2" color="#8B4513" />
      <a-sphere position="5 2.5 -5" radius="1.2" color="#228B22" />

      {/* Street Signs */}
      <a-box position="-8 3 -2" width="2" height="1" depth="0.1" color="#C0C0C0">
        <a-text
          value="City Hall"
          align="center"
          color="#000"
          position="0 0 0.1"
        ></a-text>
      </a-box>

      <a-box position="0 3 -2" width="2" height="1" depth="0.1" color="#C0C0C0">
        <a-text
          value="Library"
          align="center"
          color="#000"
          position="0 0 0.1"
        ></a-text>
      </a-box>

      <a-box position="8 3 -2" width="2" height="1" depth="0.1" color="#C0C0C0">
        <a-text
          value="Post Office"
          align="center"
          color="#000"
          position="0 0 0.1"
        ></a-text>
      </a-box>

      {/* Vision Impairment Overlay (simple visual approximation) */}
      {visionStage > 0 && (
        <a-entity
          geometry="primitive: plane; height: 2; width: 2"
          material={`color: black; opacity: ${visionStage * 0.15}`}
          position="0 1.7 -0.5"
        ></a-entity>
      )}
    </a-scene>
  )
}

/* ---------------- HUD (UNCHANGED LOGIC) ---------------- */

function HUD() {
  const { scenarioData } = useAppStore()
  const { completedTasks, visionStage } = scenarioData

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-4 left-4 glass-morphism p-4 pointer-events-auto">
        <h3 className="text-lg font-semibold mb-2">Tasks</h3>
        <div className="space-y-2">
          <div className={`${completedTasks.includes('read_sign') ? 'text-green-400' : 'text-gray-400'}`}>
            {completedTasks.includes('read_sign') ? '✓' : '○'} Read Street Sign
          </div>
          <div className={`${completedTasks.includes('cross_street') ? 'text-green-400' : 'text-gray-400'}`}>
            {completedTasks.includes('cross_street') ? '✓' : '○'} Cross Street Safely
          </div>
          <div className={`${completedTasks.includes('find_entrance') ? 'text-green-400' : 'text-gray-400'}`}>
            {completedTasks.includes('find_entrance') ? '✓' : '○'} Find Accessible Entrance
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 glass-morphism p-4 pointer-events-auto">
        <h3 className="text-lg font-semibold mb-2">Vision Stage</h3>
        <div className="text-2xl font-bold gradient-text">
          {visionStage}/5
        </div>
      </div>
    </div>
  )
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function VisualImpairmentScene() {
  const {
    setCurrentScene,
    updateVisionStage,
    startSession,
    endSession,
    scenarioData
  } = useAppStore()

  const { visionStage } = scenarioData
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    startSession()
    return () => endSession()
  }, [startSession, endSession])

  const handleExit = () => {
    setCurrentScene('dashboard')
  }

  return (
    <div className="relative w-full h-screen bg-deep-navy">
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <div className="glass-morphism p-8 max-w-2xl mx-4">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Visual Impairment Simulation
              </h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="button-primary w-full"
              >
                Start Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A-Frame Scene */}
      <AFrameCityScene visionStage={visionStage} />

      {/* HUD */}
      <HUD />

      {/* Stage Controls */}
      <div className="absolute top-20 right-4 glass-morphism p-4 pointer-events-auto">
        {[1, 2, 3, 4, 5].map(stage => (
          <button
            key={stage}
            onClick={() => updateVisionStage(stage)}
            className={`w-full px-3 py-1 rounded text-sm mb-1 ${
              visionStage === stage
                ? 'bg-purple-accent text-white'
                : 'glass-morphism'
            }`}
          >
            Stage {stage}
          </button>
        ))}
      </div>

      <button
        onClick={handleExit}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 glass-morphism px-6 py-2 pointer-events-auto"
      >
        Exit Simulation
      </button>
    </div>
  )
}