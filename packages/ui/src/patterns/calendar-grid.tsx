import * as React from 'react'
import { cn } from '../lib/cn'
import { addDays, dayOf, parseLocal, ymd } from '../lib/date'

/* ──────────────────────────────────────────────────────────────
 * CalendarGrid — 일정(schedule) 골격의 재료. 월 격자(7열 × 5–6주)에 이벤트 칩과 구간(프리즈·점검) 빗금.
 * 시간이 x축인 화면: 배포 캘린더·온콜·배치 스케줄. 오늘은 액센트 점, 고른 날은 액센트 테두리.
 * 칩 색은 tone(의미 색 또는 액센트)으로만 — 캘린더별 색을 새로 만들지 않는다.
 * ────────────────────────────────────────────────────────────── */

export type CalendarTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface CalendarEvent {
  id: string
  label: React.ReactNode
  /** ISO. 날짜만 써도 된다 */
  from: string
  /** 없으면 하루 */
  to?: string
  tone?: CalendarTone
  /** 호버 툴팁 — 칩이 말줄임될 때 전체 이름 */
  title?: string
}
export interface CalendarSpan {
  id: string
  from: string
  to: string
  label: string
  tone?: 'warning' | 'danger' | 'neutral'
}
export interface CalendarGridProps {
  /** "YYYY-MM" */
  month: string
  events: CalendarEvent[]
  /** 프리즈·점검처럼 날을 덮는 구간 — 빗금 */
  spans?: CalendarSpan[]
  /** "YYYY-MM-DD" */
  selected?: string | null
  onSelectDay?: (day: string) => void
  onSelectEvent?: (event: CalendarEvent) => void
  /** 오늘("YYYY-MM-DD"). 기본: 실제 오늘 */
  today?: string
  /** 한 칸에 보여 줄 칩 수. 넘치면 "+n" */
  maxChips?: number
  className?: string
}

const CHIP: Record<CalendarTone, string> = {
  accent: 'bg-accent-soft text-accent-fg',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-2 text-ink/80',
}
const SPAN: Record<NonNullable<CalendarSpan['tone']>, { bg: string; text: string }> = {
  warning: { bg: 'se-cal-span-warning', text: 'text-warning' },
  danger: { bg: 'se-cal-span-danger', text: 'text-danger' },
  neutral: { bg: 'se-cal-span-neutral', text: 'text-muted' },
}
export { ymd }
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 월의 격자에 놓일 날짜들 — 일요일 시작, 앞뒤는 이웃 달로 채운다 */
export function monthDays(month: string): Date[] {
  const [y, m] = month.split('-').map(Number) as [number, number]
  const first = new Date(y, m - 1, 1)
  const start = new Date(y, m - 1, 1 - first.getDay())
  const out: Date[] = []
  for (let i = 0; i < 42; i++) out.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  // 마지막 주가 통째로 다음 달이면 뺀다
  return out[35]!.getMonth() === m - 1 ? out : out.slice(0, 35)
}

export function CalendarGrid({ month, events, spans = [], selected, onSelectDay, onSelectEvent, today, maxChips = 3, className }: CalendarGridProps) {
  const days = React.useMemo(() => monthDays(month), [month])
  const todayKey = today ?? ymd(new Date())
  const [y, m] = month.split('-').map(Number) as [number, number]
  const byDay = React.useMemo(() => {
    const map = new Map<string, Array<{ ev: CalendarEvent; first: boolean }>>()
    for (const ev of events) {
      const a = parseLocal(dayOf(ev.from))
      const b = parseLocal(dayOf(ev.to ?? ev.from))
      const firstKey = ymd(a)
      for (let d = a; d <= b; d = addDays(d, 1)) {
        const k = ymd(d)
        let list = map.get(k)
        if (!list) map.set(k, (list = []))
        list.push({ ev, first: k === firstKey })
      }
    }
    return map
  }, [events])
  // 구간은 날짜 문자열로 한 번만 — 칸마다 Date 를 만들지 않는다
  const spanRanges = React.useMemo(() => spans.map((s) => ({ s, from: dayOf(s.from), to: dayOf(s.to) })), [spans])
  const spanFor = (k: string) => spanRanges.find((r) => k >= r.from && k <= r.to)?.s
  const weeks = React.useMemo(() => Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7)), [days])

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border border-line bg-surface', className)} role="grid" aria-label={`${y}년 ${m}월`}>
      <div className="grid grid-cols-7 border-b border-line bg-canvas" role="row">
        {WEEKDAYS.map((w, i) => (
          <div key={w} role="columnheader" className={cn('px-2 py-1.5 text-[11px] font-medium', i === 0 ? 'text-danger/80' : i === 6 ? 'text-info/80' : 'text-muted')}>{w}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
      <div key={wi} className="grid grid-cols-7 auto-rows-[minmax(96px,1fr)]" role="row">
        {week.map((d, di) => {
          const i = wi * 7 + di
          const k = ymd(d)
          const inMonth = d.getMonth() === m - 1
          const isToday = k === todayKey
          const isSel = k === selected
          const list = byDay.get(k) ?? []
          const span = spanFor(k)
          const dow = d.getDay()
          return (
            <div
              key={k}
              role="gridcell"
              aria-selected={isSel}
              tabIndex={onSelectDay ? 0 : undefined}
              onClick={() => onSelectDay?.(k)}
              onKeyDown={(e) => {
                // 칩(버튼)에서 올라온 Enter 는 칩의 것
                if (e.target !== e.currentTarget) return
                if (onSelectDay && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelectDay(k) }
              }}
              className={cn(
                'relative flex min-w-0 flex-col gap-1 border-b border-line p-1.5 text-left transition-colors',
                i % 7 !== 6 && 'border-r',
                !inMonth && 'bg-canvas/60 text-muted',
                span && SPAN[span.tone ?? 'warning'].bg,
                onSelectDay && 'cursor-pointer hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                isSel && 'ring-2 ring-inset ring-accent',
              )}
              title={span ? `${span.label}` : undefined}
            >
              <div className="flex items-center justify-between">
                <span className={cn('grid size-5 place-items-center rounded-full text-[11px] tnum', isToday ? 'bg-accent font-semibold text-on-accent' : dow === 0 && inMonth ? 'text-danger/80' : dow === 6 && inMonth ? 'text-info/80' : inMonth ? 'text-ink' : 'text-muted')}>{d.getDate()}</span>
                {span && (k === dayOf(span.from) || dow === 0) ? <span className={cn('truncate text-[10px]', SPAN[span.tone ?? 'warning'].text)}>{span.label}</span> : null}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                {list.slice(0, maxChips).map(({ ev, first }) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelectEvent?.(ev) }}
                    title={ev.title}
                    className={cn('flex h-[18px] min-w-0 items-center rounded-sm px-1 text-left text-[11px] leading-none', CHIP[ev.tone ?? 'accent'], !first && 'opacity-70', onSelectEvent ? 'hover:brightness-95' : 'cursor-default')}
                  >
                    <span className="truncate">{ev.label}</span>
                  </button>
                ))}
                {list.length > maxChips ? <span className="px-1 text-[10px] text-muted tnum">+{list.length - maxChips}</span> : null}
              </div>
            </div>
          )
        })}
      </div>
      ))}
    </div>
  )
}
