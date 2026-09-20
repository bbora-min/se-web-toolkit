import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * 형제 서비스의 마크 — hue 하나로 그린다.
 * 이 앱의 토큰에는 남의 서비스 색이 없으므로 레지스트리의 hue 로 계산한다. 허브(SE Home)의 서비스 카드,
 * 아이덴티티 시트의 가족 카드가 쓴다. 자기 서비스의 마크는 `bg-accent` 로 — 이 컴포넌트가 아니다.
 */
export interface ServiceMarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 레지스트리의 액센트 hue (0–360) */
  hue: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** 모노그램 글자 (1–3자) */
  children: React.ReactNode
}

const SIZE: Record<NonNullable<ServiceMarkProps['size']>, string> = {
  xs: 'size-5 rounded-sm text-[10px]',
  sm: 'size-6 rounded-md text-[11px]',
  md: 'size-8 rounded-md text-xs',
  lg: 'size-10 rounded-lg text-sm',
}

export function ServiceMark({ hue, size = 'sm', className, style, children, ...props }: ServiceMarkProps) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center font-mono font-semibold shadow-xs', SIZE[size], className)}
      // eslint-disable-next-line se/no-raw-color -- 형제 서비스의 색은 이 앱의 토큰에 없다. hue 로 계산하는 것이 이 컴포넌트의 목적. 밝기 0.5 위 흰 글자는 모든 hue 에서 4.5:1 이상
      style={{ background: `oklch(0.5 0.12 ${hue})`, color: '#fff', ...style }}
      aria-hidden
      {...props}
    >
      {children}
    </span>
  )
}
