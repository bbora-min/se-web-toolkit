import * as React from 'react'
import { List, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { AppShell, Avatar, NavItem, NavSection, useIdentityFavicon, useTheme, type CommandGroup } from '@se/ui'
import identity from '../../se.identity.json'

/** 네비 — /se:page 가 화면을 만들면 여기와 App.tsx의 Route에 추가한다 */
const NAV = [{ to: '/items', label: '항목', icon: <List /> }]
/** 로크업 아래 한 줄 — 환경·팀. create-se-app 이 --subtitle 로 바꾼다 */
const SUBTITLE = 'internal tool'

export function Shell() {
  const navigate = useNavigate()
  const { setMode } = useTheme()
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])

  const command: CommandGroup[] = React.useMemo(
    () => [
      { heading: '이동', items: NAV.map((n) => ({ id: n.to, label: n.label, icon: n.icon, hint: n.to, onSelect: () => navigate(n.to) })) },
      {
        heading: '액션',
        items: [
          { id: 'light', label: '테마: 라이트', icon: <Sun />, onSelect: () => setMode('light') },
          { id: 'dark', label: '테마: 다크', icon: <Moon />, onSelect: () => setMode('dark') },
          { id: 'system', label: '테마: 시스템', icon: <Monitor />, onSelect: () => setMode('system') },
        ],
      },
    ],
    [navigate, setMode],
  )

  return (
    <AppShell
      name={identity.name}
      mark={identity.mark.type === 'monogram' ? identity.mark.text : identity.name.slice(0, 1)}
      subtitle={SUBTITLE}
      command={command}
      searchPlaceholder="검색, 이동, 액션…"
      topEnd={
        <>
          <span className="text-xs text-muted">me@se</span>
          <Avatar name="me" size="md" />
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
            {import.meta.env.DEV ? (
              <NavItem asChild>
                <NavLink to="/__identity"><Palette /><span className="flex-1 truncate">아이덴티티</span></NavLink>
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
