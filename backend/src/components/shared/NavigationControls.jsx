import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function NavigationControls({ 
  onMenu, 
  onSettings, 
  onAIHelp, 
  showVRButton = false, 
  isVRSupported = false 
}) {
  const [isVRActive, setIsVRActive] = useState(false)

  useEffect(() => {
    // Check VR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRActive(supported)
      })
    }
  }, [])

  const handleVRClick = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-vr')
      setIsVRActive(true)
      
      // Handle VR session end
      session.addEventListener('end', () => {
        setIsVRActive(false)
      })
    } catch (error) {
      console.error('VR session failed:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-8 z-40 flex gap-2"
    >
      {/* Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMenu}
        className="glass-morphism p-3 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
        title="Main Menu"
      >
        <span className="text-xl">🏠</span>
        <span className="text-sm font-medium">Menu</span>
      </motion.button>

      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSettings}
        className="glass-morphism p-3 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
        title="Settings"
      >
        <span className="text-xl">⚙️</span>
        <span className="text-sm font-medium">Settings</span>
      </motion.button>

      {/* AI Help Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAIHelp}
        className="glass-morphism p-3 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
        title="AI Guide"
      >
        <span className="text-xl">🤖</span>
        <span className="text-sm font-medium">AI Guide</span>
      </motion.button>

      {/* VR Button */}
      {showVRButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVRClick}
          disabled={!isVRSupported}
          className={`glass-morphism p-3 rounded-lg flex items-center gap-2 transition-colors ${
            !isVRSupported 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-white/20'
          }`}
          title={isVRSupported ? 'Enter VR Mode' : 'VR Not Supported'}
        >
          <span className="text-xl">🥽</span>
          <span className="text-sm font-medium">
            {isVRActive ? 'Exit VR' : 'VR'}
          </span>
        </motion.button>
      )}

      {/* VR Status Indicator */}
      {isVRActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism px-3 py-2 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">VR Active</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
