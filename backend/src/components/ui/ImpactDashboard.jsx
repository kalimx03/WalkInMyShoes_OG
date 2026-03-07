import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement } from 'chart.js'
import { Doughnut, Radar, Line } from 'react-chartjs-2'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import useAppStore from '../../store/appStore'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement)

// Animated counter component
function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime
    const startValue = 0
    const endValue = target
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(startValue + (endValue - startValue) * progress))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration])
  
  return <span>{count}{suffix}</span>
}

// Empathy score ring component
function EmpathyScoreRing({ score, onGenerateCertificate }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const getScoreColor = (score) => {
    if (score >= 71) return '#7c3aed' // Purple - Ally
    if (score >= 41) return '#f59e0b' // Orange - Advocate  
    return '#ef4444' // Red - Aware
  }
  
  const getBadgeLevel = (score) => {
    if (score >= 71) return '🏅 Accessibility Ally'
    if (score >= 41) return '🥈 Accessibility Advocate'
    return '🥉 Accessibility Aware'
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="45"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="45"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2000, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold gradient-text">
            <AnimatedCounter target={Math.round(score)} />
          </div>
          <div className="text-sm text-gray-400">Empathy Score</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold" style={{ color: getScoreColor(score) }}>
          {getBadgeLevel(score)}
        </div>
        <button
          onClick={onGenerateCertificate}
          className="mt-2 button-primary text-sm"
        >
          Generate Certificate
        </button>
      </div>
    </div>
  )
}

