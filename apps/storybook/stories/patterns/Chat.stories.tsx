import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip, Composer, Message, Prose, Thread, toast } from '@se/ui'

/**
 * 대화 골격의 재료 — 대화 컬럼(`Thread`), 말(`Message`: 사용자 말풍선 · 어시스턴트 평문 + 출처 칩 + 커서), 입력 상자(`Composer`).
 * 원본 화면은 Dataset Explorer 질문(`examples/dataset-explorer/AskPage.tsx`).
 */
const meta = { title: '패턴/Chat', component: Thread, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Thread>
export default meta
type Story = StoryObj<typeof meta>

export const 대화: Story = {
  render: () => {
    const [streaming, setStreaming] = React.useState(false)
    return (
      <div className="flex h-[640px] flex-col border-t border-line">
        <Thread>
          <div className="flex flex-wrap gap-2 pt-4">
            <Chip onClick={() => toast('시작 질문')}>fct.orders_daily 는 언제 갱신돼?</Chip>
            <Chip onClick={() => toast('시작 질문')}>PII 컬럼이 있는 events 테이블은?</Chip>
          </div>
          <Message role="user" meta="방금">fct.orders_daily 는 언제 갱신돼?</Message>
          <Message
            role="assistant"
            mark="DE"
            streaming={streaming}
            citations={[{ id: 'a', label: 'fct.orders_daily', href: '#' }, { id: 'b', label: 'dim.stores', href: '#' }]}
            actions={<span>복사 · 다시 생성</span>}
            meta="방금"
          >
            <Prose className="max-w-none text-[15px] [&_p]:mb-3 [&_p:last-child]:mb-0">
              <p>fct.orders_daily 는 analytics 팀(minseo)이 소유하고, SLA 는 6시간이에요. 마지막 갱신은 1시간 안에 있었고 지금 최신이에요 [1].</p>
              <p>함께 보는 테이블: dim.stores [2].</p>
            </Prose>
          </Message>
        </Thread>
        <Composer onSubmit={(t) => { toast(t); setStreaming(true); setTimeout(() => setStreaming(false), 1500) }} streaming={streaming} onStop={() => setStreaming(false)} autoFocus />
      </div>
    )
  },
}
