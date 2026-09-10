/**
 * 데이터셋 목록 — ListDetailPage 패턴, 검색 히어로 변형.
 *
 * 디자인 플랜
 *  목적       : 원하는 테이블을 10초 안에 찾아 상세로 들어간다.
 *  첫 시선    : 큰 검색창(시그니처). 그다음 빠른 필터 칩.
 *  주 액션    : 검색. 페이지 레벨 primary 버튼 없음 — 검색창이 곧 주 액션.
 *  정보 계층  : 제목 → 검색 히어로(시그니처+빠른 필터) → 도메인 필터 → 표 → (상세는 별도 페이지).
 *  밀도       : comfortable. 조회 추세 스파크라인으로 "살아있는 테이블"이 보이게.
 *  액센트     : 검색 포커스 링, 활성 칩, 스파크라인 끝점.
 *  톤         : friendly — 빈 상태·힌트 문구는 부드럽게.
 */
import * as React from 'react'
import { ExternalLink, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  FilterBar,
  PageBody,
  PageHeader,
  SearchHero,
  Select,
  Sparkline,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from '@se/ui'
import { useDatasets, type DatasetRow, type Quick } from '../../api/datasets'
import { formatAbsolute, formatBytes, formatCompact, formatRelative } from '../../lib/format'
import { FreshnessBadge } from './freshness'

const QUICK: Array<{ value: Exclude<Quick, ''>; label: string }> = [
  { value: 'mine', label: '내 데이터셋' },
  { value: 'certified', label: '인증됨' },
  { value: 'stale', label: '갱신 지연' },
  { value: 'pii', label: 'PII 포함' },
]

const columns: ColumnDef<DatasetRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: '데이터셋',
    size: 300,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
        <span className="font-mono text-[13px] text-ink">{row.original.name}</span>
        <span className="truncate text-xs text-muted">{row.original.description}</span>
      </div>
    ),
  },
  {
    accessorKey: 'freshness',
    header: '신선도',
    size: 90,
    cell: ({ getValue }) => <FreshnessBadge value={getValue() as DatasetRow['freshness']} />,
  },
  {
    accessorKey: 'tags',
    header: '태그',
    size: 160,
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="flex flex-wrap gap-1">
        {(getValue() as string[]).map((t) => (
          <Badge key={t} tone={t === 'pii' ? 'warning' : t === 'certified' ? 'accent' : 'neutral'}>
            {t}
          </Badge>
        ))}
      </span>
    ),
  },
  {
    accessorKey: 'owner',
    header: '소유자',
    size: 130,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Avatar name={row.original.owner} />
        <span className="flex flex-col leading-tight">
          <span>{row.original.owner}</span>
          <span className="text-xs text-muted">{row.original.team}</span>
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'rows',
    header: '행',
    size: 80,
    meta: { align: 'right' },
    cell: ({ getValue }) => <span className="font-mono text-xs">{formatCompact(getValue() as number)}</span>,
  },
  {
    accessorKey: 'bytes',
    header: '크기',
    size: 80,
    meta: { align: 'right' },
    cell: ({ getValue }) => <span className="font-mono text-xs text-muted">{formatBytes(getValue() as number)}</span>,
  },
  {
    accessorKey: 'updatedAt',
    header: '갱신',
    size: 100,
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
    id: 'trend',
    header: '조회 30일',
    size: 100,
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) => <Sparkline data={row.original.queries30d} width={80} height={22} format={(v) => `${v}회`} />,
  },
]

export function DatasetsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const f = {
    q: params.get('q') ?? '',
    domain: params.get('domain') ?? '',
    quick: (params.get('quick') as Quick | null) ?? '',
  }
  const set = (k: keyof typeof f, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  const hasFilter = Boolean(f.q || f.domain || f.quick)
  const list = useDatasets(f)
  const items = list.data?.items ?? []

  return (
    <PageBody>
      <PageHeader title="데이터셋" description="웨어하우스의 모든 테이블을 한곳에서. 이름·컬럼·소유자·태그로 찾을 수 있어요." />

      <SearchHero
        title="무엇을 찾고 계세요?"
        placeholder="예: clicks, user_id, minseo, certified"
        value={f.q}
        onChange={(v) => set('q', v)}
        hint={list.data ? `${list.data.total.toLocaleString()}개 데이터셋 · ${formatRelative(new Date(Date.now() - 4 * 60_000).toISOString())} 색인` : undefined}
        quick={QUICK.map((q) => ({
          label: q.label,
          count: list.data?.counts[q.value],
          active: f.quick === q.value,
          onClick: () => set('quick', f.quick === q.value ? '' : q.value),
        }))}
      />

      <section className="flex flex-col gap-4">
        <FilterBar
          end={
            <span className="text-sm text-muted tnum">
              {list.data ? `${items.length.toLocaleString()}개` : null}
              {hasFilter ? (
                <>
                  {' · '}
                  <Button variant="link" size="sm" onClick={() => setParams({}, { replace: true })}>
                    필터 초기화
                  </Button>
                </>
              ) : null}
            </span>
          }
        >
          <Select
            aria-label="도메인"
            placeholder="모든 도메인"
            options={(list.data?.domains ?? []).map((d) => ({ value: d, label: d }))}
            value={f.domain}
            onChange={(e) => set('domain', e.target.value)}
            className="w-44"
          />
        </FilterBar>
        <DataTable
          columns={columns}
          data={items}
          getRowId={(d) => d.id}
          loading={list.isPending}
          error={list.isError ? { title: '카탈로그를 불러오지 못했어요', description: list.error.message, onRetry: () => list.refetch() } : null}
          empty={
            hasFilter
              ? { title: '조건에 맞는 데이터셋이 없어요', description: '검색어를 줄이거나 필터를 풀어 보세요.', action: <Button onClick={() => setParams({}, { replace: true })}>필터 초기화</Button> }
              : { title: '아직 등록된 데이터셋이 없어요', description: '카탈로그 색인이 끝나면 여기에 나타납니다.' }
          }
          onRowClick={(d) => navigate(`/datasets/${d.id}`)}
          rowActions={(d) => (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="즐겨찾기" onClick={() => toast('즐겨찾기에 추가했어요', { description: d.name })}>
                    <Star />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>즐겨찾기</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="쿼리 열기" onClick={() => navigate(`/datasets/${d.id}?tab=query`)}>
                    <ExternalLink />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>쿼리 열기</TooltipContent>
              </Tooltip>
            </>
          )}
          pageSize={15}
        />
      </section>
    </PageBody>
  )
}
