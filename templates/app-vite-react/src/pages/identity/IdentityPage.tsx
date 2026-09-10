import { IdentitySheet, PageBody } from '@se/ui'
import { parseIdentity } from '@se/tokens'
import identity from '../../../se.identity.json'
import { Signature } from '../items/Signature'

const parsed = parseIdentity(identity)

export function IdentityPage() {
  return (
    <PageBody>
      <IdentitySheet identity={parsed} signaturePreview={<Signature counts={{ '': 42, active: 30, paused: 9, error: 3 }} />} />
    </PageBody>
  )
}
