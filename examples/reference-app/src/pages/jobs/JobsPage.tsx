/**
 * 잡 목록 — ListDetailPage 패턴의 원본.
 *
 * 디자인 플랜
 *  목적       : "지금 괜찮은가"를 3초 안에 답하고, 실패한 잡을 찾아 재시도한다.
 *  첫 시선    : 상태 스트립(시그니처) — 상태 한 줄 + 지표 4개(스파크라인). 그다음 실패 탭의 빨간 카운트.
 *  주 액션    : 드로어의 "재시도"(primary 하나). 페이지 레벨엔 primary 없음.
 *  정보 계층  : 제목 → 스트립(요약) → 상태 탭(1차 분류) → 검색·필터(2차) → 표 → 드로어(상세).
 *  밀도       : comfortable. 행 44px, 컨텐츠 폭 1120px. 숫자 우정렬·tabular, 이름은 mono.
 *  액센트     : 스트립 좌측 틴트, 스파크라인 끝점, 활성 탭 밑줄, 선택 행, primary 버튼.
 *  3상태      : 로딩=스켈레톤 행, 빈=필터 초기화 행동, 에러=원인+다시 시도.
 */
import * as React from 'react'
import { Download, FileText, RefreshCw, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  FilterBar,
  PageBody,
  PageHeader,
  SearchInput,
  Select,
  StatusBadge,
  StatusStrip,
  Tabs,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from '@se/ui'
import { useClusterSummary, useJobs, useRetryJob, type JobFilters } from '../../api/jobs'
import type { Job, JobState } from '../../api/types'
import { formatAbsolute, formatDuration, formatRelative } from '../../lib/format'
import { JobDetailSheet } from './JobDetailSheet'

const TABS: Array<{ value: JobState | ''; label: string; tone?: 'danger' }> = [
  { value: '', label: '전체' },
  { value: 'failed', label: '실패', tone: 'danger' },
  { value: 'running', label: '실행 중' },
  { value: 'pending', label: '대기' },
  { value: 'succeeded', label: '성공' },
  { value: 'cancelled', label: '취소됨' },
]

const columns: ColumnDef<Job, unknown>[] = [
  {
    accessorKey: 'name',
    header: '잡',
    size: 260,
    cell: ({ row }) => <span className="font-mono text-[13px] text-ink">{row.original.name}</span>,
  },
  {
    accessorKey: 'state',
    header: '상태',
    size: 140,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <StatusBadge state={row.original.state} />
        {row.original.attempts > 1 ? <span className="text-xs text-muted">{row.original.attempts}회</span> : null}
      </span>
    ),
  },
  {
    accessorKey: 'pipeline',
    header: '파이프라인',
    size: 140,
    cell: ({ getValue }) => <Badge>{getValue() as string}</Badge>,
  },
  {
    accessorKey: 'owner',
    header: '소유자',
    size: 140,
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-2">
        <Avatar name={getValue() as string} />
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'startedAt',
    header: '시작',
    size: 110,
    cell: ({ getValue }) => {
      const iso = getValue() as string
      return (
        <span className="text-muted" title={formatAbsolute(iso)}>
          {formatRelative(iso)}
        </span>
      )
    },
  },
  {
    accessorKey: 'durationSec',
    header: '소요',
    size: 90,
    meta: { align: 'right' },
    cell: ({ getValue }) => <span className="font-mono text-xs text-ink">{formatDuration(getValue() as number | null)}</span>,
  },
  {
    accessorKey: 'node',
    header: '노드',
    size: 80,
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ getValue }) => <span className="font-mono text-xs text-muted">{getValue() as string}</span>,
  },
]

