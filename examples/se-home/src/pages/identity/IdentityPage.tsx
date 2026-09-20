import { IdentitySheet, PageBody, Skeleton, TimelineRibbon } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import registry from '../../../../../identities/registry.json'
import { useHome } from '../../api/home'
import { toRibbon } from '../../lib/ribbon'

const parsed = parseIdentity(identity)

/** 시그니처 미리보기는 홈과 같은 데이터(MSW 목)로 — 손으로 베낀 이벤트 목록을 두지 않는다 */
export function IdentityPage() {
  const home = useHome()
  return (
    <PageBody>
      <IdentitySheet
        identity={parsed}
        siblings={registry.services}
        signaturePreview={home.data ? <TimelineRibbon {...toRibbon(home.data)} laneWidth={112} detail="줄은 서비스. 배포는 초록, 장애는 빨강" /> : <Skeleton className="h-40 rounded-lg" />}
      />
    </PageBody>
  )
}
