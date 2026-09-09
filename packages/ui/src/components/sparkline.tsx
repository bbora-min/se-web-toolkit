import * as React from 'react'
import { cn } from '../lib/cn'

export interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  /** 마지막 구간을 액센트로 강조 (현재 기간) */
  emphasizeLast?: boolean
  /** 값 포맷 (호버 라벨) */
  format?: (v: number) => string
  className?: string
}

/**
 * 스파크라인. 선 2px, 회색(de-emphasis) + 마지막 구간 액센트, 끝점 강조.
 * 축·격자 없음 — 방향만 읽는 그림이다. 호버하면 값을 보여준다.
 */
export function Sparkline({ data, width = 96, height = 28, emphasizeLast = true, format, className }: SparklineProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  if (data.length < 2) return null
  const pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2)
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2)
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  const line = `M${pts.join('L')}`
  const area = `${line}L${x(data.length - 1).toFixed(1)},${height}L${x(0).toFixed(1)},${height}Z`
  const lastIdx = data.length - 1
  const last = data[lastIdx]!
  const prev = data[lastIdx - 1]!
  const hv = hover != null ? data[hover]! : null

  return (
    <span className={cn('relative inline-block', className)} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`추세: ${data.map((v) => (format ? format(v) : v)).join(', ')}`}
        className="overflow-visible"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const i = Math.round(((e.clientX - r.left - pad) / (width - pad * 2)) * (data.length - 1))
          setHover(Math.max(0, Math.min(lastIdx, i)))
        }}
      >
        <path d={area} className="fill-line/40" />
        <path d={line} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="stroke-line-strong" />
        {emphasizeLast ? (
          <path
            d={`M${x(lastIdx - 1)},${y(prev)}L${x(lastIdx)},${y(last)}`}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            className="stroke-accent"
          />
        ) : null}
        <circle cx={x(lastIdx)} cy={y(last)} r={2.5} className="fill-accent" />
        {hover != null ? (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={0} y2={height} className="stroke-line-strong" strokeDasharray="2 2" />
            <circle cx={x(hover)} cy={y(hv!)} r={3} className="fill-surface stroke-ink" strokeWidth={1.5} />
          </>
        ) : null}
      </svg>
      {hover != null ? (
        <span
          className="pointer-events-none absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-1.5 py-0.5 text-[10px] text-canvas tnum"
          style={{ left: x(hover) }}
        >
          {format ? format(hv!) : hv}
        </span>
      ) : null}
    </span>
  )
}
