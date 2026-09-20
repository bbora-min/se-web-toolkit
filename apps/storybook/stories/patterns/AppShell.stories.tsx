import type { Meta, StoryObj } from '@storybook/react-vite'
import { Activity, Inbox, LayoutDashboard, ListChecks, Plus, Server, Settings } from 'lucide-react'
import { AppShell, Avatar, Button, NavItem, NavSection, PageBody, PageHeader, StatusStrip } from '@se/ui'
import { byId, markText } from '../identities'

/**
 * 쉘의 자리(로크업·⌘K·테마 토글·크레딧)는 모든 서비스가 같고, 배치(`layout`)는 서비스가 `se.identity.json` 의 `shell` 로 고른다.
 * `sidebar`(목록·대시보드) · `topnav`(허브·콘솔) · `panes`(트리아지·로그). 같은 배치는 형제 둘까지 — 셋이면 색만 다른 형제가 된다.
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

/** 상단 네비 — 사이드바가 없어 콘텐츠가 넓다. 활성 항목은 액센트 밑줄. 허브·콘솔 골격이 쓴다 */
export const 상단_네비: Story = {
  args: { name: 'SE', mark: 'SE', nav: null, children: null },
  render: (_, ctx) => {
    const id = byId(String(ctx.globals.identity))
    return (
      <div className="h-[720px] overflow-hidden">
        <AppShell
          layout="topnav"
          name={id.name}
          mark={markText(id)}
          subtitle="internal · seoul"
          topEnd={<Avatar name="bora" />}
          command={[{ heading: '이동', items: [{ id: 'o', label: '개요', onSelect: () => {} }] }]}
          searchPlaceholder="서비스, 사람, 문서…"
          nav={
            <>
              <NavSection>
                <NavItem icon={<LayoutDashboard />} active>홈</NavItem>
                <NavItem icon={<ListChecks />}>서비스</NavItem>
                <NavItem icon={<Activity />}>활동</NavItem>
              </NavSection>
              <NavSection title="워크스페이스">
                <NavItem icon={<Settings />}>설정</NavItem>
              </NavSection>
            </>
          }
        >
          <PageBody>
            <PageHeader title="홈" description="팀의 모든 SE 서비스. 최근 본 것과 지금 상태." />
            <div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-36 rounded-lg border border-dashed border-line-strong" />)}</div>
          </PageBody>
        </AppShell>
      </div>
    )
  },
}

/** 아이콘 레일 + 전폭 — 콘텐츠에 패딩·최대 폭이 없다. 화면이 스스로 패널을 나눈다(트리아지·로그) */
export const 패널: Story = {
  args: { name: 'SE', mark: 'SE', nav: null, children: null },
  render: (_, ctx) => {
    const id = byId(String(ctx.globals.identity))
    return (
      <div className="h-[720px] overflow-hidden">
        <AppShell
          layout="panes"
          name={id.name}
          mark={markText(id)}
          subtitle="production"
          topEnd={<Avatar name="bora" />}
          command={[{ heading: '이동', items: [{ id: 'i', label: '받은 편지함', onSelect: () => {} }] }]}
          searchPlaceholder="항목, 사람, 액션…"
          nav={
            <>
              <NavSection>
                <NavItem icon={<Inbox />} active label="받은 편지함">받은 편지함</NavItem>
                <NavItem icon={<ListChecks />} label="내 항목">내 항목</NavItem>
                <NavItem icon={<Activity />} label="활동">활동</NavItem>
              </NavSection>
              <NavSection title="워크스페이스">
                <NavItem icon={<Settings />} label="설정">설정</NavItem>
              </NavSection>
            </>
          }
        >
          <div className="grid min-h-0 flex-1 grid-cols-[320px_1fr_280px]">
            <div className="border-r border-line bg-canvas" />
            <div />
            <div className="border-l border-line bg-canvas" />
          </div>
        </AppShell>
      </div>
    )
  },
}
