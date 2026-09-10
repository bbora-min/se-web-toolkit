// 원본: examples/release-desk/src/pages/releases/ReleasesPage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 릴리스 목록 — ListDetailPage 패턴, 단계 레일 변형. 업무 처리 시나리오의 원본.
 *
 * 디자인 플랜
 *  목적       : "지금 어디서 막혀 있나"를 보고, 내가 해야 할 승인으로 간다.
 *  첫 시선    : 단계 레일(시그니처) — 단계별 건수와 막힘. 그다음 프리즈 배너.
 *  주 액션    : "새 릴리스"(primary 하나, 우상단). 승인은 행 액션·상세에서.
 *  정보 계층  : 제목 → 배너 → 레일(1차 분류) → 검색·서비스·기간(2차) → 표 → 상세 페이지.
 *  톤         : procedural — "~되었습니다", "~하십시오".
 */
import * as React from 'react'
import { Copy, Eye, MoreHorizontal, Plus, ThumbsUp, XCircle } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Alert, Avatar, Badge, Button, Combobox, DataTable, DateRangePicker, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
  FilterBar, PageBody, PageHeader, SearchInput, StageRail, Tooltip, TooltipContent, TooltipTrigger, toast, type ColumnDef, type DateRange,
} from '@se/ui'
import { useReleases } from '../../api/releases'
import { SERVICES, type Release, type StageId } from '../../api/types'
import { formatAbsolute, formatRelative } from '@se/ui'
import { ApproverStack, RiskLabel, StageBadge, TypeBadge } from './bits'
import { DecisionDialog } from './DecisionDialog'

const windowLabel = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })

const columns: ColumnDef<Release, unknown>[] = [
  {
    accessorKey: 'version',
    header: '릴리스',
    size: 320,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-ink">{row.original.version}</span>
          <TypeBadge type={row.original.type} />
        </span>
        <span className="truncate text-xs text-muted">{row.original.title}</span>
      </div>
    ),
  },
  { accessorKey: 'service', header: '서비스', size: 140, cell: ({ getValue }) => <Badge>{getValue() as string}</Badge> },
  { accessorKey: 'stage', header: '단계', size: 130, cell: ({ row }) => <StageBadge stage={row.original.stage} blocked={row.original.blocked} /> },
  { id: 'approvers', header: '승인', size: 120, enableSorting: false, cell: ({ row }) => <ApproverStack approvers={row.original.approvers} /> },
  { accessorKey: 'risk', header: '위험', size: 90, cell: ({ getValue }) => <RiskLabel risk={getValue() as Release['risk']} /> },
  {
    accessorKey: 'owner',
    header: '담당',
    size: 120,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2"><Avatar name={row.original.owner} />{row.original.owner}</span>
    ),
  },
  {
    accessorKey: 'windowFrom',
    header: '배포 창',
    size: 130,
    cell: ({ getValue }) => {
      const iso = getValue() as string
      const past = Date.parse(iso) < Date.now()
      return <span className={past ? 'text-muted' : 'text-ink'} title={formatAbsolute(iso)}>{windowLabel.format(new Date(iso))}</span>
    },
  },
]

