import se from '@se/eslint-plugin'

export default [
  { ignores: ['dist/**', 'public/**', '*.config.*', 'e2e/**'] },
  { files: ['src/**/*.{ts,tsx}'], ...se.configs.recommended },
]
