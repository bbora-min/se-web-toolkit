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
  const listRef = React.useRef<HTMLDivElement>(null)
  const [bar, setBar] = React.useState<{ left: number; width: number } | null>(null)
  // 활성 탭의 위치를 재서 밑줄 하나를 미끄러뜨린다 — 탭마다 밑줄을 켜고 끄는 것보다 "움직임"이 읽힌다
  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const el = list.querySelector<HTMLElement>('[aria-selected="true"]')
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [value, items.length])
  return (
    <div ref={listRef} role="tablist" className={cn('relative flex items-end gap-1 border-b border-line', className)} {...a11y}>
      {bar ? (
        <span
          aria-hidden
          className="absolute -bottom-px h-0.5 rounded-full bg-accent transition-[left,width] duration-200 ease-se"
          style={{ left: bar.left, width: bar.width }}
        />
      ) : null}
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
              'flex h-9 items-center gap-1.5 px-2.5 text-sm transition-colors duration-150',
              active ? 'font-medium text-ink' : 'text-muted hover:text-ink',
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
