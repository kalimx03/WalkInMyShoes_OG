import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import useAppStore from '../../store/appStore'

// Detection result component
function DetectionOverlay({ detections, onViolationClick }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {detections.map((detection, index) => (
        <g key={index}>
          {/* Bounding box */}
          <rect
            x={detection.bbox[0]}
            y={detection.bbox[1]}
            width={detection.bbox[2]}
            height={detection.bbox[3]}
            fill="none"
            stroke={detection.compliance === 'compliant' ? '#00FF00' : 
                   detection.compliance === 'marginal' ? '#FFFF00' : '#FF0000'}
            strokeWidth="3"
            className="pointer-events-auto cursor-pointer"
            onClick={() => onViolationClick(detection)}
          />
          
          {/* Measurement lines */}
          <line
            x1={detection.bbox[0]}
            y1={detection.bbox[1] + detection.bbox[3] / 2}
            x2={detection.bbox[0] + detection.bbox[2]}
            y2={detection.bbox[1] + detection.bbox[3] / 2}
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Label */}
          <foreignObject
            x={detection.bbox[0]}
            y={detection.bbox[1] - 30}
            width={200}
            height={30}
          >
            <div className={`px-2 py-1 rounded text-xs font-semibold ${
              detection.compliance === 'compliant' ? 'bg-green-500 text-white' :
              detection.compliance === 'marginal' ? 'bg-yellow-500 text-black' :
              'bg-red-500 text-white'
            }`}>
              {detection.class}: {detection.measurement}
              {detection.compliance !== 'compliant' && ' ✗'}
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  )
}

// Color contrast checker
function ColorContrastChecker({ onContrastResult }) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  
  const handleCanvasClick = useCallback((event) => {
    if (!canvasRef.current || !videoRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    
    const imageData = ctx.getImageData(x, y, 1, 1)
    const pixel = imageData.data
    
    // Calculate relative luminance
    const rgb = [pixel[0], pixel[1], pixel[2]]
    const luminance = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    const L = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2]
    
    // Sample surrounding area for contrast
    const surroundingData = ctx.getImageData(Math.max(0, x-10), Math.max(0, y-10), 20, 20)
    const surroundingRGB = [0, 0, 0]
    for (let i = 0; i < surroundingData.data.length; i += 4) {
      surroundingRGB[0] += surroundingData.data[i]
      surroundingRGB[1] += surroundingData.data[i + 1]
      surroundingRGB[2] += surroundingData.data[i + 2]
    }
    const pixelCount = surroundingData.data.length / 4
    surroundingRGB[0] /= pixelCount
    surroundingRGB[1] /= pixelCount
    surroundingRGB[2] /= pixelCount
    
    const surroundingLuminance = surroundingRGB.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    const L2 = 0.2126 * surroundingLuminance[0] + 0.7152 * surroundingLuminance[1] + 0.0722 * surroundingLuminance[2]
    
    // Calculate contrast ratio
    const lighter = Math.max(L, L2) + 0.05
    const darker = Math.min(L, L2) + 0.05
    const contrastRatio = lighter / darker
    
    const wcagAA = contrastRatio >= 4.5
    const wcagAAA = contrastRatio >= 7
    
    onContrastResult({
      position: { x, y },
      contrastRatio: contrastRatio.toFixed(2),
      wcagAA,
      wcagAAA,
      color1: `rgb(${rgb.join(',')})`,
      color2: `rgb(${surroundingRGB.map(c => Math.round(c)).join(',')})`
    })
  }, [onContrastResult])
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      onClick={handleCanvasClick}
    />
  )
}

