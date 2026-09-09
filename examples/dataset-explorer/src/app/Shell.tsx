import { Database, LayoutGrid, Palette, Settings, Tags, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { AppShell, Avatar, NavItem, NavSection } from '@se/ui'
import identity from '../../se.identity.json'

const NAV = [
  { to: '/datasets', label: '데이터셋', icon: <Database /> },
  { to: '/domains', label: '도메인', icon: <LayoutGrid /> },
  { to: '/owners', label: '소유자', icon: <Users /> },
  { to: '/tags', label: '태그', icon: <Tags /> },
]

export function Shell() {
  return (
    <AppShell
      name={identity.name}
      mark={<LayoutGrid className="size-4" />}
      subtitle="warehouse · bigquery-prod"
      onSearch={() => {}}
      searchPlaceholder="데이터셋, 컬럼, 소유자"
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
