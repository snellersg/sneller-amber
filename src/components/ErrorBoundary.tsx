'use client'

import React, { Component, ReactNode } from 'react'
import { connectionMonitor, isSupabaseHealthy } from '@/lib/supabase'
import { networkMonitor } from '@/lib/network-monitor'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
  isRetrying: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })

    // Analyze error type for better recovery
    this.analyzeAndReportError(error, errorInfo)
  }

  componentDidMount() {
    // Listen for network and connection recovery events
    window.addEventListener('network-reconnected', this.handleNetworkRecovery)
    window.addEventListener('supabase-connection-recovered', this.handleConnectionRecovery)
  }

  componentWillUnmount() {
    window.removeEventListener('network-reconnected', this.handleNetworkRecovery)
    window.removeEventListener('supabase-connection-recovered', this.handleConnectionRecovery)

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  private analyzeAndReportError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      networkOnline: navigator.onLine,
      connectionHealthy: isSupabaseHealthy(),
    }

    // Log detailed error for debugging
    console.error('[ErrorBoundary] Detailed error report:', errorDetails)

    // Check if this is a recoverable error
    if (this.isRecoverableError(error)) {
      console.log('[ErrorBoundary] Error appears recoverable, will attempt auto-retry')
      this.scheduleAutoRetry()
    }
  }

  private isRecoverableError = (error: Error): boolean => {
    const recoverablePatterns = [
      /network/i,
      /fetch/i,
      /timeout/i,
      /connection/i,
      /supabase/i,
      /auth/i,
      /session/i,
    ]

    return recoverablePatterns.some(
      pattern => pattern.test(error.message) || pattern.test(error.stack || '')
    )
  }

  private scheduleAutoRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.log('[ErrorBoundary] Max auto-retries reached')
      return
    }

    // Wait longer between retries (exponential backoff)
    const delay = Math.min(2000 * Math.pow(2, this.state.retryCount), 30000)

    console.log(
      `[ErrorBoundary] Auto-retry scheduled in ${delay}ms (attempt ${this.state.retryCount + 1}/${this.maxRetries})`
    )

    this.retryTimeout = setTimeout(() => {
      this.handleRetry(true)
    }, delay)
  }

  private handleNetworkRecovery = () => {
    console.log('[ErrorBoundary] Network recovered - attempting error recovery')
    if (this.state.hasError && networkMonitor.isNetworkAvailable()) {
      this.handleRetry(false)
    }
  }

  private handleConnectionRecovery = () => {
    console.log('[ErrorBoundary] Connection recovered - attempting error recovery')
    if (this.state.hasError && isSupabaseHealthy()) {
      this.handleRetry(false)
    }
  }

  private handleRetry = (isAutoRetry = false) => {
    if (this.state.isRetrying) {
      console.log('[ErrorBoundary] Retry already in progress')
      return
    }

    console.log(
      `[ErrorBoundary] ${isAutoRetry ? 'Auto-' : 'Manual '}retry attempt ${this.state.retryCount + 1}`
    )

    this.setState({
      isRetrying: true,
      retryCount: this.state.retryCount + 1,
    })

    // Clear timeout if this is a manual retry
    if (this.retryTimeout && !isAutoRetry) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }

    // Reset error state after a short delay to allow UI to update
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      })
    }, 500)
  }

  private handleReset = () => {
    console.log('[ErrorBoundary] Manual reset triggered')
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    })
  }

  private handleGoHome = () => {
    console.log('[ErrorBoundary] Navigating to home')
    // Force reload to clear any corrupt state
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const networkState = networkMonitor.getState()
      const connectionHealthy = isSupabaseHealthy()

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We encountered an unexpected error.
                {this.isRecoverableError(this.state.error!) &&
                  ' This appears to be a temporary issue.'}
              </p>

              {/* Error details for debugging */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 p-2 rounded overflow-auto max-h-32">
                    <p>
                      <strong>Message:</strong> {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <p>
                        <strong>Stack:</strong> {this.state.error.stack.slice(0, 300)}...
                      </p>
                    )}
                  </div>
                </details>
              )}

              {/* Status indicators */}
              <div className="mb-6 text-sm text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className={networkState.isOnline ? 'text-green-600' : 'text-red-600'}>
                    {networkState.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={connectionHealthy ? 'text-green-600' : 'text-red-600'}>
                    {connectionHealthy ? 'Healthy' : 'Unhealthy'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Retry attempts:</span>
                  <span>
                    {this.state.retryCount}/{this.maxRetries}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {this.state.isRetrying ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-600">Retrying...</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => this.handleRetry(false)}
                      disabled={this.state.retryCount >= this.maxRetries}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      {this.state.retryCount >= this.maxRetries
                        ? 'Max Retries Reached'
                        : 'Try Again'}
                    </button>

                    {this.state.retryCount >= this.maxRetries && (
                      <button
                        onClick={this.handleReset}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Reset and Try Again
                      </button>
                    )}

                    <button
                      onClick={this.handleGoHome}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Return to Home
                    </button>
                  </>
                )}
              </div>

              {/* Auto-retry notification */}
              {this.isRecoverableError(this.state.error!) &&
                this.state.retryCount < this.maxRetries && (
                  <div className="mt-4 text-xs text-blue-600 dark:text-blue-400">
                    {this.retryTimeout
                      ? 'Auto-retry scheduled...'
                      : 'Monitoring connection for auto-recovery'}
                  </div>
                )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
