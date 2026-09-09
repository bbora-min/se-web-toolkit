import { describe, expect, it } from 'vitest'
import { createTheme, hueDistance, themeToCss, contrast, MIN_HUE_DISTANCE } from '../src'

const base = {
  id: 'job-monitor',
  name: 'Job Monitor',
  mark: { type: 'monogram', text: 'JM' },
  accent: { hue: 195 },
  signature: 'status-strip',
} as const

describe('createTheme', () => {
  it('모든 hue(0–360)에서 대비 규칙을 통과한다', () => {
    for (let hue = 0; hue < 360; hue += 5) {
      for (const neutralBias of ['cool', 'warm', 'neutral', 'accent'] as const) {
        expect(() => createTheme({ ...base, accent: { hue }, neutralBias })).not.toThrow()
      }
    }
  })

  it('버튼 라벨은 라이트/다크 모두 4.5:1 이상', () => {
    const t = createTheme(base)
    expect(contrast(t.light['on-accent']!, t.light.accent!)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(t.dark['on-accent']!, t.dark.accent!)).toBeGreaterThanOrEqual(4.5)
  })

  it('의미 색은 hue와 무관하게 동일하다', () => {
    const a = createTheme({ ...base, accent: { hue: 10 } })
    const b = createTheme({ ...base, accent: { hue: 250 } })
    expect(a.light['status-danger']).toBe(b.light['status-danger'])
    expect(a.dark['status-success']).toBe(b.dark['status-success'])
  })

  it('잘못된 아이덴티티는 읽을 수 있는 메시지로 실패한다', () => {
    expect(() => createTheme({ ...base, signature: 'confetti' } as never)).toThrow(/signature/)
  })

  it('CSS는 system / light / dark 세 상태를 모두 다룬다', () => {
    const css = themeToCss(createTheme(base))
    expect(css).toContain(':root {')
    expect(css).toContain(':root:not([data-theme="light"])')
    expect(css).toContain(':root[data-theme="dark"]')
    expect(css).toContain('[data-density="compact"]')
    expect(css).toMatch(/--se-accent: #[0-9a-f]{6}/)
  })
})

describe('hueDistance', () => {
  it('원형 거리', () => {
    expect(hueDistance(10, 350)).toBe(20)
    expect(hueDistance(0, 180)).toBe(180)
    expect(hueDistance(195, 35)).toBe(160)
  })
  it('형제 서비스 최소 거리', () => {
    expect(hueDistance(195, 220)).toBeLessThan(MIN_HUE_DISTANCE)
    expect(hueDistance(195, 150)).toBeGreaterThanOrEqual(MIN_HUE_DISTANCE)
  })
})
