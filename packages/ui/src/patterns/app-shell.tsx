import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { ChevronsUpDown, Monitor, Moon, Search, Sun } from 'lucide-react'
import { DEFAULT_SHELL, type Shell } from '@se/tokens'
import { cn } from '../lib/cn'
import { useTheme, type ThemeMode } from '../lib/theme'
import { Button } from '../components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tooltip'
import { CommandPalette, useCommandPalette, type CommandGroup } from '../components/command-palette'

/* ──────────────────────────────────────────────────────────────
 * AppShell — 브랜드 코어의 "자리"와 서비스의 "배치".
 * 고정: 마크 + 서비스명 로크업, 검색(⌘K), 테마 토글, 크레딧 — 모든 서비스에서 같은 자리·같은 질감.
 * 배치(layout)는 서비스가 se.identity.json 의 shell 로 고른다:
 *   sidebar — 좌측 네비 + 상단 검색, 콘텐츠 1120px. 목록·대시보드 도구 (기본)
 *   topnav  — 상단 한 줄 네비, 사이드바 없음. 허브·콘솔처럼 폭이 필요한 도구
 *   panes   — 좌측 아이콘 레일 + 전폭 콘텐츠(패딩 없음). 화면 높이에 고정되어 패널이 각자 스크롤한다 — 트리아지·로그
 * 골격(원장·보드·관측 벽·문서 …)은 화면마다 고른다 — 쉘은 서비스에 하나.
 * ────────────────────────────────────────────────────────────── */

/** 쉘 배치 — @se/tokens 의 `Shell`(se.identity.json 의 shell) 그대로 */
export type ShellLayout = Shell

const LayoutCtx = React.createContext<ShellLayout>(DEFAULT_SHELL)
/** 지금 쉘의 배치. NavItem·NavSection 이 배치에 맞춰 모양을 바꾼다 */
export function useShellLayout(): ShellLayout {
  return React.useContext(LayoutCtx)
}

export interface AppShellProps {
  /** 서비스 이름 — se.identity.json의 name */
  name: string
  /** 마크: 모노그램 텍스트 또는 아이콘 노드 */
  mark: React.ReactNode
  /** 로크업 아래 한 줄 (환경·팀 등). topnav·panes 에서는 이름 옆 muted 로 */
  subtitle?: string
  /** 쉘 배치 — se.identity.json 의 shell. 기본 sidebar */
  layout?: ShellLayout
  nav: React.ReactNode
  /** 상단 바 우측 (갱신 시각·아바타 등) */
  topEnd?: React.ReactNode
  /** 커맨드 팔레트 그룹. 주면 상단 검색 버튼 + ⌘K가 켜진다 */
  command?: CommandGroup[]
  searchPlaceholder?: string
  /** 콘텐츠 최대 폭(px). 표가 화면 끝까지 늘어나지 않게. panes 는 전폭이라 무시 */
  maxWidth?: number
  /** 크레딧 — sidebar 는 사이드바 하단, topnav 는 푸터, panes 는 헤더 우측. 기본 "SE · Web Toolkit", `false`/`null` 이면 숨김, 노드면 그것으로 (버전·환경 등) */
  credit?: React.ReactNode
  children: React.ReactNode
}

/** 세 배치가 같은 재료를 다른 자리에 놓는다 */
interface Slots {
  name: string
  mark: React.ReactNode
  subtitle?: string
  nav: React.ReactNode
  search: React.ReactNode
  topEnd?: React.ReactNode
  credit?: React.ReactNode
  maxWidth: number
  children: React.ReactNode
}