export function ReleasesPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const f = {
    q: params.get('q') ?? '',
    stage: ((params.get('stage') as StageId | null) ?? '') as StageId | '',
    service: params.get('service') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    mine: params.get('mine') === '1',
  }
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }
  const hasFilter = Boolean(f.q || f.stage || f.service || f.from || f.mine)
  const list = useReleases(f)
  const rail = useReleases({ q: f.q, service: f.service, from: f.from, to: f.to, mine: f.mine })
  // 완료는 맨 아래, 나머지는 배포 창 임박 순
  const items = React.useMemo(() => [...(list.data?.items ?? [])].sort((a, b) => Number(a.stage === 'done') - Number(b.stage === 'done') || a.windowFrom.localeCompare(b.windowFrom)), [list.data])
  const [decide, setDecide] = React.useState<Release | null>(null)
  const range: DateRange | null = f.from && f.to ? { from: f.from, to: f.to } : null
  const freeze = list.data?.freeze

  return (
    <PageBody>
      <PageHeader
        title={f.mine ? '내 승인 대기' : '릴리스'}
        description={f.mine ? '귀하의 승인을 기다리는 릴리스입니다. 검토 후 승인 또는 반려하십시오.' : '진행 중인 모든 릴리스. 단계를 눌러 해당 단계로 좁힐 수 있습니다.'}
        actions={
          <Button variant="primary" asChild>
            <Link to="/releases/new"><Plus /> 새 릴리스</Link>
          </Button>
        }
      />

      {freeze ? (
        <Alert tone="warning" title={`배포 프리즈: ${windowLabel.format(new Date(freeze.from))} 18:00 – ${windowLabel.format(new Date(freeze.to))} 09:00`} action={<Button variant="ghost" size="sm" asChild><Link to="/settings">규칙 보기</Link></Button>}>
          {freeze.reason}. 이 기간의 배포 창은 승인되지 않습니다.
        </Alert>
      ) : null}

      <StageRail
        stages={(rail.data?.stages ?? []).filter((s) => s.id !== 'draft').map((s) => ({ id: s.id, label: s.label, count: s.count, blocked: s.blocked }))}
        value={f.stage || null}
        onChange={(id) => set({ stage: id ?? '' })}
        headline={rail.data ? `${rail.data.stages.filter((s) => s.id !== 'done' && s.id !== 'draft').reduce((a, s) => a + s.count, 0)}건 진행 중` : '—'}
        detail={rail.data ? `막힘 ${rail.data.stages.reduce((a, s) => a + s.blocked, 0)}건 · 이번 주 배포 ${rail.data.stages.find((s) => s.id === 'deploy')?.count ?? 0}건` : undefined}
      />

      <section className="flex flex-col gap-4">
        <FilterBar
          end={
            <span className="text-sm text-muted tnum">
              {list.data ? `${items.length}건` : null}
              {hasFilter ? <> · <Button variant="link" size="sm" onClick={() => setParams({}, { replace: true })}>필터 초기화</Button></> : null}
            </span>
          }
        >
          <SearchInput placeholder="버전, 제목, 담당자" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="릴리스 검색" className="w-64" />
          <Combobox
            options={SERVICES.map((s) => ({ value: s, label: s }))}
            value={f.service || null}
            onChange={(v) => set({ service: v ?? '' })}
            placeholder="모든 서비스"
            className="w-48"
          />
          <DateRangePicker value={range} onChange={(r) => set({ from: r?.from ?? '', to: r?.to ?? '' })} placeholder="배포 창" />
        </FilterBar>

        <DataTable
          columns={columns}
          data={items}
          getRowId={(r) => r.id}
          loading={list.isPending}
          error={list.isError ? { title: '릴리스 목록을 불러오지 못했습니다', description: list.error.message, onRetry: () => list.refetch() } : null}
          empty={
            hasFilter
              ? { title: '조건에 해당하는 릴리스가 없습니다', description: '필터를 조정하거나 초기화하십시오.', action: <Button onClick={() => setParams({}, { replace: true })}>필터 초기화</Button> }
              : { title: '등록된 릴리스가 없습니다', description: '첫 릴리스를 등록하면 단계별 진행 상황이 여기에 표시됩니다.', action: <Button asChild><Link to="/releases/new"><Plus /> 새 릴리스</Link></Button> }
          }
          onRowClick={(r) => navigate(`/releases/${r.id}`)}
          rowActions={(r) => (
            <>
              {r.stage === 'approval' && r.approvers.some((a) => a.name === 'bora' && a.decision === 'pending') ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="승인/반려" onClick={() => setDecide(r)}><ThumbsUp /></Button>
                  </TooltipTrigger>
                  <TooltipContent>승인 / 반려</TooltipContent>
                </Tooltip>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="더 보기"><MoreHorizontal /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => navigate(`/releases/${r.id}`)}><Eye /> 상세 보기</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { void navigator.clipboard?.writeText(`${location.origin}/releases/${r.id}`); toast('링크를 복사했습니다') }}><Copy /> 링크 복사</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => toast('취소 요청은 상세 화면에서 진행하십시오')}><XCircle /> 릴리스 취소</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          pageSize={15}
        />
      </section>

      <DecisionDialog release={decide} onClose={() => setDecide(null)} />
    </PageBody>
  )
}