const pct = (v: number) => `${v.toFixed(1)}%`
const signedPct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%p`

export function JobsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { jobId } = useParams()

  const filters: JobFilters = {
    q: params.get('q') ?? '',
    state: (params.get('state') as JobState | null) ?? '',
    pipeline: params.get('pipeline') ?? '',
  }
  const setFilter = (key: keyof JobFilters, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const hasFilter = Boolean(filters.q || filters.state || filters.pipeline)

  const summary = useClusterSummary()
  const retry = useRetryJob()
  // 탭 카운트는 상태 필터를 뺀 목록 기준 — 탭을 옮겨도 숫자가 흔들리지 않는다
  const base = useJobs({ q: filters.q, pipeline: filters.pipeline })
  const jobs = useJobs(filters)
  const items = jobs.data?.items ?? []
  const baseItems = base.data?.items ?? []
  const counts = (s: JobState | '') => (s ? baseItems.filter((j) => j.state === s).length : baseItems.length)
  const selected = jobId ? items.find((j) => j.id === jobId) ?? null : null

  const open = (job: Job) => navigate({ pathname: `/jobs/${job.id}`, search: params.toString() })
  const close = () => navigate({ pathname: '/jobs', search: params.toString() })

  const s = summary.data
  return (
    <PageBody>
      <PageHeader
        title="잡"
        description="최근 36시간 동안 스케줄된 잡. 실패한 잡은 상세에서 재시도할 수 있습니다."
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Download /> CSV
            </Button>
            {s ? <span className="text-xs text-muted">마지막 갱신 {formatRelative(s.updatedAt)}</span> : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={() => void Promise.all([jobs.refetch(), summary.refetch()])} disabled={jobs.isFetching}>
                  <RefreshCw className={jobs.isFetching ? 'animate-spin' : undefined} /> 새로고침
                </Button>
              </TooltipTrigger>
              <TooltipContent>15초마다 자동 갱신</TooltipContent>
            </Tooltip>
          </>
        }
      />

      <StatusStrip
        variant="compact"
        health={s?.health ?? (summary.isError ? 'down' : 'unknown')}
        headline={s?.headline ?? (summary.isError ? '상태를 가져올 수 없음' : '상태 확인 중…')}
        detail={s ? `노드 ${s.nodesOnline}/${s.nodesTotal}` : summary.isError ? summary.error.message : undefined}
        stats={
          s
            ? [
                { label: '실행 중', value: s.running.value, delta: { value: s.running.delta, period: '어제 대비', upIsGood: null }, trend: s.running.series },
                { label: '대기', value: s.pending.value, delta: { value: s.pending.delta, period: '어제 대비', upIsGood: null }, trend: s.pending.series },
                {
                  label: '24시간 실패',
                  value: s.failed24h.value,
                  tone: s.failed24h.value > 0 ? 'danger' : 'default',
                  delta: { value: s.failed24h.delta, period: '어제 대비', upIsGood: false },
                  trend: s.failed24h.series,
                },
                {
                  label: '성공률',
                  value: pct(s.successRate.value),
                  delta: { value: s.successRate.delta, period: '어제 대비', format: signedPct },
                  trend: s.successRate.series,
                  trendFormat: pct,
                },
              ]
            : [
                { label: '실행 중', value: '—' },
                { label: '대기', value: '—' },
                { label: '24시간 실패', value: '—' },
                { label: '성공률', value: '—' },
              ]
        }
      />

      <section className="flex flex-col gap-4">
        <Tabs
          aria-label="상태"
          items={TABS.map((t) => ({ ...t, count: base.data ? counts(t.value) : undefined }))}
          value={filters.state ?? ''}
          onChange={(v) => setFilter('state', v)}
        />
        <FilterBar
          end={
            hasFilter ? (
              <Button variant="link" size="sm" onClick={() => setParams({}, { replace: true })}>
                필터 초기화
              </Button>
            ) : null
          }
        >
          <SearchInput
            placeholder="잡 이름, ID, 소유자"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            aria-label="잡 검색"
            className="w-72"
          />
          <Select
            aria-label="파이프라인"
            placeholder="모든 파이프라인"
            options={(jobs.data?.pipelines ?? []).map((p) => ({ value: p, label: p }))}
            value={filters.pipeline}
            onChange={(e) => setFilter('pipeline', e.target.value)}
            className="w-48"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={items}
          getRowId={(j) => j.id}
          loading={jobs.isPending}
          error={
            jobs.isError
              ? { title: '잡 목록을 불러오지 못했습니다', description: jobs.error.message, onRetry: () => jobs.refetch() }
              : null
          }
          empty={
            hasFilter
              ? {
                  title: '조건에 맞는 잡이 없습니다',
                  description: '검색어나 필터를 바꿔 보세요.',
                  action: <Button onClick={() => setParams({}, { replace: true })}>필터 초기화</Button>,
                }
              : {
                title: '아직 스케줄된 잡이 없습니다',
                description: '파이프라인이 실행되면 여기에 표시됩니다. 스케줄이 걸려 있는지 먼저 확인해 보세요.',
                action: (
                  <>
                    <Button variant="primary">파이프라인 보기</Button>
                    <Button variant="ghost">스케줄러 문서</Button>
                  </>
                ),
              }
          }
          onRowClick={open}
          isRowSelected={(j) => j.id === jobId}
          rowActions={(j) => (
            <>
              {j.state === 'failed' || j.state === 'cancelled' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="재시도"
                      onClick={() => retry.mutateAsync(j.id).then(() => toast.success('재시도를 큐에 넣었습니다', { description: j.name }))}
                    >
                      <RotateCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>재시도</TooltipContent>
                </Tooltip>
              ) : null}
              {j.state === 'running' || j.state === 'pending' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="취소" onClick={() => open(j)}>
                      <XCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>취소 (상세에서 확인)</TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="로그 보기" onClick={() => open(j)}>
                    <FileText />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>로그 보기</TooltipContent>
              </Tooltip>
            </>
          )}
          initialSorting={[{ id: 'startedAt', desc: true }]}
          pageSize={20}
        />
      </section>

      <JobDetailSheet job={selected} open={Boolean(jobId)} onClose={close} />
    </PageBody>
  )
}