// Ramp angle detector
function RampAngleDetector({ onAngleResult }) {
  const [angle, setAngle] = useState(0)
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  useEffect(() => {
    if (!window.DeviceOrientationEvent) return
    
    const handleOrientation = (event) => {
      if (!isMeasuring) return
      
      const { beta } = event // Front-to-back tilt in degrees
      setAngle(Math.abs(beta))
      onAngleResult(beta)
    }
    
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [isMeasuring, onAngleResult])
  
  return (
    <div className="absolute top-4 left-4 glass-morphism p-4">
      <button
        onClick={() => setIsMeasuring(!isMeasuring)}
        className={`px-4 py-2 rounded ${
          isMeasuring ? 'bg-red-500 text-white' : 'button-primary'
        }`}
      >
        {isMeasuring ? 'Stop Measuring' : 'Measure Ramp Angle'}
      </button>
      {isMeasuring && (
        <div className="mt-2 text-sm">
          Current Angle: {angle.toFixed(1)}°
          <div className={`text-xs ${angle <= 4.76 ? 'text-green-400' : 'text-red-400'}`}>
            {angle <= 4.76 ? '✓ ADA Compliant' : `✗ Exceeds ADA max (4.76°)`}
          </div>
        </div>
      )}
    </div>
  )
}

// Compliance panel
function CompliancePanel({ violations, onGenerateReport }) {
  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 glass-morphism p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Real-time Compliance</h3>
      
      <div className="space-y-2">
        {violations.length === 0 ? (
          <div className="text-gray-400 text-sm">Scanning for violations...</div>
        ) : (
          violations.map((violation, index) => (
            <div
              key={index}
              className={`p-3 rounded text-sm ${
                violation.severity === 'critical' ? 'bg-red-500/20 border border-red-500' :
                violation.severity === 'important' ? 'bg-yellow-500/20 border border-yellow-500' :
                'bg-blue-500/20 border border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{violation.type}</span>
                <span>{violation.measurement}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {violation.description}
              </div>
              <div className="text-xs mt-1">
                {violation.compliance ? '✅ ADA OK' : '❌ Non-Compliant'}
              </div>
            </div>
          ))
        )}
      </div>
      
      {violations.length > 0 && (
        <button
          onClick={onGenerateReport}
          className="w-full button-primary mt-4"
        >
          Generate AI Report
        </button>
      )}
    </div>
  )
}

// Contrast result popup
function ContrastResultPopup({ result, onClose }) {
  if (!result) return null
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-morphism p-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <div 
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: result.color1 }}
          />
          <div 
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: result.color2 }}
          />
        </div>
        <div>
          <div className="font-semibold">Contrast: {result.contrastRatio}:1</div>
          <div className="text-sm">
            WCAG AA: {result.wcagAA ? '✅' : '❌'} | 
            WCAG AAA: {result.wcagAAA ? '✅' : '❌'}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

export default function ARAccessibilityAuditor() {
  const { setCurrentScene, startSession, endSession } = useAppStore()
  const [showInstructions, setShowInstructions] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [model, setModel] = useState(null)
  const [detections, setDetections] = useState([])
  const [violations, setViolations] = useState([])
  const [contrastResult, setContrastResult] = useState(null)
  const [rampAngle, setRampAngle] = useState(0)
  const [cameraStream, setCameraStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready()
        const loadedModel = await cocoSsd.load()
        setModel(loadedModel)
      } catch (error) {
        console.error('Failed to load model:', error)
      }
    }
    loadModel()
  }, [])

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraStream(stream)
        }
      } catch (error) {
        console.error('Camera access denied:', error)
      }
    }
    
    if (showInstructions === false) {
      initCamera()
    }
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [showInstructions, facingMode])

  // Object detection loop
  useEffect(() => {
    if (!model || !videoRef.current || !isScanning) return
    
    const detectObjects = async () => {
      if (!videoRef.current || !canvasRef.current) return
      
      const predictions = await model.detect(videoRef.current)
      
      const processedDetections = predictions.map(prediction => {
        let compliance = 'compliant'
        let measurement = ''
        let violation = null
        
        // Process based on object type
        switch (prediction.class) {
          case 'door':
            const doorWidth = estimateWidth(prediction.bbox)
            measurement = `${doorWidth}"`
            compliance = doorWidth >= 32 ? 'compliant' : 'non-compliant'
            if (doorWidth < 32) {
              violation = {
                type: 'Door Width',
                measurement: `${doorWidth}"`,
                description: `Door is ${32 - doorWidth}" too narrow for wheelchair access`,
                severity: doorWidth < 28 ? 'critical' : 'important',
                compliance: false
              }
            }
            break
            
          case 'chair':
            measurement = 'Obstacle'
            compliance = 'marginal'
            violation = {
              type: 'Path Obstruction',
              measurement: 'Chair blocking path',
              description: 'Chair blocks accessible route',
              severity: 'important',
              compliance: false
            }
            break
            
          case 'stop sign':
          case 'traffic light':
            measurement = 'Signage'
            compliance = 'marginal'
            violation = {
              type: 'Sign Accessibility',
              measurement: 'Visual sign only',
              description: 'Missing tactile or audible signage',
              severity: 'minor',
              compliance: false
            }
            break
        }
        
        return {
          ...prediction,
          measurement,
          compliance,
          violation
        }
      })
      
      setDetections(processedDetections)
      
      // Update violations list
      const newViolations = processedDetections
        .filter(d => d.violation)
        .map(d => d.violation)
      setViolations(newViolations)
    }
    
    const interval = setInterval(detectObjects, 500)
    return () => clearInterval(interval)
  }, [model, isScanning])

  // Estimate real-world width from bounding box
  const estimateWidth = (bbox) => {
    // This is a simplified estimation - in reality would need camera calibration
    const pixelWidth = bbox[2]
    const estimatedInches = Math.round(pixelWidth / 10) // Rough approximation
    return estimatedInches
  }

  const handleViolationClick = (detection) => {
    if (detection.violation) {
      console.log('Violation details:', detection.violation)
    }
  }

  const handleContrastResult = (result) => {
    setContrastResult(result)
  }

  const handleAngleResult = (angle) => {
    setRampAngle(Math.abs(angle))
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const handleGenerateReport = async () => {
    // This would call the backend API to generate AI report
    console.log('Generating report for violations:', violations)
    // Implementation would call /reports/generateReport Lambda
  }

  const handleExit = () => {
    setCurrentScene('dashboard')
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Instructions Overlay */}
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
                AR Accessibility Auditor
              </h2>
              <div className="text-gray-300 space-y-4 mb-6">
                <p>
                  Scan your environment to detect accessibility violations in real-time:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Point camera at doors, ramps, and pathways</li>
                  <li>Tap to check color contrast ratios</li>
                  <li>Measure ramp angles using device orientation</li>
                  <li>Get AI-powered compliance reports</li>
                </ul>
                <p className="text-sm text-cyan-accent">
                  Powered by TensorFlow.js object detection and OpenAI analysis.
                  Camera permission is required for scanning.
                </p>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="button-primary w-full"
              >
                Start Scanning
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Canvas for detection overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={window.innerWidth}
        height={window.innerHeight}
      />

      {/* Detection overlays */}
      {isScanning && (
        <>
          <DetectionOverlay 
            detections={detections}
            onViolationClick={handleViolationClick}
          />
          <ColorContrastChecker onContrastResult={handleContrastResult} />
        </>
      )}

      {/* UI Controls */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`px-4 py-2 rounded ${
            isScanning ? 'bg-red-500 text-white' : 'button-primary'
          }`}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
        <button
          onClick={toggleCamera}
          className="button-secondary"
        >
          📷 Switch Camera
        </button>
      </div>

      {/* Ramp Angle Detector */}
      <RampAngleDetector onAngleResult={handleAngleResult} />

      {/* Compliance Panel */}
      <CompliancePanel 
        violations={violations}
        onGenerateReport={handleGenerateReport}
      />

      {/* Contrast Result Popup */}
      <ContrastResultPopup 
        result={contrastResult}
        onClose={() => setContrastResult(null)}
      />

      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 glass-morphism px-6 py-2 hover:bg-white/20 transition-colors"
      >
        Exit Auditor
      </button>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-4 glass-morphism px-4 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isScanning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-sm">
            {isScanning ? 'Scanning...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}
