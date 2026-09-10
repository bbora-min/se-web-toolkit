/**
 * 항목 목록 — ListDetailPage 패턴의 출발점. /se:spec 이 실제 도메인으로 바꾼다.
 *
 * 디자인 플랜
 *  목적       : (여기에 이 화면이 답하는 단 하나의 질문)
 *  첫 시선    : 시그니처 → 상태 탭의 카운트
 *  주 액션    : 없음 — 행 액션과 드로어에서
 *  정보 계층  : 제목 → 시그니처 → 상태 탭 → 검색 → 표 → 드로어
 *  밀도       : se.identity.json의 density, 컨텐츠 폭 1120
 *  액센트     : 시그니처·활성 탭·선택 행
 *  3상태      : 스켈레톤 / 필터 초기화 / 원인 + 다시 시도
 *  톤         : se.identity.json의 tone
 */
import * as React from 'react'
import { RefreshCw } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import {
  Avatar, Badge, Button, DataTable, DescriptionList, FilterBar, PageBody, PageHeader, SearchInput,
  Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, Tabs, formatAbsolute, formatRelative,
  type ColumnDef,
} from '@se/ui'
import { useItems } from '../../api/items'
import type { Item, ItemState } from '../../api/types'
import { Signature } from './Signature'

const STATE: Record<ItemState, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  active: { label: '활성', tone: 'success' },
  paused: { label: '일시중지', tone: 'warning' },
  error: { label: '오류', tone: 'danger' },
}
const TABS: Array<{ value: ItemState | ''; label: string; tone?: 'danger' }> = [
  { value: '', label: '전체' },
  { value: 'error', label: '오류', tone: 'danger' },
  { value: 'active', label: '활성' },
  { value: 'paused', label: '일시중지' },
]

const columns: ColumnDef<Item, unknown>[] = [
  { accessorKey: 'name', header: '이름', size: 240, cell: ({ getValue }) => <span className="font-mono text-[13px]">{getValue() as string}</span> },
  { accessorKey: 'state', header: '상태', size: 120, cell: ({ getValue }) => { const s = STATE[getValue() as ItemState]; return <Badge tone={s.tone}>{s.label}</Badge> } },
  { accessorKey: 'owner', header: '담당', size: 140, cell: ({ getValue }) => <span className="inline-flex items-center gap-2"><Avatar name={getValue() as string} />{getValue() as string}</span> },
  { accessorKey: 'count', header: '건수', size: 100, meta: { align: 'right' }, cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as number).toLocaleString()}</span> },
  { accessorKey: 'updatedAt', header: '갱신', size: 120, cell: ({ getValue }) => { const iso = getValue() as string; return <span className="text-muted" title={formatAbsolute(iso)}>{formatRelative(iso)}</span> } },
]

export function ItemsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { id } = useParams()
  const page = Number(params.get('page') ?? 0)
  const f = { q: params.get('q') ?? '', state: (params.get('state') as ItemState | '') ?? '', page, pageSize: 25 }
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }
  const hasFilter = Boolean(f.q || f.state)
  // 검색어는 로컬 상태 → 300ms 뒤 URL. 글자마다 요청을 보내지 않는다
  const [q, setQ] = React.useState(f.q)
  React.useEffect(() => {
    if (q === f.q) return
    const t = setTimeout(() => set({ q, page: '' }), 300)
    return () => clearTimeout(t)
  }, [q]) // f.q·set 은 의도적으로 제외 — 검색어가 바뀔 때만
  const list = useItems(f)
  const items = list.data?.items ?? []
  const selected = id ? items.find((it) => it.id === id) ?? null : null

  return (
    <PageBody>
      <PageHeader
        title="항목"
        description="이 화면은 출발점입니다. /se:spec 으로 실제 도메인을 정하고 /se:page 로 바꾸십시오."
        actions={<Button size="sm" onClick={() => list.refetch()} disabled={list.isFetching}><RefreshCw className={list.isFetching ? 'animate-spin' : undefined} /> 새로고침</Button>}
      />
      <Signature counts={list.data?.counts} />
      <section className="flex flex-col gap-4">
        <Tabs aria-label="상태" items={TABS.map((t) => ({ ...t, count: list.data?.counts[t.value] ?? undefined }))} value={f.state} onChange={(v) => set({ state: v, page: '' })} />
        <FilterBar end={hasFilter ? <Button variant="link" size="sm" onClick={() => setParams({}, { replace: true })}>필터 초기화</Button> : null}>
          <SearchInput placeholder="이름, 담당" value={q} onChange={(e) => setQ(e.target.value)} aria-label="검색" className="w-72" />
        </FilterBar>
        <DataTable
          columns={columns}
          data={items}
          getRowId={(it) => it.id}
          loading={list.isPending}
          fetching={list.isFetching}
          error={list.isError ? { title: '목록을 불러오지 못했습니다', description: list.error.message, onRetry: () => list.refetch() } : null}
          empty={hasFilter ? { title: '조건에 맞는 항목이 없습니다', description: '필터를 바꿔 보십시오.', action: <Button onClick={() => setParams({}, { replace: true })}>필터 초기화</Button> } : { title: '아직 항목이 없습니다', description: '데이터가 들어오면 여기에 표시됩니다.' }}
          pagination={{ pageIndex: page, pageSize: 25, total: list.data?.total ?? 0, onChange: (p) => set({ page: p.pageIndex ? String(p.pageIndex) : '' }) }}
          onRowClick={(it) => navigate({ pathname: `/items/${it.id}`, search: params.toString() })}
          isRowSelected={(it) => it.id === id}
        />
      </section>
      <Sheet open={Boolean(id)} onOpenChange={(o) => !o && navigate({ pathname: '/items', search: params.toString() })}>
        <SheetContent aria-describedby={undefined}>
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono text-xs">{selected.id}</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <DescriptionList columns={2} items={[
                  { label: '상태', value: STATE[selected.state].label },
                  { label: '담당', value: selected.owner },
                  { label: '건수', value: selected.count.toLocaleString() },
                  { label: '갱신', value: formatAbsolute(selected.updatedAt) },
                ]} />
              </SheetBody>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageBody>
  )
}
