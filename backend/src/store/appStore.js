import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set, get) => ({
      // User state
      user: {
        id: null,
        name: null,
        email: null,
        isAuthenticated: false,
        isGuest: true
      },

      // Navigation state
      currentScene: 'landing', // 'landing' | 'menu' | 'visual' | 'hearing' | 'motor' | 'ar' | 'dashboard'
      
      // Scenario state
      scenarioData: {
        currentTask: null,
        completedTasks: [],
        visionStage: 1,
        hearingMode: 1,
        taskTimers: {},
        wheelchairPhysics: {
          speed: 0.5,
          turningRadius: 1.5,
          cameraHeight: 1.2
        }
      },

      // Session metrics
      sessionMetrics: {
        startTime: null,
        totalTime: 0,
        errorsPerTask: {},
        retries: 0,
        helpRequests: 0,
        frustrationEvents: 0
      },

      // Empathy scoring
      empathyScore: {
        total: 0,
        breakdown: {
          knowledge: 0,
          engagement: 0,
          retries: 0,
          helpSeeking: 0,
          resilience: 0
        }
      },

      // Assessment data
      preAssessment: {
        completed: false,
        answers: [],
        score: 0
      },
      
      postAssessment: {
        completed: false,
        answers: [],
        score: 0
      },

      // AI Guide history
      aiGuideHistory: [],

      // Certificates
      certificates: [],

      // Leaderboard
      leaderboard: {
        data: [],
        userRank: null,
        userScore: null,
        lastFetched: null
      },

      // Settings
      settings: {
        audioEnabled: true,
        captionsEnabled: true,
        difficultyLevel: 'medium',
        deviceType: 'desktop', // 'desktop' | 'mobile' | 'vr'
        vrSupported: false
      },

      // Actions
      setUser: (userData) => set({ user: { ...get().user, ...userData, isAuthenticated: true } }),
      
      setGuestMode: () => set({ 
        user: { 
          id: `guest_${Date.now()}`, 
          name: 'Guest User', 
          email: null, 
          isAuthenticated: false, 
          isGuest: true 
        } 
      }),

      setCurrentScene: (scene) => set({ currentScene: scene }),

      updateScenarioData: (data) => set({ scenarioData: { ...get().scenarioData, ...data } }),

      completeTask: (taskId) => set((state) => ({
        scenarioData: {
          ...state.scenarioData,
          completedTasks: [...state.scenarioData.completedTasks, taskId]
        }
      })),

      updateVisionStage: (stage) => set((state) => ({
        scenarioData: { ...state.scenarioData, visionStage: stage }
      })),

      updateHearingMode: (mode) => set((state) => ({
        scenarioData: { ...state.scenarioData, hearingMode: mode }
      })),

      startSession: () => set({ 
        sessionMetrics: { ...get().sessionMetrics, startTime: Date.now() }
      }),

      endSession: () => {
        const startTime = get().sessionMetrics.startTime
        const totalTime = startTime ? Date.now() - startTime : 0
        set({ 
          sessionMetrics: { ...get().sessionMetrics, totalTime }
        })
      },

      recordError: (taskId) => set((state) => ({
        sessionMetrics: {
          ...state.sessionMetrics,
          errorsPerTask: {
            ...state.sessionMetrics.errorsPerTask,
            [taskId]: (state.sessionMetrics.errorsPerTask[taskId] || 0) + 1
          }
        }
      })),

      incrementRetries: () => set((state) => ({
        sessionMetrics: { ...state.sessionMetrics, retries: state.sessionMetrics.retries + 1 }
      })),

      incrementHelpRequests: () => set((state) => ({
        sessionMetrics: { ...state.sessionMetrics, helpRequests: state.sessionMetrics.helpRequests + 1 }
      })),

      incrementFrustrationEvents: () => set((state) => ({
        sessionMetrics: { ...state.sessionMetrics, frustrationEvents: state.sessionMetrics.frustrationEvents + 1 }
      })),

      calculateEmpathyScore: () => {
        const state = get()
        const { totalTime, retries, helpRequests, frustrationEvents } = state.sessionMetrics
        const { preAssessment, postAssessment } = state
        
        const knowledgeGain = postAssessment.score - preAssessment.score
        const timeEngaged = Math.min(totalTime / 600000, 1) // 10 minutes = 1.0
        const retriesRatio = Math.max(0, 1 - (retries / 10)) // Fewer retries = better
        const helpSeeking = Math.min(helpRequests / 5, 1) // Some help seeking is good
        const resilience = Math.max(0, 1 - (frustrationEvents / 5)) // Less frustration = better

        const total = (
          knowledgeGain * 0.30 +
          timeEngaged * 0.20 +
          retriesRatio * 0.20 +
          helpSeeking * 0.15 +
          resilience * 0.15
        ) * 100

        const breakdown = {
          knowledge: knowledgeGain * 100,
          engagement: timeEngaged * 100,
          retries: retriesRatio * 100,
          helpSeeking: helpSeeking * 100,
          resilience: resilience * 100
        }

        set({ empathyScore: { total, breakdown } })
        return total
      },

      setPreAssessment: (answers, score) => set({
        preAssessment: { completed: true, answers, score }
      }),

      setPostAssessment: (answers, score) => set({
        postAssessment: { completed: true, answers, score }
      }),

      addAIMessage: (message) => set((state) => ({
        aiGuideHistory: [...state.aiGuideHistory, {
          id: Date.now(),
          ...message,
          timestamp: new Date().toISOString(),
          sceneContext: state.currentScene
        }]
      })),

      clearAIHistory: () => set({ aiGuideHistory: [] }),

      addCertificate: (certificate) => set((state) => ({
        certificates: [...state.certificates, certificate]
      })),

      setLeaderboard: (data, userRank, userScore) => set({
        leaderboard: {
          data,
          userRank,
          userScore,
          lastFetched: Date.now()
        }
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetScenario: () => set({
        scenarioData: {
          currentTask: null,
          completedTasks: [],
          visionStage: 1,
          hearingMode: 1,
          taskTimers: {},
          wheelchairPhysics: {
            speed: 0.5,
            turningRadius: 1.5,
            cameraHeight: 1.2
          }
        },
        sessionMetrics: {
          startTime: null,
          totalTime: 0,
          errorsPerTask: {},
          retries: 0,
          helpRequests: 0,
          frustrationEvents: 0
        }
      })
    }),
    {
      name: 'walkinmyshoes-store',
      partialize: (state) => ({
        user: state.user,
        empathyScore: state.empathyScore,
        certificates: state.certificates,
        settings: state.settings
      })
    }
  )
)

export default useAppStore
