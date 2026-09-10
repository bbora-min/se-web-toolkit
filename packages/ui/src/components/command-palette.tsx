import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { CornerDownLeft, Search } from 'lucide-react'
import { cn } from '../lib/cn'

export interface CommandItem {
  id: string
  label: string
  /** 우측 보조 — 상태, 경로, 단축키 */
  hint?: React.ReactNode
  icon?: React.ReactNode
  /** 검색어 매칭에 추가로 쓸 단어들 */
  keywords?: string[]
  onSelect: () => void
}
export interface CommandGroup {
  heading: string
  items: CommandItem[]
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandGroup[]
  placeholder?: string
  /** 검색어가 바뀔 때 (서버 검색 연동용) */
  onQueryChange?: (q: string) => void
  emptyText?: string
}

/**
 * 커맨드 팔레트 — ⌘K. 페이지 이동·항목 점프·액션을 한 입력창에서.
 * 내부 도구에서 "잘 만들었다"는 인상의 절반은 여기서 나온다.
 */
export function CommandPalette({ open, onOpenChange, groups, placeholder = '명령 또는 검색…', onQueryChange, emptyText = '결과가 없습니다' }: CommandPaletteProps) {
  const [query, setQuery] = React.useState('')
  React.useEffect(() => {
    if (!open) setQuery('')
  }, [open])
  React.useEffect(() => {
    onQueryChange?.(query)
  }, [query, onQueryChange])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/25 data-[state=open]:animate-[se-fade_150ms_ease-out]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-[18vh] z-[70] w-[640px] max-w-[calc(100vw-32px)] -translate-x-1/2',
            'overflow-hidden rounded-xl border border-line bg-surface shadow-overlay',
            'data-[state=open]:animate-[se-pop_180ms_cubic-bezier(.2,0,0,1)]',
          )}
        >
          <DialogPrimitive.Title className="sr-only">명령 팔레트</DialogPrimitive.Title>
          <Command
            label="명령 팔레트"
            loop
            className="flex flex-col"
            // 퍼지 대신 부분 일치 — "etl"에 model-train이 뜨면 신뢰를 잃는다
            filter={(value, search) => {
              const v = value.toLowerCase()
              const q = search.trim().toLowerCase()
              if (!q) return 1
              if (v.startsWith(q)) return 2
              return q.split(/\s+/).every((w) => v.includes(w)) ? 1 : 0
            }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={placeholder}
                className="h-13 flex-1 bg-transparent py-4 text-md text-ink outline-none placeholder:text-muted"
              />
              <kbd className="rounded-sm border border-line px-1.5 font-mono text-[10px] leading-5 text-muted">esc</kbd>
            </div>
            <Command.List className="max-h-[380px] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-10 text-center text-sm text-muted">{emptyText}</Command.Empty>
              {groups.map((g) =>
                g.items.length ? (
                  <Command.Group
                    key={g.heading}
                    heading={g.heading}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted"
                  >
                    {g.items.map((it) => (
                      <Command.Item
                        key={it.id}
                        value={`${it.label} ${it.keywords?.join(' ') ?? ''}`}
                        onSelect={() => {
                          onOpenChange(false)
                          it.onSelect()
                        }}
                        className={cn(
                          'flex h-9 cursor-default select-none items-center gap-3 rounded-md px-2 text-sm text-ink',
                          'data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-fg',
                          '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted data-[selected=true]:[&_svg]:text-accent-fg',
                        )}
                      >
                        {it.icon}
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.hint ? <span className="text-xs text-muted">{it.hint}</span> : null}
                        <CornerDownLeft className="!size-3 opacity-0 data-[selected=true]:opacity-100" aria-hidden />
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null,
              )}
            </Command.List>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-muted">
              <span><kbd className="font-mono">↑↓</kbd> 이동</span>
              <span><kbd className="font-mono">↵</kbd> 열기</span>
              <span><kbd className="font-mono">esc</kbd> 닫기</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** ⌘K / Ctrl+K 로 팔레트를 여는 훅 */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return { open, setOpen }
}
