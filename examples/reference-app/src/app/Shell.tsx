import * as React from 'react'
import { Activity, GitBranch, LayoutDashboard, ListChecks, Monitor, Moon, Palette, RefreshCw, Rows3, Server, Settings, Sun } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell, Avatar, NavItem, NavSection, StatusBadge, useIdentityFavicon, useTheme, type CommandGroup } from '@se/ui'
import identity from '../../se.identity.json'
import { useJobs } from '../api/jobs'

const NAV = [
  { to: '/overview', label: '개요', icon: <LayoutDashboard /> },
  { to: '/jobs', label: '잡', icon: <ListChecks /> },
  { to: '/pipelines', label: '파이프라인', icon: <GitBranch /> },
  { to: '/nodes', label: '노드', icon: <Server /> },
  { to: '/activity', label: '활동', icon: <Activity /> },
]

export function Shell() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setMode, density, setDensity } = useTheme()
  const jobs = useJobs({})
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])

  const command: CommandGroup[] = React.useMemo(
    () => [
      {
        heading: '이동',
        items: NAV.map((n) => ({ id: n.to, label: n.label, icon: n.icon, hint: n.to, onSelect: () => navigate(n.to) })),
      },
      {
        heading: '잡',
        items: (jobs.data?.items ?? []).slice(0, 30).map((j) => ({
          id: j.id,
          label: j.name,
          keywords: [j.id, j.owner, j.pipeline, j.state],
          icon: <ListChecks />,
          hint: <StatusBadge state={j.state} />,
          onSelect: () => navigate(`/jobs/${j.id}`),
        })),
      },
      {
        heading: '파이프라인',
        items: (jobs.data?.pipelines ?? []).map((p) => ({ id: `p-${p}`, label: p, icon: <GitBranch />, hint: '잡 필터', onSelect: () => navigate(`/jobs?pipeline=${p}`) })),
      },
      {
        heading: '액션',
        items: [
          { id: 'refresh', label: '지금 새로고침', icon: <RefreshCw />, keywords: ['refresh', 'reload'], onSelect: () => void qc.invalidateQueries() },
          { id: 'failed', label: '실패한 잡만 보기', icon: <ListChecks />, keywords: ['failed'], onSelect: () => navigate('/jobs?state=failed') },
          { id: 'density', label: `밀도: ${density === 'compact' ? 'comfortable' : 'compact'}로`, icon: <Rows3 />, keywords: ['density'], onSelect: () => setDensity(density === 'compact' ? 'comfortable' : 'compact') },
          { id: 'light', label: '테마: 라이트', icon: <Sun />, keywords: ['theme', 'light'], onSelect: () => setMode('light') },
          { id: 'dark', label: '테마: 다크', icon: <Moon />, keywords: ['theme', 'dark'], onSelect: () => setMode('dark') },
          { id: 'system', label: '테마: 시스템', icon: <Monitor />, keywords: ['theme', 'system'], onSelect: () => setMode('system') },
        ],
      },
    ],
    [jobs.data, navigate, qc, density, setDensity, setMode],
  )

  return (
    <AppShell
      name={identity.name}
      mark={identity.mark.text}
      subtitle="production · ap-northeast-2"
      command={command}
      searchPlaceholder="잡, 파이프라인, 페이지, 액션…"
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
            {import.meta.env.DEV ? (
              <NavItem asChild>
                <NavLink to="/__identity">
                  <Palette />
                  <span className="flex-1 truncate">아이덴티티</span>
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
