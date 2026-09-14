import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricMarquee, SearchHero, StageRail, StatusStrip, TimelineRibbon } from '@se/ui'

const H = 3_600_000
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString()

/**
 * 서비스의 얼굴. `se.identity.json` 의 `signature` 가 이 중 하나를 고르고, 페이지 맨 위 한 자리에 항상 같은 것이 온다.
 * 서비스의 핵심 질문에 맞춘다: 지금 괜찮은가 · 무엇을 찾나 · 어디까지 왔나 · 최근 무슨 일이 · 얼마인가.
 */
const meta = { title: '시그니처/다섯 시그니처', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const StatusStrip_지금_괜찮은가: Story = {
  name: 'StatusStrip — 지금 괜찮은가 (모니터링)',
  render: () => (
    <div className="flex flex-col gap-4">
      <StatusStrip
        health="degraded"
        headline="일부 잡 실패 증가"
        detail="노드 5/5 · 15초마다 갱신"
        stats={[
          { label: '실행 중', value: 175, trend: [120, 140, 150, 160, 170, 168, 175] },
          { label: '대기', value: 176, trend: [80, 90, 120, 140, 150, 170, 176] },
          { label: '24시간 실패', value: 163, tone: 'danger', delta: { value: 41, period: '어제 대비', upIsGood: false }, trend: [60, 70, 90, 100, 120, 150, 163] },
          { label: '성공률', value: '75.0%', delta: { value: -8.2, period: '어제 대비', format: (v) => `${v.toFixed(1)}%p` }, trend: [92, 90, 88, 85, 80, 78, 75] },
        ]}
      />
      <StatusStrip variant="compact" health="ok" headline="클러스터 정상" detail="노드 5/5" stats={[{ label: '실행 중', value: 175 }, { label: '대기', value: 176 }, { label: '24시간 실패', value: 3, tone: 'danger' }]} />
    </div>
  ),
}

export const SearchHero_무엇을_찾나: Story = {
  name: 'SearchHero — 무엇을 찾나 (조회)',
  render: function Render() {
    const [q, setQ] = React.useState('')
    return (
      <SearchHero title="무엇을 찾고 계세요?" placeholder="예: clicks, user_id, minseo, certified" value={q} onChange={setQ} hint="26개 데이터셋 · 4분 전 색인"
        quick={[{ label: '내 데이터셋', count: 12, onClick: () => setQ('owner:me') }, { label: '인증됨', count: 5, onClick: () => setQ('tag:certified') }, { label: '갱신 지연', count: 4, onClick: () => setQ('stale:true') }]} />
    )
  },
}

export const StageRail_어디까지_왔나: Story = {
  name: 'StageRail — 어디까지 왔나 (워크플로)',
  render: function Render() {
    const [stage, setStage] = React.useState<string | null>('approval')
    return (
      <StageRail headline="16건 진행 중" detail="막힘 1건 · 이번 주 배포 4건" value={stage} onChange={setStage}
        stages={[{ id: 'review', label: '코드 검토', count: 5 }, { id: 'staging', label: '스테이징 검증', count: 2 }, { id: 'approval', label: '승인', count: 5 }, { id: 'deploy', label: '배포', count: 4, blocked: 1 }, { id: 'done', label: '완료', count: 10 }]} />
    )
  },
}

export const TimelineRibbon_최근_무슨_일이: Story = {
  name: 'TimelineRibbon — 최근 무슨 일이 (활동·이력)',
  render: function Render() {
    const [sel, setSel] = React.useState<string | null>(null)
    return (
      <TimelineRibbon from={iso(24 * H)} to={iso(-2 * H)} headline="지난 24시간" detail="배포 4 · 장애 1 · 알림 4 · 점을 누르면 이동" lanes={['배포', '장애', '알림']} selected={sel} onSelect={setSel}
        events={[
          { id: 'd1', lane: '배포', at: iso(22 * H), until: iso(21.6 * H), label: 'api-gateway v4.18.0', tone: 'accent' },
          { id: 'd2', lane: '배포', at: iso(17 * H), until: iso(16.7 * H), label: 'notification v2.3.1', tone: 'accent' },
          { id: 'd3', lane: '배포', at: iso(9 * H), until: iso(8.5 * H), label: 'release-desk v1.9.0 (롤백)', tone: 'warning' },
          { id: 'd4', lane: '배포', at: iso(3 * H), until: iso(2.7 * H), label: 'dataset-explorer v0.8.2', tone: 'accent' },
          { id: 'i1', lane: '장애', at: iso(8.8 * H), until: iso(7.2 * H), label: 'S1 결제 지연 — 롤백으로 해소', tone: 'danger' },
          { id: 'a1', lane: '알림', at: iso(20 * H), label: 'gpu-01 디스크 85%', tone: 'warning' },
          { id: 'a2', lane: '알림', at: iso(12 * H), label: '야간 배치 완료', tone: 'success' },
          { id: 'a3', lane: '알림', at: iso(8.9 * H), label: 'PagerDuty 호출', tone: 'danger' },
          { id: 'a4', lane: '알림', at: iso(1 * H), label: '인증서 갱신', tone: 'neutral' },
        ]} />
    )
  },
}

export const MetricMarquee_얼마인가: Story = {
  name: 'MetricMarquee — 얼마인가 (비용·사용량·품질)',
  render: function Render() {
    const [period, setPeriod] = React.useState('7d')
    return (
      <MetricMarquee
        period={{ value: period, options: [{ value: '24h', label: '24시간' }, { value: '7d', label: '7일' }, { value: '30d', label: '30일' }], onChange: setPeriod }}
        primary={{ label: '이번 달 클라우드 비용', value: '₩48.2M', description: '예산 ₩60M 의 80% · 예상 착지 ₩57.9M', delta: { value: 6.4, period: '전월 대비', upIsGood: false, format: (v) => `${v > 0 ? '+' : ''}${v}%` }, trend: [31, 33, 34, 38, 37, 41, 43, 44, 46, 48.2] }}
        metrics={[
          { label: '컴퓨트', value: '₩29.1M', delta: { value: 3.1, period: '전월', upIsGood: false, format: (v) => `${v}%` }, trend: [20, 22, 23, 25, 27, 28, 29.1] },
          { label: '스토리지', value: '₩8.7M', delta: { value: 0, period: '전월' }, trend: [8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 8.7] },
          { label: '네트워크', value: '₩6.2M', delta: { value: 18, period: '전월', upIsGood: false, format: (v) => `+${v}%` }, tone: 'warning', trend: [4, 4.2, 4.5, 5, 5.4, 5.9, 6.2] },
          { label: '유휴 리소스', value: '₩4.2M', delta: { value: -12, period: '전월', upIsGood: false, format: (v) => `${v}%` }, trend: [6, 5.6, 5.2, 4.9, 4.6, 4.4, 4.2] },
        ]} />
    )
  },
}
