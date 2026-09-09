import * as React from 'react'
import { cn } from '../lib/cn'

/** 로딩 자리표시. 최종 콘텐츠와 같은 크기·위치로 놓아 레이아웃이 튀지 않게 한다 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-sm bg-line', className)} aria-hidden {...props} />
}
