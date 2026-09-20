import { IdentitySheet, PageBody, TimelineRibbon } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import registry from '../../../../../identities/registry.json'

const parsed = parseIdentity(identity)
const NOW = new Date('2026-09-20T11:00:00+09:00')
const h = (n: number) => new Date(NOW.getTime() + n * 3_600_000).toISOString()

export function IdentityPage() {
  return (
    <PageBody>
      <IdentitySheet
        identity={parsed}
        siblings={registry.services}
        signaturePreview={
          <TimelineRibbon
            from={h(-24)}
            to={h(8)}
            now={NOW.toISOString()}
            headline="지난 24시간 · 배포 3 · 장애 1"
            detail="줄은 서비스. 배포는 초록, 장애는 빨강"
            lanes={['Job Monitor', 'Release Desk', 'Incident Desk']}
            events={[
              { id: '1', at: h(-21), label: 'v4.18.2 배포', lane: 'Job Monitor', tone: 'success' },
              { id: '2', at: h(-3), label: '실패 증가', lane: 'Job Monitor', tone: 'warning' },
              { id: '3', at: h(-5), label: 'v1.12.0 배포', lane: 'Release Desk', tone: 'success' },
              { id: '4', at: h(-2), until: h(7), label: '배포 창', lane: 'Release Desk', tone: 'neutral' },
              { id: '5', at: h(-1), label: 'INC-2041 · P1', lane: 'Incident Desk', tone: 'danger' },
            ]}
          />
        }
      />
    </PageBody>
  )
}
