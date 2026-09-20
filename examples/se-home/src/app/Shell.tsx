import * as React from 'react'
import { ArrowUpRight, Clock, LayoutGrid, Monitor, Moon, Palette, RefreshCw, Rows3, Sun } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell, Avatar, Badge, NavItem, NavSection, ServiceMark, useIdentityFavicon, useTheme, type CommandGroup } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../se.identity.json'
import { useHome } from '../api/home'
import { HEALTH } from '../lib/health'

/** 스키마 기본값(shell 등)이 채워진 아이덴티티 */
const ID = parseIdentity(identity)

/** 허브의 네비는 짧다 — 입구는 메뉴가 아니라 검색과 카드로 움직인다 */
const NAV = [
  { to: '/', label: '홈', icon: <LayoutGrid />, end: true },
  { to: '/services', label: '서비스', icon: <Rows3 /> },
]

export function Shell() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setMode } = useTheme()
  const home = useHome()
  const services = home.data?.services
  const recent = home.data?.recent
  useIdentityFavicon(identity as Parameters<typeof useIdentityFavicon>[0])

  const command: CommandGroup[] = React.useMemo(
    () => [
      { heading: '이동', items: NAV.map((n) => ({ id: n.to, label: n.label, icon: n.icon, hint: n.to, onSelect: () => navigate(n.to) })) },
      {
        heading: '서비스',
        items: (services ?? []).map((s) => ({
          id: s.id,
          label: s.name,
          keywords: [s.id, s.team, s.owner, s.description],
          icon: <ServiceMark hue={s.hue} size="xs">{s.monogram}</ServiceMark>,
          hint: <Badge tone={HEALTH[s.health].tone}>{HEALTH[s.health].label}</Badge>,
          onSelect: () => window.location.assign(s.url),
        })),
      },
      {
        heading: '최근 본 것',
        items: (recent ?? []).map((r) => ({ id: r.id, label: r.label, keywords: [r.kind, r.serviceId], icon: <Clock />, hint: r.kind, onSelect: () => window.location.assign(r.url) })),
      },
      {
        heading: '액션',
        items: [
          { id: 'refresh', label: '지금 새로고침', icon: <RefreshCw />, keywords: ['refresh', 'reload'], onSelect: () => void qc.invalidateQueries() },
          { id: 'toolkit', label: '툴킷 저장소 열기', icon: <ArrowUpRight />, keywords: ['github', 'toolkit'], onSelect: () => window.open('https://github.com/bbora-min/se-web-toolkit', '_blank') },
          { id: 'light', label: '테마: 라이트', icon: <Sun />, keywords: ['theme', 'light'], onSelect: () => setMode('light') },
          { id: 'dark', label: '테마: 다크', icon: <Moon />, keywords: ['theme', 'dark'], onSelect: () => setMode('dark') },
          { id: 'system', label: '테마: 시스템', icon: <Monitor />, keywords: ['theme', 'system'], onSelect: () => setMode('system') },
        ],
      },
    ],
    [services, recent, navigate, qc, setMode], // 30초 갱신마다 generatedAt 만 바뀌어도 팔레트를 다시 만들지 않는다
  )

  return (
    <AppShell
      layout={ID.shell}
      name={ID.name}
      mark={ID.mark.type === 'monogram' ? ID.mark.text : ID.name.slice(0, 1)}
      subtitle="internal · 모든 서비스"
      maxWidth={1200}
      command={command}
      searchPlaceholder="서비스, 잡, 데이터셋, 릴리스, 사람…"
      topEnd={<Avatar name={home.data?.me.name ?? 'me'} size="md" />}
      nav={
        <>
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
          {import.meta.env.DEV ? (
            <NavSection title="워크스페이스">
              <NavItem asChild label="아이덴티티">
                <NavLink to="/__identity"><Palette /><span className="flex-1 truncate">아이덴티티</span></NavLink>
              </NavItem>
            </NavSection>
          ) : null}
        </>
      }
    >
      <Outlet />
    </AppShell>
  )
}
