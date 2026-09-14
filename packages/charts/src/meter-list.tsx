import * as React from 'react'
import { cn } from '@se/ui'
import { cssColor, type SeriesColor } from './theme'

export interface MeterItem {
  label: React.ReactNode
  /** 0–100 */
  value: number
  /** 값 옆 텍스트 (기본: `${value}%`) */
  display?: React.ReactNode
  /** 보조 텍스트 — "12 runs" */
  sub?: React.ReactNode
  /** 심각도(accent·warning·danger…)나 카테고리(chart-1..8 — 같은 카테고리의 배지·차트 색과 맞춘다) */
  tone?: SeriesColor
  onClick?: () => void
}

const TONE: Record<Exclude<SeriesColor, `chart-${number}`>, { text?: string; track: string; bar: string }> = {
  accent: { track: 'bg-accent-soft', bar: 'bg-accent' },
  success: { track: 'bg-success-soft', bar: 'bg-success' },
  warning: { text: 'text-warning', track: 'bg-warning-soft', bar: 'bg-warning' },
  danger: { text: 'text-danger', track: 'bg-danger-soft', bar: 'bg-danger' },
  info: { track: 'bg-info-soft', bar: 'bg-info' },
  neutral: { text: 'text-muted', track: 'bg-surface-2', bar: 'bg-line-strong' },
}
// 카테고리 색(chart-N)은 chart-card·tooltip 과 같이 CSS 변수를 인라인으로 — 소비자 Tailwind 빌드에 의존하지 않는다
const isChart = (t: SeriesColor): t is Extract<SeriesColor, `chart-${number}`> => t.startsWith('chart-')

/**
 * 미터 목록 — 순위·비율 비교. 막대 차트보다 라벨을 읽기 쉽다.
 * 채움은 심각도(accent → warning → danger), 트랙은 같은 계열의 옅은 단계.
 * 항목 `tone` 에 `chart-1..8` 을 주면 카테고리 색 — 같은 카테고리의 배지·차트와 맞춘다.
 */
export function MeterList({ items, className }: { items: MeterItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {items.map((it, i) => {
        const tone = it.tone ?? 'accent'
        const t = isChart(tone) ? { text: undefined, track: undefined, bar: undefined } : TONE[tone]
        const chart = isChart(tone) ? cssColor(tone) : undefined
        const Comp = it.onClick ? 'button' : 'div'
        return (
          <li key={i} className="border-b border-line last:border-0">
            <Comp
              type={it.onClick ? 'button' : undefined}
              onClick={it.onClick}
              className={cn('grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-2.5 text-left', it.onClick && 'rounded-md transition-colors hover:bg-surface-2/60')}
            >
              <span className="truncate text-sm text-ink">{it.label}</span>
              <span className="flex items-baseline gap-2 tnum text-sm">
                <span className={cn('font-medium', t.text)}>{it.display ?? `${it.value}%`}</span>
                {it.sub ? <span className="text-xs text-muted">{it.sub}</span> : null}
              </span>
              <span
                className={cn('col-span-2 h-1.5 overflow-hidden rounded-full', t.track)}
                style={chart ? { background: `color-mix(in oklch, ${chart} 20%, transparent)` } : undefined}
              >
                <span
                  className={cn('block h-full rounded-full', t.bar)}
                  style={{ width: `${Math.max(0, Math.min(100, it.value))}%`, background: chart }}
                />
              </span>
            </Comp>
          </li>
        )
      })}
    </ul>
  )
}
