import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

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
      'netlify/**',
    ],
  },

  // JavaScript files
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^(React|[A-Z][a-zA-Z]*Component)$',
          argsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^(React|[A-Z][a-zA-Z]*Component)$',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',

      // Use base ESLint rules for general patterns
      'prefer-const': 'warn',
      'no-var': 'error',

      // Disable base ESLint rules that are covered by TypeScript equivalents
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
]
