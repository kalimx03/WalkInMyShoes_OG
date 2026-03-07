import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

export function useVRScene() {
  const sceneRef = useRef()
  const cameraRef = useRef()
  const rendererRef = useRef()
  const [isVR, setIsVR] = useState(false)
  const [vrSession, setVRSession] = useState(null)

  const initVR = useCallback(async () => {
    if (!navigator.xr) {
      console.warn('WebXR not supported')
      return false
    }

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      })
      
      setVRSession(session)
      setIsVR(true)
      
      // Setup VR rendering
      if (rendererRef.current) {
        await rendererRef.current.xr.setSession(session)
      }
      
      return true
    } catch (error) {
      console.error('Failed to init VR:', error)
      return false
    }
  }, [])

  const endVR = useCallback(async () => {
    if (vrSession) {
      await vrSession.end()
      setVRSession(null)
      setIsVR(false)
    }
  }, [vrSession])

  const handleVRInput = useCallback((event) => {
    // Handle VR controller input
    const controller = event.target
    if (controller && controller.gamepad) {
      const gamepad = controller.gamepad
      
      // Handle button presses
      gamepad.buttons.forEach((button, index) => {
        if (button.pressed) {
          console.log(`Button ${index} pressed`)
          // Handle different button actions
        }
      })
    }
  }, [])

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    isVR,
    vrSession,
    initVR,
    endVR,
    handleVRInput
  }
}
