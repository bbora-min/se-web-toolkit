/**
 * 개요 — DashboardPage 패턴의 원본.
 *
 * 디자인 플랜
 *  목적       : "지난 24시간 운영이 괜찮았나"를 한 화면에서 답한다. 이상이 있으면 어디인지 가리킨다.
 *  첫 시선    : 상태 스트립(시그니처). 그다음 시간별 완료 막대의 빨간 조각.
 *  주 액션    : 없음(읽는 화면). 모든 블록은 해당 목록으로 이어지는 링크를 가진다.
 *  정보 계층  : 스트립(요약) → [시간별 완료 | 파이프라인 성공률] → [최근 실패 | 노드] → 큐 대기.
 *  차트 규칙  : 성공/실패/취소는 의미 색(고정), 큐 대기 p50/p95는 액센트 순차. 축선 없음, 격자 점선.
 *  액센트     : 스트립 틴트, 스파크라인, 큐 대기 선.
 */
import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Badge, Button, PageBody, PageHeader, Select, Skeleton, StatusBadge, StatusStrip } from '@se/ui'
import { BarChart, ChartCard, LineChart, MeterList, type Series } from '@se/charts'
import { useClusterSummary, useOverview } from '../../api/jobs'
import { formatDuration, formatRelative } from '../../lib/format'

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

export function OverviewPage() {
  const [params, setParams] = useSearchParams()
  const range = params.get('range') === '7d' ? '7d' : '24h'
  const summary = useClusterSummary()
  const ov = useOverview(range)
  const s = summary.data
  const d = ov.data

  return (
    <PageBody>
      <PageHeader
        title="개요"
        description="클러스터 상태와 최근 실행 결과. 이상이 보이면 블록을 눌러 목록으로 들어가세요."
        actions={
          <Select
            aria-label="기간"
            options={[
              { value: '24h', label: '최근 24시간' },
              { value: '7d', label: '최근 7일' },
            ]}
            value={range}
            onChange={(e) => setParams({ range: e.target.value }, { replace: true })}
            className="w-36"
          />
        }
      />

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

      <div className="grid grid-cols-[3fr_2fr] gap-5">
        <ChartCard
          title="시간별 완료"
          description={range === '24h' ? '정시 기준 24시간. 실패는 빨강.' : '시간 단위 7일.'}
          legend={COMPLETION}
          actions={<MoreLink to="/jobs?state=failed">실패만 보기</MoreLink>}
        >
          {d ? (
            <BarChart data={d.hourly} xKey="hour" series={COMPLETION} stacked xFormat={hourLabel} tooltipLabel={fullLabel} xInterval={range === '24h' ? 3 : 23} />
          ) : (
            <Skeleton className="h-[220px]" />
          )}
        </ChartCard>
        <ChartCard title="파이프라인별 성공률" description="낮은 순. 눌러서 해당 파이프라인 잡을 봅니다." actions={<MoreLink to="/jobs">전체</MoreLink>}>
          {d ? (
            <MeterList
              items={d.pipelines.map((p) => ({
                label: <span className="font-mono text-[13px]">{p.name}</span>,
                value: p.successRate,
                display: pct(p.successRate),
                sub: `${p.runs}회 · p50 ${formatDuration(p.p50Sec)}`,
                tone: p.successRate < 90 ? 'danger' : p.successRate < 97 ? 'warning' : 'accent',
                onClick: () => (location.href = `/jobs?pipeline=${p.name}`),
              }))}
            />
          ) : (
            <Skeleton className="h-[220px]" />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-[3fr_2fr] gap-5">
        <ChartCard title="최근 실패" description="가장 최근 5건. 원인은 상세에서." actions={<MoreLink to="/jobs?state=failed">모두 보기</MoreLink>}>
          {d ? (
            d.recentFailures.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">최근 실패한 잡이 없습니다.</p>
            ) : (
              <ul className="flex flex-col">
                {d.recentFailures.map((j) => (
                  <li key={j.id} className="border-b border-line last:border-0">
                    <Link to={`/jobs/${j.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-2.5 transition-colors hover:bg-surface-2/60">
                      <span className="font-mono text-[13px] text-ink">{j.name}</span>
                      <span className="text-xs text-muted">{formatRelative(j.startedAt)}</span>
                      <span className="truncate font-mono text-xs text-muted">{j.error}</span>
                      <StatusBadge state={j.state} />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <Skeleton className="h-[200px]" />
          )}
        </ChartCard>
        <ChartCard title="노드" description="CPU · 메모리 사용률과 실행 중인 잡 수" actions={<MoreLink to="/nodes">노드</MoreLink>}>
          {d ? (
            <ul className="flex flex-col">
              {d.nodes.map((n) => (
                <li key={n.name} className="grid grid-cols-[72px_1fr_1fr_auto] items-center gap-4 border-b border-line py-2.5 text-sm last:border-0">
                  <span className="flex items-center gap-2 font-mono text-[13px]">
                    <span className={['size-1.5 rounded-full', n.status === 'online' ? 'bg-success' : n.status === 'degraded' ? 'bg-warning' : 'bg-danger'].join(' ')} aria-hidden />
                    {n.name}
                  </span>
                  <Usage label="CPU" value={n.cpu} />
                  <Usage label="MEM" value={n.mem} />
                  <Badge>{n.running}개 실행</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="h-[200px]" />
          )}
        </ChartCard>
      </div>

      <ChartCard title="큐 대기 시간" description="잡이 스케줄되고 실행되기까지. p95가 튀면 노드가 부족한 것." legend={QUEUE}>
        {d ? <LineChart data={d.queueWait} xKey="t" series={QUEUE} height={180} xFormat={hourLabel} tooltipLabel={fullLabel} yFormat={sec} tooltipValue={sec} xInterval={range === '24h' ? 3 : 23} /> : <Skeleton className="h-[180px]" />}
      </ChartCard>
    </PageBody>
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
  const tone = value >= 90 ? 'bg-danger' : value >= 75 ? 'bg-warning' : 'bg-line-strong'
  return (
    <span className="flex items-center gap-2">
      <span className="w-8 text-[11px] text-muted">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <span className={`block h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="w-8 text-right font-mono text-xs tnum">{value}%</span>
    </span>
  )
}
