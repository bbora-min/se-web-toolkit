import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { useShellLayout } from './app-shell'
import { Alert, type AlertProps } from '../components/alert'

/* ──────────────────────────────────────────────────────────────
 * DocLayout · DocHeader · TreeNav · TableOfContents · Prose — 문서(document) 골격의 재료.
 * 읽는 화면이다: 좌측 트리(어디에 있나) · 중앙 65자 컬럼(본문) · 우측 목차(어디쯤인가). 크롬은 최소, 여백은 최대(Notion·GitBook).
 * 목록(스캔되는 화면)과 반대로 타이포가 전부다 — 본문은 `Prose` 안에 넣고 클래스로 꾸미지 않는다.
 * ────────────────────────────────────────────────────────────── */

export interface DocLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 좌측 — 보통 `TreeNav` */
  aside?: React.ReactNode
  /** 우측 — 보통 `TableOfContents` */
  toc?: React.ReactNode
  /** 좌·우 칸 폭(px). 기본 220 · 200 */
  asideWidth?: number
  tocWidth?: number
}

/** 쉘 배치별 상단 고정 높이(px) — topnav 는 헤더가 sticky(56), sidebar 는 헤더가 흐르므로 0, panes 는 main 이 스크롤 컨테이너라 0 */
export function useStickyTop(): number {
  const layout = useShellLayout()
  return layout === 'topnav' ? 56 : 0
}

