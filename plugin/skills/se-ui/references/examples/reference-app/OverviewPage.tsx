// 원본: examples/reference-app/src/pages/overview/OverviewPage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 개요 — 관측 벽(observability wall) 골격의 원본.
 *
 * 디자인 플랜
 *  골격       : 관측 벽. 페이지 제목 없이 12칸 격자를 타일이 채운다(Grafana·Datadog). 형제들의 원장(제목 → 띠 → 표)과 첫 시선부터 다르다.
 *               같은 앱의 잡 목록은 원장 — "고를 땐 표, 볼 땐 벽".
 *  목적       : "지난 24시간 운영이 괜찮았나"를 한 화면에서 답한다. 이상이 있으면 어디인지 가리킨다.
 *  첫 시선    : 상태 스트립(시그니처)의 상태 블록 → 시간별 완료의 빨간 조각 → 임계를 넘은 타일의 점.
 *  주 액션    : 없음(읽는 화면). 툴바의 기간 하나가 모든 타일을 바꾼다. 타일마다 목록으로 가는 링크.
 *  정보 계층  : 툴바(기간·갱신) → 스트립(요약) → [시간별 완료 8 | 파이프라인 성공률 4] → [큐 대기 6 | 실패 원인 3 | 노드 3] → 최근 실패 12.
 *  밀도       : 벽은 촘촘하다 — 격자 간격 12, 타일 패딩 16, 콘텐츠 폭 1440(`useContentWidth`), 바탕은 canvas.
 *  차트 규칙  : 성공/실패/취소는 의미 색(고정), 큐 대기 p50/p95는 액센트 순차. 축선 없음, 격자 점선.
 *  액센트     : 스트립 틴트, 스파크라인, 큐 대기 선. 임계 초과는 의미 색 점(타일 tone).
 *  3상태      : 타일마다 스켈레톤 / 실패 없음 문구 / 개요 실패 시 격자 대신 원인 + 다시 시도 하나(스트립은 /summary 를 따로 든다).
 *  폭         : `useContentWidth(1440)` — 이 페이지가 떠 있는 동안만 쉘이 넓다. 라우트 이름을 쉘이 알 필요 없다.
 */
import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Badge, Button, ErrorState, Select, Skeleton, StatusBadge, StatusStrip, Tile, TileGrid, formatDuration, formatRelative, useContentWidth } from '@se/ui'
import { BarChart, ChartLegend, LineChart, MeterList, type Series } from '@se/charts'
import { useClusterSummary, useOverview } from '../../api/jobs'

const COMPLETION: Series[] = [
  { key: 'succeeded', label: '성공', color: 'success' },
  { key: 'failed', label: '실패', color: 'danger' },
  { key: 'cancelled', label: '취소', color: 'neutral' },
]
const QUEUE: Series[] = [
  { key: 'p50', label: 'p50', color: 'chart-3' },
  { key: 'p95', label: 'p95', color: 'chart-5' },
]

