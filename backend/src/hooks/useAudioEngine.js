import { useRef, useEffect, useState } from 'react'

export function useAudioEngine() {
  const audioContextRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const gainNodeRef = useRef(null)
  const filterNodeRef = useRef(null)
  const convolverNodeRef = useRef(null)
  const tinnitusOscillatorRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create audio nodes
      gainNodeRef.current = audioContextRef.current.createGain()
      filterNodeRef.current = audioContextRef.current.createBiquadFilter()
      convolverNodeRef.current = audioContextRef.current.createConvolver()
      
      // Create impulse response for reverb
      const length = audioContextRef.current.sampleRate * 0.5
      const impulse = audioContextRef.current.createBuffer(2, length, audioContextRef.current.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
        }
      }
      convolverNodeRef.current.buffer = impulse
      
      // Connect nodes
      gainNodeRef.current.connect(filterNodeRef.current)
      filterNodeRef.current.connect(audioContextRef.current.destination)
      
      setIsInitialized(true)
    }
  }, [])

  // Set hearing mode with different audio processing
  const setHearingMode = (mode) => {
    if (!isInitialized || !filterNodeRef.current || !gainNodeRef.current) return

    // Stop any existing tinnitus
    if (tinnitusOscillatorRef.current) {
      tinnitusOscillatorRef.current.stop()
      tinnitusOscillatorRef.current = null
    }

    switch (mode) {
      case 1: // Mild - Age-related High Frequency Loss
        filterNodeRef.current.type = 'highpass'
        filterNodeRef.current.frequency.value = 3000
        gainNodeRef.current.gain.value = 0.7
        break
        
      case 2: // Moderate - Bilateral Hearing Loss
        filterNodeRef.current.type = 'lowpass'
        filterNodeRef.current.frequency.value = 1500
        gainNodeRef.current.gain.value = 0.5
        // Add slight reverb
        filterNodeRef.current.disconnect()
        filterNodeRef.current.connect(convolverNodeRef.current)
        convolverNodeRef.current.connect(audioContextRef.current.destination)
        break
        
      case 3: // Severe + Tinnitus
        filterNodeRef.current.type = 'lowpass'
        filterNodeRef.current.frequency.value = 800
        gainNodeRef.current.gain.value = 0.3
        
        // Add tinnitus
        tinnitusOscillatorRef.current = audioContextRef.current.createOscillator()
        tinnitusOscillatorRef.current.type = 'sine'
        tinnitusOscillatorRef.current.frequency.value = 6000
        
        const tinnitusGain = audioContextRef.current.createGain()
        tinnitusGain.gain.value = 0.15
        
        tinnitusOscillatorRef.current.connect(tinnitusGain)
        tinnitusGain.connect(audioContextRef.current.destination)
        tinnitusOscillatorRef.current.start()
        break
        
      case 4: // Profound - Near Silence
        filterNodeRef.current.type = 'lowpass'
        filterNodeRef.current.frequency.value = 400
        gainNodeRef.current.gain.value = 0.05
        break
        
      case 5: // Unilateral - One Side Only
        // Create panner for unilateral hearing
        const pannerNode = audioContextRef.current.createStereoPanner()
        pannerNode.pan.value = -1 // Left side only
        gainNodeRef.current.gain.value = 0.7
        
        filterNodeRef.current.disconnect()
        filterNodeRef.current.connect(pannerNode)
        pannerNode.connect(audioContextRef.current.destination)
        break
    }
  }

  // Play emergency sound with current hearing mode applied
  const playEmergencySound = () => {
    if (!isInitialized || !audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.type = 'square'
    oscillator.frequency.value = 1000
    
    gainNode.gain.value = 0.3
    
    oscillator.connect(gainNode)
    gainNode.connect(filterNodeRef.current)
    
    oscillator.start()
    
    // Beep pattern
    const beepInterval = setInterval(() => {
      gainNode.gain.value = gainNode.gain.value === 0 ? 0.3 : 0
    }, 500)
    
    // Stop after 5 seconds
    setTimeout(() => {
      clearInterval(beepInterval)
      oscillator.stop()
    }, 5000)
  }

  // Play ambient classroom sounds
  const playAmbientSounds = () => {
    if (!isInitialized || !audioContextRef.current) return

    // Create white noise for HVAC hum
    const bufferSize = 2 * audioContextRef.current.sampleRate
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    
    const whiteNoise = audioContextRef.current.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    
    const noiseGain = audioContextRef.current.createGain()
    noiseGain.gain.value = 0.02
    
    const noiseFilter = audioContextRef.current.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.value = 200
    
    whiteNoise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(filterNodeRef.current)
    
    whiteNoise.loop = true
    whiteNoise.start()
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (tinnitusOscillatorRef.current) {
        tinnitusOscillatorRef.current.stop()
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    isInitialized,
    setHearingMode,
    playEmergencySound,
    playAmbientSounds
  }
}
