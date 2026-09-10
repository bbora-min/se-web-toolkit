import { defineConfig } from '@playwright/test'

/** /se:review 가 쓰는 스크린샷 설정. 라이트·다크 × 1440·1024 */
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:5170' },
  webServer: { command: 'pnpm dev', url: 'http://localhost:5170', reuseExistingServer: true },
  projects: [
    { name: 'light-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'light' } },
    { name: 'dark-1440', use: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
    { name: 'light-1024', use: { viewport: { width: 1024, height: 900 }, colorScheme: 'light' } },
  ],
})
