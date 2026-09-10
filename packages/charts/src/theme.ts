/**
 * 차트 색은 전부 CSS 변수 — 라이트/다크·아이덴티티를 자동으로 따른다.
 * 의미 색(success/warning/danger/info)은 "상태"를 그릴 때만, 카테고리는 chart-1..8을 순서대로.
 */
export type SeriesColor =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'accent'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'chart-6'
  | 'chart-7'
  | 'chart-8'

export function cssColor(c: SeriesColor): string {
  if (c === 'accent') return 'var(--se-accent)'
  if (c.startsWith('chart-')) return `var(--se-${c})`
  return `var(--se-status-${c})`
}

export const AXIS = {
  tick: { fontSize: 11, fill: 'var(--se-muted)' },
  line: { stroke: 'var(--se-line)' },
  grid: { stroke: 'var(--se-line)', strokeDasharray: '3 3' },
} as const

export interface Series {
  key: string
  label: string
  color: SeriesColor
}
