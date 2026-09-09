import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '../lib/cn'
import { Input, type InputProps } from './input'

/**
 * 필터바 — 표 바로 위 한 줄. 왼쪽은 필터, 오른쪽(`end`)은 요약·액션.
 * 필터가 4개를 넘으면 "더 보기"로 접는다(P2).
 */
export function FilterBar({
  className,
  children,
  end,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { end?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="search" {...props}>
      {children}
      {end ? <div className="ml-auto flex items-center gap-2">{end}</div> : null}
    </div>
  )
}

export function SearchInput({ className, ...props }: InputProps) {
  return <Input type="search" leading={<Search />} className={cn('w-64', className)} {...props} />
}
