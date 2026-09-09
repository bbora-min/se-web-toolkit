import * as React from 'react'
import { cn } from '../lib/cn'

export interface DescriptionItem {
  label: string
  value: React.ReactNode
  /** ID·해시·경로 */
  mono?: boolean
}

/** 라벨/값 목록. 상세 화면의 기본 재료 */
export function DescriptionList({
  items,
  columns = 1,
  className,
}: {
  items: DescriptionItem[]
  columns?: 1 | 2
  className?: string
}) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3 text-sm', columns === 2 && 'grid-cols-2', className)}>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted">{it.label}</dt>
          <dd className={cn('text-ink break-all', it.mono && 'font-mono text-xs')}>{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
