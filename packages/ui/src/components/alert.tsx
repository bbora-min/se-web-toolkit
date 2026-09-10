import * as React from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '../lib/cn'

const TONE = {
  info: { cls: 'border-info/25 bg-info-soft', icon: <Info className="text-info" />, title: 'text-info' },
  success: { cls: 'border-success/25 bg-success-soft', icon: <CheckCircle2 className="text-success" />, title: 'text-success' },
  warning: { cls: 'border-warning/30 bg-warning-soft', icon: <AlertTriangle className="text-warning" />, title: 'text-warning' },
  danger: { cls: 'border-danger/25 bg-danger-soft', icon: <XCircle className="text-danger" />, title: 'text-danger' },
}

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: keyof typeof TONE
  title: React.ReactNode
  /** 우측 액션 (버튼 1개) */
  action?: React.ReactNode
}

/** 페이지 안의 안내 배너. 토스트는 "방금 일어난 일", 배너는 "지금 상태" */
export function Alert({ tone = 'info', title, action, className, children, ...props }: AlertProps) {
  const t = TONE[tone]
  return (
    <div role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', t.cls, className)} {...props}>
      <span className="mt-0.5 [&_svg]:size-4" aria-hidden>{t.icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('font-medium', t.title)}>{title}</span>
        {children ? <div className="text-ink/80">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
