// 원본: examples/se-home/src/pages/services/ServicesPage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 서비스 — 목록 골격(표). 홈의 카드와 같은 데이터를 비교하기 좋게 한 줄씩.
 *
 * 디자인 플랜
 *  골격       : 목록. 홈이 허브(카드)라 같은 앱 안에서 골격이 갈린다 — "고를 땐 카드, 비교할 땐 표".
 *  목적       : 형제 서비스의 아이덴티티(hue·쉘·시그니처)와 운영 상태를 한 표에서 비교한다.
 *  첫 시선    : 상태 열의 빨간 배지.
 *  주 액션    : 없음. 행을 누르면 그 서비스로.
 *  정보 계층  : 제목 → 표. 시그니처는 홈에만(허브의 얼굴은 하나).
 *  밀도       : comfortable.
 *  3상태      : DataTable 의 것.
 *  톤         : friendly.
 */
import { ArrowUpRight } from 'lucide-react'
import { Avatar, Badge, Button, DataTable, PageBody, PageHeader, ServiceMark, formatAbsolute, formatRelative, type ColumnDef } from '@se/ui'
import { useHome } from '../../api/home'
import type { Health, Service } from '../../api/types'
import { HEALTH } from '../../lib/health'

const EMPTY: Service[] = []
const SHELL: Record<Service['shell'], string> = { sidebar: '사이드바', topnav: '상단 네비', panes: '패널' }

const columns: ColumnDef<Service, unknown>[] = [
  { accessorKey: 'name', header: '서비스', size: 220, cell: ({ row }) => <span className="inline-flex items-center gap-2.5"><ServiceMark hue={row.original.hue}>{row.original.monogram}</ServiceMark><span className="font-medium text-ink">{row.original.name}</span></span> },
  { accessorKey: 'health', header: '상태', size: 90, cell: ({ getValue }) => { const h = HEALTH[getValue() as Health]; return <Badge tone={h.tone}>{h.label}</Badge> } },
  { accessorKey: 'headline', header: '지금', size: 240, cell: ({ getValue }) => <span className="text-muted tnum">{getValue() as string}</span> },
  { accessorKey: 'hue', header: 'hue', size: 70, meta: { align: 'right' }, cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as number}°</span> },
  { accessorKey: 'shell', header: '쉘', size: 100, cell: ({ getValue }) => SHELL[getValue() as Service['shell']] },
  { accessorKey: 'signature', header: '시그니처', size: 130, cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
  { accessorKey: 'owner', header: '담당', size: 190, cell: ({ row }) => <span className="inline-flex items-center gap-2 whitespace-nowrap"><Avatar name={row.original.owner} />{row.original.owner} <span className="text-xs text-muted">{row.original.team}</span></span> },
  { id: 'deploy', header: '마지막 배포', size: 150, cell: ({ row }) => { const d = row.original.lastDeploy; return d ? <span title={formatAbsolute(d.at)}><span className="font-mono text-xs">{d.version}</span> <span className="text-muted">{formatRelative(d.at)}</span></span> : <span className="text-muted">—</span> } },
  { id: 'open', header: '', size: 60, cell: ({ row }) => <Button asChild variant="ghost" size="icon-sm" aria-label={`${row.original.name} 열기`}><a href={row.original.url} onClick={(e) => e.stopPropagation()}><ArrowUpRight /></a></Button> },
]

export function ServicesPage() {
  const home = useHome()
  const services = home.data?.services ?? EMPTY
  return (
    <PageBody>
      <PageHeader title="서비스" description="레지스트리에 등록된 SE 서비스 전부. 아이덴티티와 지금 상태를 나란히 비교해요." />
      <DataTable
        columns={columns}
        data={services}
        getRowId={(s) => s.id}
        loading={home.isPending}
        fetching={home.isFetching}
        error={home.isError ? { title: '서비스 목록을 불러오지 못했어요', description: home.error.message, onRetry: () => home.refetch() } : null}
        empty={{ title: '아직 등록된 서비스가 없어요', description: '툴킷의 identities/registry.json 에 등록하면 나타나요.' }}
        onRowClick={(s) => window.location.assign(s.url)}
      />
    </PageBody>
  )
}
