import * as React from 'react'
import { CartesianGrid, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS, cssColor, type Series } from './theme'
import { ChartTooltip } from './tooltip'

export interface LineChartProps<T extends object> {
  data: T[]
  xKey: keyof T & string
  series: Series[]
  height?: number
  xFormat?: (v: unknown) => string
  yFormat?: (v: number) => string
  tooltipLabel?: (v: unknown) => React.ReactNode
  tooltipValue?: (v: number, key: string) => React.ReactNode
  xInterval?: number
}

/** 선 2px, 점 없음(호버 시만), 크로스헤어 툴팁 */
export function LineChart<T extends object>({
  data,
  xKey,
  series,
  height = 220,
  xFormat,
  yFormat,
  tooltipLabel,
  tooltipValue,
  xInterval,
}: LineChartProps<T>) {
  return (
    <div style={{ height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -6 }}>
          <CartesianGrid vertical={false} {...AXIS.grid} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS.tick} tickFormatter={xFormat} interval={xInterval ?? 'preserveStartEnd'} dy={6} />
          <YAxis tickLine={false} axisLine={false} tick={AXIS.tick} tickFormatter={yFormat} width={52} />
          <Tooltip
            cursor={{ stroke: 'var(--se-line-strong)', strokeDasharray: '3 3' }}
            content={<ChartTooltip series={series} labelFormat={tooltipLabel} valueFormat={tooltipValue} />}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={cssColor(s.color)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--se-surface)' }}
              isAnimationActive={false}
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  )
}
