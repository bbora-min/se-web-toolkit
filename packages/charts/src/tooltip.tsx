import * as React from 'react'
import type { TooltipProps } from 'recharts'
import { cssColor, type Series } from './theme'

interface Props extends TooltipProps<number, string> {
  series: Series[]
  labelFormat?: (label: unknown) => React.ReactNode
  valueFormat?: (v: number, key: string) => React.ReactNode
}

/** 툴팁: 레이블 → 시리즈별 값. 텍스트는 잉크색, 시리즈 색은 점으로만 */
export function ChartTooltip({ active, payload, label, series, labelFormat, valueFormat }: Props) {
  if (!active || !payload?.length) return null
  const byKey = new Map(payload.map((p) => [p.dataKey as string, p.value as number]))
  return (
    <div className="min-w-32 rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-raised">
      <div className="mb-1.5 font-medium text-ink">{labelFormat ? labelFormat(label) : String(label)}</div>
      <ul className="flex flex-col gap-1">
        {series.map((s) => {
          const v = byKey.get(s.key)
          if (v === undefined) return null
          return (
            <li key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="size-2 rounded-[2px]" style={{ background: cssColor(s.color) }} aria-hidden />
                {s.label}
              </span>
              <span className="tnum text-ink">{valueFormat ? valueFormat(v, s.key) : v.toLocaleString()}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
