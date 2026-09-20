// 아이덴티티 레지스트리 검사 — hue 거리·시그니처 중복·각 se.identity.json 유효성
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createTheme, checkRegistry, parseIdentity, DEFAULT_SHELL } from '../packages/tokens/dist/index.js'

const root = resolve(import.meta.dirname, '..')
const registry = JSON.parse(readFileSync(resolve(root, 'identities/registry.json'), 'utf8'))
const services = registry.services
let failed = false
const fail = (m) => {
  failed = true
  console.error('✗', m)
}

for (const s of services) {
  if (!s.path) {
    // 툴킷 밖 서비스: 레지스트리 행으로 최소 아이덴티티를 만들어 같은 규칙(의미 색 18°·대비)을 돌린다
    try {
      createTheme({ id: s.id, name: s.name, mark: { type: 'monogram', text: 'SE' }, accent: { hue: s.hue }, signature: s.signature, shell: s.shell, neutralBias: s.neutralBias })
      console.log('·', s.id, `hue ${s.hue}°`, s.signature, '(툴킷 밖 — 레지스트리 행으로 검사)')
    } catch (e) {
      fail(`${s.id}: ${e.message}`)
    }
    continue
  }
  const file = resolve(root, s.path, 'se.identity.json')
  try {
    const id = parseIdentity(JSON.parse(readFileSync(file, 'utf8')))
    createTheme(id)
    if (id.id !== s.id) fail(`${s.id}: se.identity.json의 id(${id.id})가 레지스트리와 다름`)
    if (id.accent.hue !== s.hue) fail(`${s.id}: hue가 레지스트리(${s.hue})와 다름 (${id.accent.hue})`)
    if (id.signature !== s.signature) fail(`${s.id}: signature가 레지스트리와 다름`)
    if (id.mark.type === 'monogram' && s.monogram && id.mark.text !== s.monogram) fail(`${s.id}: monogram이 레지스트리(${s.monogram})와 다름 (${id.mark.text})`)
    if (id.shell !== (s.shell ?? DEFAULT_SHELL)) fail(`${s.id}: shell이 레지스트리(${s.shell ?? DEFAULT_SHELL})와 다름 (${id.shell})`)
    console.log('✓', s.id, `hue ${s.hue}°`, id.shell, s.signature)
  } catch (e) {
    fail(`${s.id}: ${e.message}`)
  }
}
for (const issue of checkRegistry(services)) {
  if (issue.level === 'error') fail(issue.message)
  else console.warn('!', issue.message)
}
process.exit(failed ? 1 : 0)
