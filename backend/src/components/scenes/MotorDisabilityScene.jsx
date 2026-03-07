import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/appStore'
import 'aframe'

/* ---------------- A-FRAME OFFICE ---------------- */

function AFrameOffice({ position, rotation }) {
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
        position={`${position[0]} 1.2 ${position[2]}`}
        rotation={`0 ${rotation} 0`}
      />

      {/* Lighting */}
      <a-entity light="type: ambient; intensity: 0.5"></a-entity>
      <a-entity light="type: directional; intensity: 1" position="10 20 10"></a-entity>

      {/* Floor */}
      <a-plane
        rotation="-90 0 0"
        width="30"
        height="30"
        color="#D3D3D3"
      ></a-plane>

      {/* Walls */}
      <a-box position="0 4 -15" width="30" height="8" depth="0.3" color="#F5F5F5" />
      <a-box position="0 4 15" width="30" height="8" depth="0.3" color="#F5F5F5" />
      <a-box position="-15 4 0" width="0.3" height="8" depth="30" color="#F5F5F5" />
      <a-box position="15 4 0" width="0.3" height="8" depth="30" color="#F5F5F5" />

      {/* Stairs (Obstacle) */}
      <a-box position="0 0.5 -14" width="4" height="1" depth="2" color="#8B4513" />

      {/* Steep Ramp */}
      <a-box
        position="-8 1 -10"
        width="3"
        height="0.1"
        depth="8"
        rotation="15 0 0"
        color="#808080"
      ></a-box>

      {/* ADA Ramp */}
      <a-box
        position="8 0.7 -12"
        width="3"
        height="0.1"
        depth="12"
        rotation="7 0 0"
        color="#808080"
      ></a-box>

      {/* Elevator */}
      <a-box position="0 4 0" width="8" height="8" depth="2" color="#C0C0C0" />
      <a-text value="Elevator" position="0 6 1" align="center" color="#000" />

      {/* Meeting Room */}
      <a-box position="0 4 12" width="6" height="8" depth="0.3" color="#F5F5F5" />
      <a-text value="Meeting Room ★" position="0 5 11.8" align="center" color="#00FF00" />

      {/* Accessible Restroom */}
      <a-box position="10 4 10" width="3" height="8" depth="0.3" color="#F5F5F5" />
      <a-text value="Accessible Restroom" position="10 5 9.8" align="center" color="#00FF00" />
    </a-scene>
  )
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function MotorDisabilityScene() {
  const {
    setCurrentScene,
    startSession,
    endSession,
    completeTask,
    recordError,
    incrementFrustrationEvents,
    scenarioData
  } = useAppStore()

  const [showInstructions, setShowInstructions] = useState(true)
  const [position, setPosition] = useState([0, 1.2, 5])
  const [rotation, setRotation] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [obstaclesHit, setObstaclesHit] = useState(0)
  const [frustrationLevel, setFrustrationLevel] = useState(0)

  const velocity = useRef(0)
  const startTime = useRef(Date.now())
  const keys = useRef({})

  /* ----------- Keyboard Controls ----------- */

  useEffect(() => {
    const down = e => keys.current[e.key.toLowerCase()] = true
    const up = e => keys.current[e.key.toLowerCase()] = false

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /* ----------- Game Loop ----------- */

  useEffect(() => {
    const loop = setInterval(() => {
      let newVel = velocity.current

      if (keys.current['w']) newVel = Math.min(newVel + 0.02, 0.4)
      else if (keys.current['s']) newVel = Math.max(newVel - 0.02, -0.2)
      else newVel *= 0.9

      let newRotation = rotation
      if (keys.current['a']) newRotation += 2
      if (keys.current['d']) newRotation -= 2

      const rad = newRotation * Math.PI / 180
      const newX = position[0] + Math.sin(rad) * newVel
      const newZ = position[2] + Math.cos(rad) * newVel

      const collision =
        Math.abs(newX) > 14 ||
        Math.abs(newZ) > 14 ||
        (Math.abs(newX) < 2 && newZ < -13)

      if (collision) {
        recordError('collision')
        setObstaclesHit(o => o + 1)
        setFrustrationLevel(f => {
          const next = Math.min(f + 1, 5)
          if (next >= 3) incrementFrustrationEvents()
          return next
        })
        velocity.current = 0
        return
      }

      velocity.current = newVel
      setRotation(newRotation)
      setPosition([newX, 1.2, newZ])

      /* ---- Task Checks ---- */
      if (newZ > -13) completeTask('enter_building')
      if (newZ > 11) completeTask('navigate_to_meeting')
      if (Math.abs(newX - 10) < 2 && newZ > 9)
        completeTask('find_facilities')

    }, 16)

    return () => clearInterval(loop)
  }, [position, rotation, completeTask, recordError, incrementFrustrationEvents])

  /* ----------- Timer ----------- */

  useEffect(() => {
    startSession()
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => {
      clearInterval(timer)
      endSession()
    }
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
            <div className="glass-morphism p-8 max-w-xl">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Motor Disability Simulation
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

      <AFrameOffice position={position} rotation={rotation} />

      {/* HUD */}
      <div className="absolute top-4 right-4 glass-morphism p-4 pointer-events-auto text-sm space-y-1">
        <div>Time: {elapsedTime}s</div>
        <div>Obstacles: {obstaclesHit}</div>
        <div>Frustration: {frustrationLevel}/5</div>
      </div>

      <button
        onClick={handleExit}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 glass-morphism px-6 py-2"
      >
        Exit Simulation
      </button>
    </div>
  )
}