export function AppShell({
  name,
  mark,
  subtitle,
  layout = DEFAULT_SHELL,
  nav,
  topEnd,
  command,
  searchPlaceholder = '검색',
  credit = 'SE · Web Toolkit',
  maxWidth = 1120,
  children,
}: AppShellProps) {
  const palette = useCommandPalette()
  const search = command ? (
    <button
      type="button"
      onClick={() => palette.setOpen(true)}
      className={cn(
        'flex h-9 items-center gap-2 rounded-md border border-line-strong/80 bg-surface px-3 text-sm text-muted shadow-xs',
        'transition-colors hover:border-line-strong hover:text-ink',
        layout === 'sidebar' ? 'w-72' : 'w-56 xl:w-72',
      )}
    >
      <Search className="size-4" aria-hidden />
      <span className="flex-1 text-left">{searchPlaceholder}</span>
      <kbd className="rounded-sm border border-line px-1 font-mono text-[10px] leading-4">⌘K</kbd>
    </button>
  ) : null
  const Layout = LAYOUTS[layout]
  return (
    <LayoutCtx.Provider value={layout}>
      <Layout name={name} mark={mark} subtitle={subtitle} nav={nav} search={search} topEnd={topEnd} credit={credit} maxWidth={maxWidth}>
        {children}
      </Layout>
      {command ? <CommandPalette open={palette.open} onOpenChange={palette.setOpen} groups={command} placeholder={searchPlaceholder} /> : null}
    </LayoutCtx.Provider>
  )
}

function SidebarLayout({ name, mark, subtitle, nav, search, topEnd, credit, maxWidth, children }: Slots) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col border-r border-line bg-canvas px-3 py-3 xl:w-[232px]">
        <Lockup mark={mark} name={name} subtitle={subtitle} />
        <nav className="mt-3 flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="주 메뉴">
          {nav}
        </nav>
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          {credit ? <span className="hidden truncate text-[11px] text-muted xl:inline">{credit}</span> : null}
          <ThemeToggle />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <div className="mx-auto flex w-full flex-col" style={{ maxWidth }}>
          <header className="flex h-14 items-center gap-3 px-6 xl:px-8">
            {search}
            <div className="ml-auto flex items-center gap-3">{topEnd}</div>
          </header>
          <main className="flex min-w-0 flex-1 flex-col px-6 pb-16 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

function TopnavLayout({ name, mark, subtitle, nav, search, topEnd, credit, maxWidth, children }: Slots) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full items-center gap-5 px-6 xl:px-8" style={{ maxWidth }}>
          <Lockup mark={mark} name={name} subtitle={subtitle} inline />
          <nav className="flex h-full min-w-0 flex-1 items-stretch gap-1 overflow-x-auto" aria-label="주 메뉴">
            {nav}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {search}
            {topEnd}
            <ThemeToggle compact />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full flex-1 flex-col" style={{ maxWidth }}>
        <main className="flex min-w-0 flex-1 flex-col px-6 pb-16 xl:px-8">{children}</main>
        {credit ? <footer className="px-6 pb-6 text-[11px] text-muted xl:px-8">{credit}</footer> : null}
      </div>
    </div>
  )
}

function PanesLayout({ name, mark, subtitle, nav, search, topEnd, credit, children }: Slots) {
  return (
    // 화면 높이에 고정 — 패널(목록·본문·속성)이 각자 스크롤하고 헤더·레일은 남는다
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside className="flex h-full w-14 shrink-0 flex-col items-center border-r border-line bg-canvas py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label={name} className="rounded-md">
              <Mark size="md">{mark}</Mark>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{name}{subtitle ? ` · ${subtitle}` : ''}</TooltipContent>
        </Tooltip>
        <nav className="mt-3 flex flex-1 flex-col items-center gap-1 overflow-y-auto" aria-label="주 메뉴">
          {nav}
        </nav>
        <ThemeToggle compact />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4">
          <span className="text-sm font-semibold text-ink">{name}</span>
          {subtitle ? <span className="text-xs text-muted">{subtitle}</span> : null}
          <div className="ml-auto flex items-center gap-3">
            {search}
            {topEnd}
            {credit ? <span className="hidden text-[11px] text-muted xl:inline">{credit}</span> : null}
          </div>
        </header>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}

const LAYOUTS: Record<ShellLayout, (slots: Slots) => React.JSX.Element> = { sidebar: SidebarLayout, topnav: TopnavLayout, panes: PanesLayout }

/** 서비스 마크 — 모든 배치에서 같은 질감(액센트 블록 + 모노 글자) */
function Mark({ size = 'sm', children }: { size?: 'sm' | 'md'; children: React.ReactNode }) {
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-md bg-accent font-mono text-xs font-semibold text-on-accent shadow-xs', size === 'md' ? 'size-8' : 'size-7')} aria-hidden>
      {children}
    </span>
  )
}

