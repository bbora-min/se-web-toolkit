/**
 * 배포 캘린더 — 일정(schedule) 골격의 원본. 월 격자 + 프리즈 빗금 + 고른 날의 배포 창 목록.
 *
 * 디자인 플랜
 *  골격       : 일정. 시간이 x축이다 — 같은 릴리스를 표(원장)·보드(흐름)로도 보지만 "언제"는 여기서만 답한다. 프리즈 배너가 여기선 빗금 구간이 된다.
 *  목적       : 이번 달 배포 창이 언제 몰리고, 프리즈에 걸린 게 있는지 본다. 날을 누르면 그날의 창을, 칩을 누르면 릴리스로.
 *  첫 시선    : 오늘(액센트 점) 주변의 칩과 금–월 빗금.
 *  주 액션    : 없음(읽는 화면). "새 릴리스"는 릴리스 화면의 것. 이전·다음 달·오늘.
 *  정보 계층  : 제목·월 이동 → [월 격자 | 고른 날(오늘) 창 목록] → 범례.
 *  밀도       : comfortable. 격자 칸 96px, 칩 3개 + "+n". 폭 1120 그대로.
 *  액센트     : 오늘, 고른 날 테두리. 칩은 단계 색(StageBadge 와 같은 의미 색), 프리즈는 warning 빗금.
 *  3상태      : 격자 스켈레톤 / 그달에 창이 없으면 격자는 남고 오른쪽에 "배포 창이 없습니다" / 원인 + 다시 시도.
 *  톤         : procedural.
 */
import * as React from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Avatar, Badge, Button, CalendarGrid, EmptyState, ErrorState, PageBody, PageHeader, Skeleton, formatAbsolute, ymd, type CalendarEvent, type CalendarSpan } from '@se/ui'
import { useCalendar } from '../../api/releases'
import type { CalendarWindow, StageId } from '../../api/types'
import { RiskLabel, StageBadge, TypeBadge } from '../releases/bits'

