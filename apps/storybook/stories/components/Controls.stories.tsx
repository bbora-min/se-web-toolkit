import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Download, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Badge, Button, CheckboxField, FilterBar, Input, SearchInput, Select, StatusBadge, SwitchRow, Tabs, Textarea } from '@se/ui'

const meta = { title: '컴포넌트/컨트롤', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** 한 화면에 primary 는 하나. danger 는 파괴적 액션에만. 아이콘 버튼은 aria-label 필수 */
export const 버튼: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary"><Plus /> 새 항목</Button>
        <Button variant="secondary"><Download /> 내보내기</Button>
        <Button variant="ghost"><RefreshCw /> 새로고침</Button>
        <Button variant="link">자세히</Button>
        <Button variant="danger"><Trash2 /> 삭제</Button>
        <Button variant="secondary" disabled>비활성</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">작게</Button>
        <Button>기본</Button>
        <Button size="lg">크게</Button>
        <Button size="icon" aria-label="새로고침"><RefreshCw /></Button>
        <Button size="icon-sm" variant="ghost" aria-label="삭제"><Trash2 /></Button>
      </div>
    </div>
  ),
}

/** 의미 색은 상태에만. accent 톤은 "이 서비스의 것"(선택·활성)에만 */
export const 배지: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Badge>neutral</Badge><Badge tone="success">success</Badge><Badge tone="warning">warning</Badge><Badge tone="danger">danger</Badge><Badge tone="info">info</Badge><Badge tone="accent">accent</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge state="running" /><StatusBadge state="pending" /><StatusBadge state="succeeded" /><StatusBadge state="failed" /><StatusBadge state="cancelled" />
      </div>
    </div>
  ),
}

/** 1차 분류는 탭, 2차 필터는 표 바로 위 한 줄(FilterBar) */
export const 탭과_필터바: Story = {
  name: '탭과 필터바',
  render: function Render() {
    const [tab, setTab] = React.useState('all')
    const [q, setQ] = React.useState('')
    return (
      <div className="flex flex-col gap-4">
        <Tabs aria-label="상태" value={tab} onChange={setTab} items={[{ value: 'all', label: '전체', count: 1200 }, { value: 'failed', label: '실패', count: 163, tone: 'danger' }, { value: 'running', label: '실행 중', count: 175 }, { value: 'done', label: '성공', count: 490 }]} />
        <FilterBar end={<span className="text-xs text-muted">1,200건</span>}>
          <SearchInput placeholder="잡 이름, ID, 소유자" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Select placeholder="모든 파이프라인" options={[{ value: 'etl', label: 'etl-daily' }, { value: 'train', label: 'model-train' }]} />
          <Select placeholder="모든 소유자" options={[{ value: 'bora', label: 'bora' }, { value: 'minseo', label: 'minseo' }]} />
        </FilterBar>
      </div>
    )
  },
}

/** 폼 컨트롤 — raw <input> 대신. 라벨·설명이 붙는 Field/Row 변형을 기본으로 쓴다 */
export const 입력: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4">
      <label className="flex flex-col gap-1 text-sm"><span className="text-muted">이름</span><Input placeholder="etl-daily" /></label>
      <label className="flex flex-col gap-1 text-sm"><span className="text-muted">설명</span><Textarea placeholder="무엇을 하는 잡인지" rows={3} /></label>
      <label className="flex flex-col gap-1 text-sm"><span className="text-muted">파이프라인</span><Select options={[{ value: 'etl', label: 'etl-daily' }, { value: 'train', label: 'model-train' }]} /></label>
      <CheckboxField id="c1" label="실패 시 알림" description="Slack #alerts 로 보낸다" defaultChecked />
      <SwitchRow id="s1" label="자동 재시도" description="최대 3회, 5분 간격" />
    </div>
  ),
}
