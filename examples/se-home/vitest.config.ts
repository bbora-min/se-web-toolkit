import { defineConfig } from 'vitest/config'

/** 단위 테스트만. e2e/ 는 Playwright(`pnpm e2e`)가 돌린다 */
export default defineConfig({
  test: { include: ['src/**/*.test.{ts,tsx}'], exclude: ['e2e/**', 'node_modules/**'], passWithNoTests: true },
})
