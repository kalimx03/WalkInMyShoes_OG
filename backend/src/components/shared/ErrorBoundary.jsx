import React from 'react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-deep-navy to-black flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            {/* Error Card */}
            <div className="glass-morphism p-8 rounded-2xl border border-red-500/20">
              {/* Error Icon */}
              <div className="text-6xl mb-6 text-center">⚠️</div>

              {/* Error Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-red-400">
                Oops! Something Went Wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-400 text-center mb-6 leading-relaxed">
                We encountered an unexpected error. Our team has been notified and we're working to fix it.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
                >
                  <div className="text-xs text-red-400 font-mono">
                    <div className="font-bold mb-2">Error:</div>
                    <div className="mb-2 break-words">{this.state.error.toString()}</div>
                    {this.state.errorInfo && (
                      <div>
                        <div className="font-bold mt-2 mb-1">Stack Trace:</div>
                        <div className="text-xs opacity-75 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReset}
                  className="button-primary text-lg px-8 py-3"
                >
                  Try Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/'}
                  className="button-secondary text-lg px-8 py-3"
                >
                  Go to Home
                </motion.button>
              </div>

              {/* Error Count Indicator */}
              {this.state.errorCount > 2 && (
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
                  <p className="text-sm text-yellow-400">
                    Multiple errors detected ({this.state.errorCount}). 
                    <br />
                    <button
                      onClick={() => window.location.reload()}
                      className="text-blue-400 hover:text-blue-300 underline mt-2"
                    >
                      Try refreshing the page
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Help Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>If this problem persists, please contact support or refresh the page.</p>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
