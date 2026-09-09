import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { JobState, StatusKey } from '@se/tokens'
import { cn } from '../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 h-5 text-xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-soft text-ink',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
        accent: 'bg-accent-soft text-accent-fg',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

const JOB_TONE: Record<JobState, StatusKey | 'neutral'> = {
  pending: 'warning',
  running: 'info',
  succeeded: 'success',
  failed: 'danger',
  cancelled: 'neutral',
}
const JOB_LABEL: Record<JobState, string> = {
  pending: '대기',
  running: '실행 중',
  succeeded: '성공',
  failed: '실패',
  cancelled: '취소됨',
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'children'> {
  state: JobState
  /** 기본 한국어 라벨 대신 표시할 텍스트 */
  label?: string
}

/** 작업 상태 배지. 상태 → 색 매핑은 브랜드 코어에 고정되어 있어 서비스마다 같다 */
export function StatusBadge({ state, label, className, ...props }: StatusBadgeProps) {
  return (
    <Badge tone={JOB_TONE[state]} className={cn(className)} {...props}>
      {state === 'running' ? (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-info" />
        </span>
      ) : (
        <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
      )}
      {label ?? JOB_LABEL[state]}
    </Badge>
  )
}