const LOCKUP = 'flex shrink-0 items-center gap-2.5 rounded-md px-2 text-left transition-colors hover:bg-surface-2'

/** 마크 + 서비스명 로크업. `inline` 은 topnav 용(한 줄) */
function Lockup({ mark, name, subtitle, inline }: { mark: React.ReactNode; name: string; subtitle?: string; inline?: boolean }) {
  return (
    <button type="button" className={inline ? `${LOCKUP} h-9 -ml-2` : `${LOCKUP} h-10`}>
      <Mark>{mark}</Mark>
      {inline ? (
        <span className="flex min-w-0 items-baseline gap-2 leading-tight">
          <span className="truncate text-sm font-semibold text-ink" title={name}>{name}</span>
          {subtitle ? <span className="hidden truncate text-[11px] text-muted xl:inline" title={subtitle}>{subtitle}</span> : null}
        </span>
      ) : (
        <>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-ink" title={name}>{name}</span>
            {subtitle ? <span className="truncate text-[11px] text-muted" title={subtitle}>{subtitle}</span> : null}
          </span>
          <ChevronsUpDown className="size-3.5 text-muted" aria-hidden />
        </>
      )}
    </button>
  )
}

/**
 * 네비 항목의 모양 — 배치별 변형. 공통: 전이·svg 처리·활성 색.
 *  topnav: 항목은 줄지 않고(shrink-0) 네비가 가로 스크롤한다. 직접 자식 span(라벨)도 flex-none — asChild 원본이 `flex-1 truncate` 여도 말줄임되지 않게
 *  panes : 아이콘만. 링크의 **직접 자식 span**(라벨·카운트)은 스크린리더 전용 — 아이콘은 svg 로 두고 span 으로 감싸지 않는다
 */
const navItemVariants = cva(
  [
    'transition-colors duration-150',
    '[&_svg]:shrink-0 [&_svg]:text-muted aria-[current=page]:[&_svg]:text-accent-fg',
  ],
  {
    variants: {
      layout: {
        sidebar: 'flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-ink/80 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:font-medium aria-[current=page]:text-accent-fg [&_svg]:size-4',
        topnav: [
          'relative flex h-full shrink-0 items-center gap-2 px-2.5 text-sm text-ink/75 hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink [&_svg]:size-4',
          'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-t-sm after:bg-transparent aria-[current=page]:after:bg-accent',
          '[&>span]:flex-none',
        ],
        panes: 'grid size-9 place-items-center rounded-md text-ink/75 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent-fg [&_svg]:size-[18px] [&>span]:sr-only',
      },
    },
    defaultVariants: { layout: DEFAULT_SHELL },
  },
)

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode
  active?: boolean
  /** 우측 카운트 등 */
  end?: React.ReactNode
  /** panes 배치의 아이콘 레일에서 툴팁으로 보여 줄 이름. asChild 로 감쌌을 때 넘긴다 (없으면 툴팁 없음, 라벨은 스크린리더에만) */
  label?: string
  asChild?: boolean
}

