import * as React from 'react'
import { cn } from '@se/ui'
import { cssColor, type Series } from './theme'

/** 범례 — 시리즈 색 점 + 라벨. ChartCard 가 쓰고, 관측 벽의 `Tile legend=` 에도 그대로 넘긴다 */
export function ChartLegend({ series, className }: { series: Series[]; className?: string }) {
  if (series.length < 2) return null
  return (
    <ul className={cn('flex items-center gap-3', className)} aria-label="범례">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
          <span className="size-2 rounded-[2px]" style={{ background: cssColor(s.color) }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

export interface ChartCardProps {
  title: string
  /** 무엇을 어떻게 읽는지 한 줄 */
  description?: string
  /** 2개 이상 시리즈면 항상 범례 */
  legend?: Series[]
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function ChartCard({ title, description, legend, actions, className, children }: ChartCardProps) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-xs', className)}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? <p className="text-xs text-muted">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {legend ? <ChartLegend series={legend} /> : null}
          {actions}
        </div>
      </header>
      {children}
    </section>
  )
}