const hourLabel = (v: unknown) => `${new Date(String(v)).getHours()}시`
const fullLabel = (v: unknown) => new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: 'numeric', hour12: false }).format(new Date(String(v)))
const pct = (v: number) => `${v.toFixed(1)}%`
const signedPct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%p`
const sec = (v: number) => `${Math.round(v)}초`
/** 노드 사용률 임계 — 막대 색과 타일 점이 같은 값을 본다 */
const HOT = 90

export function OverviewPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const range = params.get('range') === '7d' ? '7d' : '24h'
  const summary = useClusterSummary()
  const ov = useOverview(range)
  useContentWidth(1440)
  const s = summary.data
  const d = ov.data
  const p95Max = d ? Math.max(...d.queueWait.map((q) => q.p95)) : 0
  const worstPipeline = d ? Math.min(...d.pipelines.map((p) => p.successRate)) : 100
  const hotNodes = d ? d.nodes.filter((n) => n.cpu >= HOT || n.mem >= HOT).length : 0
  const rangeLabel = range === '24h' ? '24시간' : '7일'

  return (
    // 벽은 canvas 위에 — 원장 페이지(surface)와 바탕부터 다르다. 쉘의 패딩을 무르고 전폭으로
    <div className="-mx-6 -mb-16 flex flex-1 flex-col gap-3 border-t border-line bg-canvas px-6 pb-8 pt-3 xl:-mx-8 xl:px-8">
      <h1 className="sr-only">개요</h1>

      {/* 툴바 — 제목 대신. 기간 하나가 벽 전체를 바꾼다 */}
      <div className="flex h-9 items-center gap-3">
        <span className="text-xs font-medium text-muted">클러스터 · production</span>
        <Select
          aria-label="기간"
          options={[
            { value: '24h', label: '최근 24시간' },
            { value: '7d', label: '최근 7일' },
          ]}
          value={range}
          onChange={(e) => setParams({ range: e.target.value }, { replace: true })}
          className="h-8 w-32 text-xs"
        />
        <span className="text-xs text-muted tnum">
          자동 갱신 30초{ov.isFetching ? ' · 갱신 중…' : ov.dataUpdatedAt ? ` · ${formatRelative(new Date(ov.dataUpdatedAt).toISOString())} 갱신` : ''}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <MoreLink to="/jobs?state=failed">실패한 잡</MoreLink>
          <MoreLink to="/jobs">잡 목록</MoreLink>
        </div>
      </div>

      {/* 시그니처 — 벽에서도 첫 줄 */}
      <StatusStrip
        health={s?.health ?? (summary.isError ? 'down' : 'unknown')}
        headline={s?.headline ?? (summary.isError ? '상태를 가져올 수 없음' : '상태 확인 중…')}
        detail={s ? `노드 ${s.nodesOnline}/${s.nodesTotal} 온라인 · ${formatRelative(s.updatedAt)} 갱신됨` : undefined}
        stats={
          s
            ? [
                { label: '실행 중', value: s.running.value, delta: { value: s.running.delta, period: '어제 대비', upIsGood: null }, trend: s.running.series },
                { label: '대기', value: s.pending.value, delta: { value: s.pending.delta, period: '어제 대비', upIsGood: null }, trend: s.pending.series },
                { label: '24시간 실패', value: s.failed24h.value, tone: s.failed24h.value > 0 ? 'danger' : 'default', delta: { value: s.failed24h.delta, period: '어제 대비', upIsGood: false }, trend: s.failed24h.series },
                { label: '성공률', value: pct(s.successRate.value), delta: { value: s.successRate.delta, period: '어제 대비', format: signedPct }, trend: s.successRate.series, trendFormat: pct },
              ]
            : [{ label: '실행 중', value: '—' }, { label: '대기', value: '—' }, { label: '24시간 실패', value: '—' }, { label: '성공률', value: '—' }]
        }
      />

      {ov.isError && !d ? (
        <div className="rounded-md border border-line bg-surface">
          <ErrorState title="개요를 불러오지 못했습니다" description={ov.error.message} action={<Button onClick={() => ov.refetch()}>다시 시도</Button>} />
        </div>
      ) : (
      <TileGrid>
        <Tile span={8} title="시간별 완료" note={range === '24h' ? '정시 기준 24시간. 실패는 빨강' : '시간 단위 7일'} legend={<ChartLegend series={COMPLETION} />} actions={<MoreLink to="/jobs?state=failed">실패만</MoreLink>}>
          {d ? <BarChart data={d.hourly} xKey="hour" series={COMPLETION} stacked height={220} xFormat={hourLabel} tooltipLabel={fullLabel} xInterval={range === '24h' ? 3 : 23} /> : <Skeleton className="h-[220px]" />}
        </Tile>
        <Tile span={4} title="파이프라인 성공률" note="낮은 순" tone={worstPipeline < 90 ? 'danger' : 'default'} actions={<MoreLink to="/jobs">전체</MoreLink>}>
          {d ? (
            <MeterList
              items={d.pipelines.map((p) => ({
                label: <span className="font-mono text-[13px]">{p.name}</span>,
                value: p.successRate,
                display: pct(p.successRate),
                sub: `${p.runs}회 · p50 ${formatDuration(p.p50Sec)}`,
                tone: p.successRate < 90 ? 'danger' : p.successRate < 97 ? 'warning' : 'accent',
                onClick: () => navigate(`/jobs?pipeline=${p.name}`),
              }))}
            />
          ) : (
            <Skeleton className="h-[220px]" />
          )}
        </Tile>

        <Tile span={6} title="큐 대기 시간" note="스케줄 → 실행. p95가 튀면 노드 부족" tone={p95Max > 120 ? 'warning' : 'default'} legend={<ChartLegend series={QUEUE} />}>
          {d ? <LineChart data={d.queueWait} xKey="t" series={QUEUE} height={168} xFormat={hourLabel} tooltipLabel={fullLabel} yFormat={sec} tooltipValue={sec} xInterval={range === '24h' ? 3 : 23} referenceLines={[{ y: 120, label: '목표 p95', color: 'warning' }]} /> : <Skeleton className="h-[168px]" />}
        </Tile>
        <Tile span={3} title="실패 원인" note={`${rangeLabel} · 건수`} actions={<MoreLink to="/jobs?state=failed">잡</MoreLink>}>
          {d ? (
            <MeterList
              items={d.failureCauses.map((c, i) => ({
                label: c.cause,
                value: c.share,
                display: String(c.count),
                tone: i === 0 ? 'danger' : 'neutral',
                onClick: () => navigate(`/jobs?state=failed&q=${encodeURIComponent(c.cause)}`),
              }))}
            />
          ) : (
            <Skeleton className="h-[168px]" />
          )}
        </Tile>
        <Tile span={3} title="노드" note="사용률 % · 실행 중 잡" tone={hotNodes ? 'danger' : 'default'} actions={<MoreLink to="/nodes">노드</MoreLink>}>
          {d ? (
            <ul className="flex flex-col">
              <li className="grid grid-cols-[52px_1fr_1fr_24px] items-center gap-2 pb-1 text-[11px] text-muted" aria-hidden>
                <span /><span>CPU</span><span>MEM</span><span className="text-right">잡</span>
              </li>
              {d.nodes.map((n) => (
                <li key={n.name} className="grid grid-cols-[52px_1fr_1fr_24px] items-center gap-2 border-b border-line py-1.5 text-sm last:border-0">
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <span className={['size-1.5 rounded-full', n.status === 'online' ? 'bg-success' : n.status === 'degraded' ? 'bg-warning' : 'bg-danger'].join(' ')} aria-hidden />
                    {n.name}
                  </span>
                  <Usage label={`${n.name} CPU`} value={n.cpu} />
                  <Usage label={`${n.name} 메모리`} value={n.mem} />
                  <span className="text-right font-mono text-[11px] text-muted tnum" title={`실행 중 잡 ${n.running}개`}>{n.running}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-[168px]" />
          )}
        </Tile>

        <Tile span={12} title="최근 실패" note="가장 최근 5건. 원인은 상세에서" tone={d && d.recentFailures.length ? 'danger' : 'default'} actions={<MoreLink to="/jobs?state=failed">모두 보기</MoreLink>}>
          {d ? (
            d.recentFailures.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">최근 실패한 잡이 없습니다.</p>
            ) : (
              <ul className="flex flex-col">
                {d.recentFailures.map((j) => (
                  <li key={j.id} className="border-b border-line last:border-0">
                    <Link to={`/jobs/${j.id}`} className="grid grid-cols-[200px_1fr_120px_auto] items-center gap-x-4 py-2 transition-colors hover:bg-surface-2/60 max-lg:grid-cols-[160px_1fr_auto]">
                      <span className="truncate font-mono text-[13px] text-ink">{j.name}</span>
                      <span className="truncate font-mono text-xs text-muted">{j.error}</span>
                      <span className="text-xs text-muted max-lg:hidden">{formatRelative(j.startedAt)}</span>
                      <span className="flex items-center gap-2"><Badge>{j.pipeline}</Badge><StatusBadge state={j.state} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <Skeleton className="h-[200px]" />
          )}
        </Tile>
      </TileGrid>
      )}
    </div>
  )
}

function MoreLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Button variant="link" size="sm" asChild>
      <Link to={to}>
        {children} <ArrowRight className="size-3.5" />
      </Link>
    </Button>
  )
}

function Usage({ label, value }: { label: string; value: number }) {
  const tone = value >= HOT ? 'bg-danger' : value >= 75 ? 'bg-warning' : 'bg-line-strong'
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`${label} ${value}%`}>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="w-7 text-right font-mono text-[11px] tnum">{value}</span>
    </span>
  )
}
