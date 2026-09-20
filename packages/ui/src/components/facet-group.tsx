import * as React from 'react'
import { cn } from '../lib/cn'
import { Checkbox } from './checkbox'

/**
 * 패싯 — 콘솔·검색 화면의 왼쪽 칸에 놓이는 "값 · 건수" 목록. 여러 개를 고르면 OR, 그룹끼리는 AND(Datadog Logs 관례).
 * 건수는 지금 보이는 것 기준으로 다시 세어 준다(0 이면 흐리게). 값 하나만 남기려면 건수를 누른다("only").
 */
export interface FacetOption {
  value: string
  label?: React.ReactNode
  count?: number
  /** 값 자체의 의미 색 — ERROR 는 danger */
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}
export interface FacetGroupProps {
  title: string
  options: FacetOption[]
  /** 고른 값들. 비어 있으면 전부 */
  values: string[]
  onChange: (values: string[]) => void
  className?: string
}

const TONE: Record<NonNullable<FacetOption['tone']>, string> = { default: 'text-ink', success: 'text-success', warning: 'text-warning', danger: 'text-danger', info: 'text-info' }

export function FacetGroup({ title, options, values, onChange, className }: FacetGroupProps) {
  const uid = React.useId()
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  return (
    <section className={cn('flex flex-col gap-1', className)}>
      <header className="flex h-7 items-center justify-between px-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted">{title}</h3>
        {values.length ? <button type="button" className="text-[11px] text-muted hover:text-ink" onClick={() => onChange([])}>전체</button> : null}
      </header>
      <ul className="flex flex-col">
        {options.map((o) => {
          const on = values.includes(o.value)
          const id = `${uid}-${o.value.replace(/\s+/g, '_')}`
          return (
            <li key={o.value} className={cn('group flex h-7 items-center gap-2 rounded-md px-2 text-[13px] hover:bg-surface-2', o.count === 0 && 'opacity-50')}>
              <Checkbox id={id} checked={on} onCheckedChange={() => toggle(o.value)} />
              <label htmlFor={id} className={cn('min-w-0 flex-1 cursor-pointer truncate font-mono text-xs', on ? TONE[o.tone ?? 'default'] : 'text-ink/80')}>{o.label ?? o.value}</label>
              {o.count !== undefined ? (
                <button
                  type="button"
                  className="text-[11px] text-muted tnum hover:text-accent-fg"
                  title="이 값만"
                  onClick={() => onChange([o.value])}
                >
                  <span className="group-hover:hidden">{o.count.toLocaleString()}</span>
                  <span className="hidden group-hover:inline">only</span>
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
