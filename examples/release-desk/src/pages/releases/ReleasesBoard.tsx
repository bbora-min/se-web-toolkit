/**
 * 릴리스 보드 — 보드(Kanban) 골격의 원본. 열 = 단계, 카드 = 릴리스.
 *
 * 디자인 플랜
 *  골격       : 보드. 같은 목록을 표(원장)와 보드로 오간다 — "비교할 땐 표, 흐름을 볼 땐 보드". 단계 레일(시그니처)의 숫자를 누르면 그 열로 스크롤한다.
 *  목적       : "어느 단계에 무엇이 쌓여 있고 어디가 막혔나"를 열의 높이로 본다. 카드를 다음 열로 끌면 단계가 진행된다.
 *  첫 시선    : 승인 열의 막힘 · 카드의 warning 점.
 *  주 액션    : 없음(페이지의 "새 릴리스"). 카드는 상세로, 메뉴에서 다음 단계·승인. 끌기는 바로 옆 열(다음 단계)로만 — 워크플로 규칙은 상세 화면과 같다.
 *  정보 계층  : 열 헤더(단계 · 건수 · 막힘) → 카드(버전 · 유형 · 제목 → 서비스 · 승인 · 위험 → 담당 · 배포 창).
 *  밀도       : 카드 288px, 열 간격 12. 콘텐츠 폭 1440(`useContentWidth`). 5열이 1280 에서 다 보이고, 1024 에선 가로 스크롤.
 *  액센트     : 놓을 수 있는 열의 테두리, 레일에서 가리킨 열의 강조. 단계 색은 StageBadge 와 같은 의미 색.
 *  3상태      : 열 스켈레톤 / 빈 열은 "없음" 한 줄 / 에러는 페이지가 든다.
 *  톤         : procedural.
 */
import * as React from 'react'
import { ArrowRight, Copy, Eye, MoreHorizontal, ThumbsUp } from 'lucide-react'
import { Avatar, Badge, Board, BoardCard, BoardColumn, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Skeleton, Tooltip, TooltipContent, TooltipTrigger, formatAbsolute, toast } from '@se/ui'
import { useAdvanceRelease } from '../../api/releases'
import { STAGES, type Release, type StageId } from '../../api/types'
import { advanceBlocker, isMyTurn, nextStage } from '../../lib/workflow'
import { ApproverStack, RiskLabel, TypeBadge } from './bits'

/** 보드에 보이는 열 — 초안은 작성자만 보는 상태라 뺀다 */
const COLUMNS = STAGES.filter((s) => s.id !== 'draft')
const windowLabel = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })

/** 단계 레일에서 가리킨 열 — 같은 열을 다시 눌러도 스크롤하도록 n 을 올린다 */
export interface BoardFocus {
  stage: StageId
  n: number
}

export interface ReleasesBoardProps {
  items: Release[] | undefined
  loading?: boolean
  /** 단계 레일에서 가리킨 열 — 스크롤하고 잠시 강조 */
  focus?: BoardFocus | null
  onOpen: (r: Release) => void
  onDecide: (r: Release) => void
}

