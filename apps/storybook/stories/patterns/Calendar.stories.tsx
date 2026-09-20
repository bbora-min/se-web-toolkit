import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarGrid, toast } from '@se/ui'

/**
 * 일정 골격의 재료 — 월 격자에 이벤트 칩(의미 색)과 구간 빗금(프리즈). 오늘은 액센트 점, 고른 날은 액센트 테두리.
 * 원본 화면은 Release Desk 배포 캘린더(`examples/release-desk/CalendarPage.tsx`).
 */
const meta = { title: '패턴/CalendarGrid', component: CalendarGrid, parameters: { layout: 'padded' } } satisfies Meta<typeof CalendarGrid>
export default meta
type Story = StoryObj<typeof meta>

const EVENTS = [
  { id: 'a', label: 'v4.19.0 dataset-explorer', from: '2026-09-15', tone: 'info' as const },
  { id: 'b', label: 'v4.15.0 release-desk', from: '2026-09-16', tone: 'info' as const },
  { id: 'c', label: 'v4.14.0 dataset-explorer', from: '2026-09-16', tone: 'warning' as const },
  { id: 'd', label: 'v4.18.0-rc3 release-desk', from: '2026-09-18', to: '2026-09-19', tone: 'accent' as const },
  { id: 'e', label: 'v4.20.0 notification', from: '2026-09-15', tone: 'accent' as const },
  { id: 'f', label: 'v4.16.0-rc1 api-gateway', from: '2026-09-19', tone: 'accent' as const },
  { id: 'g', label: 'v4.13.0 billing', from: '2026-09-22', to: '2026-09-23', tone: 'success' as const },
  { id: 'h', label: 'v4.17.0 api-gateway', from: '2026-09-19', tone: 'warning' as const },
  { id: 'i', label: 'v4.12.1 billing', from: '2026-09-19', tone: 'success' as const },
]
const SPANS = [
  { id: 'f1', from: '2026-09-18T18:00:00', to: '2026-09-21T09:00:00', label: '프리즈', tone: 'warning' as const },
  { id: 'f2', from: '2026-09-25T18:00:00', to: '2026-09-28T09:00:00', label: '프리즈', tone: 'warning' as const },
]

export const 월: Story = {
  args: { month: '2026-09', events: EVENTS, spans: SPANS, today: '2026-09-14' },
  render: (args) => {
    const [day, setDay] = React.useState<string | null>('2026-09-14')
    return <CalendarGrid {...args} selected={day} onSelectDay={setDay} onSelectEvent={(e) => toast(`${e.id} 열기`)} />
  },
}
