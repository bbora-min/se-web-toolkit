import { test } from '@playwright/test'

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
    await page.waitForTimeout(500)
    await page.screenshot({ path: info.outputPath(`${s.name}.png`), fullPage: true })
  })
}
