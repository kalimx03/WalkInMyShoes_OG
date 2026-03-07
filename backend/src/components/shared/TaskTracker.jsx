import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TaskTracker({ tasks, currentTask, timeRemaining }) {
  const getTaskStatus = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    return task ? task.completed : 'pending'
  }

  const getTaskProgress = () => {
    const completed = tasks.filter(t => t.completed).length
    const total = tasks.length
    return (completed / total) * 100
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="glass-morphism p-4 min-w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold gradient-text">Mission Progress</h3>
          <div className="text-sm text-gray-400">
            {Math.round(getTaskProgress())}% Complete
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                task.completed 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : currentTask === task.id
                  ? 'bg-purple-accent/20 border border-purple-accent/30'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                task.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {task.completed ? '✓' : getTaskStatus(task.id) === 'pending' ? '○' : '◐'}
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-white mb-1">{task.name}</div>
                <div className="text-xs text-gray-400">{task.description}</div>
                
                {task.completed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-green-400"
                  >
                    ✓ Completed
                  </motion.div>
                )}
                
                {currentTask === task.id && !task.completed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs text-cyan-accent"
                  >
                    In Progress...
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {timeRemaining && (
          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Time Remaining</span>
              <span className={`font-mono text-lg ${
                timeRemaining < 60 ? 'text-red-400' : 
                timeRemaining < 180 ? 'text-yellow-400' : 
                'text-green-400'
              }`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            {timeRemaining < 60 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-xs text-red-400 mt-2"
              >
                ⚠️ Time running low!
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
