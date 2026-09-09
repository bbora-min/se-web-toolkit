import { Badge } from '@se/ui'
import type { Freshness } from '../../api/types'

const F: Record<Freshness, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  fresh: { tone: 'success', label: '최신' },
  stale: { tone: 'warning', label: '지연' },
  broken: { tone: 'danger', label: '오류' },
}

export function FreshnessBadge({ value }: { value: Freshness }) {
  const f = F[value]
  return (
    <Badge tone={f.tone}>
      <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />
      {f.label}
    </Badge>
  )
}
