import * as React from 'react'
import { Command } from 'cmdk'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  keywords?: string[]
}

interface Base {
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}
export type ComboboxProps =
  | (Base & { multiple?: false; value: string | null; onChange: (v: string | null) => void })
  | (Base & { multiple: true; value: string[]; onChange: (v: string[]) => void })

const filter = (value: string, search: string) => {
  const v = value.toLowerCase()
  const q = search.trim().toLowerCase()
  if (!q) return 1
  if (v.startsWith(q)) return 2
  return q.split(/\s+/).every((w) => v.includes(w)) ? 1 : 0
}

/** 검색되는 셀렉트. 항목이 8개를 넘으면 Select 대신 이걸 쓴다 */
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>((props, ref) => {
  const { options, placeholder = '선택…', searchPlaceholder = '검색…', emptyText = '결과가 없습니다', disabled, className, id } = props
  const [open, setOpen] = React.useState(false)
  const selected = props.multiple ? props.value : props.value ? [props.value] : []
  const byValue = new Map(options.map((o) => [o.value, o]))

  const toggle = (v: string) => {
    if (props.multiple) {
      props.onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
    } else {
      props.onChange(props.value === v ? null : v)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={props['aria-invalid']}
          aria-describedby={props['aria-describedby']}
          disabled={disabled}
          className={cn(
            'flex min-h-control w-full items-center gap-2 rounded-md border border-line-strong/80 bg-surface px-3 py-1 text-left text-sm shadow-xs',
            'transition-colors duration-150 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
            'aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted">{placeholder}</span>
            ) : props.multiple ? (
              selected.map((v) => (
                <span key={v} className="inline-flex h-6 items-center gap-1 rounded-sm bg-surface-2 pl-2 pr-1 text-xs text-ink">
                  {byValue.get(v)?.label ?? v}
                  <span
                    role="button"
                    aria-label={`${byValue.get(v)?.label ?? v} 제거`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(v)
                    }}
                    className="grid size-4 place-items-center rounded-sm text-muted hover:bg-line hover:text-ink"
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))
            ) : (
              <span className="text-ink">{byValue.get(selected[0]!)?.label ?? selected[0]}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[240px] p-0">
        <Command filter={filter} loop>
          <Command.Input placeholder={searchPlaceholder} className="h-9 w-full border-b border-line bg-transparent px-3 text-sm outline-none placeholder:text-muted" />
          <Command.List className="max-h-64 overflow-y-auto p-1">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted">{emptyText}</Command.Empty>
            {options.map((o) => {
              const on = selected.includes(o.value)
              return (
                <Command.Item
                  key={o.value}
                  value={`${o.label} ${o.keywords?.join(' ') ?? ''}`}
                  onSelect={() => toggle(o.value)}
                  className="flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-surface-2"
                >
                  <span className={cn('grid size-4 place-items-center', on ? 'text-accent-fg' : 'text-transparent')}>
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-ink">{o.label}</span>
                    {o.description ? <span className="truncate text-xs text-muted">{o.description}</span> : null}
                  </span>
                </Command.Item>
              )
            })}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
Combobox.displayName = 'Combobox'
