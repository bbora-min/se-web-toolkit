/**
 * 데이터셋 상세 — DetailPage 패턴의 원본 (전체 페이지 + 탭).
 *
 * 디자인 플랜
 *  목적       : 이 테이블을 써도 되는지(신선도·소유자·PII) 판단하고 바로 쿼리한다.
 *  첫 시선    : 이름 + 신선도 배지. 그다음 핵심 사실 5개 한 줄.
 *  주 액션    : "쿼리 열기"(primary 하나).
 *  정보 계층  : 뒤로 → 헤더(이름·배지·태그·설명·액션) → 핵심 사실 → 탭(개요/스키마/계보/쿼리).
 *  액센트     : primary 버튼, 활성 탭 밑줄, 스파크라인 끝점.
 */
import * as React from 'react'
import { ArrowLeft, Copy, ExternalLink, Star } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import {
  Badge,
  Button,
  DescriptionList,
  ErrorState,
  PageBody,
  Skeleton,
  Sparkline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  toast,
} from '@se/ui'
import { BarChart, ChartCard } from '@se/charts'
import { useDataset } from '../../api/datasets'
import type { Dataset } from '../../api/types'
import { formatAbsolute, formatBytes, formatCompact, formatRelative } from '../../lib/format'
import { FreshnessBadge } from './freshness'

const TABS = ['overview', 'schema', 'lineage', 'query'] as const
type Tab = (typeof TABS)[number]

export function DatasetPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'overview'
  const setTab = (t: string) => setParams({ tab: t }, { replace: true })
  const q = useDataset(id)
  const d = q.data

  return (
    <PageBody>
      <div className="pt-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted">
          <Link to="/datasets">
            <ArrowLeft /> 데이터셋
          </Link>
        </Button>
      </div>

      {q.isError ? (
        <ErrorState title="데이터셋을 불러오지 못했어요" description={q.error.message} action={<Button onClick={() => q.refetch()}>다시 시도</Button>} />
      ) : (
        <>
          <header className="flex items-start justify-between gap-6">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {d ? (
                  <>
                    <h1 className="font-mono text-xl font-semibold tracking-tight text-ink">{d.name}</h1>
                    <FreshnessBadge value={d.freshness} />
                    {d.tags.map((t) => (
                      <Badge key={t} tone={t === 'pii' ? 'warning' : t === 'certified' ? 'accent' : 'neutral'}>
                        {t}
                      </Badge>
                    ))}
                  </>
                ) : (
                  <Skeleton className="h-7 w-64" />
                )}
              </div>
              {d ? <p className="max-w-[64ch] text-sm text-muted">{d.description}</p> : <Skeleton className="h-4 w-96" />}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => toast('즐겨찾기에 추가했어요', { description: d?.name })}>
                <Star /> 즐겨찾기
              </Button>
              <Button variant="primary" size="sm" disabled={!d}>
                <ExternalLink /> 쿼리 열기
              </Button>
            </div>
          </header>

          <section className="grid grid-cols-5 gap-6 rounded-lg border border-line bg-surface px-6 py-4 shadow-xs">
            {d ? (
              <>
                <Fact label="소유자" value={d.owner} sub={d.team} />
                <Fact label="행" value={formatCompact(d.rows)} sub={`${d.columns.length}개 컬럼`} />
                <Fact label="크기" value={formatBytes(d.bytes)} />
                <Fact
                  label="마지막 갱신"
                  value={formatRelative(d.updatedAt)}
                  sub={`SLA ${d.slaHours}시간 · ${formatAbsolute(d.updatedAt).replace(/:\d\d$/, '')}`}
                  tone={d.freshness === 'fresh' ? 'default' : d.freshness === 'stale' ? 'warning' : 'danger'}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted">조회 (30일)</span>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-lg font-semibold leading-none tracking-tight">{formatCompact(d.queries30d.reduce((a, b) => a + b, 0))}</span>
                    <Sparkline data={d.queries30d} width={96} height={28} format={(v) => `${v}회`} />
                  </div>
                </div>
              </>
            ) : (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)
            )}
          </section>

          <section className="flex flex-col gap-5">
            <Tabs
              aria-label="상세"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'overview', label: '개요' },
                { value: 'schema', label: '스키마', count: d?.columns.length },
                { value: 'lineage', label: '계보' },
                { value: 'query', label: '쿼리' },
              ]}
            />
            {!d ? (
              <Skeleton className="h-48" />
            ) : tab === 'overview' ? (
              <Overview d={d} />
            ) : tab === 'schema' ? (
              <Schema d={d} />
            ) : tab === 'lineage' ? (
              <Lineage d={d} />
            ) : (
              <Query d={d} />
            )}
          </section>
        </>
      )}
    </PageBody>
  )
}

function Fact({ label, value, sub, tone = 'default' }: { label: string; value: React.ReactNode; sub?: string; tone?: 'default' | 'warning' | 'danger' }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className={['text-lg font-semibold leading-none tracking-tight', tone === 'warning' && 'text-warning', tone === 'danger' && 'text-danger'].filter(Boolean).join(' ')}>
        {value}
      </span>
      {sub ? <span className="truncate text-xs text-muted">{sub}</span> : null}
    </div>
  )
}

const KIND: Record<Dataset['changes'][number]['kind'], { label: string; tone: 'neutral' | 'info' | 'warning' | 'danger' | 'accent' }> = {
  schema: { label: '스키마', tone: 'accent' },
  owner: { label: '소유자', tone: 'neutral' },
  sla: { label: 'SLA', tone: 'info' },
  backfill: { label: '재적재', tone: 'warning' },
  incident: { label: '장애', tone: 'danger' },
}

