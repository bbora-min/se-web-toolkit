import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, StatusStrip, SearchHero, StageRail, TimelineRibbon, MetricMarquee, Tabs } from '@se/ui'
import type { Identity } from '@se/tokens'
import { IDENTITIES, byId, markText, scopedCss } from '../identities'

const H = 3_600_000
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString()

/** 시그니처를 작게 — 갤러리 카드 안에서 서비스의 얼굴만 보여 준다 */
function SignaturePreview({ id }: { id: Identity }) {
  const [q, setQ] = React.useState('')
  switch (id.signature) {
    case 'status-strip':
      return <StatusStrip variant="compact" health="ok" headline="정상" detail="5/5" stats={[{ label: '실행 중', value: 175 }, { label: '실패', value: 3, tone: 'danger' }]} />
    case 'search-hero':
      return <SearchHero title="무엇을 찾고 계세요?" value={q} onChange={setQ} placeholder="데이터셋, 컬럼, 소유자" quick={[{ label: '내 것', count: 12, onClick: () => {} }]} />
    case 'stage-rail':
      return <StageRail headline="16건" value="approval" stages={[{ id: 'review', label: '검토', count: 5 }, { id: 'approval', label: '승인', count: 5 }, { id: 'deploy', label: '배포', count: 4, blocked: 1 }]} />
    case 'timeline-ribbon':
      return (
        <TimelineRibbon from={iso(24 * H)} to={iso(0)} headline="지난 24시간" lanes={['배포', '장애']}
          events={[{ id: 'a', lane: '배포', at: iso(20 * H), until: iso(19.5 * H), label: 'v1' }, { id: 'b', lane: '장애', at: iso(9 * H), until: iso(8 * H), label: 'S1', tone: 'danger' }, { id: 'c', lane: '배포', at: iso(3 * H), label: 'v2' }]} />
      )
    case 'metric-marquee':
      return <MetricMarquee primary={{ label: '이번 달 비용', value: '₩48.2M', trend: [31, 34, 38, 41, 44, 48] }} metrics={[{ label: '컴퓨트', value: '₩29.1M' }, { label: '스토리지', value: '₩8.7M' }]} />
    default:
      return null
  }
}

function Card({ id, theme }: { id: Identity; theme: 'light' | 'dark' }) {
  const scope = `se-scope-${id.id}`
  const [tab, setTab] = React.useState('all')
  const mark = markText(id)
  return (
    <div className={scope} data-theme={theme} data-density={id.density}>
      <style>{scopedCss(id, scope)}</style>
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-canvas p-5 text-ink shadow-xs">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-accent font-mono text-sm font-semibold text-on-accent">{mark}</span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{id.name}</span>
            <span className="text-[11px] text-muted">{id.accent.hue}° · {id.neutralBias} · {id.signature} · {id.density} · {id.tone}</span>
          </div>
          <span className="ml-auto flex gap-1" aria-label="팔레트">
            {['bg-accent', 'bg-accent-soft', 'bg-surface-2', 'bg-line-strong', 'bg-ink'].map((c) => <i key={c} className={`block size-4 rounded-sm border border-line ${c}`} />)}
          </span>
        </div>
        <SignaturePreview id={id} />
        <Tabs aria-label="예시 탭" value={tab} onChange={setTab} items={[{ value: 'all', label: '전체', count: 1200 }, { value: 'failed', label: '실패', count: 163, tone: 'danger' }, { value: 'done', label: '완료', count: 490 }]} />
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">주 액션</Button>
          <Button variant="secondary" size="sm">보조</Button>
          <Button variant="ghost" size="sm">고스트</Button>
          <Badge tone="accent">액센트</Badge>
          <Badge tone="success">성공</Badge>
          <Badge tone="danger">실패</Badge>
        </div>
      </div>
    </div>
  )
}

/**
 * 가족 초상화 — 레지스트리의 서비스 전부를 같은 골격으로 나란히. 골격(타이포·간격·컴포넌트)은 하나, 아이덴티티 슬롯만 다르다.
 * 두 질문을 던진다: "같은 팀이 만든 것 같은가?"(예여야 함) · "같은 제품인가?"(아니오여야 함).
 */
const meta = {
  title: '아이덴티티/가족 초상화',
  parameters: { layout: 'fullscreen', docs: { description: { component: '레지스트리(identities/registry.json)에 등록된 서비스 전부. 각 카드는 자기 아이덴티티로 스코프된 CSS 변수를 갖는다 — 툴바의 아이덴티티 선택과 무관하게 항상 전부 보인다. 단, 포털로 뜨는 툴팁·다이얼로그는 툴바 아이덴티티를 따른다(스코프 밖).' } } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const 라이트: Story = {
  render: () => (
    <div className="grid gap-4 p-6 md:grid-cols-2">
      {IDENTITIES.map((id) => <Card key={id.id} id={id} theme="light" />)}
    </div>
  ),
}
export const 다크: Story = {
  render: () => (
    <div className="grid gap-4 p-6 md:grid-cols-2">
      {IDENTITIES.map((id) => <Card key={id.id} id={id} theme="dark" />)}
    </div>
  ),
}
export const 한_서비스_양쪽_테마: Story = {
  name: '한 서비스, 라이트와 다크',
  render: (_, ctx) => {
    const id = byId(String(ctx.globals.identity))
    return (
      <div className="grid gap-4 p-6 md:grid-cols-2">
        <Card id={id} theme="light" />
        <Card id={id} theme="dark" />
      </div>
    )
  },
}
