import * as React from 'react'
import { cn } from '../lib/cn'

export interface TabItem {
  value: string
  label: string
  /** 건수 등. 0이어도 보여준다 */
  count?: number
  /** 실패 탭처럼 주의를 끌어야 할 때 */
  tone?: 'default' | 'danger'
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
  'aria-label'?: string
}

/**
 * 밑줄 탭. 목록의 1차 분류(상태·유형)에 쓴다. 필터바는 그 아래 2차.
 * 카운트는 보조 정보라 muted, 선택된 탭만 ink.
 */
export function Tabs({ items, value, onChange, className, ...a11y }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex items-end gap-1 border-b border-line', className)} {...a11y}>
      {items.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px flex h-9 items-center gap-1.5 border-b-2 px-2.5 text-sm transition-colors duration-150',
              active ? 'border-accent font-medium text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tnum leading-5',
                  t.tone === 'danger' && t.count > 0 ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-muted',
                  active && t.tone !== 'danger' && 'bg-accent-soft text-accent-fg',
                )}
              >
                {t.count.toLocaleString()}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
