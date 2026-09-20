import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../lib/cn'

/**
 * 칩 — 빠른 진입·필터 프리셋처럼 "누르면 어딘가로 가거나 조건이 바뀌는" 작은 알약.
 * 숫자가 있으면 오른쪽에 tnum 으로. `active` 는 액센트 소프트, `tone="danger"` 는 숫자만 빨갛게(0 이면 회색).
 * 링크로 쓰려면 `asChild` 로 `<a>`·`<Link>` 를 감싼다. 배지(`Badge`)는 상태 표시, 칩은 행동 — 섞지 않는다.
 */
export interface ChipProps extends React.HTMLAttributes<HTMLElement> {
  count?: number
  tone?: 'default' | 'danger'
  active?: boolean
  asChild?: boolean
}

export function Chip({ count, tone = 'default', active, asChild, className, children, ...props }: ChipProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      {...(asChild ? {} : { type: 'button' })}
      aria-pressed={active}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs shadow-xs transition-colors',
        active ? 'border-accent/40 bg-accent-soft text-accent-fg' : 'border-line bg-surface text-ink/80 hover:border-line-strong hover:text-ink',
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {count !== undefined ? <span className={cn('font-medium tnum', tone === 'danger' && count > 0 ? 'text-danger' : 'text-ink')}>{count.toLocaleString()}</span> : null}
        </>
      )}
    </Comp>
  )
}
