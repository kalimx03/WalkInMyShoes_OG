import { useState, useEffect, useRef } from 'react'

export function useARCamera() {
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported in this browser')
      return
    }

    setIsSupported(true)

    // Check available cameras
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length === 0) {
          setError('No camera found')
          return
        }

        console.log('Available cameras:', videoDevices.map(d => ({
          label: d.label,
          facingMode: d.facingMode || 'unknown'
        })))

        return videoDevices
      } catch (error) {
        console.error('Error enumerating devices:', error)
        setError('Failed to access camera devices')
      }
    }

    // Start camera stream
    const startCamera = async (preferredFacingMode = 'environment') => {
      try {
        // Stop existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }

        const constraints = {
          video: {
            facingMode: preferredFacingMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: preferredFacingMode
          },
          audio: false
        }

        console.log('Requesting camera with constraints:', constraints)

        const newStream = await navigator.mediaDevices.getUserMedia(constraints)
        
        setStream(newStream)
        setError(null)
        
        // Set video element source
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }

        return newStream
      } catch (error) {
        console.error('Error accessing camera:', error)
        setError(`Camera access denied: ${error.message}`)
        
        // Provide helpful error messages
        if (error.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.')
        } else if (error.name === 'NotReadableError') {
          setError('Camera is already in use by another application.')
        } else {
          setError(`Camera error: ${error.message}`)
        }
      }
    }

    // Switch facing mode
    const switchCamera = async () => {
      const newMode = facingMode === 'environment' ? 'user' : 'environment'
      setFacingMode(newMode)
      await startCamera(newMode)
    }

    // Stop camera
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
        setStream(null)
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    // Get camera capabilities
    const getCapabilities = async () => {
      if (!stream) {
        return null
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) {
        return null
      }

      const capabilities = videoTrack.getCapabilities()
      
      return {
        width: capabilities.width?.max,
        height: capabilities.height?.max,
        facingMode: capabilities.facingMode,
        torch: capabilities.torch,
        focusMode: capabilities.focusMode,
        exposureMode: capabilities.exposureMode,
        whiteBalanceMode: capabilities.whiteBalanceMode,
        zoom: capabilities.zoom
      }
    }

    // Take photo
    const takePhoto = () => {
      if (!videoRef.current || !canvasRef.current) {
        return null
      }

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      
      return canvas.toDataURL('image/jpeg', 0.8)
    }

    // Initialize camera on mount
    useEffect(() => {
      startCamera(facingMode)
      
      // Cleanup on unmount
      return () => {
        stopCamera()
      }
    }, [])

    return {
      stream,
      videoRef,
      canvasRef,
      facingMode,
      error,
      isSupported,
      switchCamera,
      stopCamera,
      takePhoto,
      getCapabilities,
      checkCameras,
      startCamera
    }
  }
}
