import { formatHex, oklch, wcagContrast, type Oklch } from 'culori'

export type Mode = 'light' | 'dark'

function hex(l: number, c: number, h: number): string {
  const color: Oklch = { mode: 'oklch', l, c, h }
  return formatHex(color)
}

/** 뉴트럴 편향 → hue와 채도. 액센트 방향 편향은 호출부에서 hue를 넘긴다 */
export function neutralParams(bias: 'cool' | 'warm' | 'neutral' | 'accent', accentHue: number) {
  switch (bias) {
    case 'cool':
      return { h: 240, c: 0.01 }
    case 'warm':
      return { h: 70, c: 0.01 }
    case 'accent':
      return { h: accentHue, c: 0.012 }
    default:
      return { h: 0, c: 0 }
  }
}

/**
 * 뉴트럴 스케일. 명도(L)는 브랜드 밴드에 고정되어 있고,
 * 아이덴티티는 hue/채도만 살짝 기울일 수 있다.
 */
export function neutralScale(mode: Mode, h: number, c: number) {
  const L =
    mode === 'light'
      ? { canvas: 0.978, surface: 1, surface2: 0.955, ink: 0.24, muted: 0.5, line: 0.915, lineStrong: 0.83 }
      : { canvas: 0.17, surface: 0.215, surface2: 0.255, ink: 0.93, muted: 0.68, line: 0.30, lineStrong: 0.38 }
  return {
    canvas: hex(L.canvas, c, h),
    surface: hex(L.surface, c * 0.4, h),
    'surface-2': hex(L.surface2, c, h),
    ink: hex(L.ink, c, h),
    muted: hex(L.muted, c, h),
    line: hex(L.line, c, h),
    'line-strong': hex(L.lineStrong, c, h),
  }
}

/**
 * 액센트 스케일. hue만 아이덴티티가 정하고 채도·명도는 밴드에 고정 —
 * 그래서 어떤 hue를 골라도 "SE 톤"으로 읽힌다.
 */
export function accentScale(mode: Mode, hue: number) {
  const C = 0.12
  if (mode === 'light') {
    return {
      accent: hex(0.5, C, hue),
      'accent-hover': hex(0.44, C, hue),
      'accent-active': hex(0.38, C, hue),
      'accent-soft': hex(0.955, 0.03, hue),
      'accent-fg': hex(0.44, C, hue),
      'on-accent': '#FFFFFF',
    }
  }
  return {
    accent: hex(0.74, 0.11, hue),
    'accent-hover': hex(0.79, 0.11, hue),
    'accent-active': hex(0.84, 0.1, hue),
    'accent-soft': hex(0.29, 0.045, hue),
    'accent-fg': hex(0.78, 0.11, hue),
    'on-accent': hex(0.18, 0.05, hue),
  }
}

export function chartPalette(mode: Mode, hue: number, kind: 'accent-sequential' | 'categorical') {
  const out: Record<string, string> = {}
  if (kind === 'accent-sequential') {
    const Ls = mode === 'light' ? [0.82, 0.72, 0.62, 0.52, 0.42, 0.33] : [0.45, 0.55, 0.65, 0.74, 0.82, 0.9]
    Ls.forEach((l, i) => (out[`chart-${i + 1}`] = hex(l, 0.1, hue)))
    return out
  }
  const l = mode === 'light' ? 0.58 : 0.74
  for (let i = 0; i < 8; i++) out[`chart-${i + 1}`] = hex(l, 0.12, (hue + i * 45) % 360)
  return out
}

export function contrast(a: string, b: string): number {
  return wcagContrast(a, b)
}

/** 디버그·아이덴티티 시트용: hex → oklch 문자열 */
export function describe(hexColor: string): string {
  const c = oklch(hexColor)
  if (!c) return hexColor
  return `oklch(${c.l.toFixed(2)} ${(c.c ?? 0).toFixed(3)} ${Math.round(c.h ?? 0)})`
}
