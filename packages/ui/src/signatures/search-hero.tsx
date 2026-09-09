import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '../lib/cn'

export interface SearchHeroProps {
  /** 검색창 위 한 줄. "무엇을 찾을 수 있는가" */
  title: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  /** 검색창 아래 빠른 진입 칩 */
  quick?: Array<{ label: string; count?: number; active?: boolean; onClick: () => void }>
  /** 우측 보조 정보 — "1,204개 데이터셋 · 방금 색인" */
  hint?: React.ReactNode
  className?: string
}

/**
 * 시그니처 · 검색 히어로 — 데이터 조회 서비스의 얼굴.
 * 페이지 맨 위에 큰 검색창 하나. "찾는 것"이 이 서비스의 전부라는 선언.
 * 액센트는 포커스 링과 활성 칩에만.
 */
export function SearchHero({ title, placeholder = '검색', value, onChange, quick, hint, className }: SearchHeroProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className={cn('flex flex-col gap-4 rounded-lg border border-line bg-accent-soft/40 px-6 pb-5 pt-6', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-md font-semibold text-ink">{title}</h2>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={title}
          className={cn(
            'h-12 w-full rounded-lg border border-line-strong/80 bg-surface pl-12 pr-16 text-md text-ink shadow-xs',
            'placeholder:text-muted',
            'transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15',
          )}
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-sm border border-line bg-surface px-1.5 font-mono text-[11px] leading-5 text-muted">
          /
        </kbd>
      </label>
      {quick?.length ? (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="빠른 필터">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              aria-pressed={q.active}
              onClick={q.onClick}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors',
                q.active
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line-strong/80 bg-surface text-ink hover:border-line-strong hover:bg-surface-2',
              )}
            >
              {q.label}
              {q.count !== undefined ? <span className={cn('tnum', q.active ? 'opacity-80' : 'text-muted')}>{q.count.toLocaleString()}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
