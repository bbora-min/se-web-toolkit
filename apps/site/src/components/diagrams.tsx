/**
 * 문서용 작은 도식들 — 전부 div 와 토큰 색. 그림 파일이 아니라 코드라 다크 모드·글꼴이 본문과 같다.
 *  Figure  : 테두리 + 캡션
 *  Flow    : 상자 → 상자 (한 줄, 좁으면 줄바꿈)
 *  Stack   : 위에서 아래로 쌓인 층 (계층·의존 방향)
 *  Tree    : 파일 트리
 *  Compare : 스크린샷 나란히 + 라벨
 *  Steps   : 큰 번호가 달린 단계
 */
import * as React from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { cn } from '@se/ui'
import { Shot } from './Shot'

export function Figure({ caption, children, className }: { caption?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <figure className={cn('not-prose my-6 flex flex-col gap-3 rounded-xl border border-line bg-canvas p-5', className)}>
      {children}
      {caption ? <figcaption className="text-xs leading-relaxed text-muted">{caption}</figcaption> : null}
    </figure>
  )
}

export type FlowNode = { label: React.ReactNode; note?: React.ReactNode; tone?: 'default' | 'accent' | 'muted' }
const NODE: Record<NonNullable<FlowNode['tone']>, string> = {
  default: 'border-line bg-surface text-ink',
  accent: 'border-accent/40 bg-accent-soft text-accent-fg',
  muted: 'border-dashed border-line-strong bg-canvas text-muted',
}
export function Flow({ steps, className }: { steps: Array<FlowNode | string>; className?: string }) {
  const nodes = steps.map((s) => (typeof s === 'string' ? { label: s } : s))
  return (
    <div className={cn('not-prose my-4 flex flex-wrap items-center gap-2 text-sm', className)}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <span className={cn('flex flex-col rounded-md border px-3 py-1.5', NODE[n.tone ?? 'default'])}>
            <span className="text-[13px] font-medium">{n.label}</span>
            {n.note ? <span className="text-[11px] font-normal text-muted">{n.note}</span> : null}
          </span>
          {i < nodes.length - 1 ? <ArrowRight className="size-3.5 shrink-0 text-muted" aria-hidden /> : null}
        </React.Fragment>
      ))}
    </div>
  )
}

export function Stack({ layers }: { layers: Array<{ title: string; items: string[]; note?: string; tone?: 'default' | 'accent' }> }) {
  return (
    <div className="not-prose flex flex-col items-stretch gap-1">
      {layers.map((l, i) => (
        <React.Fragment key={l.title}>
          <div className={cn('grid gap-1 rounded-lg border px-4 py-3 md:grid-cols-[9rem_1fr_auto] md:items-center', l.tone === 'accent' ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface')}>
            <span className={cn('text-sm font-semibold', l.tone === 'accent' ? 'text-accent-fg' : 'text-ink')}>{l.title}</span>
            <span className="flex flex-wrap gap-1.5">
              {l.items.map((it) => <span key={it} className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink/85">{it}</span>)}
            </span>
            {l.note ? <span className="text-[11px] text-muted md:text-right">{l.note}</span> : null}
          </div>
          {i < layers.length - 1 ? <ArrowDown className="mx-auto size-3.5 text-muted" aria-hidden /> : null}
        </React.Fragment>
      ))}
    </div>
  )
}

export type TreeNode = { name: string; note?: string; children?: TreeNode[]; mark?: boolean }
function TreeRows({ nodes, depth }: { nodes: TreeNode[]; depth: number }) {
  return (
    <>
      {nodes.map((n) => (
        <React.Fragment key={n.name}>
          <div className={cn('grid grid-cols-[minmax(0,18rem)_1fr] items-baseline gap-3 py-0.5 pl-1', n.mark && 'rounded bg-accent-soft/60')}>
            <span className={cn('truncate font-mono text-[12px]', n.children ? 'text-ink' : 'text-ink/85', n.mark && 'font-semibold text-accent-fg')} style={{ paddingLeft: depth * 16 }}>{n.name}{n.children ? '/' : ''}</span>
            {n.note ? <span className="text-[11px] text-muted">{n.note}</span> : null}
          </div>
          {n.children ? <TreeRows nodes={n.children} depth={depth + 1} /> : null}
        </React.Fragment>
      ))}
    </>
  )
}
export function Tree({ nodes }: { nodes: TreeNode[] }) {
  return <div className="not-prose overflow-x-auto"><TreeRows nodes={nodes} depth={0} /></div>
}

export function Compare({ items, cols = 3 }: { items: Array<{ src: string; label: string; note?: string }>; cols?: 2 | 3 }) {
  return (
    <div className={cn('not-prose grid gap-4', cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-2">
          <Shot src={it.src} alt={it.label} crop />
          <span className="text-sm font-medium text-ink">{it.label}</span>
          {it.note ? <span className="text-xs text-muted">{it.note}</span> : null}
        </div>
      ))}
    </div>
  )
}

export function Steps({ items }: { items: Array<{ title: string; body: React.ReactNode }> }) {
  return (
    <ol className="not-prose my-4 flex flex-col gap-4">
      {items.map((s, i) => (
        <li key={s.title} className="grid grid-cols-[2rem_1fr] gap-3">
          <span className="grid size-7 place-items-center rounded-full bg-accent font-mono text-[12px] font-semibold text-on-accent">{i + 1}</span>
          <div className="flex flex-col gap-1.5 pt-0.5">
            <span className="font-medium text-ink">{s.title}</span>
            <div className="text-sm leading-relaxed text-ink/80 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px] [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-line [&_pre]:bg-canvas [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[12px] [&_pre_code]:bg-transparent [&_pre_code]:p-0">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
