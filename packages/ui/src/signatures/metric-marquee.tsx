import * as React from 'react'
import { cn } from '../lib/cn'
import { StatCard, formatDelta, type StatCardProps } from '../components/stat-card'
import { Sparkline } from '../components/sparkline'

export interface MetricMarqueeProps {
  /** 이 서비스가 존재하는 이유인 숫자 하나 — 액센트 블록에 크게 */
  primary: {
    label: string
    value: React.ReactNode
    /** 값 아래 한 줄 — "목표 99.9% · 이번 달" */
    description?: React.ReactNode
    delta?: StatCardProps['delta']
    trend?: number[]
  }
  /** 보조 지표 3–6개. 가로로 흐르고 좁으면 스크롤 */
  metrics: StatCardProps[]
  /** 기간 선택 칩 — "24시간 · 7일 · 30일" */
  period?: { value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }
  className?: string
}

/**
 * 시그니처 · 지표 마키 — 숫자가 목적인 서비스(비용·사용량·품질 지표)의 얼굴.
 * "핵심 숫자가 지금 얼마인가"를 첫 줄에. 주 지표 하나가 액센트 블록을 들고, 보조 지표가 그 옆으로 띠처럼 흐른다.
 * 액센트는 주 지표 블록과 스파크라인 끝점에만. 상태 스트립과 달리 "괜찮은가"가 아니라 "얼마인가"를 묻는다.
 */
export function MetricMarquee({ primary, metrics, period, className }: MetricMarqueeProps) {
  // 액센트 블록 위라 성공/위험 색 대신 밝기로만 — 방향은 문구(+/-)가 말한다
  const deltaEl = primary.delta ? (
    <span className="text-xs tnum opacity-90">
      <span className="opacity-75">{primary.delta.period}</span> {formatDelta(primary.delta).text}
    </span>
  ) : null
  return (
    <section
      className={cn('grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xs xl:grid-cols-[minmax(240px,1.2fr)_3fr]', className)}
      aria-label="핵심 지표"
    >
      <div className="flex min-w-0 flex-col justify-between gap-3 bg-accent px-5 py-4 text-on-accent">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium opacity-80">{primary.label}</span>
          {period ? (
            <div className="flex gap-0.5 rounded-md bg-on-accent/10 p-0.5" role="tablist" aria-label="기간">
              {period.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="tab"
                  aria-selected={period.value === o.value}
                  onClick={() => period.onChange(o.value)}
                  className={cn(
                    'rounded px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-accent/60',
                    period.value === o.value ? 'bg-surface text-ink shadow-xs' : 'text-on-accent/80 hover:text-on-accent',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-3xl font-semibold leading-none tracking-[-0.03em] tnum">{primary.value}</span>
            {deltaEl}
            {primary.description ? <span className="text-xs opacity-75">{primary.description}</span> : null}
          </div>
          {primary.trend ? <Sparkline data={primary.trend} width={112} height={32} inverse className="shrink-0" /> : null}
        </div>
      </div>
      <div className="flex divide-x divide-line overflow-x-auto [scrollbar-width:thin]">
        {metrics.map((m) => (
          <div key={m.label} className="min-w-[190px] flex-1 px-5 py-4">
            <StatCard {...m} />
          </div>
        ))}
      </div>
    </section>
  )
}
