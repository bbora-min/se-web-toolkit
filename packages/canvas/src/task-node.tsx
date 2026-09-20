import { Handle, Position, type NodeProps } from '@xyflow/react'
import { StatusBadge, cn } from '@se/ui'
import type { JobState } from '@se/tokens'

export interface TaskNodeData extends Record<string, unknown> {
  label: string
  /** 작업 상태 — 브랜드 코어의 상태색. 없으면 회색 */
  state?: JobState
  /** 한 줄 보조 — "1:04 · wk-02" */
  meta?: string
}

const RING: Partial<Record<JobState, string>> = { running: 'border-info', failed: 'border-danger', succeeded: 'border-success/60' }

/**
 * 태스크 노드 — 카드 한 장. 이름(mono) · 상태 배지 · 메타 한 줄. 상태가 테두리 색이 된다(Airflow 관례).
 * 선택은 액센트 링. 핸들은 캔버스 방향을 따른다(LR: 좌 입력 · 우 출력, TB: 위 · 아래).
 */
export function TaskNode({ data, selected, sourcePosition = Position.Right, targetPosition = Position.Left }: NodeProps & { data: TaskNodeData }) {
  return (
    <div
      className={cn(
        'flex min-w-[184px] flex-col gap-1 rounded-md border bg-surface px-3 py-2 text-left shadow-xs transition-[box-shadow,border-color]',
        (data.state && RING[data.state]) || 'border-line',
        selected && 'ring-2 ring-accent/40 border-accent',
      )}
    >
      <Handle type="target" position={targetPosition} className="!size-2 !border-line-strong !bg-surface" />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[13px] text-ink">{data.label}</span>
        {data.state ? <StatusBadge state={data.state} /> : null}
      </div>
      {data.meta ? <span className="truncate text-[11px] text-muted tnum">{data.meta}</span> : null}
      <Handle type="source" position={sourcePosition} className="!size-2 !border-line-strong !bg-surface" />
    </div>
  )
}
