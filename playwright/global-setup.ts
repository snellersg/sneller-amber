import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Global setup before all tests
  console.log('🚀 Starting global test setup...')

  // You could set up test database, seed data, etc.
  // Example: await setupTestDatabase()

  console.log('✅ Global setup complete')
}

export default globalSetup
