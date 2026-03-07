import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import useAppStore from '../../store/appStore'

// ─── Animated particle background using pure CSS/canvas (no Three.js) ────────
// Using plain canvas instead of @react-three/fiber to avoid the Three.js
// dual-instance conflict with A-Frame (both fight over the WebGL context).
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animFrameId

    const particles = []
    const count = 120

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        color: ['#7c3aed', '#06b6d4', '#10b981'][Math.floor(Math.random() * 3)],
        opacity: Math.random() * 0.6 + 0.2,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      ctx.globalAlpha = 1
      animFrameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.5 }}
    />
  )
}

// ─── Floating geometric shapes (pure CSS animation, no WebGL) ─────────────────
function FloatingShapes() {
  const shapes = [
    { size: 60, color: '#7c3aed', top: '15%', left: '10%', delay: 0 },
    { size: 40, color: '#06b6d4', top: '25%', right: '12%', delay: 1 },
    { size: 50, color: '#10b981', top: '60%', left: '8%', delay: 2 },
    { size: 35, color: '#7c3aed', top: '70%', right: '15%', delay: 0.5 },
    { size: 45, color: '#06b6d4', top: '40%', left: '85%', delay: 1.5 },
  ]

  return (
    <>
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, ${s.color}44, ${s.color}11)`,
            border: `1px solid ${s.color}66`,
            top: s.top,
            left: s.left,
            right: s.right,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4 + i,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      setCount(Math.floor(target * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

// ─── Main LandingPage ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { setCurrentScene, startSession } = useAppStore()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 300], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const handleStartExperience = () => {
    startSession()
    setCurrentScene('menu')
  }

  return (
    <div className="relative min-h-screen bg-deep-navy overflow-hidden">

      {/* Background — plain canvas particles, no Three.js / R3F */}
     <div className="absolute inset-0 -z-10 pointer-events-none">
        <ParticleCanvas />
        <FloatingShapes />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-navy/30 to-deep-navy/80" />
      </div>

      {/* ── Hero ── */}
      <motion.section
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text text-shadow-glow">
              Walk In My Shoes
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the world through different perspectives. Build empathy. Drive change.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {[
              { target: 1000000000, suffix: '+', label: 'People with Disabilities' },
              { target: 50, suffix: '+', label: 'Daily Barriers' },
              { target: 15, suffix: '%', label: 'Accessible Spaces' },
            ].map((stat, i) => (
              <div key={i} className="glass-morphism p-6">
                <div className="text-3xl font-bold gradient-text mb-2">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <button onClick={handleStartExperience} className="button-primary text-lg px-12 py-6 group">
              Start Experience →
              <span className="block text-sm opacity-80 mt-1">NO LOGIN REQUIRED</span>
            </button>
            <button className="button-secondary text-lg px-12 py-6">Watch Demo</button>
            <button className="button-secondary text-lg px-12 py-6">Learn More</button>
          </motion.div>

          {/* Preview Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {[
              { emoji: '👁️', color: 'purple-accent', title: 'Visual Impairment', desc: 'Navigate a city with vision loss through 5 progressive stages' },
              { emoji: '👂', color: 'cyan-accent', title: 'Hearing Loss', desc: 'Experience a world without sound and visual cues' },
              { emoji: '♿', color: 'green-accent', title: 'Motor Disability', desc: 'Navigate barriers in everyday spaces from a wheelchair' },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="glass-morphism p-6 hover:scale-105 transition-transform duration-300"
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 bg-${card.color}/20 rounded-full flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{card.emoji}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-400">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── How It Works ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: 1, title: 'Choose a Perspective', desc: 'Select from visual, hearing, or motor disability simulations' },
              { n: 2, title: 'Experience the World', desc: 'Immersive WebXR scenarios with realistic challenges' },
              { n: 3, title: 'Build Empathy & Knowledge', desc: 'Gain insights through AI-guided reflection and assessment' },
            ].map((step) => (
              <motion.div
                key={step.n}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: step.n * 0.2, duration: 0.6 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-accent to-cyan-accent rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.n}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AR Auditor ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-morphism p-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-accent to-cyan-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                <span className="text-4xl">📱</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                AR Accessibility Auditor
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Scan Your World — Detect accessibility violations in real spaces
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-accent">
                <span className="text-lg">Powered by</span>
                <span className="font-semibold">TensorFlow.js + OpenAI</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Real Impact
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { target: 500, suffix: '+', label: 'Users Trained', delay: 0.2 },
              { target: 100, prefix: '$', suffix: 'K+', label: 'Compliance Issues Found', delay: 0.4 },
              { target: 94, suffix: '%', label: 'Report Increased Empathy', delay: 0.6 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass-morphism p-8 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay, duration: 0.6 }}
              >
                <div className="text-4xl font-bold gradient-text mb-2">
                  {stat.prefix}<AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Voices from the Community
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', condition: 'Visual Impairment', quote: 'Finally, a tool that helps people understand what we navigate daily. The attention to detail is remarkable.', avatar: '👩‍🦯' },
              { name: 'Marcus Johnson', condition: 'Hearing Loss', quote: "As someone who's deaf, this simulation captures the challenges we face in a hearing world perfectly.", avatar: '🧑‍🦱' },
              { name: 'Emily Rodriguez', condition: 'Mobility Impairment', quote: 'The wheelchair simulation is incredibly realistic. More people need to experience this.', avatar: '👩‍🦽' },
            ].map((t, i) => (
              <motion.div
                key={i}
                className="glass-morphism p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <div className="text-4xl mb-4">{t.avatar}</div>
                <p className="text-gray-300 mb-6 italic">"{t.quote}"</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-400">{t.condition}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-12 px-4 border-t border-glass-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold gradient-text mb-2">WalkInMyShoes</h3>
            <p className="text-gray-400">Built with ❤️ for a more inclusive world</p>
          </div>
          <div className="flex gap-8 text-gray-400">
            {['About', 'Privacy', 'Terms', 'Accessibility'].map((item) => (
              <button key={item} className="hover:text-white transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
