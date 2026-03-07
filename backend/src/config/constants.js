// App constants
export const APP_CONFIG = {
  NAME: 'WalkInMyShoes',
  VERSION: '1.0.0',
  DESCRIPTION: 'Immersive WebXR Disability Empathy Training Platform',
  AUTHOR: 'WalkInMyShoes Team',
  GITHUB_URL: 'https://github.com/walkinmyshoes/platform',
  SUPPORT_EMAIL: 'support@walkinmyshoes.com'
}

// Scene constants
export const SCENES = {
  LANDING: 'landing',
  MENU: 'menu',
  SELECTOR: 'selector',
  VISUAL_IMPAIRMENT: 'visual',
  HEARING_LOSS: 'hearing',
  MOTOR_DISABILITY: 'motor',
  AR_AUDITOR: 'ar',
  DASHBOARD: 'dashboard',
  CERTIFICATE: 'certificate'
}

// Vision impairment stages
export const VISION_STAGES = {
  MILD_MYOPIA: 1,
  MODERATE_TUNNEL: 2,
  MACULAR_DEGENERATION: 3,
  ADVANCED_CATARACTS: 4,
  LEGAL_BLINDNESS: 5
}

// Hearing loss modes
export const HEARING_MODES = {
  MILD_HIGH_FREQ: 1,
  MODERATE_BILATERAL: 2,
  SEVERE_TINNITUS: 3,
  PROFOUND_SILENCE: 4,
  UNILATERAL: 5
}

// Empathy score thresholds
export const EMPATHY_THRESHOLDS = {
  AWARE: { min: 0, max: 40, badge: '🥉 Accessibility Aware', color: '#ef4444' },
  ADVOCATE: { min: 41, max: 70, badge: '🥈 Accessibility Advocate', color: '#f59e0b' },
  ALLY: { min: 71, max: 100, badge: '🏅 Accessibility Ally', color: '#7c3aed' }
}

// WCAG contrast ratios
export const WCAG_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5
}

// ADA standards
export const ADA_STANDARDS = {
  DOOR_WIDTH_MIN: 32, // inches
  DOOR_WIDTH_RECOMMENDED: 36, // inches
  RAMP_SLOPE_MAX: 12, // 1:12 ratio
  TURNING_SPACE: 60, // inches square
  REACH_RANGE_FORWARD: { min: 15, max: 48 }, // inches
  REACH_RANGE_SIDE: { min: 9, max: 54 }, // inches
  KNEE_SPACE: { width: 30, depth: 48, height: 27 }, // inches
  PARKING_SPACE: 96, // inches wide
  LIGHT_SWITCH_HEIGHT: { min: 40, max: 48 } // inches
}

// Audio frequencies for hearing simulation
export const AUDIO_FREQUENCIES = {
  SPEECH_RANGE: { min: 85, max: 255 }, // Hz
  HIGH_FREQ_LOSS: 3000, // Hz cutoff
  TINNITUS_FREQ: 6000, // Hz
  MALE_VOICE: 120, // Hz average
  FEMALE_VOICE: 200 // Hz average
}

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  MOBILE: 375,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1920
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'walkinmyshoes_preferences',
  SESSION_DATA: 'walkinmyshoes_session',
  COMPLETED_SCENARIOS: 'walkinmyshoes_completed',
  AIGUIDE_HISTORY: 'walkinmyshoes_ai_history'
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  CAMERA_ACCESS_DENIED: 'Camera access denied. Please enable camera permissions to use AR features.',
  VR_NOT_SUPPORTED: 'WebXR is not supported on this device or browser.',
  AUDIO_CONTEXT_FAILED: 'Audio initialization failed. Please check your audio permissions.',
  MODEL_LOAD_FAILED: 'Failed to load 3D models. Please refresh the page.',
  OPENAI_API_ERROR: 'AI service temporarily unavailable. Please try again later.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  CERTIFICATE_GENERATED: 'Certificate generated successfully!',
  PROGRESS_SAVED: 'Progress saved successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
}

// Loading messages
export const LOADING_MESSAGES = {
  INITIALIZING: 'Initializing experience...',
  LOADING_ASSETS: 'Loading 3D assets...',
  LOADING_AI: 'Connecting to AI guide...',
  PREPARING_SCENE: 'Preparing simulation...',
  GENERATING_REPORT: 'Generating accessibility report...'
}

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    CREATE_USER: '/auth/user',
    GET_PROFILE: '/auth/user',
    UPDATE_PROFILE: '/auth/user'
  },
  SCENARIOS: {
    GENERATE: '/scenarios/generate',
    ADJUST_DIFFICULTY: '/scenarios/adjust-difficulty'
  },
  ANALYTICS: {
    SAVE_PROGRESS: '/analytics/progress',
    LEADERBOARD: '/analytics/leaderboard',
    STATS: '/analytics/stats'
  },
  REPORTS: {
    GENERATE: '/reports/generate',
    CERTIFICATE: '/reports/certificate'
  },
  ASSETS: {
    PRESIGNED_URL: '/assets/url'
  }
}

// Feature flags
export const FEATURES = {
  VR_SUPPORT: 'vr_support',
  AR_SUPPORT: 'ar_support',
  AI_GUIDE: 'ai_guide',
  OFFLINE_MODE: 'offline_mode',
  MULTIPLAYER: 'multiplayer'
}

// Default user preferences
export const DEFAULT_PREFERENCES = {
  audioEnabled: true,
  captionsEnabled: true,
  difficultyLevel: 'medium',
  language: 'en',
  theme: 'dark',
  notifications: true,
  autoSave: true
}
