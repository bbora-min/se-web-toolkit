import * as React from 'react'
import { cn } from '../lib/cn'
import { StatCard, type StatCardProps } from '../components/stat-card'

export type StripHealth = 'ok' | 'degraded' | 'down' | 'unknown'

export interface StatusStripProps {
  /** 시스템 전체 상태 */
  health: StripHealth
  /** "클러스터 정상" 같은 한 문장 */
  headline: string
  /** 한 줄 보충 — 노드 수, 갱신 시각 등 */
  detail?: React.ReactNode
  /** 핵심 지표 3–4개. 그 이상은 대시보드로 */
  stats: StatCardProps[]
  /** compact: 목록 페이지용 한 줄 — 스파크라인·델타 없이 숫자만. 개요에서만 full */
  variant?: 'full' | 'compact'
  className?: string
}

const HEALTH: Record<StripHealth, { dot: string; text: string; label: string; block: string }> = {
  // block: full 변형의 좌측 블록. 정상일 땐 서비스 액센트가 블록을 "들고", 이상이 있으면 의미 색이 넘겨받는다
  ok: { dot: 'bg-success', text: 'text-success', label: '정상', block: 'bg-accent text-on-accent' },
  degraded: { dot: 'bg-warning', text: 'text-warning', label: '저하', block: 'bg-warning text-white' },
  down: { dot: 'bg-danger', text: 'text-danger', label: '장애', block: 'bg-danger text-white' },
  unknown: { dot: 'bg-neutral', text: 'text-muted', label: '알 수 없음', block: 'bg-surface-2 text-ink' },
}

/**
 * 시그니처 · 상태 스트립 — 모니터링 서비스의 얼굴.
 * 페이지 맨 위 카드 한 장으로 "지금 괜찮은가"와 핵심 지표 4개를 답한다.
 * 액센트는 좌측 상태 블록의 배경 틴트와 스파크라인 끝점에만.
 */
export function StatusStrip({ health, headline, detail, stats, variant = 'full', className }: StatusStripProps) {
  const h = HEALTH[health]
  if (variant === 'compact') {
    return (
      <section
        className={cn('flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-accent-soft/40 px-4 py-2.5 text-sm', className)}
        role="status"
        aria-live="polite"
      >
        <span className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', h.dot)} aria-hidden />
          <span className={cn('font-medium', h.text)}>{headline}</span>
          {detail ? <span className="text-xs text-muted">· {detail}</span> : null}
        </span>
        <dl className="ml-auto flex items-center gap-5 tnum">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className={cn('font-semibold', s.tone === 'danger' && 'text-danger', s.tone === 'warning' && 'text-warning')}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    )
  }
  return (
    <section
      className={cn(
        'grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xs xl:grid-cols-[minmax(220px,1fr)_3fr]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('flex flex-col justify-center gap-1.5 px-5 py-4', h.block)}>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5" aria-hidden>
            {health === 'ok' ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40" /> : null}
            <span className="relative inline-flex size-2.5 rounded-full bg-current" />
          </span>
          <span className="text-xs font-medium opacity-90">{h.label}</span>
        </div>
        <p className="font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{headline}</p>
        {detail ? <p className="text-xs opacity-75">{detail}</p> : null}
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 [&>*]:border-line [&>*:nth-child(odd)]:border-r xl:[&>*:not(:last-child)]:border-r [&>*:nth-child(-n+2)]:border-b xl:[&>*]:border-b-0">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 px-5 py-4">
            <StatCard {...s} />
          </div>
        ))}
      </div>
    </section>
  )
}
