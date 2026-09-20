import * as React from 'react'
import { cn } from '../lib/cn'

/* ──────────────────────────────────────────────────────────────
 * Board · BoardColumn · BoardCard — 보드(Kanban) 골격의 재료.
 * 열 = 상태(단계), 카드 = 항목. 가로로 스크롤하고, 카드를 다른 열에 끌어다 놓으면 `onMove` 가 불린다.
 * 끌기는 브라우저의 HTML5 drag & drop(의존성 없음). 키보드·터치는 카드의 메뉴("다음 단계로")로 같은 일을 한다 — 끌기만으로 할 수 있는 일을 두지 않는다.
 * 어디로 옮길 수 있는지는 `canMove` 가 정한다(워크플로 규칙은 페이지의 것). 옮길 수 없는 열은 끄는 동안 흐려진다.
 * ────────────────────────────────────────────────────────────── */

interface BoardCtx {
  dragging: string | null
  setDragging: (id: string | null) => void
  onMove?: (cardId: string, toColumnId: string) => void
  canMove?: (cardId: string, toColumnId: string) => boolean
}
const Ctx = React.createContext<BoardCtx>({ dragging: null, setDragging: () => {} })

export interface BoardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스크롤 컨테이너 — 시그니처에서 열로 스크롤할 때 `querySelector('[data-column=…]')` */
  ref?: React.Ref<HTMLDivElement>
  /** 카드를 열에 놓았을 때. 없으면 끌 수 없다 */
  onMove?: (cardId: string, toColumnId: string) => void
  /** 이 카드를 이 열에 놓을 수 있는가. 없으면 전부 허용 */
  canMove?: (cardId: string, toColumnId: string) => boolean
}

/** 가로 스크롤 보드. 자식은 `BoardColumn` */
export function Board({ ref, onMove, canMove, className, children, ...props }: BoardProps) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const ctx = React.useMemo<BoardCtx>(() => ({ dragging, setDragging, onMove, canMove }), [dragging, onMove, canMove])
  return (
    <Ctx.Provider value={ctx}>
      <div ref={ref} className={cn('flex min-w-0 items-start gap-3 overflow-x-auto pb-3', className)} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

export interface BoardColumnProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  id: string
  title: string
  /** 카드 수 — 헤더 우측 */
  count?: number
  /** 막힌 카드 수 — 있으면 warning 으로 */
  blocked?: number
  /** 시그니처(단계 레일)에서 이 열을 가리켰을 때 등 — 잠시 강조 */
  highlighted?: boolean
  /** 열 폭(px). 기본 288 */
  width?: number
  /** 헤더 우측 액션 */
  actions?: React.ReactNode
}

/** 열 하나. 끄는 카드를 받을 수 있으면 놓을 자리가 액센트로, 받을 수 없으면 흐려진다 */
export function BoardColumn({ id, title, count, blocked, highlighted, width = 288, actions, className, children, ...props }: BoardColumnProps) {
  const { dragging, onMove, canMove } = React.useContext(Ctx)
  const [over, setOver] = React.useState(false)
  const acceptable = dragging !== null && Boolean(onMove) && (canMove ? canMove(dragging, id) : true)
  const rejected = dragging !== null && !acceptable
  return (
    <section
      data-column={id}
      className={cn(
        'flex shrink-0 snap-start flex-col rounded-lg border bg-canvas transition-[opacity,box-shadow,border-color] duration-150',
        over && acceptable ? 'border-accent ring-2 ring-accent/30' : 'border-line',
        highlighted && 'border-accent ring-2 ring-accent/30',
        rejected && 'opacity-50',
        className,
      )}
      style={{ width }}
      onDragOver={(e) => {
        if (!acceptable) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (!over) setOver(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const cardId = e.dataTransfer.getData('text/plain') || dragging
        if (cardId && acceptable) onMove?.(cardId, id)
      }}
      {...props}
    >
      <header className="flex h-10 items-center gap-2 px-3">
        <h2 className="truncate text-[13px] font-semibold text-ink">{title}</h2>
        {count !== undefined ? <span className="rounded-full bg-surface-2 px-1.5 text-[11px] font-medium text-muted tnum">{count}</span> : null}
        {blocked ? <span className="text-[11px] font-medium text-warning tnum">막힘 {blocked}</span> : null}
        {actions ? <span className="ml-auto flex items-center">{actions}</span> : null}
      </header>
      <div className="flex min-h-16 flex-col gap-2 px-2 pb-2" role="list" aria-label={title}>
        {children}
      </div>
    </section>
  )
}

export interface BoardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  /** 카드 전체를 눌렀을 때(상세로). 끌기와 구분된다 */
  onOpen?: () => void
  /** 끌 수 없는 카드(완료 등) */
  draggable?: boolean
}

/** 카드 한 장. 내용은 자식으로 — 첫 줄 식별자(mono) · 제목 · 하단 메타 순서를 권한다 */
export function BoardCard({ id, onOpen, draggable = true, className, children, onKeyDown, ...props }: BoardCardProps) {
  const { dragging, setDragging, onMove } = React.useContext(Ctx)
  const canDrag = draggable && Boolean(onMove)
  return (
    <div
      role="listitem"
      tabIndex={onOpen ? 0 : undefined}
      draggable={canDrag}
      data-card={id}
      className={cn(
        'flex flex-col gap-2 rounded-md border border-line bg-surface p-3 shadow-xs transition-[border-color,opacity] duration-150',
        onOpen && 'cursor-pointer hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        canDrag && 'cursor-grab active:cursor-grabbing',
        dragging === id && 'opacity-50',
        className,
      )}
      onClick={onOpen}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        if (onOpen && (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onOpen()
        }
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed = 'move'
        setDragging(id)
      }}
      onDragEnd={() => setDragging(null)}
      {...props}
    >
      {children}
    </div>
  )
}
