import * as React from 'react'
import { cn } from '../lib/cn'

/* ──────────────────────────────────────────────────────────────
 * SplitPane — 트리아지(3단)·콘솔(패싯 + 스트림) 골격의 재료.
 * 화면 높이에 고정된 가로 분할. 왼쪽(목록·패싯)과 오른쪽(속성)은 폭이 정해져 있고 손잡이로 끌어 바꾼다, 가운데가 남는 폭을 가진다.
 * 각 칸이 스스로 스크롤한다 — 페이지가 스크롤하면 목록의 자리를 잃는다. 폭은 `storageKey` 로 브라우저에 남긴다.
 * ────────────────────────────────────────────────────────────── */

export interface SplitPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 왼쪽 칸(목록·패싯). 없으면 2단 */
  left?: React.ReactNode
  /** 오른쪽 칸(속성·미리보기). 없으면 2단 */
  right?: React.ReactNode
  leftWidth?: number
  rightWidth?: number
  minLeft?: number
  minRight?: number
  /** 가운데 칸의 최소 폭 — 손잡이가 이보다 좁게 만들지 않는다 */
  minCenter?: number
  /** 폭을 기억할 키(localStorage). 없으면 기억하지 않는다 */
  storageKey?: string
  /** 1024 이하에서 오른쪽 칸을 숨긴다(기본 true) — 가운데가 먼저다 */
  collapseRightNarrow?: boolean
}

function readWidths(key: string | undefined): { l?: number; r?: number } {
  if (!key) return {}
  try {
    const v = localStorage.getItem(`se-split:${key}`)
    return v ? (JSON.parse(v) as { l?: number; r?: number }) : {}
  } catch {
    return {}
  }
}

export function SplitPane({ left, right, leftWidth = 320, rightWidth = 280, minLeft = 220, minRight = 200, minCenter = 360, storageKey, collapseRightNarrow = true, className, children, ...props }: SplitPaneProps) {
  const saved = React.useMemo(() => readWidths(storageKey), [storageKey])
  const [l, setL] = React.useState(saved.l ?? leftWidth)
  const [r, setR] = React.useState(saved.r ?? rightWidth)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(`se-split:${storageKey}`, JSON.stringify({ l, r }))
    } catch {
      /* private mode 등 — 무시 */
    }
  }, [l, r, storageKey])

  const drag = (side: 'l' | 'r') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const startX = e.clientX
    const start = side === 'l' ? l : r
    const total = el.getBoundingClientRect().width
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const delta = side === 'l' ? ev.clientX - startX : startX - ev.clientX
      const other = side === 'l' ? (right ? r : 0) : left ? l : 0
      const max = total - other - minCenter - 12
      const next = Math.max(side === 'l' ? minLeft : minRight, Math.min(max, start + delta))
      ;(side === 'l' ? setL : setR)(Math.round(next))
    }
    const up = () => {
      handle.releasePointerCapture(e.pointerId)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
  }
  const onKey = (side: 'l' | 'r') => (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 8
    const set = side === 'l' ? setL : setR
    const min = side === 'l' ? minLeft : minRight
    if (e.key === 'ArrowLeft') set((v) => Math.max(min, v - (side === 'l' ? step : -step)))
    else if (e.key === 'ArrowRight') set((v) => Math.max(min, v + (side === 'l' ? step : -step)))
    else return
    e.preventDefault()
  }

  return (
    <div ref={ref} className={cn('flex h-full min-h-0 min-w-0', className)} {...props}>
      {left ? (
        <>
          <div className="flex min-h-0 shrink-0 flex-col overflow-y-auto border-r border-line bg-canvas" style={{ width: l }}>
            {left}
          </div>
          <Handle onPointerDown={drag('l')} onKeyDown={onKey('l')} label="왼쪽 칸 폭" value={l} />
        </>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
      {right ? (
        <div className={cn('contents', collapseRightNarrow && 'max-lg:hidden')}>
          <Handle onPointerDown={drag('r')} onKeyDown={onKey('r')} label="오른쪽 칸 폭" value={r} />
          <div className="flex min-h-0 shrink-0 flex-col overflow-y-auto border-l border-line bg-canvas" style={{ width: r }}>
            {right}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Handle({ label, value, ...props }: { label: string; value: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={value}
      tabIndex={0}
      className="group relative w-0 shrink-0 cursor-col-resize outline-none"
      {...props}
    >
      <span className="absolute inset-y-0 -left-1 w-2 transition-colors group-hover:bg-accent/30 group-focus-visible:bg-accent/40 group-active:bg-accent/40" aria-hidden />
    </div>
  )
}
