// 원본: examples/se-home/src/pages/home/HomePage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 홈 — 허브(Hub) 골격의 원본. 사이드바 없는 상단 네비 쉘 + 큰 검색 + 서비스 카드 + 최근 항목.
 *
 * 디자인 플랜
 *  골격       : 허브. 이 서비스는 "입구"라 목록이 아니라 카드 카탈로그다. 형제 넷이 전부 원장(사이드바)이라 첫 시선부터 달라야 한다.
 *  목적       : "내 팀의 서비스들이 지금 괜찮은가, 내가 하던 일은 어디 있나"를 한 화면에서. 3초 안에 저하·장애 서비스를 가리킨다.
 *  첫 시선    : 인사 아래 상태 한 줄 → 큰 검색 → 리본의 빨간 점(장애) → 카드의 상태 점.
 *  주 액션    : 없음(입구). 검색(⌘K)이 사실상 주 액션. 카드는 통째로 링크.
 *  정보 계층  : 인사·상태 한 줄 → 검색 + 빠른 진입 → 시그니처(가족의 24시간) → 서비스 카드 → [최근 본 것 | 오늘(온콜·공지)].
 *  밀도       : comfortable, 콘텐츠 폭 1200 (카드 3열).
 *  액센트     : 검색 포커스 링, 활성 칩, 리본의 "지금" 선. 카드의 색은 각 서비스의 hue(ServiceMark) — 이 앱의 액센트가 아니다.
 *  3상태      : 카드 스켈레톤 6장 / "아직 등록된 서비스가 없어요 · /se:new" / 원인 + 다시 시도.
 *  톤         : friendly — "~해요".
 */
import * as React from 'react'
import { ArrowRight, ArrowUpRight, Plus, Search } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, Badge, Button, EmptyState, ErrorState, Kbd, PageBody, ServiceMark, Skeleton, TimelineRibbon, formatAbsolute, formatRelative, useShellSearch, type RibbonEvent } from '@se/ui'
import { useHome } from '../../api/home'
import type { Health, RecentKind, Service } from '../../api/types'

const HEALTH: Record<Health, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ok: { label: '정상', tone: 'success' },
  degraded: { label: '저하', tone: 'warning' },
  down: { label: '장애', tone: 'danger' },
}
const KIND_TONE: Record<RecentKind, 'neutral' | 'info' | 'accent' | 'warning' | 'danger'> = { 잡: 'neutral', 데이터셋: 'info', 릴리스: 'accent', 런북: 'neutral', 인시던트: 'danger' }

