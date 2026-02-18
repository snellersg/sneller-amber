import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  // Global cleanup after all tests
  console.log('🧹 Starting global test teardown...')

  // You could clean up test database, remove test files, etc.
  // Example: await cleanupTestDatabase()

  console.log('✅ Global teardown complete')
}

export default globalTeardown
