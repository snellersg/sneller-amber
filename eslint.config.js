import js from '@eslint/js'

export default [
  // Global ignores - these files/directories will never be linted
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      '.turbo/**',
      'dist/**',
      'build/**',
      '**/*.min.js',
      'coverage/**',
      '.git/**',
      'netlify/**'
    ],
  },
  
  // Only lint JavaScript files to avoid TypeScript parsing issues
  {
    files: ['src/**/*.{js,jsx}', '*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        module: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error'
    }
  }
]