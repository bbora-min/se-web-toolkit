// 원본: examples/release-desk/src/pages/releases/bits.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import { Avatar, Badge, Tooltip, TooltipContent, TooltipTrigger, cn } from '@se/ui'
import { STAGES, type Approver, type ReleaseType, type Risk, type StageId } from '../../api/types'

const STAGE_TONE: Record<StageId, 'neutral' | 'info' | 'warning' | 'accent' | 'success'> = {
  draft: 'neutral', review: 'info', staging: 'warning', approval: 'accent', deploy: 'accent', done: 'success',
}
export function StageBadge({ stage, blocked }: { stage: StageId; blocked?: string }) {
  const label = STAGES.find((s) => s.id === stage)!.label
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge tone={STAGE_TONE[stage]}>{label}</Badge>
      {blocked ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="size-1.5 rounded-full bg-warning" aria-label={`막힘: ${blocked}`} />
          </TooltipTrigger>
          <TooltipContent>{blocked}</TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  )
}

const RISK: Record<Risk, { label: string; cls: string }> = {
  low: { label: '낮음', cls: 'text-muted' },
  medium: { label: '보통', cls: 'text-warning' },
  high: { label: '높음', cls: 'text-danger' },
}
export function RiskLabel({ risk }: { risk: Risk }) {
  const r = RISK[risk]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', r.cls)}>
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => <span key={i} className={cn('h-2.5 w-1 rounded-sm', i <= ['low', 'medium', 'high'].indexOf(risk) ? 'bg-current' : 'bg-line')} />)}
      </span>
      {r.label}
    </span>
  )
}

export const TYPE_LABEL: Record<ReleaseType, string> = { feature: '기능', hotfix: '핫픽스', maintenance: '유지보수' }
export function TypeBadge({ type }: { type: ReleaseType }) {
  return <Badge tone={type === 'hotfix' ? 'danger' : 'neutral'}>{TYPE_LABEL[type]}</Badge>
}

/** 승인자 아바타 묶음 — 결정 상태를 점으로 */
export function ApproverStack({ approvers }: { approvers: Approver[] }) {
  const done = approvers.filter((a) => a.decision === 'approved').length
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex -space-x-1.5">
        {approvers.map((a) => (
          <Tooltip key={a.name}>
            <TooltipTrigger asChild>
              <span className="relative rounded-full ring-2 ring-surface">
                <Avatar name={a.name} />
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-surface',
                    a.decision === 'approved' ? 'bg-success' : a.decision === 'rejected' ? 'bg-danger' : 'bg-line-strong',
                  )}
                  aria-hidden
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {a.name} · {a.decision === 'approved' ? '승인' : a.decision === 'rejected' ? '반려' : '대기'}
            </TooltipContent>
          </Tooltip>
        ))}
      </span>
      <span className={cn('text-xs tnum', done === approvers.length ? 'text-success' : 'text-muted')}>
        {done}/{approvers.length}
      </span>
    </span>
  )
}
