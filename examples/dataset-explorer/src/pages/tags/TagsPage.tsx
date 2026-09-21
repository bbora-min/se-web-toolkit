/**
 * 태그 — 태그가 무엇을 뜻하고 몇 개에 붙어 있나. 원장(표 한 장).
 *
 * 디자인 플랜
 *  골격       : 원장. 태그는 열 개 남짓 — 표로 충분하고, 뜻(규약)을 한 줄씩 읽게 하는 게 핵심.
 *  목적       : "certified 가 정확히 무슨 뜻이지" · "deprecated 인데 아직 지연되는 게 있나".
 *  첫 시선    : 태그 배지와 그 옆의 뜻.
 *  주 액션    : 행 → 데이터셋 목록(태그 필터).
 *  정보 계층  : 표(태그 · 뜻 · 데이터셋 수 · 지연 · 도메인).
 *  밀도       : comfortable.
 *  3상태      : DataTable 의 스켈레톤 / 빈 상태 / 오류.
 *  톤         : friendly.
 */
import { useNavigate } from 'react-router'
import { Badge, DataTable, PageBody, PageHeader, type BadgeProps, type ColumnDef } from '@se/ui'
import { useTags } from '../../api/datasets'
import type { TagSummary } from '../../api/types'

const TONE: Record<string, NonNullable<BadgeProps['tone']>> = { pii: 'warning', deprecated: 'danger', experimental: 'info', certified: 'success', 'tier-1': 'accent', gdpr: 'warning', core: 'accent' }

const columns: ColumnDef<TagSummary, unknown>[] = [
  { accessorKey: 'name', header: '태그', cell: ({ row }) => <Badge tone={TONE[row.original.name] ?? 'neutral'}>{row.original.name}</Badge> },
  { accessorKey: 'description', header: '뜻', cell: ({ row }) => <span className="text-ink/85">{row.original.description || <span className="text-muted">설명 없음</span>}</span>, enableSorting: false },
  { accessorKey: 'count', header: '데이터셋', cell: ({ row }) => <span className="tnum">{row.original.count}</span> },
  { accessorKey: 'stale', header: '갱신 지연', cell: ({ row }) => <span className={row.original.stale ? 'tnum text-warning' : 'tnum text-muted'}>{row.original.stale}</span> },
  { id: 'domains', header: '도메인', cell: ({ row }) => <span className="font-mono text-[12px] text-muted">{row.original.domains.join(' · ')}</span>, enableSorting: false },
]

export function TagsPage() {
  const navigate = useNavigate()
  const tags = useTags()
  return (
    <PageBody>
      <PageHeader title="태그" description="태그는 규약이에요. 무슨 뜻인지, 몇 개에 붙어 있는지 봐요. 행을 누르면 그 태그의 데이터셋만 보여요." />
      <DataTable
        columns={columns}
        data={tags.data?.items ?? []}
        getRowId={(t) => t.name}
        loading={tags.isPending}
        error={tags.isError ? { title: '태그를 불러오지 못했어요', description: tags.error.message, onRetry: () => tags.refetch() } : null}
        empty={{ title: '아직 태그가 없어요', description: '데이터셋에 태그를 달면 여기에 모여요.' }}
        initialSorting={[{ id: 'count', desc: true }]}
        onRowClick={(t) => navigate(`/datasets?tag=${encodeURIComponent(t.name)}`)}
      />
    </PageBody>
  )
}
