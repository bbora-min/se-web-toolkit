import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RotateCw, XCircle } from 'lucide-react'
import { Avatar, Badge, Button, DataTable, StatusBadge, formatDuration, formatRelative, type ColumnDef } from '@se/ui'
import type { JobState } from '@se/tokens'

interface Job { id: string; name: string; state: JobState; pipeline: string; owner: string; startedAt: string; durationSec: number | null; node: string | null }

const STATES: JobState[] = ['succeeded', 'pending', 'failed', 'failed', 'running', 'succeeded', 'cancelled']
const JOBS: Job[] = Array.from({ length: 23 }, (_, i) => ({
  id: `etl-daily-${1100 + i}`,
  name: ['etl-daily', 'export-s3', 'report-hourly', 'backfill', 'model-train'][i % 5]!,
  state: STATES[i % STATES.length]!,
  pipeline: ['etl-daily', 'export-s3', 'report-hourly', 'backfill', 'model-train'][i % 5]!,
  owner: ['jihoon', 'minseo', 'bora', 'ml-infra'][i % 4]!,
  startedAt: new Date(Date.now() - (i + 1) * 17 * 60_000).toISOString(),
  durationSec: i % 3 === 1 ? null : 600 + i * 137,
  node: i % 3 === 1 ? null : `wk-0${(i % 4) + 1}`,
}))

const columns: ColumnDef<Job>[] = [
  { accessorKey: 'id', header: '잡', size: 240, cell: ({ getValue }) => <span className="font-mono text-[13px]">{getValue() as string}</span> },
  { accessorKey: 'state', header: '상태', size: 130, cell: ({ getValue }) => <StatusBadge state={getValue() as JobState} /> },
  { accessorKey: 'pipeline', header: '파이프라인', size: 140, cell: ({ getValue }) => <Badge>{getValue() as string}</Badge> },
  { accessorKey: 'owner', header: '소유자', size: 140, cell: ({ getValue }) => <span className="inline-flex items-center gap-2"><Avatar name={getValue() as string} />{getValue() as string}</span> },
  { accessorKey: 'startedAt', header: '시작', size: 110, cell: ({ getValue }) => <span className="text-muted">{formatRelative(getValue() as string)}</span> },
  { accessorKey: 'durationSec', header: '소요', size: 90, meta: { align: 'right' }, cell: ({ getValue }) => <span className="font-mono text-xs">{formatDuration(getValue() as number | null)}</span> },
  { accessorKey: 'node', header: '노드', size: 80, cell: ({ getValue }) => <span className="font-mono text-xs text-muted">{(getValue() as string | null) ?? '—'}</span> },
]

/**
 * 표는 조용하게 — 바깥 테두리 없이 행 구분선만, 텍스트 좌·숫자 우, 상태는 배지. 고정 레이아웃(비율 폭)이라 헤더·본문·빈/에러 행의 열이 항상 같은 자리.
 * 1만 건이 넘으면 서버 모드(`pagination` + `sorting`). 행 액션은 호버에만 보이고, 선택하면 일괄 액션이 뜬다.
 */
const meta = { title: '컴포넌트/DataTable', component: DataTable, parameters: { layout: 'padded' } } satisfies Meta<typeof DataTable>
export default meta
type Story = StoryObj<typeof meta>

const base = {
  columns,
  data: JOBS,
  getRowId: (r: Job) => r.id,
  rowActions: (r: Job) => (
    <>
      {r.state === 'failed' ? <Button size="icon-sm" variant="ghost" aria-label="재시도"><RotateCw /></Button> : null}
      {r.state === 'running' || r.state === 'pending' ? <Button size="icon-sm" variant="ghost" aria-label="취소"><XCircle /></Button> : null}
    </>
  ),
}

export const 기본: Story = { args: { ...base } as never }
export const 선택과_일괄_액션: Story = {
  name: '선택과 일괄 액션',
  args: { ...base } as never,
  render: function Render() {
    const [sel, setSel] = React.useState<Record<string, boolean>>({ 'etl-daily-1102': true, 'etl-daily-1103': true })
    return <DataTable {...base} selection={sel} onSelectionChange={setSel} bulkActions={(rows, clear) => <Button size="sm" variant="secondary" onClick={() => { alert(`${rows.length}건 재시도`); clear() }}><RotateCw /> {rows.length}건 재시도</Button>} />
  },
}
export const 로딩: Story = { args: { ...base, data: [], loading: true } as never }
export const 빈_상태: Story = { name: '빈 상태', args: { ...base, data: [], empty: { title: '조건에 맞는 잡이 없습니다', description: '필터를 바꾸거나 새 잡을 등록하세요', action: <Button size="sm" variant="secondary">필터 초기화</Button> } } as never }
export const 에러: Story = { args: { ...base, data: [], error: { title: '잡 목록을 불러오지 못했습니다', description: '스케줄러 API(scheduler-01)에 연결할 수 없습니다', onRetry: () => alert('재시도') } } as never }
