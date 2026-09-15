import { describe, expect, it } from 'vitest'
import { currentTag, rewriteRefs, todosBetween } from '../bin/se-upgrade.mjs'

const pkg = () => ({ dependencies: { '@se/ui': 'github:bbora-min/se-web-toolkit#path:packages/ui', react: '^19' }, devDependencies: { '@se/eslint-plugin': 'github:bbora-min/se-web-toolkit#v0.7.0&path:packages/eslint-plugin' } })

describe('se-upgrade', () => {
  it('현재 태그를 읽는다 (main 추적·혼합 포함)', () => {
    expect(currentTag(pkg())).toMatch(/^혼합/)
    expect(currentTag({ dependencies: { '@se/ui': 'github:bbora-min/se-web-toolkit#v0.8.0&path:packages/ui' } })).toBe('v0.8.0')
    expect(currentTag({ dependencies: { '@se/ui': 'github:bbora-min/se-web-toolkit#path:packages/ui' } })).toBe('main')
  })
  it('참조를 태그로 바꾼다', () => {
    const p = pkg(); const n = rewriteRefs(p, 'v0.8.0')
    expect(n).toBe(2)
    expect(p.dependencies['@se/ui']).toBe('github:bbora-min/se-web-toolkit#v0.8.0&path:packages/ui')
    expect(p.devDependencies['@se/eslint-plugin']).toBe('github:bbora-min/se-web-toolkit#v0.8.0&path:packages/eslint-plugin')
    expect(p.dependencies.react).toBe('^19')
  })
  it('CHANGELOG 의 (from, to] 구간 "앱에서 할 일" 만 고른다', () => {
    const cl = `# CHANGELOG\n\n## 0.9.0 — 2026-10-01\n\n**바뀐 것**\n- x\n\n**앱에서 할 일**\n- Button size prop 이름 변경\n\n## 0.8.0 — 2026-09-14\n\n**앱에서 할 일**\n- 없음\n\n## 0.7.0 — 2026-09-14\n\n**앱에서 할 일**\n- credit prop 을 쓰세요\n`
    expect(todosBetween(cl, 'v0.7.0', 'v0.9.0').map((t) => t.ver)).toEqual(['v0.9.0'])
    expect(todosBetween(cl, 'main', 'v0.9.0').map((t) => t.ver)).toEqual(['v0.9.0', 'v0.7.0'])
    expect(todosBetween(cl, 'v0.8.0', 'v0.8.0')).toEqual([])
  })
})
