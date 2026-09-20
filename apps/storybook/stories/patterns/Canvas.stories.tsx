import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas } from '@se/canvas'

/**
 * 캔버스 골격의 재료 — DAG 자동 배치, 상태색 태스크 노드(테두리), 실행 중 간선은 흐른다. 선택은 페이지가 든다.
 * 원본 화면은 Job Monitor 파이프라인(`examples/reference-app/PipelinePage.tsx`).
 */
const meta = { title: '패턴/Canvas', component: Canvas, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Canvas>
export default meta
type Story = StoryObj<typeof meta>

const NODES = [
  { id: 'extract', label: 'extract', state: 'succeeded' as const, meta: '4:12 · wk-01' },
  { id: 'validate', label: 'validate', state: 'succeeded' as const, meta: '0:40 · wk-01' },
  { id: 'transform-a', label: 'transform-a', state: 'succeeded' as const, meta: '12:05 · wk-02' },
  { id: 'transform-b', label: 'transform-b', state: 'running' as const, meta: '9:31 · wk-03' },
  { id: 'load', label: 'load', state: 'pending' as const },
  { id: 'publish', label: 'publish', state: 'pending' as const },
]
const EDGES = [
  { from: 'extract', to: 'validate' },
  { from: 'validate', to: 'transform-a' },
  { from: 'validate', to: 'transform-b' },
  { from: 'transform-a', to: 'load' },
  { from: 'transform-b', to: 'load' },
  { from: 'load', to: 'publish' },
]

export const 파이프라인: Story = {
  args: { nodes: NODES, edges: EDGES },
  render: (args) => {
    const [sel, setSel] = React.useState<string | null>('transform-b')
    return (
      <div className="h-[560px] border-t border-line">
        <Canvas {...args} selectedId={sel} onSelect={setSel} overlay={<span className="rounded-md border border-line bg-surface/90 px-2 py-1 text-[11px] text-muted">선택: {sel ?? '없음'}</span>} />
      </div>
    )
  },
}
