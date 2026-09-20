import { expect, test } from '@playwright/test'

/**
 * 화면별 기준 스크린샷 비교. 화면이 바뀌면 실패한다 — 의도한 변화면 CI 의 visual-baseline 워크플로로 기준을 다시 찍는다.
 * 시계를 고정해 "30분 전"·리본의 "지금" 선이 매번 같게 만든다(목 데이터는 지금 기준 상대 시각).
 */
const SCREENS = [
  { name: 'home', path: '/' },
  { name: 'home-empty', path: '/?__state=empty' },
  { name: 'home-error', path: '/?__state=error' },
  { name: 'services', path: '/services' },
  { name: 'identity', path: '/__identity' },
]
const FIXED_NOW = new Date('2026-09-20T11:00:00+09:00')

for (const s of SCREENS) {
  test(s.name, async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW)
    await page.goto(s.path)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => document.querySelectorAll('.animate-pulse').length === 0, undefined, { timeout: 20_000 })
    if (s.path.includes('__state=error')) await expect(page.getByRole('button', { name: '다시 시도' }).first()).toBeVisible({ timeout: 3_000 })
    await page.waitForTimeout(300) // 웹폰트 스왑·리본 렌더가 끝난 뒤 (카운트업 애니메이션은 없다)
    await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: true, timeout: 15_000 })
  })
}
