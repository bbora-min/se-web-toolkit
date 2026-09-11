import * as React from 'react'
import { Bar, BarChart as RBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS, cssColor, type Series } from './theme'
import { ChartTooltip } from './tooltip'

export interface BarChartProps<T extends object> {
  data: T[]
  xKey: keyof T & string
  series: Series[]
  stacked?: boolean
  height?: number
  xFormat?: (v: unknown) => string
  yFormat?: (v: number) => string
  tooltipLabel?: (v: unknown) => React.ReactNode
  tooltipValue?: (v: number, key: string) => React.ReactNode
  /** x축 눈금 간격 (예: 24포인트에 4면 6개만) */
  xInterval?: number
  /** 막대 폭 고정(px). 값이 0–3건인 도구에서 기본(최대 28)이 너무 가늘 때 */
  barSize?: number
}

/**
 * 막대. 얇게, 위쪽 모서리만 둥글게, 막대 사이 표면 간격.
 * 축선 없음, 가로 격자만 점선. 시리즈가 2개 이상이면 ChartCard에 legend를 넘긴다.
 */
export function BarChart<T extends object>({
  data,
  xKey,
  series,
  stacked,
  height = 220,
  xFormat,
  yFormat,
  tooltipLabel,
  tooltipValue,
  xInterval,
  barSize,
}: BarChartProps<T>) {
  return (
    <div style={{ height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -6 }} barCategoryGap="30%" barGap={2}>
          <CartesianGrid vertical={false} {...AXIS.grid} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS.tick} tickFormatter={xFormat} interval={xInterval ?? 'preserveStartEnd'} dy={6} />
          <YAxis tickLine={false} axisLine={false} tick={AXIS.tick} tickFormatter={yFormat} width={52} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'var(--se-surface-2)', opacity: 0.6 }}
            content={<ChartTooltip series={series} labelFormat={tooltipLabel} valueFormat={tooltipValue} />}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? 'a' : undefined}
              fill={cssColor(s.color)}
              radius={stacked ? (i === series.length - 1 ? [3, 3, 0, 0] : 0) : [3, 3, 0, 0]}
              maxBarSize={28}
              barSize={barSize}
              stroke="var(--se-surface)"
              strokeWidth={stacked ? 1 : 0}
              isAnimationActive={false}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  )
}
