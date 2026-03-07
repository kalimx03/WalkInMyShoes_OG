const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class AnalyticsService {
  constructor() {
    this.isAvailable = !!import.meta.env.VITE_API_BASE_URL
  }

  validateConnection() {
    if (!this.isAvailable) {
      console.warn('Analytics API not configured. Using local storage fallback.')
      return false
    }
    return true
  }

  async saveProgress(progressData) {
    try {
      if (!this.validateConnection()) {
        // Fallback: store in local storage
        const saved = JSON.parse(localStorage.getItem('walkinmyshoes_progress') || '[]')
        saved.push({ ...progressData, timestamp: new Date().toISOString() })
        localStorage.setItem('walkinmyshoes_progress', JSON.stringify(saved))
        return { success: true, local: true }
      }

      const response = await fetch(`${API_BASE_URL}/analytics/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      })

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Analytics save progress error:', error)
      // Fallback to local storage
      try {
        const saved = JSON.parse(localStorage.getItem('walkinmyshoes_progress') || '[]')
        saved.push({ ...progressData, timestamp: new Date().toISOString(), error: true })
        localStorage.setItem('walkinmyshoes_progress', JSON.stringify(saved))
      } catch (e) {
        console.error('Failed to save to local storage:', e)
      }
      return { success: false, error: error.message }
    }
  }

  async getLeaderboard(limit = 50) {
    try {
      if (!this.validateConnection()) {
        return { data: [], message: 'Leaderboard not available offline' }
      }

      const response = await fetch(`${API_BASE_URL}/analytics/leaderboard?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Analytics leaderboard error:', error)
      return { data: [], error: error.message }
    }
  }

  async getEmpathyStats(userId) {
    try {
      if (!this.validateConnection()) {
        return { stats: {}, message: 'Stats not available offline' }
      }

      const response = await fetch(`${API_BASE_URL}/analytics/stats?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch empathy stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Analytics stats error:', error)
      return { stats: {}, error: error.message }
    }
  }

  async getUserProfile(userId) {
    try {
      if (!this.validateConnection()) {
        return { profile: {}, message: 'Profile not available offline' }
      }

      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Analytics user profile error:', error)
      return { profile: {}, error: error.message }
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      if (!this.validateConnection()) {
        localStorage.setItem(`walkinmyshoes_profile_${userId}`, JSON.stringify(profileData))
        return { success: true, local: true }
      }

      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Analytics update profile error:', error)
      // Fallback to local storage
      try {
        localStorage.setItem(`walkinmyshoes_profile_${userId}`, JSON.stringify(profileData))
      } catch (e) {
        console.error('Failed to save profile to local storage:', e)
      }
      return { success: false, error: error.message }
    }
  }

  // Batch analytics operations
  async batchSaveProgress(progressArray) {
    const promises = progressArray.map(progress => this.saveProgress(progress))
    return Promise.allSettled(promises)
  }

  // Real-time analytics
  async trackEvent(eventName, properties = {}) {
    const event = {
      eventName,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    }

    // Send to analytics endpoint
    try {
      if (!this.validateConnection()) {
        const events = JSON.parse(localStorage.getItem('walkinmyshoes_events') || '[]')
        events.push(event)
        localStorage.setItem('walkinmyshoes_events', JSON.stringify(events))
        return
      }

      await fetch(`${API_BASE_URL}/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.warn('Failed to track event:', error.message)
      // Fallback to local storage
      try {
        const events = JSON.parse(localStorage.getItem('walkinmyshoes_events') || '[]')
        events.push(event)
        localStorage.setItem('walkinmyshoes_events', JSON.stringify(events.slice(-1000)))
      } catch (e) {
        console.error('Failed to save event to local storage:', e)
      }
    }
  }

  getCurrentUserId() {
    return localStorage.getItem('walkinmyshoes_user_id') || 'guest_user'
  }

  // Performance monitoring
  async trackPerformance(metricName, value, unit = 'ms') {
    const performance = {
      metricName,
      value,
      unit,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId()
    }

    try {
      if (!this.validateConnection()) {
        const metrics = JSON.parse(localStorage.getItem('walkinmyshoes_metrics') || '[]')
        metrics.push(performance)
        localStorage.setItem('walkinmyshoes_metrics', JSON.stringify(metrics.slice(-100)))
        return
      }

      await fetch(`${API_BASE_URL}/analytics/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performance)
      })
    } catch (error) {
      console.warn('Failed to track performance:', error.message)
    }
  }
}

export default new AnalyticsService()
