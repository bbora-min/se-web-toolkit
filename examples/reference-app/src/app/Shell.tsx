import { Activity, GitBranch, ListChecks, Palette, Server, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { AppShell, Avatar, NavItem, NavSection } from '@se/ui'
import identity from '../../se.identity.json'

const NAV = [
  { to: '/jobs', label: '잡', icon: <ListChecks /> },
  { to: '/pipelines', label: '파이프라인', icon: <GitBranch /> },
  { to: '/nodes', label: '노드', icon: <Server /> },
  { to: '/activity', label: '활동', icon: <Activity /> },
]

export function Shell() {
  return (
    <AppShell
      name={identity.name}
      mark={identity.mark.text}
      subtitle="production · ap-northeast-2"
      onSearch={() => {}}
      searchPlaceholder="잡, 파이프라인, 노드 검색"
      topEnd={
        <>
          <span className="text-xs text-muted">bora@se</span>
          <Avatar name="bora" size="md" />
        </>
      }
      nav={
        <>
          <NavSection>
            {NAV.map((n) => (
              <NavItem key={n.to} asChild>
                <NavLink to={n.to}>
                  {n.icon}
                  <span className="flex-1 truncate">{n.label}</span>
                </NavLink>
              </NavItem>
            ))}
          </NavSection>
          <NavSection title="워크스페이스">
            <NavItem asChild>
              <NavLink to="/settings">
                <Settings />
                <span className="flex-1 truncate">설정</span>
              </NavLink>
            </NavItem>
            {import.meta.env.DEV ? (
              <NavItem asChild>
                <NavLink to="/__identity">
                  <Palette />
                  <span className="flex-1 truncate">아이덴티티 시트</span>
                </NavLink>
              </NavItem>
            ) : null}
          </NavSection>
        </>
      }
    >
      <Outlet />
    </AppShell>
  )
}
