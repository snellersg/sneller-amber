import { useEffect, useState } from 'react'

export interface NetworkState {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  effectiveType: string
  downlink: number
  rtt: number
  lastConnectedAt: number
  lastDisconnectedAt: number
}

type NetworkStateListener = (state: NetworkState) => void

class NetworkMonitor {
  private listeners: Set<NetworkStateListener> = new Set()
  private state: NetworkState = {
    isOnline: true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    lastConnectedAt: Date.now(),
    lastDisconnectedAt: 0,
  }

  private connectionCheckInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeState()
      this.setupListeners()
      this.startConnectionMonitoring()
    }
  }

  private initializeState() {
    this.state.isOnline = navigator.onLine

    // Get connection info if available (modern browsers)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        this.updateConnectionInfo(connection)
      }
    }
  }

  private setupListeners() {
    // Basic online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Network information API (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', () => {
          this.updateConnectionInfo(connection)
          this.notifyListeners()
        })
      }
    }

    // Page visibility changes (helps detect network issues when app returns)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // App became visible, check connection
        setTimeout(() => this.checkConnectionQuality(), 1000)
      }
    })
  }

  private handleOnline = () => {
    console.log('[NetworkMonitor] Network online detected')
    const wasOffline = !this.state.isOnline

    this.state.isOnline = true
    this.state.lastConnectedAt = Date.now()
    this.reconnectAttempts = 0

    if (wasOffline) {
      // Check connection quality when coming back online
      this.checkConnectionQuality()

      // Dispatch custom event for other components
      window.dispatchEvent(
        new CustomEvent('network-reconnected', {
          detail: {
            wasOfflineFor: Date.now() - this.state.lastDisconnectedAt,
            timestamp: Date.now(),
          },
        })
      )
    }

    this.notifyListeners()
  }

  private handleOffline = () => {
    console.log('[NetworkMonitor] Network offline detected')
    this.state.isOnline = false
    this.state.lastDisconnectedAt = Date.now()

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('network-disconnected', {
        detail: { timestamp: Date.now() },
      })
    )

    this.notifyListeners()
  }

  private updateConnectionInfo(connection: any) {
    this.state.connectionType = connection.type || 'unknown'
    this.state.effectiveType = connection.effectiveType || 'unknown'
    this.state.downlink = connection.downlink || 0
    this.state.rtt = connection.rtt || 0

    // Determine if it's a slow connection
    this.state.isSlowConnection = this.isConnectionSlow(connection)
  }

  private isConnectionSlow(connection: any): boolean {
    // Consider connection slow if:
    // 1. Effective type is 'slow-2g' or '2g'
    // 2. Downlink is less than 1.5 Mbps
    // 3. RTT is greater than 300ms
    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      (connection.downlink && connection.downlink < 1.5) ||
      (connection.rtt && connection.rtt > 300)
    )
  }

  private async checkConnectionQuality() {
    if (!navigator.onLine) {
      return
    }

    try {
      const start = Date.now()

      // Try a simple fetch to check actual connectivity
      const response = await fetch('/api/health-check', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const end = Date.now()
      const responseTime = end - start

      // Update connection quality based on response time
      const wasSlowBefore = this.state.isSlowConnection
      this.state.isSlowConnection = responseTime > 2000 // Consider slow if > 2 seconds

      if (wasSlowBefore !== this.state.isSlowConnection) {
        console.log(
          '[NetworkMonitor] Connection quality changed:',
          this.state.isSlowConnection ? 'slow' : 'fast',
          `(${responseTime}ms)`
        )
        this.notifyListeners()
      }
    } catch (error) {
      console.log('[NetworkMonitor] Connection quality check failed:', error)

      // If we can't reach our own API, there might be a network issue
      if (navigator.onLine) {
        this.state.isSlowConnection = true
        this.notifyListeners()

        // Try to reconnect if we appear online but can't reach API
        this.attemptReconnect()
      }
    }
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[NetworkMonitor] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(
      `[NetworkMonitor] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    )

    // Wait before attempting reconnect (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000)
    await new Promise(resolve => setTimeout(resolve, delay))

    // Check connection again
    this.checkConnectionQuality()
  }

  private startConnectionMonitoring() {
    // Check connection quality every 30 seconds when online
    this.connectionCheckInterval = setInterval(() => {
      if (this.state.isOnline && document.visibilityState === 'visible') {
        this.checkConnectionQuality()
      }
    }, 30000)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state })
      } catch (error) {
        console.error('[NetworkMonitor] Error calling listener:', error)
      }
    })
  }

  /**
   * Add a listener for network state changes
   */
  addListener(listener: NetworkStateListener) {
    this.listeners.add(listener)
    return () => this.removeListener(listener)
  }

  /**
   * Remove a listener
   */
  removeListener(listener: NetworkStateListener) {
    this.listeners.delete(listener)
  }

  /**
   * Get current network state
   */
  getState(): NetworkState {
    return { ...this.state }
  }

  /**
   * Check if network is available for requests
   */
  isNetworkAvailable(): boolean {
    return this.state.isOnline && !this.state.isSlowConnection
  }

  /**
   * Get network status description
   */
  getStatusDescription(): string {
    if (!this.state.isOnline) {
      return 'Offline'
    }

    if (this.state.isSlowConnection) {
      return 'Slow Connection'
    }

    return 'Online'
  }

  /**
   * Force a connection quality check
   */
  forceConnectionCheck() {
    this.checkConnectionQuality()
  }

  /**
   * Cleanup resources
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
      this.connectionCheckInterval = null
    }

    this.listeners.clear()
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor()

/**
 * React hook for monitoring network state
 */
export function useNetworkState() {
  const [networkState, setNetworkState] = useState<NetworkState>(networkMonitor.getState())

  useEffect(() => {
    const unsubscribe = networkMonitor.addListener(setNetworkState)

    // Set initial state
    setNetworkState(networkMonitor.getState())

    return unsubscribe
  }, [])

  return {
    ...networkState,
    isNetworkAvailable: networkMonitor.isNetworkAvailable(),
    statusDescription: networkMonitor.getStatusDescription(),
    forceCheck: networkMonitor.forceConnectionCheck,
  }
}

/**
 * Wait for network to be available
 */
export function waitForNetwork(timeout = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (networkMonitor.isNetworkAvailable()) {
      resolve()
      return
    }

    const timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error('Network timeout'))
    }, timeout)

    const checkNetwork = () => {
      if (networkMonitor.isNetworkAvailable()) {
        cleanup()
        resolve()
      }
    }

    const cleanup = () => {
      clearTimeout(timeoutId)
      window.removeEventListener('network-reconnected', checkNetwork)
    }

    window.addEventListener('network-reconnected', checkNetwork)

    // Force a network check
    networkMonitor.forceConnectionCheck()
  })
}
