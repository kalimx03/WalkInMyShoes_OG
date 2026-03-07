import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

class TensorFlowService {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.isLoading = false
  }

  async loadModel() {
    if (this.isLoaded || this.isLoading) {
      return
    }

    this.isLoading = true
    
    try {
      console.log('Loading TensorFlow.js model...')
      
      // Load COCO-SSD model for object detection
      this.model = await cocoSsd.load()
      
      this.isLoaded = true
      this.isLoading = false
      
      console.log('TensorFlow.js model loaded successfully')
      return this.model
    } catch (error) {
      this.isLoading = false
      console.error('Failed to load TensorFlow.js model:', error)
      throw error
    }
  }

  async detectObjects(imageElement, confidenceThreshold = 0.5) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      // Make predictions
      const predictions = await this.model.detect(imageElement, {
        maxDetections: 10,
        scoreThreshold: confidenceThreshold
      })

      // Process predictions
      const processedPredictions = predictions.map(prediction => ({
        class: prediction.class,
        score: prediction.score,
        bbox: [
          prediction.bbox[0], // x
          prediction.bbox[1], // y
          prediction.bbox[2] - prediction.bbox[0], // width
          prediction.bbox[3] - prediction.bbox[1]  // height
        ],
        confidence: prediction.score
      }))

      return processedPredictions
    } catch (error) {
      console.error('Object detection error:', error)
      throw error
    }
  }

  // Filter detections by class
  filterDetectionsByClass(detections, targetClasses) {
    return detections.filter(detection => 
      targetClasses.includes(detection.class.toLowerCase())
    )
  }

  // Get accessibility-relevant objects
  getAccessibilityObjects(detections) {
    const accessibilityObjects = this.filterDetectionsByClass(detections, [
      'door', 'chair', 'couch', 'potted plant', 'dining table', 
      'toilet', 'sink', 'bed', 'tv', 'laptop', 'keyboard', 'mouse'
    ])

    return accessibilityObjects.map(obj => ({
      ...obj,
      accessibilityIssue: this.getAccessibilityIssue(obj)
    }))
  }

  // Determine accessibility issues
  getAccessibilityIssue(detection) {
    const issues = {
      door: {
        type: 'Door Width',
        severity: 'critical',
        threshold: 32, // inches
        unit: 'width',
        solution: 'Ensure minimum 32" clear width for wheelchair access'
      },
      chair: {
        type: 'Path Obstruction',
        severity: 'important',
        solution: 'Remove or relocate chairs blocking accessible routes'
      },
      couch: {
        type: 'Path Obstruction',
        severity: 'important',
        solution: 'Ensure adequate clearance around furniture'
      },
      'potted plant': {
        type: 'Path Obstruction',
        severity: 'minor',
        solution: 'Keep plants in designated areas away from main paths'
      },
      'dining table': {
        type: 'Height Issue',
        severity: 'important',
        threshold: 29, // inches
        unit: 'height',
        solution: 'Provide accessible table height or knee space'
      },
      toilet: {
        type: 'Accessibility',
        severity: 'critical',
        solution: 'Ensure accessible restroom with grab bars and adequate space'
      },
      sink: {
        type: 'Reach Issue',
        severity: 'important',
        threshold: 48, // inches
        unit: 'height',
        solution: 'Install accessible sink at appropriate height'
      },
      bed: {
        type: 'Accessibility',
        severity: 'important',
        solution: 'Ensure accessible bed height and clear floor space'
      },
      tv: {
        type: 'Visual Information',
        severity: 'minor',
        solution: 'Provide visual alerts for important information'
      },
      laptop: {
        type: 'Visual Information',
        severity: 'minor',
        solution: 'Ensure screen reader compatibility and high contrast'
      },
      keyboard: {
        type: 'Reach Issue',
        severity: 'important',
        solution: 'Provide accessible keyboard placement at appropriate height'
      },
      mouse: {
        type: 'Reach Issue',
        severity: 'important',
        solution: 'Ensure accessible mouse placement'
      }
    }

    return issues[detection.class] || {
      type: 'Unknown',
      severity: 'minor',
      solution: 'Manual review recommended'
    }
  }

  // Calculate measurements from bounding boxes
  calculateMeasurements(detection, imageWidth, imageHeight) {
    if (!detection || !detection.bbox) {
      return null
    }

    const [x, y, width, height] = detection.bbox
    
    // Convert pixel measurements to estimated real-world measurements
    // This is a simplified estimation - in production, you'd use camera calibration
    const pixelToInch = 96 // Assuming 96 DPI
    const realWidth = (width / pixelToInch).toFixed(1)
    const realHeight = (height / pixelToInch).toFixed(1)
    
    // Calculate center point
    const centerX = x + width / 2
    const centerY = y + height / 2
    
    return {
      width: realWidth,
      height: realHeight,
      centerX: (centerX / pixelToInch).toFixed(1),
      centerY: (centerY / pixelToInch).toFixed(1),
      pixelWidth: width,
      pixelHeight: height,
      boundingBox: {
        x,
        y,
        width,
        height
      }
    }
  }

  // Real-time detection with video stream
  async startRealTimeDetection(videoElement, callback, confidenceThreshold = 0.5) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    const detect = async () => {
      try {
        const detections = await this.detectObjects(videoElement, confidenceThreshold)
        callback(detections)
      } catch (error) {
        console.error('Real-time detection error:', error)
      }
    }

    // Set up detection interval (every 500ms)
    const detectionInterval = setInterval(detect, 500)
    
    return {
      stop: () => {
        clearInterval(detectionInterval)
      }
    }
  }

  // Load model with progress tracking
  async loadModelWithProgress(onProgress) {
    if (this.isLoaded || this.isLoading) {
      return
    }

    this.isLoading = true
    
    try {
      console.log('Loading TensorFlow.js model...')
      onProgress({ stage: 'loading', progress: 0 })
      
      // Load COCO-SSD model
      this.model = await cocoSsd.load()
      
      this.isLoaded = true
      this.isLoading = false
      
      onProgress({ stage: 'complete', progress: 100 })
      console.log('TensorFlow.js model loaded successfully')
      
      return this.model
    } catch (error) {
      this.isLoading = false
      onProgress({ stage: 'error', progress: 0, error: error.message })
      throw error
    }
  }

  // Model information
  getModelInfo() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      model: this.model,
      version: 'COCO-SSD v2.2.0',
      classes: [
        'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
        'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
        'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
        'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
        'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
        'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
        'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
        'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
        'potted plant', 'bed', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
        'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
        'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
        'hair dryer', 'paper towel', 'laptop bag', 'backpack', 'handbag', 'suitcase',
        'umbrella', 'sunglasses', 'wallet', 'watch', 'belt', 'shoes', 'slippers'
      ]
    }
  }

  // Dispose model
  dispose() {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.isLoaded = false
    }
  }

  // Performance optimization
  warmupModel() {
    if (!this.isLoaded) {
      return this.loadModel()
    }
    
    // Run a few dummy detections to warm up the model
    const dummyCanvas = document.createElement('canvas')
    dummyCanvas.width = 640
    dummyCanvas.height = 480
    
    for (let i = 0; i < 3; i++) {
      this.detectObjects(dummyCanvas, 0.3).catch(() => {})
    }
  }
}

export default new TensorFlowService()
