import * as React from 'react'
import { cn } from '../lib/cn'

/* ──────────────────────────────────────────────────────────────
 * TileGrid · Tile — 관측 벽(observability wall) 골격의 재료.
 * 페이지 제목 없이 12칸 격자를 타일이 채운다(Grafana·Datadog). 타일 헤더는 한 줄(제목 · 설명 · 범례 · 액션), 본문은 차트·표.
 * 바탕은 canvas, 타일은 surface — 원장 페이지(surface 위 카드)와 질감이 반대라 "다른 골격"으로 읽힌다.
 * 폭 1024 이하에서는 `spanNarrow`(기본: 6 이상이면 12, 그 미만이면 6)로 접힌다.
 * ────────────────────────────────────────────────────────────── */

export interface TileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 격자 간격(px). 벽은 촘촘하게 — 기본 12 */
  gap?: number
}

/** 12칸 격자. 자식은 `Tile`(또는 span 을 스스로 정한 블록) */
export function TileGrid({ gap = 12, className, style, ...props }: TileGridProps) {
  return <div className={cn('grid grid-cols-12 items-stretch', className)} style={{ gap, ...style }} {...props} />
}

export interface TileProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: string
  /** 무엇을 어떻게 읽는지 한 줄 — 없어도 된다(벽은 제목이 짧다) */
  note?: string
  /** 우측 범례 — @se/charts 의 `ChartLegend` 를 넘긴다 */
  legend?: React.ReactNode
  /** 우측 액션 — 링크 하나가 보통 */
  actions?: React.ReactNode
  /** 12칸 중 몇 칸. 기본 12 */
  span?: number
  /** 1024 이하에서의 칸 수. 기본: span ≥ 6 → 12, 아니면 6 */
  spanNarrow?: number
  /** 값이 임계를 넘었을 때 — 헤더 제목 옆 점 */
  tone?: 'default' | 'warning' | 'danger'
}

const DOT: Record<NonNullable<TileProps['tone']>, string> = { default: '', warning: 'bg-warning', danger: 'bg-danger' }

/** 벽의 타일 한 장. 본문은 `flex-1 min-h-0` — 차트 높이는 자식이 정한다 */
export function Tile({ title, note, legend, actions, span = 12, spanNarrow, tone = 'default', className, style, children, ...props }: TileProps) {
  const narrow = spanNarrow ?? (span >= 6 ? 12 : 6)
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded-md border border-line bg-surface',
        '[grid-column:span_var(--tile-span)_/_span_var(--tile-span)] max-lg:[grid-column:span_var(--tile-span-narrow)_/_span_var(--tile-span-narrow)]',
        className,
      )}
      style={{ '--tile-span': span, '--tile-span-narrow': narrow, ...style } as React.CSSProperties}
      {...props}
    >
      <header className="flex items-start justify-between gap-3 px-4 pb-2 pt-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-ink">
            {tone !== 'default' ? <span className={cn('size-1.5 rounded-full', DOT[tone])} aria-hidden /> : null}
            <span className="truncate">{title}</span>
          </h2>
          {note ? <p className="truncate text-xs text-muted">{note}</p> : null}
        </div>
        {legend || actions ? (
          <div className="flex shrink-0 items-center gap-3 empty:hidden">
            {legend}
            {actions}
          </div>
        ) : null}
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4">{children}</div>
    </section>
  )
}
