import React from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/appStore'

// Animated logo using pure CSS — no @react-three/fiber
// R3F Canvas conflicts with A-Frame's WebGL context causing context loss
function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center h-full">
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="text-6xl md:text-8xl font-black gradient-text select-none"
      >
        WIMS
      </motion.div>
      {/* Glowing orbs behind text */}
      {['#7c3aed', '#06b6d4', '#10b981'].map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 80 + i * 20,
            height: 80 + i * 20,
            background: `radial-gradient(circle, ${color}33, transparent)`,
            left: `${25 + i * 20}%`,
            top: `${20 + i * 15}%`,
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}
    </div>
  )
}

export default function MainMenu() {
  const { setCurrentScene, user } = useAppStore()

  const menuItems = [
    {
      title: 'Visual Impairment',
      description: 'Experience navigation with vision loss',
      icon: '👁️',
      scene: 'visual',
      difficulty: 'Advanced',
      time: '15-20 min',
    },
    {
      title: 'Hearing Loss',
      description: 'Navigate a world without sound',
      icon: '👂',
      scene: 'hearing',
      difficulty: 'Intermediate',
      time: '10-15 min',
    },
    {
      title: 'Motor Disability',
      description: 'Navigate barriers from a wheelchair',
      icon: '♿',
      scene: 'motor',
      difficulty: 'Challenging',
      time: '20-25 min',
    },
    {
      title: 'AR Auditor',
      description: 'Scan real spaces for accessibility',
      icon: '📱',
      scene: 'ar',
      difficulty: 'Beginner',
      time: '5-10 min',
    },
  ]

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col">

      {/* Header with animated logo */}
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <AnimatedLogo />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Choose Your Experience
          </h1>
          <p className="text-gray-400 text-lg">
            Welcome, {user?.name ?? 'Guest'}!
          </p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.scene}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentScene(item.scene)}
              className="glass-morphism p-8 cursor-pointer group hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.difficulty === 'Beginner'     ? 'bg-green-500/20 text-green-400' :
                      item.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.difficulty === 'Advanced'     ? 'bg-orange-500/20 text-orange-400' :
                                                           'bg-red-500/20 text-red-400'
                    }`}>
                      {item.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-400 mb-4">{item.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⏱️ {item.time}</span>
                    <span>🎯 Immersive</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="button-primary text-sm px-6 py-2">
                  Start Experience
                </button>
                <div className="text-cyan-accent group-hover:text-cyan-accent/80 transition-colors">
                  →
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-glass-border p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentScene('landing')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => setCurrentScene('dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            View Dashboard →
          </button>
        </div>
      </div>
    </div>
  )
}