/** 단계 → 칩 색. StageBadge 와 같은 의미 색을 쓴다 */
const STAGE_TONE: Record<StageId, 'neutral' | 'info' | 'warning' | 'accent' | 'success'> = { draft: 'neutral', review: 'info', staging: 'warning', approval: 'accent', deploy: 'accent', done: 'success' }
const timeFmt = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
const monthLabel = (ym: string) => { const [y, m] = ym.split('-'); return `${y}년 ${Number(m)}월` }
const shiftMonth = (ym: string, n: number) => { const [y, m] = ym.split('-').map(Number) as [number, number]; const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

export function CalendarPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const today = ymd(new Date())
  const month = /^\d{4}-\d{2}$/.test(params.get('month') ?? '') ? params.get('month')! : today.slice(0, 7)
  const selected = params.get('day') ?? (today.startsWith(month) ? today : `${month}-01`)
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }
  const cal = useCalendar(month)
  const d = cal.data

  const events: CalendarEvent[] = React.useMemo(
    // 칸이 좁다 — 칩엔 버전만, 서비스·제목은 툴팁과 오른쪽 카드에
    () => (d?.windows ?? []).map((w) => ({ id: w.releaseId, from: w.from, to: w.to, tone: STAGE_TONE[w.stage], label: <span className="font-mono">{w.version}</span>, title: `${w.version} · ${w.service} · ${w.title}` })),
    [d?.windows],
  )
  const spans: CalendarSpan[] = React.useMemo(() => (d?.freezes ?? []).map((f, i) => ({ id: `f${i}`, from: f.from, to: f.to, label: '프리즈', tone: 'warning' as const })), [d?.freezes])
  const dayWindows = (d?.windows ?? []).filter((w) => ymd(new Date(w.from)) <= selected && ymd(new Date(w.to)) >= selected)
  const freezeOfDay = (d?.freezes ?? []).find((f) => ymd(new Date(f.from)) <= selected && ymd(new Date(f.to)) >= selected)

  return (
    <PageBody>
      <PageHeader
        title="배포 캘린더"
        description="배포 창이 언제 몰리는지, 프리즈에 걸린 것이 있는지 봅니다. 날을 누르면 그날의 창을, 칩을 누르면 릴리스로 이동합니다."
        actions={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="이전 달" onClick={() => set({ month: shiftMonth(month, -1), day: '' })}><ChevronLeft /></Button>
            <span className="w-24 text-center text-sm font-medium text-ink tnum">{monthLabel(month)}</span>
            <Button variant="ghost" size="icon-sm" aria-label="다음 달" onClick={() => set({ month: shiftMonth(month, 1), day: '' })}><ChevronRight /></Button>
            <Button variant="secondary" size="sm" onClick={() => set({ month: '', day: '' })} disabled={month === today.slice(0, 7) && selected === today}>오늘</Button>
          </div>
        }
      />

      {cal.isError ? (
        <ErrorState title="캘린더를 불러오지 못했습니다" description={cal.error.message} action={<Button onClick={() => cal.refetch()}>다시 시도</Button>} />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-lg:grid-cols-1">
          <div className="flex flex-col gap-3">
            {cal.isPending ? (
              <Skeleton className="h-[560px] rounded-lg" />
            ) : (
              <CalendarGrid month={month} events={events} spans={spans} selected={selected} today={today} onSelectDay={(day) => set({ day })} onSelectEvent={(ev) => navigate(`/releases/${ev.id}`)} />
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent-soft ring-1 ring-inset ring-accent/40" aria-hidden />승인 · 배포</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-warning-soft ring-1 ring-inset ring-warning/40" aria-hidden />스테이징 검증</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-info-soft ring-1 ring-inset ring-info/40" aria-hidden />코드 검토</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-success-soft ring-1 ring-inset ring-success/40" aria-hidden />완료</span>
              <span className="flex items-center gap-1.5"><span className="se-cal-span-warning size-2.5 rounded-sm ring-1 ring-inset ring-warning/40" aria-hidden />프리즈 (금 18:00 – 월 09:00)</span>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-ink">{dayFmt.format(new Date(`${selected}T00:00:00`))}</h2>
              <span className="text-xs text-muted tnum">{cal.isPending ? '' : `${dayWindows.length}건`}</span>
            </div>
            {freezeOfDay ? <p className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-ink">프리즈 — {freezeOfDay.reason}. 이 기간의 배포 창은 승인되지 않습니다.</p> : null}
            {cal.isPending ? (
              <div className="flex flex-col gap-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
            ) : dayWindows.length === 0 ? (
              <EmptyState title="배포 창이 없습니다" description="이날 잡힌 배포 창이 없습니다. 다른 날을 누르거나 릴리스에서 창을 잡으십시오." action={<Button asChild variant="secondary"><Link to="/releases/new">새 릴리스</Link></Button>} />
            ) : (
              <ul className="flex flex-col gap-2">
                {dayWindows.map((w) => <WindowCard key={w.releaseId} w={w} />)}
              </ul>
            )}
          </aside>
        </div>
      )}
    </PageBody>
  )
}

function WindowCard({ w }: { w: CalendarWindow }) {
  return (
    <li>
      <Link to={`/releases/${w.releaseId}`} className="group flex flex-col gap-1.5 rounded-md border border-line bg-surface p-3 transition-colors hover:border-line-strong">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-ink">{w.version}</span>
          <TypeBadge type={w.type} />
          <ArrowUpRight className="ml-auto size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        </span>
        <span className="truncate text-[13px] text-ink/85">{w.title}</span>
        <span className="flex items-center gap-2 text-xs text-muted">
          <Badge>{w.service}</Badge>
          <StageBadge stage={w.stage} blocked={w.blocked} />
          <RiskLabel risk={w.risk} />
        </span>
        <span className="flex items-center gap-2 text-xs text-muted">
          <Avatar name={w.owner} />{w.owner}
          <span className="ml-auto tnum" title={`${formatAbsolute(w.from)} ~ ${formatAbsolute(w.to)}`}>{timeFmt.format(new Date(w.from))} – {timeFmt.format(new Date(w.to))}</span>
        </span>
      </Link>
    </li>
  )
}
