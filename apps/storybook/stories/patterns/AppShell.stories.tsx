import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, LayoutDashboard, ListChecks, Plus, Server } from 'lucide-react'
import { AppShell, Avatar, Button, NavItem, NavSection, PageBody, PageHeader, StatusStrip } from '@se/ui'
import { byId, markText } from '../identities'

/**
 * 모든 서비스가 같은 쉘을 쓴다: 좌측 네비 + 상단 검색(⌘K) + 로크업. 개성은 마크·액센트·시그니처에서 나온다.
 * 라우터 링크는 `NavItem asChild` 로 감싼다. 내부 도구면 `credit={false}`.
 */
const meta = { title: '패턴/AppShell', component: AppShell, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

export const 기본: Story = {
  args: { name: 'SE', mark: 'SE', nav: null, children: null },
  render: (_, ctx) => {
    const id = byId(String(ctx.globals.identity))
    const mark = markText(id)
    return (
      <div className="h-[720px] overflow-hidden">
        <AppShell
          name={id.name}
          mark={mark}
          subtitle="production · ap-northeast-2"
          topEnd={<span className="flex items-center gap-2 text-sm text-muted">bora@se <Avatar name="bora" /></span>}
          command={[{ heading: '이동', items: [{ id: 'o', label: '개요', onSelect: () => {} }, { id: 'j', label: '잡', onSelect: () => {} }] }]}
          searchPlaceholder="잡, 파이프라인, 페이지, 액션…"
          nav={
            <NavSection>
              <NavItem icon={<LayoutDashboard />}>개요</NavItem>
              <NavItem icon={<ListChecks />} active end={<span className="text-xs text-danger">163</span>}>잡</NavItem>
              <NavItem icon={<Server />}>노드</NavItem>
              <NavItem icon={<Activity />}>활동</NavItem>
            </NavSection>
          }
        >
          <PageBody>
            <PageHeader title="잡" description="최근 36시간 동안 스케줄된 잡. 실패한 잡은 상세에서 재시도할 수 있습니다." actions={<Button variant="primary" size="sm"><Plus /> 잡 등록</Button>} />
            <StatusStrip variant="compact" health="degraded" headline="일부 잡 실패 증가" detail="노드 5/5" stats={[{ label: '실행 중', value: 175 }, { label: '대기', value: 176 }, { label: '24시간 실패', value: 163, tone: 'danger' }]} />
            <div className="h-64 rounded-lg border border-dashed border-line-strong" />
          </PageBody>
        </AppShell>
      </div>
    )
  },
}
