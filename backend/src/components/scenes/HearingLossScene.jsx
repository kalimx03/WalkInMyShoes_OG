import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/appStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import 'aframe'

/* ---------------- A-FRAME CLASSROOM ---------------- */

function AFrameClassroom({ isSpeaking }) {
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
        wasd-controls
        position="0 1.7 8"
      />

      {/* Lighting */}
      <a-entity light="type: ambient; intensity: 0.4"></a-entity>
      <a-entity light="type: directional; intensity: 0.8" position="0 10 0"></a-entity>

      {/* Floor */}
      <a-plane
        rotation="-90 0 0"
        width="20"
        height="15"
        color="#8B7355"
      ></a-plane>

      {/* Back Wall */}
      <a-box position="0 4 -7.5" width="20" height="8" depth="0.3" color="#F5F5DC" />

      {/* Side Walls */}
      <a-box position="-10 4 0" width="0.3" height="8" depth="15" color="#F5F5DC" />
      <a-box position="10 4 0" width="0.3" height="8" depth="15" color="#F5F5DC" />

      {/* Ceiling */}
      <a-plane
        rotation="90 0 0"
        width="20"
        height="15"
        position="0 8 0"
        color="#FFFFFF"
      ></a-plane>

      {/* Teacher Desk */}
      <a-box position="0 0.5 -5" width="4" height="1" depth="2" color="#8B4513" />

      {/* Whiteboard */}
      <a-box position="0 4 -7.3" width="8" height="4" depth="0.1" color="#FFFFFF" />

      {/* Teacher */}
      <a-cylinder position="0 1 -4" radius="0.3" height="1.2" color="#4169E1" />
      <a-sphere position="0 2 -4" radius="0.25" color="#FDBCB4" />

      {isSpeaking && (
        <a-text
          value="Speaking..."
          position="0 2.8 -4"
          align="center"
          color="#00FF00"
        ></a-text>
      )}

      {/* Student Desks */}
      {Array.from({ length: 8 }).map((_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        const x = -6 + col * 4
        const z = 2 + row * 3

        return (
          <a-box
            key={i}
            position={`${x} 0.5 ${z}`}
            width="1.5"
            height="1"
            depth="1"
            color="#654321"
          ></a-box>
        )
      })}
    </a-scene>
  )
}

/* ---------------- CAPTION DISPLAY ---------------- */

function CaptionDisplay({ text, accuracy = 100, showCaptions }) {
  if (!showCaptions || !text) return null

  const degradeCaption = (text, accuracy) => {
    if (accuracy >= 100) return text

    const words = text.split(' ')
    const dropRate = (100 - accuracy) / 100

    return words.map(word => {
      if (Math.random() < dropRate) return '[inaudible]'
      return word
    }).join(' ')
  }

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-morphism px-6 py-4 max-w-4xl">
        <div className="text-white text-xl font-medium">
          {degradeCaption(text, accuracy)}
        </div>
        {accuracy < 100 && (
          <div className="text-xs text-yellow-400 mt-2">
            Caption accuracy: {accuracy}%
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function HearingLossScene() {
  const {
    setCurrentScene,
    updateHearingMode,
    startSession,
    endSession,
    completeTask,
    recordError
  } = useAppStore()

  const { hearingMode } = useAppStore(state => state.scenarioData)

  const [showInstructions, setShowInstructions] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showCaptions, setShowCaptions] = useState(true)
  const [captionAccuracy, setCaptionAccuracy] = useState(100)
  const [currentCaption, setCurrentCaption] = useState('')
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)

  const audioEngine = useAudioEngine()

  const lectureScript = [
    "Welcome to today's lecture on accessibility in design.",
    "Sensory accessibility is equally important.",
    "Hearing loss affects daily interactions.",
    "Visual alert systems are essential.",
    "Universal design benefits everyone."
  ]

  useEffect(() => {
    startSession()
    return () => endSession()
  }, [startSession, endSession])

  useEffect(() => {
    if (audioEngine) {
      audioEngine.setHearingMode(hearingMode)
    }
  }, [hearingMode, audioEngine])

  useEffect(() => {
    if (!showInstructions) {
      let index = 0
      setIsSpeaking(true)

      const interval = setInterval(() => {
        if (index < lectureScript.length) {
          setCurrentCaption(lectureScript[index])
          index++
        } else {
          clearInterval(interval)
          setIsSpeaking(false)
          completeTask('follow_lecture')
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [showInstructions, completeTask])

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
                Hearing Loss Simulation
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
      <AFrameClassroom isSpeaking={isSpeaking} />

      {/* Caption Display */}
      <CaptionDisplay
        text={currentCaption}
        accuracy={captionAccuracy}
        showCaptions={showCaptions}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 glass-morphism p-4 pointer-events-auto">
        {[1,2,3,4,5].map(mode => (
          <button
            key={mode}
            onClick={() => updateHearingMode(mode)}
            className={`w-full px-3 py-1 rounded text-sm mb-1 ${
              hearingMode === mode
                ? 'bg-purple-accent text-white'
                : 'glass-morphism'
            }`}
          >
            Mode {mode}
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