/**
 * 이력 — 끝난 릴리스. 배포됐거나, 반려됐거나, 되돌렸거나. 원장(요약 타일 + 필터 + 표).
 *
 * 디자인 플랜
 *  골격       : 원장. 릴리스 목록과 같은 표 언어(버전 mono · 유형 배지 · 위험 라벨)지만 열이 "결과 · 시각 · 리드타임"으로 바뀐다.
 *  목적       : "이번 달 몇 번 배포했고 몇 번 되돌렸나" · "핫픽스가 잦아지는가" · "지난주 그 배포 누가 승인했지".
 *  첫 시선    : 요약 타일의 롤백·반려 수 → 표의 결과 배지(빨강).
 *  주 액션    : 없음(읽는 화면). 행 → 릴리스 상세(상세가 남아 있는 것만), 없으면 토스트.
 *  정보 계층  : 요약 4 → 필터(서비스 · 결과 · 달) → 표.
 *  밀도       : compact.
 *  3상태      : DataTable 스켈레톤 / "이 조건엔 이력이 없어요" / 원인 + 다시 시도.
 *  톤         : procedural — 문장은 짧고 단정.
 */
import { useNavigate, useSearchParams } from 'react-router'
import { Avatar, Badge, Button, Chip, DataTable, FilterBar, PageBody, PageHeader, Select, StatCard, formatAbsolute, formatDurationLong, toast, useContentWidth, type BadgeProps, type ColumnDef } from '@se/ui'
import { useHistory } from '../../api/releases'
import type { HistoryItem, HistoryResult } from '../../api/types'
import { RiskLabel, TypeBadge } from '../releases/bits'

const RESULT: Record<HistoryResult, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  deployed: { label: '배포됨', tone: 'success' },
  rejected: { label: '반려', tone: 'warning' },
  'rolled-back': { label: '롤백', tone: 'danger' },
}
const RESULTS: Array<{ value: HistoryResult | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'deployed', label: '배포됨' },
  { value: 'rejected', label: '반려' },
  { value: 'rolled-back', label: '롤백' },
]
const monthLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' })
/** 표의 시각은 짧게 — 연도는 달 필터가 말해 준다. 전체는 title 로 */
const shortAt = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
/** 최근 넉 달 — "YYYY-MM" */
function recentMonths(n = 4) {
  const out: Array<{ value: string; label: string }> = []
  const d = new Date()
  for (let i = 0; i < n; i++) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push({ value: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`, label: monthLabel.format(m) })
  }
  return out
}

const columns: ColumnDef<HistoryItem, unknown>[] = [
  {
    accessorKey: 'version',
    header: '릴리스',
    cell: ({ row }) => (
      <span className="flex flex-col gap-0.5">
        <span className="whitespace-nowrap font-mono text-ink">{row.original.version}</span>
        <span className="truncate text-xs text-muted">{row.original.service} · {row.original.title}</span>
      </span>
    ),
  },
  { accessorKey: 'type', header: '유형', size: 96, cell: ({ row }) => <TypeBadge type={row.original.type} /> },
  { accessorKey: 'risk', header: '위험', size: 88, cell: ({ row }) => <RiskLabel risk={row.original.risk} /> },
  {
    accessorKey: 'result',
    header: '결과',
    size: 160,
    cell: ({ row }) => (
      <span className="flex flex-col gap-0.5">
        <Badge tone={RESULT[row.original.result].tone}>{RESULT[row.original.result].label}</Badge>
        {row.original.note ? <span className="truncate text-xs text-muted">{row.original.note}</span> : null}
      </span>
    ),
  },
  { accessorKey: 'owner', header: '담당', size: 120, cell: ({ row }) => <span className="flex items-center gap-2"><Avatar name={row.original.owner} /> {row.original.owner}</span> },
  { id: 'approvers', header: '승인', size: 150, cell: ({ row }) => <span className="block truncate text-xs text-muted" title={row.original.approvers.join(', ')}>{row.original.approvers.join(', ')}</span>, enableSorting: false },
  { accessorKey: 'at', header: '시각', size: 110, cell: ({ row }) => <span className="tnum whitespace-nowrap text-muted" title={formatAbsolute(row.original.at)}>{shortAt.format(new Date(row.original.at))}</span> },
  { accessorKey: 'leadHours', header: '리드타임', size: 110, cell: ({ row }) => <span className="whitespace-nowrap text-muted">{formatDurationLong(row.original.leadHours * 3600)}</span> },
]

export function HistoryPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  useContentWidth(1280)
  const f: { service: string; result: HistoryResult | ''; month: string } = { service: params.get('service') ?? '', result: (params.get('result') as HistoryResult | null) ?? '', month: params.get('month') ?? '' }
  const set = (k: keyof typeof f, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  const hasFilter = Boolean(f.service || f.result || f.month)
  const history = useHistory(f)
  const s = history.data?.stats

  return (
    <PageBody>
      <PageHeader title="이력" description="끝난 릴리스입니다. 배포·반려·롤백과 초안부터 결과까지 걸린 시간을 봅니다." />
      {s ? (
        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label={f.month ? '배포' : '배포 (최근 90일)'} value={s.deployed} />
          <StatCard label="핫픽스" value={s.hotfix} tone={s.deployed && s.hotfix / s.deployed > 0.3 ? 'warning' : 'default'} />
          <StatCard label="반려 · 롤백" value={s.rejected + s.rolledBack} tone={s.rolledBack ? 'danger' : s.rejected ? 'warning' : 'default'} />
          <StatCard label="리드타임 중앙값" value={formatDurationLong(s.medianLeadHours * 3600)} />
        </div>
      ) : null}
      <FilterBar
        end={
          <span className="text-sm text-muted tnum">
            {history.data ? `${history.data.items.length}건` : null}
            {hasFilter ? <>{' · '}<Button variant="link" size="sm" onClick={() => setParams({}, { replace: true })}>필터 초기화</Button></> : null}
          </span>
        }
      >
        <Select aria-label="서비스" placeholder="모든 서비스" options={(history.data?.services ?? []).map((x) => ({ value: x, label: x }))} value={f.service} onChange={(e) => set('service', e.target.value)} className="w-44" />
        <Select aria-label="달" placeholder="최근 90일" options={recentMonths()} value={f.month} onChange={(e) => set('month', e.target.value)} className="w-40" />
        <span className="flex flex-wrap gap-1.5">
          {RESULTS.map((r) => <Chip key={r.value} active={f.result === r.value} onClick={() => set('result', r.value)}>{r.label}</Chip>)}
        </span>
      </FilterBar>
      <DataTable
        columns={columns}
        data={history.data?.items ?? []}
        getRowId={(h) => h.id}
        loading={history.isPending}
        fetching={history.isFetching}
        error={history.isError ? { title: '이력을 불러오지 못했습니다', description: history.error.message, onRetry: () => history.refetch() } : null}
        empty={hasFilter ? { title: '이 조건에 맞는 이력이 없습니다', action: <Button onClick={() => setParams({}, { replace: true })}>필터 초기화</Button> } : { title: '아직 끝난 릴리스가 없습니다', description: '배포·반려·롤백이 생기면 여기에 쌓입니다.' }}
        initialSorting={[{ id: 'at', desc: true }]}
        onRowClick={(h) => (h.releaseId ? navigate(`/releases/${h.releaseId}`) : toast('보존 기간이 지나 상세가 없습니다'))}
      />
    </PageBody>
  )
}
