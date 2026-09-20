/**
 * 내 승인 대기 — 트리아지(3단) 골격의 원본. 목록 | 본문 | 속성. 제목 없음, j/k 로 다음 항목.
 *
 * 디자인 플랜
 *  골격       : 트리아지. "하나씩 처리하는" 화면이라 목록을 떠나지 않는다 — 원장(표 → 상세 페이지)과 달리 상세가 옆에 상주한다.
 *  목적       : 내 차례인 릴리스를 위에서부터 하나씩 결정한다. 결정하면 다음 항목으로 넘어간다.
 *  첫 시선    : 목록 맨 위 항목이 이미 선택돼 있고, 본문 상단에 [승인] [반려].
 *  주 액션    : 승인(primary, 바로) · 반려(secondary, 사유 필수 다이얼로그). 키보드 j/k 이동, Enter 상세.
 *  정보 계층  : 목록(버전·제목·서비스·위험·배포 창) → 본문(변경 → 롤백 → 체크리스트 → 승인 현황) → 속성(사실들 · 타임라인).
 *  밀도       : compact 에 가깝게 — 목록 행 60px, 본문 65자. 화면 높이 고정, 칸마다 스크롤. 폭 1440(useContentWidth).
 *  액센트     : 선택된 행, primary 하나. 나머지는 회색.
 *  3상태      : 목록 스켈레톤 + 본문 스켈레톤 / "승인할 릴리스가 없습니다 — 모두 처리했습니다" / 원인 + 다시 시도.
 *  톤         : procedural.
 */
import * as React from 'react'
import { ArrowUpRight, CheckCircle2, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { Avatar, Badge, Button, EmptyState, ErrorState, Kbd, Skeleton, SplitPane, cn, formatAbsolute, formatRelative, toast, useContentWidth } from '@se/ui'
import { useDecide, useReleases } from '../../api/releases'
import { STAGES, type Release } from '../../api/types'
import { ME } from '../../lib/workflow'
import { ApproverStack, RiskLabel, StageBadge, TypeBadge } from '../releases/bits'
import { DecisionDialog } from '../releases/DecisionDialog'

const windowFmt = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })

export function ApprovalsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const list = useReleases({ mine: true })
  useContentWidth(1440)
  // 내 차례인 것만, 배포 창 임박 순
  const items = React.useMemo(() => [...(list.data?.items ?? [])].sort((a, b) => a.windowFrom.localeCompare(b.windowFrom)), [list.data])
  const selected = items.find((r) => r.id === id) ?? items[0] ?? null
  const [reject, setReject] = React.useState<Release | null>(null)

  // URL 에 선택이 없으면 첫 항목으로(교체) — 새로고침·공유해도 같은 화면
  React.useEffect(() => {
    if (!id && items[0]) navigate(`/approvals/${items[0].id}`, { replace: true })
  }, [id, items, navigate])

  // j/k — 입력 중이 아닐 때만
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.closest('[role="dialog"]'))) return
      if (!selected || !items.length) return
      const i = items.findIndex((r) => r.id === selected.id)
      if (e.key === 'j' || e.key === 'ArrowDown') navigate(`/approvals/${items[Math.min(items.length - 1, i + 1)]!.id}`)
      else if (e.key === 'k' || e.key === 'ArrowUp') navigate(`/approvals/${items[Math.max(0, i - 1)]!.id}`)
      else if (e.key === 'Enter') navigate(`/releases/${selected.id}`)
      else return
      e.preventDefault()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [items, selected, navigate])

  /** 결정 뒤 — 목록에서 빠지므로 다음(없으면 이전) 항목으로 */
  const goNext = (doneId: string) => {
    const i = items.findIndex((r) => r.id === doneId)
    const next = items[i + 1] ?? items[i - 1]
    navigate(next ? `/approvals/${next.id}` : '/approvals', { replace: true })
  }

  return (
    // 화면 높이에 고정 — 쉘의 패딩을 무르고 3단이 각자 스크롤한다
    <div className="-mx-6 -mb-16 flex h-[calc(100vh-3.5rem)] min-h-0 flex-col border-t border-line xl:-mx-8">
      <h1 className="sr-only">내 승인 대기</h1>
      <SplitPane
        storageKey="approvals"
        left={<Queue items={items} loading={list.isPending} error={list.isError ? list.error.message : null} selectedId={selected?.id ?? null} onRetry={() => list.refetch()} />}
        right={selected ? <Props r={selected} /> : null}
      >
        {list.isError ? (
          <ErrorState title="승인 대기 목록을 불러오지 못했습니다" description={list.error.message} action={<Button onClick={() => list.refetch()}>다시 시도</Button>} />
        ) : list.isPending ? (
          <div className="flex flex-col gap-4 px-8 py-6"><Skeleton className="h-8 w-80" /><Skeleton className="h-4 w-96" /><Skeleton className="h-48" /></div>
        ) : !selected ? (
          <EmptyState title="승인할 릴리스가 없습니다" description="귀하의 결정을 기다리는 릴리스가 모두 처리되었습니다." action={<Button asChild><Link to="/releases">릴리스 목록</Link></Button>} />
        ) : (
          <Body key={selected.id} r={selected} onReject={() => setReject(selected)} onDecided={() => goNext(selected.id)} />
        )}
      </SplitPane>
      <DecisionDialog release={reject} onClose={() => { const d = reject; setReject(null); if (d) goNext(d.id) }} />
    </div>
  )
}

