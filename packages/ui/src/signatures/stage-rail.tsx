import * as React from 'react'
import { cn } from '../lib/cn'

export interface Stage {
  id: string
  label: string
  /** 이 단계에 있는 항목 수 */
  count: number
  /** 주의가 필요한 항목 수 (막힘·지연) */
  blocked?: number
}

export interface StageRailProps {
  stages: Stage[]
  /** 선택된 단계 (필터) */
  value?: string | null
  onChange?: (id: string | null) => void
  /** 왼쪽 제목 — "이번 주 릴리스 12건" */
  headline?: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

/**
 * 시그니처 · 단계 레일 — 워크플로 서비스의 얼굴.
 * "지금 무엇이 어디까지 왔는가"를 좌→우 흐름으로. 단계를 누르면 목록이 그 단계로 좁혀진다.
 * 액센트는 선택된 단계와 연결선에만.
 */
export function StageRail({ stages, value, onChange, headline, detail, className }: StageRailProps) {
  const total = stages.reduce((a, s) => a + s.count, 0)
  return (
    <section className={cn('grid grid-cols-[minmax(200px,1fr)_4fr] overflow-hidden rounded-lg border border-line bg-surface shadow-xs', className)}>
      <div className="flex flex-col justify-center gap-1.5 bg-accent px-5 py-4 text-on-accent">
        <span className="text-xs font-medium opacity-80">진행 중</span>
        <p className="font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{headline ?? `${total}건`}</p>
        {detail ? <p className="text-xs opacity-75">{detail}</p> : null}
      </div>
      <ol className="flex items-stretch" role="tablist" aria-label="단계">
        {stages.map((s, i) => {
          const active = value === s.id
          const last = i === stages.length - 1
          return (
            <li key={s.id} className="relative flex flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange?.(active ? null : s.id)}
                className={cn(
                  'flex w-full flex-col justify-center gap-1 px-5 py-4 text-left transition-colors',
                  active ? 'bg-accent-soft' : 'hover:bg-surface-2/60',
                )}
              >
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span className={cn('grid size-4 place-items-center rounded-full text-[10px] font-semibold', active ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted')}>{i + 1}</span>
                  {s.label}
                </span>
                <span className="flex items-baseline gap-2">
                  <span className={cn('text-2xl font-semibold leading-none tracking-[-0.02em] tnum', active ? 'text-accent-fg' : 'text-ink')}>{s.count}</span>
                  {s.blocked ? <span className="text-xs font-medium text-warning tnum">막힘 {s.blocked}</span> : null}
                </span>
              </button>
              {!last ? (
                <span className="pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2" aria-hidden>
                  <svg width="14" height="28" viewBox="0 0 14 28" className="text-line-strong"><path d="M1 1l11 13L1 27" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
