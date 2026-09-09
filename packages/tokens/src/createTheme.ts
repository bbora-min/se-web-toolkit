import { brand } from './brand'
import { accentScale, chartPalette, contrast, neutralParams, neutralScale, type Mode } from './color'
import { DISPLAY_FONTS, parseIdentity, type Identity, type IdentityInput } from './identity'

export interface Theme {
  identity: Identity
  /** 테마별(라이트/다크) 색 토큰. 키는 CSS 변수 이름에서 `--se-`를 뺀 것 */
  light: Record<string, string>
  dark: Record<string, string>
  /** 테마와 무관한 브랜드 코어 토큰 */
  static: Record<string, string>
  /** 밀도별 치수 토큰 */
  density: { compact: Record<string, string>; comfortable: Record<string, string> }
}

/** 최소 대비 규칙. 하나라도 깨지면 createTheme이 던진다 — 빌드가 실패해야 한다 */
const CONTRAST_RULES: Array<[fg: string, bg: string, min: number, why: string]> = [
  ['ink', 'canvas', 7, '본문 텍스트'],
  ['ink', 'surface', 7, '카드 위 텍스트'],
  ['muted', 'canvas', 4.5, '보조 텍스트'],
  ['muted', 'surface', 4.5, '카드 위 보조 텍스트'],
  ['accent-fg', 'canvas', 4.5, '액센트 색 텍스트·링크'],
  ['accent-fg', 'surface', 4.5, '카드 위 액센트 텍스트'],
  ['on-accent', 'accent', 4.5, '버튼 라벨'],
  ['line-strong', 'canvas', 1.3, '강조 테두리'],
]

function colorsFor(mode: Mode, id: Identity): Record<string, string> {
  const n = neutralParams(id.neutralBias, id.accent.hue)
  const i = mode === 'light' ? 0 : 1
  const status: Record<string, string> = {}
  for (const [k, v] of Object.entries(brand.status)) {
    status[`status-${k}`] = v.fg[i]
    status[`status-${k}-soft`] = v.soft[i]
  }
  const neutral = neutralScale(mode, n.h, n.c)
  status['status-neutral'] = neutral.muted
  status['status-neutral-soft'] = neutral['surface-2']
  return {
    ...neutral,
    ...accentScale(mode, id.accent.hue),
    ...status,
    ...chartPalette(mode, id.accent.hue, id.chart),
  }
}

function checkContrast(mode: Mode, c: Record<string, string>) {
  const failures: string[] = []
  for (const [fg, bg, min, why] of CONTRAST_RULES) {
    const ratio = contrast(c[fg]!, c[bg]!)
    if (ratio < min) failures.push(`  ${mode}: ${why} (${fg} on ${bg}) = ${ratio.toFixed(2)} < ${min}`)
  }
  if (failures.length) throw new Error(`대비 검증 실패:\n${failures.join('\n')}`)
}

export function createTheme(input: IdentityInput): Theme {
  const identity = parseIdentity(input)
  const light = colorsFor('light', identity)
  const dark = colorsFor('dark', identity)
  checkContrast('light', light)
  checkContrast('dark', dark)

  const px = (n: number) => `${n}px`
  const staticTokens: Record<string, string> = {
    'font-sans': brand.font.sans,
    'font-mono': brand.font.mono,
    'font-display': DISPLAY_FONTS[identity.displayFont],
    ...Object.fromEntries(Object.entries(brand.text).map(([k, v]) => [`text-${k}`, px(v)])),
    ...Object.fromEntries(Object.entries(brand.leading).map(([k, v]) => [`leading-${k}`, String(v)])),
    ...Object.fromEntries(Object.entries(brand.radius).map(([k, v]) => [`radius-${k}`, px(v)])),
    'shadow-xs': brand.shadow.xs,
    'shadow-raised': brand.shadow.raised,
    'shadow-overlay': brand.shadow.overlay,
    'duration-fast': brand.motion.fast,
    'duration-normal': brand.motion.normal,
    ease: brand.motion.ease,
    'accent-hue': String(identity.accent.hue),
  }
  const densityTokens = (d: 'compact' | 'comfortable') => ({
    'control-h': px(brand.density[d].control),
    'row-h': px(brand.density[d].row),
    gap: px(brand.density[d].gap),
    pad: px(brand.density[d].pad),
  })

  return {
    identity,
    light,
    dark,
    static: staticTokens,
    density: { compact: densityTokens('compact'), comfortable: densityTokens('comfortable') },
  }
}
