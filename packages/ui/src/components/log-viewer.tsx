import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDownToLine, Copy, Search, WrapText } from 'lucide-react'
import { cn } from '../lib/cn'
import { parseAnsi, stripAnsi, type AnsiSpan } from '../lib/ansi'
import { Button } from './button'
import { Input } from './input'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export interface LogViewerProps {
  lines: string[]
  /** 아직 쓰이는 중 — 따라가기 기본 ON, 상단에 라이브 표시 */
  live?: boolean
  height?: number | string
  /** 상단 바 좌측 제목 */
  title?: React.ReactNode
  className?: string
  emptyText?: string
}

const COLOR_CLS: Record<NonNullable<AnsiSpan['color']>, string> = {
  black: 'text-ink', red: 'text-danger', green: 'text-success', yellow: 'text-warning', blue: 'text-info',
  magenta: 'text-chart-6', cyan: 'text-accent-fg', white: 'text-ink', gray: 'text-muted',
}
const LEVEL = /\b(ERROR|FATAL|PANIC)\b|\b(WARN|WARNING)\b/

/**
 * 로그 뷰어 — 수천 줄을 가상 스크롤로. ANSI 색, 레벨 강조, 검색(일치 이동), 따라가기, 줄바꿈, 복사.
 * 로그는 읽는 게 아니라 "빨간 줄을 찾는" 것이므로 ERROR 줄에 좌측 마커를 준다.
 */
export function LogViewer({ lines, live, height = 480, title, className, emptyText = '로그가 없습니다' }: LogViewerProps) {
  const parentRef = React.useRef<HTMLDivElement>(null)
  const [follow, setFollow] = React.useState(!!live)
  const [wrap, setWrap] = React.useState(false)
  const [q, setQ] = React.useState('')
  const [cursor, setCursor] = React.useState(0)

  const plain = React.useMemo(() => lines.map(stripAnsi), [lines])
  const matches = React.useMemo(() => {
    if (!q.trim()) return []
    const needle = q.toLowerCase()
    const out: number[] = []
    plain.forEach((l, i) => l.toLowerCase().includes(needle) && out.push(i))
    return out
  }, [plain, q])
  const errorCount = React.useMemo(() => plain.filter((l) => /\b(ERROR|FATAL|PANIC)\b/.test(l)).length, [plain])

  const rowVirtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 22,
    overscan: 20,
    measureElement: wrap ? (el) => el.getBoundingClientRect().height : undefined,
  })

  // 따라가기: 새 줄이 오면 맨 아래로
  React.useEffect(() => {
    if (follow && lines.length) rowVirtualizer.scrollToIndex(lines.length - 1, { align: 'end' })
  }, [lines.length, follow, rowVirtualizer])
  // 사용자가 위로 스크롤하면 따라가기 해제
  const onScroll = () => {
    const el = parentRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
    if (!atBottom && follow) setFollow(false)
  }
  const jump = (dir: 1 | -1) => {
    if (!matches.length) return
    const next = (cursor + dir + matches.length) % matches.length
    setCursor(next)
    setFollow(false)
    rowVirtualizer.scrollToIndex(matches[next]!, { align: 'center' })
  }
  React.useEffect(() => {
    setCursor(0)
    if (matches.length) rowVirtualizer.scrollToIndex(matches[0]!, { align: 'center' })
  }, [q]) // matches·rowVirtualizer는 의도적으로 제외 — 검색어가 바뀔 때만 첫 일치로 이동

  const copy = () => void navigator.clipboard?.writeText(plain.join('\n'))
  const gutter = String(lines.length).length

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border border-line bg-surface', className)} style={{ height }}>
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-2">
        <span className="flex items-center gap-2 px-1 text-sm font-medium text-ink">
          {title ?? '로그'}
          {live ? (
            <span className="flex items-center gap-1 text-xs font-normal text-success">
              <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" /><span className="relative inline-flex size-1.5 rounded-full bg-success" /></span>
              라이브
            </span>
          ) : null}
        </span>
        <span className="text-xs text-muted tnum">{lines.length.toLocaleString()}줄{errorCount ? <span className="text-danger"> · 오류 {errorCount}</span> : null}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="relative">
            <Input
              leading={<Search />}
              placeholder="검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') jump(e.shiftKey ? -1 : 1) }}
              className="w-56 [&_input]:h-7 [&_input]:text-xs"
              aria-label="로그 검색"
            />
            {q ? <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted tnum">{matches.length ? `${cursor + 1}/${matches.length}` : '0'}</span> : null}
          </div>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" aria-pressed={wrap} aria-label="줄바꿈" onClick={() => setWrap((w) => !w)} className={cn(wrap && 'bg-surface-2 text-ink')}><WrapText /></Button></TooltipTrigger><TooltipContent>줄바꿈</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" aria-pressed={follow} aria-label="따라가기" onClick={() => { setFollow((f) => !f); rowVirtualizer.scrollToIndex(lines.length - 1, { align: 'end' }) }} className={cn(follow && 'bg-accent-soft text-accent-fg')}><ArrowDownToLine /></Button></TooltipTrigger><TooltipContent>맨 아래 따라가기</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="전체 복사" onClick={copy}><Copy /></Button></TooltipTrigger><TooltipContent>전체 복사</TooltipContent></Tooltip>
        </div>
      </div>
      {lines.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted">{emptyText}</div>
      ) : (
        <div ref={parentRef} onScroll={onScroll} className="flex-1 overflow-auto bg-canvas font-mono text-xs leading-[22px] text-ink">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((v) => {
              const raw = lines[v.index]!
              const p = plain[v.index]!
              const lvl = LEVEL.exec(p)
              const isErr = !!lvl?.[1]
              const isWarn = !!lvl?.[2]
              const isMatch = q && matches.includes(v.index)
              const isCurrent = isMatch && matches[cursor] === v.index
              return (
                <div
                  key={v.key}
                  ref={rowVirtualizer.measureElement}
                  data-index={v.index}
                  className={cn(
                    'absolute left-0 top-0 flex w-full gap-3 px-3',
                    isErr && 'bg-danger-soft/50',
                    isWarn && 'bg-warning-soft/40',
                    isCurrent && 'bg-accent-soft ring-1 ring-inset ring-accent/40',
                    !isCurrent && isMatch && 'bg-accent-soft/40',
                    !wrap && 'whitespace-pre',
                    wrap && 'whitespace-pre-wrap break-all',
                  )}
                  style={{ transform: `translateY(${v.start}px)` }}
                >
                  <span className={cn('select-none text-right tnum', isErr ? 'text-danger' : 'text-muted/70')} style={{ width: `${gutter}ch` }}>{v.index + 1}</span>
                  <span className={cn('min-w-0 flex-1', isErr && 'font-medium')}>
                    {parseAnsi(raw).map((s, i) => (
                      <span key={i} className={cn(s.color && COLOR_CLS[s.color], s.bold && 'font-semibold', s.dim && 'opacity-60')}>{s.text}</span>
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
