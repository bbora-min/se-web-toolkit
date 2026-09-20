import * as React from 'react'
import { accentScale } from '@se/tokens'
import { cn } from '../lib/cn'

/**
 * 형제 서비스의 마크 — hue 하나로 그린다.
 * 이 앱의 토큰에는 남의 서비스 색이 없으므로 레지스트리의 hue 로 `accentScale`(토큰과 같은 공식)을 돌려
 * 라이트·다크 값을 CSS 변수로 넘기고, 어느 쪽을 쓸지는 styles.css 의 테마 셀렉터가 고른다.
 * 허브(SE Home)의 서비스 카드, 아이덴티티 시트의 가족 카드가 쓴다. 자기 서비스의 마크는 `bg-accent` — 이 컴포넌트가 아니다.
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
  const vars = React.useMemo(() => {
    const l = accentScale('light', hue), d = accentScale('dark', hue)
    return { '--se-mark-bg': l.accent, '--se-mark-fg': l['on-accent'], '--se-mark-bg-dark': d.accent, '--se-mark-fg-dark': d['on-accent'] } as React.CSSProperties
  }, [hue])
  return (
    <span
      className={cn('se-service-mark grid shrink-0 place-items-center font-mono font-semibold shadow-xs', SIZE[size], className)}
      style={{ ...vars, ...style }}
      aria-hidden
      {...props}
    >
      {children}
    </span>
  )
}
