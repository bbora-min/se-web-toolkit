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
  className?: string
}

const HEALTH: Record<StripHealth, { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-success', text: 'text-success', label: '정상' },
  degraded: { dot: 'bg-warning', text: 'text-warning', label: '저하' },
  down: { dot: 'bg-danger', text: 'text-danger', label: '장애' },
  unknown: { dot: 'bg-neutral', text: 'text-muted', label: '알 수 없음' },
}

/**
 * 시그니처 · 상태 스트립 — 모니터링 서비스의 얼굴.
 * 페이지 맨 위 카드 한 장으로 "지금 괜찮은가"와 핵심 지표 4개를 답한다.
 * 액센트는 좌측 상태 블록의 배경 틴트와 스파크라인 끝점에만.
 */
export function StatusStrip({ health, headline, detail, stats, className }: StatusStripProps) {
  const h = HEALTH[health]
  return (
    <section
      className={cn('grid grid-cols-[minmax(220px,1fr)_3fr] overflow-hidden rounded-lg border border-line bg-surface shadow-xs', className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col justify-center gap-1.5 border-r border-line bg-accent-soft/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5" aria-hidden>
            {health === 'ok' ? <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-40', h.dot)} /> : null}
            <span className={cn('relative inline-flex size-2.5 rounded-full', h.dot)} />
          </span>
          <span className={cn('text-xs font-medium', h.text)}>{h.label}</span>
        </div>
        <p className="text-md font-semibold leading-tight text-ink">{headline}</p>
        {detail ? <p className="text-xs text-muted">{detail}</p> : null}
      </div>
      <div className="grid grid-cols-4 divide-x divide-line">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <StatCard {...s} />
          </div>
        ))}
      </div>
    </section>
  )
}