/**
 * 개요 탭 — "써도 되나"를 판단하는 데 필요한 것만.
 * 상단 사실 행과 겹치는 정보(도메인·소유 팀·SLA)는 반복하지 않는다.
 */
function Overview({ d }: { d: Dataset }) {
  const queries = d.queries30d.map((v, i) => ({
    day: new Date(Date.now() - (29 - i) * 86400_000).toISOString().slice(5, 10).replace('-', '/'),
    queries: v,
  }))
  const piiCols = d.columns.filter((c) => c.pii)
  return (
    <div className="grid grid-cols-[3fr_2fr] gap-6">
      <div className="flex flex-col gap-6">
        <ChartCard title="조회 (30일)" description={`하루 평균 ${Math.round(d.queries30d.reduce((a, b) => a + b, 0) / 30).toLocaleString()}회. 최근 7일은 액센트.`}>
          <BarChart
            data={queries.map((q, i) => ({ ...q, recent: i >= 23 ? q.queries : 0, past: i < 23 ? q.queries : 0 }))}
            xKey="day"
            series={[
              { key: 'past', label: '이전', color: 'neutral' },
              { key: 'recent', label: '최근 7일', color: 'accent' },
            ]}
            stacked
            height={180}
            xInterval={6}
            tooltipValue={(v) => `${v}회`}
          />
        </ChartCard>
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">최근 변경</h3>
          <ol className="flex flex-col">
            {d.changes.map((c, i) => (
              <li key={i} className="grid grid-cols-[88px_auto_1fr_auto] items-baseline gap-3 border-b border-line py-2.5 text-sm last:border-0">
                <span className="text-xs text-muted" title={formatAbsolute(c.at)}>
                  {formatRelative(c.at)}
                </span>
                <Badge tone={KIND[c.kind].tone}>{KIND[c.kind].label}</Badge>
                <span className="text-ink">{c.summary}</span>
                <span className="text-xs text-muted">{c.by}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2 rounded-lg border border-line bg-accent-soft/40 p-4">
          <h3 className="text-sm font-semibold text-ink">쓰기 전에</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-ink/85">
            <li>
              파티션 키는 <code className="rounded-sm bg-surface px-1 py-0.5 font-mono text-xs">dt</code> — 조건 없이 전체 스캔하지 마세요.
            </li>
            <li>어제 파티션은 매일 {d.slaHours}시간 안에 채워져요.</li>
            {piiCols.length ? (
              <li>
                개인정보 컬럼 {piiCols.length}개(<span className="font-mono text-xs">{piiCols.map((c) => c.name).join(', ')}</span>) — 조회 로그가 남아요.
              </li>
            ) : null}
            {d.tags.includes('deprecated') ? <li className="text-warning">곧 폐기 예정이에요. 대체 테이블은 소유자에게 확인하세요.</li> : null}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">자주 쓰는 컬럼</h3>
          <div className="flex flex-wrap gap-1.5">
            {d.columns.slice(0, 6).map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 font-mono text-xs">
                {c.name}
                <span className="text-muted">{c.type}</span>
              </span>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">함께 보는 데이터셋</h3>
          <ul className="flex flex-col gap-1">
            {d.related.map((n) => (
              <li key={n}>
                <Link to={`/datasets/${n}`} className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs transition-colors hover:border-line-strong">
                  {n}
                  <span className="font-sans text-muted">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Schema({ d }: { d: Dataset }) {
  return (
    <div className="border-t border-line">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>컬럼</TableHead>
            <TableHead>타입</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>NULL</TableHead>
            <TableHead data-align="right">NULL 비율</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {d.columns.map((c) => (
            <TableRow key={c.name}>
              <TableCell>
                <span className="inline-flex items-center gap-2 font-mono text-[13px]">
                  {c.name}
                  {c.pii ? <Badge tone="warning">PII</Badge> : null}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted">{c.type}</span>
              </TableCell>
              <TableCell className="text-muted">{c.description ?? '—'}</TableCell>
              <TableCell className="text-muted">{c.nullable ? '허용' : '불가'}</TableCell>
              <TableCell data-align="right">
                <span className="inline-flex items-center justify-end gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-line-strong" style={{ width: `${Math.round(c.nullRate * 100)}%` }} />
                  </span>
                  <span className="w-10 font-mono text-xs">{(c.nullRate * 100).toFixed(0)}%</span>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Lineage({ d }: { d: Dataset }) {
  const Col = ({ title, items, current }: { title: string; items: string[]; current?: boolean }) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">{title}</span>
      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <span className="text-sm text-muted">없음</span>
        ) : (
          items.map((n) => (
            <Link
              key={n}
              to={`/datasets/${n}`}
              className={[
                'rounded-md border px-3 py-2 font-mono text-xs transition-colors',
                current ? 'border-accent bg-accent-soft text-accent-fg' : 'border-line bg-surface hover:border-line-strong',
              ].join(' ')}
            >
              {n}
            </Link>
          ))
        )}
      </div>
    </div>
  )
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-4">
      <Col title="업스트림" items={d.upstream} />
      <span className="pt-8 text-muted">→</span>
      <Col title="이 테이블" items={[d.name]} current />
      <span className="pt-8 text-muted">→</span>
      <Col title="다운스트림" items={d.downstream} />
    </div>
  )
}

function Query({ d }: { d: Dataset }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">시작용 쿼리예요. 붙여 넣고 조건만 바꿔 쓰세요.</span>
        <Button
          size="sm"
          onClick={() => {
            void navigator.clipboard?.writeText(d.sampleQuery)
            toast.success('쿼리를 복사했어요')
          }}
        >
          <Copy /> 복사
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-line bg-canvas p-4 font-mono text-xs leading-relaxed text-ink">{d.sampleQuery}</pre>
    </div>
  )
}