/** 3단 문서 레이아웃. 양옆은 붙고(sticky) 본문만 흐른다. 1024 이하에서 목차는 본문 위로 접힌다. `--doc-sticky-top` 을 자식(목차·제목 scroll-margin)이 쓴다 */
export function DocLayout({ aside, toc, asideWidth = 220, tocWidth = 200, className, style, children, ...props }: DocLayoutProps) {
  const top = useStickyTop()
  return (
    <div
      className={cn('grid grid-cols-[var(--doc-cols)] items-start gap-x-10 pt-6 max-lg:grid-cols-[var(--doc-aside)_minmax(0,1fr)] max-lg:gap-x-8', className)}
      style={{ '--doc-cols': `${asideWidth}px minmax(0,1fr) ${tocWidth}px`, '--doc-aside': `${asideWidth}px`, '--doc-sticky-top': `${top}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {aside ? <aside className="sticky max-h-[calc(100vh-var(--doc-sticky-top))] overflow-y-auto pb-8 pr-2" style={{ top }}>{aside}</aside> : <div />}
      <article className="flex min-w-0 flex-col pb-24">{children}</article>
      {toc ? <nav className="sticky max-h-[calc(100vh-var(--doc-sticky-top))] overflow-y-auto pb-8 max-lg:static max-lg:col-span-2 max-lg:col-start-2 max-lg:row-start-1 max-lg:max-h-none max-lg:pb-4" style={{ top }} aria-label="목차">{toc}</nav> : null}
    </div>
  )
}

export interface DocHeaderProps {
  /** 제목 위 한 줄 — 문서 종류·경로 ("도메인 가이드 · fct") */
  eyebrow?: React.ReactNode
  title: string
  /** 한두 문장 요약 — 본문보다 크고 muted */
  summary?: React.ReactNode
  /** 작성자·갱신·감시자 등 — 점(·)으로 잇는다 */
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/** 문서 머리 — 제목이 화면의 절반을 가져도 된다(Notion). 메타는 Confluence 관례: 소유·갱신·감시 */
export function DocHeader({ eyebrow, title, summary, meta, actions, className }: DocHeaderProps) {
  return (
    <header className={cn('mb-8 flex flex-col gap-3 border-b border-line pb-6', className)}>
      {eyebrow ? <div className="text-xs font-medium tracking-wide text-muted">{eyebrow}</div> : null}
      <div className="flex items-start justify-between gap-6">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink text-balance">{title}</h1>
        {actions ? <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div> : null}
      </div>
      {summary ? <p className="max-w-[64ch] text-md leading-relaxed text-muted">{summary}</p> : null}
      {meta ? <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted [&>*+*]:before:mr-2 [&>*+*]:before:content-['·']">{meta}</div> : null}
    </header>
  )
}

/** 본문 타이포 — h2/h3/p/ul/ol/code/pre/table/blockquote 를 토큰으로. 스타일은 styles.css 의 `.se-prose` */
export function Prose({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('se-prose', className)} {...props} />
}

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertProps['tone']
  title?: React.ReactNode
}
/** 본문 속 강조 상자 — 규칙·주의·팁. `Alert` 와 같은 톤·질감에 문단 간격만. 절마다 하나씩, 연달아 쓰지 않는다 */
export function Callout({ tone = 'info', title, className, children, ...props }: CalloutProps) {
  return (
    <Alert tone={tone} title={title} className={cn('my-5', className)} {...props}>
      {children}
    </Alert>
  )
}

export interface TreeItem {
  id: string
  label: React.ReactNode
  /** 우측 보조(건수·상태) */
  hint?: React.ReactNode
  href?: string
  children?: TreeItem[]
}
export interface TreeNavProps {
  items: TreeItem[]
  activeId?: string | null
  /** 항목을 골랐을 때 — 라우터 이동은 여기서. 주면 href 의 기본 이동을 막는다 */
  onSelect?: (item: TreeItem) => void
  /** 처음 펼쳐 둘 묶음. 없으면 활성 항목의 조상만 */
  defaultExpanded?: string[]
  className?: string
  'aria-label'?: string
}

/** id 까지의 조상 경로. 못 찾으면 null */
function ancestorsOf(items: TreeItem[], id: string | null | undefined, path: string[] = []): string[] | null {
  if (!id) return null
  for (const it of items) {
    if (it.id === id) return path
    if (it.children) {
      const found = ancestorsOf(it.children, id, [...path, it.id])
      if (found) return found
    }
  }
  return null
}
const openFor = (items: TreeItem[], id: string | null | undefined) => [...(ancestorsOf(items, id) ?? []), ...(id ? [id] : [])]

/** 좌측 트리 — 묶음은 접히고, 활성 항목은 액센트. 문서 허브·데이터 사전·런북 묶음 */
export function TreeNav({ items, activeId, onSelect, defaultExpanded, className, 'aria-label': ariaLabel = '문서' }: TreeNavProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpanded ?? openFor(items, activeId)))
  // 활성 항목이 바뀔 때만 그 조상과 자기 자신을 펼친다 — 부모가 다시 그려도 사용자가 접은 건 접힌 채로
  const itemsRef = React.useRef(items)
  itemsRef.current = items
  React.useEffect(() => {
    const open = openFor(itemsRef.current, activeId)
    if (open.length) setExpanded((s) => new Set([...s, ...open]))
  }, [activeId])
  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const render = (list: TreeItem[], depth: number) => (
    <ul className={cn('flex flex-col gap-px', depth > 0 && 'ml-3 border-l border-line pl-2')} role={depth === 0 ? 'tree' : 'group'}>
      {list.map((it) => {
        const open = expanded.has(it.id)
        const active = it.id === activeId
        const hasKids = Boolean(it.children?.length)
        return (
          <li key={it.id} role="treeitem" aria-expanded={hasKids ? open : undefined} aria-selected={active}>
            <div className={cn('flex h-7 items-center gap-1 rounded-md pr-2 text-[13px]', active ? 'bg-accent-soft font-medium text-accent-fg' : 'text-ink/80 hover:bg-surface-2 hover:text-ink')}>
              {hasKids ? (
                <button type="button" onClick={() => toggle(it.id)} aria-label={open ? '접기' : '펼치기'} className="grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:text-ink">
                  <ChevronRight className={cn('size-3.5 transition-transform', open && 'rotate-90')} />
                </button>
              ) : (
                <span className="size-6 shrink-0" aria-hidden />
              )}
              <a
                href={it.href ?? '#'}
                aria-current={active ? 'page' : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 truncate"
                onClick={(e) => {
                  if (!onSelect) return
                  e.preventDefault()
                  onSelect(it)
                }}
              >
                <span className="truncate">{it.label}</span>
                {it.hint ? <span className="ml-auto shrink-0 text-[11px] text-muted tnum">{it.hint}</span> : null}
              </a>
            </div>
            {hasKids && open ? render(it.children!, depth + 1) : null}
          </li>
        )
      })}
    </ul>
  )
  return <nav aria-label={ariaLabel} className={className}>{render(items, 0)}</nav>
}

export interface TocItem {
  id: string
  label: string
  /** 2 = h2(기본), 3 = h3 */
  level?: 2 | 3
}
export interface TableOfContentsProps {
  items: TocItem[]
  /** 스크롤 감지 기준선(px). 기본: 쉘의 sticky 높이 + 40 */
  offset?: number
  title?: string
  className?: string
}

/** 우측 목차 — 스크롤에 따라 현재 절이 액센트. 항목은 본문의 `id` 를 가진 제목 */
export function TableOfContents({ items, offset, title = '이 문서에서', className }: TableOfContentsProps) {
  const top = useStickyTop()
  const threshold = offset ?? top + 40
  const key = items.map((i) => i.id).join('|')
  const [active, setActive] = React.useState<string | null>(items[0]?.id ?? null)
  React.useEffect(() => {
    const els = key.split('|').map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e))
    if (!els.length) return
    const onScroll = () => {
      let cur = els[0]!.id
      for (const el of els) if (el.getBoundingClientRect().top - threshold <= 0) cur = el.id
      setActive(cur)
    }
    onScroll()
    // capture: panes 배치처럼 main 이 스크롤 컨테이너여도 잡힌다
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [key, threshold])
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{title}</div>
      <ol className="flex flex-col border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                history.replaceState(null, '', `#${i.id}`)
              }}
              aria-current={active === i.id ? 'location' : undefined}
              className={cn(
                '-ml-px block truncate border-l py-1 text-[13px] transition-colors',
                i.level === 3 ? 'pl-6' : 'pl-3',
                active === i.id ? 'border-accent font-medium text-accent-fg' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
