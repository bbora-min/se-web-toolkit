import { IdentitySheet, PageBody, StatusStrip } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import registry from '../../../../../identities/registry.json'

const parsed = parseIdentity(identity)

export function IdentityPage() {
  return (
    <PageBody>
      <IdentitySheet
        identity={parsed}
        siblings={registry.services}
        signaturePreview={
          <StatusStrip
            health="ok"
            headline="클러스터 정상"
            detail="노드 5/5 온라인 · 방금 갱신됨"
            stats={[
              { label: '실행 중', value: 7, delta: { value: -2, period: '어제 대비', upIsGood: null }, trend: [9, 8, 10, 7, 6, 8, 9, 7, 5, 6, 7, 7] },
              { label: '대기', value: 9, delta: { value: -3, period: '어제 대비', upIsGood: null }, trend: [4, 6, 5, 7, 9, 8, 10, 12, 9, 8, 9, 9] },
              { label: '24시간 실패', value: 6, tone: 'danger', delta: { value: 4, period: '어제 대비', upIsGood: false }, trend: [1, 0, 2, 1, 1, 3, 2, 4, 3, 5, 6, 6] },
              { label: '성공률', value: '83.3%', delta: { value: -10.8, period: '어제 대비', format: (v) => `${v.toFixed(1)}%p` }, trend: [96, 95, 97, 94, 93, 92, 90, 88, 87, 85, 84, 83.3], trendFormat: (v) => `${v}%` },
            ]}
          />
        }
      />
    </PageBody>
  )
}