export function ReleasesBoard({ items, loading, focus, onOpen, onDecide }: ReleasesBoardProps) {
  const { mutateAsync: advance } = useAdvanceRelease()
  const byId = React.useMemo(() => new Map((items ?? []).map((r) => [r.id, r])), [items])
  const [highlight, setHighlight] = React.useState<StageId | null>(null)
  const boardRef = React.useRef<HTMLDivElement>(null)

  // 레일 → 열: 스크롤 + 1.2초 강조
  React.useEffect(() => {
    if (!focus) return
    boardRef.current?.querySelector(`[data-column="${focus.stage}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
    setHighlight(focus.stage)
    const t = setTimeout(() => setHighlight(null), 1200)
    return () => clearTimeout(t)
  }, [focus])

  const canMove = React.useCallback(
    (cardId: string, to: string) => {
      const r = byId.get(cardId)
      return Boolean(r) && !advanceBlocker(r!) && nextStage(r!.stage) === to
    },
    [byId],
  )
  const move = React.useCallback(
    async (cardId: string, to: string) => {
      const r = byId.get(cardId)
      if (!r) return
      const why = advanceBlocker(r)
      if (why) return void toast(why)
      if (nextStage(r.stage) !== to) return void toast('바로 다음 단계로만 옮길 수 있습니다')
      try {
        await advance(r.id)
        toast(`${r.version} — ${STAGES.find((s) => s.id === to)!.label} 단계로 이동되었습니다`)
      } catch (e) {
        toast((e as Error).message)
      }
    },
    [byId, advance],
  )

  return (
    <Board ref={boardRef} onMove={move} canMove={canMove} aria-busy={loading}>
      {COLUMNS.map((col) => {
        const cards = (items ?? []).filter((r) => r.stage === col.id)
        const blocked = cards.filter((r) => r.blocked).length
        return (
          <BoardColumn key={col.id} id={col.id} title={col.label} count={loading ? undefined : cards.length} blocked={blocked} highlighted={highlight === col.id}>
            {loading ? (
              <>
                <Skeleton className="h-24 rounded-md" />
                <Skeleton className="h-24 rounded-md" />
              </>
            ) : cards.length === 0 ? (
              <p className="px-1 py-3 text-center text-xs text-muted">없음</p>
            ) : (
              cards.map((r) => <ReleaseCard key={r.id} release={r} onOpen={() => onOpen(r)} onDecide={() => onDecide(r)} onAdvance={() => void move(r.id, nextStage(r.stage) ?? r.stage)} />)
            )}
          </BoardColumn>
        )
      })}
    </Board>
  )
}

function ReleaseCard({ release: r, onOpen, onDecide, onAdvance }: { release: Release; onOpen: () => void; onDecide: () => void; onAdvance: () => void }) {
  const blocker = advanceBlocker(r)
  const myTurn = isMyTurn(r)
  const next = nextStage(r.stage)
  return (
    <BoardCard id={r.id} onOpen={onOpen} draggable={!blocker} aria-label={`${r.version} ${r.title}`}>
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
          <span className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-ink">{r.version}</span>
            <TypeBadge type={r.type} />
          </span>
          <span className="line-clamp-2 text-[13px] text-ink/85">{r.title}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="더 보기" className="-mr-1 -mt-1" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={onOpen}><Eye /> 상세 보기</DropdownMenuItem>
            {myTurn ? <DropdownMenuItem onSelect={onDecide}><ThumbsUp /> 승인 / 반려</DropdownMenuItem> : null}
            {next && !blocker ? <DropdownMenuItem onSelect={onAdvance}><ArrowRight /> {STAGES.find((s) => s.id === next)!.label} 단계로</DropdownMenuItem> : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { void navigator.clipboard?.writeText(`${location.origin}/releases/${r.id}`); toast('링크를 복사했습니다') }}><Copy /> 링크 복사</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {r.blocked ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 text-xs text-warning"><span className="size-1.5 rounded-full bg-warning" aria-hidden />막힘 · <span className="truncate">{r.blocked}</span></span>
          </TooltipTrigger>
          <TooltipContent>{r.blocked}</TooltipContent>
        </Tooltip>
      ) : null}
      <div className="flex items-center gap-2">
        <Badge>{r.service}</Badge>
        <ApproverStack approvers={r.approvers} />
        <span className="ml-auto"><RiskLabel risk={r.risk} /></span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><Avatar name={r.owner} />{r.owner}</span>
        <span title={formatAbsolute(r.windowFrom)} className={Date.parse(r.windowFrom) < Date.now() ? '' : 'text-ink'}>{windowLabel.format(new Date(r.windowFrom))}</span>
      </div>
    </BoardCard>
  )
}
