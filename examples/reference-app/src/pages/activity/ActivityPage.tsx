/**
 * 활동 — 잡·노드·스케줄에서 일어난 일을 시간순으로. 피드(날짜별 묶음) — 표가 아니라 읽는 목록.
 *
 * 디자인 플랜
 *  골격       : 목록의 변형(피드). 열이 아니라 줄 — 시각 · 종류 점 · 제목 · 부연. 날짜로 묶는다.
 *  목적       : "밤사이 무슨 일이 있었나"를 위에서부터 읽어 내려간다. 실패가 먼저 눈에 띄고, 사람이 한 일(취소·스케줄 변경)엔 누가.
 *  첫 시선    : 오늘 묶음의 빨간 점.
 *  주 액션    : 없음. 줄 → 잡 콘솔(잡 이벤트) · 노드(노드 이벤트) · 잡 목록(파이프라인).
 *  정보 계층  : 종류 칩(건수) → 날짜 헤더 → 줄.
 *  밀도       : compact. 한 줄 높이 고정, 부연은 muted 한 줄.
 *  3상태      : 줄 스켈레톤 6 / "조용해요" / 원인 + 다시 시도.
 *  톤         : terse.
 */
import * as React from 'react'
import { Link } from 'react-router'
import { Button, Chip, EmptyState, ErrorState, PageBody, PageHeader, Skeleton, cn, formatAbsolute } from '@se/ui'
import { useActivity } from '../../api/jobs'
import type { ActivityEvent, ActivityKind } from '../../api/types'

const KINDS: Array<{ value: ActivityKind | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'failed', label: '실패' },
  { value: 'retried', label: '재시도' },
  { value: 'cancelled', label: '취소' },
  { value: 'succeeded', label: '오래 걸린 완료' },
  { value: 'node', label: '노드' },
  { value: 'schedule', label: '스케줄' },
]
const DOT: Record<ActivityKind, string> = { failed: 'bg-danger', retried: 'bg-warning', cancelled: 'bg-line-strong', succeeded: 'bg-success', node: 'bg-info', schedule: 'bg-accent' }
const time = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
const day = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

function dayLabel(iso: string) {
  const d = new Date(iso), today = new Date()
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400_000)
  return diff === 0 ? '오늘' : diff === 1 ? '어제' : day.format(d)
}

function href(e: ActivityEvent) {
  if (e.jobId) return `/jobs/${e.jobId}/logs`
  if (e.node) return '/nodes'
  if (e.pipeline) return `/jobs?pipeline=${encodeURIComponent(e.pipeline)}`
  return null
}

export function ActivityPage() {
  const [kind, setKind] = React.useState<ActivityKind | ''>('')
  const feed = useActivity(kind)
  const groups = React.useMemo(() => {
    const m = new Map<string, ActivityEvent[]>()
    for (const e of feed.data?.items ?? []) {
      const k = dayLabel(e.at)
      m.set(k, [...(m.get(k) ?? []), e])
    }
    return [...m.entries()]
  }, [feed.data])

  return (
    <PageBody>
      <PageHeader title="활동" description="잡 · 노드 · 스케줄에서 일어난 일. 최근 것부터." />
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <Chip key={k.value} active={kind === k.value} count={feed.data?.counts[k.value]} onClick={() => setKind(k.value)}>{k.label}</Chip>
        ))}
      </div>
      {feed.isPending ? (
        <ol className="flex flex-col gap-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-9" />)}</ol>
      ) : feed.isError ? (
        <ErrorState title="활동을 가져올 수 없음" description={feed.error.message} action={<Button onClick={() => feed.refetch()}>다시 시도</Button>} />
      ) : groups.length === 0 ? (
        <EmptyState title="조용함" description={kind ? '이 종류의 활동이 없습니다. 다른 종류를 고르세요.' : '아직 기록된 활동이 없습니다.'} />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([label, items]) => (
            <section key={label} className="flex flex-col gap-1">
              <h2 className="sticky top-14 z-10 bg-canvas py-1 text-xs font-medium uppercase tracking-wider text-muted">{label} <span className="tnum font-normal">· {items.length}</span></h2>
              <ol className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
                {items.map((e) => {
                  const to = href(e)
                  const inner = (
                    <>
                      <span className="tnum w-12 shrink-0 text-muted" title={formatAbsolute(e.at)}>{time.format(new Date(e.at))}</span>
                      <span className={cn('mt-[7px] size-2 shrink-0 rounded-full', DOT[e.kind])} aria-hidden />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-ink">{e.title}{e.who ? <span className="text-muted"> · {e.who}</span> : null}</span>
                        {e.detail ? <span className="truncate text-xs text-muted">{e.detail}</span> : null}
                      </span>
                      {e.pipeline ? <span className="hidden shrink-0 font-mono text-[11px] text-muted sm:inline">{e.pipeline}</span> : null}
                    </>
                  )
                  return (
                    <li key={e.id}>
                      {to ? (
                        <Link to={to} className="flex items-start gap-3 px-3 py-2 text-sm hover:bg-surface-2">{inner}</Link>
                      ) : (
                        <div className="flex items-start gap-3 px-3 py-2 text-sm">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </PageBody>
  )
}
