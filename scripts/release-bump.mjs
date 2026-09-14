// 버전 한 번에 올리기: pnpm release:bump 0.6.0 → 루트·packages/*·plugin.json·marketplace.json + CHANGELOG 골격
import { readFileSync, writeFileSync } from 'node:fs'
import { VERSION_FILES } from './lib/packages.mjs'
const next = process.argv[2]
if (!/^\d+\.\d+\.\d+$/.test(next ?? '')) { console.error('사용: pnpm release:bump <x.y.z>'); process.exit(1) }
for (const f of VERSION_FILES) writeFileSync(f, readFileSync(f, 'utf8').replace(/"version": "\d+\.\d+\.\d+"/g, `"version": "${next}"`))
const cl = readFileSync('CHANGELOG.md', 'utf8')
if (!new RegExp(`^## ${next.replace(/\./g, '\\.')}( |$)`, 'm').test(cl)) {
  const today = new Date().toISOString().slice(0, 10)
  const entry = `## ${next} — ${today}\n\n**바뀐 것**\n- \n\n**화면 변화**\n- 없음\n\n**앱에서 할 일**\n- 없음 — \`/se:upgrade\` 만\n\n`
  const at = cl.search(/^## /m)
  if (at < 0) { console.error('CHANGELOG.md 에 "## " 항목이 하나도 없습니다 — 형식을 확인하십시오'); process.exit(1) }
  writeFileSync('CHANGELOG.md', cl.slice(0, at) + entry + cl.slice(at))
}
console.log(`✓ ${next} — ${VERSION_FILES.length}개 파일 + CHANGELOG 골격. 세 칸을 채우고 커밋하십시오`)
