#!/usr/bin/env node
// 사용: se-codemods <all|mui|antd|raw-controls|tailwind-palette> <경로…> [--dry]
//   경로는 파일·폴더·glob. .ts/.tsx/.js/.jsx 만. 바꾼 파일 수와 남긴 TODO 수를 보고한다.
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import fg from 'fast-glob'
import jscodeshift from 'jscodeshift'
import { TRANSFORMS, TODO_RE } from '../src/index.js'

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const [which, ...paths] = args.filter((a) => a !== '--dry')
if (!which || !paths.length || (which !== 'all' && !TRANSFORMS[which])) {
  console.error(`사용: se-codemods <all|${Object.keys(TRANSFORMS).join('|')}> <경로…> [--dry]\n`)
  for (const [k, v] of Object.entries(TRANSFORMS)) console.error(`  ${k.padEnd(18)} ${v.why}`)
  process.exit(1)
}
const names = which === 'all' ? Object.keys(TRANSFORMS) : [which]
const patterns = paths.map((p) => { try { return statSync(p).isDirectory() ? `${p.replace(/\/$/, '')}/**/*.{ts,tsx,js,jsx}` : p } catch { return p } })
const files = await fg(patterns, { ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/*.test.*', '**/*.spec.*'], absolute: true })
const j = jscodeshift.withParser('tsx')
const api = { jscodeshift: j, j, stats: () => {}, report: () => {} }
let changedFiles = 0, todos = 0
for (const f of files) {
  const before = readFileSync(f, 'utf8')
  let src = before
  for (const n of names) {
    try {
      const out = TRANSFORMS[n].run({ path: f, source: src }, api, {})
      if (typeof out === 'string' && out !== src) src = out
    } catch (e) {
      console.error(`  ! ${n} 실패: ${f.replace(process.cwd() + '/', '')} — ${e.message}`)
    }
  }
  if (src !== before) {
    changedFiles++
    const t = (src.match(TODO_RE) ?? []).length - (before.match(TODO_RE) ?? []).length
    todos += Math.max(0, t)
    console.log(`  ${dry ? '(dry) ' : ''}✎ ${f.replace(process.cwd() + '/', '')}${t > 0 ? ` · TODO ${t}` : ''}`)
    if (!dry) writeFileSync(f, src)
  }
}
console.log(`\n${changedFiles}/${files.length} 파일 변경${dry ? ' (dry — 쓰지 않음)' : ''} · 새 TODO(se-adopt) ${todos}개 → 남은 것은 se-migrator 에이전트로. 그다음 pnpm lint && pnpm typecheck`)
