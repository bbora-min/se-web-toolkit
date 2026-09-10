import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronsUpDown, Monitor, Moon, Search, Sun } from 'lucide-react'
import { cn } from '../lib/cn'
import { useTheme, type ThemeMode } from '../lib/theme'
import { Button } from '../components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tooltip'

/* ──────────────────────────────────────────────────────────────
 * AppShell — 브랜드 코어. 연한 회색 사이드바 + 흰 콘텐츠.
 * 사이드바 상단의 "마크 + 서비스명" 로크업, 콘텐츠 상단의 검색(⌘K)은
 * 모든 서비스에서 같은 자리. 아이덴티티는 마크 색과 시그니처 슬롯으로 드러난다.
 * ────────────────────────────────────────────────────────────── */

export interface AppShellProps {
  /** 서비스 이름 — se.identity.json의 name */
  name: string
  /** 마크: 모노그램 텍스트 또는 아이콘 노드 */
  mark: React.ReactNode
  /** 로크업 아래 한 줄 (환경·팀 등) */
  subtitle?: string
  nav: React.ReactNode
  /** 상단 바 우측 (갱신 시각·아바타 등) */
  topEnd?: React.ReactNode
  /** 검색 클릭 핸들러. 없으면 검색 버튼을 숨긴다 */
  onSearch?: () => void
  searchPlaceholder?: string
  /** 콘텐츠 최대 폭(px). 표가 화면 끝까지 늘어나지 않게 */
  maxWidth?: number
  children: React.ReactNode
}

export function AppShell({
  name,
  mark,
  subtitle,
  nav,
  topEnd,
  onSearch,
  searchPlaceholder = '검색',
  maxWidth = 1120,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col border-r border-line bg-canvas px-3 py-3 xl:w-[232px]">
        <button
          type="button"
          className="flex h-10 items-center gap-2.5 rounded-md px-2 text-left transition-colors hover:bg-surface-2"
        >
          <span
            className="grid size-7 shrink-0 place-items-center rounded-md bg-accent font-mono text-xs font-semibold text-on-accent shadow-xs"
            aria-hidden
          >
            {mark}
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-ink">{name}</span>
            {subtitle ? <span className="truncate text-[11px] text-muted">{subtitle}</span> : null}
          </span>
          <ChevronsUpDown className="size-3.5 text-muted" aria-hidden />
        </button>
        <nav className="mt-3 flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="주 메뉴">
          {nav}
        </nav>
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <span className="hidden truncate text-[11px] text-muted xl:inline">
            SE <span className="mx-0.5">·</span> Web Toolkit
          </span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <div className="mx-auto flex w-full flex-col" style={{ maxWidth }}>
          <header className="flex h-14 items-center gap-3 px-6 xl:px-8">
            {onSearch ? (
              <button
                type="button"
                onClick={onSearch}
                className={cn(
                  'flex h-9 w-72 items-center gap-2 rounded-md border border-line-strong/80 bg-surface px-3 text-sm text-muted shadow-xs',
                  'transition-colors hover:border-line-strong hover:text-ink',
                )}
              >
                <Search className="size-4" aria-hidden />
                <span className="flex-1 text-left">{searchPlaceholder}</span>
                <kbd className="rounded-sm border border-line px-1 font-mono text-[10px] leading-4">⌘K</kbd>
              </button>
            ) : null}
            <div className="ml-auto flex items-center gap-3">{topEnd}</div>
          </header>
          <main className="flex min-w-0 flex-1 flex-col px-6 pb-16 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode
  active?: boolean
  /** 우측 카운트 등 */
  end?: React.ReactNode
  asChild?: boolean
}

/** 라우터 링크를 쓰려면 `asChild`로 감싼다: `<NavItem asChild><NavLink to=…>…</NavLink></NavItem>` */
export function NavItem({ icon, active, end, className, children, asChild, ...props }: NavItemProps) {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-ink/80',
        'transition-colors duration-150 hover:bg-surface-2 hover:text-ink',
        'aria-[current=page]:bg-accent-soft aria-[current=page]:font-medium aria-[current=page]:text-accent-fg',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted aria-[current=page]:[&_svg]:text-accent-fg',
        className,
      )}
      {...props}
    >
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
}

export function NavSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 pt-4 first:pt-0">
      {title ? <div className="px-2 pb-1 text-[11px] font-medium text-muted">{title}</div> : null}
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
    <div className={cn('flex items-start justify-between gap-4 pt-4', className)}>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** 페이지 본문 컨테이너 — 섹션 간 24px. 화면마다 같은 리듬 */
export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-1 flex-col gap-6', className)} {...props} />
}

const MODES: Array<{ value: ThemeMode; icon: React.ReactNode; label: string }> = [
  { value: 'light', icon: <Sun />, label: '라이트' },
  { value: 'system', icon: <Monitor />, label: '시스템' },
  { value: 'dark', icon: <Moon />, label: '다크' },
]

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
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
