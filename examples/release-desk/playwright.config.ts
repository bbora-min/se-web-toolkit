import { defineConfig } from '@playwright/test'

/** 시각 회귀(기준 스크린샷 비교). 기준은 CI 러너에서 찍는다 — Actions › visual-baseline. 로컬 실행은 pnpm e2e:visual */
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5175' },
  webServer: { command: 'pnpm dev', url: 'http://localhost:5175', reuseExistingServer: true },
  // 이름에 플랫폼 접미사를 붙이지 않는다 — 기준은 linux(CI 러너) 하나만 둔다
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}-{projectName}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  projects: [
    { name: 'light-1280', use: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' } },
    { name: 'dark-1280', use: { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' } },
    { name: 'light-1024', use: { viewport: { width: 1024, height: 900 }, colorScheme: 'light' } },
  ],
})
