#!/usr/bin/env node

/**
 * Test Plan Setup Script
 * Run this script to verify your testing infrastructure is working correctly
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Sneller Amber Test Plan Setup\n')

const runCommand = (command, description) => {
  console.log(`📋 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} - PASSED\n`)
    return true
  } catch (error) {
    console.log(`❌ ${description} - FAILED\n`)
    return false
  }
}

const checkFile = (filePath, description) => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} - EXISTS`)
    return true
  } else {
    console.log(`❌ ${description} - MISSING`)
    return false
  }
}

async function main() {
  console.log('🔍 Checking test infrastructure...\n')

  // Check required files
  const requiredFiles = [
    ['package.json', 'Package configuration'],
    ['jest.config.js', 'Jest configuration'],
    ['jest.setup.js', 'Jest setup file'],
    ['playwright.config.ts', 'Playwright configuration'],
    ['.prettierrc', 'Prettier configuration'],
    ['TEST_PLAN.md', 'Test plan documentation'],
  ]

  let filesOk = true
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(file, desc)) {
      filesOk = false
    }
  }

  if (!filesOk) {
    console.log('\n❌ Some required files are missing. Please ensure all files are created.')
    process.exit(1)
  }

  console.log('\n🧪 Running test suite verification...\n')

  let allPassed = true

  // Run each test category
  const tests = [
    ['npm run lint', 'Code linting'],
    ['npm run type-check', 'TypeScript type checking'],
    ['npm run test:unit', 'Unit tests'],
    ['npm run build', 'Production build'],
  ]

  for (const [command, description] of tests) {
    if (!runCommand(command, description)) {
      allPassed = false
    }
  }

  // Check if Playwright is set up
  console.log('🎭 Checking Playwright setup...')
  try {
    execSync('npx playwright --version', { stdio: 'pipe' })
    console.log('✅ Playwright is installed\n')
  } catch {
    console.log('⚠️  Playwright not fully set up. Run: npx playwright install\n')
  }

  console.log('📊 Test Plan Setup Summary')
  console.log('=' * 40)

  if (allPassed) {
    console.log('🎉 All tests passed! Your test infrastructure is working correctly.')
    console.log('\n📖 Next steps:')
    console.log('   • Review TEST_PLAN.md for comprehensive testing guide')
    console.log('   • Check TEST_CHECKLIST.md for implementation steps')
    console.log('   • Customize test cases for your specific needs')
    console.log('   • Set up CI/CD environment variables')
    console.log('\n🚀 Quick commands:')
    console.log('   npm run test:all          # Run all quality checks')
    console.log('   npm run test:e2e          # Run end-to-end tests')
    console.log('   npm run test:mobile       # Run mobile-specific tests')
  } else {
    console.log('⚠️  Some tests failed. Please check the output above and fix any issues.')
    console.log('\n🔧 Troubleshooting:')
    console.log('   • Ensure all dependencies are installed: npm install')
    console.log('   • Check environment variables are set correctly')
    console.log('   • Review error messages for specific issues')
    console.log('   • Run npm run test:debug for detailed error information')
    process.exit(1)
  }
}

main().catch(console.error)