/** 왼쪽 — 처리할 것의 줄. 행은 링크(공유·새로고침에 안전), 선택은 액센트 */
function Queue({ items, loading, error, selectedId, onRetry }: { items: Release[]; loading: boolean; error: string | null; selectedId: string | null; onRetry: () => void }) {
  return (
    <>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="text-sm font-semibold text-ink">내 승인 대기</span>
        {!loading && !error ? <span className="rounded-full bg-surface-2 px-1.5 text-[11px] font-medium text-muted tnum">{items.length}</span> : null}
        <span className="ml-auto flex items-center gap-1 text-[11px] text-muted"><Kbd>j</Kbd><Kbd>k</Kbd> 이동</span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-px p-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[60px] rounded-md" />)}</div>
      ) : error ? (
        <div className="flex flex-col gap-2 p-4 text-xs text-muted"><span>불러오지 못했습니다</span><Button variant="secondary" size="sm" onClick={onRetry}>다시 시도</Button></div>
      ) : items.length === 0 ? (
        <p className="p-4 text-xs text-muted">비어 있습니다.</p>
      ) : (
        <ol className="flex flex-col py-1" role="list">
          {items.map((r) => {
            const active = r.id === selectedId
            return (
              <li key={r.id}>
                <Link
                  to={`/approvals/${r.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn('mx-2 flex flex-col gap-1 rounded-md px-3 py-2.5 transition-colors', active ? 'bg-accent-soft' : 'hover:bg-surface-2')}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('font-mono text-[13px]', active ? 'text-accent-fg' : 'text-ink')}>{r.version}</span>
                    <TypeBadge type={r.type} />
                    <span className="ml-auto text-[11px] text-muted tnum" title={formatAbsolute(r.windowFrom)}>{dayFmt.format(new Date(r.windowFrom))}</span>
                  </span>
                  <span className="truncate text-[13px] text-ink/85">{r.title}</span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-mono">{r.service}</span>
                    <RiskLabel risk={r.risk} />
                    {r.blocked ? <span className="text-warning">막힘</span> : null}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}

/** 가운데 — 결정에 필요한 것만, 위에서 아래로. 액션 바는 붙어 있다 */
function Body({ r, onReject, onDecided }: { r: Release; onReject: () => void; onDecided: () => void }) {
  const decide = useDecide(r.id)
  const done = r.checklist.filter((c) => c.done).length
  const requiredMissing = r.checklist.filter((c) => c.required && !c.done).length
  const approve = async () => {
    try {
      await decide.mutateAsync({ decision: 'approved' })
      toast.success(`${r.version} 을(를) 승인했습니다`)
      onDecided()
    } catch (e) {
      toast((e as Error).message)
    }
  }
  return (
    <>
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface/95 px-6 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 whitespace-nowrap font-mono text-md font-semibold text-ink">{r.version}</span>
          <span className="shrink-0"><StageBadge stage={r.stage} blocked={r.blocked} /></span>
          <span className="min-w-0 truncate text-sm text-ink/85">{r.title}</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild><Link to={`/releases/${r.id}`}>상세 <ArrowUpRight /></Link></Button>
          <Button variant="secondary" size="sm" onClick={onReject}><ThumbsDown /> 반려…</Button>
          <Button variant="primary" size="sm" onClick={() => void approve()} loading={decide.isPending} disabled={requiredMissing > 0}><ThumbsUp /> 승인</Button>
        </div>
      </div>
      <div className="flex max-w-[72ch] flex-col gap-7 px-6 py-6">
        {requiredMissing > 0 ? (
          <p className="rounded-md border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-ink">필수 체크리스트 {requiredMissing}건이 남아 승인할 수 없습니다. 담당자({r.owner})에게 완료를 요청하십시오.</p>
        ) : null}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink">변경 내용</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-ink/85">
            {r.changes.map((c, i) => <li key={i} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-line-strong" />{c}</li>)}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink">롤백 계획</h2>
          <p className="rounded-md border border-line bg-canvas px-4 py-3 text-sm leading-relaxed text-ink/85">{r.rollback}</p>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">체크리스트</h2>
            <span className={cn('text-xs tnum', done === r.checklist.length ? 'text-success' : 'text-muted')}>{done}/{r.checklist.length}</span>
          </div>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
            {r.checklist.map((c) => (
              <li key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                {c.done ? <CheckCircle2 className="size-4 text-success" /> : <span className="size-4 rounded-full border border-line-strong" aria-hidden />}
                <span className={cn(c.done && 'text-muted line-through')}>{c.label}</span>
                {c.required ? <Badge tone={c.done ? 'neutral' : 'warning'} className="ml-auto">필수</Badge> : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink">승인 현황</h2>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
            {r.approvers.map((a) => (
              <li key={a.name} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-3 py-2.5">
                <Avatar name={a.name} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm text-ink">{a.name === ME ? '나' : a.name} <span className="text-muted">· {a.team}</span></span>
                  {a.comment ? <p className="flex items-start gap-1.5 text-sm text-ink/80"><MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted" />{a.comment}</p> : null}
                </div>
                <span className={cn('text-xs', a.decision === 'approved' ? 'text-success' : a.decision === 'rejected' ? 'text-danger' : 'text-muted')}>
                  {a.decision === 'approved' ? '승인' : a.decision === 'rejected' ? '반려' : '대기 중'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

/** 오른쪽 — 사실들. 본문과 겹치지 않는다 */
function Props({ r }: { r: Release }) {
  const recent = [...r.timeline].reverse().slice(0, 4)
  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-xs text-muted">서비스</dt><dd className="font-mono text-[13px]">{r.service}</dd>
        <dt className="text-xs text-muted">단계</dt><dd>{STAGES.find((s) => s.id === r.stage)?.label}</dd>
        <dt className="text-xs text-muted">위험</dt><dd><RiskLabel risk={r.risk} /></dd>
        <dt className="text-xs text-muted">담당</dt><dd className="inline-flex items-center gap-1.5"><Avatar name={r.owner} />{r.owner} <span className="text-xs text-muted">{r.team}</span></dd>
        <dt className="text-xs text-muted">승인</dt><dd><ApproverStack approvers={r.approvers} /></dd>
        <dt className="text-xs text-muted">배포 창</dt><dd className="text-[13px] leading-snug">{windowFmt.format(new Date(r.windowFrom))}<br /><span className="text-muted">~ {windowFmt.format(new Date(r.windowTo))}</span></dd>
        <dt className="text-xs text-muted">등록</dt><dd title={formatAbsolute(r.createdAt)}>{formatRelative(r.createdAt)}</dd>
      </dl>
      <section className="flex flex-col gap-2 border-t border-line pt-4">
        <h2 className="text-xs font-medium text-muted">최근 활동</h2>
        <ol className="flex flex-col gap-2">
          {recent.map((e, i) => (
            <li key={i} className="flex flex-col text-xs">
              <span className="text-ink">{e.what}</span>
              <span className="text-muted">{e.who} · <span title={formatAbsolute(e.at)}>{formatRelative(e.at)}</span></span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
