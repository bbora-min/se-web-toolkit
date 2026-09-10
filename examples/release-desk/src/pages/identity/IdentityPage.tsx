import * as React from 'react'
import { IdentitySheet, PageBody, StageRail } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import registry from '../../../../../identities/registry.json'

const parsed = parseIdentity(identity)

function RailPreview() {
  const [v, setV] = React.useState<string | null>('approval')
  return (
    <StageRail
      value={v}
      onChange={setV}
      headline="12건 진행 중"
      detail="막힘 3건 · 이번 주 배포 2건"
      stages={[
        { id: 'review', label: '코드 검토', count: 4 },
        { id: 'staging', label: '스테이징 검증', count: 3, blocked: 1 },
        { id: 'approval', label: '승인', count: 3, blocked: 2 },
        { id: 'deploy', label: '배포', count: 2 },
        { id: 'done', label: '완료', count: 9 },
      ]}
    />
  )
}

export function IdentityPage() {
  return (
    <PageBody>
      <IdentitySheet identity={parsed} siblings={registry.services} signaturePreview={<RailPreview />} />
    </PageBody>
  )
}
