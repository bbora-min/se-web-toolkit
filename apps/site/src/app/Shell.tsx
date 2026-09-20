import { BookOpen, Compass, Github, Home, Layers, Rocket } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { AppShell, Button, NavItem, NavSection, ThemeToggle, useIdentityFavicon } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../se.identity.json'
import { GITHUB, storybookUrl } from '../lib/links'

const ID = parseIdentity(identity)

/** 읽는 사이트라 네비는 넷. 팔레트·검색은 없다(장식 검색창 금지) */
const NAV = [
  { to: '/', label: '홈', icon: <Home />, end: true },
  { to: '/archetypes', label: '골격', icon: <Layers /> },
  { to: '/start', label: '시작하기', icon: <Rocket /> },
  { to: '/how', label: '동작 원리', icon: <Compass /> },
]

export function Shell() {
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])
  return (
    <AppShell
      layout={ID.shell}
      name={ID.name}
      mark={ID.mark.type === 'monogram' ? ID.mark.text : ID.name.slice(0, 1)}
      subtitle={`v${__RELEASE__.version}`}
      maxWidth={1120}
      topEnd={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild><a href={storybookUrl()} target="_blank" rel="noreferrer"><BookOpen /> Storybook</a></Button>
          <Button variant="ghost" size="sm" asChild><a href={GITHUB} target="_blank" rel="noreferrer"><Github /> GitHub</a></Button>
          <ThemeToggle compact />
        </div>
      }
      nav={
        <NavSection>
          {NAV.map((n) => (
            <NavItem key={n.to} asChild label={n.label}>
              <NavLink to={n.to} end={n.end}>
                {n.icon}
                <span className="flex-1 truncate">{n.label}</span>
              </NavLink>
            </NavItem>
          ))}
        </NavSection>
      }
    >
      <Outlet />
    </AppShell>
  )
}

