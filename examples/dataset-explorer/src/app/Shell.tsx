import * as React from 'react'
import { Database, LayoutGrid, Monitor, Moon, Palette, Rows3, Settings, ShieldAlert, Star, Sun, Tags, Users } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { AppShell, Avatar, Badge, NavItem, NavSection, useIdentityFavicon, useTheme, type CommandGroup } from '@se/ui'
import identity from '../../se.identity.json'
import { useDatasets } from '../api/datasets'

const NAV = [
  { to: '/datasets', label: '데이터셋', icon: <Database /> },
  { to: '/domains', label: '도메인', icon: <LayoutGrid /> },
  { to: '/owners', label: '소유자', icon: <Users /> },
  { to: '/tags', label: '태그', icon: <Tags /> },
]

export function Shell() {
  const navigate = useNavigate()
  const { setMode, density, setDensity } = useTheme()
  const list = useDatasets({})
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])

  const command: CommandGroup[] = React.useMemo(
    () => [
      { heading: '이동', items: NAV.map((n) => ({ id: n.to, label: n.label, icon: n.icon, hint: n.to, onSelect: () => navigate(n.to) })) },
      {
        heading: '데이터셋',
        items: (list.data?.items ?? []).map((d) => ({
          id: d.id,
          label: d.name,
          keywords: [d.owner, d.domain, ...d.tags],
          icon: <Database />,
          hint: <Badge tone={d.freshness === 'fresh' ? 'success' : d.freshness === 'stale' ? 'warning' : 'danger'}>{d.freshness === 'fresh' ? '최신' : d.freshness === 'stale' ? '지연' : '오류'}</Badge>,
          onSelect: () => navigate(`/datasets/${d.id}`),
        })),
      },
      {
        heading: '빠른 필터',
        items: [
          { id: 'mine', label: '내 데이터셋', icon: <Star />, onSelect: () => navigate('/datasets?quick=mine') },
          { id: 'stale', label: '갱신 지연된 데이터셋', icon: <ShieldAlert />, onSelect: () => navigate('/datasets?quick=stale') },
          { id: 'pii', label: 'PII 포함 데이터셋', icon: <ShieldAlert />, onSelect: () => navigate('/datasets?quick=pii') },
        ],
      },
      {
        heading: '액션',
        items: [
          { id: 'density', label: `밀도: ${density === 'compact' ? 'comfortable' : 'compact'}로`, icon: <Rows3 />, onSelect: () => setDensity(density === 'compact' ? 'comfortable' : 'compact') },
          { id: 'light', label: '테마: 라이트', icon: <Sun />, onSelect: () => setMode('light') },
          { id: 'dark', label: '테마: 다크', icon: <Moon />, onSelect: () => setMode('dark') },
          { id: 'system', label: '테마: 시스템', icon: <Monitor />, onSelect: () => setMode('system') },
        ],
      },
    ],
    [list.data, navigate, density, setDensity, setMode],
  )

  return (
    <AppShell
      name={identity.name}
      mark={<LayoutGrid className="size-4" />}
      subtitle="warehouse · bigquery-prod"
      command={command}
      searchPlaceholder="데이터셋, 컬럼, 소유자, 페이지…"
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
