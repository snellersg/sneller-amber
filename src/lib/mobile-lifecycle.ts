import { useState, useEffect } from 'react'

/**
 * Mobile App Lifecycle Utility
 * Handles detection of app going to background/foreground on mobile devices
 */

type AppStateListener = (state: 'active' | 'inactive' | 'background') => void

class MobileAppLifecycle {
  private listeners: Set<AppStateListener> = new Set()
  private currentState: 'active' | 'inactive' | 'background' = 'active'
  private visibilityChangeTimer: NodeJS.Timeout | null = null
  private lastActiveTime = Date.now()

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupListeners()
    }
  }

  private setupListeners() {
    try {
      // Page visibility API for tab/app switching
      document.addEventListener('visibilitychange', () => {
        try {
          if (document.hidden) {
            this.setState('background')
            this.lastActiveTime = Date.now()
          } else {
            // Delay setting to active to avoid rapid state changes
            if (this.visibilityChangeTimer) {
              clearTimeout(this.visibilityChangeTimer)
            }

            this.visibilityChangeTimer = setTimeout(() => {
              try {
                const timeInBackground = Date.now() - this.lastActiveTime

                // If app was in background for more than 30 seconds, consider it a fresh return
                if (timeInBackground > 30000) {
                  console.log(
                    '[AppLifecycle] App returned from background after',
                    timeInBackground + 'ms'
                  )
                  this.setState('active', true)
                } else {
                  this.setState('active')
                }
              } catch (error) {
                console.error('[AppLifecycle] Error in visibility timeout:', error)
              }
            }, 100)
          }
        } catch (error) {
          console.error('[AppLifecycle] Error in visibility change handler:', error)
        }
      })
    } catch (error) {
      console.error('[AppLifecycle] Error setting up visibility listener:', error)
    }

    // Window focus/blur events for additional detection
    window.addEventListener('focus', () => {
      const timeInBackground = Date.now() - this.lastActiveTime
      if (timeInBackground > 10000) {
        // 10 seconds
        console.log('[AppLifecycle] Window focused after', timeInBackground + 'ms')
        this.setState('active', true)
      }
    })

    window.addEventListener('blur', () => {
      this.setState('inactive')
      this.lastActiveTime = Date.now()
    })

    // Page lifecycle API (modern browsers)
    if ('onbeforeunload' in window) {
      window.addEventListener('beforeunload', () => {
        this.setState('background')
      })
    }

    // PWA-specific events
    if ('serviceWorker' in navigator) {
      // Listen for service worker messages about app state
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'APP_STATE_CHANGE') {
          this.setState(event.data.state, event.data.fromBackground)
        }
      })
    }
  }

  private setState(newState: 'active' | 'inactive' | 'background', fromBackground = false) {
    if (this.currentState !== newState) {
      console.log(
        '[AppLifecycle] State change:',
        this.currentState,
        '->',
        newState,
        fromBackground ? '(from background)' : ''
      )
      this.currentState = newState

      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(newState)
        } catch (error) {
          console.error('[AppLifecycle] Error calling listener:', error)
        }
      })

      // Special handling for returning from background
      if (newState === 'active' && fromBackground) {
        this.handleReturnFromBackground()
      }
    }
  }

  private handleReturnFromBackground() {
    console.log('[AppLifecycle] Handling return from background')

    // Dispatch custom event for components to handle
    window.dispatchEvent(
      new CustomEvent('app-return-from-background', {
        detail: {
          timeInBackground: Date.now() - this.lastActiveTime,
          timestamp: Date.now(),
        },
      })
    )
  }

  /**
   * Add a listener for app state changes
   */
  addListener(listener: AppStateListener) {
    this.listeners.add(listener)
    return () => this.removeListener(listener)
  }

  /**
   * Remove a listener
   */
  removeListener(listener: AppStateListener) {
    this.listeners.delete(listener)
  }

  /**
   * Get current app state
   */
  getCurrentState() {
    return this.currentState
  }

  /**
   * Check if app is currently in foreground
   */
  isActive() {
    return this.currentState === 'active'
  }

  /**
   * Get time since last active (when app was in foreground)
   */
  getTimeSinceLastActive() {
    return Date.now() - this.lastActiveTime
  }

  /**
   * Manually trigger connection recovery check
   */
  triggerConnectionCheck() {
    console.log('[AppLifecycle] Manual connection check triggered')
    window.dispatchEvent(
      new CustomEvent('app-connection-check-requested', {
        detail: { timestamp: Date.now() },
      })
    )
  }
}

// Export singleton instance
export const appLifecycle = new MobileAppLifecycle()

/**
 * React hook for using app lifecycle
 */
export function useAppLifecycle() {
  const [appState, setAppState] = useState<'active' | 'inactive' | 'background'>('active')

  useEffect(() => {
    const unsubscribe = appLifecycle.addListener(setAppState)

    // Set initial state
    setAppState(appLifecycle.getCurrentState())

    return unsubscribe
  }, [])

  return {
    appState,
    isActive: appState === 'active',
    timeSinceLastActive: appLifecycle.getTimeSinceLastActive(),
    triggerConnectionCheck: appLifecycle.triggerConnectionCheck,
  }
}

// For non-React usage
export { MobileAppLifecycle }
