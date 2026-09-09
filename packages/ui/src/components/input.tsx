import * as React from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 왼쪽 아이콘 (검색 등) */
  leading?: React.ReactNode
  /** ID·해시·경로 입력이면 mono */
  mono?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, mono, ...props }, ref) => (
    <div className={cn('relative flex items-center', className)}>
      {leading ? (
        <span className="pointer-events-none absolute left-3 text-muted [&_svg]:size-4" aria-hidden>
          {leading}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          'h-control w-full rounded-md border border-line-strong/80 bg-surface px-3 text-sm text-ink shadow-xs',
          'placeholder:text-muted',
          'transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          leading && 'pl-9',
          mono && 'font-mono',
        )}
        {...props}
      />
    </div>
  ),
)
Input.displayName = 'Input'
