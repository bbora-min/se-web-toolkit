/**
 * 노드 — 워커 노드의 상태·부하·올라가 있는 잡. 목록 골격(요약 타일 한 줄 + 표).
 *
 * 디자인 플랜
 *  골격       : 목록. 노드는 다섯에서 수십 대 — 표 한 장으로 다 보인다. 상세 패널 대신 행을 누르면 그 노드의 잡 목록으로 간다.
 *  목적       : "어느 노드가 힘든가, 거기 무슨 잡이 도는가"를 10초 안에. 저하 노드가 첫 시선.
 *  첫 시선    : 요약 타일의 저하/오프라인 수 → 표의 상태 배지와 CPU 막대.
 *  주 액션    : 없음(읽는 화면). 행 → 잡 목록(노드 필터), 개요의 노드 타일과 같은 원본.
 *  정보 계층  : 요약 타일 4 → 표(노드 · 상태 · CPU · MEM · 실행 중 · 하트비트 · 24h 추이).
 *  밀도       : compact. CPU·MEM 은 숫자 + 얇은 막대(색은 임계 넘을 때만).
 *  3상태      : 스켈레톤(DataTable) / "등록된 노드가 없어요" / 원인 + 다시 시도.
 *  톤         : terse.
 */
import { useNavigate } from 'react-router'
import { Badge, DataTable, PageBody, PageHeader, Sparkline, StatCard, cn, formatDurationLong, formatRelative, type BadgeProps, type ColumnDef } from '@se/ui'
import { useNodes } from '../../api/jobs'
import type { ClusterNode } from '../../api/types'

const STATUS: Record<ClusterNode['status'], { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  online: { label: '온라인', tone: 'success' },
  degraded: { label: '저하', tone: 'warning' },
  offline: { label: '오프라인', tone: 'danger' },
}

function Load({ value }: { value: number }) {
  const tone = value >= 90 ? 'bg-danger' : value >= 75 ? 'bg-warning' : 'bg-line-strong'
  return (
    <span className="flex items-center gap-2">
      <span className="tnum w-9 text-right">{value}%</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <span className={cn('block h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </span>
    </span>
  )
}

const columns: ColumnDef<ClusterNode, unknown>[] = [
  {
    accessorKey: 'name',
    header: '노드',
    cell: ({ row }) => (
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-ink">{row.original.name}</span>
        <span className="text-[11px] text-muted">{row.original.labels.join(' · ')}</span>
      </span>
    ),
  },
  { accessorKey: 'status', header: '상태', size: 96, cell: ({ row }) => <Badge tone={STATUS[row.original.status].tone}>{STATUS[row.original.status].label}</Badge> },
  { accessorKey: 'cpu', header: 'CPU', size: 130, cell: ({ row }) => <Load value={row.original.cpu} /> },
  { accessorKey: 'mem', header: 'MEM', size: 130, cell: ({ row }) => <Load value={row.original.mem} /> },
  { accessorKey: 'running', header: '실행 중', size: 80, cell: ({ row }) => <span className="tnum">{row.original.running}</span> },
  { accessorKey: 'lastHeartbeat', header: '하트비트', size: 110, cell: ({ row }) => <span className={cn('text-muted', row.original.status === 'degraded' && 'text-warning')}>{formatRelative(row.original.lastHeartbeat)}</span> },
  { accessorKey: 'uptimeSec', header: '가동', size: 110, cell: ({ row }) => <span className="tnum text-muted">{formatDurationLong(row.original.uptimeSec)}</span> },
  { id: 'trend', header: 'CPU 24h', size: 120, cell: ({ row }) => <Sparkline data={row.original.cpuSeries} width={96} height={22} format={(v) => `${Math.round(v)}%`} />, enableSorting: false },
]

export function NodesPage() {
  const navigate = useNavigate()
  const nodes = useNodes()
  const items = nodes.data?.items ?? []
  const count = (s: ClusterNode['status']) => items.filter((n) => n.status === s).length
  const degraded = count('degraded'), offline = count('offline')
  const running = items.reduce((a, n) => a + n.running, 0)
  const avgCpu = items.length ? Math.round(items.reduce((a, n) => a + n.cpu, 0) / items.length) : 0

  return (
    <PageBody>
      <PageHeader title="노드" description="워커 노드의 상태와 부하. 행을 누르면 그 노드에서 도는 잡을 봅니다." />
      {nodes.data ? (
        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label="온라인" value={`${count('online')} / ${items.length}`} />
          <StatCard label="저하 · 오프라인" value={degraded + offline} tone={offline ? 'danger' : degraded ? 'warning' : 'default'} />
          <StatCard label="실행 중 잡" value={running} />
          <StatCard label="평균 CPU" value={`${avgCpu}%`} tone={avgCpu >= 80 ? 'warning' : 'default'} />
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={items}
        getRowId={(n) => n.name}
        loading={nodes.isPending}
        error={nodes.isError ? { title: '노드 목록을 가져올 수 없음', description: nodes.error.message, onRetry: () => nodes.refetch() } : null}
        empty={{ title: '등록된 노드가 없음', description: '스케줄러에 워커가 합류하면 여기에 나타납니다.' }}
        initialSorting={[{ id: 'cpu', desc: true }]}
        onRowClick={(n) => navigate(`/jobs?node=${encodeURIComponent(n.name)}`)}
      />
    </PageBody>
  )
}
