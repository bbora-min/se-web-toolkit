// 아이덴티티 레지스트리 검사 — hue 거리·시그니처 중복·각 se.identity.json 유효성
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createTheme, hueDistance, MIN_HUE_DISTANCE } from '../packages/tokens/dist/index.js'

const root = resolve(import.meta.dirname, '..')
const registry = JSON.parse(readFileSync(resolve(root, 'identities/registry.json'), 'utf8'))
const services = registry.services
let failed = false
const fail = (m) => {
  failed = true
  console.error('✗', m)
}

for (const s of services) {
  const file = resolve(root, s.path, 'se.identity.json')
  try {
    const id = JSON.parse(readFileSync(file, 'utf8'))
    createTheme(id)
    if (id.id !== s.id) fail(`${s.id}: se.identity.json의 id(${id.id})가 레지스트리와 다름`)
    if (id.accent.hue !== s.hue) fail(`${s.id}: hue가 레지스트리(${s.hue})와 다름 (${id.accent.hue})`)
    if (id.signature !== s.signature) fail(`${s.id}: signature가 레지스트리와 다름`)
    console.log('✓', s.id, `hue ${s.hue}°`, s.signature)
  } catch (e) {
    fail(`${s.id}: ${e.message}`)
  }
}
for (let i = 0; i < services.length; i++) {
  for (let j = i + 1; j < services.length; j++) {
    const a = services[i], b = services[j]
    const d = hueDistance(a.hue, b.hue)
    if (d < MIN_HUE_DISTANCE) fail(`${a.id} ↔ ${b.id}: hue 거리 ${d}° < ${MIN_HUE_DISTANCE}° — 형제와 너무 닮음`)
    if (a.signature === b.signature) console.warn('!', `${a.id} ↔ ${b.id}: 같은 시그니처(${a.signature}) — 가능하면 다르게`)
  }
}
process.exit(failed ? 1 : 0)
