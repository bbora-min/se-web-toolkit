import { expect, test } from '@playwright/test'

/**
 * 화면별 기준 스크린샷 비교. 화면이 바뀌면 실패한다 — 의도한 변화면 CI 의 visual-baseline 워크플로로 기준을 다시 찍는다.
 * 시계를 고정해 "30분 전"·차트 시각 라벨이 매번 같게 만든다(목 데이터는 시드 난수).
 */
const SCREENS = [
  { name: 'releases', path: '/releases' },
  { name: 'releases-empty', path: '/releases?__state=empty' },
  { name: 'releases-error', path: '/releases?__state=error' },
  { name: 'new-release', path: '/releases/new' },
  { name: 'settings', path: '/settings' },
  { name: 'identity', path: '/__identity' },
]
const FIXED_NOW = new Date('2026-09-14T09:00:00+09:00')

for (const s of SCREENS) {
  test(s.name, async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW)
    await page.goto(s.path)
    await page.waitForLoadState('networkidle')
    if (s.path.includes('__state=error')) await expect(page.getByRole('button', { name: '다시 시도' }).first()).toBeVisible({ timeout: 3_000 })
    await page.waitForTimeout(700) // 숫자 카운트업(400ms)·전환이 끝난 뒤
    await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: true })
  })
}
