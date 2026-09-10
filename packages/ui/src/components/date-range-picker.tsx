import * as React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

/** YYYY-MM-DD */
export type ISODate = string
export interface DateRange {
  from: ISODate
  to: ISODate
}

const fmt = (d: Date): ISODate => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s: ISODate) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const today = () => fmt(new Date())

export const RANGE_PRESETS: Array<{ id: string; label: string; range: () => DateRange }> = [
  { id: 'today', label: '오늘', range: () => ({ from: today(), to: today() }) },
  { id: '7d', label: '최근 7일', range: () => ({ from: fmt(addDays(new Date(), -6)), to: today() }) },
  { id: '30d', label: '최근 30일', range: () => ({ from: fmt(addDays(new Date(), -29)), to: today() }) },
  { id: 'month', label: '이번 달', range: () => { const n = new Date(); return { from: fmt(new Date(n.getFullYear(), n.getMonth(), 1)), to: fmt(new Date(n.getFullYear(), n.getMonth() + 1, 0)) } } },
  { id: 'next14', label: '앞으로 2주', range: () => ({ from: today(), to: fmt(addDays(new Date(), 13)) }) },
]

const label = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' })
export function formatRange(r: DateRange | null): string {
  if (!r) return ''
  const a = parse(r.from), b = parse(r.to)
  if (r.from === r.to) return label.format(a)
  return `${label.format(a)} – ${label.format(b)}`
}

export interface DateRangePickerProps {
  value: DateRange | null
  onChange: (r: DateRange | null) => void
  placeholder?: string
  presets?: typeof RANGE_PRESETS
  className?: string
  /** 과거만 / 미래만 제한 */
  min?: ISODate
  max?: ISODate
  id?: string
}

/**
 * 기간 선택 — 프리셋 열 + 한 달 달력. 시작일 클릭 → 종료일 클릭.
 * 모니터링·조회의 "언제"를 정하는 기본 부품.
 */
export function DateRangePicker({ value, onChange, placeholder = '기간', presets = RANGE_PRESETS, className, min, max, id }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState(() => (value ? parse(value.from) : new Date()))
  const [pending, setPending] = React.useState<ISODate | null>(null)
  const [hover, setHover] = React.useState<ISODate | null>(null)

  React.useEffect(() => {
    if (open) {
      setPending(null)
      setCursor(value ? parse(value.from) : new Date())
    }
  }, [open, value])

  const y = cursor.getFullYear(), m = cursor.getMonth()
  const first = new Date(y, m, 1)
  const startPad = first.getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells: Array<ISODate | null> = [...Array<null>(startPad).fill(null), ...Array.from({ length: days }, (_, i) => fmt(new Date(y, m, i + 1)))]
  while (cells.length % 7) cells.push(null)

  const pick = (d: ISODate) => {
    if (!pending) {
      setPending(d)
      return
    }
    const [a, b] = pending <= d ? [pending, d] : [d, pending]
    onChange({ from: a, to: b })
    setPending(null)
    setOpen(false)
  }
  const inRange = (d: ISODate) => {
    if (pending) {
      const end = hover ?? pending
      const [a, b] = pending <= end ? [pending, end] : [end, pending]
      return d >= a && d <= b
    }
    return !!value && d >= value.from && d <= value.to
  }
  const isEdge = (d: ISODate) => (pending ? d === pending || d === hover : !!value && (d === value.from || d === value.to))
  const disabled = (d: ISODate) => (min !== undefined && d < min) || (max !== undefined && d > max)
  const t = today()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} className={cn('justify-start gap-2 font-normal', !value && 'text-muted', className)}>
          <CalendarDays className="text-muted" />
          {value ? formatRange(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto gap-3 p-2">
        <ul className="flex w-28 flex-col gap-0.5 border-r border-line pr-2">
          {presets.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(p.range())
                  setOpen(false)
                }}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-2"
              >
                {p.label}
              </button>
            </li>
          ))}
          <li className="mt-1 border-t border-line pt-1">
            <button type="button" onClick={() => { onChange(null); setOpen(false) }} className="w-full rounded-md px-2 py-1.5 text-left text-sm text-muted hover:bg-surface-2">
              지우기
            </button>
          </li>
        </ul>
        <div className="flex w-[252px] flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <Button variant="ghost" size="icon-sm" aria-label="이전 달" onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft /></Button>
            <span className="text-sm font-medium tnum">{y}년 {m + 1}월</span>
            <Button variant="ghost" size="icon-sm" aria-label="다음 달" onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight /></Button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-muted">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => setHover(null)}>
            {cells.map((d, i) =>
              d ? (
                <button
                  key={d}
                  type="button"
                  disabled={disabled(d)}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHover(d)}
                  className={cn(
                    'relative mx-auto grid size-8 place-items-center rounded-md text-sm tnum transition-colors',
                    inRange(d) && 'bg-accent-soft text-accent-fg',
                    isEdge(d) && 'bg-accent text-on-accent',
                    !inRange(d) && 'hover:bg-surface-2',
                    d === t && !isEdge(d) && 'font-semibold',
                    'disabled:opacity-30 disabled:hover:bg-transparent',
                  )}
                >
                  {Number(d.slice(8))}
                  {d === t ? <span className="absolute bottom-1 size-1 rounded-full bg-current" aria-hidden /> : null}
                </button>
              ) : (
                <span key={`e${i}`} />
              ),
            )}
          </div>
          <p className="px-1 text-[11px] text-muted">{pending ? '종료일을 고르세요' : '시작일을 고르세요'}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
