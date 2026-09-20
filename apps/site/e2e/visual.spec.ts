import { expect, test } from '@playwright/test'

const SCREENS = [
  { name: 'home', path: '/' },
  { name: 'archetypes', path: '/archetypes' },
  { name: 'start', path: '/start' },
  { name: 'how', path: '/how' },
]

for (const s of SCREENS) {
  test(s.name, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-14T09:00:00+09:00') })
    await page.goto(s.path)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: true })
  })
}