// Scenario completion card
function ScenarioCard({ scenario, data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{scenario}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          data.completed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {data.completed ? '✓ Completed' : '○ Not Started'}
        </div>
      </div>
      
      {data.completed && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Tasks Completed:</span>
            <span>{data.tasksCompleted}/{data.totalTasks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time Taken:</span>
            <span>{data.timeTaken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Errors:</span>
            <span>{data.errors}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Help Requests:</span>
            <span>{data.helpRequests}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Assessment comparison chart
function AssessmentComparison({ preScore, postScore }) {
  const knowledgeGain = postScore - preScore
  
  const data = {
    labels: ['Pre-Assessment', 'Post-Assessment'],
    datasets: [
      {
        label: 'Score %',
        data: [preScore, postScore],
        backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(34, 197, 94, 0.5)'],
        borderColor: ['rgba(239, 68, 68, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 2
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
  
  return (
    <div className="h-64">
      <Line data={data} options={options} />
      <div className="text-center mt-4">
        <div className="text-2xl font-bold text-green-400">
          +{knowledgeGain}% Improvement
        </div>
        <div className="text-sm text-gray-400">
          Knowledge Gain
        </div>
      </div>
    </div>
  )
}

// Skills radar chart
function SkillsRadar({ breakdown }) {
  const data = {
    labels: ['Knowledge', 'Engagement', 'Resilience', 'Help Seeking', 'Learning'],
    datasets: [
      {
        label: 'Your Skills',
        data: [
          breakdown.knowledge,
          breakdown.engagement,
          breakdown.resilience,
          breakdown.helpSeeking,
          (breakdown.retries / 100) * 100 // Convert retries to positive metric
        ],
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(124, 58, 237, 1)'
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          backdropColor: 'transparent'
        },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
  
  return (
    <div className="h-64">
      <Radar data={data} options={options} />
    </div>
  )
}

// Leaderboard component
function Leaderboard({ data, userRank, userScore }) {
  return (
    <div className="glass-morphism p-6">
      <h3 className="text-lg font-semibold mb-4">Global Leaderboard</h3>
      
      {userRank && (
        <div className="mb-4 p-3 bg-purple-accent/20 border border-purple-accent/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Your Rank</span>
            <span className="text-xl font-bold">#{userRank}</span>
          </div>
          <div className="text-sm text-gray-400">
            Score: {userScore}/100
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {data.slice(0, 10).map((entry, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded ${
              entry.isUser ? 'bg-purple-accent/20 border border-purple-accent/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' :
                index === 1 ? 'bg-gray-400 text-black' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-semibold">
                  {entry.isUser ? 'You' : `User_${entry.id.slice(-4)}`}
                </div>
                <div className="text-xs text-gray-400">
                  {entry.badge}
                </div>
              </div>
            </div>
            <div className="text-lg font-bold">
              {entry.score}/100
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ImpactDashboard() {
  const {
    currentScene,
    setCurrentScene,
    empathyScore,
    preAssessment,
    postAssessment,
    scenarioData,
    sessionMetrics,
    certificates,
    addCertificate,
    leaderboard,
    aiGuideHistory,
    user
  } = useAppStore()
  
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificateData, setCertificateData] = useState(null)
  const certificateRef = useRef()

  // Calculate empathy score on mount
  useEffect(() => {
    useAppStore.getState().calculateEmpathyScore()
  }, [])

  // Mock scenario data (in production, this would come from the store)
  const scenarioStats = {
    'Visual Impairment': {
      completed: scenarioData.completedTasks.length > 0,
      tasksCompleted: scenarioData.completedTasks.length,
      totalTasks: 3,
      timeTaken: '12:34',
      errors: Object.values(sessionMetrics.errorsPerTask).reduce((a, b) => a + b, 0),
      helpRequests: sessionMetrics.helpRequests
    },
    'Hearing Loss': {
      completed: false,
      tasksCompleted: 0,
      totalTasks: 3,
      timeTaken: '--:--',
      errors: 0,
      helpRequests: 0
    },
    'Motor Disability': {
      completed: false,
      tasksCompleted: 0,
      totalTasks: 3,
      timeTaken: '--:--',
      errors: 0,
      helpRequests: 0
    }
  }

  // Mock leaderboard data
  const mockLeaderboard = [
    { id: 'abc123', score: 95, badge: '🏅 Accessibility Ally', isUser: false },
    { id: 'def456', score: 92, badge: '🏅 Accessibility Ally', isUser: false },
    { id: 'ghi789', score: 88, badge: '🥈 Accessibility Advocate', isUser: false },
    { id: user.id, score: Math.round(empathyScore.total), badge: '🥈 Accessibility Advocate', isUser: true },
    { id: 'jkl012', score: 82, badge: '🥈 Accessibility Advocate', isUser: false },
  ]

  const handleGenerateCertificate = async () => {
    const certificate = {
      id: `cert_${Date.now()}`,
      userName: user.name,
      score: Math.round(empathyScore.total),
      date: new Date().toLocaleDateString(),
      scenariosCompleted: Object.values(scenarioStats).filter(s => s.completed).length,
      badge: empathyScore.total >= 71 ? '🏅 Accessibility Ally' : 
             empathyScore.total >= 41 ? '🥈 Accessibility Advocate' : '🥉 Accessibility Aware'
    }
    
    setCertificateData(certificate)
    setShowCertificateModal(true)
    addCertificate(certificate)
  }

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return
    
    try {
      const canvas = await html2canvas(certificateRef.current)
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297
      const pageHeight = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`walkinmyshoes-certificate-${certificateData.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleShareOnLinkedIn = () => {
    const text = `I just completed the WalkInMyShoes disability empathy training with a score of ${certificateData.score}/100 and earned the ${certificateData.badge} badge! Join me in building a more inclusive world.`
    const url = window.location.href
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-deep-navy p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold gradient-text">Impact Dashboard</h1>
          <button
            onClick={() => setCurrentScene('menu')}
            className="button-secondary"
          >
            ← Back to Menu
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Empathy Score Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-morphism p-8"
          >
            <h2 className="text-2xl font-bold text-center mb-6">Your Impact</h2>
            <EmpathyScoreRing 
              score={empathyScore.total} 
              onGenerateCertificate={handleGenerateCertificate}
            />
          </motion.div>
        </div>

        {/* Scenario Completion Stats */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-morphism p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Scenario Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(scenarioStats).map(([scenario, data]) => (
                <ScenarioCard key={scenario} scenario={scenario} data={data} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Assessment Comparison */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism p-6"
          >
            <h2 className="text-xl font-bold mb-4">Knowledge Growth</h2>
            {postAssessment.completed ? (
              <AssessmentComparison 
                preScore={preAssessment.score} 
                postScore={postAssessment.score} 
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <div>Complete post-assessment to see your knowledge growth</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Skills Radar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism p-6"
          >
            <h2 className="text-xl font-bold mb-4">Skills Breakdown</h2>
            <SkillsRadar breakdown={empathyScore.breakdown} />
          </motion.div>
        </div>

        {/* Real-World Impact */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism p-6"
          >
            <h2 className="text-xl font-bold mb-4">Real-World Context</h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-accent/10 rounded-lg">
                <div className="text-2xl font-bold gradient-text">12</div>
                <div className="text-sm text-gray-400">Barriers you experienced</div>
              </div>
              <div className="p-4 bg-cyan-accent/10 rounded-lg">
                <div className="text-2xl font-bold gradient-text">50+</div>
                <div className="text-sm text-gray-400">Daily barriers for people with disabilities</div>
              </div>
              <div className="p-4 bg-green-accent/10 rounded-lg">
                <div className="text-2xl font-bold gradient-text">$2.5K</div>
                <div className="text-sm text-gray-400">Compliance issues found (AR audit)</div>
              </div>
              <div className="text-center pt-4">
                <div className="text-xs text-gray-400">Supporting UN SDG 10</div>
                <div className="text-sm font-semibold">Reduced Inequalities</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Leaderboard 
              data={mockLeaderboard}
              userRank={4}
              userScore={Math.round(empathyScore.total)}
            />
          </motion.div>
        </div>

        {/* AI Guide Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-morphism p-6"
          >
            <h2 className="text-xl font-bold mb-4">AI Guide Insights</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Questions Asked:</span>
                <span>{aiGuideHistory.filter(m => m.role === 'user').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Topics Covered:</span>
                <span>{new Set(aiGuideHistory.map(m => m.sceneContext)).size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Session Time:</span>
                <span>{Math.floor(sessionMetrics.totalTime / 60000)}m</span>
              </div>
              <button className="w-full mt-4 button-secondary text-sm">
                Export Conversation
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificateModal && certificateData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div ref={certificateRef} className="p-8">
                {/* Certificate Content */}
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Certificate of Empathy Training
                  </h1>
                  <div className="text-xl text-gray-600 mb-6">
                    WalkInMyShoes - Immersive Disability Empathy Platform
                  </div>
                  
                  <div className="border-4 border-double border-purple-accent p-8 mb-6">
                    <div className="text-lg text-gray-700 mb-4">
                      This certifies that
                    </div>
                    <div className="text-2xl font-bold text-purple-accent mb-4">
                      {certificateData.userName}
                    </div>
                    <div className="text-lg text-gray-700 mb-4">
                      has successfully completed the disability empathy training
                    </div>
                    <div className="text-xl font-semibold text-gray-800 mb-2">
                      Empathy Score: {certificateData.score}/100
                    </div>
                    <div className="text-lg text-gray-600 mb-4">
                      {certificateData.badge}
                    </div>
                    <div className="text-gray-600">
                      Completed {certificateData.scenariosCompleted} scenario(s) on {certificateData.date}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Certificate ID: {certificateData.id}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Verify at: walkinmyshoes.com/verify/{certificateData.id}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 flex justify-between">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareOnLinkedIn}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={handleDownloadCertificate}
                    className="px-6 py-2 bg-purple-accent text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
