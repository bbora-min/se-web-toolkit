import { expect, test } from '@playwright/test'

/** 화면 목록 — /se:page 가 새 화면을 만들면 여기에 추가한다. /se:review 가 이 목록을 찍는다 */
const SCREENS = [
  { name: 'items', path: '/items' },
  { name: 'items-empty', path: '/items?__state=empty' },
  { name: 'items-error', path: '/items?__state=error' },
]

for (const s of SCREENS) {
  test(s.name, async ({ page }, info) => {
    await page.goto(s.path)
    await page.waitForLoadState('networkidle')
    // 에러 상태는 "다시 시도" 버튼이 보여야 한다 — 없으면 로딩 화면을 에러로 찍는 것이니 실패시킨다
    if (s.path.includes('__state=error')) await expect(page.getByRole('button', { name: '다시 시도' }).first()).toBeVisible({ timeout: 3_000 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: info.outputPath(`${s.name}.png`), fullPage: true })
  })
}
