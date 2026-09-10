import * as React from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { cn } from '../lib/cn'

interface StateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  /** 원인이나 다음 행동을 한 문장으로 */
  description?: string
  /** 다음 행동 버튼. 빈 상태에는 거의 항상 있어야 한다 */
  action?: React.ReactNode
  icon?: React.ReactNode
}

function StateFrame({ title, description, action, icon, className, ...props }: StateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}
      {...props}
    >
      <div className="grid size-12 place-items-center rounded-full bg-surface-2 text-muted [&_svg]:size-5" aria-hidden>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-md font-semibold text-ink">{title}</p>
        {description ? <p className="max-w-[44ch] text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-1 flex items-center gap-2">{action}</div> : null}
    </div>
  )
}

/** 데이터가 0건일 때. "없음"이 아니라 "다음에 무엇을 할지"를 말한다 */
export function EmptyState(props: StateProps) {
  return <StateFrame icon={<Inbox />} {...props} />
}

/** 실패했을 때. 원인 + 해결(재시도 버튼)을 함께 보여준다 */
export function ErrorState({ icon, ...props }: StateProps) {
  return (
    <StateFrame
      role="alert"
      icon={icon ?? <AlertTriangle className="text-danger" />}
      className="[&>div:first-child]:bg-danger-soft"
      {...props}
    />
  )
}
