import * as React from 'react'
import { cn } from '../lib/cn'
import { Sparkline } from './sparkline'
import { useAnimatedNumber } from '../lib/use-animated-number'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  /** 전기 대비. `good`은 "올라가면 좋은가" — 실패 건수는 false */
  /** upIsGood: true=오르면 좋음, false=내리면 좋음, null=방향에 가치 없음(중립) */
  delta?: { value: number; period: string; upIsGood?: boolean | null; format?: (v: number) => string }
  trend?: number[]
  trendFormat?: (v: number) => string
  /** 값 자체가 경고 상태일 때 */
  tone?: 'default' | 'warning' | 'danger'
  className?: string
}

/**
 * 스탯 타일. 라벨 · 값(세미볼드, 비례 숫자) · 전기 대비 · 스파크라인.
 * 값이 이 화면의 목적일 때만 쓴다 — 장식용 KPI 나열 금지.
 */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const v = useAnimatedNumber(value)
  return <>{v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}

export function StatCard({ label, value, delta, trend, trendFormat, tone = 'default', className }: StatCardProps) {
  const shown = typeof value === 'number' ? <AnimatedNumber value={value} decimals={Number.isInteger(value) ? 0 : 1} /> : value
  let deltaEl: React.ReactNode = null
  if (delta) {
    const up = delta.value > 0
    const flat = delta.value === 0
    const neutral = flat || delta.upIsGood === null
    const good = neutral ? null : (delta.upIsGood ?? true) === up
    const fmt = delta.format ?? ((v: number) => `${v > 0 ? '+' : ''}${v}`)
    deltaEl = (
      <span className={cn('text-xs tnum', neutral ? 'text-ink/70' : good ? 'text-success' : 'text-danger')}>
        <span className="text-muted">{delta.period}</span> {flat ? '변동 없음' : fmt(delta.value)}
      </span>
    )
  }
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs text-muted">{label}</span>
      <div className="flex min-w-0 items-end justify-between gap-3">
        <span
          className={cn(
            'text-2xl font-semibold leading-none tracking-[-0.02em]',
            tone === 'warning' && 'text-warning',
            tone === 'danger' && 'text-danger',
          )}
        >
          {shown}
        </span>
        {trend ? <Sparkline data={trend} format={trendFormat} className="shrink-0" /> : null}
      </div>
      {deltaEl}
    </div>
  )
}
