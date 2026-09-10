import * as React from 'react'
import { IdentitySheet, PageBody, SearchHero } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import registry from '../../../../../identities/registry.json'

const parsed = parseIdentity(identity)

function HeroPreview() {
  const [q, setQ] = React.useState('')
  const [active, setActive] = React.useState('certified')
  return (
    <SearchHero
      title="무엇을 찾고 계세요?"
      placeholder="예: clicks, user_id, minseo, certified"
      value={q}
      onChange={setQ}
      hint="26개 데이터셋 · 4분 전 색인"
      quick={[
        { label: '내 데이터셋', count: 7, active: active === 'mine', onClick: () => setActive('mine') },
        { label: '인증됨', count: 8, active: active === 'certified', onClick: () => setActive('certified') },
        { label: '갱신 지연', count: 3, active: active === 'stale', onClick: () => setActive('stale') },
        { label: 'PII 포함', count: 12, active: active === 'pii', onClick: () => setActive('pii') },
      ]}
    />
  )
}

export function IdentityPage() {
  return (
    <PageBody>
      <IdentitySheet identity={parsed} siblings={registry.services} signaturePreview={<HeroPreview />} />
    </PageBody>
  )
}