export function HomePage() {
  const home = useHome()
  const openSearch = useShellSearch()
  const d = home.data
  const byId = React.useMemo(() => new Map((d?.services ?? []).map((s) => [s.id, s])), [d?.services])

  const healthy = d ? d.services.filter((s) => s.health === 'ok').length : 0
  const troubled = d ? d.services.filter((s) => s.health !== 'ok') : []
  const now = d?.generatedAt ?? new Date().toISOString()
  const from = new Date(new Date(now).getTime() - 24 * 3_600_000).toISOString()
  const to = new Date(new Date(now).getTime() + 8 * 3_600_000).toISOString()
  const events: RibbonEvent[] = (d?.events ?? []).map((e) => ({ id: e.id, at: e.at, until: e.until, label: e.label, tone: e.tone, lane: byId.get(e.serviceId)?.name ?? e.serviceId }))
  const deploys = events.filter((e) => e.tone === 'success').length
  const incidents = events.filter((e) => e.tone === 'danger').length

  return (
    <PageBody className="gap-8">
      {/* 인사 + 오늘 상태 한 줄 — 제목이 아니라 문장. 허브는 읽는 화면이 아니라 고르는 화면 */}
      <header className="flex flex-col gap-1.5 pt-6">
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink">안녕하세요{d ? `, ${d.me.name}` : ''}</h1>
        {d ? (
          <p className="text-sm text-muted">
            서비스 {d.services.length}개 중 <span className="font-medium text-ink tnum">{healthy}개</span> 정상
            {troubled.length ? (
              <>
                {' · '}
                {troubled.map((s, i) => (
                  <React.Fragment key={s.id}>
                    {i ? ', ' : ''}
                    <a href={s.url} className={s.health === 'down' ? 'font-medium text-danger' : 'font-medium text-warning'}>{s.name} {HEALTH[s.health].label}</a>
                  </React.Fragment>
                ))}
              </>
            ) : null}
            {' · '}오늘 배포 <span className="tnum">{d.quick.deploysToday}</span>건 · 온콜 <span className="text-ink">{d.oncall.name}</span>
          </p>
        ) : home.isError ? (
          <p className="text-sm text-muted">지금 상태를 불러오지 못했어요. 아래에서 다시 시도할 수 있어요.</p>
        ) : (
          <Skeleton className="h-4 w-96" />
        )}
      </header>

      {/* 검색 — 헤더의 ⌘K 와 같은 팔레트를 연다. 허브에서 검색은 장식이 아니라 주 동선 */}
      <section className="flex flex-col gap-3">
        <Button
          variant="secondary"
          onClick={openSearch}
          className="h-12 w-full justify-start gap-3 rounded-lg px-4 text-md font-normal text-muted hover:text-ink [&_svg]:size-[18px]"
        >
          <Search aria-hidden />
          <span className="flex-1 text-left">서비스, 잡, 데이터셋, 릴리스, 런북, 사람…</span>
          <Kbd>⌘K</Kbd>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">바로 가기</span>
          <QuickChip href="http://localhost:5173/jobs?state=failed" tone="danger" count={d?.quick.failedJobs}>실패 중인 잡</QuickChip>
          <QuickChip href="http://localhost:5175/approvals" count={d?.quick.pendingApprovals}>내 승인 대기</QuickChip>
          <QuickChip href="http://localhost:5175/calendar" count={d?.quick.deploysToday}>오늘 배포</QuickChip>
          {d ? <QuickChip href="http://localhost:5178">온콜 · {d.oncall.name}</QuickChip> : null}
        </div>
      </section>

      {/* 시그니처 — 가족 전체의 지난 24시간. 줄은 서비스 */}
      {home.isPending ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : home.isError ? null : (
        <TimelineRibbon
          from={from}
          to={to}
          now={now}
          events={events}
          lanes={d?.services.map((s) => s.name)}
          laneWidth={112}
          headline={`지난 24시간 · 배포 ${deploys} · 장애 ${incidents}`}
          detail="배포는 초록, 장애는 빨강. 구간은 배포 창·점검"
        />
      )}

      {/* 서비스 카드 — 이 화면의 본체 */}
      <section className="flex flex-col gap-4">
        <SectionHead title="서비스" note="지금 상태와 마지막 배포. 누르면 그 서비스로 가요" to="/services" linkLabel="표로 보기" />
        {home.isError ? (
          <ErrorState title="서비스 목록을 불러오지 못했어요" description={home.error.message} action={<Button onClick={() => home.refetch()}>다시 시도</Button>} />
        ) : home.isPending ? (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[148px] rounded-lg" />)}
          </div>
        ) : d && d.services.length === 0 ? (
          <EmptyState title="아직 등록된 서비스가 없어요" description="툴킷의 identities/registry.json 에 서비스를 등록하면 여기에 카드로 나타나요." action={<Button variant="primary">/se:new 로 첫 서비스 만들기</Button>} />
        ) : (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2">
            {d?.services.map((s) => <ServiceCard key={s.id} service={s} />)}
            <a
              href="https://github.com/bbora-min/se-web-toolkit#readme"
              className="group flex min-h-[148px] flex-col items-start justify-between rounded-lg border border-dashed border-line-strong p-4 text-muted transition-colors hover:border-accent hover:text-accent-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="grid size-8 place-items-center rounded-md bg-surface-2 text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent-fg"><Plus className="size-4" /></span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">새 서비스</span>
                <span className="text-xs">`/se:new` 로 만들면 레지스트리에 등록되고 여기 나타나요</span>
              </span>
            </a>
          </div>
        )}
      </section>

      {/* 최근 본 것 | 오늘 */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 max-lg:grid-cols-1">
        <section className="flex flex-col gap-3">
          <SectionHead title="최근 본 것" note="서비스를 가로질러, 내가 마지막으로 열었던 것" />
          {home.isPending ? (
            <div className="flex flex-col gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : d && d.recent.length ? (
            <ul className="flex flex-col divide-y divide-line">
              {d.recent.map((r) => {
                const svc = byId.get(r.serviceId)
                return (
                  <li key={r.id}>
                    <a href={r.url} className="group flex h-10 items-center gap-3 text-sm transition-colors hover:bg-surface-2/60 -mx-2 rounded-md px-2">
                      <Badge tone={KIND_TONE[r.kind]}>{r.kind}</Badge>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{r.label}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        {svc ? <ServiceMark hue={svc.hue} size="xs">{svc.monogram}</ServiceMark> : null}
                        {svc?.name ?? r.serviceId}
                      </span>
                      <span className="w-16 text-right text-xs text-muted tnum" title={formatAbsolute(r.at)}>{formatRelative(r.at)}</span>
                      <ArrowUpRight className="size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">아직 없어요. 서비스에서 무언가를 열면 여기에 쌓여요.</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="오늘" note="온콜과 알아야 할 것" />
          {home.isPending ? (
            <Skeleton className="h-40 rounded-lg" />
          ) : !d ? (
            <p className="text-sm text-muted">불러오지 못했어요.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
                <Avatar name={d.oncall.name} size="md" />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-sm font-medium text-ink">온콜 · {d.oncall.name} <span className="font-normal text-muted">{d.oncall.team}</span></span>
                  <span className="text-xs text-muted" title={formatAbsolute(d.oncall.until)}>{formatRelative(d.oncall.until)}까지 · 다음 {d.oncall.next.name}</span>
                </div>
                <Button asChild variant="ghost" size="sm"><a href="http://localhost:5178/oncall">교대표</a></Button>
              </div>
              {d.notices.map((n) => (
                <div key={n.id} className={n.kind === 'freeze' ? 'flex flex-col gap-1 rounded-lg border border-warning/30 bg-warning-soft p-3' : 'flex flex-col gap-1 rounded-lg border border-line bg-surface p-3'}>
                  <span className="text-sm font-medium text-ink">{n.title}</span>
                  <span className="text-xs text-muted">{n.detail}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageBody>
  )
}

/** 서비스 카드 — 통째로 링크. 색은 그 서비스의 hue, 상태는 의미 색 */
function ServiceCard({ service: s }: { service: Service }) {
  const h = HEALTH[s.health]
  return (
    <a
      href={s.url}
      className="group flex min-h-[148px] flex-col gap-3 rounded-lg border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center gap-3">
        <ServiceMark hue={s.hue} size="md">{s.monogram}</ServiceMark>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-ink">{s.name}</span>
          <span className="truncate text-xs text-muted">{s.team}</span>
        </div>
        <Badge tone={h.tone}>{h.label}</Badge>
      </div>
      <p className="line-clamp-2 text-[13px] leading-5 text-ink/80">{s.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted">
        <span className={s.health === 'ok' ? 'truncate tnum' : 'truncate font-medium text-ink tnum'}>{s.headline}</span>
        {s.lastDeploy ? (
          <span className="shrink-0 tnum" title={formatAbsolute(s.lastDeploy.at)}>
            <span className="font-mono">{s.lastDeploy.version}</span> · {formatRelative(s.lastDeploy.at)}
          </span>
        ) : null}
      </div>
    </a>
  )
}

function QuickChip({ href, count, tone, children }: { href: string; count?: number; tone?: 'danger'; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs text-ink/80 shadow-xs transition-colors hover:border-line-strong hover:text-ink"
    >
      {children}
      {count !== undefined ? <span className={tone === 'danger' && count > 0 ? 'font-medium text-danger tnum' : 'font-medium text-ink tnum'}>{count.toLocaleString()}</span> : null}
    </a>
  )
}

function SectionHead({ title, note, to, linkLabel }: { title: string; note?: string; to?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <h2 className="text-md font-semibold text-ink">{title}</h2>
        {note ? <span className="text-xs text-muted">{note}</span> : null}
      </div>
      {to ? (
        <Button asChild variant="link" size="sm">
          <Link to={to}>{linkLabel ?? '전체'} <ArrowRight /></Link>
        </Button>
      ) : null}
    </div>
  )
}
