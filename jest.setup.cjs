// jest.setup.cjs
require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      route: '/',
    }
  },
  useParams() {
    return {}
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(),
          single: jest.fn(),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
  waitForHealthyConnection: jest.fn(() => Promise.resolve()),
  isSupabaseHealthy: jest.fn(() => true),
}))

// Mock network monitor
jest.mock('@/lib/network-monitor', () => ({
  networkMonitor: {
    isNetworkAvailable: jest.fn(() => true),
    getConnectionQuality: jest.fn(() => 'good'),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
  useNetworkState: jest.fn(() => true),
  waitForNetwork: jest.fn(() => Promise.resolve()),
}))

// Mock mobile lifecycle
jest.mock('@/lib/mobile-lifecycle', () => ({
  appLifecycle: {
    isActive: jest.fn(() => true),
    getCurrentState: jest.fn(() => 'active'),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
  useAppLifecycle: jest.fn(() => ({
    appState: 'active',
    isActive: true,
  })),
}))

// Mock window objects for browser APIs (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  }))
}

// Increase timeout for async operations
jest.setTimeout(30000)

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
    created_at: new Date().toISOString(),
  }),
  createMockAdmin: () => ({
    id: 'admin-user-id',
    email: 'admin@example.com',
    user_metadata: { full_name: 'Admin User' },
    created_at: new Date().toISOString(),
    role: 'admin',
  }),
  mockSupabaseResponse: (data, error = null) => ({
    data,
    error,
  }),
}

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})
