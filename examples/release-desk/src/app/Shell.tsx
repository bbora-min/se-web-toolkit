import * as React from 'react'
import { CalendarClock, ChevronDown, ClipboardCheck, History, LogOut, Palette, Plus, Rocket, Settings, User } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  AppShell, Avatar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  NavItem, NavSection, useIdentityFavicon, useTheme, type CommandGroup,
} from '@se/ui'
import identity from '../../se.identity.json'
import { useReleases } from '../api/releases'
import { StageBadge } from '../pages/releases/bits'

const NAV = [
  { to: '/releases', label: '릴리스', icon: <Rocket /> },
  { to: '/releases?mine=1', label: '내 승인 대기', icon: <ClipboardCheck /> },
  { to: '/calendar', label: '배포 캘린더', icon: <CalendarClock /> },
  { to: '/history', label: '이력', icon: <History /> },
]

export function Shell() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const { setMode, setDensity, density } = useTheme()
  const list = useReleases({})
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])
  const pendingForMe = list.data?.items.filter((r) => r.approvers.some((a) => a.name === 'bora' && a.decision === 'pending')).length ?? 0

  const command: CommandGroup[] = React.useMemo(
    () => [
      {
        heading: '액션',
        items: [
          { id: 'new', label: '새 릴리스 등록', icon: <Plus />, hint: 'N', onSelect: () => navigate('/releases/new') },
          { id: 'mine', label: '내 승인 대기 보기', icon: <ClipboardCheck />, onSelect: () => navigate('/releases?mine=1') },
          { id: 'settings', label: '설정', icon: <Settings />, onSelect: () => navigate('/settings') },
          { id: 'density', label: `밀도: ${density === 'compact' ? 'comfortable' : 'compact'}로`, onSelect: () => setDensity(density === 'compact' ? 'comfortable' : 'compact') },
          { id: 'dark', label: '테마: 다크', onSelect: () => setMode('dark') },
          { id: 'light', label: '테마: 라이트', onSelect: () => setMode('light') },
        ],
      },
      {
        heading: '릴리스',
        items: (list.data?.items ?? []).map((r) => ({
          id: r.id,
          label: `${r.version} — ${r.title}`,
          keywords: [r.service, r.owner, r.stage],
          icon: <Rocket />,
          hint: <StageBadge stage={r.stage} />,
          onSelect: () => navigate(`/releases/${r.id}`),
        })),
      },
    ],
    [list.data, navigate, density, setDensity, setMode],
  )

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && (document.activeElement?.tagName ?? '') !== 'INPUT' && (document.activeElement?.tagName ?? '') !== 'TEXTAREA') navigate('/releases/new')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <AppShell
      name={identity.name}
      mark={identity.mark.text}
      subtitle="platform · 릴리스 관리"
      command={command}
      searchPlaceholder="릴리스, 서비스, 액션…"
      topEnd={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5 [&_svg]:size-3.5">
              <Avatar name="bora" size="md" />
              <span>bora</span>
              <ChevronDown className="text-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>bora@se · platform</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => navigate('/releases?mine=1')}>
              <ClipboardCheck /> 내 승인 대기 <span className="ml-auto rounded-full bg-accent-soft px-1.5 text-xs text-accent-fg tnum">{pendingForMe}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}><Settings /> 설정</DropdownMenuItem>
            <DropdownMenuItem><User /> 프로필</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive><LogOut /> 로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      nav={
        <>
          <NavSection>
            {NAV.map((n) => {
              // 쿼리까지 포함해 비교 — "/releases"와 "/releases?mine=1"은 다른 화면
              const [path, qs = ''] = n.to.split('?')
              const active = pathname === path && (qs ? search.includes(qs) : !search.includes('mine=1'))
              return (
                <NavItem key={n.to} asChild active={active}>
                  <Link to={n.to}>
                    {n.icon}
                    <span className="flex-1 truncate">{n.label}</span>
                    {n.to.includes('mine') && pendingForMe ? <span className="text-xs text-accent-fg tnum">{pendingForMe}</span> : null}
                  </Link>
                </NavItem>
              )
            })}
          </NavSection>
          <NavSection title="워크스페이스">
            <NavItem asChild active={pathname === '/settings'}>
              <Link to="/settings"><Settings /><span className="flex-1 truncate">설정</span></Link>
            </NavItem>
            {import.meta.env.DEV ? (
              <NavItem asChild active={pathname === '/__identity'}>
                <Link to="/__identity"><Palette /><span className="flex-1 truncate">아이덴티티</span></Link>
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
