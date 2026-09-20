import * as React from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node, type NodeMouseHandler } from '@xyflow/react'
import { cn } from '@se/ui'
import type { JobState } from '@se/tokens'
import { dagLayout } from './layout'
import { TaskNode, type TaskNodeData } from './task-node'

/* ──────────────────────────────────────────────────────────────
 * Canvas — 캔버스(그래프) 골격의 재료. 무한 캔버스에 노드·간선, 떠 있는 컨트롤, 미니맵.
 * 파이프라인 DAG·서비스 의존 맵·토폴로지(Airflow·n8n·Datadog Service Map). 배치는 `dagLayout` 이 자동으로.
 * 색은 전부 토큰: 바탕 canvas, 점 line, 간선 line-strong, 실행 중 간선은 info 로 흐른다. 선택은 페이지가 든다(제어 컴포넌트).
 * ────────────────────────────────────────────────────────────── */

export interface CanvasNode {
  id: string
  label: string
  state?: JobState
  meta?: string
}
export interface CanvasEdge {
  from: string
  to: string
}
export interface CanvasProps {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  /** 층 방향 — 왼쪽→오른쪽(기본) 또는 위→아래 */
  direction?: 'LR' | 'TB'
  /** 미니맵 — 노드가 20개 넘으면 켠다 */
  minimap?: boolean
  className?: string
  /** 우상단 떠 있는 요소(범례·필터) */
  overlay?: React.ReactNode
}

const nodeTypes = { task: TaskNode }

function Inner({ nodes, edges, selectedId, onSelect, direction = 'LR', minimap, className, overlay }: CanvasProps) {
  const rf = useReactFlow()
  const placed = React.useMemo(() => dagLayout(nodes, edges, { direction }), [nodes, edges, direction])
  const rfNodes = React.useMemo<Node<TaskNodeData>[]>(
    () =>
      nodes.map((n) => {
        const p = placed.find((x) => x.id === n.id)!
        return { id: n.id, type: 'task', position: { x: p.x, y: p.y }, data: { label: n.label, state: n.state, meta: n.meta }, selected: n.id === selectedId, draggable: true }
      }),
    [nodes, placed, selectedId],
  )
  const stateOf = React.useMemo(() => new Map(nodes.map((n) => [n.id, n.state])), [nodes])
  const rfEdges = React.useMemo<Edge[]>(
    () =>
      edges.map((e) => {
        const running = stateOf.get(e.from) === 'running'
        const failed = stateOf.get(e.from) === 'failed'
        return {
          id: `${e.from}->${e.to}`,
          source: e.from,
          target: e.to,
          type: 'smoothstep',
          animated: running,
          style: { stroke: running ? 'var(--se-status-info)' : failed ? 'var(--se-status-danger)' : 'var(--se-line-strong)', strokeWidth: 1.5, opacity: failed ? 0.6 : 1 },
        }
      }),
    [edges, stateOf],
  )
  React.useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.12, duration: 200, maxZoom: 1 }), 30)
    return () => clearTimeout(t)
  }, [rf, placed])
  const onNodeClick: NodeMouseHandler = React.useCallback((_, n) => onSelect?.(n.id), [onSelect])

  return (
    <div className={cn('se-canvas relative h-full min-h-0 w-full', className)} style={{ background: 'var(--se-canvas)' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => onSelect?.(null)}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.6}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="var(--se-line)" />
        <Controls showInteractive={false} position="bottom-left" />
        {minimap ? <MiniMap pannable zoomable position="bottom-right" nodeColor={() => 'var(--se-line-strong)'} maskColor="var(--se-canvas)" style={{ background: 'var(--se-surface)' }} /> : null}
      </ReactFlow>
      {overlay ? <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2 [&>*]:pointer-events-auto">{overlay}</div> : null}
    </div>
  )
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  )
}
