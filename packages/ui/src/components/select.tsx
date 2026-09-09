import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'

export interface SelectOption {
  value: string
  label: string
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
  /** 첫 항목으로 보여줄 "전체" 같은 라벨 */
  placeholder?: string
}

/** 네이티브 select. 필터바처럼 값 목록이 짧고 정적인 곳에 쓴다 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <div className={cn('relative inline-flex', className)}>
      <select
        ref={ref}
        className={cn(
          'h-control w-full appearance-none rounded-md border border-line-strong/80 bg-surface pl-3 pr-8 text-sm text-ink shadow-xs',
          'transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  ),
)
Select.displayName = 'Select'
