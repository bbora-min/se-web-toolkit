import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, SplitPane } from '@se/ui'

/**
 * 트리아지·콘솔 골격의 재료 — 화면 높이에 고정된 가로 분할. 손잡이를 끌거나(포커스 후 ←→) 폭을 바꾸고, 칸마다 스크롤한다.
 * 원본 화면은 Release Desk 내 승인 대기(`examples/release-desk/ApprovalsPage.tsx`).
 */
const meta = { title: '패턴/SplitPane', component: SplitPane, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof SplitPane>
export default meta
type Story = StoryObj<typeof meta>

const ROWS = ['v4.19.0 · OAuth 토큰 갱신 버그 수정', 'v4.15.0 · 결제 재시도 큐 도입', 'v4.18.0 · 요금제 변경 플로우 개편', 'v4.16.0 · 검색 인덱스 v3', 'v4.17.0 · 이미지 업로드 크기 제한 완화']

export const 삼단: Story = {
  render: () => (
    <div className="h-[640px] border-t border-line">
      <SplitPane
        left={
          <ol className="flex flex-col py-1">
            {ROWS.map((r, i) => (
              <li key={r} className={`mx-2 rounded-md px-3 py-2.5 text-[13px] ${i === 0 ? 'bg-accent-soft text-accent-fg' : 'text-ink/85'}`}>{r}</li>
            ))}
          </ol>
        }
        right={
          <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 px-4 py-4 text-sm">
            <dt className="text-xs text-muted">서비스</dt><dd className="font-mono text-[13px]">dataset-explorer</dd>
            <dt className="text-xs text-muted">위험</dt><dd><Badge tone="danger">높음</Badge></dd>
            <dt className="text-xs text-muted">담당</dt><dd>dohyun</dd>
          </dl>
        }
      >
        <div className="sticky top-0 flex h-14 items-center gap-3 border-b border-line bg-surface px-6">
          <span className="font-mono text-md font-semibold">v4.19.0</span>
          <span className="text-sm text-ink/85">OAuth 토큰 갱신 버그 수정</span>
          <span className="ml-auto flex gap-2"><Button variant="secondary" size="sm">반려…</Button><Button variant="primary" size="sm">승인</Button></span>
        </div>
        <div className="flex flex-col gap-4 px-6 py-6 text-sm text-ink/85">
          {Array.from({ length: 12 }, (_, i) => <p key={i}>본문 문단 {i + 1} — 가운데 칸만 스크롤합니다.</p>)}
        </div>
      </SplitPane>
    </div>
  ),
}
