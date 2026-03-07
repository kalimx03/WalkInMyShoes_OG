import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIGuide } from '../../hooks/useAIGuide'
import useAppStore from '../../store/appStore'

// Message component
function Message({ message, isUser }) {
  const [showCopyButton, setShowCopyButton] = useState(false)
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }
  
  const copyMessage = () => {
    navigator.clipboard.writeText(message.content)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`relative px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-purple-accent to-cyan-accent text-white' 
            : 'glass-morphism text-white'
        }`}>
          {!isUser && (
            <div className="absolute -left-2 top-3 w-6 h-6 bg-glass-white backdrop-blur-xl border border-glass-border rounded-full flex items-center justify-center">
              <span className="text-xs">🤖</span>
            </div>
          )}
          
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </div>
            
            {showCopyButton && (
              <button
                onClick={copyMessage}
                className="text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                📋
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="glass-morphism px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Quick suggestion chips
function QuickSuggestions({ suggestions, onSuggestionClick }) {
  return (
    <div className="flex flex-wrap gap-2 p-3 border-t border-glass-border">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 text-xs glass-morphism rounded-full hover:bg-white/20 transition-colors text-left"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

export default function AIGuidePanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const { 
    currentScene, 
    scenarioData, 
    aiGuideHistory, 
    addAIMessage 
  } = useAppStore()
  
  const { sendMessage, isLoading } = useAIGuide()
  
  // Scene-specific suggestions
  const getSceneSuggestions = () => {
    switch (currentScene) {
      case 'visual':
        return [
          "Why can't I read the sign?",
          "What is WCAG contrast?",
          "How do screen readers work?",
          "Tell me about macular degeneration"
        ]
      case 'hearing':
        return [
          "Why are captions important?",
          "How many people have hearing loss?",
          "What are hearing loops?",
          "What is tinnitus?"
        ]
      case 'motor':
        return [
          "What is ADA?",
          "What's the minimum door width?",
          "How steep can a ramp be?",
          "What is turning radius?"
        ]
      case 'ar':
        return [
          "How does object detection work?",
          "What are ADA requirements?",
          "How accurate is this scanner?",
          "What makes a space accessible?"
        ]
      default:
        return [
          "How do I get started?",
          "What scenarios are available?",
          "How is empathy scored?",
          "Can I use this on mobile?"
        ]
    }
  }
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiGuideHistory])
  
  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])
  
  const handleSendMessage = async (content) => {
    if (!content.trim()) return
    
    const userMessage = {
      role: 'user',
      content: content.trim()
    }
    
    addAIMessage(userMessage)
    setInputValue('')
    setIsTyping(true)
    
    try {
      const response = await sendMessage(content, currentScene, scenarioData)
      
      const aiMessage = {
        role: 'assistant',
        content: response
      }
      
      addAIMessage(aiMessage)
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }
      addAIMessage(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }
  
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion)
  }
  
  const clearHistory = () => {
    useAppStore.getState().clearAIHistory()
  }
  
  const exportConversation = () => {
    const conversation = aiGuideHistory.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI Guide'}: ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([conversation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `walkinmyshoes-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed state - floating button */}
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(true)}
          className="w-20 h-20 bg-gradient-to-r from-purple-accent to-cyan-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-accent/50 transition-all duration-300"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs font-semibold">AI Guide</div>
          </div>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-accent to-cyan-accent animate-ping opacity-75" />
        </motion.button>
      )}
      
      {/* Expanded state - chat panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-96 h-[32rem] glass-morphism rounded-2xl shadow-2xl flex flex-col border border-purple-500/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-accent to-cyan-accent rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold">AI Guide</h3>
                  <div className="text-xs text-gray-400">
                    {currentScene === 'visual' && 'Visual Impairment Expert'}
                    {currentScene === 'hearing' && 'Hearing Loss Expert'}
                    {currentScene === 'motor' && 'Mobility Expert'}
                    {currentScene === 'ar' && 'Accessibility Auditor'}
                    {currentScene === 'dashboard' && 'Empathy Coach'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  title="Clear history"
                >
                  🗑️
                </button>
                <button
                  onClick={exportConversation}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  title="Export conversation"
                >
                  📥
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {aiGuideHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm">Hi! I'm your AI accessibility guide.</div>
                  <div className="text-xs mt-1">Ask me anything about the current scenario.</div>
                </div>
              ) : (
                <>
                  {aiGuideHistory.map((message, index) => (
                    <Message
                      key={message.id || index}
                      message={message}
                      isUser={message.role === 'user'}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick suggestions */}
            {aiGuideHistory.length === 0 && (
              <QuickSuggestions
                suggestions={getSceneSuggestions()}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
            
            {/* Input area */}
            <div className="p-4 border-t border-glass-border">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-glass-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-accent transition-colors"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-purple-accent to-cyan-accent rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
