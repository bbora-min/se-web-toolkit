import * as React from 'react'
import { SearchHero, StageRail, StatusStrip } from '@se/ui'
import identity from '../../../se.identity.json'

/**
 * se.identity.json의 signature에 맞는 시그니처를 그린다. 실제 데이터로 바꾸는 건 /se:page 의 몫.
 * 목록 페이지이므로 StatusStrip은 compact. 구현된 시그니처 목록은 @se/tokens 의 IMPLEMENTED_SIGNATURES.
 */
export function Signature({ counts }: { counts?: Record<string, number> }) {
  const total = counts?.[''] ?? 0
  const errors = counts?.error ?? 0
  const [q, setQ] = React.useState('') // 훅은 분기 밖에서 — signature 가 바뀌어도 훅 순서가 같아야 한다
  switch (identity.signature) {
    case 'search-hero':
      return <SearchHero title="무엇을 찾고 계세요?" value={q} onChange={setQ} hint={`${total.toLocaleString()}개 항목`} />
    case 'stage-rail':
      return (
        <StageRail
          headline={`${total}건 진행 중`}
          stages={[
            { id: 'active', label: '활성', count: counts?.active ?? 0 },
            { id: 'paused', label: '일시중지', count: counts?.paused ?? 0, blocked: errors },
          ]}
        />
      )
    default:
      return (
        <StatusStrip
          variant="compact"
          health={errors > 0 ? 'degraded' : 'ok'}
          headline={errors > 0 ? `오류 ${errors}건` : '정상'}
          stats={[
            { label: '전체', value: total },
            { label: '활성', value: counts?.active ?? 0 },
            { label: '오류', value: errors, tone: errors > 0 ? 'danger' : 'default' },
          ]}
        />
      )
  }
}
