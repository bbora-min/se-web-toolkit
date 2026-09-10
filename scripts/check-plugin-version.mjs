// plugin.json 과 marketplace.json 의 version 이 같아야 한다 — 다르면 `claude plugin update` 가 새 스킬을 못 받는다
import { readFileSync } from 'node:fs'
const p = JSON.parse(readFileSync('plugin/.claude-plugin/plugin.json', 'utf8')).version
const m = JSON.parse(readFileSync('.claude-plugin/marketplace.json', 'utf8'))
const mv = m.plugins.find((x) => x.name === 'se')?.version
if (p !== mv || p !== m.metadata?.version) {
  console.error(`✗ 플러그인 버전 불일치: plugin.json ${p} · marketplace.json ${mv} · metadata ${m.metadata?.version}`)
  process.exit(1)
}
console.log(`✓ 플러그인 버전 ${p}`)
