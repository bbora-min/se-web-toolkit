import * as React from 'react'
import { cn } from '../lib/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tooltip'
import { formatAbsolute, formatRelative } from '../lib/format'

const hm = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export type RibbonTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface RibbonEvent {
  id: string
  /** 시작 (ISO) */
  at: string
  /** 있으면 구간 — 배포 창, 장애 지속 시간 */
  until?: string
  label: string
  /** 같은 lane 의 이벤트가 한 줄에 놓인다. 없으면 "이벤트" 한 줄 */
  lane?: string
  /** 의미 색은 상태(장애·경고·성공)에만, 나머지는 accent(이 서비스의 일) 또는 neutral(남의 일) */
  tone?: RibbonTone
}

export interface TimelineRibbonProps {
  /** 보이는 범위 (ISO). 24시간·7일이 보통 */
  from: string
  to: string
  /** "지금" 선. 범위 안에 있을 때만 그린다. 기본: 현재 시각 */
  now?: string
  events: RibbonEvent[]
  /** 줄 순서. 없으면 events 에 나온 순서 */
  lanes?: string[]
  /** 줄 이름 칸의 폭(px). 기본 56 — 서비스 이름처럼 긴 줄 이름이면 96–120 */
  laneWidth?: number
  /** 왼쪽 제목 — "지난 24시간 · 배포 6 · 장애 1" */
  headline?: React.ReactNode
  detail?: React.ReactNode
  selected?: string | null
  onSelect?: (id: string) => void
  className?: string
}

const TONE: Record<RibbonTone, { dot: string; bar: string }> = {
  accent: { dot: 'bg-accent', bar: 'bg-accent/25 border-accent' },
  success: { dot: 'bg-success', bar: 'bg-success-soft border-success' },
  warning: { dot: 'bg-warning', bar: 'bg-warning-soft border-warning' },
  danger: { dot: 'bg-danger', bar: 'bg-danger-soft border-danger' },
  info: { dot: 'bg-info', bar: 'bg-info-soft border-info' },
  neutral: { dot: 'bg-line-strong', bar: 'bg-surface-2 border-line-strong' },
}

const HOUR = 3_600_000
const STEPS = [HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR, 24 * HOUR, 2 * 24 * HOUR, 7 * 24 * HOUR]

/** 5–8개가 되는 눈금 간격을 고른다. 눈금은 그 간격의 배수(정시·자정)에 놓는다 */
function ticks(from: number, to: number): number[] {
  const span = to - from
  const step = STEPS.find((s) => span / s <= 8) ?? STEPS[STEPS.length - 1]!
  const tz = new Date().getTimezoneOffset() * 60_000
  const first = Math.ceil((from - tz) / step) * step + tz
  const out: number[] = []
  for (let t = first; t < to; t += step) out.push(t)
  return out
}

