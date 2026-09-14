import * as React from 'react'
import { CartesianGrid, Line, LineChart as RLineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS, cssColor, type Series, type SeriesColor } from './theme'
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
  /** 목표선·임계선 — y 값에 점선 하나. 라벨은 우측 끝에 작게 */
  referenceLines?: Array<{ y: number; label?: string; color?: SeriesColor }>
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
  referenceLines,
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
          {referenceLines?.map((r, i) => {
            const c = r.color ? cssColor(r.color) : undefined
            return (
              <ReferenceLine
                key={i}
                y={r.y}
                stroke={c ?? 'var(--se-line-strong)'}
                strokeDasharray="4 3"
                ifOverflow="extendDomain"
                label={r.label ? { value: r.label, position: 'insideTopRight', fontSize: 11, fill: c ?? 'var(--se-muted)' } : undefined}
              />
            )
          })}
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
