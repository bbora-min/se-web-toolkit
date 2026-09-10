import * as React from 'react'
import { cn } from '@se/ui'
import { cssColor, type Series } from './theme'

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
          {legend && legend.length > 1 ? (
            <ul className="flex items-center gap-3" aria-label="범례">
              {legend.map((s) => (
                <li key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="size-2 rounded-[2px]" style={{ background: cssColor(s.color) }} aria-hidden />
                  {s.label}
                </li>
              ))}
            </ul>
          ) : null}
          {actions}
        </div>
      </header>
      {children}
    </section>
  )
}
