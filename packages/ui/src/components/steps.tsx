import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../lib/cn'

export interface Step {
  id: string
  label: string
  description?: string
}

export interface StepsProps {
  steps: Step[]
  /** 현재 단계 인덱스 */
  current: number
  /** 완료된 단계로 되돌아갈 수 있게 */
  onStepClick?: (index: number) => void
  className?: string
}

/** 다단계 폼의 진행 표시. 완료=체크, 현재=액센트, 이후=회색 */
export function Steps({ steps, current, onStepClick, className }: StepsProps) {
  return (
    <ol className={cn('flex items-start', className)} aria-label="단계">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        const clickable = done && onStepClick
        return (
          <li key={s.id} className={cn('flex flex-1 items-start gap-3', i < steps.length - 1 && 'pr-3')} aria-current={active ? 'step' : undefined}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onStepClick?.(i)}
              className={cn('flex flex-1 items-start gap-3 text-left', clickable ? 'cursor-pointer' : 'cursor-default')}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors',
                  done && 'border-accent bg-accent text-on-accent',
                  active && 'border-accent bg-accent-soft text-accent-fg ring-4 ring-accent/15',
                  !done && !active && 'border-line-strong bg-surface text-muted',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="flex flex-col pt-1 leading-tight">
                <span className={cn('whitespace-nowrap text-sm', active ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-muted')}>{s.label}</span>
                {s.description ? <span className="whitespace-nowrap text-xs text-muted">{s.description}</span> : null}
              </span>
            </button>
            {i < steps.length - 1 ? <span className={cn('mt-3.5 h-px flex-1 min-w-6', done ? 'bg-accent' : 'bg-line')} aria-hidden /> : null}
          </li>
        )
      })}
    </ol>
  )
}
