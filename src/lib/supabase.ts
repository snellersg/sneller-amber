import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For build time, provide fallback values to prevent prerender errors
const isBuilding = typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.NETLIFY

if (!supabaseUrl || !supabaseAnonKey) {
  if (isBuilding) {
    console.warn('Supabase environment variables missing during build - this should not happen in production builds')
  } else {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }
}

// Create a more resilient supabase client with better connection handling
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Automatically refresh tokens earlier to prevent expired token issues
      autoRefreshToken: true,
      // Persist session in localStorage for mobile app lifecycle
      persistSession: true,
      // Detect session changes more reliably
      detectSessionInUrl: true,
      // Storage configuration for better mobile support
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          try {
            return window.localStorage.getItem(key)
          } catch {
            return null
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value)
          } catch {
            // Silently fail if localStorage is not available
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key)
          } catch {
            // Silently fail if localStorage is not available
          }
        }
      } : undefined
    },
    global: {
      // Add retry logic for failed requests
      fetch: async (url: URL | RequestInfo, options: any = {}) => {
        let lastError: Error | null = null;
        
        // Retry logic for network requests
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // If we get a successful response, return it
            if (response.ok || response.status < 500) {
              return response;
            }
            
            // Server error, try again
            throw new Error(`Server error: ${response.status}`);
            
          } catch (error) {
            lastError = error as Error;
            console.log(`[Supabase] Request attempt ${attempt} failed:`, error);
            
            // Don't retry on abort (timeout) or auth errors
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                console.log(`[Supabase] Request timed out on attempt ${attempt}`);
              }
              
              // Don't retry auth errors (4xx status)
              if (error.message.includes('4')) {
                throw error;
              }
            }
            
            // Wait before retry (exponential backoff)
            if (attempt < 3) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              console.log(`[Supabase] Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        // If all retries failed, throw the last error
        throw lastError || new Error('All request attempts failed');
      }
    }
  }
)

// Connection health monitoring
class SupabaseConnectionMonitor {
  private isHealthy = true;
  private lastHealthCheck = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.startHealthMonitoring();
      this.setupNetworkListeners();
    }
  }
  
  private startHealthMonitoring() {
    // Check connection health every 5 minutes when app is active
    this.healthCheckInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkHealth();
      }
    }, 5 * 60 * 1000);
  }
  
  private setupNetworkListeners() {
    // Listen for network state changes
    window.addEventListener('online', () => {
      console.log('[Supabase] Network back online, checking connection...');
      this.checkHealth();
    });
    
    window.addEventListener('offline', () => {
      console.log('[Supabase] Network offline detected');
      this.isHealthy = false;
    });
    
    // Listen for app lifecycle events
    window.addEventListener('app-return-from-background', () => {
      console.log('[Supabase] App returned from background, checking connection...');
      this.checkHealth();
    });
    
    window.addEventListener('app-connection-check-requested', () => {
      this.checkHealth();
    });
  }
  
  private async checkHealth() {
    try {
      console.log('[Supabase] Checking connection health...');
      
      // Simple health check - try to get session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('[Supabase] Health check failed:', error.message);
        this.isHealthy = false;
        
        // Try to recover from common auth errors
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found')) {
          console.log('[Supabase] Attempting to recover from invalid refresh token...');
          await this.recoverFromAuthError();
        }
      } else {
        const wasUnhealthy = !this.isHealthy;
        this.isHealthy = true;
        this.lastHealthCheck = Date.now();
        
        if (wasUnhealthy) {
          console.log('[Supabase] Connection recovered');
          window.dispatchEvent(new CustomEvent('supabase-connection-recovered'));
        }
      }
    } catch (error) {
      console.log('[Supabase] Health check error:', error);
      this.isHealthy = false;
    }
  }
  
  private async recoverFromAuthError() {
    try {
      // Clear local session and attempt to get a fresh session
      await supabase.auth.signOut({ scope: 'local' });
      
      // Dispatch event for auth context to handle
      window.dispatchEvent(new CustomEvent('supabase-auth-recovery-needed', {
        detail: { timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('[Supabase] Auth recovery failed:', error);
    }
  }
  
  public getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
      timeSinceLastCheck: Date.now() - this.lastHealthCheck
    };
  }
  
  public forceHealthCheck() {
    this.checkHealth();
  }
  
  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export the connection monitor instance
export const connectionMonitor = new SupabaseConnectionMonitor();

// Helper function to check if we can make requests
export function isSupabaseHealthy(): boolean {
  return connectionMonitor.getHealthStatus().isHealthy && navigator.onLine;
}

// Helper function to wait for connection to be healthy
export function waitForHealthyConnection(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isSupabaseHealthy()) {
      resolve();
      return;
    }
    
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Connection health timeout'));
    }, timeout);
    
    const checkHealth = () => {
      if (isSupabaseHealthy()) {
        cleanup();
        resolve();
      }
    };
    
    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('supabase-connection-recovered', checkHealth);
      window.removeEventListener('online', checkHealth);
    };
    
    window.addEventListener('supabase-connection-recovered', checkHealth);
    window.addEventListener('online', checkHealth);
    
    // Force a health check
    connectionMonitor.forceHealthCheck();
  });
}
