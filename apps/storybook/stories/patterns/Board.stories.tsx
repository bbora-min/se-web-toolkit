import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge, Board, BoardCard, BoardColumn, toast } from '@se/ui'

/**
 * 보드 골격의 재료 — 열 = 상태, 카드 = 항목. 카드를 바로 다음 열로 끌 수 있고(`canMove`), 못 옮기는 열은 흐려진다.
 * 원본 화면은 Release Desk 릴리스 보드(`examples/release-desk/ReleasesBoard.tsx`).
 */
const meta = { title: '패턴/Board', component: Board, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Board>
export default meta
type Story = StoryObj<typeof meta>

const COLS = [
  { id: 'review', label: '코드 검토' },
  { id: 'staging', label: '스테이징 검증' },
  { id: 'approval', label: '승인' },
  { id: 'deploy', label: '배포' },
]
const SEED = [
  { id: 'r1', col: 'review', version: 'v4.19.0', title: 'OAuth 토큰 갱신 버그 수정', owner: 'dohyun', blocked: '' },
  { id: 'r2', col: 'review', version: 'v4.15.0', title: '결제 재시도 큐 도입', owner: 'minseo', blocked: '' },
  { id: 'r3', col: 'staging', version: 'v4.14.0', title: '대시보드 응답 캐시', owner: 'yuna', blocked: '필수 체크리스트 2건' },
  { id: 'r4', col: 'approval', version: 'v4.15.2', title: '감사 로그 보존 기간 연장', owner: 'seoyeon', blocked: '' },
  { id: 'r5', col: 'deploy', version: 'v4.16.0-rc1', title: '검색 인덱스 v3 마이그레이션', owner: 'taeho', blocked: '' },
]

export const 보드: Story = {
  render: () => {
    const [cards, setCards] = React.useState(SEED)
    const next = (col: string) => COLS[COLS.findIndex((c) => c.id === col) + 1]?.id
    return (
      <div className="p-6">
        <Board
          canMove={(id, to) => { const c = cards.find((x) => x.id === id); return Boolean(c) && !c!.blocked && next(c!.col) === to }}
          onMove={(id, to) => { setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: to } : c))); toast(`${id} → ${to}`) }}
        >
          {COLS.map((col) => {
            const mine = cards.filter((c) => c.col === col.id)
            return (
              <BoardColumn key={col.id} id={col.id} title={col.label} count={mine.length} blocked={mine.filter((c) => c.blocked).length}>
                {mine.length === 0 ? <p className="px-1 py-3 text-center text-xs text-muted">없음</p> : null}
                {mine.map((c) => (
                  <BoardCard key={c.id} id={c.id} onOpen={() => toast(`${c.version} 열기`)} draggable={!c.blocked}>
                    <span className="font-mono text-[13px] text-ink">{c.version}</span>
                    <span className="text-[13px] text-ink/85">{c.title}</span>
                    {c.blocked ? <span className="text-xs text-warning">막힘 · {c.blocked}</span> : null}
                    <span className="flex items-center justify-between text-xs text-muted"><span className="inline-flex items-center gap-1.5"><Avatar name={c.owner} />{c.owner}</span><Badge>billing</Badge></span>
                  </BoardCard>
                ))}
              </BoardColumn>
            )
          })}
        </Board>
      </div>
    )
  },
}
