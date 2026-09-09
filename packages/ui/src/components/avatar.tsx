import * as React from 'react'
import { cn } from '../lib/cn'

/** 이니셜 아바타. 사진 없는 내부 도구에 딱 필요한 만큼 */
export function Avatar({ name, size = 'sm', className }: { name: string; size?: 'sm' | 'md'; className?: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase()
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full bg-surface-2 font-medium text-muted select-none',
        size === 'sm' ? 'size-5 text-[10px]' : 'size-7 text-xs',
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}