/**
 * 라우터 링크를 쓰려면 `asChild`로 감싼다: `<NavItem asChild><NavLink to=…>{icon}<span>이름</span></NavLink></NavItem>`.
 * 배치에 따라 모양이 바뀐다 — sidebar: 행, topnav: 밑줄 탭, panes: 아이콘만(이름은 툴팁·스크린리더).
 */
export function NavItem({ icon, active, end, label, className, children, asChild, ...props }: NavItemProps) {
  const layout = useShellLayout()
  const Comp = asChild ? Slot : 'a'
  const node = (
    <Comp aria-current={active ? 'page' : undefined} className={cn(navItemVariants({ layout }), className)} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {icon}
          <span className="flex-1 truncate">{children}</span>
          {end ? <span className="text-xs text-muted tnum">{end}</span> : null}
        </>
      )}
    </Comp>
  )
  if (layout !== 'panes') return node
  const tip = label ?? (typeof children === 'string' ? children : undefined)
  if (!tip) return node
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="right">
        {tip}
        {end ? <span className="ml-1.5 text-muted tnum">{end}</span> : null}
      </TooltipContent>
    </Tooltip>
  )
}

const NAV_SECTION: Record<ShellLayout, string> = {
  sidebar: 'flex flex-col gap-0.5 pt-4 first:pt-0',
  topnav: 'flex items-stretch gap-1 [&+&]:ml-2 [&+&]:border-l [&+&]:border-line [&+&]:pl-3',
  panes: 'flex flex-col items-center gap-1 [&+&]:mt-2 [&+&]:border-t [&+&]:border-line [&+&]:pt-2',
}

/** 네비 묶음. sidebar 는 제목 있는 세로 묶음, topnav 는 가로(제목은 스크린리더만), panes 는 구분선 있는 세로 묶음 */
export function NavSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const layout = useShellLayout()
  return (
    <div className={NAV_SECTION[layout]} role="group" aria-label={layout === 'sidebar' ? undefined : title}>
      {layout === 'sidebar' && title ? <div className="px-2 pb-1 text-[11px] font-medium text-muted">{title}</div> : null}
      {children}
    </div>
  )
}

/** 페이지 상단: 제목 + 설명 + 우측 액션. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pt-5', className)}>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** 페이지 본문 컨테이너 — 섹션 간 24px. 화면마다 같은 리듬 */
export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-1 flex-col gap-6 motion-safe:animate-[se-rise_220ms_cubic-bezier(.2,0,0,1)]', className)} {...props} />
}

const MODES: Array<{ value: ThemeMode; icon: React.ReactNode; label: string }> = [
  { value: 'light', icon: <Sun />, label: '라이트' },
  { value: 'system', icon: <Monitor />, label: '시스템' },
  { value: 'dark', icon: <Moon />, label: '다크' },
]
/** compact 토글의 순환 순서 */
const NEXT_MODE: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'system', system: 'light' }

/** 테마 토글. `compact` 는 버튼 하나로 라이트 → 다크 → 시스템 순환 (topnav·panes 의 좁은 자리) */
export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { mode, setMode } = useTheme()
  if (compact) {
    const cur = MODES.find((m) => m.value === mode) ?? MODES[1]!
    const next = MODES.find((m) => m.value === NEXT_MODE[cur.value])!
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`테마: ${cur.label} (누르면 ${next.label})`} onClick={() => setMode(next.value)} className="size-8 text-muted [&_svg]:size-4">
            {cur.icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>테마: {cur.label}</TooltipContent>
      </Tooltip>
    )
  }
  return (
    <div className="flex items-center rounded-md bg-surface-2 p-0.5" role="radiogroup" aria-label="테마">
      {MODES.map((m) => (
        <Tooltip key={m.value}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              role="radio"
              aria-checked={mode === m.value}
              aria-label={m.label}
              onClick={() => setMode(m.value)}
              className={cn('size-6 [&_svg]:size-3.5', mode === m.value && 'bg-surface text-ink shadow-xs hover:bg-surface')}
            >
              {m.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{m.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
