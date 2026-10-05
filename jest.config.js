import nextJest from 'next/jest.js'

// next/jest loads next.config.js and handles TypeScript via SWC
const createJestConfig = nextJest({ dir: './' })

const config = {
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
}

export default createJestConfig(config)
