import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, Tile, TileGrid } from '@se/ui'

/**
 * 관측 벽 골격의 재료 — 12칸 격자와 타일. 페이지 제목 없이 타일이 화면을 채운다.
 * 바탕은 canvas, 타일은 surface. 1024 이하에서 `spanNarrow` 로 접힌다. 원본 화면은 Job Monitor 개요(`examples/reference-app/OverviewPage.tsx`).
 */
const meta = { title: '패턴/TileGrid', component: TileGrid, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof TileGrid>
export default meta
type Story = StoryObj<typeof meta>

const Body = ({ h }: { h: number }) => <Skeleton className="w-full rounded-sm" style={{ height: h }} />

export const 벽: Story = {
  render: () => (
    <div className="bg-canvas p-6">
      <TileGrid>
        <Tile span={8} title="시간별 완료" note="정시 기준 24시간" actions={<span className="text-xs text-accent-fg">실패만 →</span>}><Body h={200} /></Tile>
        <Tile span={4} title="파이프라인 성공률" note="낮은 순" tone="danger"><Body h={200} /></Tile>
        <Tile span={6} title="큐 대기 시간" tone="warning"><Body h={150} /></Tile>
        <Tile span={3} title="실패 원인"><Body h={150} /></Tile>
        <Tile span={3} title="노드"><Body h={150} /></Tile>
        <Tile span={12} title="최근 실패" note="가장 최근 5건"><Body h={120} /></Tile>
      </TileGrid>
    </div>
  ),
}