function tickLabel(t: number, span: number): string {
  const d = new Date(t)
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (span <= 48 * HOUR) return d.getHours() === 0 && d.getMinutes() === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : hm
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/**
 * 시그니처 · 타임라인 리본 — 활동·이력 서비스의 얼굴.
 * "최근 무슨 일이 있었고 지금 어디쯤인가"를 시간축 한 줄로. 배포·장애·알림이 줄(lane)마다 놓이고 구간은 막대, 순간은 점.
 * 액센트는 "지금" 선과 이 서비스의 일(tone=accent)에만. 의미 색은 상태에만.
 */
export function TimelineRibbon({ from, to, now, events, lanes, laneWidth = 56, headline, detail, selected, onSelect, className }: TimelineRibbonProps) {
  const f = Date.parse(from)
  const t = Date.parse(to)
  const span = Math.max(1, t - f)
  const pct = (iso: string) => Math.min(100, Math.max(0, ((Date.parse(iso) - f) / span) * 100))
  const nowMs = now ? Date.parse(now) : Date.now()
  const showNow = nowMs >= f && nowMs <= t
  // 범위 밖 이벤트는 그리지 않는다 (구간이 범위에 걸치면 잘라서 그린다)
  const visible = events.filter((e) => Date.parse(e.at) <= t && Date.parse(e.until ?? e.at) >= f)
  const laneNames = lanes ?? Array.from(new Set(visible.map((e) => e.lane ?? '이벤트')))
  const tk = React.useMemo(() => ticks(f, t), [f, t])
  const count = visible.length
  const nowLeft = `${((nowMs - f) / span) * 100}%`

  return (
    <section
      className={cn('grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-surface shadow-xs xl:grid-cols-[minmax(220px,1fr)_4fr]', className)}
      aria-label="타임라인"
    >
      <div className="flex flex-col justify-center gap-1.5 border-b border-line bg-accent-soft/40 px-5 py-4 xl:border-b-0 xl:border-r">
        <span className="text-xs font-medium text-muted">타임라인</span>
        <p className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-ink">{headline ?? `이벤트 ${count}건`}</p>
        {detail ? <p className="text-xs text-muted">{detail}</p> : null}
      </div>

      <div className="relative min-w-0 px-5 pb-3 pt-4">
        {laneNames.map((lane) => {
          const items = visible.filter((e) => (e.lane ?? '이벤트') === lane)
          return (
            <div key={lane} className="flex items-center gap-3">
              <span className="shrink-0 truncate py-1 text-xs text-muted" style={{ width: laneWidth }} title={lane}>{lane}</span>
              <div className="relative h-7 min-w-0 flex-1 border-b border-dashed border-line" role="list" aria-label={lane}>
                {items.map((e) => {
                  const tone = TONE[e.tone ?? 'accent']
                  const left = pct(e.at)
                  const width = e.until ? Math.max(0.6, pct(e.until) - left) : null
                  const isSel = selected === e.id
                  const Comp = onSelect ? 'button' : 'span'
                  return (
                    <div key={e.id} role="listitem" className="contents">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Comp
                            type={onSelect ? 'button' : undefined}
                            aria-label={`${e.label} · ${formatAbsolute(e.at)}`}
                            aria-pressed={onSelect ? isSel : undefined}
                            onClick={onSelect ? () => onSelect(e.id) : undefined}
                            className={cn(
                              'absolute top-1/2 block -translate-y-1/2 outline-none transition-transform focus-visible:ring-2 focus-visible:ring-accent/40',
                              width !== null ? cn('h-3.5 rounded-sm border', tone.bar) : cn('size-2.5 -translate-x-1/2 rounded-full', tone.dot),
                              onSelect && 'cursor-pointer hover:scale-110',
                              isSel && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                            )}
                            style={{ left: `${left}%`, width: width !== null ? `${width}%` : undefined }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="tnum">
                          <span className="font-medium">{e.label}</span>
                          <span className="ml-2 text-muted">
                            {formatRelative(e.at)}
                            {e.until ? ` · ${hm(e.at)}–${hm(e.until)}` : ''}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* 눈금 — 라벨 열만큼 들여쓴 같은 좌표계 */}
        <div className="relative mt-1 h-5 text-[11px] text-muted tnum" style={{ marginLeft: laneWidth + 12 }} aria-hidden>
          {tk.map((x) => (
            <span key={x} className="absolute top-0 -translate-x-1/2" style={{ left: `${((x - f) / span) * 100}%` }}>
              {tickLabel(x, span)}
            </span>
          ))}
        </div>
        {showNow ? (
          <div className="pointer-events-none absolute bottom-8 left-5 right-5 top-3" style={{ marginLeft: laneWidth + 12 }} aria-hidden>
            <span className="absolute inset-y-0 w-px bg-accent" style={{ left: nowLeft }} />
            <span className="absolute -top-2.5 -translate-x-1/2 rounded-sm bg-accent px-1 text-[10px] font-medium leading-4 text-on-accent" style={{ left: nowLeft }}>지금</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
