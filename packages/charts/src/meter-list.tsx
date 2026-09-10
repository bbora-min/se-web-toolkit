import * as React from 'react'
import { cn } from '@se/ui'

export interface MeterItem {
  label: React.ReactNode
  /** 0–100 */
  value: number
  /** 값 옆 텍스트 (기본: `${value}%`) */
  display?: React.ReactNode
  /** 보조 텍스트 — "12 runs" */
  sub?: React.ReactNode
  tone?: 'accent' | 'success' | 'warning' | 'danger'
  onClick?: () => void
}

/**
 * 미터 목록 — 순위·비율 비교. 막대 차트보다 라벨을 읽기 쉽다.
 * 채움은 심각도(accent → warning → danger), 트랙은 같은 계열의 옅은 단계.
 */
export function MeterList({ items, className }: { items: MeterItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {items.map((it, i) => {
        const tone = it.tone ?? 'accent'
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
                <span className={cn('font-medium', tone === 'danger' && 'text-danger', tone === 'warning' && 'text-warning')}>{it.display ?? `${it.value}%`}</span>
                {it.sub ? <span className="text-xs text-muted">{it.sub}</span> : null}
              </span>
              <span className={cn('col-span-2 h-1.5 overflow-hidden rounded-full', tone === 'accent' && 'bg-accent-soft', tone === 'success' && 'bg-success-soft', tone === 'warning' && 'bg-warning-soft', tone === 'danger' && 'bg-danger-soft')}>
                <span
                  className={cn('block h-full rounded-full', tone === 'accent' && 'bg-accent', tone === 'success' && 'bg-success', tone === 'warning' && 'bg-warning', tone === 'danger' && 'bg-danger')}
                  style={{ width: `${Math.max(0, Math.min(100, it.value))}%` }}
                />
              </span>
            </Comp>
          </li>
        )
      })}
    </ul>
  )
}
